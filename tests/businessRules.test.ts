import { describe, it, expect, beforeEach } from 'vitest';
import { hashPin, verifyPin, generateSalt } from '../src/utils/security';
import { StorageService } from '../src/services/storageService';
import { authService } from '../src/services/authService';
import { JourneyService } from '../src/services/journeyService';
import { GamesService } from '../src/services/gamesService';
import { EvolutionService } from '../src/services/evolutionService';
import { ChildProfile, DailyJourney } from '../src/types';
import { getTodayDateString, isCurrentTimeWithinAllowedRange } from '../src/utils/dateUtils';

// Mock localStorage for test environment
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value.toString();
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

global.localStorage = new LocalStorageMock() as unknown as Storage;

describe('Ajuda KIDS - Regras de Negócio e Segurança', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Segurança e Hash de PIN Parental', () => {
    it('deve gerar salt não-vazio e único', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).toBeTruthy();
      expect(salt2).toBeTruthy();
      expect(salt1).not.toBe(salt2);
    });

    it('não deve armazenar o PIN em texto puro e deve validar PIN correto', async () => {
      const pin = '4321';
      const salt = generateSalt();
      const hash = await hashPin(pin, salt);

      // Verify that hash does not equal the raw pin
      expect(hash).not.toBe(pin);
      expect(hash.length).toBeGreaterThan(10);

      // Verify valid PIN
      const isValid = await verifyPin('4321', salt, hash);
      expect(isValid).toBe(true);

      // Verify wrong PIN is rejected
      const isWrong = await verifyPin('9999', salt, hash);
      expect(isWrong).toBe(false);
    });
  });

  describe('2. Gestão de Perfis Infantis e Adaptação por Idade', () => {
    it('deve salvar e recuperar perfis infantis', async () => {
      const storage = new StorageService();
      const child: ChildProfile = {
        id: 'child_test_1',
        name: 'Mariana',
        nickname: 'Mari',
        age: 5,
        avatar: '🐰',
        ageGroup: '4-6',
        targetSkills: ['communication', 'emotional'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await storage.saveChild(child);
      const kids = await storage.getChildren();
      expect(kids.some(c => c.name === 'Mariana')).toBe(true);
      const mari = kids.find(c => c.name === 'Mariana');
      expect(mari?.ageGroup).toBe('4-6');
    });

    it('deve permitir múltiplos perfis infantis na mesma conta familiar', async () => {
      const storage = new StorageService();
      const child1: ChildProfile = {
        id: 'c1',
        name: 'Lucas',
        age: 6,
        avatar: '🦁',
        ageGroup: '4-6',
        targetSkills: ['reasoning'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const child2: ChildProfile = {
        id: 'c2',
        name: 'Beatriz',
        age: 11,
        avatar: '🦊',
        ageGroup: '10-12',
        targetSkills: ['attention', 'motor'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await storage.saveChild(child1);
      await storage.saveChild(child2);

      const all = await storage.getChildren();
      expect(all.some(c => c.id === 'c1')).toBe(true);
      expect(all.some(c => c.id === 'c2')).toBe(true);
      expect(all.find(c => c.id === 'c1')?.ageGroup).toBe('4-6');
      expect(all.find(c => c.id === 'c2')?.ageGroup).toBe('10-12');
    });
  });

  describe('3. Minha Jornada Diária (20-30 min) e Progressão', () => {
    it('deve criar uma jornada diária estruturada com atividades adequadas à idade', async () => {
      const journeySvc = new JourneyService();
      const child: ChildProfile = {
        id: 'c_test',
        name: 'Enzo',
        age: 8,
        avatar: '🐼',
        ageGroup: '7-9',
        targetSkills: ['communication', 'reasoning'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const journey = await journeySvc.getOrCreateTodayJourney(child);
      expect(journey).toBeTruthy();
      expect(journey.steps.length).toBeGreaterThanOrEqual(4);
      expect(journey.isCompleted).toBe(false);

      // Verify steps have real instructions and activities
      journey.steps.forEach(step => {
        expect(step.activity.title).toBeTruthy();
        expect(step.activity.instructions).toBeTruthy();
        expect(step.activity.durationMinutes).toBeGreaterThan(0);
      });
    });

    it('deve atualizar o progresso dos passos e marcar jornada como concluída somente quando todos os passos forem feitos', async () => {
      const journeySvc = new JourneyService();
      const child: ChildProfile = {
        id: 'c_test_prog',
        name: 'Sofia',
        age: 5,
        avatar: '🐱',
        ageGroup: '4-6',
        targetSkills: ['attention'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let journey = await journeySvc.getOrCreateTodayJourney(child);
      expect(journey.isCompleted).toBe(false);

      // Complete step 0
      journey = await journeySvc.updateStepProgress(journey, 0, 'completed', 100);
      expect(journey.steps[0].status).toBe('completed');
      expect(journey.isCompleted).toBe(false);

      // Complete all remaining steps
      for (let i = 1; i < journey.steps.length; i++) {
        journey = await journeySvc.updateStepProgress(journey, i, 'completed', 100);
      }

      expect(journey.isCompleted).toBe(true);
      expect(journey.totalMinutesSpent).toBeGreaterThan(10);
    });
  });

  describe('4. Regras da Hora de Brincar e Sistema de Recompensas', () => {
    it('deve BLOQUEAR os jogos se a jornada diária não foi concluída (regra padrão)', async () => {
      const gamesSvc = new GamesService();
      const status = await gamesSvc.getDailyRewardStatus('child_incomplete');

      expect(status.journeyCompletedToday).toBe(false);
      expect(status.canPlay).toBe(false);
      expect(status.reason).toContain('Conclua a sua jornada diária');
    });

    it('deve LIBERAR 3 jogadas diárias após a jornada ser concluída', async () => {
      const storage = new StorageService();
      const journeySvc = new JourneyService();
      const gamesSvc = new GamesService();

      const child: ChildProfile = {
        id: 'child_winner',
        name: 'Theo',
        age: 6,
        avatar: '🦁',
        ageGroup: '4-6',
        targetSkills: ['communication'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let journey = await journeySvc.getOrCreateTodayJourney(child);
      for (let i = 0; i < journey.steps.length; i++) {
        journey = await journeySvc.updateStepProgress(journey, i, 'completed', 100);
      }

      // Check reward status
      const status = await gamesSvc.getDailyRewardStatus(child.id);
      expect(status.journeyCompletedToday).toBe(true);
      expect(status.canPlay).toBe(true);
      expect(status.playsUsedToday).toBe(0);
      expect(status.maxPlaysPerDay).toBe(3);
    });

    it('deve debitar cada partida e bloquear ao atingir 3 jogadas', async () => {
      const journeySvc = new JourneyService();
      const gamesSvc = new GamesService();

      const child: ChildProfile = {
        id: 'child_play_limit',
        name: 'Clara',
        age: 7,
        avatar: '🌸',
        ageGroup: '7-9',
        targetSkills: ['motor'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let journey = await journeySvc.getOrCreateTodayJourney(child);
      for (let i = 0; i < journey.steps.length; i++) {
        journey = await journeySvc.updateStepProgress(journey, i, 'completed', 100);
      }

      // Play 1
      const p1 = await gamesSvc.recordAndConsumePlay(child.id, 'batata-quente', 60, 100);
      expect(p1.success).toBe(true);
      expect(p1.playsRemaining).toBe(2);

      // Play 2
      const p2 = await gamesSvc.recordAndConsumePlay(child.id, 'jogo-memoria', 120, 200);
      expect(p2.success).toBe(true);
      expect(p2.playsRemaining).toBe(1);

      // Play 3
      const p3 = await gamesSvc.recordAndConsumePlay(child.id, 'morto-vivo', 80, 150);
      expect(p3.success).toBe(true);
      expect(p3.playsRemaining).toBe(0);

      // Play 4 should fail due to limit
      const statusAfter3 = await gamesSvc.getDailyRewardStatus(child.id);
      expect(statusAfter3.canPlay).toBe(false);
      expect(statusAfter3.playsUsedToday).toBe(3);
      expect(statusAfter3.reason).toContain('Você já usou suas 3 jogadas de hoje');
    });

    it('REGRA ESPECIAL: deve permitir jogos ilimitados quando habilitado pelo responsável', async () => {
      const storage = new StorageService();
      const gamesSvc = new GamesService();

      // Enable unlimited games in parent settings
      await storage.saveParentSettings({ unlimitedGames: true });

      const status = await gamesSvc.getDailyRewardStatus('child_unlimited_test');
      expect(status.isUnlimited).toBe(true);
      expect(status.canPlay).toBe(true);
      expect(status.reason).toContain('Jogos ilimitados liberados');
    });
  });

  describe('5. Controle de Horários e Duração', () => {
    it('deve validar se o horário atual está dentro da faixa permitida', () => {
      // Testing within bounds
      expect(isCurrentTimeWithinAllowedRange('00:00', '23:59')).toBe(true);
    });
  });

  describe('6. Relatórios e Sugestões Educativas Fora da Tela', () => {
    it('deve gerar relatório com as 5 áreas de habilidades e sugestões práticas fora da tela', async () => {
      const evolution = new EvolutionService();
      const child: ChildProfile = {
        id: 'child_report_test',
        name: 'Gael',
        age: 5,
        avatar: '⭐',
        ageGroup: '4-6',
        targetSkills: ['communication', 'reasoning'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const report = await evolution.generateReport(child, 'week');
      expect(report).toBeTruthy();
      expect(report.skills.communication).toBeDefined();
      expect(report.skills.reasoning).toBeDefined();
      expect(report.skills.attention).toBeDefined();
      expect(report.skills.emotional).toBeDefined();
      expect(report.skills.motor).toBeDefined();

      // Verify offline activities recommendations are provided
      expect(report.offlineActivitiesSuggested.length).toBeGreaterThan(0);
      expect(report.dailyTrend.length).toBe(7);
    });
  });

  describe('7. Inicialização Limpa (Sem Criança Pré-Cadastrada) e Pareamento Familiar', () => {
    it('NÃO deve criar nenhuma criança pré-cadastrada ou fictícia ao iniciar com armazenamento limpo', async () => {
      const storage = new StorageService();
      const children = await storage.getChildren();
      expect(children).toHaveLength(0);
    });

    it('deve remover perfis demonstrativos antigos (child_starter_1) preservando perfis reais', async () => {
      localStorage.setItem(
        'ajuda_kids_children_v1',
        JSON.stringify([
          {
            id: 'child_starter_1',
            name: 'Lucas Demo',
            age: 6,
            avatar: 'Bia',
            ageGroup: '4-6',
            targetSkills: ['communication'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'child_real_99',
            name: 'Helena Real',
            age: 7,
            avatar: 'Nina',
            ageGroup: '7-9',
            targetSkills: ['reasoning'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
      );

      const storage = new StorageService();
      const children = await storage.getChildren();
      expect(children).toHaveLength(1);
      expect(children[0].id).toBe('child_real_99');
      expect(children[0].name).toBe('Helena Real');
    });

    it('deve realizar o fluxo completo de pareamento de dispositivo infantil (QR/Código -> Claim -> Confirmação -> Revogação)', async () => {
      const storage = new StorageService();
      const child: ChildProfile = {
        id: 'child_pair_test',
        familyId: 'fam_test_1',
        name: 'Arthur',
        age: 8,
        avatar: 'Leo',
        ageGroup: '7-9',
        targetSkills: ['attention'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const session = await storage.createPairingSession(child);
      expect(session.code).toHaveLength(6);
      expect(session.status).toBe('waiting');

      const claimRes = await storage.claimPairingCode(session.code, 'iPhone do Arthur');
      expect(claimRes.ok).toBe(true);
      expect(claimRes.session?.status).toBe('claimed_pending_confirm');

      const confirmedDevice = await storage.confirmPairingSession(session.code);
      expect(confirmedDevice).toBeTruthy();
      expect(confirmedDevice?.deviceName).toBe('iPhone do Arthur');
      expect(confirmedDevice?.status).toBe('active');

      // Revoke device
      if (confirmedDevice) {
        await storage.revokeDevice(confirmedDevice.id);
        const allDevs = storage.getDevices();
        const revoked = allDevs.find(d => d.id === confirmedDevice.id);
        expect(revoked?.status).toBe('revoked');
      }
    });
  });

  describe('8. Autenticação Real do Responsável, Sessão e Recuperação de Senha', () => {
    it('deve cadastrar responsável com senha criptografada (nunca em texto puro) e persistir sessão', async () => {
      const reg = await authService.registerParent({
        parentName: 'Maria Clara',
        username: 'maria.clara',
        email: 'maria@familia.com',
        password: 'MinhaSenhaForte@123',
        pin: '4567'
      });

      expect(reg.success).toBe(true);
      expect(reg.session).toBeTruthy();
      expect(reg.session?.parentName).toBe('Maria Clara');
      expect(reg.session?.username).toBe('maria.clara');

      // Confirm plaintext password is never persisted in vault or session storage
      const vaultRaw = localStorage.getItem('ajuda_kids_auth_local_vault_v3') || '';
      const sessionRaw = localStorage.getItem('ajuda_kids_auth_session_v3') || '';
      expect(vaultRaw).not.toContain('MinhaSenhaForte@123');
      expect(sessionRaw).not.toContain('MinhaSenhaForte@123');

      const restored = await authService.restoreSession();
      expect(restored?.familyId).toBe(reg.session?.familyId);
    });

    it('deve realizar logout limpo e permitir login tanto por e-mail quanto por nome de usuário', async () => {
      await authService.registerParent({
        parentName: 'Carlos Eduardo',
        username: 'carlosedu',
        email: 'carlos@familia.com',
        password: 'Segredo@2026'
      });

      await authService.logoutParent();
      expect(authService.getStoredSession()).toBeNull();

      // Wrong password rejected
      const badLogin = await authService.loginParent({
        identifier: 'carlos@familia.com',
        password: 'SenhaErrada'
      });
      expect(badLogin.success).toBe(false);

      // Login by username
      const userLogin = await authService.loginParent({
        identifier: 'carlosedu',
        password: 'Segredo@2026'
      });
      expect(userLogin.success).toBe(true);
      expect(userLogin.session?.parentEmail).toBe('carlos@familia.com');
    });

    it('deve recuperar e redefinir senha com segurança', async () => {
      await authService.registerParent({
        parentName: 'Ana Beatriz',
        username: 'anabea',
        email: 'ana@familia.com',
        password: 'SenhaAntiga@1'
      });

      await authService.logoutParent();

      const rec = await authService.recoverPassword({
        identifier: 'ana@familia.com',
        newPassword: 'NovaSenha@2026'
      });
      expect(rec.success).toBe(true);

      // Old password must fail
      const oldAttempt = await authService.loginParent({
        identifier: 'anabea',
        password: 'SenhaAntiga@1'
      });
      expect(oldAttempt.success).toBe(false);

      // New password succeeds
      const newAttempt = await authService.loginParent({
        identifier: 'ana@familia.com',
        password: 'NovaSenha@2026'
      });
      expect(newAttempt.success).toBe(true);
    });
  });

  describe('9. Segurança Anti-Força Bruta do PIN e Recuperação Autenticada', () => {
    it('deve bloquear progressivamente após 3 tentativas incorretas de PIN e registrar auditoria', async () => {
      const storage = new StorageService();
      await storage.updatePin('5678');

      // 1ª e 2ª tentativas incorretas ainda não bloqueiam
      const attempt1 = await storage.verifyParentPinWithRateLimit('0000');
      expect(attempt1.valid).toBe(false);
      expect(attempt1.locked).toBe(false);
      expect(attempt1.failedAttempts).toBe(1);

      const attempt2 = await storage.verifyParentPinWithRateLimit('1111');
      expect(attempt2.valid).toBe(false);
      expect(attempt2.locked).toBe(false);
      expect(attempt2.failedAttempts).toBe(2);

      // 3ª tentativa incorreta aciona bloqueio progressivo (15s)
      const attempt3 = await storage.verifyParentPinWithRateLimit('2222');
      expect(attempt3.valid).toBe(false);
      expect(attempt3.locked).toBe(true);
      expect(attempt3.remainingSeconds).toBeGreaterThan(0);

      // Mesmo o PIN correto é bloqueado durante o bloqueio ativo
      const blockedCorrect = await storage.verifyParentPinWithRateLimit('5678');
      expect(blockedCorrect.valid).toBe(false);
      expect(blockedCorrect.locked).toBe(true);

      const logs = storage.getSecurityAuditLog();
      expect(logs.some(entry => entry.eventType === 'PIN_FAILED')).toBe(true);
      expect(logs.some(entry => entry.eventType === 'PIN_LOCKOUT')).toBe(true);
    });

    it('deve exigir senha parental válida para redefinir o PIN e limpar bloqueio via recuperação segura', async () => {
      await authService.registerParent({
        parentName: 'Juliana M.',
        username: 'julianam',
        email: 'juliana@familia.com',
        password: 'SenhaParentalStrong!9',
        pin: '2468'
      });

      const storage = new StorageService();
      await storage.updatePin('2468');
      // Forçar estado de bloqueio prévio com 3 tentativas falhas
      await storage.verifyParentPinWithRateLimit('0000');
      await storage.verifyParentPinWithRateLimit('0001');
      const lockedState = await storage.verifyParentPinWithRateLimit('0002');
      expect(lockedState.locked).toBe(true);

      // Senha incorreta deve falhar na recuperação
      const wrongRecover = await authService.recoverPinWithParentPassword(
        'SenhaErrada123',
        '7890',
        'juliana@familia.com'
      );
      expect(wrongRecover.ok).toBe(false);

      // Senha correta redefine o PIN, limpa lockout e registra PIN_RECOVERED
      const validRecover = await authService.recoverPinWithParentPassword(
        'SenhaParentalStrong!9',
        '7890',
        'juliana@familia.com'
      );
      expect(validRecover.ok).toBe(true);

      const postRecoverState = storage.getPinSecurityState();
      expect(postRecoverState.failedAttempts).toBe(0);
      expect(postRecoverState.remainingSeconds).toBe(0);

      const verifyNewPin = await storage.verifyParentPinWithRateLimit('7890');
      expect(verifyNewPin.valid).toBe(true);

      const auditEvents = storage.getSecurityAuditLog().map(e => e.eventType);
      expect(auditEvents).toContain('PIN_RECOVERY_FAILED');
      expect(auditEvents).toContain('PIN_RECOVERED');
      expect(auditEvents).toContain('PIN_SUCCESS');
    });
  });
});
