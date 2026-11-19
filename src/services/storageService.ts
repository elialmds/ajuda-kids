import {
  ChildProfile,
  ParentSettings,
  DailyJourney,
  GamePlayRecord,
  EmotionEntry,
  FamilyAccount,
  ChildDevice,
  PairingSession,
  ActivityCompletionRecord,
  SyncEvent,
  PinLockoutState,
  SecurityAuditEntry,
  SavedDrawing,
  XpTransaction,
  UnlockedAchievement,
  ChallengeProgressRecord,
  ChallengePeriod
} from '@/types';
import { computeLegacyBitwiseHash, generateSalt, hashPin, verifyPin } from '@/utils/security';
import { getTodayDateString } from '@/utils/dateUtils';

const KEYS = {
  FAMILY_ACCOUNT: 'ajuda_kids_family_account_v3',
  SETTINGS: 'ajuda_kids_parent_settings_v1',
  CHILDREN: 'ajuda_kids_children_v1',
  ACTIVE_CHILD_ID: 'ajuda_kids_active_child_v1',
  DEVICES: 'ajuda_kids_devices_v3',
  THIS_DEVICE_ID: 'ajuda_kids_this_device_id_v3',
  PAIRING_SESSIONS: 'ajuda_kids_pairing_sessions_v3',
  JOURNEYS: 'ajuda_kids_journeys_v1',
  EMOTIONS: 'ajuda_kids_emotions_v1',
  GAME_RECORDS: 'ajuda_kids_game_records_v1',
  ACTIVITY_COMPLETIONS: 'ajuda_kids_activity_completions_v3',
  DAILY_PLAYS: 'ajuda_kids_daily_plays_v1',
  TIME_TRACKING: 'ajuda_kids_time_tracking_v1',
  SYNC_EVENTS: 'ajuda_kids_sync_events_v3',
  PIN_LOCKOUT: 'ajuda_kids_pin_lockout_v5',
  SECURITY_AUDIT_LOG: 'ajuda_kids_security_audit_v5',
  DRAWINGS: 'ajuda_kids_drawings_v6',
  DELETED_DRAWING_IDS: 'ajuda_kids_deleted_drawings_v6',
  ACTIVITY_PROGRESS: 'ajuda_kids_activity_progress_v6',
  XP_TRANSACTIONS: 'ajuda_kids_xp_transactions_v1',
  UNLOCKED_ACHIEVEMENTS: 'ajuda_kids_achievements_v1',
  CHALLENGE_PROGRESS: 'ajuda_kids_challenge_progress_v1',
  MIGRATION_V3_DONE: 'ajuda_kids_migration_v3_no_demo'
};

const DEMO_CHILD_IDS = new Set(['child_starter_1', 'child_starter_2', 'child_demo_1', 'demo_child']);
const AUTH_SESSION_STORAGE_KEY = 'ajuda_kids_auth_session_v3';
const PAIRED_DEVICE_TOKEN_KEY = 'ajuda_kids_paired_device_token_v1';
const PAIRING_CLAIM_SECRET_KEY = 'ajuda_kids_pairing_claim_secret_v1';

export class StorageService {
  private broadcastChannel: BroadcastChannel | null = null;

