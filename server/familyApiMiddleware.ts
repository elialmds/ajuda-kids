import type { Plugin } from 'vite';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

export interface MultiplayerRoomPlayer {
  playerId: string;
  name: string;
  avatarId: string;
  color: string;
  isHost: boolean;
  ready: boolean;
  score: number;
  lives: number;
  posture: 'stand' | 'morto_crouch' | 'vivo_jump' | 'celebrate';
  seatIndex: number;
  lastActionRound?: number;
  lastActionChoice?: string;
  lastSeenAt: number;
}

export interface MultiplayerGameRoom {
  code: string;
  gameType: 'morto-vivo' | 'pato-ganso';
  familyId?: string;
  hostPlayerId: string;
  phase: 'lobby' | 'playing' | 'chasing' | 'finished';
  round: number;
  command: 'vivo' | 'morto';
  roundIssuedAt: number;
  roundDeadlineAt: number;
  walkerIndex: number;
  walkerStep: number;
  gooseIndex: number | null;
  emptySeatIndex: number;
  seatOrder: number[]; // participant index at each circle seat (0..5)
  chaseRunnerProgress: number;
  chaseGooseProgress: number;
  lastEventMessage: string;
  winnerPlayerId?: string | null;
  players: MultiplayerRoomPlayer[];
  createdAt: number;
  updatedAt: number;
}

export interface ServerStore {
  users: Record<string, any>;
  sessions: Record<string, any>;
  deviceTokens?: Record<string, { token: string; familyId: string; deviceId: string; childId: string; createdAt: number }>;
  families: Record<string, any>;
  pairings: Record<string, any>;
  passwordResets?: Record<string, any>;
  passwordResetRateLimits?: Record<string, { lastSentAt: number; sendHistory: number[] }>;
  loginAttempts?: Record<string, { failedCount: number; windowStart: number; lockUntil: number }>;
  emailVerifications?: Record<string, any>;
  gameRooms?: Record<string, MultiplayerGameRoom>;
}

export interface SmtpEnvConfig {
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  EMAIL_FROM: string;
}

export interface FamilyApiOptions {
  rootDir: string;
  dataDir?: string;
  getSmtpEnv?: () => SmtpEnvConfig;
  sendMailOverride?: (mailOptions: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }) => Promise<{ accepted?: string[]; messageId?: string }>;
}

const KID_ROOM_COLORS = ['#FF6B6B', '#4ECDC4', '#F8C41B', '#9B6BFF', '#38A3F1', '#48C71E'];

function computeSha256Server(secret: string, salt: string): string {
  const normalized = `${salt}:${secret.trim()}:ajuda-kids-secure`;
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

function computeLegacyHashServer(secret: string, salt: string): string {
  let hash = 0;
  const str = `${salt}:${secret.trim()}:ajuda-kids-secure`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fb_' + Math.abs(hash).toString(16) + salt.substring(0, 8);
}

function isValidEmailAddress(emailStr: string): boolean {
  return (
    Boolean(emailStr) &&
    !emailStr.includes('..') &&
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailStr)
  );
}

function validatePasswordStrengthServer(pwd: string): string | null {
  const raw = typeof pwd === 'string' ? pwd : '';
  const missing: string[] = [];
  if (raw.length < 8) missing.push('mínimo de 8 caracteres');
  if (!/[A-Z]/.test(raw)) missing.push('pelo menos 1 letra maiúscula (A–Z)');
  if (!/[0-9]/.test(raw)) missing.push('pelo menos 1 número (0–9)');
  if (!/[^A-Za-z0-9\s]/.test(raw)) {
    missing.push('pelo menos 1 caractere especial (ex.: !@#$%&*)');
  }
  if (missing.length > 0) {
    return `A senha deve conter: ${missing.join(', ')}.`;
  }
  return null;
}

function escapeHtml(str: string): string {
  return String(str || '').replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] || ch)
  );
}

function hashesEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(String(a), 'utf8');
  const bufB = Buffer.from(String(b), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function extractBearerToken(req: IncomingMessage): string {
  const authHeader = String(req.headers['authorization'] || '');
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const altHeader = String(req.headers['x-session-token'] || '').trim();
  return altHeader;
}

function isOriginAllowed(origin: string, host: string): boolean {
  if (!origin) return false;
  try {
    const parsedOrigin = new URL(origin);
    const originHost = parsedOrigin.host.toLowerCase();
    const requestHost = String(host || '').toLowerCase();
    if (requestHost && originHost === requestHost) return true;
    const hostname = parsedOrigin.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.lhr.life') ||
      hostname.endsWith('.trycloudflare.com') ||
      /^192\.168\.\d+\.\d+$/.test(hostname) ||
      /^10\.\d+\.\d+\.\d+$/.test(hostname)
    ) {
      return true;
    }
    const extraAllowed = String(process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
    return extraAllowed.includes(origin.toLowerCase()) || extraAllowed.includes(originHost);
  } catch {
    return false;
  }
}

const KV_STORE_KEY = 'ajuda_kids_family_cloud_db_v1';

function readLocalEnvFiles(rootDir: string): Record<string, string> {
  const result: Record<string, string> = {};
  const candidates = ['.env', '.env.local'];
  for (const filename of candidates) {
    const filePath = path.join(rootDir, filename);
    try {
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const rawLine of content.split(/\r?\n/)) {
        const trimmed = rawLine.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx <= 0) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"') && val.length >= 2) ||
          (val.startsWith("'") && val.endsWith("'") && val.length >= 2)
        ) {
          val = val.slice(1, -1);
        }
        result[key] = val;
      }
    } catch {
      // Ignore unreadable local env files
    }
  }
  return result;
}

function getExternalSupabaseConfig(
  fileEnv?: Record<string, string>
): { url: string; serviceKey: string } | null {
  const url = String(
    process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      fileEnv?.SUPABASE_URL ||
      fileEnv?.NEXT_PUBLIC_SUPABASE_URL ||
      fileEnv?.VITE_SUPABASE_URL ||
      ''
  )
    .trim()
    .replace(/\/+$/, '');
  const serviceKey = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      fileEnv?.SUPABASE_SERVICE_ROLE_KEY ||
      fileEnv?.SUPABASE_SECRET_KEY ||
      ''
  ).trim();
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

function getExternalKvConfig(): { url: string; token: string } | null {
  const url = String(
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
  )
    .trim()
    .replace(/\/+$/, '');
  const token = String(
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''
  ).trim();
  if (!url || !token) return null;
  return { url, token };
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of String(cookieHeader).split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = v;
  }
  return out;
}

function signSignedPayload(payload: any, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded, 'utf8').digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySignedPayload(token: string, secret: string): any | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;
  const expected = crypto.createHmac('sha256', secret).update(encoded, 'utf8').digest('base64url');
  if (!hashesEqual(sig, expected)) return null;
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function isHttpsRequest(req: IncomingMessage): boolean {
  const xfProto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  if (xfProto.includes('https')) return true;
  const origin = String(req.headers['origin'] || '').toLowerCase();
  return origin.startsWith('https://');
}

function normalizeStoreData(parsed: any): ServerStore {
  return {
    users: parsed?.users || {},
    sessions: parsed?.sessions || {},
    deviceTokens: parsed?.deviceTokens || {},
    families: parsed?.families || {},
    pairings: parsed?.pairings || {},
    passwordResets: parsed?.passwordResets || {},
    passwordResetRateLimits: parsed?.passwordResetRateLimits || {},
    loginAttempts: parsed?.loginAttempts || {},
    emailVerifications: parsed?.emailVerifications || {},
    gameRooms: parsed?.gameRooms || {}
  };
}

