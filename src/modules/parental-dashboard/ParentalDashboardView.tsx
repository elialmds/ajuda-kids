import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/modules/context/AppContext';
import { evolutionService } from '@/services/evolutionService';
import { storageService } from '@/services/storageService';
import {
  ACHIEVEMENTS_CATALOG,
  progressionService
} from '@/services/progressionService';
import {
  observationsService,
  ParentObservation
} from '@/services/observationsService';
import { getPasswordRequirementErrorMessage } from '@/services/authService';
import {
  EvolutionReport,
  ChildProfile,
  SkillArea,
  PairingSession,
  ActivityCompletionRecord,
  GamePlayRecord,
  DailyJourney,
  ChildProgressionSnapshot,
  UnlockedAchievement
} from '@/types';
import { ChildProfileModal } from '@/modules/child-profile/ChildProfileModal';
import { QrCodeDisplay } from '@/components/common/QrCodeDisplay';
import { KID_CHARACTERS, getCompanionBySkill } from '@/data/charactersData';
import { Button } from '@/components/common/Button';
import { AjudaKidsMascot } from '@/components/common/AjudaKidsMascot';
import {
  EliteInput,
  EliteSelect,
  EliteToggle,
  EliteRangeSlider
} from '@/design-system/EliteForms';
import {
  EliteWeeklyBarChart,
  EliteCircularRing,
  EliteSkillComparisonBars,
  EliteLineTrendChart,
  EliteDonutDistributionChart,
  EliteActivityHeatmapCalendar,
  EliteVisualTimeline
} from '@/design-system/EliteCharts';
import {
  buildActivityHeatmapData,
  buildCategoryDonutData,
  buildLineTrendData,
  buildTimelineEvents
} from '@/design-system/chartAggregators';
import {
  EliteActivityHistoryTable,
  EliteDevicesTable
} from '@/design-system/EliteDataViews';
import { ParentDevelopmentPillarsSection } from './ParentDevelopmentPillarsSection';
import { ParentGamesOverviewSection } from './ParentGamesOverviewSection';
import {
  ShieldCheck,
  BarChart3,
  Sliders,
  Users,
  Home,
  Clock,
  Download,
  Trash2,
  Lightbulb,
  KeyRound,
  QrCode,
  RefreshCw,
  Plus,
  Edit3,
  Wifi,
  BookOpen,
  Check,
  Sun,
  Moon,
  Brain,
  Gamepad2,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Award,
  Sparkles
} from 'lucide-react';
import { audioService } from '@/services/audioService';

type ParentNavTab =
  | 'inicio'
  | 'criancas'
  | 'desenvolvimento'
  | 'atividades'
  | 'jogos'
  | 'relatorios'
  | 'controle-parental'
  | 'configuracoes';