  private getApiAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { ...extra };
    if (typeof localStorage === 'undefined') return headers;
    try {
      const rawSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (rawSession) {
        const session = JSON.parse(rawSession);
        if (session?.token) {
          headers['Authorization'] = `Bearer ${session.token}`;
        }
      }
      const deviceToken = localStorage.getItem(PAIRED_DEVICE_TOKEN_KEY);
      if (deviceToken) {
        headers['X-Device-Token'] = deviceToken;
      }
    } catch {
      // ignore storage read error
    }
    return headers;
  }

  public clearPairedDeviceAuth(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(PAIRED_DEVICE_TOKEN_KEY);
    localStorage.removeItem(PAIRING_CLAIM_SECRET_KEY);
  }

  constructor() {
    this.migrateAndPurgeDemoData();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('ajuda_kids_family_sync_channel');
      } catch {
        // ignore if unsupported
      }
    }
  }

  /**
   * Removes any legacy starter/demo profiles ("child_starter_1" / "Lucas")
   * while preserving real profiles created by the user.
   */
  public migrateAndPurgeDemoData(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const rawChildren = localStorage.getItem(KEYS.CHILDREN);
      if (rawChildren) {
        const parsed: ChildProfile[] = JSON.parse(rawChildren);
        const realChildren = parsed.filter(c => !DEMO_CHILD_IDS.has(c.id));

        if (realChildren.length !== parsed.length) {
          localStorage.setItem(KEYS.CHILDREN, JSON.stringify(realChildren));

          const activeId = localStorage.getItem(KEYS.ACTIVE_CHILD_ID);
          if (activeId && DEMO_CHILD_IDS.has(activeId)) {
            if (realChildren.length > 0) {
              localStorage.setItem(KEYS.ACTIVE_CHILD_ID, realChildren[0].id);
            } else {
              localStorage.removeItem(KEYS.ACTIVE_CHILD_ID);
              localStorage.removeItem('ajuda_kids_setup_done');
            }
          }

          // Clean demo journeys
          const rawJourneys = localStorage.getItem(KEYS.JOURNEYS);
          if (rawJourneys) {
            const journeys: Record<string, DailyJourney> = JSON.parse(rawJourneys);
            Object.keys(journeys).forEach(k => {
              if (DEMO_CHILD_IDS.has(journeys[k]?.childId)) {
                delete journeys[k];
              }
            });
            localStorage.setItem(KEYS.JOURNEYS, JSON.stringify(journeys));
          }
        }
      }
      localStorage.setItem(KEYS.MIGRATION_V3_DONE, 'true');
    } catch (e) {
      console.error('Migration check failed:', e);
    }
  }

  // --- DEVICE IDENTITY ---
  public getThisDeviceId(): string {
    let devId = localStorage.getItem(KEYS.THIS_DEVICE_ID);
    if (!devId) {
      devId = `dev_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
      localStorage.setItem(KEYS.THIS_DEVICE_ID, devId);
    }
    return devId;
  }

  public detectPlatform(): ChildDevice['platform'] {
    if (typeof navigator === 'undefined') return 'Web';
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/i.test(ua)) return 'iOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/Win/i.test(ua)) return 'Windows';
    if (/Mac/i.test(ua)) return 'macOS';
    return 'Web';
  }

  public detectDeviceName(): string {
    const platform = this.detectPlatform();
    if (platform === 'iOS') return 'iPhone / iPad';
    if (platform === 'Android') return 'Smartphone Android';
    if (platform === 'Windows') return 'Computador Windows';
    if (platform === 'macOS') return 'Mac';
    return 'Navegador Web';
  }

  // --- FAMILY ACCOUNT ---
  public getFamilyAccount(): FamilyAccount | null {
    const raw = localStorage.getItem(KEYS.FAMILY_ACCOUNT);
    return raw ? JSON.parse(raw) : null;
  }

  public async saveFamilyAccount(account: FamilyAccount): Promise<FamilyAccount> {
    localStorage.setItem(KEYS.FAMILY_ACCOUNT, JSON.stringify(account));
    if (account.settings) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(account.settings));
    }
    await this.pushSyncToServer();
    return account;
  }

  // --- PARENT SETTINGS ---
  public async getParentSettings(): Promise<ParentSettings> {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
      const defaultSalt = generateSalt();
      const defaultHash = await hashPin('1234', defaultSalt);
      const initial: ParentSettings = {
        pinHash: defaultHash,
        pinSalt: defaultSalt,
        isPinSet: true,
        maxDailyMinutes: 30,
        allowedTimeRange: { start: '08:00', end: '20:30' },
        unlimitedGames: false,
        soundEffectsEnabled: true,
        voiceNarrationEnabled: true,
        notificationsEnabled: true,
        notificationTimes: ['09:00', '16:00'],
        reminderFrequency: 'daily'
      };
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  }

  public async saveParentSettings(settings: Partial<ParentSettings>): Promise<ParentSettings> {
    const current = await this.getParentSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));

    const family = this.getFamilyAccount();
    if (family) {
      family.settings = updated;
      family.updatedAt = new Date().toISOString();
      localStorage.setItem(KEYS.FAMILY_ACCOUNT, JSON.stringify(family));
    }

    await this.recordSyncEvent('settings_updated', '', { updatedKeys: Object.keys(settings) });
    return updated;
  }

  public async updatePin(newPin: string): Promise<void> {
    const salt = generateSalt();
    const hash = await hashPin(newPin, salt);
    await this.saveParentSettings({
      pinHash: hash,
      pinSalt: salt,
      isPinSet: true
    });
  }

  // --- PIN RATE LIMITING, LOCKOUT & SECURITY AUDIT LOG ---
  private loadPinLockoutRaw(): PinLockoutState {
    if (typeof localStorage === 'undefined') {
      return { failedAttempts: 0, lockUntil: 0, lockoutTier: 0 };
    }
    try {
      const raw = localStorage.getItem(KEYS.PIN_LOCKOUT);
      if (!raw) return { failedAttempts: 0, lockUntil: 0, lockoutTier: 0 };
      const parsed = JSON.parse(raw);
      return {
        failedAttempts: Number(parsed.failedAttempts) || 0,
        lockUntil: Number(parsed.lockUntil) || 0,
        lockoutTier: Number(parsed.lockoutTier) || 0
      };
    } catch {
      return { failedAttempts: 0, lockUntil: 0, lockoutTier: 0 };
    }
  }

  private savePinLockoutRaw(state: PinLockoutState): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(KEYS.PIN_LOCKOUT, JSON.stringify(state));
  }

  public getPinSecurityState(): {
    failedAttempts: number;
    lockUntil: number;
    remainingSeconds: number;
  } {
    const state = this.loadPinLockoutRaw();
    const now = Date.now();
    const remainingSeconds =
      state.lockUntil > now ? Math.ceil((state.lockUntil - now) / 1000) : 0;
    return {
      failedAttempts: state.failedAttempts,
      lockUntil: remainingSeconds > 0 ? state.lockUntil : 0,
      remainingSeconds
    };
  }

  public getSecurityAuditLog(): SecurityAuditEntry[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(KEYS.SECURITY_AUDIT_LOG);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async recordSecurityAudit(
    eventType: SecurityAuditEntry['eventType'],
    details: string
  ): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const entries = this.getSecurityAuditLog();
    const entry: SecurityAuditEntry = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      eventType,
      details
    };
    entries.unshift(entry);
    localStorage.setItem(KEYS.SECURITY_AUDIT_LOG, JSON.stringify(entries.slice(0, 100)));
  }

  public async verifyParentPinWithRateLimit(pin: string): Promise<{
    valid: boolean;
    locked: boolean;
    remainingSeconds: number;
    failedAttempts: number;
  }> {
    const state = this.loadPinLockoutRaw();
    const now = Date.now();

    if (state.lockUntil > now) {
      const remainingSeconds = Math.ceil((state.lockUntil - now) / 1000);
      return {
        valid: false,
        locked: true,
        remainingSeconds,
        failedAttempts: state.failedAttempts
      };
    }

    const settings = await this.getParentSettings();
    const pinHashCandidate = await hashPin(pin, settings.pinSalt);
    let isValid = await verifyPin(pin, settings.pinSalt, settings.pinHash);

    // Server-side verification & rate limit check when online
    const family = this.getFamilyAccount();
    if (
      family?.id &&
      typeof fetch !== 'undefined' &&
      typeof window !== 'undefined' &&
      window.location?.origin?.startsWith('http')
    ) {
      try {
        const legacyPinHashCandidate = computeLegacyBitwiseHash(pin, settings.pinSalt);
        const resp = await fetch('/api/auth/verify-pin', {
          method: 'POST',
          headers: this.getApiAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            familyId: family.id,
            pinHashCandidate,
            legacyPinHashCandidate
          })
        });
        if (resp.status !== 404) {
          const data = await resp.json();
          if (data.locked) {
            const lockSec = Number(data.remainingSeconds) || 15;
            const nextState: PinLockoutState = {
              failedAttempts: Number(data.failedAttempts) || state.failedAttempts + 1,
              lockUntil: Date.now() + lockSec * 1000,
              lockoutTier: state.lockoutTier + 1
            };
            this.savePinLockoutRaw(nextState);
            await this.recordSecurityAudit(
              'PIN_LOCKOUT',
              `Bloqueio de ${lockSec}s ativado no servidor após tentativas incorretas.`
            );
            return {
              valid: false,
              locked: true,
              remainingSeconds: lockSec,
              failedAttempts: nextState.failedAttempts
            };
          }
          if (resp.ok && typeof data.valid === 'boolean') {
            isValid = data.valid;
          }
        }
      } catch {
        // Offline / local fallback continues below
      }
    }

    if (isValid) {
      this.savePinLockoutRaw({ failedAttempts: 0, lockUntil: 0, lockoutTier: 0 });
      await this.recordSecurityAudit('PIN_SUCCESS', 'PIN parental validado com sucesso.');
      return { valid: true, locked: false, remainingSeconds: 0, failedAttempts: 0 };
    }

    const nextAttempts = state.failedAttempts + 1;
    if (nextAttempts % 3 === 0) {
      const nextTier = state.lockoutTier + 1;
      const durations = [15, 30, 60];
      const lockSec = durations[Math.min(nextTier - 1, durations.length - 1)];
      const nextState: PinLockoutState = {
        failedAttempts: nextAttempts,
        lockUntil: Date.now() + lockSec * 1000,
        lockoutTier: nextTier
      };
      this.savePinLockoutRaw(nextState);
      await this.recordSecurityAudit(
        'PIN_LOCKOUT',
        `Bloqueio temporário de ${lockSec}s após ${nextAttempts} tentativas incorretas de PIN.`
      );
      return {
        valid: false,
        locked: true,
        remainingSeconds: lockSec,
        failedAttempts: nextAttempts
      };
    }

    this.savePinLockoutRaw({
      failedAttempts: nextAttempts,
      lockUntil: 0,
      lockoutTier: state.lockoutTier
    });
    await this.recordSecurityAudit(
      'PIN_FAILED',
      `Tentativa incorreta de PIN (${nextAttempts}ª falha).`
    );
    return {
      valid: false,
      locked: false,
      remainingSeconds: 0,
      failedAttempts: nextAttempts
    };
  }

  public async resetParentPinVerified(
    newPin: string,
    reason: string,
    precomputed?: { salt: string; hash: string }
  ): Promise<void> {
    if (!/^\d{4}$/.test(newPin)) {
      throw new Error('O novo PIN deve conter exatamente 4 dígitos numéricos.');
    }
    const salt = precomputed?.salt || generateSalt();
    const hash = precomputed?.hash || (await hashPin(newPin, salt));
    await this.saveParentSettings({
      pinHash: hash,
      pinSalt: salt,
      isPinSet: true
    });
    this.savePinLockoutRaw({ failedAttempts: 0, lockUntil: 0, lockoutTier: 0 });
    await this.recordSecurityAudit(
      'PIN_RECOVERED',
      `PIN redefinido com verificação de identidade (${reason}).`
    );
  }

  // --- CHILDREN PROFILES (NO PRE-REGISTERED CHILDREN!) ---
  public async getChildren(): Promise<ChildProfile[]> {
    this.migrateAndPurgeDemoData();
    const raw = localStorage.getItem(KEYS.CHILDREN);
    if (!raw) {
      return [];
    }
    try {
      const list: ChildProfile[] = JSON.parse(raw);
      return list.filter(c => !DEMO_CHILD_IDS.has(c.id));
    } catch {
      return [];
    }
  }

  public async saveChild(child: ChildProfile): Promise<void> {
    const children = await this.getChildren();
    const family = this.getFamilyAccount();
    const enrichedChild: ChildProfile = {
      ...child,
      familyId: child.familyId || family?.id || 'fam_default',
      updatedAt: new Date().toISOString()
    };

    const index = children.findIndex(c => c.id === enrichedChild.id);
    if (index >= 0) {
      children[index] = enrichedChild;
    } else {
      children.push({
        ...enrichedChild,
        createdAt: enrichedChild.createdAt || new Date().toISOString()
      });
    }
    localStorage.setItem(KEYS.CHILDREN, JSON.stringify(children));
    await this.recordSyncEvent('profile_updated', enrichedChild.id, { name: enrichedChild.name });
  }

  public async deleteChild(childId: string): Promise<void> {
    const children = await this.getChildren();
    const filtered = children.filter(c => c.id !== childId);
    localStorage.setItem(KEYS.CHILDREN, JSON.stringify(filtered));

    if (this.getActiveChildId() === childId) {
      this.setActiveChildId(filtered.length > 0 ? filtered[0].id : null);
    }
    await this.pushSyncToServer();
  }

  public getActiveChildId(): string | null {
    return localStorage.getItem(KEYS.ACTIVE_CHILD_ID);
  }

  public setActiveChildId(childId: string | null): void {
    if (childId) {
      localStorage.setItem(KEYS.ACTIVE_CHILD_ID, childId);
    } else {
      localStorage.removeItem(KEYS.ACTIVE_CHILD_ID);
    }
  }

  // --- CHILD DEVICES ---
  public getDevices(): ChildDevice[] {
    const raw = localStorage.getItem(KEYS.DEVICES);
    return raw ? JSON.parse(raw) : [];
  }

  public saveDevice(device: ChildDevice): void {
    const devices = this.getDevices();
    const idx = devices.findIndex(d => d.id === device.id);
    if (idx >= 0) {
      devices[idx] = device;
    } else {
      devices.push(device);
    }
    localStorage.setItem(KEYS.DEVICES, JSON.stringify(devices));
  }

  public async revokeDevice(deviceId: string): Promise<void> {
    const devices = this.getDevices().map(d =>
      d.id === deviceId ? { ...d, status: 'revoked' as const } : d
    );
    localStorage.setItem(KEYS.DEVICES, JSON.stringify(devices));
    const family = this.getFamilyAccount();
    if (family) {
      try {
        await fetch('/api/device/revoke', {
          method: 'POST',
          headers: this.getApiAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ familyId: family.id, deviceId })
        });
      } catch {
        // offline fallback
      }
    }
    await this.recordSyncEvent('device_revoked', '', { deviceId });
  }

  // --- PAIRING SESSIONS (QR CODE & 6-DIGIT SINGLE-USE CODE) ---
  public async createPairingSession(child: ChildProfile): Promise<PairingSession> {
    const family = this.getFamilyAccount();
    const familyId = family?.id || child.familyId || `fam_${Date.now()}`;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = `pair_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`;
    const now = Date.now();

    const session: PairingSession = {
      code,
      token,
      familyId,
      childId: child.id,
      childName: child.name,
      childAvatar: child.avatar,
      createdAt: now,
      expiresAt: now + 5 * 60 * 1000, // 5 minutes expiration
      status: 'waiting'
    };

    const raw = localStorage.getItem(KEYS.PAIRING_SESSIONS);
    const map: Record<string, PairingSession> = raw ? JSON.parse(raw) : {};
    map[code] = session;
    localStorage.setItem(KEYS.PAIRING_SESSIONS, JSON.stringify(map));

    // Register on server for cross-device QR / code claiming
    try {
      await fetch('/api/pairing/create', {
        method: 'POST',
        headers: this.getApiAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          session,
          familySnapshot: await this.buildFamilySnapshot()
        })
      });
    } catch {
      // works locally as well if offline
    }

    return session;
  }

  public async claimPairingCode(codeOrToken: string, customDeviceName?: string): Promise<{
    ok: boolean;
    error?: string;
    session?: Partial<PairingSession>;
  }> {
    const clean = codeOrToken.trim();
    const deviceId = this.getThisDeviceId();
    const platform = this.detectPlatform();
    const deviceName = customDeviceName?.trim() || this.detectDeviceName();

    try {
      const resp = await fetch('/api/pairing/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: clean,
          token: clean,
          deviceId,
          deviceName,
          platform
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        return { ok: false, error: data.error || 'Não foi possível validar o código.' };
      }
      if (data.claimSecret && typeof localStorage !== 'undefined') {
        localStorage.setItem(PAIRING_CLAIM_SECRET_KEY, String(data.claimSecret));
      }
      return { ok: true, session: data.session };
    } catch {
      // Fallback to local storage if testing on same browser
      const raw = localStorage.getItem(KEYS.PAIRING_SESSIONS);
      const map: Record<string, PairingSession> = raw ? JSON.parse(raw) : {};
      const found = map[clean] || Object.values(map).find(s => s.token === clean);
      if (!found) {
        return { ok: false, error: 'Código inválido ou não encontrado.' };
      }
      if (Date.now() > found.expiresAt) {
        return { ok: false, error: 'Este código temporário já expirou.' };
      }
      found.status = 'claimed_pending_confirm';
      found.claimedDevice = { deviceId, deviceName, platform };
      map[found.code] = found;
      localStorage.setItem(KEYS.PAIRING_SESSIONS, JSON.stringify(map));
      return { ok: true, session: found };
    }
  }

  public async checkPairingStatus(code: string): Promise<{
    session: PairingSession | null;
    familyData?: any;
  }> {
    try {
      const claimSecret =
        typeof localStorage !== 'undefined' ? localStorage.getItem(PAIRING_CLAIM_SECRET_KEY) : null;
      const resp = await fetch(`/api/pairing/status?code=${encodeURIComponent(code)}`, {
        headers: this.getApiAuthHeaders(claimSecret ? { 'X-Pairing-Claim': claimSecret } : {})
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.deviceToken && typeof localStorage !== 'undefined') {
          localStorage.setItem(PAIRED_DEVICE_TOKEN_KEY, String(data.deviceToken));
          localStorage.removeItem(PAIRING_CLAIM_SECRET_KEY);
        }
        return { session: data.session, familyData: data.familyData };
      }
    } catch {
      // fallback local
    }
    const raw = localStorage.getItem(KEYS.PAIRING_SESSIONS);
    const map: Record<string, PairingSession> = raw ? JSON.parse(raw) : {};
    return { session: map[code] || null };
  }

  public async confirmPairingSession(code: string): Promise<ChildDevice | null> {
    let confirmedSession: PairingSession | null = null;
    try {
      const resp = await fetch('/api/pairing/confirm', {
        method: 'POST',
        headers: this.getApiAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ code })
      });
      if (resp.ok) {
        const data = await resp.json();
        confirmedSession = data.session;
      }
    } catch {
      // fallback local
    }

    const raw = localStorage.getItem(KEYS.PAIRING_SESSIONS);
    const map: Record<string, PairingSession> = raw ? JSON.parse(raw) : {};
    const localSess = confirmedSession || map[code];
    if (!localSess) return null;

    localSess.status = 'confirmed';
    map[code] = localSess;
    localStorage.setItem(KEYS.PAIRING_SESSIONS, JSON.stringify(map));

    const newDevice: ChildDevice = {
      id: localSess.claimedDevice?.deviceId || `dev_${Date.now()}`,
      childId: localSess.childId,
      familyId: localSess.familyId,
      deviceName: localSess.claimedDevice?.deviceName || 'Dispositivo Infantil',
      platform: localSess.claimedDevice?.platform || 'Web',
      lastActiveAt: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.saveDevice(newDevice);
    await this.recordSyncEvent('device_paired', localSess.childId, {
      deviceName: newDevice.deviceName,
      platform: newDevice.platform
    });
    return newDevice;
  }

  public applyPairedFamilyData(familyData: any, assignedChildId: string): void {
    if (!familyData) return;
    if (familyData.familyAccount) {
      localStorage.setItem(KEYS.FAMILY_ACCOUNT, JSON.stringify(familyData.familyAccount));
      if (familyData.familyAccount.settings) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(familyData.familyAccount.settings));
      }
    }
    if (Array.isArray(familyData.children)) {
      localStorage.setItem(KEYS.CHILDREN, JSON.stringify(familyData.children));
    }
    if (Array.isArray(familyData.devices)) {
      localStorage.setItem(KEYS.DEVICES, JSON.stringify(familyData.devices));
    }
    if (familyData.journeys) {
      localStorage.setItem(KEYS.JOURNEYS, JSON.stringify(familyData.journeys));
    }
    this.setActiveChildId(assignedChildId);
    localStorage.setItem('ajuda_kids_setup_done', 'true');
  }

  // --- JOURNEYS ---
  public getAllJourneys(): Record<string, DailyJourney> {
    const raw = localStorage.getItem(KEYS.JOURNEYS);
    return raw ? JSON.parse(raw) : {};
  }

  public async getDailyJourney(childId: string, date: string): Promise<DailyJourney | null> {
    const journeys = this.getAllJourneys();
    const key = `${childId}_${date}`;
    return journeys[key] || null;
  }

  public async saveDailyJourney(journey: DailyJourney): Promise<void> {
    const journeys = this.getAllJourneys();
    const key = `${journey.childId}_${journey.date}`;
    journeys[key] = journey;
    localStorage.setItem(KEYS.JOURNEYS, JSON.stringify(journeys));
    await this.recordSyncEvent('journey_updated', journey.childId, {
      date: journey.date,
      isCompleted: journey.isCompleted,
      totalMinutesSpent: journey.totalMinutesSpent
    });
  }

  public async getCompletedJourneysCount(childId: string): Promise<number> {
    const journeys = this.getAllJourneys();
    return Object.values(journeys).filter(j => j.childId === childId && j.isCompleted).length;
  }

  public async getAllJourneysForChild(childId: string): Promise<DailyJourney[]> {
    const journeys = this.getAllJourneys();
    return Object.values(journeys).filter(j => j.childId === childId);
  }

  // --- ACTIVITY COMPLETIONS ---
  public getActivityCompletions(childId?: string): ActivityCompletionRecord[] {
    const raw = localStorage.getItem(KEYS.ACTIVITY_COMPLETIONS);
    const list: ActivityCompletionRecord[] = raw ? JSON.parse(raw) : [];
    return childId ? list.filter(item => item.childId === childId) : list;
  }

  public async recordActivityCompletion(record: Omit<ActivityCompletionRecord, 'id' | 'completedAt' | 'deviceId'>): Promise<ActivityCompletionRecord> {
    const list = this.getActivityCompletions();
    const fullRecord: ActivityCompletionRecord = {
      ...record,
      id: `act_comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      completedAt: new Date().toISOString(),
      deviceId: this.getThisDeviceId()
    };
    list.unshift(fullRecord);
    localStorage.setItem(KEYS.ACTIVITY_COMPLETIONS, JSON.stringify(list.slice(0, 300)));
    await this.recordSyncEvent('activity_completed', record.childId, {
      activityId: record.activityId,
      activityTitle: record.activityTitle,
      area: record.area,
      score: record.score
    });
    return fullRecord;
  }

  // --- DAILY GAME PLAYS (REWARD SYSTEM) ---
  private getAllDailyPlays(): Record<string, { plays: number; date: string }> {
    const raw = localStorage.getItem(KEYS.DAILY_PLAYS);
    return raw ? JSON.parse(raw) : {};
  }

  public async getDailyPlaysUsed(childId: string, date: string): Promise<number> {
    const all = this.getAllDailyPlays();
    const key = `${childId}_${date}`;
    return all[key]?.plays || 0;
  }

  public async incrementDailyPlays(childId: string, date: string): Promise<number> {
    const all = this.getAllDailyPlays();
    const key = `${childId}_${date}`;
    const current = all[key]?.plays || 0;
    const next = current + 1;
    all[key] = { plays: next, date };
    localStorage.setItem(KEYS.DAILY_PLAYS, JSON.stringify(all));
    await this.pushSyncToServer();
    return next;
  }

  // --- GAME PLAY RECORDS ---
  public async recordGamePlay(record: GamePlayRecord): Promise<void> {
    const raw = localStorage.getItem(KEYS.GAME_RECORDS);
    const records: GamePlayRecord[] = raw ? JSON.parse(raw) : [];
    const enriched = { ...record, deviceId: this.getThisDeviceId() };
    records.unshift(enriched);
    localStorage.setItem(KEYS.GAME_RECORDS, JSON.stringify(records.slice(0, 200)));
    await this.recordSyncEvent('game_played', record.childId, {
      gameId: record.gameId,
      score: record.score
    });
  }

  public async getGameHistory(childId: string): Promise<GamePlayRecord[]> {
    const raw = localStorage.getItem(KEYS.GAME_RECORDS);
    const records: GamePlayRecord[] = raw ? JSON.parse(raw) : [];
    return records.filter(r => r.childId === childId);
  }

  // --- EMOTIONS ---
  public async recordEmotion(entry: EmotionEntry): Promise<void> {
    const raw = localStorage.getItem(KEYS.EMOTIONS);
    const entries: EmotionEntry[] = raw ? JSON.parse(raw) : [];
    entries.unshift(entry);
    localStorage.setItem(KEYS.EMOTIONS, JSON.stringify(entries.slice(0, 200)));
    await this.recordSyncEvent('emotion_recorded', entry.childId, { emotion: entry.emotion });
  }

  public async getEmotions(childId: string): Promise<EmotionEntry[]> {
    const raw = localStorage.getItem(KEYS.EMOTIONS);
    const entries: EmotionEntry[] = raw ? JSON.parse(raw) : [];
    return entries.filter(e => e.childId === childId);
  }

  // --- TIME TRACKING ---
  public getTodayMinutesSpent(childId: string): number {
    const today = getTodayDateString();
    const raw = localStorage.getItem(KEYS.TIME_TRACKING);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    return map[`${childId}_${today}`] || 0;
  }

  public addTodayMinutesSpent(childId: string, minutes: number): number {
    const today = getTodayDateString();
    const raw = localStorage.getItem(KEYS.TIME_TRACKING);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    const key = `${childId}_${today}`;
    const updated = (map[key] || 0) + minutes;
    map[key] = updated;
    localStorage.setItem(KEYS.TIME_TRACKING, JSON.stringify(map));
    this.pushSyncToServer();
    return updated;
  }

  // --- REAL-TIME MULTI-DEVICE SYNC ENGINE ---
  public getSyncEvents(): SyncEvent[] {
    const raw = localStorage.getItem(KEYS.SYNC_EVENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public async recordSyncEvent(
    eventType: SyncEvent['eventType'],
    childId: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const family = this.getFamilyAccount();
    const familyId = family?.id || 'fam_default';
    const events = this.getSyncEvents();
    const ev: SyncEvent = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      familyId,
      childId,
      deviceId: this.getThisDeviceId(),
      eventType,
      payload,
      timestamp: Date.now()
    };
    events.unshift(ev);
    localStorage.setItem(KEYS.SYNC_EVENTS, JSON.stringify(events.slice(0, 150)));

    // Touch active timestamp on this device
    const myDevId = this.getThisDeviceId();
    const devices = this.getDevices();
    const myIdx = devices.findIndex(d => d.id === myDevId);
    if (myIdx >= 0) {
      devices[myIdx].lastActiveAt = new Date().toISOString();
      localStorage.setItem(KEYS.DEVICES, JSON.stringify(devices));
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'FAMILY_SYNC_UPDATE', familyId, event: ev });
      } catch {
        // ignore
      }
    }

    await this.pushSyncToServer();
  }

  // --- CREATIVE ATELIER DRAWINGS & PARTIAL ACTIVITY PROGRESS ---
  public getSavedDrawings(childId?: string): SavedDrawing[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(KEYS.DRAWINGS);
      const list: SavedDrawing[] = raw ? JSON.parse(raw) : [];
      const sorted = [...list].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );
      return childId ? sorted.filter(d => d.childId === childId) : sorted;
    } catch {
      return [];
    }
  }

  public async saveDrawing(drawing: SavedDrawing): Promise<SavedDrawing[]> {
    if (typeof localStorage === 'undefined') return [];
    const family = this.getFamilyAccount();
    const record: SavedDrawing = {
      ...drawing,
      familyId: family?.id || drawing.familyId,
      deviceId: this.getThisDeviceId(),
      updatedAt: new Date().toISOString()
    };
    const existing = this.getSavedDrawings();
    const idx = existing.findIndex(d => d.id === record.id);
    if (idx >= 0) existing[idx] = record;
    else existing.unshift(record);
    const trimmed = existing.slice(0, 120);
    localStorage.setItem(KEYS.DRAWINGS, JSON.stringify(trimmed));

    // Remove from deleted tombstones if re-saved
    try {
      const delRaw = localStorage.getItem(KEYS.DELETED_DRAWING_IDS);
      const delIds: string[] = delRaw ? JSON.parse(delRaw) : [];
      localStorage.setItem(
        KEYS.DELETED_DRAWING_IDS,
        JSON.stringify(delIds.filter(id => id !== record.id))
      );
    } catch {
      // ignore
    }

    if (family?.id && typeof fetch !== 'undefined' && typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
      try {
        await fetch('/api/drawings', {
          method: 'POST',
          headers: this.getApiAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ familyId: family.id, action: 'save', drawing: record })
        });
      } catch {
        // synced via pushSyncToServer fallback below
      }
    }
    await this.pushSyncToServer();
    return this.getSavedDrawings(record.childId);
  }

  public async deleteDrawing(drawingId: string, childId?: string): Promise<SavedDrawing[]> {
    if (typeof localStorage === 'undefined') return [];
    const family = this.getFamilyAccount();
    const filtered = this.getSavedDrawings().filter(d => d.id !== drawingId);
    localStorage.setItem(KEYS.DRAWINGS, JSON.stringify(filtered));

    try {
      const delRaw = localStorage.getItem(KEYS.DELETED_DRAWING_IDS);
      const delIds: string[] = delRaw ? JSON.parse(delRaw) : [];
      const nextDel = Array.from(new Set([...delIds, drawingId])).slice(-200);
      localStorage.setItem(KEYS.DELETED_DRAWING_IDS, JSON.stringify(nextDel));
    } catch {
      // ignore
    }

    if (family?.id && typeof fetch !== 'undefined' && typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
      try {
        await fetch('/api/drawings', {
          method: 'POST',
          headers: this.getApiAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ familyId: family.id, action: 'delete', drawingId })
        });
      } catch {
        // ignore
      }
    }
    await this.pushSyncToServer();
    return this.getSavedDrawings(childId);
  }

  public getActivityPartialProgress(
    childId: string,
    activityId: string
  ): { taskIndex: number; totalTasks: number; score: number } | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(KEYS.ACTIVITY_PROGRESS);
      const map: Record<string, { taskIndex: number; totalTasks: number; score: number }> = raw
        ? JSON.parse(raw)
        : {};
      return map[`${childId}:${activityId}`] || null;
    } catch {
      return null;
    }
  }

  public saveActivityPartialProgress(
    childId: string,
    activityId: string,
    taskIndex: number,
    totalTasks: number,
    score: number
  ): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(KEYS.ACTIVITY_PROGRESS);
      const map: Record<string, { taskIndex: number; totalTasks: number; score: number }> = raw
        ? JSON.parse(raw)
        : {};
      map[`${childId}:${activityId}`] = { taskIndex, totalTasks, score };
      localStorage.setItem(KEYS.ACTIVITY_PROGRESS, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  public clearActivityPartialProgress(childId: string, activityId: string): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(KEYS.ACTIVITY_PROGRESS);
      const map: Record<string, unknown> = raw ? JSON.parse(raw) : {};
      delete map[`${childId}:${activityId}`];
      localStorage.setItem(KEYS.ACTIVITY_PROGRESS, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  // --- PROGRESSION ENGINE (XP, ACHIEVEMENTS, CHALLENGES) ---
  public getXpTransactions(childId?: string): XpTransaction[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(KEYS.XP_TRANSACTIONS);
    const list: XpTransaction[] = raw ? JSON.parse(raw) : [];
    return childId ? list.filter(item => item.childId === childId) : list;
  }

  public async saveXpTransaction(tx: XpTransaction): Promise<{ saved: boolean; transactions: XpTransaction[] }> {
    const list = this.getXpTransactions();
    const duplicate = list.some(
      existing =>
        existing.childId === tx.childId &&
        existing.source === tx.source &&
        existing.sourceId === tx.sourceId
    );
    if (duplicate) {
      return { saved: false, transactions: this.getXpTransactions(tx.childId) };
    }
    const nextList = [tx, ...list].slice(0, 600);
    localStorage.setItem(KEYS.XP_TRANSACTIONS, JSON.stringify(nextList));
    return { saved: true, transactions: this.getXpTransactions(tx.childId) };
  }

  public getUnlockedAchievements(childId?: string): UnlockedAchievement[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(KEYS.UNLOCKED_ACHIEVEMENTS);
    const list: UnlockedAchievement[] = raw ? JSON.parse(raw) : [];
    return childId ? list.filter(item => item.childId === childId) : list;
  }

  public async saveUnlockedAchievement(rec: UnlockedAchievement): Promise<UnlockedAchievement[]> {
    const list = this.getUnlockedAchievements();
    const exists = list.some(
      a => a.childId === rec.childId && a.achievementId === rec.achievementId
    );
    if (!exists) {
      list.unshift({ ...rec, updatedAt: rec.updatedAt || rec.unlockedAt });
      localStorage.setItem(KEYS.UNLOCKED_ACHIEVEMENTS, JSON.stringify(list.slice(0, 300)));
    }
    return this.getUnlockedAchievements(rec.childId);
  }

  public getChallengeProgress(
    childId?: string,
    period?: ChallengePeriod,
    dateKey?: string
  ): ChallengeProgressRecord[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(KEYS.CHALLENGE_PROGRESS);
    const list: ChallengeProgressRecord[] = raw ? JSON.parse(raw) : [];
    return list.filter(item => {
      if (childId && item.childId !== childId) return false;
      if (period && item.period !== period) return false;
      if (dateKey && item.dateKey !== dateKey) return false;
      return true;
    });
  }

  public async upsertChallengeProgress(records: ChallengeProgressRecord[]): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const existing = this.getChallengeProgress();
    const map = new Map<string, ChallengeProgressRecord>();
    existing.forEach(item => map.set(item.id, item));
    records.forEach(item => map.set(item.id, item));
    const merged = Array.from(map.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 300);
    localStorage.setItem(KEYS.CHALLENGE_PROGRESS, JSON.stringify(merged));
  }

  private async buildFamilySnapshot() {
    const familyAccount = this.getFamilyAccount();
    const children = await this.getChildren();
    const devices = this.getDevices();
    const journeys = this.getAllJourneys();
    const emotionsRaw = localStorage.getItem(KEYS.EMOTIONS);
    const gameRecordsRaw = localStorage.getItem(KEYS.GAME_RECORDS);
    const completions = this.getActivityCompletions();
    const dailyPlays = this.getAllDailyPlays();
    const timeTrackingRaw = localStorage.getItem(KEYS.TIME_TRACKING);
    const syncEvents = this.getSyncEvents();
    const securityAuditLog = this.getSecurityAuditLog();
    const drawings = this.getSavedDrawings();
    const xpTransactions = this.getXpTransactions();
    const unlockedAchievements = this.getUnlockedAchievements();
    const challengeProgress = this.getChallengeProgress();
    let deletedDrawingIds: string[] = [];
    try {
      deletedDrawingIds = JSON.parse(localStorage.getItem(KEYS.DELETED_DRAWING_IDS) || '[]');
    } catch {
      deletedDrawingIds = [];
    }

    return {
      familyAccount,
      children,
      devices,
      journeys,
      emotions: emotionsRaw ? JSON.parse(emotionsRaw) : [],
      gameRecords: gameRecordsRaw ? JSON.parse(gameRecordsRaw) : [],
      activityCompletions: completions,
      dailyPlays,
      timeTracking: timeTrackingRaw ? JSON.parse(timeTrackingRaw) : {},
      syncEvents,
      securityAuditLog,
      drawings,
      deletedDrawingIds,
      xpTransactions,
      unlockedAchievements,
      challengeProgress
    };
  }

  public async pushSyncToServer(): Promise<boolean> {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return false;
    const family = this.getFamilyAccount();
    if (!family?.id) return false;

    try {
      const snapshot = await this.buildFamilySnapshot();
      const resp = await fetch('/api/family/sync', {
        method: 'POST',
        headers: this.getApiAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          familyId: family.id,
          state: snapshot
        })
      });
      return resp.ok;
    } catch {
      return false;
    }
  }

  public applyRemoteFamilyState(remote: any, overwriteAll = false): void {
    if (!remote) return;
    if (remote.familyAccount) {
      localStorage.setItem(KEYS.FAMILY_ACCOUNT, JSON.stringify(remote.familyAccount));
      if (remote.familyAccount.settings) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(remote.familyAccount.settings));
      }
    }
    if (Array.isArray(remote.children) && (overwriteAll || remote.children.length > 0)) {
      localStorage.setItem(KEYS.CHILDREN, JSON.stringify(remote.children));
    }
    if (Array.isArray(remote.devices)) {
      localStorage.setItem(KEYS.DEVICES, JSON.stringify(remote.devices));
    }
    if (remote.journeys) {
      localStorage.setItem(KEYS.JOURNEYS, JSON.stringify(remote.journeys));
    }
    if (Array.isArray(remote.emotions)) {
      localStorage.setItem(KEYS.EMOTIONS, JSON.stringify(remote.emotions));
    }
    if (Array.isArray(remote.gameRecords)) {
      localStorage.setItem(KEYS.GAME_RECORDS, JSON.stringify(remote.gameRecords));
    }
    if (Array.isArray(remote.activityCompletions)) {
      localStorage.setItem(KEYS.ACTIVITY_COMPLETIONS, JSON.stringify(remote.activityCompletions));
    }
    if (remote.dailyPlays) {
      localStorage.setItem(KEYS.DAILY_PLAYS, JSON.stringify(remote.dailyPlays));
    }
    if (remote.timeTracking) {
      localStorage.setItem(KEYS.TIME_TRACKING, JSON.stringify(remote.timeTracking));
    }
    if (Array.isArray(remote.syncEvents)) {
      localStorage.setItem(KEYS.SYNC_EVENTS, JSON.stringify(remote.syncEvents));
    }
    if (Array.isArray(remote.securityAuditLog)) {
      localStorage.setItem(KEYS.SECURITY_AUDIT_LOG, JSON.stringify(remote.securityAuditLog));
    }
    if (Array.isArray(remote.drawings)) {
      localStorage.setItem(KEYS.DRAWINGS, JSON.stringify(remote.drawings));
    }
    if (Array.isArray(remote.deletedDrawingIds)) {
      localStorage.setItem(KEYS.DELETED_DRAWING_IDS, JSON.stringify(remote.deletedDrawingIds));
    }
    if (Array.isArray(remote.xpTransactions)) {
      localStorage.setItem(KEYS.XP_TRANSACTIONS, JSON.stringify(remote.xpTransactions));
    }
    if (Array.isArray(remote.unlockedAchievements)) {
      localStorage.setItem(KEYS.UNLOCKED_ACHIEVEMENTS, JSON.stringify(remote.unlockedAchievements));
    }
    if (Array.isArray(remote.challengeProgress)) {
      localStorage.setItem(KEYS.CHALLENGE_PROGRESS, JSON.stringify(remote.challengeProgress));
    }
  }

  public async pullSyncFromServer(): Promise<boolean> {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return false;
    const family = this.getFamilyAccount();
    if (!family?.id) return false;

    try {
      const resp = await fetch(`/api/family/state?familyId=${encodeURIComponent(family.id)}`, {
        headers: this.getApiAuthHeaders()
      });
      if (resp.status === 403) {
        const errData = await resp.json().catch(() => null);
        if (errData?.code === 'DEVICE_REVOKED') {
          this.clearPairedDeviceAuth();
        }
        return false;
      }
      if (!resp.ok) return false;
      const data = await resp.json();
      if (!data.family) return false;
      this.applyRemoteFamilyState(data.family, false);
      return true;
    } catch {
      return false;
    }
  }

  // --- DATA MANAGEMENT (LGPD COMPLIANT) ---
  public exportAllData(): string {
    const data: Record<string, unknown> = {};
    Object.entries(KEYS).forEach(([name, key]) => {
      const val = localStorage.getItem(key);
      data[name] = val ? JSON.parse(val) : null;
    });
    return JSON.stringify(data, null, 2);
  }

  public clearAllData(): void {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('ajuda_kids_setup_done');
  }
}

export const storageService = new StorageService();