export function createFamilyApiHandler(options: FamilyApiOptions) {
  const isServerlessRuntime = Boolean(
    process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME
  );
  const useWarmServerlessCache = !options.dataDir && isServerlessRuntime;
  const dataDir =
    options.dataDir ||
    (isServerlessRuntime
      ? path.join(os.tmpdir(), 'ajuda-kids-data')
      : path.resolve(options.rootDir, '.data'));
  const dbFile = path.join(dataDir, 'family_cloud_db.json');

  const getSmtpEnvConfig = (): SmtpEnvConfig => {
    if (options.getSmtpEnv) return options.getSmtpEnv();
    const fileEnv = readLocalEnvFiles(options.rootDir);
    const emailUser = (process.env.EMAIL_USER || fileEnv.EMAIL_USER || '').trim();
    const rawSecure = String(process.env.SMTP_SECURE ?? fileEnv.SMTP_SECURE ?? 'false')
      .trim()
      .toLowerCase();
    return {
      SMTP_HOST: (process.env.SMTP_HOST || fileEnv.SMTP_HOST || 'smtp.gmail.com').trim(),
      SMTP_PORT: Number(process.env.SMTP_PORT || fileEnv.SMTP_PORT || 587),
      SMTP_SECURE: rawSecure === 'true',
      EMAIL_USER: emailUser,
      EMAIL_PASS: (process.env.EMAIL_PASS || fileEnv.EMAIL_PASS || '').trim(),
      EMAIL_FROM: (
        process.env.EMAIL_FROM ||
        fileEnv.EMAIL_FROM ||
        (emailUser ? `Ajuda KIDS <${emailUser}>` : '')
      ).trim()
    };
  };

  const logSmtpEvent = (entry: {
    purpose: 'registration' | 'password_reset';
    to: string;
    from: string;
    smtpHost: string;
    smtpPort: number;
    messageId: string | null;
    accepted: string[];
    errorMessage: string | null;
  }) => {
    if (entry.errorMessage) {
      console.warn('[Ajuda KIDS SMTP]', JSON.stringify(entry));
    } else {
      console.info('[Ajuda KIDS SMTP]', JSON.stringify(entry));
    }
  };

  const classifySmtpError = (err: any): { statusCode: number; errorCode: string; errorMessage: string } => {
    const errCode = String(err?.code || '').toUpperCase();
    const responseCode = Number(err?.responseCode || 0);
    const errMsg = String(err?.message || 'Falha ao enviar e-mail via Gmail SMTP.');
    const lowerMsg = errMsg.toLowerCase();

    if (
      errCode === 'EAUTH' ||
      responseCode === 535 ||
      lowerMsg.includes('username and password not accepted') ||
      lowerMsg.includes('invalid login')
    ) {
      return {
        statusCode: 401,
        errorCode: 'SMTP_AUTH_ERROR',
        errorMessage: 'Falha de autenticação no Gmail SMTP: verifique o usuário e a senha de app configurados no servidor.'
      };
    }

    if (
      errCode === 'EENVELOPE' ||
      responseCode === 550 ||
      responseCode === 553 ||
      lowerMsg.includes('no recipients')
    ) {
      return {
        statusCode: 422,
        errorCode: 'INVALID_EMAIL_ADDRESS',
        errorMessage: 'O endereço de e-mail informado foi recusado como inválido pelo servidor Gmail SMTP.'
      };
    }

    return {
      statusCode: 502,
      errorCode: 'EMAIL_SEND_FAILED',
      errorMessage: `Falha ao enviar o e-mail de verificação via Gmail SMTP: ${errMsg}`
    };
  };

  const dispatchVerificationEmail = async (
    toEmail: string,
    parentName: string,
    code: string,
    purpose: 'registration' | 'password_reset' = 'registration'
  ): Promise<{
    sent: boolean;
    provider?: 'gmail_smtp';
    deliveryMode?: 'email_provider';
    emailId?: string;
    errorCode?: string;
    errorMessage?: string;
    statusCode?: number;
  }> => {
    const env = getSmtpEnvConfig();
    const fromAddress = env.EMAIL_FROM || (env.EMAIL_USER ? `Ajuda KIDS <${env.EMAIL_USER}>` : '');

    if (!env.SMTP_HOST || !env.SMTP_PORT || !env.EMAIL_USER || !env.EMAIL_PASS || !fromAddress) {
      const msg = isServerlessRuntime
        ? 'Credenciais Gmail SMTP não configuradas no servidor Vercel. Adicione EMAIL_USER e EMAIL_PASS em Settings > Environment Variables e faça Redeploy.'
        : 'Credenciais Gmail SMTP incompletas no arquivo .env do servidor.';
      logSmtpEvent({
        purpose,
        to: toEmail,
        from: fromAddress || '(não configurado)',
        smtpHost: env.SMTP_HOST || '(vazio)',
        smtpPort: env.SMTP_PORT || 0,
        messageId: null,
        accepted: [],
        errorMessage: msg
      });
      return {
        sent: false,
        provider: 'gmail_smtp',
        statusCode: 500,
        errorCode: 'SMTP_CONFIG_ERROR',
        errorMessage: msg
      };
    }

    const subject =
      purpose === 'password_reset'
        ? 'Recuperação de senha — Código Ajuda KIDS'
        : 'Código de verificação — Ajuda KIDS';
    const introText =
      purpose === 'password_reset'
        ? 'Recebemos uma solicitação para redefinir a senha da sua conta familiar no <strong>Ajuda KIDS</strong>.'
        : 'Use o código abaixo para confirmar seu e-mail e finalizar o cadastro no <strong>Ajuda KIDS</strong>:';
    const validityText = purpose === 'password_reset' ? '15 minutos' : '10 minutos';

    const buildHtmlBody = () => `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#F4F7FB;border-radius:16px;color:#1E2B48;">
        <h2 style="margin:0 0 12px;color:#0D2A5C;">Ajuda KIDS</h2>
        <p style="margin:0 0 12px;">Olá, <strong>${escapeHtml(parentName || 'Responsável')}</strong>!</p>
        <p style="margin:0 0 16px;">${introText}</p>
        <div style="background:#FFFFFF;border:2px solid #5843F4;border-radius:12px;padding:18px;text-align:center;margin:18px 0;">
          <span style="font-family:monospace;font-size:32px;font-weight:bold;letter-spacing:8px;color:#1E2B48;">${escapeHtml(code)}</span>
        </div>
        <p style="margin:0 0 8px;font-size:13px;color:#475569;">Este código expira em <strong>${validityText}</strong> e pode ser utilizado apenas uma vez.</p>
        <p style="margin:0;font-size:12px;color:#64748B;">Se você não solicitou este código, ignore esta mensagem com segurança.</p>
      </div>
    `;

    try {
      let info: { accepted?: unknown[]; messageId?: string };
      if (options.sendMailOverride) {
        info = await options.sendMailOverride({
          from: fromAddress,
          to: toEmail,
          subject,
          html: buildHtmlBody()
        });
      } else {
        const transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          requireTLS: !env.SMTP_SECURE,
          auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS
          }
        });

        info = await transporter.sendMail({
          from: fromAddress,
          to: toEmail,
          subject,
          html: buildHtmlBody()
        });
      }

      const accepted = Array.isArray(info?.accepted) ? info.accepted.map(String) : [];
      const messageId = info?.messageId ? String(info.messageId) : '';

      if (accepted.length === 0 || !messageId) {
        const msg = 'O servidor Gmail SMTP não confirmou a aceitação da mensagem.';
        logSmtpEvent({
          purpose,
          to: toEmail,
          from: fromAddress,
          smtpHost: env.SMTP_HOST,
          smtpPort: env.SMTP_PORT,
          messageId: messageId || null,
          accepted,
          errorMessage: msg
        });
        return {
          sent: false,
          provider: 'gmail_smtp',
          statusCode: 502,
          errorCode: 'EMAIL_SEND_FAILED',
          errorMessage: msg
        };
      }

      logSmtpEvent({
        purpose,
        to: toEmail,
        from: fromAddress,
        smtpHost: env.SMTP_HOST,
        smtpPort: env.SMTP_PORT,
        messageId,
        accepted,
        errorMessage: null
      });

      return {
        sent: true,
        provider: 'gmail_smtp',
        deliveryMode: 'email_provider',
        emailId: messageId
      };
    } catch (err: any) {
      const classified = classifySmtpError(err);
      logSmtpEvent({
        purpose,
        to: toEmail,
        from: fromAddress,
        smtpHost: env.SMTP_HOST,
        smtpPort: env.SMTP_PORT,
        messageId: null,
        accepted: [],
        errorMessage: String(err?.message || classified.errorMessage)
      });
      return {
        sent: false,
        provider: 'gmail_smtp',
        statusCode: classified.statusCode,
        errorCode: classified.errorCode,
        errorMessage: classified.errorMessage
      };
    }
  };

  let lastStorageWarning: string | null = null;

  const getStatelessCookieSecret = (): string => {
    const smtp = getSmtpEnvConfig();
    return (process.env.AUTH_COOKIE_SECRET || smtp.EMAIL_PASS || 'ajuda-kids-serverless-otp-key').trim();
  };

  const getSupabaseConfig = () => {
    if (options.dataDir) return null;
    const fileEnv = readLocalEnvFiles(options.rootDir);
    return getExternalSupabaseConfig(fileEnv);
  };

  const loadStore = async (): Promise<ServerStore> => {
    const supabase = getSupabaseConfig();
    if (supabase && typeof fetch !== 'undefined') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      try {
        const resp = await fetch(
          `${supabase.url}/rest/v1/ajuda_kids_state?id=eq.primary&select=data`,
          {
            headers: {
              apikey: supabase.serviceKey,
              Authorization: `Bearer ${supabase.serviceKey}`,
              Accept: 'application/json'
            },
            signal: controller.signal
          }
        );
        if (resp.ok) {
          const rows: any = await resp.json();
          lastStorageWarning = null;
          if (Array.isArray(rows) && rows.length > 0 && rows[0]?.data) {
            const parsed = normalizeStoreData(rows[0].data);
            if (useWarmServerlessCache) {
              (globalThis as any).__ajudaKidsWarmStore = parsed;
            }
            return parsed;
          }
          return normalizeStoreData({});
        }
        lastStorageWarning =
          resp.status === 404
            ? 'Tabela public.ajuda_kids_state não encontrada no Supabase. Execute supabase/schema.sql no SQL Editor.'
            : `Erro HTTP ${resp.status} ao consultar o Supabase.`;
        console.warn('[Ajuda KIDS Supabase]', lastStorageWarning);
      } catch (e: any) {
        lastStorageWarning = `Falha de rede ao ler Supabase: ${String(e?.message || e)}`;
        console.warn('[Ajuda KIDS Supabase]', lastStorageWarning);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    const kv = !options.dataDir ? getExternalKvConfig() : null;
    if (kv && typeof fetch !== 'undefined') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      try {
        const resp = await fetch(`${kv.url}/get/${encodeURIComponent(KV_STORE_KEY)}`, {
          headers: { Authorization: `Bearer ${kv.token}` },
          signal: controller.signal
        });
        if (resp.ok) {
          const payload: any = await resp.json();
          if (payload && typeof payload.result === 'string' && payload.result.trim()) {
            const parsed = normalizeStoreData(JSON.parse(payload.result));
            if (useWarmServerlessCache) {
              (globalThis as any).__ajudaKidsWarmStore = parsed;
            }
            return parsed;
          }
          if (payload && payload.result === null) {
            return normalizeStoreData({});
          }
        }
      } catch (e) {
        console.warn('KV store read fallback to disk/memory:', e);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (useWarmServerlessCache && (globalThis as any).__ajudaKidsWarmStore) {
      return normalizeStoreData((globalThis as any).__ajudaKidsWarmStore);
    }

    try {
      if (fs.existsSync(dbFile)) {
        const raw = fs.readFileSync(dbFile, 'utf-8');
        const parsed = normalizeStoreData(JSON.parse(raw));
        if (useWarmServerlessCache) {
          (globalThis as any).__ajudaKidsWarmStore = parsed;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading family sync store:', e);
    }
    return normalizeStoreData({});
  };

  const saveStore = async (store: ServerStore): Promise<void> => {
    if (useWarmServerlessCache) {
      (globalThis as any).__ajudaKidsWarmStore = store;
    }

    const serialized = JSON.stringify(store, null, 2);
    const tmpFile = `${dbFile}.tmp.${process.pid}.${crypto.randomBytes(4).toString('hex')}`;
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(tmpFile, serialized, 'utf-8');
      fs.renameSync(tmpFile, dbFile);
    } catch (e) {
      try {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      } catch {
        // ignore cleanup error
      }
      console.error('Error saving family sync store:', e);
    }

    const supabase = getSupabaseConfig();
    if (supabase && typeof fetch !== 'undefined') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      try {
        const resp = await fetch(`${supabase.url}/rest/v1/ajuda_kids_state?on_conflict=id`, {
          method: 'POST',
          headers: {
            apikey: supabase.serviceKey,
            Authorization: `Bearer ${supabase.serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal'
          },
          body: JSON.stringify({
            id: 'primary',
            data: store,
            updated_at: new Date().toISOString()
          }),
          signal: controller.signal
        });
        if (resp.ok) {
          lastStorageWarning = null;
        } else {
          lastStorageWarning =
            resp.status === 404
              ? 'Tabela public.ajuda_kids_state não encontrada no Supabase. Execute supabase/schema.sql no SQL Editor.'
              : `Erro HTTP ${resp.status} ao salvar no Supabase.`;
          console.error('[Ajuda KIDS Supabase]', lastStorageWarning);
        }
      } catch (e: any) {
        lastStorageWarning = `Falha de rede ao salvar no Supabase: ${String(e?.message || e)}`;
        console.error('[Ajuda KIDS Supabase]', lastStorageWarning);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    const kv = !options.dataDir ? getExternalKvConfig() : null;
    if (kv && typeof fetch !== 'undefined') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      try {
        await fetch(kv.url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kv.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(['SET', KV_STORE_KEY, JSON.stringify(store)]),
          signal: controller.signal
        });
      } catch (e) {
        console.error('Error saving family sync store to KV:', e);
      } finally {
        clearTimeout(timeoutId);
      }
    }
  };

  const parseBody = (req: IncomingMessage): Promise<any> => {
    const preParsed = (req as any).body;
    if (preParsed !== undefined) {
      if (typeof preParsed === 'string') {
        try {
          return Promise.resolve(preParsed ? JSON.parse(preParsed) : {});
        } catch {
          return Promise.resolve({});
        }
      }
      if (Buffer.isBuffer(preParsed)) {
        try {
          const text = preParsed.toString('utf-8');
          return Promise.resolve(text ? JSON.parse(text) : {});
        } catch {
          return Promise.resolve({});
        }
      }
      if (typeof preParsed === 'object' && preParsed !== null) {
        return Promise.resolve(preParsed);
      }
    }
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  };

  const applyResponseHeaders = (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const origin = String(req.headers['origin'] || '');
    const host = String(req.headers['host'] || '');
    if (origin && isOriginAllowed(origin, host)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Device-Token, X-Pairing-Claim, X-Session-Token'
    );
  };

  const sendJson = (req: IncomingMessage, res: ServerResponse, status: number, data: any) => {
    res.statusCode = status;
    applyResponseHeaders(req, res);
    res.end(JSON.stringify(data));
  };

  const findUserByIdentifier = (users: Record<string, any>, identifier: string) => {
    const clean = String(identifier || '').trim().toLowerCase();
    if (!clean) return null;
    return (
      Object.values(users).find(
        (u: any) =>
          (u.emailLower && u.emailLower === clean) ||
          (u.usernameLower && u.usernameLower === clean) ||
          (u.email && String(u.email).trim().toLowerCase() === clean) ||
          (u.username && String(u.username).trim().toLowerCase() === clean)
      ) || null
    );
  };

  const mergeById = (a: any[] = [], b: any[] = [], limit = 300) => {
    const map = new Map<string, any>();
    [...(a || []), ...(b || [])].forEach((item) => {
      if (!item || !item.id) return;
      const prev = map.get(item.id);
      if (!prev || new Date(item.updatedAt || 0).getTime() >= new Date(prev.updatedAt || 0).getTime()) {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values()).slice(0, limit);
  };

  const reconcileFamiliesForUser = (store: ServerStore, user: any): { family: any; changed: boolean } => {
    if (!user || !user.familyId) return { family: null, changed: false };
    let changed = false;

    if (!store.families[user.familyId]) {
      const nowIso = new Date().toISOString();
      store.families[user.familyId] = {
        familyAccount: {
          id: user.familyId,
          parentUserId: user.id,
          parentName: user.parentName,
          parentEmail: user.email,
          username: user.username,
          familyName: `Família de ${String(user.parentName || 'Família').split(' ')[0]}`,
          createdAt: nowIso,
          updatedAt: nowIso,
          settings: {}
        },
        children: [],
        devices: [],
        journeys: {},
        emotions: [],
        gameRecords: [],
        activityCompletions: [],
        dailyPlays: {},
        timeTracking: {},
        syncEvents: [],
        drawings: [],
        updatedAt: Date.now()
      };
      changed = true;
    }

    const target = store.families[user.familyId];
    if (!Array.isArray(target.drawings)) {
      target.drawings = [];
    }

    const otherOwnedFamilyIds = new Set(
      Object.values(store.users)
        .filter((u: any) => u.id !== user.id && u.familyId)
        .map((u: any) => u.familyId)
    );

    const userEmailLower = String(user.emailLower || user.email || '').trim().toLowerCase();
    for (const [fid, candidate] of Object.entries(store.families)) {
      if (fid === user.familyId || otherOwnedFamilyIds.has(fid)) continue;
      if (!candidate || candidate.mergedIntoFamilyId === user.familyId) continue;
      const candEmail = String(candidate.familyAccount?.parentEmail || '').trim().toLowerCase();
      if (!userEmailLower || candEmail !== userEmailLower) continue;

      const childMap = new Map<string, any>();
      (target.children || []).forEach((c: any) => childMap.set(c.id, c));
      (candidate.children || []).forEach((c: any) => {
        const prev = childMap.get(c.id);
        if (!prev || new Date(c.updatedAt || 0).getTime() >= new Date(prev.updatedAt || 0).getTime()) {
          childMap.set(c.id, c);
        }
      });
      target.children = Array.from(childMap.values());

      target.devices = mergeById(target.devices, candidate.devices, 100);
      target.emotions = mergeById(target.emotions, candidate.emotions);
      target.gameRecords = mergeById(target.gameRecords, candidate.gameRecords);
      target.activityCompletions = mergeById(target.activityCompletions, candidate.activityCompletions);
      target.syncEvents = mergeById(target.syncEvents, candidate.syncEvents);
      target.drawings = mergeById(target.drawings, candidate.drawings, 120);
      target.securityAuditLog = mergeById(target.securityAuditLog, candidate.securityAuditLog, 100);
      target.journeys = { ...(candidate.journeys || {}), ...(target.journeys || {}) };
      target.dailyPlays = { ...(candidate.dailyPlays || {}), ...(target.dailyPlays || {}) };
      target.timeTracking = { ...(candidate.timeTracking || {}), ...(target.timeTracking || {}) };

      if (candidate.familyAccount?.settings?.isPinSet && !target.familyAccount?.settings?.isPinSet) {
        target.familyAccount = {
          ...(target.familyAccount || {}),
          settings: {
            ...(target.familyAccount?.settings || {}),
            ...candidate.familyAccount.settings
          },
          updatedAt: new Date().toISOString()
        };
      }

      target.updatedAt = Date.now();
      candidate.mergedIntoFamilyId = user.familyId;
      changed = true;
    }

    store.families[user.familyId] = target;
    return { family: target, changed };
  };

  /**
   * Authorizes requests scoped to `familyId`.
   * Parent actions require a valid Bearer session owning `familyId`.
   * Child-sync actions may also authenticate with an active `X-Device-Token`.
   */
  const authorizeFamilyAccess = (
    store: ServerStore,
    req: IncomingMessage,
    familyId: string,
    opts: { allowPairedDevice: boolean }
  ): { authorized: boolean; status?: number; code?: string; error?: string; actor?: 'parent' | 'device'; session?: any } => {
    const bearer = extractBearerToken(req);
    if (bearer) {
      const session = store.sessions[bearer];
      if (!session || Date.now() > Number(session.expiresAt || 0)) {
        return {
          authorized: false,
          status: 401,
          code: 'SESSION_EXPIRED',
          error: 'Sessão inválida ou expirada. Faça login novamente.'
        };
      }
      if (session.familyId !== familyId) {
        return {
          authorized: false,
          status: 403,
          code: 'FORBIDDEN_FAMILY',
          error: 'Sem permissão para acessar os dados de outra família.'
        };
      }
      return { authorized: true, actor: 'parent', session };
    }

    if (opts.allowPairedDevice) {
      const deviceToken = String(req.headers['x-device-token'] || '').trim();
      if (deviceToken) {
        const rec = store.deviceTokens?.[deviceToken];
        if (!rec || rec.familyId !== familyId) {
          return {
            authorized: false,
            status: 401,
            code: 'INVALID_DEVICE_TOKEN',
            error: 'Dispositivo não autorizado ou desconectado da família.'
          };
        }
        const family = store.families[familyId];
        const dev = family?.devices?.find((d: any) => d.id === rec.deviceId);
        if (dev && dev.status === 'revoked') {
          return {
            authorized: false,
            status: 403,
            code: 'DEVICE_REVOKED',
            error: 'O acesso deste dispositivo foi revogado pelos responsáveis.'
          };
        }
        return { authorized: true, actor: 'device' };
      }
    }

    return {
      authorized: false,
      status: 401,
      code: 'AUTH_REQUIRED',
      error: 'Autenticação necessária para acessar ou sincronizar os dados da família.'
    };
  };

  /** Removes expired unverified user registrations so usernames aren't permanently hostage. */
  const isUserActiveOrPendingValid = (store: ServerStore, user: any, now = Date.now()): boolean => {
    if (!user) return false;
    if (user.emailVerified === true) return true;
    const verification = store.emailVerifications?.[user.emailLower];
    if (!verification || verification.used) return false;
    return now <= Number(verification.expiresAt || 0);
  };

  const cleanupStaleRooms = (store: ServerStore, now = Date.now()) => {
    const rooms = (store.gameRooms = store.gameRooms || {});
    for (const [code, room] of Object.entries(rooms)) {
      if (now - Number(room.updatedAt || 0) > 2 * 60 * 60 * 1000) {
        delete rooms[code];
      }
    }
  };

  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';
    if (!url.startsWith('/api/')) {
      return next();
    }

    if (req.method === 'OPTIONS') {
      return sendJson(req, res, 200, { ok: true });
    }

    if (url.startsWith('/api/health') && req.method === 'GET') {
      const smtpEnv = getSmtpEnvConfig();
      const supabase = getSupabaseConfig();
      const kv = !options.dataDir ? getExternalKvConfig() : null;
      return sendJson(req, res, 200, {
        ok: true,
        runtime: isServerlessRuntime ? 'vercel-serverless' : 'node-local',
        smtpConfigured: Boolean(smtpEnv.EMAIL_USER && smtpEnv.EMAIL_PASS),
        storageBackend: supabase
          ? 'supabase'
          : kv
          ? 'kv'
          : isServerlessRuntime
          ? 'tmp-ephemeral'
          : 'local-file',
        persistentKvConfigured: Boolean(supabase || kv),
        persistentStorageConfigured: Boolean(supabase || kv),
        ...(lastStorageWarning ? { storageWarning: lastStorageWarning } : {})
      });
    }

    const store = await loadStore();

    const createVerifiedAccountAndSession = (pending: {
      parentName: string;
      username: string;
      email: string;
      passwordHash: string;
      passwordSalt: string;
      settings: any;
    }) => {
      const cleanName = String(pending.parentName || '').trim();
      const cleanUser = String(pending.username || '').trim();
      const cleanEmail = String(pending.email || '').trim();
      const userId = `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const familyId = `fam_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const nowIso = new Date().toISOString();

      store.users[userId] = {
        id: userId,
        familyId,
        parentName: cleanName,
        username: cleanUser,
        usernameLower: cleanUser.toLowerCase(),
        email: cleanEmail,
        emailLower: cleanEmail.toLowerCase(),
        passwordHash: pending.passwordHash,
        passwordSalt: pending.passwordSalt,
        emailVerified: true,
        emailVerifiedAt: nowIso,
        createdAt: nowIso
      };

      const familyAccount = {
        id: familyId,
        parentUserId: userId,
        parentName: cleanName,
        parentEmail: cleanEmail,
        username: cleanUser,
        familyName: `Família de ${cleanName.split(' ')[0]}`,
        createdAt: nowIso,
        updatedAt: nowIso,
        settings: pending.settings
      };

      store.families[familyId] = {
        familyAccount,
        children: [],
        devices: [],
        journeys: {},
        emotions: [],
        gameRecords: [],
        activityCompletions: [],
        dailyPlays: {},
        timeTracking: {},
        syncEvents: [],
        drawings: [],
        securityAuditLog: [
          {
            id: `sec_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
            timestamp: Date.now(),
            eventType: 'EMAIL_VERIFIED_REGISTRATION',
            details: `Conta criada com verificação de e-mail em 6 dígitos (${cleanEmail}).`
          }
        ],
        updatedAt: Date.now()
      };

      const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
      const session = {
        token,
        familyId,
        userId,
        username: cleanUser,
        parentEmail: cleanEmail,
        parentName: cleanName,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
      };
      store.sessions[token] = session;
      return { session, family: store.families[familyId] };
    };

    // --- 1. EMAIL VERIFICATION & REGISTRATION ---
    if (url === '/api/auth/request-email-verification' && req.method === 'POST') {
      const body = await parseBody(req);
      const { parentName, username, email, password, passwordHash, passwordSalt, settings } = body;
      const cleanName = String(parentName || '').trim();
      const cleanUser = String(username || '').trim();
      const cleanEmail = String(email || '').trim();
      const emailLower = cleanEmail.toLowerCase();

      if (!isValidEmailAddress(cleanEmail)) {
        return sendJson(req, res, 400, {
          ok: false,
          code: 'INVALID_EMAIL',
          error: 'Informe um endereço de e-mail válido (ex: seuemail@gmail.com).'
        });
      }

      if (cleanName.length < 2 || cleanUser.length < 3 || !/^[a-zA-Z0-9._-]+$/.test(cleanUser)) {
        return sendJson(req, res, 400, {
          ok: false,
          code: 'VALIDATION_ERROR',
          error: 'Preencha todos os campos corretamente (nome, usuário, e-mail válido e senha) antes de continuar.'
        });
      }

      const pwdError = validatePasswordStrengthServer(typeof password === 'string' ? password : '');
      if (pwdError) {
        return sendJson(req, res, 400, {
          ok: false,
          code: 'WEAK_PASSWORD',
          error: pwdError
        });
      }

      if (!passwordHash || !passwordSalt) {
        return sendJson(req, res, 400, {
          ok: false,
          code: 'VALIDATION_ERROR',
          error: 'Preencha todos os campos corretamente (nome, usuário, e-mail válido e senha) antes de continuar.'
        });
      }

      const existingEmailUser = Object.values(store.users).find((u: any) => u.emailLower === emailLower);
      if (existingEmailUser && existingEmailUser.emailVerified === true) {
        return sendJson(req, res, 409, {
          code: 'DUPLICATE_EMAIL',
          error: 'Este e-mail já está cadastrado e verificado em outra conta familiar.'
        });
      }

      const now = Date.now();
      // Purge expired unverified accounts holding onto a username
      for (const [uid, candidate] of Object.entries(store.users)) {
        if (candidate.emailVerified === false && candidate.emailLower !== emailLower && !isUserActiveOrPendingValid(store, candidate, now)) {
          delete store.users[uid];
        }
      }

      const duplicateUser = Object.values(store.users).find(
        (u: any) =>
          u.usernameLower === cleanUser.toLowerCase() &&
          u.emailLower !== emailLower &&
          isUserActiveOrPendingValid(store, u, now)
      );
      if (duplicateUser) {
        return sendJson(req, res, 409, {
          code: 'DUPLICATE_USERNAME',
          error: 'Este nome de usuário já está em uso. Escolha outro!'
        });
      }

      const verifications = (store.emailVerifications = store.emailVerifications || {});
      const existing = verifications[emailLower];
      const COOLDOWN_MS = 30 * 1000;
      const WINDOW_MS = 15 * 60 * 1000;

      if (existing && now - Number(existing.lastSentAt || 0) < COOLDOWN_MS) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((COOLDOWN_MS - (now - Number(existing.lastSentAt || 0))) / 1000)
        );
        return sendJson(req, res, 429, {
          code: 'RESEND_COOLDOWN',
          retryAfterSeconds,
          error: `Aguarde ${retryAfterSeconds}s antes de solicitar um novo código para este e-mail.`
        });
      }

      const recentHistory = Array.isArray(existing?.sendHistory)
        ? existing.sendHistory.filter((ts: number) => now - ts < WINDOW_MS)
        : [];
      if (recentHistory.length >= 6) {
        return sendJson(req, res, 429, {
          code: 'RATE_LIMITED',
          error: 'Muitas solicitações para este e-mail em poucos minutos. Aguarde antes de tentar novamente.'
        });
      }

      const code = String(crypto.randomInt(100000, 1000000));
      const emailDispatch = await dispatchVerificationEmail(cleanEmail, cleanName, code, 'registration');

      if (!emailDispatch.sent || !emailDispatch.emailId) {
        return sendJson(req, res, emailDispatch.statusCode || 502, {
          ok: false,
          code: emailDispatch.errorCode || 'EMAIL_SEND_FAILED',
          error: emailDispatch.errorMessage || 'Serviço de envio de e-mail indisponível.'
        });
      }

      const nowIso = new Date().toISOString();
      const expiresAt = now + 10 * 60 * 1000;

      if (existingEmailUser) {
        existingEmailUser.parentName = cleanName;
        existingEmailUser.username = cleanUser;
        existingEmailUser.usernameLower = cleanUser.toLowerCase();
        existingEmailUser.passwordHash = passwordHash;
        existingEmailUser.passwordSalt = passwordSalt;
        existingEmailUser.emailVerified = false;
        existingEmailUser.updatedAt = nowIso;
        store.users[existingEmailUser.id] = existingEmailUser;
      } else {
        const pendingUserId = `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        const pendingFamilyId = `fam_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        store.users[pendingUserId] = {
          id: pendingUserId,
          familyId: pendingFamilyId,
          parentName: cleanName,
          username: cleanUser,
          usernameLower: cleanUser.toLowerCase(),
          email: cleanEmail,
          emailLower,
          passwordHash,
          passwordSalt,
          emailVerified: false,
          createdAt: nowIso
        };
      }

      verifications[emailLower] = {
        email: cleanEmail,
        emailLower,
        codeHash: computeSha256Server(code, emailLower),
        expiresAt,
        attempts: 0,
        maxAttempts: 5,
        used: false,
        lastSentAt: now,
        sendHistory: [...recentHistory, now],
        smtpMessageId: emailDispatch.emailId,
        pendingRegistration: {
          parentName: cleanName,
          username: cleanUser,
          email: cleanEmail,
          passwordHash,
          passwordSalt,
          settings
        }
      };
      await saveStore(store);

      const statelessToken = signSignedPayload(verifications[emailLower], getStatelessCookieSecret());
      const secureFlag = isHttpsRequest(req) ? '; Secure' : '';
      res.setHeader(
        'Set-Cookie',
        `ak_reg_verify=${statelessToken}; Path=/api; Max-Age=600; HttpOnly; SameSite=Lax${secureFlag}`
      );

      return sendJson(req, res, 200, {
        ok: true,
        message: `Enviamos um código de verificação de 6 dígitos para ${cleanEmail}. Confira sua caixa de entrada e também a caixa de Spam (Lixo Eletrônico) do seu Gmail.`,
        deliveryMode: 'email_provider',
        provider: 'gmail_smtp',
        emailId: emailDispatch.emailId,
        smtpConfigured: true,
        expiresInMinutes: 10,
        expiresAt,
        cooldownSeconds: 30
      });
    }

    if (url === '/api/auth/confirm-email-verification' && req.method === 'POST') {
      const body = await parseBody(req);
      const cleanEmail = String(body.email || '').trim();
      const emailLower = cleanEmail.toLowerCase();
      const cleanCode = String(body.code || '').replace(/\D/g, '').trim();

      if (!cleanEmail || !/^\d{6}$/.test(cleanCode)) {
        return sendJson(req, res, 400, {
          ok: false,
          code: 'INVALID_CODE',
          error: 'Digite os 6 dígitos numéricos do código de verificação.'
        });
      }

      const verifications = (store.emailVerifications = store.emailVerifications || {});
      let record = verifications[emailLower];
      let fromCookieFallback = false;
      if (!record) {
        const cookies = parseCookies(req.headers.cookie);
        if (cookies.ak_reg_verify) {
          const decoded = verifySignedPayload(cookies.ak_reg_verify, getStatelessCookieSecret());
          if (decoded && decoded.emailLower === emailLower && decoded.pendingRegistration) {
            record = decoded;
            verifications[emailLower] = decoded;
            fromCookieFallback = true;
          }
        }
      }
      if (!record || record.used || !record.pendingRegistration) {
        return sendJson(req, res, 400, {
          ok: false,
          code: 'INVALID_CODE',
          error: 'Código de verificação inválido ou já utilizado. Solicite um novo código.'
        });
      }

      if (Date.now() > Number(record.expiresAt || 0)) {
        return sendJson(req, res, 410, {
          ok: false,
          code: 'EXPIRED_CODE',
          error: 'Este código de verificação expirou (limite de 10 minutos). Clique em reenviar código.'
        });
      }

      const secureFlag = isHttpsRequest(req) ? '; Secure' : '';
      const clearVerifyCookie = () => {
        res.setHeader('Set-Cookie', `ak_reg_verify=; Path=/api; Max-Age=0; HttpOnly; SameSite=Lax${secureFlag}`);
      };

      const maxAttempts = Number(record.maxAttempts || 5);
      if (Number(record.attempts || 0) >= maxAttempts) {
        record.used = true;
        await saveStore(store);
        clearVerifyCookie();
        return sendJson(req, res, 429, {
          ok: false,
          code: 'TOO_MANY_ATTEMPTS',
          error: 'Limite de tentativas excedido. Solicite um novo código para continuar.'
        });
      }

      const candidateHash = computeSha256Server(cleanCode, emailLower);
      if (!hashesEqual(candidateHash, record.codeHash)) {
        record.attempts = Number(record.attempts || 0) + 1;
        const remainingAttempts = Math.max(0, maxAttempts - record.attempts);
        if (remainingAttempts <= 0) {
          record.used = true;
          clearVerifyCookie();
        } else if (fromCookieFallback || isServerlessRuntime) {
          const updatedToken = signSignedPayload(record, getStatelessCookieSecret());
          res.setHeader(
            'Set-Cookie',
            `ak_reg_verify=${updatedToken}; Path=/api; Max-Age=600; HttpOnly; SameSite=Lax${secureFlag}`
          );
        }
        await saveStore(store);
        return sendJson(req, res, remainingAttempts <= 0 ? 429 : 400, {
          ok: false,
          code: remainingAttempts <= 0 ? 'TOO_MANY_ATTEMPTS' : 'INVALID_CODE',
          remainingAttempts,
          error:
            remainingAttempts <= 0
              ? 'Código invalidado após 5 tentativas incorretas. Solicite um novo código.'
              : `Código incorreto. Você ainda tem ${remainingAttempts} tentativa(s).`
        });
      }

      const pending = record.pendingRegistration;
      const existingEmailUser = Object.values(store.users).find((u: any) => u.emailLower === emailLower);
      if (existingEmailUser && existingEmailUser.emailVerified === true) {
        record.used = true;
        await saveStore(store);
        return sendJson(req, res, 409, {
          ok: false,
          code: 'DUPLICATE_EMAIL',
          error: 'Este e-mail já está cadastrado e verificado em outra conta familiar.'
        });
      }

      const duplicateUser = Object.values(store.users).find(
        (u: any) =>
          u.usernameLower === String(pending.username || '').trim().toLowerCase() &&
          u.emailLower !== emailLower &&
          isUserActiveOrPendingValid(store, u)
      );
      if (duplicateUser) {
        return sendJson(req, res, 409, {
          ok: false,
          code: 'DUPLICATE_USERNAME',
          error: 'Este nome de usuário acabou de ser utilizado. Corrija para outro usuário.'
        });
      }

      record.used = true;
      record.verifiedAt = Date.now();

      let session: any;
      let family: any;

      if (existingEmailUser) {
        const nowIso = new Date().toISOString();
        existingEmailUser.parentName = String(pending.parentName || existingEmailUser.parentName).trim();
        existingEmailUser.username = String(pending.username || existingEmailUser.username).trim();
        existingEmailUser.usernameLower = existingEmailUser.username.toLowerCase();
        existingEmailUser.passwordHash = pending.passwordHash;
        existingEmailUser.passwordSalt = pending.passwordSalt;
        existingEmailUser.emailVerified = true;
        existingEmailUser.emailVerifiedAt = nowIso;
        existingEmailUser.updatedAt = nowIso;
        store.users[existingEmailUser.id] = existingEmailUser;

        const reconciled = reconcileFamiliesForUser(store, existingEmailUser);
        family = reconciled.family || store.families[existingEmailUser.familyId];
        if (family) {
          family.familyAccount = {
            ...(family.familyAccount || {}),
            parentName: existingEmailUser.parentName,
            parentEmail: existingEmailUser.email,
            username: existingEmailUser.username,
            updatedAt: nowIso,
            settings:
              family.familyAccount?.settings && Object.keys(family.familyAccount.settings).length > 0
                ? family.familyAccount.settings
                : pending.settings
          };
          const list = Array.isArray(family.securityAuditLog) ? family.securityAuditLog : [];
          list.unshift({
            id: `sec_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
            timestamp: Date.now(),
            eventType: 'EMAIL_VERIFIED_REGISTRATION',
            details: `E-mail confirmado com código OTP de 6 dígitos (${existingEmailUser.email}).`
          });
          family.securityAuditLog = list.slice(0, 100);
          store.families[existingEmailUser.familyId] = family;
        }

        const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
        session = {
          token,
          familyId: existingEmailUser.familyId,
          userId: existingEmailUser.id,
          username: existingEmailUser.username,
          parentEmail: existingEmailUser.email,
          parentName: existingEmailUser.parentName,
          createdAt: Date.now(),
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
        };
        store.sessions[token] = session;
      } else {
        const created = createVerifiedAccountAndSession(pending);
        session = created.session;
        family = created.family;
      }

      await saveStore(store);
      clearVerifyCookie();

      return sendJson(req, res, 200, {
        ok: true,
        session,
        family
      });
    }

    if (url === '/api/auth/register' && req.method === 'POST') {
      const body = await parseBody(req);
      const { parentName, username, email, passwordHash, passwordSalt, settings, verificationCode } = body;
      const cleanName = String(parentName || '').trim();
      const cleanUser = String(username || '').trim();
      const cleanEmail = String(email || '').trim();
      const emailLower = cleanEmail.toLowerCase();

      if (!cleanName || cleanUser.length < 3 || !cleanEmail.includes('@') || !passwordHash || !passwordSalt) {
        return sendJson(req, res, 400, { error: 'Preencha todos os campos corretamente para criar a conta.' });
      }

      const cleanCode = String(verificationCode || '').replace(/\D/g, '').trim();
      const record = store.emailVerifications?.[emailLower];
      if (
        !cleanCode ||
        !record ||
        record.used ||
        Date.now() > Number(record.expiresAt || 0) ||
        Number(record.attempts || 0) >= Number(record.maxAttempts || 5) ||
        !hashesEqual(computeSha256Server(cleanCode, emailLower), record.codeHash)
      ) {
        return sendJson(req, res, 403, {
          code: 'EMAIL_VERIFICATION_REQUIRED',
          error: 'A verificação do e-mail por código de 6 dígitos é obrigatória para finalizar o cadastro.'
        });
      }

      const duplicateEmail = Object.values(store.users).find(
        (u: any) => u.emailLower === emailLower && u.emailVerified === true
      );
      if (duplicateEmail) {
        return sendJson(req, res, 409, { error: 'Este e-mail já está cadastrado em outra conta familiar.' });
      }

      const duplicateUser = Object.values(store.users).find(
        (u: any) =>
          u.usernameLower === cleanUser.toLowerCase() &&
          u.emailLower !== emailLower &&
          isUserActiveOrPendingValid(store, u)
      );
      if (duplicateUser) {
        return sendJson(req, res, 409, { error: 'Este nome de usuário já está em uso. Escolha outro!' });
      }

      record.used = true;
      record.verifiedAt = Date.now();
      const { session, family } = createVerifiedAccountAndSession({
        parentName: cleanName,
        username: cleanUser,
        email: cleanEmail,
        passwordHash,
        passwordSalt,
        settings
      });
      await saveStore(store);

      return sendJson(req, res, 200, { ok: true, session, family });
    }

    // --- 2. LOGIN / CHALLENGE / SESSION ---
    if (url === '/api/auth/challenge' && req.method === 'POST') {
      const body = await parseBody(req);
      const user = findUserByIdentifier(store.users, body.identifier);
      if (!user) {
        return sendJson(req, res, 404, { error: 'Conta não encontrada para este e-mail ou nome de usuário.' });
      }
      return sendJson(req, res, 200, { ok: true, userId: user.id, passwordSalt: user.passwordSalt });
    }

    if (url === '/api/auth/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const { identifier, passwordHash, legacyPasswordHash, password } = body;
      const cleanId = String(identifier || '').trim().toLowerCase();
      const clientIp = String(req.socket?.remoteAddress || 'local');
      const attemptKey = `${cleanId}|${clientIp}`;
      const attemptsMap = (store.loginAttempts = store.loginAttempts || {});
      const now = Date.now();
      const WINDOW_MS = 10 * 60 * 1000;
      const attemptRec = attemptsMap[attemptKey];

      if (attemptRec && attemptRec.lockUntil > now) {
        const retryAfterSeconds = Math.max(1, Math.ceil((attemptRec.lockUntil - now) / 1000));
        return sendJson(req, res, 429, {
          ok: false,
          code: 'TOO_MANY_ATTEMPTS',
          retryAfterSeconds,
          error: `Muitas tentativas incorretas de login. Aguarde ${retryAfterSeconds}s antes de tentar novamente.`
        });
      }

      const recordFailedLogin = async () => {
        const prev = attemptsMap[attemptKey];
        const withinWindow = prev && now - prev.windowStart < WINDOW_MS;
        const failedCount = withinWindow ? prev.failedCount + 1 : 1;
        const lockUntil = failedCount >= 5 ? now + 60 * 1000 : 0;
        attemptsMap[attemptKey] = {
          failedCount,
          windowStart: withinWindow ? prev.windowStart : now,
          lockUntil
        };
        await saveStore(store);
        if (lockUntil > now) {
          return sendJson(req, res, 429, {
            ok: false,
            code: 'TOO_MANY_ATTEMPTS',
            retryAfterSeconds: 60,
            error: 'Muitas tentativas incorretas de login. Aguarde 60s antes de tentar novamente.'
          });
        }
        return sendJson(req, res, 401, { error: 'E-mail/usuário ou senha incorretos.' });
      };

      const user = findUserByIdentifier(store.users, identifier);
      if (!user) {
        return await recordFailedLogin();
      }

      let validCredentials = false;
      let shouldUpgradeHashToSha256 = false;
      let upgradedHashValue = '';

      if (passwordHash && user.passwordHash === passwordHash) {
        validCredentials = true;
      } else if (legacyPasswordHash && user.passwordHash === legacyPasswordHash) {
        validCredentials = true;
        if (passwordHash && /^[0-9a-f]{64}$/i.test(String(passwordHash))) {
          shouldUpgradeHashToSha256 = true;
          upgradedHashValue = String(passwordHash);
        }
      } else if (typeof password === 'string' && password.length > 0 && user.passwordSalt) {
        const expectedSha = computeSha256Server(password, user.passwordSalt);
        const expectedLegacy = computeLegacyHashServer(password, user.passwordSalt);
        if (user.passwordHash === expectedSha) {
          validCredentials = true;
        } else if (user.passwordHash === expectedLegacy) {
          validCredentials = true;
          shouldUpgradeHashToSha256 = true;
          upgradedHashValue = expectedSha;
        }
      }

      if (!validCredentials) {
        return await recordFailedLogin();
      }

      if (user.emailVerified === false) {
        return sendJson(req, res, 403, {
          ok: false,
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email,
          error: 'Seu e-mail ainda não foi confirmado. Verifique o código de 6 dígitos enviado para o seu e-mail antes de fazer login.'
        });
      }

      delete attemptsMap[attemptKey];

      if (shouldUpgradeHashToSha256 && upgradedHashValue) {
        user.passwordHash = upgradedHashValue;
        store.users[user.id] = user;
      }

      const reconciled = reconcileFamiliesForUser(store, user);

      const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
      const session = {
        token,
        familyId: user.familyId,
        userId: user.id,
        username: user.username,
        parentEmail: user.email,
        parentName: user.parentName,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
      };
      store.sessions[token] = session;
      await saveStore(store);

      return sendJson(req, res, 200, {
        ok: true,
        session,
        family: reconciled.family || store.families[user.familyId] || null
      });
    }

    if (url.startsWith('/api/auth/session') && req.method === 'GET') {
      // Strictly read session token from headers (never expose session tokens in query URLs)
      const token = extractBearerToken(req);
      const session = token ? store.sessions[token] : null;
      if (!session || Date.now() > Number(session.expiresAt || 0)) {
        if (token && store.sessions[token]) {
          delete store.sessions[token];
          await saveStore(store);
        }
        return sendJson(req, res, 401, { error: 'Sessão inválida ou expirada.' });
      }
      const user = store.users[session.userId];
      if (user && user.emailVerified === false) {
        delete store.sessions[token];
        await saveStore(store);
        return sendJson(req, res, 403, {
          ok: false,
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email,
          error: 'Conta com e-mail ainda não verificado. Confirme seu e-mail para acessar.'
        });
      }
      let family = store.families[session.familyId] || null;
      if (user) {
        const reconciled = reconcileFamiliesForUser(store, user);
        family = reconciled.family;
        if (reconciled.changed) {
          await saveStore(store);
        }
      }
      return sendJson(req, res, 200, { ok: true, session, family });
    }

    if (url === '/api/auth/logout' && req.method === 'POST') {
      const body = await parseBody(req);
      const token = extractBearerToken(req) || String(body.token || '').trim();
      if (token && store.sessions[token]) {
        delete store.sessions[token];
        await saveStore(store);
      }
      return sendJson(req, res, 200, { ok: true });
    }

    // --- 3. PASSWORD RESET (RATE LIMITED & NON-ENUMERATING) ---
    if (url === '/api/auth/request-password-reset' && req.method === 'POST') {
      const body = await parseBody(req);
      const cleanId = String(body.identifier || '').trim();
      if (!cleanId) {
        return sendJson(req, res, 400, { ok: false, error: 'Informe o e-mail ou nome de usuário da conta.' });
      }

      const now = Date.now();
      const rateKey = cleanId.toLowerCase();
      const resetRateLimits = (store.passwordResetRateLimits = store.passwordResetRateLimits || {});
      const rateEntry = resetRateLimits[rateKey] || { lastSentAt: 0, sendHistory: [] };
      const COOLDOWN_MS = 30 * 1000;
      const WINDOW_MS = 15 * 60 * 1000;

      if (now - Number(rateEntry.lastSentAt || 0) < COOLDOWN_MS) {
        const retryAfterSeconds = Math.max(1, Math.ceil((COOLDOWN_MS - (now - Number(rateEntry.lastSentAt || 0))) / 1000));
        return sendJson(req, res, 429, {
          ok: false,
          code: 'RESEND_COOLDOWN',
          retryAfterSeconds,
          error: `Aguarde ${retryAfterSeconds}s antes de solicitar um novo código de recuperação.`
        });
      }

      const recentSends = (rateEntry.sendHistory || []).filter((ts: number) => now - ts < WINDOW_MS);
      if (recentSends.length >= 5) {
        return sendJson(req, res, 429, {
          ok: false,
          code: 'RATE_LIMITED',
          error: 'Limite de solicitações de recuperação atingido nos últimos minutos. Tente novamente mais tarde.'
        });
      }

      resetRateLimits[rateKey] = {
        lastSentAt: now,
        sendHistory: [...recentSends, now]
      };

      const user = findUserByIdentifier(store.users, cleanId);
      const resetStore = (store.passwordResets = store.passwordResets || {});
      let expiresAt: number | undefined;
      let emailId: string | undefined;

      if (user) {
        const code = String(crypto.randomInt(100000, 1000000));
        expiresAt = now + 15 * 60 * 1000;
        const emailDispatch = await dispatchVerificationEmail(
          user.email,
          user.parentName || 'Responsável',
          code,
          'password_reset'
        );
        if (!emailDispatch.sent || !emailDispatch.emailId) {
          return sendJson(req, res, emailDispatch.statusCode || 502, {
            ok: false,
            code: emailDispatch.errorCode || 'EMAIL_SEND_FAILED',
            error: emailDispatch.errorMessage || 'Serviço de envio de e-mail indisponível.'
          });
        }
        const saltKey = String(user.emailLower || user.id).trim().toLowerCase();
        resetStore[user.id] = {
          userId: user.id,
          email: user.email,
          codeHash: computeSha256Server(code, saltKey),
          expiresAt,
          attempts: 0,
          used: false,
          smtpMessageId: emailDispatch.emailId,
          createdAt: now
        };
        emailId = emailDispatch.emailId;
      }

      await saveStore(store);

      return sendJson(req, res, 200, {
        ok: true,
        message: user
          ? `Enviamos um código de verificação de 6 dígitos para ${user.email}. Confira sua caixa de entrada e também a caixa de Spam (Lixo Eletrônico) do seu Gmail.`
          : 'Se este e-mail ou usuário estiver cadastrado, enviamos um código de verificação de 6 dígitos para o seu e-mail (válido por 15 minutos). Confira sua caixa de entrada e também a caixa de Spam (Lixo Eletrônico) do seu Gmail.',
        deliveryMode: 'email_provider',
        provider: 'gmail_smtp',
        ...(emailId ? { emailId } : {}),
        smtpConfigured: true,
        expiresInMinutes: 15,
        ...(expiresAt ? { expiresAt } : {})
      });
    }

    if (url === '/api/auth/confirm-password-reset' && req.method === 'POST') {
      const body = await parseBody(req);
      const { identifier, code, newPassword, newPasswordHash, newPasswordSalt } = body;
      const cleanCode = String(code || '').trim();

      if (!identifier || !cleanCode) {
        return sendJson(req, res, 400, {
          ok: false,
          code: 'INVALID_LINK_OR_CODE',
          error: 'Informe seu e-mail/usuário e o código de 6 dígitos.'
        });
      }

      const user = findUserByIdentifier(store.users, identifier);
      const resetRecord = user ? store.passwordResets?.[user.id] : null;
      if (!user || !resetRecord || resetRecord.used) {
        return sendJson(req, res, 400, {
          ok: false,
          code: 'INVALID_LINK_OR_CODE',
          error: 'Código de verificação inválido, já utilizado ou conta não encontrada.'
        });
      }

      if (Date.now() > Number(resetRecord.expiresAt || 0)) {
        return sendJson(req, res, 410, {
          ok: false,
          code: 'EXPIRED_CODE',
          error: 'Este código de verificação expirou. Solicite um novo código.'
        });
      }

      const saltKey = String(user.emailLower || user.id).trim().toLowerCase();
      const expectedHash = resetRecord.codeHash
        ? String(resetRecord.codeHash)
        : resetRecord.code
        ? computeSha256Server(String(resetRecord.code), saltKey)
        : '';
      const candidateHash = computeSha256Server(cleanCode, saltKey);

      if (!expectedHash || !hashesEqual(candidateHash, expectedHash)) {
        resetRecord.attempts = Number(resetRecord.attempts || 0) + 1;
        if (resetRecord.attempts >= 5) {
          resetRecord.used = true;
        }
        await saveStore(store);
        return sendJson(req, res, 400, {
          ok: false,
          code: 'INVALID_LINK_OR_CODE',
          error: resetRecord.used
            ? 'Código invalidado por excesso de tentativas incorretas. Solicite um novo código.'
            : 'Código de verificação incorreto. Confira os 6 dígitos e tente novamente.'
        });
      }

      const resetPwdError = validatePasswordStrengthServer(typeof newPassword === 'string' ? newPassword : '');
      if (resetPwdError) {
        return sendJson(req, res, 400, {
          ok: false,
          code: 'WEAK_PASSWORD',
          error: resetPwdError
        });
      }

      let finalHash = newPasswordHash;
      let finalSalt = newPasswordSalt;
      if ((!finalHash || !finalSalt) && typeof newPassword === 'string') {
        finalSalt = crypto.randomBytes(16).toString('hex');
        finalHash = computeSha256Server(newPassword, finalSalt);
      }

      if (!finalHash || !finalSalt) {
        return sendJson(req, res, 400, {
          ok: false,
          code: 'INVALID_PASSWORD',
          error: 'Informe uma nova senha que atenda aos requisitos de segurança.'
        });
      }

      user.passwordHash = finalHash;
      user.passwordSalt = finalSalt;
      user.updatedAt = new Date().toISOString();
      store.users[user.id] = user;

      resetRecord.used = true;
      resetRecord.usedAt = Date.now();
      store.passwordResets = store.passwordResets || {};
      store.passwordResets[user.id] = resetRecord;

      const family = store.families[user.familyId];
      if (family) {
        const list = Array.isArray(family.securityAuditLog) ? family.securityAuditLog : [];
        list.unshift({
          id: `sec_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
          timestamp: Date.now(),
          eventType: 'PASSWORD_RESET',
          details: 'Senha da conta parental redefinida com validação por código.'
        });
        family.securityAuditLog = list.slice(0, 100);
      }

      await saveStore(store);
      return sendJson(req, res, 200, {
        ok: true,
        code: 'PASSWORD_CHANGED',
        message: 'Senha alterada com sucesso! Agora você pode entrar com sua nova senha.'
      });
    }

    if (url === '/api/auth/recover-password' && req.method === 'POST') {
      return sendJson(req, res, 400, {
        ok: false,
        code: 'VERIFICATION_REQUIRED',
        error: 'Para sua segurança, solicite um código de verificação via fluxo de recuperação antes de redefinir a senha.'
      });
    }

    // --- 4. PIN VERIFICATION & RECOVERY ---
    if (url === '/api/auth/verify-pin' && req.method === 'POST') {
      const body = await parseBody(req);
      const { familyId, pinHashCandidate, legacyPinHashCandidate } = body;
      if (!familyId) {
        return sendJson(req, res, 400, { error: 'familyId é obrigatório.' });
      }
      const auth = authorizeFamilyAccess(store, req, String(familyId), { allowPairedDevice: true });
      if (!auth.authorized) {
        return sendJson(req, res, auth.status || 401, { ok: false, code: auth.code, error: auth.error });
      }

      const family = store.families[familyId];
      if (!family || !family.familyAccount?.settings) {
        return sendJson(req, res, 404, { error: 'Família não encontrada no servidor.' });
      }

      const lockout = family.pinLockout || { failedAttempts: 0, lockUntil: 0, lockoutTier: 0 };
      const now = Date.now();
      if (lockout.lockUntil > now) {
        const remainingSeconds = Math.ceil((lockout.lockUntil - now) / 1000);
        return sendJson(req, res, 429, {
          ok: false,
          valid: false,
          locked: true,
          remainingSeconds,
          failedAttempts: lockout.failedAttempts
        });
      }

      const settings = family.familyAccount.settings;
      const auditList = Array.isArray(family.securityAuditLog) ? family.securityAuditLog : [];
      const addAudit = (eventType: string, details: string) => {
        auditList.unshift({
          id: `sec_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
          timestamp: Date.now(),
          eventType,
          details
        });
        family.securityAuditLog = auditList.slice(0, 100);
      };

      const matchesSha = Boolean(pinHashCandidate && pinHashCandidate === settings.pinHash);
      const matchesLegacy = Boolean(legacyPinHashCandidate && legacyPinHashCandidate === settings.pinHash);
      if (matchesSha || matchesLegacy) {
        if (matchesLegacy && pinHashCandidate && /^[0-9a-f]{64}$/i.test(String(pinHashCandidate))) {
          settings.pinHash = String(pinHashCandidate);
        }
        family.pinLockout = { failedAttempts: 0, lockUntil: 0, lockoutTier: 0 };
        addAudit('PIN_SUCCESS', 'PIN parental validado via servidor.');
        await saveStore(store);
        return sendJson(req, res, 200, {
          ok: true,
          valid: true,
          locked: false,
          remainingSeconds: 0,
          failedAttempts: 0
        });
      }

      const nextAttempts = (Number(lockout.failedAttempts) || 0) + 1;
      if (nextAttempts % 3 === 0) {
        const nextTier = (Number(lockout.lockoutTier) || 0) + 1;
        const durations = [15, 30, 60];
        const lockSec = durations[Math.min(nextTier - 1, durations.length - 1)];
        family.pinLockout = {
          failedAttempts: nextAttempts,
          lockUntil: now + lockSec * 1000,
          lockoutTier: nextTier
        };
        addAudit('PIN_LOCKOUT', `Bloqueio de ${lockSec}s após ${nextAttempts} tentativas incorretas.`);
        await saveStore(store);
        return sendJson(req, res, 429, {
          ok: false,
          valid: false,
          locked: true,
          remainingSeconds: lockSec,
          failedAttempts: nextAttempts
        });
      }

      family.pinLockout = {
        failedAttempts: nextAttempts,
        lockUntil: 0,
        lockoutTier: Number(lockout.lockoutTier) || 0
      };
      addAudit('PIN_FAILED', `Tentativa incorreta de PIN (${nextAttempts}ª falha).`);
      await saveStore(store);
      return sendJson(req, res, 401, {
        ok: false,
        valid: false,
        locked: false,
        remainingSeconds: 0,
        failedAttempts: nextAttempts
      });
    }

    if (url === '/api/auth/recover-pin' && req.method === 'POST') {
      const body = await parseBody(req);
      const { identifier, passwordHash, legacyPasswordHash, newPinHash, newPinSalt } = body;
      const user = findUserByIdentifier(store.users, identifier);
      if (!user) {
        return sendJson(req, res, 404, { error: 'Conta familiar não encontrada para verificação de identidade.' });
      }
      const family = store.families[user.familyId];
      const recordServerAudit = (eventType: string, details: string) => {
        if (!family) return;
        const list = Array.isArray(family.securityAuditLog) ? family.securityAuditLog : [];
        list.unshift({
          id: `sec_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
          timestamp: Date.now(),
          eventType,
          details
        });
        family.securityAuditLog = list.slice(0, 100);
      };

      const passwordMatches =
        Boolean(passwordHash && user.passwordHash === passwordHash) ||
        Boolean(legacyPasswordHash && user.passwordHash === legacyPasswordHash);
      if (!passwordMatches) {
        recordServerAudit('PIN_RECOVERY_FAILED', 'Tentativa de recuperação de PIN com senha parental incorreta.');
        await saveStore(store);
        return sendJson(req, res, 401, { error: 'Senha da conta parental incorreta.' });
      }

      if (!newPinHash || !newPinSalt) {
        return sendJson(req, res, 400, { error: 'Novo PIN inválido.' });
      }

      if (family) {
        if (family.familyAccount) {
          family.familyAccount.settings = {
            ...(family.familyAccount.settings || {}),
            pinHash: newPinHash,
            pinSalt: newPinSalt,
            isPinSet: true
          };
          family.familyAccount.updatedAt = new Date().toISOString();
        }
        family.pinLockout = { failedAttempts: 0, lockUntil: 0, lockoutTier: 0 };
        recordServerAudit('PIN_RECOVERED', 'PIN parental redefinido mediante verificação de senha da conta.');
        family.updatedAt = Date.now();
        store.families[user.familyId] = family;
      }

      await saveStore(store);
      return sendJson(req, res, 200, {
        ok: true,
        message: 'PIN redefinido com sucesso!',
        family: family || null
      });
    }

    // --- 5. PROTECTED FAMILY SYNC & DRAWINGS ---
    if (url === '/api/family/sync' && req.method === 'POST') {
      const body = await parseBody(req);
      const { familyId, state } = body;
      if (!familyId || !state) {
        return sendJson(req, res, 400, { error: 'Missing familyId or state' });
      }

      const auth = authorizeFamilyAccess(store, req, String(familyId), { allowPairedDevice: true });
      if (!auth.authorized) {
        return sendJson(req, res, auth.status || 401, { ok: false, code: auth.code, error: auth.error });
      }

      const existing = store.families[familyId] || {
        familyAccount: null,
        children: [],
        devices: [],
        journeys: {},
        emotions: [],
        gameRecords: [],
        activityCompletions: [],
        dailyPlays: {},
        timeTracking: {},
        syncEvents: [],
        drawings: [],
        deletedDrawingIds: [],
        updatedAt: Date.now()
      };

      const mergedChildrenMap = new Map<string, any>();
      (existing.children || []).forEach((c: any) => mergedChildrenMap.set(c.id, c));
      (state.children || []).forEach((c: any) => {
        const prev = mergedChildrenMap.get(c.id);
        if (!prev || new Date(c.updatedAt || 0) >= new Date(prev.updatedAt || 0)) {
          mergedChildrenMap.set(c.id, c);
        }
      });

      const mergedDevicesMap = new Map<string, any>();
      (existing.devices || []).forEach((d: any) => mergedDevicesMap.set(d.id, d));
      (state.devices || []).forEach((d: any) => {
        const prev = mergedDevicesMap.get(d.id);
        if (!prev || prev.status !== 'revoked') {
          mergedDevicesMap.set(d.id, d);
        }
      });

      const mergedJourneys = { ...(existing.journeys || {}), ...(state.journeys || {}) };
      Object.keys(mergedJourneys).forEach(k => {
        const exJ = existing.journeys?.[k];
        const stJ = state.journeys?.[k];
        if (exJ && stJ) {
          const exCompleted = (exJ.steps || []).filter((s: any) => s.status === 'completed').length;
          const stCompleted = (stJ.steps || []).filter((s: any) => s.status === 'completed').length;
          mergedJourneys[k] = stCompleted >= exCompleted ? stJ : exJ;
        }
      });

      const deletedDrawingIds = Array.from(
        new Set([...(existing.deletedDrawingIds || []), ...(state.deletedDrawingIds || [])])
      ).slice(-200);
      const deletedSet = new Set(deletedDrawingIds);
      const mergedDrawings = mergeById(existing.drawings, state.drawings, 120).filter(
        (d: any) => d && d.id && !deletedSet.has(d.id)
      );

      // Only parent Bearer sessions can alter parental familyAccount/settings
      const nextFamilyAccount =
        auth.actor === 'parent'
          ? state.familyAccount || existing.familyAccount
          : existing.familyAccount;

      store.families[familyId] = {
        familyAccount: nextFamilyAccount,
        children: Array.from(mergedChildrenMap.values()),
        devices: Array.from(mergedDevicesMap.values()),
        journeys: mergedJourneys,
        emotions: mergeById(existing.emotions, state.emotions),
        gameRecords: mergeById(existing.gameRecords, state.gameRecords),
        activityCompletions: mergeById(existing.activityCompletions, state.activityCompletions),
        dailyPlays: { ...(existing.dailyPlays || {}), ...(state.dailyPlays || {}) },
        timeTracking: { ...(existing.timeTracking || {}), ...(state.timeTracking || {}) },
        syncEvents: mergeById(existing.syncEvents, state.syncEvents),
        drawings: mergedDrawings,
        deletedDrawingIds,
        xpTransactions: mergeById(existing.xpTransactions, state.xpTransactions, 600),
        unlockedAchievements: mergeById(existing.unlockedAchievements, state.unlockedAchievements, 300),
        challengeProgress: mergeById(existing.challengeProgress, state.challengeProgress, 300),
        securityAuditLog: mergeById(existing.securityAuditLog, state.securityAuditLog, 100),
        pinLockout: existing.pinLockout || { failedAttempts: 0, lockUntil: 0, lockoutTier: 0 },
        updatedAt: Date.now()
      };

      await saveStore(store);
      return sendJson(req, res, 200, { ok: true, family: store.families[familyId] });
    }

    if (url.startsWith('/api/drawings') && req.method === 'GET') {
      const parsedUrl = new URL(url, 'http://localhost');
      const familyId = parsedUrl.searchParams.get('familyId') || '';
      const childId = parsedUrl.searchParams.get('childId') || '';
      if (!familyId) {
        return sendJson(req, res, 400, { error: 'Missing familyId' });
      }
      const auth = authorizeFamilyAccess(store, req, familyId, { allowPairedDevice: true });
      if (!auth.authorized) {
        return sendJson(req, res, auth.status || 401, { ok: false, code: auth.code, error: auth.error });
      }
      const family = store.families[familyId];
      if (!family) {
        return sendJson(req, res, 404, { error: 'Family not found' });
      }
      const list = (family.drawings || []).filter((d: any) => !childId || d.childId === childId);
      return sendJson(req, res, 200, { ok: true, drawings: list });
    }

    if (url === '/api/drawings' && req.method === 'POST') {
      const body = await parseBody(req);
      const { familyId, action, drawing, drawingId } = body;
      if (!familyId) {
        return sendJson(req, res, 400, { error: 'Missing familyId' });
      }
      const auth = authorizeFamilyAccess(store, req, String(familyId), { allowPairedDevice: true });
      if (!auth.authorized) {
        return sendJson(req, res, auth.status || 401, { ok: false, code: auth.code, error: auth.error });
      }

      const family = store.families[familyId];
      if (!family) {
        return sendJson(req, res, 404, { error: 'Family not found' });
      }
      const currentDrawings = Array.isArray(family.drawings) ? family.drawings : [];
      const deletedIds = Array.isArray(family.deletedDrawingIds) ? family.deletedDrawingIds : [];

      if (action === 'delete' && drawingId) {
        family.drawings = currentDrawings.filter((d: any) => d.id !== drawingId);
        family.deletedDrawingIds = Array.from(new Set([...deletedIds, drawingId])).slice(-200);
        family.updatedAt = Date.now();
        await saveStore(store);
        return sendJson(req, res, 200, { ok: true, drawings: family.drawings });
      }

      if (drawing && drawing.id) {
        family.drawings = mergeById(currentDrawings, [drawing], 120);
        family.deletedDrawingIds = deletedIds.filter((id: string) => id !== drawing.id);
        family.updatedAt = Date.now();
        await saveStore(store);
        return sendJson(req, res, 200, { ok: true, drawing, drawings: family.drawings });
      }

      return sendJson(req, res, 400, { error: 'Invalid drawing payload' });
    }

    if (url.startsWith('/api/family/state') && req.method === 'GET') {
      const parsedUrl = new URL(url, 'http://localhost');
      const familyId = parsedUrl.searchParams.get('familyId') || '';
      if (!familyId) {
        return sendJson(req, res, 400, { error: 'Missing familyId' });
      }
      const auth = authorizeFamilyAccess(store, req, familyId, { allowPairedDevice: true });
      if (!auth.authorized) {
        return sendJson(req, res, auth.status || 401, { ok: false, code: auth.code, error: auth.error });
      }
      if (!store.families[familyId]) {
        return sendJson(req, res, 404, { error: 'Family not found' });
      }
      return sendJson(req, res, 200, { ok: true, family: store.families[familyId] });
    }

    // --- 6. PAIRING & DEVICE MANAGEMENT ---
    if (url === '/api/pairing/create' && req.method === 'POST') {
      const body = await parseBody(req);
      const { session, familySnapshot } = body;
      if (!session || !session.code || !session.familyId) {
        return sendJson(req, res, 400, { error: 'Invalid pairing session' });
      }
      const auth = authorizeFamilyAccess(store, req, String(session.familyId), { allowPairedDevice: false });
      if (!auth.authorized) {
        return sendJson(req, res, auth.status || 401, { ok: false, code: auth.code, error: auth.error });
      }

      store.pairings[session.code] = session;
      if (familySnapshot && session.familyId) {
        store.families[session.familyId] = {
          ...(store.families[session.familyId] || {}),
          ...familySnapshot,
          updatedAt: Date.now()
        };
      }
      await saveStore(store);
      return sendJson(req, res, 200, { ok: true, session });
    }

    if (url === '/api/pairing/claim' && req.method === 'POST') {
      const body = await parseBody(req);
      const { code, token, deviceId, deviceName, platform } = body;
      const cleanCode = String(code || '').trim();
      const session =
        store.pairings[cleanCode] || Object.values(store.pairings).find((p: any) => p.token === token);

      if (!session) {
        return sendJson(req, res, 404, { error: 'Código de pareamento inválido ou não encontrado.' });
      }
      if (Date.now() > session.expiresAt || session.status === 'expired') {
        session.status = 'expired';
        await saveStore(store);
        return sendJson(req, res, 410, { error: 'Este código expirou. Gere um novo código no painel dos pais.' });
      }
      if (session.status === 'confirmed') {
        return sendJson(req, res, 409, { error: 'Este código de uso único já foi utilizado.' });
      }

      const claimSecret = `pclaim_${crypto.randomBytes(16).toString('hex')}`;
      session.status = 'claimed_pending_confirm';
      session.claimSecret = claimSecret;
      session.claimedDevice = {
        deviceId: deviceId || `dev_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
        deviceName: deviceName || 'Dispositivo Infantil',
        platform: platform || 'Web'
      };
      store.pairings[session.code] = session;
      await saveStore(store);

      return sendJson(req, res, 200, {
        ok: true,
        claimSecret,
        session: {
          code: session.code,
          familyId: session.familyId,
          childId: session.childId,
          childName: session.childName,
          childAvatar: session.childAvatar,
          status: session.status,
          claimedDevice: session.claimedDevice
        }
      });
    }

    if (url.startsWith('/api/pairing/status') && req.method === 'GET') {
      const parsedUrl = new URL(url, 'http://localhost');
      const code = parsedUrl.searchParams.get('code') || '';
      const session = store.pairings[code];
      if (!session) {
        return sendJson(req, res, 404, { error: 'Session not found' });
      }
      if (Date.now() > session.expiresAt && session.status === 'waiting') {
        session.status = 'expired';
        await saveStore(store);
      }

      const claimSecretHeader = String(req.headers['x-pairing-claim'] || '').trim();
      const parentAuth = authorizeFamilyAccess(store, req, String(session.familyId || ''), {
        allowPairedDevice: false
      });
      const isClaimer = Boolean(session.claimSecret && claimSecretHeader && hashesEqual(claimSecretHeader, session.claimSecret));

      let familyData: any = null;
      let deviceToken: string | undefined;
      if (session.status === 'confirmed' && (parentAuth.authorized || isClaimer)) {
        familyData = store.families[session.familyId] || null;
        if (isClaimer && session.issuedDeviceToken) {
          deviceToken = session.issuedDeviceToken;
        }
      }

      const safeSession = {
        code: session.code,
        familyId: session.familyId,
        childId: session.childId,
        childName: session.childName,
        childAvatar: session.childAvatar,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        status: session.status,
        claimedDevice: session.claimedDevice
      };

      return sendJson(req, res, 200, {
        ok: true,
        session: safeSession,
        familyData,
        ...(deviceToken ? { deviceToken } : {})
      });
    }

    if (url === '/api/pairing/confirm' && req.method === 'POST') {
      const body = await parseBody(req);
      const { code } = body;
      const session = store.pairings[code];
      if (!session) {
        return sendJson(req, res, 404, { error: 'Sessão não encontrada' });
      }

      const auth = authorizeFamilyAccess(store, req, String(session.familyId || ''), { allowPairedDevice: false });
      if (!auth.authorized) {
        return sendJson(req, res, auth.status || 401, { ok: false, code: auth.code, error: auth.error });
      }

      session.status = 'confirmed';
      const family = store.families[session.familyId];
      if (family && session.claimedDevice) {
        const deviceToken = `devtok_${crypto.randomBytes(24).toString('hex')}`;
        store.deviceTokens = store.deviceTokens || {};
        store.deviceTokens[deviceToken] = {
          token: deviceToken,
          familyId: session.familyId,
          deviceId: session.claimedDevice.deviceId,
          childId: session.childId,
          createdAt: Date.now()
        };
        session.issuedDeviceToken = deviceToken;

        const newDevice = {
          id: session.claimedDevice.deviceId,
          childId: session.childId,
          familyId: session.familyId,
          deviceName: session.claimedDevice.deviceName,
          platform: session.claimedDevice.platform,
          lastActiveAt: new Date().toISOString(),
          status: 'active',
          createdAt: new Date().toISOString()
        };
        family.devices = [...(family.devices || []).filter((d: any) => d.id !== newDevice.id), newDevice];
        family.updatedAt = Date.now();
      }
      store.pairings[code] = session;
      await saveStore(store);

      return sendJson(req, res, 200, {
        ok: true,
        session: {
          code: session.code,
          familyId: session.familyId,
          childId: session.childId,
          childName: session.childName,
          childAvatar: session.childAvatar,
          status: session.status,
          claimedDevice: session.claimedDevice
        },
        family: store.families[session.familyId]
      });
    }

    if (url === '/api/device/revoke' && req.method === 'POST') {
      const body = await parseBody(req);
      const { familyId, deviceId } = body;
      if (!familyId || !deviceId) {
        return sendJson(req, res, 400, { error: 'familyId e deviceId são obrigatórios.' });
      }
      const auth = authorizeFamilyAccess(store, req, String(familyId), { allowPairedDevice: false });
      if (!auth.authorized) {
        return sendJson(req, res, auth.status || 401, { ok: false, code: auth.code, error: auth.error });
      }

      const family = store.families[familyId];
      if (family && family.devices) {
        family.devices = family.devices.map((d: any) => (d.id === deviceId ? { ...d, status: 'revoked' } : d));
        family.updatedAt = Date.now();
      }
      if (store.deviceTokens) {
        for (const [tok, rec] of Object.entries(store.deviceTokens)) {
          if (rec.familyId === familyId && rec.deviceId === deviceId) {
            delete store.deviceTokens[tok];
          }
        }
      }
      await saveStore(store);
      return sendJson(req, res, 200, { ok: true });
    }

    // --- 7. REAL-TIME MULTIPLAYER GAME ROOMS (/api/games/rooms/*) ---
    if (url.startsWith('/api/games/rooms/')) {
      cleanupStaleRooms(store);
      const rooms = (store.gameRooms = store.gameRooms || {});

      if (url === '/api/games/rooms/create' && req.method === 'POST') {
        const body = await parseBody(req);
        const gameType = body.gameType === 'pato-ganso' ? 'pato-ganso' : 'morto-vivo';
        const playerId = String(body.playerId || `plr_${crypto.randomBytes(4).toString('hex')}`);
        const playerName = String(body.playerName || 'Jogador 1').trim().slice(0, 24);
        const avatarId = String(body.avatarId || 'Bibi');
        const roomCode = crypto
          .randomBytes(3)
          .toString('hex')
          .toUpperCase()
          .slice(0, 5);
        const now = Date.now();

        const room: MultiplayerGameRoom = {
          code: roomCode,
          gameType,
          familyId: body.familyId ? String(body.familyId) : undefined,
          hostPlayerId: playerId,
          phase: 'lobby',
          round: 1,
          command: 'vivo',
          roundIssuedAt: now,
          roundDeadlineAt: now + 6000,
          walkerIndex: 0,
          walkerStep: 0,
          gooseIndex: null,
          emptySeatIndex: 0,
          seatOrder: [0, 1, 2, 3, 4, 5],
          chaseRunnerProgress: 0,
          chaseGooseProgress: 0,
          lastEventMessage: `${playerName} abriu a sala! Compartilhe o código ${roomCode}.`,
          winnerPlayerId: null,
          players: [
            {
              playerId,
              name: playerName,
              avatarId,
              color: KID_ROOM_COLORS[0],
              isHost: true,
              ready: true,
              score: 0,
              lives: 3,
              posture: 'stand',
              seatIndex: 0,
              lastSeenAt: now
            }
          ],
          createdAt: now,
          updatedAt: now
        };

        rooms[roomCode] = room;
        await saveStore(store);
        return sendJson(req, res, 200, { ok: true, room, playerId });
      }

      if (url === '/api/games/rooms/join' && req.method === 'POST') {
        const body = await parseBody(req);
        const roomCode = String(body.code || '').trim().toUpperCase();
        const room = rooms[roomCode];
        if (!room) {
          return sendJson(req, res, 404, { ok: false, error: 'Sala não encontrada. Confira o código de 5 caracteres.' });
        }
        if (room.players.length >= 6) {
          return sendJson(req, res, 409, { ok: false, error: 'A sala já está cheia (máximo 6 jogadores).' });
        }

        const playerId = String(body.playerId || `plr_${crypto.randomBytes(4).toString('hex')}`);
        const playerName = String(body.playerName || `Jogador ${room.players.length + 1}`).trim().slice(0, 24);
        const avatarId = String(body.avatarId || 'Davi');
        const now = Date.now();

        const existing = room.players.find(p => p.playerId === playerId);
        if (existing) {
          existing.name = playerName;
          existing.avatarId = avatarId;
          existing.lastSeenAt = now;
        } else {
          const idx = room.players.length;
          room.players.push({
            playerId,
            name: playerName,
            avatarId,
            color: KID_ROOM_COLORS[idx % KID_ROOM_COLORS.length],
            isHost: false,
            ready: true,
            score: 0,
            lives: 3,
            posture: 'stand',
            seatIndex: idx,
            lastSeenAt: now
          });
          room.lastEventMessage = `${playerName} entrou na roda!`;
        }
        room.updatedAt = now;
        await saveStore(store);
        return sendJson(req, res, 200, { ok: true, room, playerId });
      }

      if (url.startsWith('/api/games/rooms/state') && req.method === 'GET') {
        const parsedUrl = new URL(url, 'http://localhost');
        const roomCode = String(parsedUrl.searchParams.get('code') || '').trim().toUpperCase();
        const playerId = parsedUrl.searchParams.get('playerId') || '';
        const room = rooms[roomCode];
        if (!room) {
          return sendJson(req, res, 404, { ok: false, error: 'Sala não encontrada ou encerrada.' });
        }
        if (playerId) {
          const plr = room.players.find(p => p.playerId === playerId);
          if (plr) plr.lastSeenAt = Date.now();
        }
        return sendJson(req, res, 200, { ok: true, room });
      }

      if (url === '/api/games/rooms/start' && req.method === 'POST') {
        const body = await parseBody(req);
        const roomCode = String(body.code || '').trim().toUpperCase();
        const playerId = String(body.playerId || '');
        const room = rooms[roomCode];
        if (!room) {
          return sendJson(req, res, 404, { ok: false, error: 'Sala não encontrada.' });
        }
        if (room.hostPlayerId !== playerId) {
          return sendJson(req, res, 403, { ok: false, error: 'Somente o anfitrião da sala pode iniciar a partida.' });
        }

        const now = Date.now();
        const cmd: 'vivo' | 'morto' = Math.random() > 0.45 ? 'vivo' : 'morto';
        room.phase = 'playing';
        room.round = 1;
        room.command = cmd;
        room.roundIssuedAt = now;
        room.roundDeadlineAt = now + 5000;
        room.walkerIndex = 0;
        room.walkerStep = 0;
        room.gooseIndex = null;
        room.emptySeatIndex = 0;
        room.seatOrder = [0, 1, 2, 3, 4, 5];
        room.chaseRunnerProgress = 0;
        room.chaseGooseProgress = 0;
        room.winnerPlayerId = null;
        room.players.forEach((p, idx) => {
          p.score = 0;
          p.lives = 3;
          p.posture = 'stand';
          p.seatIndex = idx;
          p.lastActionRound = 0;
          p.lastActionChoice = undefined;
        });
        room.lastEventMessage =
          room.gameType === 'morto-vivo'
            ? `Rodada 1 começou! O mestre falou: ${cmd.toUpperCase()}!`
            : `Partida começou! ${room.players[0]?.name || 'Pegador'} está andando na roda!`;
        room.updatedAt = now;
        await saveStore(store);
        return sendJson(req, res, 200, { ok: true, room });
      }

      if (url === '/api/games/rooms/action' && req.method === 'POST') {
        const body = await parseBody(req);
        const roomCode = String(body.code || '').trim().toUpperCase();
        const playerId = String(body.playerId || '');
        const room = rooms[roomCode];
        if (!room) {
          return sendJson(req, res, 404, { ok: false, error: 'Sala não encontrada.' });
        }
        const player = room.players.find(p => p.playerId === playerId);
        if (!player) {
          return sendJson(req, res, 403, { ok: false, error: 'Jogador não pertence a esta sala.' });
        }

        const now = Date.now();
        player.lastSeenAt = now;

        if (room.gameType === 'morto-vivo') {
          if (body.type === 'next_round' && room.hostPlayerId === playerId) {
            if (room.round >= 10) {
              room.phase = 'finished';
              room.lastEventMessage = 'Partida concluída! Parabéns a toda a turma!';
            } else {
              room.round += 1;
              room.command = Math.random() > 0.45 ? 'vivo' : 'morto';
              room.roundIssuedAt = now;
              room.roundDeadlineAt = now + 4500;
              room.players.forEach(p => {
                p.posture = 'stand';
                p.lastActionChoice = undefined;
              });
              room.lastEventMessage = `Rodada ${room.round}: ${room.command.toUpperCase()}!`;
            }
            room.updatedAt = now;
            await saveStore(store);
            return sendJson(req, res, 200, { ok: true, room });
          }

          if (body.type === 'posture' && (body.choice === 'vivo' || body.choice === 'morto')) {
            if (player.lastActionRound === room.round) {
              return sendJson(req, res, 200, { ok: true, room });
            }
            const choice = body.choice as 'vivo' | 'morto';
            player.lastActionRound = room.round;
            player.lastActionChoice = choice;
            player.posture = choice === 'vivo' ? 'vivo_jump' : 'morto_crouch';
            if (choice === room.command) {
              player.score += 100;
            } else {
              player.lives = Math.max(0, player.lives - 1);
            }
            room.lastEventMessage = `${player.name} escolheu ${choice.toUpperCase()}!`;
            room.updatedAt = now;
            await saveStore(store);
            return sendJson(req, res, 200, { ok: true, room });
          }
        }

        if (room.gameType === 'pato-ganso') {
          const walkerPlayer = room.players[room.walkerIndex];
          if (body.type === 'pato' && walkerPlayer?.playerId === playerId && room.phase === 'playing') {
            room.walkerStep = (room.walkerStep + 1) % 6;
            const seatTarget = room.seatOrder[room.walkerStep];
            const targetPlayer = room.players[seatTarget];
            room.lastEventMessage = `${player.name} falou: Pato... (${targetPlayer?.name || 'Amigo'})`;
            room.updatedAt = now;
            await saveStore(store);
            return sendJson(req, res, 200, { ok: true, room });
          }

          if (body.type === 'ganso' && walkerPlayer?.playerId === playerId && room.phase === 'playing') {
            const targetIdx =
              typeof body.targetIndex === 'number'
                ? body.targetIndex
                : room.seatOrder[(room.walkerStep + 1) % 6];
            room.gooseIndex = targetIdx;
            room.phase = 'chasing';
            room.chaseRunnerProgress = 0.08;
            room.chaseGooseProgress = 0.04;
            const gooseName = room.players[targetIdx]?.name || `Amigo ${targetIdx + 1}`;
            room.lastEventMessage = `${player.name} gritou GANSO para ${gooseName}! Corram na roda!`;
            room.updatedAt = now;
            await saveStore(store);
            return sendJson(req, res, 200, { ok: true, room });
          }

          if (body.type === 'dash' && room.phase === 'chasing') {
            const plrIdx = room.players.findIndex(p => p.playerId === playerId);
            if (plrIdx === room.walkerIndex) {
              room.chaseRunnerProgress = Math.min(1, room.chaseRunnerProgress + 0.14);
            } else if (plrIdx === room.gooseIndex) {
              room.chaseGooseProgress = Math.min(1, room.chaseGooseProgress + 0.15);
            }
            if (room.chaseRunnerProgress >= 1 || room.chaseGooseProgress >= 1) {
              const runnerWon = room.chaseRunnerProgress >= room.chaseGooseProgress;
              const runner = room.players[room.walkerIndex];
              if (runner) {
                runner.score += runnerWon ? 160 : 80;
              }
              const oldGooseIdx = room.gooseIndex ?? ((room.walkerIndex + 1) % Math.max(2, room.players.length));
              const newWalker = runnerWon ? oldGooseIdx : room.walkerIndex;
              room.walkerIndex = newWalker;
              room.emptySeatIndex = newWalker;
              room.gooseIndex = null;
              room.phase = room.round >= 5 ? 'finished' : 'playing';
              room.round += 1;
              room.chaseRunnerProgress = 0;
              room.chaseGooseProgress = 0;
              room.lastEventMessage = runnerWon
                ? `${runner?.name || 'Corredor'} sentou primeiro no lugar vago! Agora é a vez do novo pegador!`
                : `O Ganso alcançou ${runner?.name || 'o corredor'}!`;
            }
            room.updatedAt = now;
            await saveStore(store);
            return sendJson(req, res, 200, { ok: true, room });
          }
        }

        return sendJson(req, res, 200, { ok: true, room });
      }

      if (url === '/api/games/rooms/leave' && req.method === 'POST') {
        const body = await parseBody(req);
        const roomCode = String(body.code || '').trim().toUpperCase();
        const playerId = String(body.playerId || '');
        const room = rooms[roomCode];
        if (room) {
          room.players = room.players.filter(p => p.playerId !== playerId);
          if (room.players.length === 0) {
            delete rooms[roomCode];
          } else if (room.hostPlayerId === playerId) {
            room.players[0].isHost = true;
            room.hostPlayerId = room.players[0].playerId;
          }
          await saveStore(store);
        }
        return sendJson(req, res, 200, { ok: true });
      }
    }

    return sendJson(req, res, 404, { error: 'API route not found' });
  };
}

export function createFamilySyncBackendPlugin(): Plugin {
  return {
    name: 'ajuda-kids-family-sync-backend',
    configureServer(server) {
      server.middlewares.use(createFamilyApiHandler({ rootDir: server.config.root }));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createFamilyApiHandler({ rootDir: server.config.root }));
    }
  };
}
