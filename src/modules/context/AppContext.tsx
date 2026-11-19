import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ChildProfile,
  ParentSettings,
  DailyJourney,
  DailyRewardStatus,
  EmotionType,
  EmotionEntry,
  FamilyAccount,
  ChildDevice,
  AuthSession,
  ChildProgressionSnapshot
} from '@/types';
import { storageService } from '@/services/storageService';
import { progressionService } from '@/services/progressionService';
import {
  authService,
  RegisterParentInput,
  LoginParentInput,
  RecoverPasswordInput,
  AuthResult,
  RequestRegistrationVerificationResult,
  ConfirmRegistrationVerificationResult,
  RequestPasswordResetResult,
  ConfirmPasswordResetInput,
  ConfirmPasswordResetResult
} from '@/services/authService';
import { journeyService } from '@/services/journeyService';
import { gamesService } from '@/services/gamesService';
import { audioService } from '@/services/audioService';
import { getTodayDateString } from '@/utils/dateUtils';

interface AppContextType {
  authSession: AuthSession | null;
  isAuthenticated: boolean;
  isPairedChildDevice: boolean;
  setPairedChildDevice: (paired: boolean) => void;
  registerParent: (input: RegisterParentInput) => Promise<AuthResult>;
  requestRegistrationVerification: (
    input: RegisterParentInput
  ) => Promise<RequestRegistrationVerificationResult>;
  confirmRegistrationVerification: (
    email: string,
    code: string
  ) => Promise<ConfirmRegistrationVerificationResult>;
  loginParent: (input: LoginParentInput) => Promise<AuthResult>;
  recoverParentPassword: (input: RecoverPasswordInput) => Promise<{ success: boolean; error?: string; message?: string }>;
  requestPasswordReset: (identifier: string) => Promise<RequestPasswordResetResult>;
  confirmPasswordReset: (input: ConfirmPasswordResetInput) => Promise<ConfirmPasswordResetResult>;
  logoutParent: () => Promise<void>;
  isFamilyHubOpen: boolean;
  setIsFamilyHubOpen: (open: boolean) => void;
  familyAccount: FamilyAccount | null;
  saveFamilyAccount: (account: FamilyAccount) => Promise<void>;
  childrenList: ChildProfile[];
  activeChild: ChildProfile | null;
  setActiveChild: (child: ChildProfile) => void;
  devicesList: ChildDevice[];
  revokeDevice: (deviceId: string) => Promise<void>;
  parentSettings: ParentSettings | null;
  isParentUnlocked: boolean;
  unlockParent: (pin: string) => Promise<{
    success: boolean;
    error?: string;
    locked?: boolean;
    remainingSeconds?: number;
    failedAttempts?: number;
  }>;
  recoverParentPinWithPassword: (
    password: string,
    newPin: string,
    identifier?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  lockParent: () => void;
  updateParentSettings: (settings: Partial<ParentSettings>) => Promise<void>;
  updateParentPin: (newPin: string) => Promise<void>;
  saveChildProfile: (child: ChildProfile) => Promise<void>;
  deleteChildProfile: (id: string) => Promise<void>;
  todayJourney: DailyJourney | null;
  refreshJourney: () => Promise<void>;
  rewardStatus: DailyRewardStatus | null;
  refreshRewards: () => Promise<void>;
  progression: ChildProgressionSnapshot | null;
  refreshProgression: () => Promise<void>;
  recordEmotion: (emotion: EmotionType, note?: string) => Promise<void>;
  todayEmotion: EmotionEntry | null;
  syncNow: () => Promise<void>;
  reloadAllFromStorage: () => Promise<void>;
  lastSyncAt: number | null;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isLoading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PAIRED_CHILD_DEVICE_KEY = 'ajuda_kids_paired_child_device_v3';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [isPairedChildDevice, setIsPairedChildDeviceState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PAIRED_CHILD_DEVICE_KEY) === 'true';
    }
    return false;
  });
  const [isFamilyHubOpen, setIsFamilyHubOpen] = useState<boolean>(false);
  const [familyAccount, setFamilyAccountState] = useState<FamilyAccount | null>(null);
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [activeChild, setActiveChildState] = useState<ChildProfile | null>(null);
  const [devicesList, setDevicesList] = useState<ChildDevice[]>([]);
  const [parentSettings, setParentSettings] = useState<ParentSettings | null>(null);
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);
  const [todayJourney, setTodayJourney] = useState<DailyJourney | null>(null);
  const [rewardStatus, setRewardStatus] = useState<DailyRewardStatus | null>(null);
  const [todayEmotion, setTodayEmotion] = useState<EmotionEntry | null>(null);
  const [progression, setProgression] = useState<ChildProgressionSnapshot | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ajuda_kids_theme_v7');
      return saved === 'dark';
    }
    return false;
  });

  const setPairedChildDevice = useCallback((paired: boolean) => {
    setIsPairedChildDeviceState(paired);
    if (typeof window !== 'undefined') {
      if (paired) {
        localStorage.setItem(PAIRED_CHILD_DEVICE_KEY, 'true');
      } else {
        localStorage.removeItem(PAIRED_CHILD_DEVICE_KEY);
      }
    }
  }, []);

  const applyThemeDomAndStorage = useCallback((mode: 'light' | 'dark', syncRemote: boolean) => {
    const dark = mode === 'dark';
    setIsDarkMode(dark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ajuda_kids_theme_v7', mode);
      document.documentElement.classList.toggle('dark', dark);
    }
    if (syncRemote && storageService.getFamilyAccount()?.id) {
      storageService
        .saveParentSettings({ themePreference: mode })
        .then((updated) => setParentSettings(updated))
        .catch(() => {
          // ignore offline remote theme sync failures
        });
    }
  }, []);

  const setThemeMode = useCallback(
    (mode: 'light' | 'dark') => {
      applyThemeDomAndStorage(mode, true);
    },
    [applyThemeDomAndStorage]
  );

  const toggleDarkMode = useCallback(() => {
    const nextDark = !isDarkMode;
    const nextMode: 'light' | 'dark' = nextDark ? 'dark' : 'light';
    setIsDarkMode(nextDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ajuda_kids_theme_v7', nextMode);
      document.documentElement.classList.toggle('dark', nextDark);
    }
    if (storageService.getFamilyAccount()?.id) {
      storageService
        .saveParentSettings({ themePreference: nextMode })
        .then((updated) => setParentSettings(updated))
        .catch(() => {});
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const reloadAllFromStorage = useCallback(async () => {
    const isEqual = <T,>(a: T, b: T): boolean => {
      if (Object.is(a, b)) return true;
      try {
        return JSON.stringify(a) === JSON.stringify(b);
      } catch {
        return false;
      }
    };

    const fam = storageService.getFamilyAccount();
    setFamilyAccountState(prev => (isEqual(prev, fam) ? prev : fam));

    const settings = await storageService.getParentSettings();
    setParentSettings(prev => (isEqual(prev, settings) ? prev : settings));
    if (settings.themePreference === 'dark' || settings.themePreference === 'light') {
      const wantDark = settings.themePreference === 'dark';
      setIsDarkMode(prev => (prev === wantDark ? prev : wantDark));
      if (typeof window !== 'undefined') {
        localStorage.setItem('ajuda_kids_theme_v7', settings.themePreference);
        document.documentElement.classList.toggle('dark', wantDark);
      }
    }
    audioService.setPreferences(settings.soundEffectsEnabled, settings.voiceNarrationEnabled);

    const kids = await storageService.getChildren();
    setChildrenList(prev => (isEqual(prev, kids) ? prev : kids));

    const devs = storageService.getDevices();
    setDevicesList(prev => (isEqual(prev, devs) ? prev : devs));

    const activeId = storageService.getActiveChildId();
    const initialActive = kids.find(k => k.id === activeId) || kids[0] || null;
    if (initialActive) {
      setActiveChildState(prev => (isEqual(prev, initialActive) ? prev : initialActive));
      storageService.setActiveChildId(initialActive.id);
    } else {
      setActiveChildState(prev => (prev === null ? prev : null));
    }
  }, []);

  // Initial load
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const restoredSession = await authService.restoreSession();
      setAuthSession(restoredSession);

      if (restoredSession || localStorage.getItem(PAIRED_CHILD_DEVICE_KEY) === 'true') {
        await storageService.pullSyncFromServer();
        await reloadAllFromStorage();
        // When a parent opens with an authenticated session, open the Family Welcome Hub if no active child is chosen yet
        if (restoredSession && !localStorage.getItem('ajuda_kids_entered_child_mode')) {
          setIsFamilyHubOpen(true);
        }
      } else {
        await reloadAllFromStorage();
      }
      setLastSyncAt(Date.now());
    } catch (e) {
      console.error('Failed to initialize app data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [reloadAllFromStorage]);

  const registerParent = async (input: RegisterParentInput): Promise<AuthResult> => {
    const res = await authService.registerParent(input);
    if (res.success && res.session) {
      setAuthSession(res.session);
      setPairedChildDevice(false);
      await reloadAllFromStorage();
      setIsFamilyHubOpen(true);
      showToast(`Bem-vindo(a), ${res.session.parentName}!`);
    }
    return res;
  };

  const requestRegistrationVerification = async (
    input: RegisterParentInput
  ): Promise<RequestRegistrationVerificationResult> => {
    return authService.requestRegistrationVerification(input);
  };

  const confirmRegistrationVerification = async (
    email: string,
    code: string
  ): Promise<ConfirmRegistrationVerificationResult> => {
    const res = await authService.confirmRegistrationVerification(email, code);
    if (res.success && res.session) {
      setAuthSession(res.session);
      setPairedChildDevice(false);
      await reloadAllFromStorage();
      setIsFamilyHubOpen(true);
      showToast(`E-mail confirmado! Bem-vindo(a), ${res.session.parentName}!`);
    }
    return res;
  };

  const loginParent = async (input: LoginParentInput): Promise<AuthResult> => {
    const res = await authService.loginParent(input);
    if (res.success && res.session) {
      setAuthSession(res.session);
      setPairedChildDevice(false);
      await reloadAllFromStorage();
      setIsFamilyHubOpen(true);
      showToast(`Olá novamente, ${res.session.parentName}!`);
    }
    return res;
  };

  const recoverParentPassword = async (input: RecoverPasswordInput) => {
    return authService.recoverPassword(input);
  };

  const requestPasswordReset = async (identifier: string) => {
    return authService.requestPasswordReset(identifier);
  };

  const confirmPasswordReset = async (input: ConfirmPasswordResetInput) => {
    return authService.confirmPasswordReset(input);
  };

  const logoutParent = async () => {
    await authService.logoutParent();
    setAuthSession(null);
    setPairedChildDevice(false);
    setFamilyAccountState(null);
    setChildrenList([]);
    setActiveChildState(null);
    setDevicesList([]);
    setTodayJourney(null);
    setRewardStatus(null);
    setTodayEmotion(null);
    setProgression(null);
    setIsParentUnlocked(false);
    setIsFamilyHubOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ajuda_kids_entered_child_mode');
    }
    showToast('Sessão encerrada com segurança.');
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load journey, rewards, and emotions whenever active child changes
  const refreshActiveChildData = useCallback(async () => {
    if (!activeChild) {
      setTodayJourney(null);
      setRewardStatus(null);
      setTodayEmotion(null);
      setProgression(null);
      return;
    }

    try {
      const journey = await journeyService.getOrCreateTodayJourney(activeChild);
      setTodayJourney(journey);

      const rewards = await gamesService.getDailyRewardStatus(activeChild.id);
      setRewardStatus(rewards);

      const emotions = await storageService.getEmotions(activeChild.id);
      const today = getTodayDateString();
      const todayEmo = emotions.find(e => e.date === today) || null;
      setTodayEmotion(todayEmo);

      const prog = await progressionService.syncAndGetProgression(activeChild.id);
      setProgression(prog.snapshot);
    } catch (err) {
      console.error('Error refreshing child data:', err);
    }
  }, [activeChild]);

  useEffect(() => {
    refreshActiveChildData();
  }, [refreshActiveChildData]);

  // Real-time background synchronization across family devices
  const syncNow = useCallback(async () => {
    const pulled = await storageService.pullSyncFromServer();
    if (pulled) {
      await reloadAllFromStorage();
      await refreshActiveChildData();
      setLastSyncAt(Date.now());
    }
  }, [reloadAllFromStorage, refreshActiveChildData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (storageService.getFamilyAccount()?.id) {
        syncNow();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [syncNow]);

  const saveFamilyAccount = async (account: FamilyAccount) => {
    const saved = await storageService.saveFamilyAccount(account);
    setFamilyAccountState(saved);
    setDevicesList(storageService.getDevices());
    setLastSyncAt(Date.now());
  };

  const setActiveChild = (child: ChildProfile) => {
    setActiveChildState(child);
    storageService.setActiveChildId(child.id);
  };

  const revokeDevice = async (deviceId: string) => {
    await storageService.revokeDevice(deviceId);
    setDevicesList(storageService.getDevices());
    showToast('Acesso do dispositivo revogado.');
  };

  const unlockParent = async (pin: string): Promise<{
    success: boolean;
    error?: string;
    locked?: boolean;
    remainingSeconds?: number;
    failedAttempts?: number;
  }> => {
    if (!parentSettings) return { success: false, error: 'Configurações indisponíveis' };
    const result = await storageService.verifyParentPinWithRateLimit(pin);
    if (result.valid) {
      setIsParentUnlocked(true);
      audioService.playSuccess();
      return { success: true };
    }
    if (result.locked) {
      audioService.playBellTone(220, 0.35);
      return {
        success: false,
        locked: true,
        remainingSeconds: result.remainingSeconds,
        failedAttempts: result.failedAttempts,
        error: `Muitas tentativas incorretas. Aguarde ${result.remainingSeconds}s para tentar novamente.`
      };
    }
    audioService.playBellTone(280, 0.3);
    const left = Math.max(1, 3 - (result.failedAttempts % 3));
    return {
      success: false,
      locked: false,
      remainingSeconds: 0,
      failedAttempts: result.failedAttempts,
      error: `PIN incorreto. Restam ${left} tentativa(s) antes do bloqueio temporário.`
    };
  };

  const recoverParentPinWithPassword = async (
    password: string,
    newPin: string,
    identifier?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const res = await authService.recoverPinWithParentPassword(password, newPin, identifier);
    if (res.ok) {
      const updated = await storageService.getParentSettings();
      setParentSettings(updated);
      setIsParentUnlocked(true);
      audioService.playSuccess();
      setLastSyncAt(Date.now());
      showToast('PIN parental redefinido com segurança!');
    } else {
      audioService.playBellTone(240, 0.3);
    }
    return res;
  };

  const lockParent = () => {
    setIsParentUnlocked(false);
  };

  const updateParentSettings = async (settings: Partial<ParentSettings>) => {
    const updated = await storageService.saveParentSettings(settings);
    setParentSettings(updated);
    audioService.setPreferences(updated.soundEffectsEnabled, updated.voiceNarrationEnabled);
    if (activeChild) {
      const rewards = await gamesService.getDailyRewardStatus(activeChild.id);
      setRewardStatus(rewards);
    }
    setLastSyncAt(Date.now());
    showToast('Configurações salvas e sincronizadas!');
  };

  const updateParentPin = async (newPin: string) => {
    await storageService.updatePin(newPin);
    const updated = await storageService.getParentSettings();
    setParentSettings(updated);
    showToast('PIN de segurança atualizado!');
  };

  const saveChildProfile = async (child: ChildProfile) => {
    await storageService.saveChild(child);
    const kids = await storageService.getChildren();
    setChildrenList(kids);
    if (!activeChild || activeChild.id === child.id) {
      setActiveChildState(child);
      storageService.setActiveChildId(child.id);
    }
    setLastSyncAt(Date.now());
    showToast(`Perfil de ${child.name} salvo com carinho!`);
  };

  const deleteChildProfile = async (id: string) => {
    await storageService.deleteChild(id);
    const kids = await storageService.getChildren();
    setChildrenList(kids);
    const nextActive = kids[0] || null;
    setActiveChildState(nextActive);
    storageService.setActiveChildId(nextActive?.id || null);
    showToast('Perfil removido com segurança.');
  };

  const refreshProgression = async () => {
    if (activeChild) {
      const prog = await progressionService.syncAndGetProgression(activeChild.id);
      setProgression(prog.snapshot);
    }
  };

  const refreshJourney = async () => {
    if (activeChild) {
      const journey = await journeyService.getOrCreateTodayJourney(activeChild);
      setTodayJourney(journey);
      const prog = await progressionService.syncAndGetProgression(activeChild.id);
      setProgression(prog.snapshot);
      setLastSyncAt(Date.now());
    }
  };

  const refreshRewards = async () => {
    if (activeChild) {
      const rewards = await gamesService.getDailyRewardStatus(activeChild.id);
      setRewardStatus(rewards);
      const prog = await progressionService.syncAndGetProgression(activeChild.id);
      setProgression(prog.snapshot);
    }
  };

  const recordEmotion = async (emotion: EmotionType, note?: string) => {
    if (!activeChild) return;
    const today = getTodayDateString();
    const entry: EmotionEntry = {
      id: `emo_${Date.now()}`,
      childId: activeChild.id,
      date: today,
      timestamp: Date.now(),
      emotion,
      note
    };
    await storageService.recordEmotion(entry);
    setTodayEmotion(entry);
    const xpOutcome = await progressionService.recordEmotionXp(activeChild.id, today);
    setProgression(xpOutcome.snapshot);
    audioService.playGentlePop();
    const xpNote = xpOutcome.xpAdded > 0 ? ` (+${xpOutcome.xpAdded} XP)` : '';
    showToast(`Sentimento registrado com muito carinho!${xpNote}`);
  };

  return (
    <AppContext.Provider
      value={{
        authSession,
        isAuthenticated: Boolean(authSession),
        isPairedChildDevice,
        setPairedChildDevice,
        registerParent,
        requestRegistrationVerification,
        confirmRegistrationVerification,
        loginParent,
        recoverParentPassword,
        requestPasswordReset,
        confirmPasswordReset,
        logoutParent,
        isFamilyHubOpen,
        setIsFamilyHubOpen,
        familyAccount,
        saveFamilyAccount,
        childrenList,
        activeChild,
        setActiveChild,
        devicesList,
        revokeDevice,
        parentSettings,
        isParentUnlocked,
        unlockParent,
        recoverParentPinWithPassword,
        lockParent,
        updateParentSettings,
        updateParentPin,
        saveChildProfile,
        deleteChildProfile,
        todayJourney,
        refreshJourney,
        rewardStatus,
        refreshRewards,
        progression,
        refreshProgression,
        recordEmotion,
        todayEmotion,
        syncNow,
        reloadAllFromStorage,
        lastSyncAt,
        toastMessage,
        showToast,
        isLoading,
        isDarkMode,
        toggleDarkMode,
        setThemeMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
