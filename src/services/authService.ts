import { AuthSession, FamilyAccount, ParentSettings } from '@/types';
import { computeLegacyBitwiseHash, generateSalt, hashPin, verifyPin } from '@/utils/security';
import { storageService } from './storageService';

const AUTH_SESSION_KEY = 'ajuda_kids_auth_session_v3';
const AUTH_LOCAL_VAULT_KEY = 'ajuda_kids_auth_local_vault_v3';
const LOCAL_RESET_KEY = 'ajuda_kids_local_password_resets_v1';

interface LocalUserRecord {
  id: string;
  familyId: string;
  parentName: string;
  username: string;
  usernameLower: string;
  email: string;
  emailLower: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

export interface RegisterParentInput {
  parentName: string;
  username: string;
  email: string;
  password: string;
  pin?: string;
  verificationCode?: string;
}

export interface RequestRegistrationVerificationResult {
  success: boolean;
  error?: string;
  code?:
    | 'VALIDATION_ERROR'
    | 'DUPLICATE_EMAIL'
    | 'DUPLICATE_USERNAME'
    | 'RESEND_COOLDOWN'
    | 'RATE_LIMITED'
    | 'EMAIL_SEND_FAILED'
    | 'CONNECTION_ERROR';
  emailId?: string;
  message?: string;
  deliveryMode?: 'email_provider' | 'local_sandbox_inbox';
  smtpConfigured?: boolean;
  localVerificationCode?: string;
  expiresInMinutes?: number;
  expiresAt?: number;
  cooldownSeconds?: number;
  retryAfterSeconds?: number;
}

export interface ConfirmRegistrationVerificationResult {
  success: boolean;
  error?: string;
  code?: 'INVALID_CODE' | 'EXPIRED_CODE' | 'TOO_MANY_ATTEMPTS' | 'DUPLICATE_EMAIL' | 'DUPLICATE_USERNAME' | 'CONNECTION_ERROR';
  remainingAttempts?: number;
  session?: AuthSession;
  family?: FamilyAccount;
}

export interface LoginParentInput {
  identifier: string; // e-mail ou nome de usuário
  password: string;
}

export interface RecoverPasswordInput {
  identifier: string;
  newPassword: string;
}

export interface RequestPasswordResetResult {
  success: boolean;
  error?: string;
  message?: string;
  deliveryMode?: string;
  smtpConfigured?: boolean;
  localVerificationCode?: string;
  expiresInMinutes?: number;
}

export interface ConfirmPasswordResetInput {
  identifier: string;
  code: string;
  newPassword: string;
}

export interface ConfirmPasswordResetResult {
  success: boolean;
  code?: 'INVALID_LINK_OR_CODE' | 'EXPIRED_CODE' | 'PASSWORD_CHANGED' | 'CONNECTION_ERROR' | 'INVALID_PASSWORD';
  error?: string;
  message?: string;
}

export interface AuthResult {
  success: boolean;
  code?: string;
  email?: string;
  error?: string;
  session?: AuthSession;
  family?: FamilyAccount;
}

export interface PasswordRequirementsStatus {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

export function evaluatePasswordRequirements(password: string): PasswordRequirementsStatus {
  const pwd = typeof password === 'string' ? password : '';
  const minLength = pwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9\s]/.test(pwd);
  return {
    minLength,
    hasUppercase,
    hasNumber,
    hasSpecial,
    isValid: minLength && hasUppercase && hasNumber && hasSpecial
  };
}

export function getPasswordRequirementErrorMessage(password: string): string | null {
  const status = evaluatePasswordRequirements(password);
  if (status.isValid) return null;
  const missing: string[] = [];
  if (!status.minLength) missing.push('mínimo de 8 caracteres');
  if (!status.hasUppercase) missing.push('pelo menos 1 letra maiúscula (A–Z)');
  if (!status.hasNumber) missing.push('pelo menos 1 número (0–9)');
  if (!status.hasSpecial) missing.push('pelo menos 1 caractere especial (ex.: !@#$%&*)');
  return `A senha deve conter: ${missing.join(', ')}.`;
}

export function validateParentRegistrationInput(input: RegisterParentInput): string | null {
  if (!input.parentName || input.parentName.trim().length < 2) {
    return 'Informe o nome completo do responsável.';
  }
  const cleanUser = (input.username || '').trim();
  if (cleanUser.length < 3 || !/^[a-zA-Z0-9._-]+$/.test(cleanUser)) {
    return 'O nome de usuário deve ter pelo menos 3 caracteres (letras, números, ponto ou underline).';
  }
  const cleanEmail = (input.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return 'Informe um endereço de e-mail válido.';
  }
  const pwdErr = getPasswordRequirementErrorMessage(input.password);
  if (pwdErr) {
    return pwdErr;
  }
  return null;
}

function getLocalVault(): Record<string, LocalUserRecord> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(AUTH_LOCAL_VAULT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalVault(vault: Record<string, LocalUserRecord>): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(AUTH_LOCAL_VAULT_KEY, JSON.stringify(vault));
}

function buildDefaultSettings(pinHash: string, pinSalt: string): ParentSettings {
  const storedTheme =
    typeof localStorage !== 'undefined' && localStorage.getItem('ajuda_kids_theme_v7') === 'dark'
      ? 'dark'
      : 'light';
  return {
    pinHash,
    pinSalt,
    isPinSet: true,
    maxDailyMinutes: 30,
    allowedTimeRange: { start: '08:00', end: '20:30' },
    unlimitedGames: false,
    soundEffectsEnabled: true,
    voiceNarrationEnabled: true,
    notificationsEnabled: true,
    notificationTimes: ['09:00', '16:00'],
    reminderFrequency: 'daily',
    themePreference: storedTheme,
  };
}

interface InMemoryVerificationRecord {
  email: string;
  emailLower: string;
  code: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  used: boolean;
  lastSentAt: number;
  sendHistory: number[];
  pendingInput: RegisterParentInput;
}

class AuthService {
  private pendingEmailVerifications = new Map<string, InMemoryVerificationRecord>();