export const ParentalDashboardView: React.FC = () => {
  const {
    authSession,
    familyAccount,
    activeChild,
    setActiveChild,
    childrenList,
    devicesList,
    revokeDevice,
    parentSettings,
    updateParentSettings,
    updateParentPin,
    requestPasswordReset,
    confirmPasswordReset,
    saveChildProfile,
    deleteChildProfile,
    syncNow,
    lastSyncAt,
    isDarkMode,
    setThemeMode,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<ParentNavTab>('inicio');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>(
    activeChild?.id || childrenList[0]?.id || ''
  );
  const [reportPeriodDays, setReportPeriodDays] = useState<7 | 30 | 90>(7);
  const [donutMode, setDonutMode] = useState<'pillar' | 'area'>('pillar');

  const [reportsByChild, setReportsByChild] = useState<Record<string, EvolutionReport>>({});
  const [progressionByChild, setProgressionByChild] = useState<Record<string, ChildProgressionSnapshot>>({});
  const [journeysByChild, setJourneysByChild] = useState<Record<string, DailyJourney[]>>({});
  const [completionsList, setCompletionsList] = useState<ActivityCompletionRecord[]>([]);
  const [gamesHistory, setGamesHistory] = useState<GamePlayRecord[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [observationsList, setObservationsList] = useState<ParentObservation[]>([]);
  const [obsRefreshTick, setObsRefreshTick] = useState(0);

  // Child modal state
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [selectedChildForEdit, setSelectedChildForEdit] = useState<ChildProfile | null>(null);

  // Pairing QR Code state
  const [pairingChildId, setPairingChildId] = useState<string>(
    activeChild?.id || childrenList[0]?.id || ''
  );
  const [activePairingSession, setActivePairingSession] = useState<PairingSession | null>(null);
  const [isSyncingManual, setIsSyncingManual] = useState(false);

  // Settings form state
  const [maxMinutes, setMaxMinutes] = useState(parentSettings?.maxDailyMinutes || 30);
  const [startTime, setStartTime] = useState(parentSettings?.allowedTimeRange.start || '08:00');
  const [endTime, setEndTime] = useState(parentSettings?.allowedTimeRange.end || '20:30');
  const [unlimitedGames, setUnlimitedGames] = useState(parentSettings?.unlimitedGames || false);
  const [soundEnabled, setSoundEnabled] = useState(parentSettings?.soundEffectsEnabled ?? true);
  const [voiceEnabled, setVoiceEnabled] = useState(parentSettings?.voiceNarrationEnabled ?? true);

  // PIN change state
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Account password recovery state inside Configurações
  const [pwdResetStep, setPwdResetStep] = useState<1 | 2 | 3>(1);
  const [pwdResetIdentifier, setPwdResetIdentifier] = useState(
    authSession?.parentEmail || familyAccount?.parentEmail || authSession?.username || ''
  );
  const [pwdResetCode, setPwdResetCode] = useState('');
  const [pwdResetNew, setPwdResetNew] = useState('');
  const [pwdResetConfirm, setPwdResetConfirm] = useState('');
  const [pwdResetMsg, setPwdResetMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isPwdResetBusy, setIsPwdResetBusy] = useState(false);

  const handleRequestDashboardPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdResetMsg(null);
    const idTarget =
      pwdResetIdentifier.trim() ||
      authSession?.parentEmail ||
      familyAccount?.parentEmail ||
      authSession?.username ||
      '';
    if (!idTarget) {
      setPwdResetMsg({ text: 'Informe o e-mail ou usuário cadastrado.', isError: true });
      return;
    }
    setPwdResetIdentifier(idTarget);
    setIsPwdResetBusy(true);
    const res = await requestPasswordReset(idTarget);
    setIsPwdResetBusy(false);
    if (!res.success) {
      setPwdResetMsg({ text: res.error || 'Erro ao gerar código.', isError: true });
      return;
    }
    setPwdResetMsg({
      text: res.message || 'Código de verificação enviado por e-mail (válido por 15 minutos).',
      isError: false
    });
    setPwdResetStep(2);
  };

  const handleConfirmDashboardPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdResetMsg(null);
    if (!pwdResetCode.trim()) {
      setPwdResetMsg({ text: 'Digite o código de 6 dígitos.', isError: true });
      return;
    }
    const pwdError = getPasswordRequirementErrorMessage(pwdResetNew);
    if (pwdError) {
      setPwdResetMsg({ text: pwdError, isError: true });
      return;
    }
    if (pwdResetNew !== pwdResetConfirm) {
      setPwdResetMsg({ text: 'As senhas digitadas não coincidem.', isError: true });
      return;
    }
    setIsPwdResetBusy(true);
    const res = await confirmPasswordReset({
      identifier: pwdResetIdentifier.trim(),
      code: pwdResetCode.trim(),
      newPassword: pwdResetNew
    });
    setIsPwdResetBusy(false);
    if (!res.success) {
      setPwdResetMsg({ text: res.error || 'Código inválido ou expirado.', isError: true });
      return;
    }
    setPwdResetCode('');
    setPwdResetNew('');
    setPwdResetConfirm('');
    setPwdResetMsg({
      text: res.message || 'Senha da conta alterada com sucesso!',
      isError: false
    });
    setPwdResetStep(3);
  };

  const inspectedChild =
    childrenList.find(c => c.id === selectedChildId) || activeChild || childrenList[0] || null;

  useEffect(() => {
    const loadAllReports = async () => {
      const repMap: Record<string, EvolutionReport> = {};
      const progMap: Record<string, ChildProgressionSnapshot> = {};
      const journeyMap: Record<string, DailyJourney[]> = {};

      for (const child of childrenList) {
        repMap[child.id] = await evolutionService.generateReport(child, 'week');
        const progRes = await progressionService.syncAndGetProgression(child.id);
        progMap[child.id] = progRes.snapshot;
        journeyMap[child.id] = await storageService.getAllJourneysForChild(child.id);
      }

      setReportsByChild(repMap);
      setProgressionByChild(progMap);
      setJourneysByChild(journeyMap);
      setCompletionsList(storageService.getActivityCompletions());

      if (inspectedChild) {
        const gHist = await storageService.getGameHistory(inspectedChild.id);
        setGamesHistory(gHist);
        setUnlockedAchievements(storageService.getUnlockedAchievements(inspectedChild.id));
        setObservationsList(observationsService.getObservations(inspectedChild.id));
      } else {
        setGamesHistory([]);
        setUnlockedAchievements([]);
        setObservationsList([]);
      }
    };
    loadAllReports();
  }, [childrenList, inspectedChild, lastSyncAt, obsRefreshTick]);

  useEffect(() => {
    if (parentSettings) {
      setMaxMinutes(parentSettings.maxDailyMinutes);
      setStartTime(parentSettings.allowedTimeRange.start);
      setEndTime(parentSettings.allowedTimeRange.end);
      setUnlimitedGames(parentSettings.unlimitedGames);
      setSoundEnabled(parentSettings.soundEffectsEnabled);
      setVoiceEnabled(parentSettings.voiceNarrationEnabled);
    }
  }, [parentSettings]);

  // Poll active pairing session status so parent sees when child device claims QR / code
  useEffect(() => {
    if (!activePairingSession || activePairingSession.status === 'confirmed') return;

    const timer = setInterval(async () => {
      const res = await storageService.checkPairingStatus(activePairingSession.code);
      if (res.session) {
        setActivePairingSession(res.session);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [activePairingSession]);

  const handleGeneratePairingQr = async () => {
    const targetChild =
      childrenList.find(c => c.id === pairingChildId) || inspectedChild || childrenList[0];
    if (!targetChild) {
      showToast('Cadastre pelo menos um perfil infantil antes de parear um dispositivo.');
      return;
    }
    audioService.playGentlePop();
    const session = await storageService.createPairingSession(targetChild);
    setActivePairingSession(session);
  };

  const handleConfirmChildDevice = async () => {
    if (!activePairingSession) return;
    const dev = await storageService.confirmPairingSession(activePairingSession.code);
    if (dev) {
      audioService.playSuccess();
      setActivePairingSession({ ...activePairingSession, status: 'confirmed' });
      await syncNow();
      showToast(`Dispositivo "${dev.deviceName}" conectado ao perfil de ${activePairingSession.childName}!`);
    }
  };

  const handleManualSync = async () => {
    setIsSyncingManual(true);
    await storageService.pushSyncToServer();
    await syncNow();
    setTimeout(() => {
      setIsSyncingManual(false);
      showToast('Sincronização familiar concluída em tempo real!');
    }, 500);
  };

  const handleTogglePrioritySkill = async (child: ChildProfile, area: SkillArea) => {
    const exists = child.targetSkills.includes(area);
    if (exists && child.targetSkills.length <= 1) return;
    const nextSkills = exists
      ? child.targetSkills.filter(s => s !== area)
      : [...child.targetSkills, area];
    await saveChildProfile({ ...child, targetSkills: nextSkills });
  };

  const handleSaveControls = async () => {
    await updateParentSettings({
      maxDailyMinutes: Number(maxMinutes),
      allowedTimeRange: { start: startTime, end: endTime },
      unlimitedGames,
      soundEffectsEnabled: soundEnabled,
      voiceNarrationEnabled: voiceEnabled
    });
    audioService.playSuccess();
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4 || newPin.length > 6) {
      setPinChangeMsg({ text: 'O PIN deve ter de 4 a 6 dígitos numéricos.', isError: true });
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg({ text: 'Os dois campos de PIN não coincidem.', isError: true });
      return;
    }

    await updateParentPin(newPin);
    setNewPin('');
    setConfirmPin('');
    setPinChangeMsg({ text: 'PIN parental atualizado com sucesso!', isError: false });
    audioService.playSuccess();
  };

  const handleExportData = () => {
    const jsonStr = storageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ajuda_kids_familia_${Date.now()}.json`;
    a.click();
    showToast('Backup familiar exportado com sucesso!');
  };

  const handleClearAllData = () => {
    if (
      confirm(
        'ATENÇÃO: Deseja apagar todos os perfis, dispositivos e histórico locais? Você voltará ao Onboarding inicial.'
      )
    ) {
      storageService.clearAllData();
      window.location.reload();
    }
  };

  const NAV_ITEMS: { id: ParentNavTab; label: string; icon: React.ElementType }[] = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'criancas', label: 'Crianças', icon: Users },
    { id: 'desenvolvimento', label: 'Desenvolvimento', icon: Brain },
    { id: 'atividades', label: 'Atividades', icon: BookOpen },
    { id: 'jogos', label: 'Jogos', icon: Gamepad2 },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'controle-parental', label: 'Controle parental', icon: Shield },
    { id: 'configuracoes', label: 'Configurações', icon: Sliders }
  ];

  // Derived real-data analytics for inspected child
  const inspectedCompletions = useMemo(
    () => (inspectedChild ? completionsList.filter(c => c.childId === inspectedChild.id) : []),
    [completionsList, inspectedChild]
  );
  const inspectedJourneys = useMemo(
    () => (inspectedChild ? journeysByChild[inspectedChild.id] || [] : []),
    [journeysByChild, inspectedChild]
  );
  const inspectedProgression = inspectedChild ? progressionByChild[inspectedChild.id] : undefined;
  const inspectedReport = inspectedChild ? reportsByChild[inspectedChild.id] : undefined;
  const inspectedTodayMins = inspectedChild
    ? storageService.getTodayMinutesSpent(inspectedChild.id)
    : 0;
  const dailyGoalMins = parentSettings?.maxDailyMinutes || 30;

  const lineTrendPoints = useMemo(
    () =>
      buildLineTrendData({
        completions: inspectedCompletions,
        journeys: inspectedJourneys,
        games: gamesHistory,
        periodDays: reportPeriodDays,
        dailyGoalMinutes: dailyGoalMins
      }),
    [inspectedCompletions, inspectedJourneys, gamesHistory, reportPeriodDays, dailyGoalMins]
  );

  const donutSlices = useMemo(
    () =>
      buildCategoryDonutData({
        completions: inspectedCompletions,
        groupBy: donutMode
      }),
    [inspectedCompletions, donutMode]
  );

  const heatmapColumns = useMemo(
    () =>
      buildActivityHeatmapData({
        completions: inspectedCompletions,
        journeys: inspectedJourneys,
        games: gamesHistory,
        weeks: 12
      }),
    [inspectedCompletions, inspectedJourneys, gamesHistory]
  );

  const timelineEvents = useMemo(
    () =>
      buildTimelineEvents({
        completions: inspectedCompletions,
        games: gamesHistory,
        unlockedAchievements,
        observations: observationsList,
        achievementsCatalog: ACHIEVEMENTS_CATALOG,
        limit: 16
      }),
    [inspectedCompletions, gamesHistory, unlockedAchievements, observationsList]
  );

  const totalFamilyMinutes = Object.values(reportsByChild).reduce((acc, r) => acc + r.totalMinutes, 0);
  const totalFamilyJourneys = Object.values(reportsByChild).reduce(
    (acc, r) => acc + r.journeysCompleted,
    0
  );
  const activeDevicesCount = devicesList.filter(d => d.status === 'active').length;
  const firstName = (familyAccount?.parentName || authSession?.parentName || 'Família').split(' ')[0];

  const pairingUrl =
    typeof window !== 'undefined' && activePairingSession
      ? `${window.location.origin}/?pair=${activePairingSession.code}`
      : '';

  const renderChildSelectorPills = (prefixLabel = '') =>
    childrenList.length > 0 ? (
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {childrenList.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedChildId(c.id)}
            className={`btn-elite px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap ${
              inspectedChild?.id === c.id
                ? 'bg-[#7047E8] text-white shadow-sm'
                : 'bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] text-[#4A4668] dark:text-[#B8B3D6] hover:bg-[#EFEAFC] dark:hover:bg-[#27234D]'
            }`}
          >
            <span>
              {prefixLabel}
              {c.name}
            </span>
            <span className="opacity-75 tabular-nums">({c.age}a)</span>
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-20 text-[#25233A] dark:text-[#F8F7FF]">
      {/* =================================================================== */}
      {/* DESKTOP RETRACTABLE LEFT SIDEBAR                                    */}
      {/* =================================================================== */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 rounded-[26px] bg-white/95 dark:bg-[#1E1B3A]/95 border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech p-3.5 h-fit sticky top-20 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-[82px]' : 'w-[258px]'
        }`}
      >
        <div
          className={`flex items-center pb-3 mb-3 border-b border-[#E4DFF5] dark:border-[#38316B] ${
            isSidebarCollapsed ? 'justify-center' : 'justify-between px-1.5'
          }`}
        >
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7047E8] dark:text-[#A78BFA] block">
                Central Familiar
              </span>
              <span className="font-display text-sm font-extrabold text-[#25233A] dark:text-[#F8F7FF] truncate block">
                {familyAccount?.familyName || 'Ajuda KIDS'}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            title={isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            aria-label={isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            className="w-9 h-9 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] text-[#7047E8] dark:text-[#C7B8FF] flex items-center justify-center hover:bg-[#EFEAFC] transition-colors shrink-0"
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        <nav className="space-y-1.5" aria-label="Navegação dos responsáveis">
          {NAV_ITEMS.map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                title={tab.label}
                onClick={() => {
                  audioService.playGentlePop();
                  setActiveTab(tab.id);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  isSidebarCollapsed ? 'justify-center px-0' : ''
                } ${
                  isSelected
                    ? 'bg-[#7047E8] text-white shadow-sm shadow-[#7047E8]/25'
                    : 'text-[#4A4668] dark:text-[#B8B3D6] hover:bg-[#F5F3FC] dark:hover:bg-[#27234D] hover:text-[#25233A] dark:hover:text-white'
                }`}
              >
                <Icon size={17} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {!isSidebarCollapsed && (
          <div className="mt-5 pt-4 border-t border-[#E4DFF5] dark:border-[#38316B] space-y-2.5 px-1">
            <div className="p-3 rounded-2xl bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#36C995] animate-pulse shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-extrabold text-[#25233A] dark:text-[#F8F7FF] block">
                  Sincronia Ativa
                </span>
                <span className="text-[10px] font-medium text-[#77758A] dark:text-[#B8B3D6] block truncate">
                  {activeDevicesCount} aparelho(s) • {childrenList.length} perfil(is)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleManualSync}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#EFEAFC] dark:bg-[#27234D] text-[#5B35C9] dark:text-[#C7B8FF] border border-[#D8CCFA] dark:border-[#38316B] text-xs font-extrabold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={13} className={isSyncingManual ? 'animate-spin' : ''} />
              <span>Sincronizar Agora</span>
            </button>
          </div>
        )}
      </aside>

      {/* =================================================================== */}
      {/* MAIN CONTENT SHELL + MOBILE/TABLET HORIZONTAL SECTION BAR           */}
      {/* =================================================================== */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Top Compact Parental Header Bar */}
        <div className="rounded-[24px] p-5 sm:p-6 bg-gradient-to-r from-[#7047E8] via-[#5E35D8] to-[#4389F5] text-white shadow-edtech border border-white/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex shrink-0">
                <AjudaKidsMascot size={62} pose="happy" animate={false} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/18 text-[10px] font-extrabold uppercase tracking-wider">
                    Painel dos Responsáveis
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#36C995]/25 border border-[#36C995]/50 text-[#D9FFF1] text-[10px] font-extrabold flex items-center gap-1">
                    <Wifi size={10} /> Online
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                  Olá, {firstName}!
                </h1>
                <p className="text-xs text-white/85 font-medium">
                  {childrenList.length}{' '}
                  {childrenList.length === 1 ? 'criança acompanhada' : 'crianças acompanhadas'} •{' '}
                  {totalFamilyMinutes} min esta semana
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleManualSync}
                className="lg:hidden btn-elite px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-extrabold flex items-center gap-1.5"
              >
                <RefreshCw size={13} className={isSyncingManual ? 'animate-spin' : ''} />
                <span>Sincronizar</span>
              </button>
              <Button
                type="button"
                variant="accent"
                size="sm"
                leftIcon={<Plus size={15} />}
                onClick={() => {
                  setSelectedChildForEdit(null);
                  setIsChildModalOpen(true);
                }}
              >
                Nova Criança
              </Button>
            </div>
          </div>

          {/* Mobile & Tablet Horizontal Navigation Pills */}
          <div className="flex lg:hidden items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-white/20 scrollbar-none">
            {NAV_ITEMS.map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    audioService.playGentlePop();
                    setActiveTab(tab.id);
                  }}
                  className={`btn-elite flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-[#25233A] shadow-sm'
                      : 'bg-white/14 text-white/90 hover:bg-white/22'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 1. INÍCIO (PAINEL RESUMIDO, KPIs, META & VISÃO DA FAMÍLIA)        */}
        {/* ================================================================= */}
        {activeTab === 'inicio' && (
          <div className="space-y-6 animate-fadeIn">
            {renderChildSelectorPills()}

            {/* Top 4 Scannable KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="p-5 rounded-[22px] bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7047E8] dark:text-[#A78BFA] block">
                    Rotina de Hoje
                  </span>
                  <span className="font-display text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF] mt-1 block tabular-nums">
                    {inspectedTodayMins} / {dailyGoalMins}m
                  </span>
                  <span className="text-[11px] font-medium text-[#77758A] dark:text-[#B8B3D6]">
                    Meta saudável diária
                  </span>
                </div>
                <EliteCircularRing
                  value={inspectedTodayMins}
                  max={dailyGoalMins}
                  size={56}
                  strokeWidth={6}
                  accentColor="#7047E8"
                  centerLabel={`${Math.min(100, Math.round((inspectedTodayMins / Math.max(1, dailyGoalMins)) * 100))}%`}
                />
              </div>

              <div className="p-5 rounded-[22px] bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4389F5] block">
                    Atividades Concluídas
                  </span>
                  <span className="font-display text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF] mt-1 block tabular-nums">
                    {inspectedCompletions.length}
                  </span>
                  <span className="text-[11px] font-medium text-[#77758A] dark:text-[#B8B3D6]">
                    Total registrado
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#EBF3FE] dark:bg-[#192948] text-[#4389F5] flex items-center justify-center shrink-0">
                  <BookOpen size={22} />
                </div>
              </div>

              <div className="p-5 rounded-[22px] bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#36C995] block">
                    Conquistas & Nível
                  </span>
                  <span className="font-display text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF] mt-1 block tabular-nums">
                    Nível {inspectedProgression?.level || 1}
                  </span>
                  <span className="text-[11px] font-medium text-[#77758A] dark:text-[#B8B3D6] tabular-nums">
                    {inspectedProgression?.achievementsUnlockedCount || 0} medalha(s) •{' '}
                    {inspectedProgression?.streakDays || 0} dia(s) seguidos
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#E6F9F2] dark:bg-[#143328] text-[#36C995] flex items-center justify-center shrink-0">
                  <Award size={22} />
                </div>
              </div>

              <div className="p-5 rounded-[22px] bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF9B42] block">
                    Tempo da Família
                  </span>
                  <span className="font-display text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF] mt-1 block tabular-nums">
                    {totalFamilyMinutes} min
                  </span>
                  <span className="text-[11px] font-medium text-[#77758A] dark:text-[#B8B3D6] tabular-nums">
                    {totalFamilyJourneys} jornada(s) • {activeDevicesCount} disp.
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFF2E6] dark:bg-[#362317] text-[#FF9B42] flex items-center justify-center shrink-0">
                  <Clock size={22} />
                </div>
              </div>
            </div>

            {/* Interactive Frequency Trend + Quick Actions Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8">
                <EliteLineTrendChart
                  points={lineTrendPoints}
                  title={`Frequência Recente — ${inspectedChild?.name || 'Criança'}`}
                  subtitle="Acompanhamento dos últimos 7 dias com linha pontilhada de meta saudável"
                />
              </div>

              <div className="xl:col-span-4 rounded-[22px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFEAFC] dark:bg-[#27234D] text-[#5B35C9] dark:text-[#C7B8FF] text-[10px] font-extrabold uppercase">
                    <Sparkles size={12} /> Próximos Passos
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                    Atalhos do Acompanhamento
                  </h3>
                  <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6]">
                    Navegue direto para os registros e configurações da rotina familiar.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('desenvolvimento')}
                    className="w-full p-3 rounded-2xl bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] hover:border-[#7047E8] text-left flex items-center justify-between gap-2 transition-colors"
                  >
                    <span className="text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                      Ver 5 Pilares & Observações
                    </span>
                    <Brain size={16} className="text-[#7047E8]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('relatorios')}
                    className="w-full p-3 rounded-2xl bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] hover:border-[#4389F5] text-left flex items-center justify-between gap-2 transition-colors"
                  >
                    <span className="text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                      Abrir Gráficos & Mapa de Calor
                    </span>
                    <BarChart3 size={16} className="text-[#4389F5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('controle-parental')}
                    className="w-full p-3 rounded-2xl bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] hover:border-[#36C995] text-left flex items-center justify-between gap-2 transition-colors"
                  >
                    <span className="text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                      Gerenciar Tempo, PIN & QR Code
                    </span>
                    <Shield size={16} className="text-[#36C995]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Side-by-Side Children Summary Cards */}
            <div className="rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                    Acompanhamento das Crianças
                  </h2>
                  <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6]">
                    Resumo simultâneo por perfil infantil cadastrado na conta
                  </p>
                </div>
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  leftIcon={<QrCode size={14} />}
                  onClick={() => setActiveTab('controle-parental')}
                >
                  Parear Aparelho
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {childrenList.map(child => {
                  const rep = reportsByChild[child.id];
                  const char =
                    KID_CHARACTERS.find(c => c.name.toLowerCase() === child.avatar.toLowerCase()) ||
                    KID_CHARACTERS[0];
                  const childDevs = devicesList.filter(
                    d => d.childId === child.id && d.status === 'active'
                  );
                  const todayMins = storageService.getTodayMinutesSpent(child.id);
                  const totalActs = rep
                    ? Object.values(rep.skills).reduce((a, b) => a + b.activitiesCompleted, 0)
                    : 0;

                  return (
                    <div
                      key={child.id}
                      className="p-4 sm:p-5 rounded-[20px] bg-[#F5F3FC]/80 dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] hover:border-[#7047E8]/60 transition-colors flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-13 h-13 rounded-2xl bg-white dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-center p-1 shrink-0 shadow-xs">
                            {char.renderAvatar(46)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF] truncate">
                                {child.name}
                              </h3>
                              {activeChild?.id === child.id && (
                                <span className="px-2 py-0.5 rounded-full bg-[#E6F9F2] dark:bg-[#143328] text-[#177856] dark:text-[#6EE7B7] text-[10px] font-extrabold">
                                  Ativo aqui
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6]">
                              {child.age} anos • Faixa {child.ageGroup}
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="cancel"
                          size="sm"
                          onClick={() => {
                            setSelectedChildId(child.id);
                            setActiveTab('criancas');
                          }}
                        >
                          Ficha
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-center bg-white dark:bg-[#1E1B3A] rounded-2xl p-3 border border-[#E4DFF5] dark:border-[#38316B]">
                        <div className="flex justify-center">
                          <EliteCircularRing
                            value={todayMins}
                            max={dailyGoalMins}
                            size={50}
                            strokeWidth={5}
                            accentColor="#7047E8"
                            centerLabel={`${todayMins}m`}
                            caption={`Meta ${dailyGoalMins}m`}
                          />
                        </div>
                        <div className="text-center border-x border-[#E4DFF5] dark:border-[#38316B] px-2">
                          <span className="text-[10px] font-bold uppercase text-[#77758A] dark:text-[#B8B3D6] block">
                            Atividades
                          </span>
                          <span className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF] tabular-nums">
                            {totalActs}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-bold uppercase text-[#77758A] dark:text-[#B8B3D6] block">
                            Aparelhos
                          </span>
                          <span className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF] tabular-nums">
                            {childDevs.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. CRIANÇAS (PERFIS ESTILIZADOS & HISTÓRICO INDIVIDUAL)           */}
        {/* ================================================================= */}
        {activeTab === 'criancas' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {renderChildSelectorPills()}
              <Button
                type="button"
                variant="primary"
                size="md"
                leftIcon={<Plus size={15} />}
                onClick={() => {
                  setSelectedChildForEdit(null);
                  setIsChildModalOpen(true);
                }}
              >
                Adicionar Criança
              </Button>
            </div>

            {inspectedChild && (
              <div className="rounded-[24px] p-5 sm:p-7 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4DFF5] dark:border-[#38316B]">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-[20px] bg-[#F5F3FC] dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] shrink-0">
                      {(
                        KID_CHARACTERS.find(
                          c => c.name.toLowerCase() === inspectedChild.avatar.toLowerCase()
                        ) || KID_CHARACTERS[0]
                      ).renderAvatar(68)}
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7047E8] dark:text-[#A78BFA]">
                        Perfil Infantil Individual
                      </span>
                      <h2 className="font-display text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF] mt-0.5">
                        {inspectedChild.name}{' '}
                        {inspectedChild.nickname ? `(${inspectedChild.nickname})` : ''}
                      </h2>
                      <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] mt-0.5">
                        {inspectedChild.age} anos • Faixa {inspectedChild.ageGroup} anos • Nível{' '}
                        {inspectedProgression?.level || 1} ({inspectedProgression?.totalXp || 0} XP)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeChild?.id !== inspectedChild.id && (
                      <Button
                        type="button"
                        variant="confirm"
                        size="sm"
                        onClick={() => {
                          setActiveChild(inspectedChild);
                          showToast(`Alternado para o perfil de ${inspectedChild.name}!`);
                        }}
                      >
                        Ativar neste Aparelho
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="soft"
                      size="sm"
                      leftIcon={<QrCode size={14} />}
                      onClick={() => {
                        setPairingChildId(inspectedChild.id);
                        setActiveTab('controle-parental');
                      }}
                    >
                      Conectar Dispositivo
                    </Button>
                    <Button
                      type="button"
                      variant="cancel"
                      size="sm"
                      leftIcon={<Edit3 size={14} />}
                      onClick={() => {
                        setSelectedChildForEdit(inspectedChild);
                        setIsChildModalOpen(true);
                      }}
                    >
                      Editar Perfil
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F5F3FC]/80 dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B]">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#77758A] dark:text-[#B8B3D6] block mb-2.5">
                      Dispositivos Vinculados
                    </span>
                    {devicesList.filter(d => d.childId === inspectedChild.id && d.status === 'active')
                      .length === 0 ? (
                      <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6]">
                        Nenhum dispositivo externo vinculado ainda.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {devicesList
                          .filter(d => d.childId === inspectedChild.id && d.status === 'active')
                          .map(dev => (
                            <div
                              key={dev.id}
                              className="p-2.5 rounded-xl bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] text-xs flex items-center justify-between gap-2"
                            >
                              <span className="font-extrabold text-[#25233A] dark:text-[#F8F7FF] truncate">
                                {dev.deviceName} ({dev.platform})
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-[#E6F9F2] dark:bg-[#143328] text-[#177856] dark:text-[#6EE7B7] text-[10px] font-extrabold">
                                Ativo
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5F3FC]/80 dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B]">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#77758A] dark:text-[#B8B3D6] block mb-2.5">
                      Últimas Atividades Concluídas
                    </span>
                    {inspectedCompletions.length === 0 ? (
                      <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6]">
                        Nenhuma atividade concluída ainda por {inspectedChild.name}.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {inspectedCompletions.slice(0, 4).map(act => (
                          <div
                            key={act.id}
                            className="p-2.5 rounded-xl bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] text-xs flex items-center justify-between gap-2"
                          >
                            <span className="font-bold text-[#25233A] dark:text-[#F8F7FF] truncate">
                              {act.activityTitle}
                            </span>
                            <span className="text-[10px] font-extrabold text-[#36C995] tabular-nums shrink-0">
                              {act.durationMinutes}m
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5F3FC]/80 dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B]">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#77758A] dark:text-[#B8B3D6] block mb-2.5">
                      Jogos 3D Utilizados
                    </span>
                    {gamesHistory.length === 0 ? (
                      <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6]">
                        Nenhuma partida 3D registrada ainda.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {gamesHistory.slice(0, 4).map(g => (
                          <div
                            key={g.id}
                            className="p-2.5 rounded-xl bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] text-xs flex items-center justify-between gap-2"
                          >
                            <span className="font-bold text-[#25233A] dark:text-[#F8F7FF] truncate">
                              {g.gameId}
                            </span>
                            <span className="text-[10px] font-extrabold text-[#4389F5] tabular-nums shrink-0">
                              {g.score || 100} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. DESENVOLVIMENTO (5 PILARES PEDAGÓGICOS + NOTAS DOS PAIS)       */}
        {/* ================================================================= */}
        {activeTab === 'desenvolvimento' && inspectedChild && (
          <div className="space-y-5">
            {renderChildSelectorPills()}
            <ParentDevelopmentPillarsSection
              child={inspectedChild}
              completions={completionsList}
              onObservationChanged={() => setObsRefreshTick(t => t + 1)}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. ATIVIDADES (PREFERÊNCIAS DE HABILIDADE + HISTÓRICO SINCRONIZADO)*/}
        {/* ================================================================= */}
        {activeTab === 'atividades' && inspectedChild && (
          <div className="space-y-6 animate-fadeIn">
            {renderChildSelectorPills()}
            <div className="rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech">
              <h2 className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF] mb-1">
                Áreas Prioritárias de {inspectedChild.name}
              </h2>
              <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] mb-4">
                Ative ou ajuste quais áreas pedagógicas recebem destaque automático nas jornadas diárias:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {(
                  [
                    'communication',
                    'reasoning',
                    'math',
                    'attention',
                    'emotional',
                    'motor',
                    'creativity',
                    'knowledge',
                    'music',
                    'languages'
                  ] as SkillArea[]
                ).map(area => {
                  const comp = getCompanionBySkill(area);
                  const active = inspectedChild.targetSkills.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleTogglePrioritySkill(inspectedChild, area)}
                      className={`btn-elite p-4 rounded-2xl border-2 text-center flex flex-col items-center gap-2 ${
                        active
                          ? 'border-[#7047E8] bg-[#EFEAFC]/70 dark:bg-[#27234D] shadow-xs'
                          : 'border-[#E4DFF5] dark:border-[#38316B] bg-[#F5F3FC]/60 dark:bg-[#171430] opacity-70 hover:opacity-95'
                      }`}
                    >
                      {comp.renderCharacter(48, 'happy')}
                      <span className="text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                        {comp.skillLabel}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          active
                            ? 'bg-[#E6F9F2] dark:bg-[#143328] text-[#177856] dark:text-[#6EE7B7]'
                            : 'bg-[#E4DFF5] dark:bg-[#27234D] text-[#77758A] dark:text-[#B8B3D6]'
                        }`}
                      >
                        {active ? 'Prioritária ✓' : 'Opcional'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <EliteActivityHistoryTable
              records={completionsList}
              childrenList={childrenList}
              title="Histórico Sincronizado de Atividades Concluídas"
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* 5. JOGOS (PARQUE 3D, OBJETIVO PEDAGÓGICO & HISTÓRICO REAL)        */}
        {/* ================================================================= */}
        {activeTab === 'jogos' && (
          <div className="space-y-5">
            {renderChildSelectorPills()}
            <ParentGamesOverviewSection
              child={inspectedChild}
              gamesHistory={gamesHistory}
              parentSettings={parentSettings}
              onGoToParentalControls={() => setActiveTab('controle-parental')}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* 6. RELATÓRIOS (GRÁFICOS INTERATIVOS ETAPA 4 + DADOS 100% REAIS)   */}
        {/* ================================================================= */}
        {activeTab === 'relatorios' && inspectedChild && inspectedReport && (
          <div className="space-y-6 animate-fadeIn">
            {/* Child + Period Filters Bar */}
            <div className="rounded-[22px] p-4 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech flex flex-col md:flex-row md:items-center justify-between gap-3">
              {renderChildSelectorPills('Relatório de ')}

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-[#77758A] dark:text-[#B8B3D6]">
                  Período:
                </span>
                {([7, 30, 90] as const).map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setReportPeriodDays(days)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                      reportPeriodDays === days
                        ? 'bg-[#4389F5] text-white'
                        : 'bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] text-[#4A4668] dark:text-[#B8B3D6]'
                    }`}
                  >
                    {days} dias
                  </button>
                ))}
              </div>
            </div>

            {/* Line Chart (Frequency & Goal Trend) + Donut Chart Toggle */}
            <EliteLineTrendChart
              points={lineTrendPoints}
              title={`Tendência de Participação (${reportPeriodDays} dias) — ${inspectedChild.name}`}
              subtitle="Minutos reais registrados por dia vs. linha pontilhada de meta saudável"
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-6 space-y-2">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDonutMode('pillar')}
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
                      donutMode === 'pillar'
                        ? 'bg-[#7047E8] text-white'
                        : 'bg-white dark:bg-[#1E1B3A] text-[#77758A] dark:text-[#B8B3D6] border border-[#E4DFF5] dark:border-[#38316B]'
                    }`}
                  >
                    Por Pilares
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonutMode('area')}
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
                      donutMode === 'area'
                        ? 'bg-[#7047E8] text-white'
                        : 'bg-white dark:bg-[#1E1B3A] text-[#77758A] dark:text-[#B8B3D6] border border-[#E4DFF5] dark:border-[#38316B]'
                    }`}
                  >
                    Por Áreas
                  </button>
                </div>
                <EliteDonutDistributionChart
                  slices={donutSlices}
                  title={`Distribuição de Atividades — ${inspectedChild.name}`}
                />
              </div>

              <div className="xl:col-span-6 flex items-stretch">
                <EliteActivityHeatmapCalendar
                  columns={heatmapColumns}
                  className="w-full"
                />
              </div>
            </div>

            <EliteWeeklyBarChart
              dailyTrend={inspectedReport.dailyTrend}
              targetMinutes={dailyGoalMins}
              title={`Evolução Semanal — ${inspectedChild.name}`}
              subtitle="Comparativo dos últimos 7 dias com faixa recomendada pela família"
            />

            <EliteSkillComparisonBars
              skills={inspectedReport.skills}
              childName={inspectedChild.name}
            />

            <EliteVisualTimeline events={timelineEvents} />

            {inspectedReport.offlineActivitiesSuggested.length > 0 && (
              <div className="rounded-[24px] p-6 bg-[#E6F9F2]/90 dark:bg-[#143328] border border-[#8DE3C4] dark:border-[#246950] shadow-edtech">
                <div className="flex items-center gap-2 mb-2.5 text-[#177856] dark:text-[#6EE7B7] font-extrabold text-sm">
                  <Lightbulb size={18} />
                  <span>Recomendações Pedagógicas Fora da Tela</span>
                </div>
                <ul className="space-y-2 text-xs font-semibold text-[#25233A] dark:text-[#E2E8F0]">
                  {inspectedReport.offlineActivitiesSuggested.map((tip, idx) => (
                    <li key={idx}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 7. CONTROLE PARENTAL (TEMPO, JOGOS, PIN & DISPOSITIVOS QR CODE)   */}
        {/* ================================================================= */}
        {activeTab === 'controle-parental' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Screen Time, Allowed Hours & 3D Game Rule */}
            <div className="rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech space-y-5">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                  Limites de Tempo, Horário Permitido & Regra de Jogos 3D
                </h2>
                <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6]">
                  Preserve a rotina saudável (20 a 30 min/dia) e defina como os jogos 3D bônus são liberados.
                </p>
              </div>

              <EliteRangeSlider
                label="Limite Diário Recomendado"
                recommendedLabel="A faixa de 20 a 30 min favorece foco, aprendizagem e descanso visual."
                min={10}
                max={60}
                step={5}
                value={maxMinutes}
                onChange={setMaxMinutes}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EliteInput
                  label="Horário Inicial Permitido"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
                <EliteInput
                  label="Horário Final (Proteção do Sono)"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
              </div>

              <EliteToggle
                checked={unlimitedGames}
                onChange={setUnlimitedGames}
                label="Jogos 3D sem limite de partidas"
                description="Padrão pedagógico: até 3 partidas bônus após concluir a jornada diária."
              />

              <div className="pt-1">
                <Button type="button" variant="primary" size="md" onClick={handleSaveControls}>
                  Salvar Regras Parentais
                </Button>
              </div>
            </div>

            {/* Parent PIN Form */}
            <div className="rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech space-y-4">
              <h3 className="font-display text-base font-extrabold text-[#25233A] dark:text-[#F8F7FF] flex items-center gap-2">
                <KeyRound size={18} className="text-[#7047E8]" /> Alterar PIN Parental (4 a 6 dígitos)
              </h3>
              <form onSubmit={handleUpdatePin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <EliteInput
                  label="Novo PIN Parental"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                />
                <EliteInput
                  label="Confirmar Novo PIN"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  error={pinChangeMsg?.isError ? pinChangeMsg.text : undefined}
                  successText={!pinChangeMsg?.isError && pinChangeMsg ? pinChangeMsg.text : undefined}
                />
                <Button type="submit" variant="primary" size="md">
                  Atualizar PIN
                </Button>
              </form>
            </div>

            {/* Pairing Generator Card */}
            <div className="rounded-[24px] p-5 sm:p-7 bg-white dark:bg-[#1E1B3A] border-2 border-[#4389F5]/45 dark:border-[#38316B] shadow-edtech">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="max-w-xl space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FE] dark:bg-[#192948] border border-[#4389F5]/30 text-[#2563C8] dark:text-[#7DD3FC] text-xs font-extrabold">
                    <QrCode size={14} /> Pareamento Seguro por QR Code & Token Temporário
                  </span>
                  <h2 className="font-display text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                    Conectar Dispositivo Infantil
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-[#77758A] dark:text-[#B8B3D6] leading-relaxed">
                    Vincule o celular ou tablet de cada filho ao respectivo perfil. O código expira em 5 minutos e exige sua aprovação aqui.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                    <EliteSelect
                      label="Perfil para pareamento"
                      value={pairingChildId}
                      onChange={setPairingChildId}
                      className="sm:w-64"
                      options={childrenList.map(c => ({
                        value: c.id,
                        label: `Perfil de ${c.name} (${c.age} anos)`
                      }))}
                    />

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      leftIcon={<QrCode size={16} />}
                      onClick={handleGeneratePairingQr}
                    >
                      Gerar QR Code e Código
                    </Button>
                  </div>
                </div>

                {activePairingSession && (
                  <div className="w-full md:w-auto p-5 rounded-3xl bg-[#F5F3FC] dark:bg-[#171430] border-2 border-[#D8CCFA] dark:border-[#38316B] text-center space-y-3">
                    <QrCodeDisplay
                      value={pairingUrl}
                      code={activePairingSession.code}
                      size={165}
                    />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#77758A] dark:text-[#B8B3D6] block">
                        Código Manual de 6 Dígitos ({activePairingSession.childName})
                      </span>
                      <span className="font-mono text-2xl font-bold tracking-[0.25em] text-[#25233A] dark:text-[#F8F7FF] block mt-0.5 tabular-nums">
                        {activePairingSession.code}
                      </span>
                    </div>

                    {activePairingSession.status === 'claimed_pending_confirm' && (
                      <div className="p-3.5 rounded-2xl bg-[#FFF8DF] dark:bg-[#2E2514] border border-[#F5D66B] dark:border-[#8D6C1E] text-left space-y-2 animate-fadeIn">
                        <span className="text-[11px] font-extrabold text-[#8F6500] dark:text-[#FFD34E] block">
                          Solicitação Recebida!
                        </span>
                        <p className="text-xs font-bold text-[#25233A] dark:text-[#F8F7FF]">
                          Aparelho:{' '}
                          <strong>
                            {activePairingSession.claimedDevice?.deviceName} (
                            {activePairingSession.claimedDevice?.platform})
                          </strong>
                        </p>
                        <Button
                          type="button"
                          variant="confirm"
                          size="sm"
                          className="w-full"
                          leftIcon={<Check size={15} />}
                          onClick={handleConfirmChildDevice}
                        >
                          Confirmar e Autorizar Conexão
                        </Button>
                      </div>
                    )}

                    {activePairingSession.status === 'confirmed' && (
                      <div className="p-2.5 rounded-xl bg-[#E6F9F2] dark:bg-[#143328] border border-[#8DE3C4] dark:border-[#246950] text-[#177856] dark:text-[#6EE7B7] text-xs font-extrabold">
                        ✓ Dispositivo Pareado com Sucesso!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <EliteDevicesTable
              devices={devicesList}
              childrenList={childrenList}
              onRevokeDevice={revokeDevice}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* 8. CONFIGURAÇÕES (TEMAS, ÁUDIO, SENHA DA CONTA & DADOS LGPD)      */}
        {/* ================================================================= */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Appearance / Light & Dark Theme Switcher */}
            <div className="rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF] flex items-center gap-2">
                    {isDarkMode ? (
                      <Moon size={19} className="text-[#FFD34E]" />
                    ) : (
                      <Sun size={19} className="text-[#7047E8]" />
                    )}
                    Aparência e Tema (Modo Claro / Modo Escuro)
                  </h2>
                  <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] mt-1">
                    Alterne entre a paleta lavanda iluminada e o modo escuro roxo-grafite. A preferência é salva automaticamente.
                  </p>
                </div>
                <span
                  data-testid="active-theme-badge"
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shrink-0 ${
                    isDarkMode
                      ? 'bg-[#27234D] border-[#FFD34E]/60 text-[#FFD34E]'
                      : 'bg-[#EFEAFC] border-[#7047E8]/35 text-[#7047E8]'
                  }`}
                >
                  {isDarkMode ? <Moon size={13} /> : <Sun size={13} />}
                  <span>{isDarkMode ? 'Modo Escuro Ativo' : 'Modo Claro Ativo'}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  data-testid="theme-option-light"
                  onClick={() => setThemeMode('light')}
                  aria-pressed={!isDarkMode}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-4 ${
                    !isDarkMode
                      ? 'bg-[#F5F3FC] border-[#7047E8] shadow-[0_4px_0_rgba(112,71,232,0.18)]'
                      : 'bg-[#171430] border-[#38316B] hover:border-[#7047E8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5F3FC] to-[#E6F9F2] border border-[#DDD6F3] flex items-center justify-center shrink-0">
                      <Sun size={20} className="text-[#7047E8]" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                        Modo Claro
                      </p>
                      <p className="text-[11px] font-medium text-[#77758A] dark:text-[#B8B3D6]">
                        Lavanda acolhedor e vibrante
                      </p>
                    </div>
                  </div>
                  {!isDarkMode && (
                    <span className="w-6 h-6 rounded-full bg-[#7047E8] text-white flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  data-testid="theme-option-dark"
                  onClick={() => setThemeMode('dark')}
                  aria-pressed={isDarkMode}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-4 ${
                    isDarkMode
                      ? 'bg-[#27234D] border-[#FFD34E] shadow-[0_4px_0_rgba(255,211,78,0.22)]'
                      : 'bg-[#1E1B3A] border-[#38316B] hover:border-[#FF9B42]/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#121024] border border-[#38316B] flex items-center justify-center shrink-0">
                      <Moon size={20} className="text-[#FFD34E]" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-extrabold text-white">
                        Modo Escuro
                      </p>
                      <p className="text-[11px] font-medium text-[#B8B3D6]">
                        Roxo-grafite noturno confortável
                      </p>
                    </div>
                  </div>
                  {isDarkMode && (
                    <span className="w-6 h-6 rounded-full bg-[#FFD34E] text-[#121024] flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Sound & Narration Preferences */}
            <div className="rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech space-y-4">
              <div>
                <h2 className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                  Acessibilidade Auditiva e Sons
                </h2>
                <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6]">
                  Preferências sonoras compartilhadas entre atividades, emoções e jogos 3D
                </p>
              </div>

              <EliteToggle
                checked={soundEnabled}
                onChange={val => {
                  setSoundEnabled(val);
                  setVoiceEnabled(val);
                }}
                label="Efeitos Sonoros e Narração Guiada"
                description="Feedback auditivo acolhedor durante atividades, emoções e jogos."
              />

              <div className="pt-1">
                <Button type="button" variant="primary" size="md" onClick={handleSaveControls}>
                  Salvar Preferências de Áudio
                </Button>
              </div>
            </div>

            {/* Account Password Reset + LGPD Data Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech space-y-4">
                <h3 className="font-display text-base font-extrabold text-[#25233A] dark:text-[#F8F7FF] flex items-center gap-2">
                  <KeyRound size={18} className="text-[#4389F5]" /> Redefinir Senha da Conta Familiar
                </h3>

                {pwdResetStep === 1 && (
                  <form onSubmit={handleRequestDashboardPasswordReset} className="space-y-2.5">
                    <EliteInput
                      type="text"
                      size="sm"
                      value={pwdResetIdentifier}
                      onChange={e => setPwdResetIdentifier(e.target.value)}
                      placeholder="E-mail ou usuário cadastrado"
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      isLoading={isPwdResetBusy}
                    >
                      Enviar Código de Redefinição (Gmail SMTP)
                    </Button>
                  </form>
                )}
                {pwdResetStep === 2 && (
                  <form onSubmit={handleConfirmDashboardPasswordReset} className="space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-[#FFF8DF] dark:bg-[#27234D] border border-[#F5D66B] dark:border-[#FFD34E]/40 text-[11px] font-semibold text-[#25233A] dark:text-[#FEF08A]">
                      Confira sua caixa de entrada e também a pasta de <strong>Spam (Lixo Eletrônico)</strong> do Gmail.
                    </div>
                    <EliteInput
                      type="text"
                      size="sm"
                      inputMode="numeric"
                      maxLength={6}
                      value={pwdResetCode}
                      onChange={e => setPwdResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Código de 6 dígitos"
                      className="text-center tracking-widest font-mono"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <EliteInput
                        type="password"
                        size="sm"
                        value={pwdResetNew}
                        onChange={e => setPwdResetNew(e.target.value)}
                        placeholder="Nova senha forte (8+)"
                      />
                      <EliteInput
                        type="password"
                        size="sm"
                        value={pwdResetConfirm}
                        onChange={e => setPwdResetConfirm(e.target.value)}
                        placeholder="Confirmar"
                      />
                    </div>
                    <p className="text-[11px] font-medium text-[#77758A] dark:text-[#B8B3D6]">
                      Mínimo 8 caracteres, com 1 maiúscula (A–Z), 1 número (0–9) e 1 caractere especial (!@#$%&*).
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="subtle"
                        size="sm"
                        onClick={() => setPwdResetStep(1)}
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={isPwdResetBusy}
                      >
                        Confirmar Nova Senha
                      </Button>
                    </div>
                  </form>
                )}
                {pwdResetStep === 3 && (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#E6F9F2] dark:bg-[#143328] border border-[#8DE3C4] dark:border-[#246950] text-xs font-extrabold text-[#177856] dark:text-[#6EE7B7]">
                    <span>Senha da conta atualizada!</span>
                    <button
                      type="button"
                      onClick={() => setPwdResetStep(1)}
                      className="underline font-black"
                    >
                      OK
                    </button>
                  </div>
                )}
                {pwdResetMsg && (
                  <p
                    className={`text-xs font-bold ${
                      pwdResetMsg.isError
                        ? 'text-[#C83265] dark:text-[#F9A8C6]'
                        : 'text-[#177856] dark:text-[#6EE7B7]'
                    }`}
                  >
                    {pwdResetMsg.text}
                  </p>
                )}
              </div>

              <div className="rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech flex flex-col justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-[#25233A] dark:text-[#F8F7FF] mb-2">
                    Privacidade e Portabilidade (LGPD)
                  </h3>
                  <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] leading-relaxed">
                    Exporte uma cópia integral dos dados da família em JSON ou reinicie o armazenamento local para testar o Onboarding inicial.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="cancel"
                    size="sm"
                    leftIcon={<Download size={14} />}
                    onClick={handleExportData}
                  >
                    Exportar JSON
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 size={14} />}
                    onClick={handleClearAllData}
                  >
                    Resetar Dados Locais
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Child Modal */}
      <ChildProfileModal
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
        initialProfile={selectedChildForEdit}
        onSave={saveChildProfile}
        onDelete={deleteChildProfile}
      />
    </div>
  );
};
