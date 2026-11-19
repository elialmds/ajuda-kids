import React, { useMemo } from 'react';
import { useApp } from '@/modules/context/AppContext';
import { EmotionCheckIn } from '@/modules/activities/EmotionCheckIn';
import { ChildTab } from '@/components/layout/ChildNavBar';
import { AudioNarrationButton } from '@/components/common/AudioNarrationButton';
import { storageService } from '@/services/storageService';
import { ACTIVITIES_DATABASE } from '@/data/activitiesData';
import {
  KID_CHARACTERS,
  getCompanionById,
  getCompanionBySkill
} from '@/data/charactersData';
import {
  CommunicationIllustration,
  ReasoningIllustration,
  AttentionIllustration,
  EmotionalIllustration,
  MotorIllustration,
  CreativityIllustration,
  KnowledgeIllustration,
  MathIllustration,
  MusicIllustration,
  LanguagesIllustration,
  Games3DHeroIllustration
} from '@/components/illustrations/HandDrawnIllustrations';
import {
  FlameStreakSvg,
  StarSymbolSvg
} from '@/components/illustrations/CustomIcons';
import { StatePill } from '@/design-system/EliteCards';
import { EliteCircularRing } from '@/design-system/EliteCharts';
import { WorldShortcut3DIcon, ShortcutIconKind } from '@/design-system/EliteIcons';
import { AjudaKidsMascot } from '@/components/common/AjudaKidsMascot';
import { WORLD_TOKENS } from '@/design-system/tokens';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Gamepad2,
  Play,
  Heart,
  Trophy,
  Target,
  CheckCircle2,
  Check,
  Star
} from 'lucide-react';
import { formatFriendlyDate, getTodayDateString } from '@/utils/dateUtils';
import { SkillArea } from '@/types';
import { audioService } from '@/services/audioService';

interface ChildHomeViewProps {
  onNavigateTab: (tab: ChildTab, filterArea?: SkillArea) => void;
  onOpenBreathingModal?: () => void;
}

const WORLD_DESCRIPTIONS: Record<SkillArea, { desc: string; cta: string }> = {
  communication: {
    desc: 'Sons das letras, formação de palavras, rimas e pequenas histórias.',
    cta: 'Explorar com a Lumi'
  },
  reasoning: {
    desc: 'Ordem da Sementinha, sequências lógicas, padrões e desafios de lógica.',
    cta: 'Descobrir com o Téo'
  },
  math: {
    desc: 'Ábaco visual, somas, subtrações, dobro e medidas com blocos táteis.',
    cta: 'Calcular com o Beto'
  },
  attention: {
    desc: 'Encontrar detalhes, foco seletivo e percepção visual.',
    cta: 'Treinar o Olhar'
  },
  emotional: {
    desc: 'Empatia, calma e respiração consciente do balãozinho.',
    cta: 'Sentir e Acalmar'
  },
  motor: {
    desc: 'Direita e Esquerda, equilíbrio corporal e alongamento divertido.',
    cta: 'Mexer o Corpo'
  },
  creativity: {
    desc: 'Desenho livre com carimbos, 12 desafios com guia, mistura de cores e Galeria!',
    cta: 'Abrir Ateliê com a Flora'
  },
  knowledge: {
    desc: 'Sistema Solar, Ciclo da Água, animais, habitats e profissões fascinantes!',
    cta: 'Explorar com o Kiko'
  },
  music: {
    desc: 'Notas musicais com som real, ecos rítmicos e famílias de instrumentos!',
    cta: 'Tocar com o Tom'
  },
  languages: {
    desc: 'Cores, animais, números e expressões do dia a dia em inglês divertido!',
    cta: 'Viajar com a Bella'
  }
};

function renderWorldScene(area: SkillArea, size = 86): React.ReactNode {
  switch (area) {
    case 'communication':
      return <CommunicationIllustration size={size} />;
    case 'reasoning':
      return <ReasoningIllustration size={size} />;
    case 'math':
      return <MathIllustration size={size} />;
    case 'attention':
      return <AttentionIllustration size={size} />;
    case 'emotional':
      return <EmotionalIllustration size={size} />;
    case 'motor':
      return <MotorIllustration size={size} />;
    case 'creativity':
      return <CreativityIllustration size={size} />;
    case 'music':
      return <MusicIllustration size={size} />;
    case 'languages':
      return <LanguagesIllustration size={size} />;
    case 'knowledge':
    default:
      return <KnowledgeIllustration size={size} />;
  }
}