  public clearPendingVerificationsForTest(): void {
    this.pendingEmailVerifications.clear();
  }

  public expireRegistrationVerificationForTest(email: string): void {
    const key = (email || '').trim().toLowerCase();
    const record = this.pendingEmailVerifications.get(key);
    if (record) {
      record.expiresAt = Date.now() - 1000;
      this.pendingEmailVerifications.set(key, record);
    }
  }

  public getStoredSession(): AuthSession | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);
      if (!session?.token || Date.now() > session.expiresAt) {
        localStorage.removeItem(AUTH_SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  private saveStoredSession(session: AuthSession): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }

  public clearStoredSession(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(AUTH_SESSION_KEY);
  }

  public async requestRegistrationVerification(
    input: RegisterParentInput,
    options?: { bypassCooldownForTest?: boolean }
  ): Promise<RequestRegistrationVerificationResult> {
    const validationErr = validateParentRegistrationInput(input);
    if (validationErr) {
      return { success: false, code: 'VALIDATION_ERROR', error: validationErr };
    }

    const cleanName = input.parentName.trim();
    const cleanUsername = input.username.trim();
    const cleanEmail = input.email.trim();
    const emailLower = cleanEmail.toLowerCase();
    const pinCode = input.pin && /^\d{4}$/.test(input.pin) ? input.pin : '1234';

    const passwordSalt = generateSalt();
    const passwordHash = await hashPin(input.password, passwordSalt);
    const pinSalt = generateSalt();
    const pinHash = await hashPin(pinCode, pinSalt);
    const settings = buildDefaultSettings(pinHash, pinSalt);

    const hasHttp =
      typeof fetch !== 'undefined' &&
      typeof window !== 'undefined' &&
      Boolean(window.location?.origin?.startsWith('http'));

    if (hasHttp) {
      try {
        const resp = await fetch('/api/auth/request-email-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentName: cleanName,
            username: cleanUsername,
            email: cleanEmail,
            password: input.password,
            passwordHash,
            passwordSalt,
            settings
          })
        });
        const data = await resp.json().catch(() => null);
        if (!resp.ok) {
          return {
            success: false,
            code:
              resp.status === 409
                ? String(data?.error || '').toLowerCase().includes('usuário')
                  ? 'DUPLICATE_USERNAME'
                  : 'DUPLICATE_EMAIL'
                : data?.code || (resp.status >= 500 ? 'EMAIL_SEND_FAILED' : 'VALIDATION_ERROR'),
            retryAfterSeconds: data?.retryAfterSeconds,
            error:
              data?.error ||
              (resp.status === 404
                ? 'Serviço de autenticação (/api) indisponível neste servidor.'
                : resp.status >= 500
                ? 'Erro interno no servidor ao solicitar o código de verificação.'
                : 'Não foi possível enviar o código de verificação.')
          };
        }
        return {
          success: true,
          message: data?.message,
          deliveryMode: data?.deliveryMode,
          emailId: data?.emailId,
          smtpConfigured: Boolean(data?.smtpConfigured),
          localVerificationCode: data?.localVerificationCode,
          expiresInMinutes: data?.expiresInMinutes || 10,
          expiresAt: data?.expiresAt || Date.now() + 10 * 60 * 1000,
          cooldownSeconds: data?.cooldownSeconds || 30
        };
      } catch {
        return {
          success: false,
          code: 'CONNECTION_ERROR',
          error: 'Erro de conexão com o servidor ao solicitar código de verificação.'
        };
      }
    }

    // In-memory offline / Vitest mode (never persists OTP codes to localStorage)
    const vault = getLocalVault();
    const duplicate = Object.values(vault).find(
      u => u.emailLower === emailLower || u.usernameLower === cleanUsername.toLowerCase()
    );
    if (duplicate) {
      return duplicate.emailLower === emailLower
        ? {
            success: false,
            code: 'DUPLICATE_EMAIL',
            error: 'Este e-mail já está cadastrado em outra conta familiar.'
          }
        : {
            success: false,
            code: 'DUPLICATE_USERNAME',
            error: 'Este nome de usuário já está em uso. Escolha outro!'
          };
    }

    const existing = this.pendingEmailVerifications.get(emailLower);
    const now = Date.now();
    const COOLDOWN_MS = 30 * 1000;
    const WINDOW_MS = 15 * 60 * 1000;

    if (!options?.bypassCooldownForTest && existing && now - existing.lastSentAt < COOLDOWN_MS) {
      const retryAfterSeconds = Math.max(1, Math.ceil((COOLDOWN_MS - (now - existing.lastSentAt)) / 1000));
      return {
        success: false,
        code: 'RESEND_COOLDOWN',
        retryAfterSeconds,
        error: `Aguarde ${retryAfterSeconds}s antes de solicitar um novo código para este e-mail.`
      };
    }

    const recentHistory = existing ? existing.sendHistory.filter(ts => now - ts < WINDOW_MS) : [];
    if (recentHistory.length >= 6) {
      return {
        success: false,
        code: 'RATE_LIMITED',
        error: 'Muitas solicitações para este e-mail em poucos minutos. Aguarde antes de tentar novamente.'
      };
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = now + 10 * 60 * 1000;
    this.pendingEmailVerifications.set(emailLower, {
      email: cleanEmail,
      emailLower,
      code,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      used: false,
      lastSentAt: now,
      sendHistory: [...recentHistory, now],
      pendingInput: {
        parentName: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: input.password,
        pin: pinCode
      }
    });

    return {
      success: true,
      message: `Código de verificação de 6 dígitos preparado para ${cleanEmail} (válido por 10 minutos).`,
      deliveryMode: 'local_sandbox_inbox',
      smtpConfigured: false,
      localVerificationCode: code,
      expiresInMinutes: 10,
      expiresAt,
      cooldownSeconds: 30
    };
  }

  public async confirmRegistrationVerification(
    email: string,
    code: string
  ): Promise<ConfirmRegistrationVerificationResult> {
    const cleanEmail = (email || '').trim();
    const emailLower = cleanEmail.toLowerCase();
    const cleanCode = (code || '').replace(/\D/g, '').trim();

    if (!cleanEmail || !/^\d{6}$/.test(cleanCode)) {
      return {
        success: false,
        code: 'INVALID_CODE',
        error: 'Digite os 6 dígitos numéricos do código enviado para o seu e-mail.'
      };
    }

    const hasHttp =
      typeof fetch !== 'undefined' &&
      typeof window !== 'undefined' &&
      Boolean(window.location?.origin?.startsWith('http'));

    if (hasHttp) {
      try {
        const resp = await fetch('/api/auth/confirm-email-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, code: cleanCode })
        });
        const data = await resp.json().catch(() => null);
        if (!resp.ok) {
          return {
            success: false,
            code: data?.code || 'INVALID_CODE',
            remainingAttempts: data?.remainingAttempts,
            error:
              data?.error ||
              (resp.status >= 500
                ? 'Erro interno no servidor ao validar o código de verificação.'
                : 'Não foi possível validar o código de verificação.')
          };
        }

        storageService.clearAllData();
        if (data.family) {
          storageService.applyRemoteFamilyState(data.family, true);
        }
        if (data.session) {
          this.saveStoredSession(data.session);
        }
        return {
          success: true,
          session: data.session,
          family: data.family?.familyAccount
        };
      } catch {
        return {
          success: false,
          code: 'CONNECTION_ERROR',
          error: 'Erro de conexão com o servidor ao confirmar o código.'
        };
      }
    }

    // In-memory offline / Vitest verification
    const record = this.pendingEmailVerifications.get(emailLower);
    if (!record || record.used) {
      return {
        success: false,
        code: 'INVALID_CODE',
        error: 'Código inválido ou já utilizado. Solicite um novo código.'
      };
    }
    if (Date.now() > record.expiresAt) {
      return {
        success: false,
        code: 'EXPIRED_CODE',
        error: 'Este código de verificação expirou (limite de 10 minutos). Clique em reenviar código.'
      };
    }
    if (record.attempts >= record.maxAttempts) {
      record.used = true;
      return {
        success: false,
        code: 'TOO_MANY_ATTEMPTS',
        error: 'Limite de tentativas excedido. Solicite um novo código para continuar.'
      };
    }
    if (cleanCode !== record.code) {
      record.attempts += 1;
      const remainingAttempts = Math.max(0, record.maxAttempts - record.attempts);
      if (remainingAttempts <= 0) {
        record.used = true;
      }
      return {
        success: false,
        code: remainingAttempts <= 0 ? 'TOO_MANY_ATTEMPTS' : 'INVALID_CODE',
        remainingAttempts,
        error:
          remainingAttempts <= 0
            ? 'Código invalidado após 5 tentativas incorretas. Solicite um novo código.'
            : `Código incorreto. Você ainda tem ${remainingAttempts} tentativa(s).`
      };
    }

    record.used = true;
    const finalized = await this.registerParent({
      ...record.pendingInput,
      verificationCode: cleanCode
    });
    if (!finalized.success) {
      return {
        success: false,
        code: 'INVALID_CODE',
        error: finalized.error
      };
    }
    return {
      success: true,
      session: finalized.session,
      family: finalized.family
    };
  }

  public async registerParent(input: RegisterParentInput): Promise<AuthResult> {
    const validationErr = validateParentRegistrationInput(input);
    if (validationErr) {
      return { success: false, error: validationErr };
    }

    const cleanName = input.parentName.trim();
    const cleanUsername = input.username.trim();
    const cleanEmail = input.email.trim();
    const pinCode = input.pin && /^\d{4}$/.test(input.pin) ? input.pin : '1234';

    const passwordSalt = generateSalt();
    const passwordHash = await hashPin(input.password, passwordSalt);
    const pinSalt = generateSalt();
    const pinHash = await hashPin(pinCode, pinSalt);
    const settings = buildDefaultSettings(pinHash, pinSalt);

    // 1. Attempt server registration (requires verified code on HTTP server)
    if (typeof fetch !== 'undefined' && typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
      try {
        const resp = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentName: cleanName,
            username: cleanUsername,
            email: cleanEmail,
            passwordHash,
            passwordSalt,
            settings,
            verificationCode: input.verificationCode
          })
        });
        const data = await resp.json();
        if (!resp.ok) {
          return { success: false, error: data?.error || 'Não foi possível criar a conta.' };
        }
        storageService.clearAllData();
        storageService.applyRemoteFamilyState(data.family, true);
        this.saveStoredSession(data.session);
        return { success: true, session: data.session, family: data.family?.familyAccount };
      } catch {
        return {
          success: false,
          error: 'Erro de conexão com o servidor. Verifique sua conexão antes de concluir o cadastro.'
        };
      }
    }

    // 2. Encrypted Local Vault Fallback (offline / test mode)
    const vault = getLocalVault();
    const duplicate = Object.values(vault).find(
      u => u.emailLower === cleanEmail.toLowerCase() || u.usernameLower === cleanUsername.toLowerCase()
    );
    if (duplicate) {
      return {
        success: false,
        error:
          duplicate.emailLower === cleanEmail.toLowerCase()
            ? 'Este e-mail já está cadastrado.'
            : 'Este nome de usuário já está em uso.'
      };
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const familyId = `fam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    vault[userId] = {
      id: userId,
      familyId,
      parentName: cleanName,
      username: cleanUsername,
      usernameLower: cleanUsername.toLowerCase(),
      email: cleanEmail,
      emailLower: cleanEmail.toLowerCase(),
      passwordHash,
      passwordSalt,
      createdAt: nowIso
    };
    saveLocalVault(vault);

    const familyAccount: FamilyAccount = {
      id: familyId,
      parentUserId: userId,
      parentName: cleanName,
      parentEmail: cleanEmail,
      username: cleanUsername,
      familyName: `Família de ${cleanName.split(' ')[0]}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      settings
    };

    const session: AuthSession = {
      token: `tok_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`,
      familyId,
      userId,
      username: cleanUsername,
      parentEmail: cleanEmail,
      parentName: cleanName,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    };

    storageService.clearAllData();
    await storageService.saveFamilyAccount(familyAccount);
    this.saveStoredSession(session);
    return { success: true, session, family: familyAccount };
  }

  public async loginParent(input: LoginParentInput): Promise<AuthResult> {
    const cleanId = (input.identifier || '').trim();
    if (!cleanId || !input.password) {
      return { success: false, error: 'Informe seu e-mail ou nome de usuário e a senha.' };
    }

    // 1. Server Authentication Flow (challenge salt -> salted hash verification)
    if (typeof fetch !== 'undefined' && typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
      try {
        const challengeResp = await fetch('/api/auth/challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: cleanId })
        });
        const challengeData = await challengeResp.json().catch(() => null);
        if (!challengeResp.ok) {
          if (challengeResp.status === 404 && !challengeData?.error) {
            return { success: false, error: 'Serviço de login (/api) indisponível neste servidor.' };
          }
          return { success: false, error: challengeData?.error || 'Conta não encontrada.' };
        }

        const passwordHash = await hashPin(input.password, challengeData.passwordSalt);
        const legacyPasswordHash = computeLegacyBitwiseHash(input.password, challengeData.passwordSalt);
        const loginResp = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: cleanId,
            passwordHash,
            legacyPasswordHash,
            password: input.password
          })
        });
        const loginData = await loginResp.json().catch(() => null);
        if (!loginResp.ok) {
          return {
            success: false,
            code: loginData?.code,
            email: loginData?.email,
            error:
              loginData?.error ||
              (loginResp.status >= 500
                ? 'Erro interno no servidor ao autenticar.'
                : 'E-mail/usuário ou senha incorretos.')
          };
        }

        storageService.clearAllData();
        if (loginData.family) {
          storageService.applyRemoteFamilyState(loginData.family, true);
        }
        this.saveStoredSession(loginData.session);
        return {
          success: true,
          session: loginData.session,
          family: loginData.family?.familyAccount
        };
      } catch {
        // Network fallback below
      }
    }

    // 2. Local Vault Fallback
    const vault = getLocalVault();
    const cleanLower = cleanId.toLowerCase();
    const user = Object.values(vault).find(
      u => u.emailLower === cleanLower || u.usernameLower === cleanLower
    );
    if (!user) {
      return { success: false, error: 'Conta não encontrada para este e-mail ou usuário.' };
    }
    const validLocalPassword = await verifyPin(input.password, user.passwordSalt, user.passwordHash);
    if (!validLocalPassword) {
      return { success: false, error: 'E-mail/usuário ou senha incorretos.' };
    }

    const session: AuthSession = {
      token: `tok_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`,
      familyId: user.familyId,
      userId: user.id,
      username: user.username,
      parentEmail: user.email,
      parentName: user.parentName,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    };
    this.saveStoredSession(session);
    const existingFam = storageService.getFamilyAccount();
    return { success: true, session, family: existingFam || undefined };
  }

  public async requestPasswordReset(identifier: string): Promise<RequestPasswordResetResult> {
    const cleanId = (identifier || '').trim();
    if (!cleanId) {
      return { success: false, error: 'Informe o e-mail ou nome de usuário cadastrado.' };
    }

    const hasHttp =
      typeof fetch !== 'undefined' &&
      typeof window !== 'undefined' &&
      Boolean(window.location?.origin?.startsWith('http'));

    if (hasHttp) {
      try {
        const resp = await fetch('/api/auth/request-password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: cleanId })
        });
        const data = await resp.json();
        if (!resp.ok) {
          return {
            success: false,
            error: data?.error || 'Não foi possível solicitar a recuperação agora.'
          };
        }
        return {
          success: true,
          message:
            data.message ||
            'Se este e-mail ou usuário estiver cadastrado, um código de verificação foi preparado.',
          deliveryMode: data.deliveryMode,
          smtpConfigured: Boolean(data.smtpConfigured),
          localVerificationCode: data.localVerificationCode,
          expiresInMinutes: data.expiresInMinutes || 15
        };
      } catch {
        // Check if local offline vault can service it; otherwise report connection error
        const vault = getLocalVault();
        const hasLocalMatch = Object.keys(vault).length > 0;
        if (!hasLocalMatch) {
          return {
            success: false,
            error: 'Falha de conexão com o servidor. Verifique sua conexão e tente novamente.'
          };
        }
      }
    }

    // Offline / Vitest sandbox fallback (non-enumerating public message)
    const vault = getLocalVault();
    const cleanLower = cleanId.toLowerCase();
    const user = Object.values(vault).find(
      u => u.emailLower === cleanLower || u.usernameLower === cleanLower
    );

    let localVerificationCode: string | undefined;
    if (user && typeof localStorage !== 'undefined') {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      let resets: Record<string, any> = {};
      try {
        resets = JSON.parse(localStorage.getItem(LOCAL_RESET_KEY) || '{}');
      } catch {
        resets = {};
      }
      resets[user.id] = {
        userId: user.id,
        code,
        expiresAt: Date.now() + 15 * 60 * 1000,
        attempts: 0,
        used: false
      };
      localStorage.setItem(LOCAL_RESET_KEY, JSON.stringify(resets));
      localVerificationCode = code;
    }

    return {
      success: true,
      message:
        'Se este e-mail ou usuário estiver cadastrado, um código de verificação de 6 dígitos foi preparado (válido por 15 minutos).',
      deliveryMode: 'local_sandbox_inbox',
      smtpConfigured: false,
      expiresInMinutes: 15,
      ...(localVerificationCode ? { localVerificationCode } : {})
    };
  }

  public async confirmPasswordReset(input: ConfirmPasswordResetInput): Promise<ConfirmPasswordResetResult> {
    const cleanId = (input.identifier || '').trim();
    const cleanCode = (input.code || '').trim();

    if (!cleanId || !cleanCode) {
      return {
        success: false,
        code: 'INVALID_LINK_OR_CODE',
        error: 'Informe seu e-mail/usuário e o código de 6 dígitos.'
      };
    }
    const resetPwdErr = getPasswordRequirementErrorMessage(input.newPassword);
    if (resetPwdErr) {
      return {
        success: false,
        code: 'INVALID_PASSWORD',
        error: resetPwdErr
      };
    }

    const newPasswordSalt = generateSalt();
    const newPasswordHash = await hashPin(input.newPassword, newPasswordSalt);

    const hasHttp =
      typeof fetch !== 'undefined' &&
      typeof window !== 'undefined' &&
      Boolean(window.location?.origin?.startsWith('http'));

    if (hasHttp) {
      try {
        const resp = await fetch('/api/auth/confirm-password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: cleanId,
            code: cleanCode,
            newPassword: input.newPassword,
            newPasswordHash,
            newPasswordSalt
          })
        });
        const data = await resp.json();
        if (!resp.ok) {
          return {
            success: false,
            code: data?.code || 'INVALID_LINK_OR_CODE',
            error: data?.error || 'Não foi possível validar o código ou alterar a senha.'
          };
        }

        // Sync local vault copy if present on this device
        const vault = getLocalVault();
        const cleanLower = cleanId.toLowerCase();
        const localUser = Object.values(vault).find(
          u => u.emailLower === cleanLower || u.usernameLower === cleanLower
        );
        if (localUser) {
          localUser.passwordHash = newPasswordHash;
          localUser.passwordSalt = newPasswordSalt;
          vault[localUser.id] = localUser;
          saveLocalVault(vault);
        }

        return {
          success: true,
          code: 'PASSWORD_CHANGED',
          message: data?.message || 'Senha alterada com sucesso!'
        };
      } catch {
        const vault = getLocalVault();
        if (Object.keys(vault).length === 0) {
          return {
            success: false,
            code: 'CONNECTION_ERROR',
            error: 'Erro de conexão com o servidor ao confirmar a alteração de senha.'
          };
        }
      }
    }

    // Offline / Vitest sandbox verification
    const vault = getLocalVault();
    const cleanLower = cleanId.toLowerCase();
    const user = Object.values(vault).find(
      u => u.emailLower === cleanLower || u.usernameLower === cleanLower
    );
    let resets: Record<string, any> = {};
    if (typeof localStorage !== 'undefined') {
      try {
        resets = JSON.parse(localStorage.getItem(LOCAL_RESET_KEY) || '{}');
      } catch {
        resets = {};
      }
    }
    const record = user ? resets[user.id] : null;
    if (!user || !record || record.used) {
      return {
        success: false,
        code: 'INVALID_LINK_OR_CODE',
        error: 'Código de verificação inválido ou já utilizado.'
      };
    }
    if (Date.now() > Number(record.expiresAt || 0)) {
      return {
        success: false,
        code: 'EXPIRED_CODE',
        error: 'Este código expirou. Solicite um novo código.'
      };
    }
    if (cleanCode !== String(record.code)) {
      record.attempts = Number(record.attempts || 0) + 1;
      if (record.attempts >= 5) record.used = true;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_RESET_KEY, JSON.stringify(resets));
      }
      return {
        success: false,
        code: 'INVALID_LINK_OR_CODE',
        error: 'Código incorreto. Confira os 6 dígitos e tente novamente.'
      };
    }

    user.passwordHash = newPasswordHash;
    user.passwordSalt = newPasswordSalt;
    vault[user.id] = user;
    saveLocalVault(vault);

    record.used = true;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_RESET_KEY, JSON.stringify(resets));
    }

    return {
      success: true,
      code: 'PASSWORD_CHANGED',
      message: 'Senha alterada com sucesso!'
    };
  }

  public async recoverPassword(input: RecoverPasswordInput): Promise<{ success: boolean; error?: string; message?: string }> {
    const cleanId = (input.identifier || '').trim();
    if (!cleanId) {
      return { success: false, error: 'Informe o e-mail ou nome de usuário cadastrado.' };
    }
    const recoverPwdErr = getPasswordRequirementErrorMessage(input.newPassword);
    if (recoverPwdErr) {
      return { success: false, error: recoverPwdErr };
    }

    const req = await this.requestPasswordReset(cleanId);
    if (!req.success || !req.localVerificationCode) {
      return {
        success: false,
        error: req.error || 'Não foi possível concluir a recuperação sem código de verificação.'
      };
    }
    const conf = await this.confirmPasswordReset({
      identifier: cleanId,
      code: req.localVerificationCode,
      newPassword: input.newPassword
    });
    return { success: conf.success, error: conf.error, message: conf.message };
  }

  public async recoverPinWithParentPassword(
    password: string,
    newPin: string,
    identifier?: string
  ): Promise<{ ok: boolean; error?: string }> {
    const cleanPin = (newPin || '').trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return { ok: false, error: 'O novo PIN deve conter exatamente 4 dígitos numéricos.' };
    }
    if (!password) {
      return { ok: false, error: 'Informe a senha da sua conta parental para confirmar sua identidade.' };
    }

    const session = this.getStoredSession();
    const family = storageService.getFamilyAccount();
    const targetIdentifier = (
      identifier ||
      session?.parentEmail ||
      family?.parentEmail ||
      session?.username ||
      ''
    ).trim();

    if (!targetIdentifier) {
      return {
        ok: false,
        error: 'Informe o e-mail ou nome de usuário da conta dos responsáveis.'
      };
    }

    const newPinSalt = generateSalt();
    const newPinHash = await hashPin(cleanPin, newPinSalt);

    // 1. Server-verified identity check + PIN reset
    if (
      typeof fetch !== 'undefined' &&
      typeof window !== 'undefined' &&
      window.location?.origin?.startsWith('http')
    ) {
      try {
        const challengeResp = await fetch('/api/auth/challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: targetIdentifier })
        });

        if (challengeResp.status !== 404) {
          const challengeData = await challengeResp.json();
          if (!challengeResp.ok) {
            return {
              ok: false,
              error: challengeData?.error || 'Não foi possível localizar a conta parental.'
            };
          }

          const passwordHash = await hashPin(password, challengeData.passwordSalt);
          const legacyPasswordHash = computeLegacyBitwiseHash(password, challengeData.passwordSalt);
          const resetResp = await fetch('/api/auth/recover-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: targetIdentifier,
              passwordHash,
              legacyPasswordHash,
              newPinHash,
              newPinSalt
            })
          });
          const resetData = await resetResp.json();
          if (!resetResp.ok) {
            await storageService.recordSecurityAudit(
              'PIN_RECOVERY_FAILED',
              'Tentativa de recuperação de PIN rejeitada pelo servidor (senha incorreta).'
            );
            return {
              ok: false,
              error: resetData?.error || 'Senha da conta parental incorreta.'
            };
          }

          await storageService.resetParentPinVerified(
            cleanPin,
            'parent_password_recovery',
            { salt: newPinSalt, hash: newPinHash }
          );
          return { ok: true };
        }
      } catch {
        // Network error -> try local vault verification below
      }
    }

    // 2. Local encrypted vault verification (offline / test mode)
    const vault = getLocalVault();
    const cleanLower = targetIdentifier.toLowerCase();
    const user = Object.values(vault).find(
      u => u.emailLower === cleanLower || u.usernameLower === cleanLower
    );

    if (!user) {
      return {
        ok: false,
        error: 'Conta parental não encontrada para este e-mail/usuário.'
      };
    }

    const validLocalPinPassword = await verifyPin(password, user.passwordSalt, user.passwordHash);
    if (!validLocalPinPassword) {
      await storageService.recordSecurityAudit(
        'PIN_RECOVERY_FAILED',
        'Tentativa local de recuperação de PIN com senha incorreta.'
      );
      return { ok: false, error: 'Senha da conta parental incorreta.' };
    }

    await storageService.resetParentPinVerified(
      cleanPin,
      'parent_password_recovery',
      { salt: newPinSalt, hash: newPinHash }
    );
    return { ok: true };
  }

  public async restoreSession(): Promise<AuthSession | null> {
    const stored = this.getStoredSession();
    if (!stored) return null;

    if (typeof fetch !== 'undefined' && typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
      try {
        const resp = await fetch('/api/auth/session', {
          headers: {
            Authorization: `Bearer ${stored.token}`
          }
        });
        if (resp.status === 401 || resp.status === 403) {
          this.clearStoredSession();
          return null;
        }
        if (resp.ok) {
          const data = await resp.json();
          if (data.family) {
            storageService.applyRemoteFamilyState(data.family, false);
          }
          if (data.session) {
            this.saveStoredSession(data.session);
            return data.session;
          }
        }
      } catch {
        // Offline tolerance: keep valid non-expired local session
      }
    }

    return stored;
  }

  public async logoutParent(): Promise<void> {
    const current = this.getStoredSession();
    if (current?.token && typeof fetch !== 'undefined' && typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${current.token}`
          },
          body: JSON.stringify({})
        });
      } catch {
        // ignore network error on logout
      }
    }
    this.clearStoredSession();
    storageService.clearPairedDeviceAuth();
    storageService.clearAllData();
  }
}

export const authService = new AuthService();
