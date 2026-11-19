import { describe, it, expect, beforeEach } from 'vitest';
import {
  authService,
  evaluatePasswordRequirements,
  getPasswordRequirementErrorMessage
} from '@/services/authService';
import { storageService } from '@/services/storageService';
import {
  createKidCharacter3D,
  setCharacterPosture,
  updateCharacterSitAndRun
} from '@/modules/games3d/modelFactory';
import {
  THEME_TOKENS_9_1,
  FORM_STATE_TOKENS_DARK,
  SURFACE_ELEVATION_8
} from '@/design-system/tokens';

function installMemoryLocalStorage() {
  const store = new Map<string, string>();
  const mockStorage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    }
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true
  });
  return store;
}

describe('Ajuda KIDS 9.1 — Confirmação de E-mail no Cadastro & Temas Claro/Escuro', () => {
  let memStore: Map<string, string>;

  beforeEach(() => {
    memStore = installMemoryLocalStorage();
    authService.clearPendingVerificationsForTest();
  });

  it('rejects invalid email or short password before requesting OTP', async () => {
    const badEmail = await authService.requestRegistrationVerification({
      parentName: 'Ana Responsável',
      username: 'anafamilia',
      email: 'email-invalido',
      password: 'Password@123',
      pin: '1234'
    });
    expect(badEmail.success).toBe(false);
    expect(badEmail.code).toBe('VALIDATION_ERROR');

    const shortPwd = await authService.requestRegistrationVerification({
      parentName: 'Ana Responsável',
      username: 'anafamilia',
      email: 'ana@exemplo.com',
      password: '123',
      pin: '1234'
    });
    expect(shortPwd.success).toBe(false);
    expect(shortPwd.code).toBe('VALIDATION_ERROR');
  });

  it('generates 6-digit OTP without persisting OTP code into localStorage and confirms registration', async () => {
    const req = await authService.requestRegistrationVerification({
      parentName: 'Lucas Pai',
      username: 'lucaspai91',
      email: 'lucas.teste91@outlook.com',
      password: 'Segura@2026',
      pin: '4321'
    });

    expect(req.success).toBe(true);
    expect(req.localVerificationCode).toMatch(/^\d{6}$/);
    expect(req.expiresInMinutes).toBe(10);

    // Garantia de segurança: código OTP nunca é gravado em localStorage
    const serializedStorage = Array.from(memStore.values()).join(' ');
    expect(serializedStorage).not.toContain(req.localVerificationCode!);

    const confirmed = await authService.confirmRegistrationVerification(
      'lucas.teste91@outlook.com',
      req.localVerificationCode!
    );
    expect(confirmed.success).toBe(true);
    expect(confirmed.session?.username).toBe('lucaspai91');
    expect(confirmed.family?.parentEmail).toBe('lucas.teste91@outlook.com');

    // Reutilização do mesmo código (single-use) deve falhar
    const replay = await authService.confirmRegistrationVerification(
      'lucas.teste91@outlook.com',
      req.localVerificationCode!
    );
    expect(replay.success).toBe(false);
  });

  it('blocks duplicate email before issuing OTP', async () => {
    const firstReq = await authService.requestRegistrationVerification({
      parentName: 'Marina Mãe',
      username: 'marina91',
      email: 'marina@dominio.org',
      password: 'SenhaForte@91',
      pin: '2222'
    });
    expect(firstReq.success).toBe(true);

    const firstConf = await authService.confirmRegistrationVerification(
      'marina@dominio.org',
      firstReq.localVerificationCode!
    );
    expect(firstConf.success).toBe(true);

    const duplicateReq = await authService.requestRegistrationVerification({
      parentName: 'Outra Pessoa',
      username: 'outrausuario91',
      email: 'marina@dominio.org',
      password: 'OutraSenha@91',
      pin: '3333'
    });
    expect(duplicateReq.success).toBe(false);
    expect(duplicateReq.code).toBe('DUPLICATE_EMAIL');
  });

  it('rejects wrong codes and locks verification after 5 failed attempts', async () => {
    const req = await authService.requestRegistrationVerification({
      parentName: 'Carla Silva',
      username: 'carla91',
      email: 'carla91@yahoo.com',
      password: 'SenhaForte@91',
      pin: '1111'
    });
    expect(req.success).toBe(true);

    const wrongCode = req.localVerificationCode === '000000' ? '999999' : '000000';

    for (let attempt = 1; attempt <= 4; attempt++) {
      const res = await authService.confirmRegistrationVerification('carla91@yahoo.com', wrongCode);
      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_CODE');
      expect(res.remainingAttempts).toBe(5 - attempt);
    }

    const fifth = await authService.confirmRegistrationVerification('carla91@yahoo.com', wrongCode);
    expect(fifth.success).toBe(false);
    expect(fifth.code).toBe('TOO_MANY_ATTEMPTS');

    // Mesmo o código correto após o bloqueio deve ser recusado até novo reenvio
    const afterLock = await authService.confirmRegistrationVerification(
      'carla91@yahoo.com',
      req.localVerificationCode!
    );
    expect(afterLock.success).toBe(false);
  });

  it('rejects expired OTP codes and enforces resend cooldown unless bypassed for tests', async () => {
    const req = await authService.requestRegistrationVerification({
      parentName: 'Pedro Souza',
      username: 'pedrosouza91',
      email: 'pedro91@empresa.com.br',
      password: 'SenhaForte@91',
      pin: '5555'
    });
    expect(req.success).toBe(true);

    // Cooldown de 30s ativo logo após o primeiro envio
    const tooFastResend = await authService.requestRegistrationVerification({
      parentName: 'Pedro Souza',
      username: 'pedrosouza91',
      email: 'pedro91@empresa.com.br',
      password: 'SenhaForte@91',
      pin: '5555'
    });
    expect(tooFastResend.success).toBe(false);
    expect(tooFastResend.code).toBe('RESEND_COOLDOWN');
    expect((tooFastResend.retryAfterSeconds ?? 0)).toBeGreaterThan(0);

    // Expiração simulada invalida o código anterior
    authService.expireRegistrationVerificationForTest('pedro91@empresa.com.br');
    const expiredConfirm = await authService.confirmRegistrationVerification(
      'pedro91@empresa.com.br',
      req.localVerificationCode!
    );
    expect(expiredConfirm.success).toBe(false);
    expect(expiredConfirm.code).toBe('EXPIRED_CODE');

    // Novo código gerado após bypassCooldownForTest volta a funcionar
    const resent = await authService.requestRegistrationVerification(
      {
        parentName: 'Pedro Souza',
        username: 'pedrosouza91',
        email: 'pedro91@empresa.com.br',
        password: 'SenhaForte@91',
        pin: '5555'
      },
      { bypassCooldownForTest: true }
    );
    expect(resent.success).toBe(true);
    expect(resent.localVerificationCode).toMatch(/^\d{6}$/);

    const finalOk = await authService.confirmRegistrationVerification(
      'pedro91@empresa.com.br',
      resent.localVerificationCode!
    );
    expect(finalOk.success).toBe(true);
  });

  it('exposes Light & Dark theme tokens inspired by Khan Academy Kids & Lingokids and persists themePreference', async () => {
    expect(THEME_TOKENS_9_1.light.creamSurface).toBe('#FAF7F2');
    expect(THEME_TOKENS_9_1.light.primaryAction).toBe('#5843F4');
    expect(THEME_TOKENS_9_1.dark.canvas).toBe('#0E1324');
    expect(THEME_TOKENS_9_1.dark.heroIndigo).toBe('#141B35');
    expect(THEME_TOKENS_9_1.dark.primaryAction).toBe('#FF9900');

    expect(FORM_STATE_TOKENS_DARK.normal.backgroundColor).toBe('#11182D');
    expect(FORM_STATE_TOKENS_DARK.focus.borderColor).toBe('#FF9900');
    expect(SURFACE_ELEVATION_8.adultShell).toContain('dark:bg-[#1A223D]/95');

    const saved = await storageService.saveParentSettings({ themePreference: 'dark' });
    expect(saved.themePreference).toBe('dark');
    expect((await storageService.getParentSettings()).themePreference).toBe('dark');

    const backToLight = await storageService.saveParentSettings({ themePreference: 'light' });
    expect(backToLight.themePreference).toBe('light');
  });

  it('enforces strong password rules (8+ chars, uppercase, number, special char)', async () => {
    expect(getPasswordRequirementErrorMessage('abc@12')).toBeTruthy();
    expect(getPasswordRequirementErrorMessage('lowercase@123')).toBeTruthy();
    expect(getPasswordRequirementErrorMessage('NoNumber@Abc')).toBeTruthy();
    expect(getPasswordRequirementErrorMessage('NoSpecial123')).toBeTruthy();
    expect(getPasswordRequirementErrorMessage('Segura@2026')).toBeNull();

    const evalWeak = evaluatePasswordRequirements('ab1');
    expect(evalWeak.minLength).toBe(false);
    expect(evalWeak.hasUppercase).toBe(false);
    expect(evalWeak.hasNumber).toBe(true);
    expect(evalWeak.hasSpecial).toBe(false);
    expect(evalWeak.isValid).toBe(false);

    const evalStrong = evaluatePasswordRequirements('AjudaKids#2026');
    expect(evalStrong.isValid).toBe(true);

    const rejected = await authService.requestRegistrationVerification({
      parentName: 'Teste Senha',
      username: 'testesenha1',
      email: 'teste.senha@exemplo.com',
      password: 'WeakPassword1',
      pin: '1234'
    });
    expect(rejected.success).toBe(false);
    expect(rejected.error).toBeTruthy();
  });

  it('animates 3D kid rig with ankle pivots, contactShadow, grounded morto_crouch and 2-stage sit transition', () => {
    const kid = createKidCharacter3D('Bia', 0xF43F5E, 0x303D63);
    const ankleL = kid.getObjectByName('ankleL');
    const ankleR = kid.getObjectByName('ankleR');
    const contactShadow = kid.getObjectByName('contactShadow');
    const upperBody = kid.getObjectByName('upperBody');
    const kneeL = kid.getObjectByName('kneeL');

    expect(ankleL).toBeDefined();
    expect(ankleR).toBeDefined();
    expect(contactShadow).toBeDefined();
    expect(upperBody).toBeDefined();
    expect(kneeL).toBeDefined();

    for (let f = 0; f < 30; f++) {
      setCharacterPosture(kid, 'morto_crouch', f * 0.016);
    }
    expect(kid.position.y).toBe(0);
    expect(upperBody!.position.y).toBeLessThan(0);
    expect(kneeL!.rotation.x).toBeGreaterThan(1.5);
    expect(ankleL!.rotation.x).toBeLessThan(-0.5);

    updateCharacterSitAndRun(kid, 0, 0, false, 0);
    const standingShadowX = contactShadow!.scale.x;

    updateCharacterSitAndRun(kid, 0.5, 0, false, 0);
    expect(kneeL!.rotation.x).toBeGreaterThan(0.6);

    updateCharacterSitAndRun(kid, 1, 0, false, 0);
    expect(contactShadow!.scale.x).toBeGreaterThan(standingShadowX);
    expect(upperBody!.position.y).toBeLessThan(-0.3);
  });
});