export const ChildHomeView: React.FC<ChildHomeViewProps> = ({
  onNavigateTab,
  onOpenBreathingModal
}) => {
  const { activeChild, todayJourney, rewardStatus, progression, isDarkMode } = useApp();

  const completions = useMemo(
    () => (activeChild ? storageService.getActivityCompletions(activeChild.id) : []),
    [activeChild, progression?.totalXp]
  );

  if (!activeChild) {
    return null;
  }

  const childAvatarObj =
    KID_CHARACTERS.find((c) => c.name.toLowerCase() === (activeChild.avatar || '').toLowerCase()) ||
    KID_CHARACTERS[0];
  const companion = getCompanionById(activeChild.companionId || childAvatarObj.companionId);

  const completedSteps = todayJourney?.steps.filter((s) => s.status === 'completed').length || 0;
  const totalSteps = todayJourney?.steps.length || 6;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);
  const isJourneyDone = Boolean(todayJourney?.isCompleted);
  const currentLevel = progression?.level ?? 1;
  const currentLevelTitle = progression?.levelTitle ?? 'Aprendiz Curioso';
  const totalXp = progression?.totalXp ?? 0;
  const xpIntoLevel = progression?.xpIntoLevel ?? 0;
  const xpForNextLevel = progression?.xpForNextLevel ?? 100;
  const xpProgressPercent = progression?.progressPercent ?? 0;
  const unlockedMedalsCount = progression?.achievementsUnlockedCount ?? 0;
  const streakDays = progression?.streakDays ?? 0;

  const currentStepIdx = todayJourney?.currentStepIndex ?? 0;
  const currentStep = todayJourney?.steps[currentStepIdx] || todayJourney?.steps[0];
  const recommendedActivity = currentStep?.activity;
  const recommendedGuardian = recommendedActivity
    ? getCompanionBySkill(recommendedActivity.area)
    : companion;

  const greetingSpeech = `Olá, ${activeChild.nickname || activeChild.name}! Eu sou ${
    companion.name
  }, seu guardião no Mundo Ajuda Kids. Hoje nossa missão principal é: ${
    recommendedActivity?.title || 'explorar novas descobertas'
  }. Vamos começar?`;

  const renderWorldCard = (area: SkillArea, large = false) => {
    const token = WORLD_TOKENS[area];
    const guardian = getCompanionBySkill(area);
    const meta = WORLD_DESCRIPTIONS[area];
    const areaCount = ACTIVITIES_DATABASE.filter((a) => a.area === area).length;
    const areaCompleted = completions.filter((c) => c.area === area).length;

    return (
      <div
        key={area}
        onClick={() => onNavigateTab('learn', area)}
        style={{
          backgroundColor: isDarkMode ? token.darkCardBg : token.cardBg,
          borderColor: isDarkMode ? token.darkCardBorder : token.cardBorder,
          boxShadow: isDarkMode
            ? `0 5px 0 ${token.darkCardLip}, 0 12px 24px rgba(3, 6, 18, 0.45)`
            : `0 5px 0 ${token.cardLip}, 0 12px 24px rgba(37, 35, 58, 0.06)`
        }}
        className={`group rounded-[24px] p-5 sm:p-6 border-2 transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5 cursor-pointer flex flex-col justify-between relative overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="space-y-2 min-w-0 flex-1">
            {/* Guardian Pill Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                style={{
                  backgroundColor: isDarkMode ? token.darkBadgeBg : token.badgeBg,
                  color: isDarkMode ? token.darkBadgeText : token.badgeText,
                  borderColor: isDarkMode ? token.darkCardBorder : token.cardBorder
                }}
                className="inline-flex items-center gap-1.5 pl-1 pr-3 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wide shadow-xs"
              >
                <span className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
                  {guardian.renderCharacter(20, 'happy')}
                </span>
                <span>
                  {area === 'communication' || area === 'attention' || area === 'creativity'
                    ? 'Guardiã'
                    : 'Guardião'}{' '}
                  {token.guardianName} • {token.shortLabel}
                </span>
              </span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF] leading-snug pt-0.5">
              {token.worldName}
            </h3>

            <p className="text-xs sm:text-[13px] font-medium text-[#77758A] dark:text-[#D3CEF0] leading-relaxed">
              {meta.desc}
            </p>
          </div>

          <div
            style={{ backgroundColor: isDarkMode ? token.darkIllustrationBg : token.illustrationBg }}
            className="shrink-0 p-2 rounded-[22px] border-2 border-white dark:border-[#38316B] shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:rotate-1"
          >
            {renderWorldScene(area, large ? 86 : 72)}
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3 relative z-10">
          <span className="text-[11px] font-bold text-[#77758A] dark:text-[#B8B3D6]">
            {areaCount} missões{areaCompleted > 0 ? ` • ${areaCompleted} feitas` : ''}
          </span>

          <span
            style={{
              backgroundColor: token.ctaBg,
              boxShadow: `0 3px 0 ${token.accentDeep}`
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-white font-extrabold text-xs transition-transform group-hover:translate-x-0.5"
          >
            <span>{meta.cta}</span>
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-24 text-[#25233A] dark:text-[#F8F7FF]">
      {/* 1. HERO PANORÂMICO DE BOAS-VINDAS */}
      <section className="relative rounded-[28px] p-6 sm:p-8 bg-gradient-to-br from-[#F5F3FC] via-[#FFFFFF] to-[#EBF3FE] dark:from-[#27234D] dark:via-[#1E1B3A] dark:to-[#15132C] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-[0_6px_0_#D8D0F2,0_16px_36px_rgba(37,35,58,0.06)] dark:shadow-[0_6px_0_#0D0B1C,0_16px_36px_rgba(3,6,18,0.5)] overflow-hidden">
        <svg
          className="absolute -top-8 -right-8 w-56 h-56 opacity-35 dark:opacity-15 pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="110" cy="95" r="78" fill="#FFD34E" />
          <circle cx="38" cy="145" r="32" fill="#36C995" />
        </svg>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 max-w-2xl">
            <div className="relative shrink-0">
              <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-[26px] bg-white dark:bg-[#27234D] border-2 border-[#7047E8] shadow-[0_5px_0_#5933CC] flex items-center justify-center p-1.5">
                {childAvatarObj.renderAvatar(80)}
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[#7047E8] text-[#FFD34E] border-2 border-white dark:border-[#1E1B3A] text-[11px] font-extrabold shadow-sm tabular-nums">
                {activeChild.age} anos
              </span>
            </div>

            <div>
              {/* Date + XP + Medals + Steps Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] text-[11px] font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                  <Sparkles size={13} className="text-[#FF9B42]" />
                  <span>{formatFriendlyDate(getTodayDateString())}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0ECFF] dark:bg-[#282158] border border-[#C9BCFF] dark:border-[#493D9E] text-[11px] font-extrabold text-[#7047E8] dark:text-[#D7CBFF] tabular-nums">
                  <Trophy size={13} className="text-[#7047E8] dark:text-[#C4B5FD]" />
                  <span>
                    Nível {currentLevel} • {totalXp} XP
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5CC] dark:bg-[#332709] border border-[#FFE082] dark:border-[#634C14] text-[11px] font-extrabold text-[#8A5A00] dark:text-[#FFD34E] tabular-nums">
                  <StarSymbolSvg className="w-4 h-4" />
                  <span>{unlockedMedalsCount} medalhas</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E2] dark:bg-[#331F0E] border border-[#FFCB9B] dark:border-[#6E401A] text-[11px] font-extrabold text-[#B25400] dark:text-[#FF9B42] tabular-nums">
                  <FlameStreakSvg className="w-4 h-4" />
                  <span>
                    {completedSteps}/{totalSteps} passos hoje
                    {streakDays > 0 ? ` • ${streakDays}d` : ''}
                  </span>
                </div>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#25233A] dark:text-white tracking-tight leading-tight">
                Olá, {activeChild.nickname || activeChild.name}!
              </h1>

              {/* Companion Speech Bubble */}
              <div className="mt-3 p-3.5 sm:p-4 rounded-[20px] rounded-tl-sm bg-white dark:bg-[#121024] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-sm flex items-center justify-between gap-3">
                <p className="text-xs sm:text-sm font-bold text-[#25233A] dark:text-[#F8F7FF] leading-relaxed">
                  “{companion.name} diz: Vamos descobrir coisas incríveis hoje? Sua trilha tem{' '}
                  <span className="text-[#7047E8] dark:text-[#A78BFA] underline decoration-[#FFD34E] decoration-3 underline-offset-2 font-extrabold">
                    {totalSteps} passos divertidos
                  </span>
                  !”
                </p>
                <AudioNarrationButton textToSpeak={greetingSpeech} size="sm" />
              </div>

              {/* Barra de Progresso de Nível / XP */}
              <div className="mt-3 p-3 rounded-[18px] bg-white/95 dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B]">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-[#25233A] dark:text-[#F8F7FF] mb-1.5">
                  <span className="text-[#7047E8] dark:text-[#C4B5FD]">
                    Nível {currentLevel} • {currentLevelTitle}
                  </span>
                  <span className="tabular-nums text-[#77758A] dark:text-[#B8B3D6]">
                    {xpIntoLevel}/{xpForNextLevel} XP ({xpProgressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F5F3FC] dark:bg-[#1E1B3A] rounded-full overflow-hidden border border-[#E4DFF5] dark:border-[#38316B]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7047E8] via-[#4389F5] to-[#36C995] transition-all duration-500"
                    style={{ width: `${Math.max(6, xpProgressPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Mascot + Guardian + Daily Ring */}
          <div className="shrink-0 flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-center p-2.5 rounded-[24px] bg-white/90 dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] shadow-sm">
              <AjudaKidsMascot
                size={92}
                pose={isJourneyDone ? 'celebrating' : 'waving'}
              />
              <span className="mt-1 text-[10px] font-extrabold text-[#7047E8] dark:text-[#C4B5FD]">
                Ajuda KIDS
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative p-2.5 rounded-[26px] bg-white dark:bg-[#121024] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-sm">
                {companion.renderCharacter(98, isJourneyDone ? 'celebrating' : 'waving')}
              </div>
              <span className="mt-2 px-3 py-1 rounded-full bg-[#7047E8] text-white text-[11px] font-extrabold shadow-sm">
                Guardião {companion.name}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 1B. ATALHOS CIRCULARES 3D (Inspirado nas Referências EdTech) */}
      <section className="px-1">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {(
            [
              {
                label: 'Aprender',
                kind: 'learn',
                bg: 'from-[#EFE9FF] to-[#DDD2FF] dark:from-[#37287A] dark:to-[#241B4D]',
                onClick: () => onNavigateTab('learn')
              },
              {
                label: 'Matemática',
                kind: 'math',
                bg: 'from-[#FFF1DB] to-[#FFDAA3] dark:from-[#4E2F14] dark:to-[#2E1E14]',
                onClick: () => onNavigateTab('learn', 'math')
              },
              {
                label: 'Ateliê',
                kind: 'atelier',
                bg: 'from-[#FFE8F1] to-[#FFC7DD] dark:from-[#4C1F38] dark:to-[#2D1727]',
                onClick: () => onNavigateTab('learn', 'creativity')
              },
              {
                label: 'Música',
                kind: 'music',
                bg: 'from-[#F3EAFF] to-[#DFC8FF] dark:from-[#3B2266] dark:to-[#23183F]',
                onClick: () => onNavigateTab('learn', 'music')
              },
              {
                label: 'Jogos 3D',
                kind: 'games3d',
                bg: 'from-[#E4FFF5] to-[#BCF5DF] dark:from-[#163F34] dark:to-[#122B27]',
                onClick: () => onNavigateTab('play')
              },
              {
                label: 'Respirar',
                kind: 'breathe',
                bg: 'from-[#E7F6FF] to-[#C2E7FF] dark:from-[#193556] dark:to-[#15243D]',
                onClick: () =>
                  onOpenBreathingModal ? onOpenBreathingModal() : onNavigateTab('learn', 'emotional')
              }
            ] as { label: string; kind: ShortcutIconKind; bg: string; onClick: () => void }[]
          ).map((shortcut) => (
            <button
              key={shortcut.label}
              type="button"
              onClick={() => {
                audioService.playGentlePop();
                shortcut.onClick();
              }}
              className="group rounded-[24px] p-3.5 bg-white/95 dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] hover:border-[#7047E8] dark:hover:border-[#8D6BFF] ak-card-3d flex flex-col items-center gap-2.5"
            >
              <span
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${shortcut.bg} ak-sticker-badge flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
              >
                <WorldShortcut3DIcon kind={shortcut.kind} className="w-8 h-8" />
              </span>
              <span className="font-display text-xs sm:text-[13px] font-bold text-[#25233A] dark:text-[#F8F7FF]">
                {shortcut.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. MISSÃO PRINCIPAL DO DIA (6 COL) + TRILHA INTERATIVA EM S (6 COL) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {recommendedActivity && (
          <div className="lg:col-span-6 rounded-[26px] p-6 sm:p-7 bg-gradient-to-br from-[#F0ECFF] via-[#FFFFFF] to-[#EBF3FE] dark:from-[#282158] dark:via-[#1E1B3A] dark:to-[#18284D] border-2 border-[#C9BCFF] dark:border-[#493D9E] shadow-[0_6px_0_#A690F5,0_14px_30px_rgba(112,71,232,0.08)] dark:shadow-[0_6px_0_#0D0B1C,0_14px_30px_rgba(3,6,18,0.48)] flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                <StatePill
                  state={isJourneyDone ? 'completed' : 'recommended'}
                  customLabel={`Missão Principal • Passo ${Math.min(currentStepIdx + 1, totalSteps)}`}
                />
                <span className="px-3 py-1 rounded-full bg-white dark:bg-[#121024] text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF] flex items-center gap-1.5 border border-[#E4DFF5] dark:border-[#38316B] shadow-xs">
                  <Clock size={13} className="text-[#4389F5]" /> {recommendedActivity.durationMinutes} min
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 my-2">
                <div className="shrink-0 p-2.5 rounded-[24px] bg-white dark:bg-[#121024] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-sm">
                  {recommendedGuardian.renderCharacter(84, 'happy')}
                </div>
                <div className="text-center sm:text-left min-w-0 flex-1">
                  <span className="text-xs font-extrabold text-[#7047E8] dark:text-[#C4B5FD] uppercase tracking-wide">
                    Com {recommendedGuardian.name} • {recommendedGuardian.skillLabel}
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#25233A] dark:text-white leading-tight mt-1">
                    {recommendedActivity.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-[#77758A] dark:text-[#D3CEF0] mt-2 leading-relaxed">
                    {recommendedActivity.description}
                  </p>
                </div>
              </div>

              {/* Progresso da trilha do dia com Ring visual */}
              <div className="mt-4 p-3 rounded-[20px] bg-white/90 dark:bg-[#121024]/80 border border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[11px] font-extrabold uppercase text-[#7047E8] dark:text-[#C4B5FD] block">
                    Progresso na Aventura
                  </span>
                  <p className="text-xs font-bold text-[#25233A] dark:text-[#F8F7FF] mt-0.5">
                    {progressPercent}% da trilha de hoje concluída
                  </p>
                </div>
                <EliteCircularRing
                  value={completedSteps}
                  max={totalSteps}
                  size={56}
                  accentColor="#7047E8"
                  centerLabel={`${progressPercent}%`}
                />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E4DFF5] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#77758A] dark:text-[#B8B3D6]">
                {isJourneyDone
                  ? 'Todas as etapas de hoje foram concluídas!'
                  : rewardStatus?.canPlay
                  ? 'Parque 3D liberado! Siga explorando novas missões!'
                  : 'Conclua etapas para ganhar medalhas e estrelas!'}
              </span>
              <button
                type="button"
                onClick={() => {
                  audioService.playGentlePop();
                  onNavigateTab('learn');
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-[18px] bg-[#36C995] hover:bg-[#2EB887] text-white font-extrabold text-sm border-b-4 border-[#239B71] active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 shrink-0 shadow-sm"
              >
                <Play size={17} fill="white" />
                <span>{isJourneyDone ? 'Praticar Novamente' : 'Começar Missão'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Trilha Sinuosa Interativa em Mapa (Inspirada na Referência 1 "Yay World!") */}
        <div className="lg:col-span-6 rounded-[26px] p-5 sm:p-6 bg-gradient-to-b from-[#EAF9EE] via-[#DFF5E5] to-[#E9F3FE] dark:from-[#1A2B2B] dark:via-[#1E1B3A] dark:to-[#242048] border-2 border-[#B3E8CB] dark:border-[#345C4F] shadow-[0_6px_0_#7ACFA2,0_10px_24px_rgba(37,35,58,0.06)] dark:shadow-[0_6px_0_#0D0B1C,0_10px_24px_rgba(3,6,18,0.45)] flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#177A57] dark:text-[#6EE7B7]">
                  Mapa da Trilha Diária
                </span>
                <h3 className="font-display text-xl font-extrabold text-[#25233A] dark:text-white">
                  Passos da Jornada
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-white dark:bg-[#27234D] border border-[#9FE8CD] dark:border-[#2C5E4B] text-[#177A57] dark:text-[#6EE7B7] text-xs font-extrabold shadow-xs tabular-nums">
                {completedSteps}/{totalSteps} prontos
              </span>
            </div>

            {/* Winding S-Curve Trail */}
            <div className="relative rounded-[22px] bg-white/60 dark:bg-[#121024]/55 border border-[#C6EED8] dark:border-[#38316B] p-3.5 my-2 max-h-[305px] overflow-y-auto">
              {/* Subtle vertical winding path backdrop */}
              <svg
                className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-24 h-[calc(100%-32px)] pointer-events-none opacity-65 dark:opacity-45"
                viewBox="0 0 100 320"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M 28 16 C 85 52, 85 95, 28 135 C -15 170, 85 215, 72 255 C 62 285, 30 300, 30 312"
                  fill="none"
                  stroke="#9CDDBB"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M 28 16 C 85 52, 85 95, 28 135 C -15 170, 85 215, 72 255 C 62 285, 30 300, 30 312"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
              </svg>

              <div className="relative z-10 space-y-2.5">
                {todayJourney?.steps.map((st, idx) => {
                  const done = st.status === 'completed';
                  const current = idx === currentStepIdx && !done;
                  const alignRight = idx % 2 === 1;

                  return (
                    <div
                      key={st.activity.id}
                      className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}
                    >
                      <button
                        key={st.activity.id}
                        type="button"
                        onClick={() => {
                          audioService.playGentlePop();
                          onNavigateTab('learn');
                        }}
                        className={`w-[92%] sm:w-[88%] p-3 rounded-[22px] border-2 text-left transition-all flex items-center justify-between gap-2.5 hover:scale-[1.015] ak-sticker-badge ${
                          done
                            ? 'bg-[#ECFCF5] dark:bg-[#14332B] border-[#36C995]'
                            : current
                            ? 'bg-[#FFFBEF] dark:bg-[#2F243B] border-[#FFD34E] ring-2 ring-[#FFD34E]/55'
                            : 'bg-white dark:bg-[#1E1B3A] border-[#E4DFF5] dark:border-[#38316B]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-10 h-10 rounded-full text-sm font-display font-bold flex items-center justify-center shrink-0 border-2 border-white dark:border-white/20 shadow-sm ${
                              done
                                ? 'bg-gradient-to-br from-[#52E0AD] to-[#239B71] text-white'
                                : current
                                ? 'bg-gradient-to-br from-[#8B6CF2] to-[#7047E8] text-[#FFD34E]'
                                : 'bg-[#F5F3FC] dark:bg-[#27234D] text-[#7047E8] dark:text-[#C4B5FD]'
                            }`}
                          >
                            {done ? <Check size={16} strokeWidth={3} /> : idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="font-display text-xs sm:text-[13px] font-bold text-[#25233A] dark:text-[#F8F7FF] truncate block">
                              {st.activity.title}
                            </span>
                            {done && (
                              <span className="inline-flex items-center gap-0.5 mt-0.5">
                                <StarSymbolSvg className="w-3.5 h-3.5" />
                                <StarSymbolSvg className="w-3.5 h-3.5" />
                                <StarSymbolSvg className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </div>

                        <StatePill
                          state={done ? 'completed' : current ? 'recommended' : 'available'}
                          customLabel={done ? 'Feito' : current ? 'Agora' : `${st.activity.durationMinutes}m`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full h-3.5 bg-white dark:bg-[#121024] rounded-full overflow-hidden p-0.5 border border-[#B3E8CB] dark:border-[#345C4F]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7047E8] via-[#4389F5] to-[#36C995] transition-all duration-500"
              style={{ width: `${Math.max(10, progressPercent)}%` }}
            />
          </div>
        </div>
      </section>

      {/* 3. MUNDOS DE DESCOBERTA (TODAS AS 10 ÁREAS COM ILUSTRAÇÕES E ESTILO LINGOKIDS/DUOLINGO) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#7047E8] dark:text-[#C4B5FD]">
              10 Ilhas Guiadas por Personagens • {ACTIVITIES_DATABASE.length} Atividades
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#25233A] dark:text-white">
              Mundos de Aprendizado
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('learn', 'all' as any)}
            className="btn-elite self-start sm:self-auto px-4 py-2 rounded-2xl bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] ak-card-3d text-xs font-black text-[#25233A] dark:text-white hover:bg-[#F5F3FC] dark:hover:bg-[#27234D] flex items-center gap-1.5"
          >
            <span>Ver Biblioteca Completa</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Row 1: Comunicação + Lógica + Matemática */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderWorldCard('communication', false)}
          {renderWorldCard('reasoning', false)}
          {renderWorldCard('math', false)}
        </div>

        {/* Row 2: Atenção + Emoções + Movimento + Criatividade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderWorldCard('attention', false)}
          {renderWorldCard('emotional', false)}
          {renderWorldCard('motor', false)}
          {renderWorldCard('creativity', false)}
        </div>

        {/* Row 3: Conhecimentos Gerais + Música & Ritmo + Inglês & Idiomas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderWorldCard('knowledge', false)}
          {renderWorldCard('music', false)}
          {renderWorldCard('languages', false)}
        </div>
      </section>

      {/* 4. PORTAL DO PARQUE 3D + CANTINHO EMOCIONAL RECONSTRUÍDO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 rounded-[26px] p-6 sm:p-7 bg-gradient-to-br from-[#7047E8] via-[#5E35D9] to-[#4389F5] dark:from-[#282158] dark:via-[#1E1B3A] dark:to-[#18284D] border-2 border-[#5933CC] dark:border-[#493D9E] shadow-[0_6px_0_#4C2BB5,0_14px_28px_rgba(112,71,232,0.18)] dark:shadow-[0_6px_0_#0D0B1C,0_14px_28px_rgba(3,6,18,0.5)] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#36C995] text-white text-[11px] font-extrabold">
              <Gamepad2 size={14} /> 6 Jogos 3D Interativos
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Parque de Brincadeiras 3D
            </h3>
            <p className="text-xs sm:text-sm text-[#EEF2FF] leading-relaxed max-w-md font-medium">
              Batata Quente, Pato Pato Ganso, Morto-Vivo, Memória 3D, Sequência de Cores e Mestre Mandou com cenários animados!
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab('play')}
                className="px-6 py-3.5 rounded-[18px] bg-[#FFD34E] hover:bg-[#FFCA2C] text-[#25233A] font-extrabold text-xs border-b-4 border-[#D89B00] active:translate-y-0.5 transition-all inline-flex items-center gap-2 shadow-sm"
              >
                <span>Entrar no Parque 3D</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="shrink-0 bg-white/15 p-3 rounded-[24px] border border-white/25">
            <Games3DHeroIllustration size={120} />
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <EmotionCheckIn />
          {onOpenBreathingModal && (
            <button
              type="button"
              onClick={onOpenBreathingModal}
              className="w-full p-4 rounded-[22px] bg-[#FFF5CC] dark:bg-[#332709] border-2 border-[#FFD34E] dark:border-[#634C14] shadow-[0_4px_0_#D89B00] dark:shadow-[0_4px_0_#130E07] text-[#25233A] dark:text-[#FDE68A] font-extrabold text-xs flex items-center justify-between hover:bg-[#FFEEAA] dark:hover:bg-[#40320E] transition-all"
            >
              <span className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-white dark:bg-[#121024] flex items-center justify-center border border-[#FFD34E] dark:border-[#634C14]">
                  <Heart size={16} className="text-[#F16E9A]" fill="#F16E9A" />
                </span>
                <span>Pausa da Calma • Respiração do Balãozinho</span>
              </span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </section>

      {/* 5. DESAFIOS DE HOJE & DA SEMANA (COM XP AUTOMÁTICO) */}
      {progression && (progression.dailyChallenges.length > 0 || progression.weeklyChallenges.length > 0) && (
        <section className="rounded-[26px] p-6 sm:p-7 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-[0_6px_0_#D8D0F2,0_14px_28px_rgba(37,35,58,0.06)] dark:shadow-[0_6px_0_#0D0B1C,0_14px_28px_rgba(3,6,18,0.45)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#7047E8] dark:text-[#C4B5FD]">
                <Target size={14} /> Missões Rotativas com XP Extra
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#25233A] dark:text-white">
                Desafios de Hoje &amp; da Semana
              </h3>
            </div>
            <span className="text-xs font-bold text-[#77758A] dark:text-[#B8B3D6]">
              Conclua para ganhar recompensas automáticas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Desafios de Hoje', badge: 'Diário', items: progression.dailyChallenges },
              { title: 'Desafios da Semana', badge: 'Semanal', items: progression.weeklyChallenges }
            ].map((group) => (
              <div
                key={group.title}
                className="p-4 rounded-[22px] bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-sm font-extrabold text-[#25233A] dark:text-white">
                    {group.title}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#F0ECFF] dark:bg-[#282158] text-[#7047E8] dark:text-[#D7CBFF] border border-[#C9BCFF] dark:border-[#493D9E]">
                    {group.badge}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {group.items.map((ch) => {
                    const pct = Math.min(100, Math.round((ch.currentCount / Math.max(1, ch.targetCount)) * 100));
                    return (
                      <div
                        key={ch.id}
                        className={`p-3 rounded-2xl border-2 transition-all ${
                          ch.completed
                            ? 'bg-[#E9FBF4] dark:bg-[#16382C] border-[#36C995]/50 dark:border-[#36C995]/50'
                            : 'bg-white dark:bg-[#1E1B3A] border-[#E4DFF5] dark:border-[#38316B]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {ch.completed && (
                                <CheckCircle2 size={14} className="shrink-0 text-[#36C995] dark:text-[#6EE7B7]" />
                              )}
                              <span className="text-xs font-black text-[#25233A] dark:text-white truncate">
                                {ch.title}
                              </span>
                            </div>
                            <p className="text-[11px] font-semibold text-[#77758A] dark:text-[#C5BFE6] mt-0.5">
                              {ch.description}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums border ${
                              ch.completed
                                ? 'bg-[#DCF5EC] dark:bg-[#1E4731] text-[#1E7E5B] dark:text-[#6EE7B7] border-[#36C995]/50 dark:border-[#36C995]/40'
                                : 'bg-[#FFF6D1] dark:bg-[#2E2514] text-[#8A5A00] dark:text-[#FFD34E] border-[#FFD34E] dark:border-[#8D6C1E]'
                            }`}
                          >
                            {ch.completed ? 'Concluído!' : `+${ch.xpReward} XP`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#F5F3FC] dark:bg-[#121024] rounded-full overflow-hidden border border-[#E4DFF5] dark:border-[#38316B]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                ch.completed ? 'bg-[#36C995]' : 'bg-[#7047E8]'
                              }`}
                              style={{ width: `${Math.max(4, pct)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-black tabular-nums text-[#77758A] dark:text-[#C5BFE6]">
                            {ch.currentCount}/{ch.targetCount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
