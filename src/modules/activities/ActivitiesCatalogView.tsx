import React, { useState, useEffect } from 'react';
import { useApp } from '@/modules/context/AppContext';
import { ACTIVITIES_DATABASE } from '@/data/activitiesData';
import { ActivityItem, SkillArea } from '@/types';
import { ActivityRunner, renderSkillIllustration } from './ActivityRunner';
import { CreativeAtelierView } from './CreativeAtelierView';
import { MUNDO_COMPANIONS, getCompanionBySkill } from '@/data/charactersData';
import { journeyService } from '@/services/journeyService';
import { storageService } from '@/services/storageService';
import { progressionService } from '@/services/progressionService';
import { audioService } from '@/services/audioService';
import { AtelierBrushSvg, getSkillAreaIcon } from '@/components/illustrations/CustomIcons';
import { ActivityTypeSvgIcon } from '@/design-system/EliteIcons';
import { StatePill } from '@/design-system/EliteCards';
import { WORLD_TOKENS } from '@/design-system/tokens';
import {
  Compass,
  Clock,
  Play,
  CheckCircle2,
  Sparkles,
  Layers,
  Search,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActivitiesCatalogViewProps {
  initialArea?: SkillArea | 'all';
}

const AREA_WORLDS: {
  area: SkillArea | 'all';
  label: string;
  worldTitle: string;
  worldDesc: string;
  bgClass: string;
  borderClass: string;
}[] = [
  {
    area: 'all',
    label: 'Trilha & Todos',
    worldTitle: 'Mundos de Aprendizado',
    worldDesc: 'Percorra sua trilha diária de 6 passos ou explore todas as 10 ilhas temáticas.',
    bgClass: 'from-[#EAF5E1] via-[#FFFFFF] to-[#EAE5FB] dark:from-[#26204D] dark:via-[#1E1B3A] dark:to-[#121024]',
    borderClass: 'border-[#B9DBC5] dark:border-[#344474]'
  },
  {
    area: 'communication',
    label: 'Comunicação',
    worldTitle: 'Ilha da Comunicação e Fala',
    worldDesc: 'Com a Guardiã Lumi: sons das letras, palavras, rimas e compreensão.',
    bgClass: 'from-[#D7ECFB] via-[#FFFFFF] to-[#ECF7FE] dark:from-[#1B2B4B] dark:via-[#1E1B3A] dark:to-[#121024]',
    borderClass: 'border-[#83BCE0] dark:border-[#2E547A]'
  },
  {
    area: 'reasoning',
    label: 'Raciocínio',
    worldTitle: 'Oficina da Descoberta e Lógica',
    worldDesc: 'Com o Guardião Téo: sequências lógicas, números, associações e enigmas.',
    bgClass: 'from-[#EDE0FB] via-[#FFFFFF] to-[#F5EEFE] dark:from-[#282158] dark:via-[#1E1B3A] dark:to-[#121024]',
    borderClass: 'border-[#C7A9EA] dark:border-[#55428A]'
  },
  {
    area: 'attention',
    label: 'Atenção',
    worldTitle: 'Bosque da Atenção e Foco',
    worldDesc: 'Com a Guardiã Maya: observação cuidadosa, formas visuais e memória.',
    bgClass: 'from-[#E2F3D7] via-[#FFFFFF] to-[#EBF9F2] dark:from-[#1A332D] dark:via-[#1E1B3A] dark:to-[#121024]',
    borderClass: 'border-[#A8D594] dark:border-[#2F6348]'
  },
  {
    area: 'emotional',
    label: 'Emoções',
    worldTitle: 'Jardim das Emoções',
    worldDesc: 'Com o Guardião Sol: sentimentos, empatia, gentileza e respiração calma.',
    bgClass: 'from-[#FDF0C4] via-[#FFFFFF] to-[#FFF6DA] dark:from-[#33270E] dark:via-[#1E1B3A] dark:to-[#121024]',
    borderClass: 'border-[#ECCD69] dark:border-[#785E24]'
  },
  {
    area: 'motor',
    label: 'Corpo & Movimento',
    worldTitle: 'Parque de Movimento e Direções',
    worldDesc: 'Com o Guardião Pipoca: lateralidade, equilíbrio e desafios fora da tela.',
    bgClass: 'from-[#F9DEE4] via-[#FFFFFF] to-[#FDECF3] dark:from-[#38203B] dark:via-[#1E1B3A] dark:to-[#121024]',
    borderClass: 'border-[#E6AAB7] dark:border-[#733A4F]'
  },
  {
    area: 'creativity',
    label: 'Criatividade',
    worldTitle: 'Ateliê Criativo e Cores',
    worldDesc: 'Com a Guardiã Flora: desenho livre, pintura guiada, cores mágicas e galeria!',
    bgClass: 'from-[#FCE1EE] via-[#FFFFFF] to-[#FFF0F7] dark:from-[#381E3E] dark:via-[#1E1B3A] dark:to-[#121024]',
    borderClass: 'border-[#F19EC4] dark:border-[#7A3860]'
  },
  {
    area: 'knowledge',
    label: 'Conhecimentos',
    worldTitle: 'Estação do Mundo Curioso',
    worldDesc: 'Com o Guardião Kiko: Sistema Solar, natureza, água, habitats e profissões!',
    bgClass: 'from-[#DCECFB] via-[#FFFFFF] to-[#EEF6FF] dark:from-[#1B2B52] dark:via-[#1E1B3A] dark:to-[#121024]',
    borderClass: 'border-[#7FB7EA] dark:border-[#325785]'
  },
  {
    area: 'math',
    label: 'Matemática Lúdica',
    worldTitle: 'Vila da Matemática',
    worldDesc: 'Com o Guardião Beto: contagens visuais, somas divertidas e formas mágicas!',
    bgClass: 'from-[#DDF5EA] via-[#FFFFFF] to-[#E9FBF4] dark:from-[#16382C] dark:via-[#1E1B3A] dark:to-[#121024]',
    borderClass: 'border-[#78CFA8] dark:border-[#2F7558]'
  },
  {
    area: 'music',
    label: 'Música & Ritmo',
    worldTitle: 'Palco da Música & Ritmo',
    worldDesc: 'Com o Guardião Tom: notas musicais, sequências sonoras e instrumentos.',
    bgClass: 'from-[#F5E1FA] via-[#FFFFFF] to-[#F8ECFE] dark:from-[#341D4A] dark:via-[#1E1B3A] dark:to-[#121024]',
    borderClass: 'border-[#C88CE0] dark:border-[#6B3B85]'
  },
  {
    area: 'languages',
    label: 'Inglês & Idiomas',
    worldTitle: 'Ponte dos Idiomas',
    worldDesc: 'Com a Guardiã Bella: primeiras palavras em inglês, cores e expressões.',
    bgClass: 'from-[#DDF2F8] via-[#FFFFFF] to-[#ECFAFD] dark:from-[#17364A] dark:via-[#1E1B3A] dark:to-[#121024]',
    borderClass: 'border-[#76C8E2] dark:border-[#2D6E85]'
  }
];

export const ActivitiesCatalogView: React.FC<ActivitiesCatalogViewProps> = ({
  initialArea = 'all'
}) => {
  const { activeChild, todayJourney, refreshJourney, refreshRewards, refreshProgression, showToast, isDarkMode } = useApp();
  const [selectedArea, setSelectedArea] = useState<SkillArea | 'all'>(initialArea);
  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'journey_steps' | 'all_catalog' | 'atelier'>(
    initialArea && initialArea !== 'all' ? 'all_catalog' : 'journey_steps'
  );
  const [catalogSearch, setCatalogSearch] = useState('');
  const [ageFilterMode, setAgeFilterMode] = useState<'child' | 'all'>('child');

  useEffect(() => {
    if (initialArea && initialArea !== 'all') {
      setSelectedArea(initialArea);
      setViewMode('all_catalog');
    }
  }, [initialArea]);

  if (!activeChild) return null;

  const currentWorld = AREA_WORLDS.find((w) => w.area === selectedArea) || AREA_WORLDS[0];
  const worldGuardian =
    selectedArea !== 'all' ? getCompanionBySkill(selectedArea) : MUNDO_COMPANIONS[0];

  const normalizedSearch = catalogSearch.trim().toLowerCase();
  const filteredActivities = ACTIVITIES_DATABASE.filter((item) => {
    const matchesArea = selectedArea === 'all' || item.area === selectedArea;
    const matchesAge =
      ageFilterMode === 'all' ||
      item.ageGroup === activeChild.ageGroup ||
      item.id.includes('all');
    const matchesSearch =
      normalizedSearch.length === 0 ||
      item.title.toLowerCase().includes(normalizedSearch) ||
      item.description.toLowerCase().includes(normalizedSearch);
    return matchesArea && matchesAge && matchesSearch;
  });

  const handleStartJourneyStep = (index: number) => {
    if (!todayJourney || !todayJourney.steps[index]) return;
    audioService.playGentlePop();
    setActiveStepIndex(index);
    setActiveActivity(todayJourney.steps[index].activity);
  };

  const handleStartDirectActivity = (act: ActivityItem) => {
    audioService.playGentlePop();
    setActiveStepIndex(null);
    setActiveActivity(act);
  };

  const handleFinishActivity = async (score = 100) => {
    if (activeActivity) {
      await storageService.recordActivityCompletion({
        childId: activeChild.id,
        familyId: activeChild.familyId,
        activityId: activeActivity.id,
        activityTitle: activeActivity.title,
        area: activeActivity.area,
        durationMinutes: activeActivity.durationMinutes,
        score
      });
    }

    if (activeStepIndex !== null && todayJourney) {
      const updated = await journeyService.updateStepProgress(
        todayJourney,
        activeStepIndex,
        'completed',
        score
      );
      await refreshJourney();
      await refreshRewards();
      await refreshProgression();

      if (updated.isCompleted) {
        audioService.playFanfare();
        try {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        showToast('Parabéns! Você completou todas as 6 etapas da sua jornada de hoje!');
      } else {
        showToast(`Passo ${activeStepIndex + 1} concluído com sucesso!`);
      }
    } else {
      storageService.addTodayMinutesSpent(activeChild.id, activeActivity?.durationMinutes || 5);
      const xpOutcome = activeActivity
        ? await progressionService.recordCatalogActivityXp(
            activeChild.id,
            activeActivity.id,
            activeActivity.title,
            activeActivity.area,
            score
          )
        : null;
      await refreshRewards();
      await refreshProgression();
      const xpNote = xpOutcome && xpOutcome.xpAdded > 0 ? ` (+${xpOutcome.xpAdded} XP)` : '';
      const unlocked = xpOutcome?.newlyUnlockedAchievements;
      const badgeNote = unlocked && unlocked.length > 0 ? ` • Nova medalha: ${unlocked[0].title}!` : '';
      showToast(`Atividade "${activeActivity?.title}" concluída com carinho!${xpNote}${badgeNote}`);
    }

    setActiveActivity(null);
    setActiveStepIndex(null);
  };

  if (activeActivity) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto pb-20 text-[#25233A] dark:text-[#F8FAFC]">
        <button
          type="button"
          onClick={() => {
            setActiveActivity(null);
            setActiveStepIndex(null);
          }}
          className="inline-flex items-center gap-2 text-xs font-black text-[#25233A] dark:text-white hover:underline px-3.5 py-2 rounded-2xl bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-sticker"
        >
          <span>← Voltar para os Mundos de Aprendizado</span>
        </button>

        <ActivityRunner
          activity={activeActivity}
          stepNumber={activeStepIndex !== null ? activeStepIndex + 1 : undefined}
          totalSteps={todayJourney?.steps.length}
          onComplete={handleFinishActivity}
          onCancel={() => {
            setActiveActivity(null);
            setActiveStepIndex(null);
          }}
        />
      </div>
    );
  }

  const completedStepsCount =
    todayJourney?.steps.filter((s) => s.status === 'completed').length || 0;
  const totalStepsCount = todayJourney?.steps.length || 6;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 text-[#25233A] dark:text-[#F8FAFC]">
      {/* 1. Seletor das 10 Ilhas Temáticas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {AREA_WORLDS.map((w) => {
          const isSelected = selectedArea === w.area && viewMode !== 'atelier';
          return (
            <button
              key={w.area}
              type="button"
              onClick={() => {
                audioService.playGentlePop();
                setSelectedArea(w.area);
                setViewMode(w.area !== 'all' ? 'all_catalog' : 'journey_steps');
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap border-2 border-b-4 transition-all ${
                isSelected
                  ? 'bg-[#7047E8] dark:bg-[#7047E8] text-white border-[#522BBF] dark:border-[#8B68F7] scale-[1.02] shadow-sticker'
                  : 'bg-white dark:bg-[#1E1B3A] text-[#25233A] dark:text-[#D8D2F8] border-[#E4DFF5] dark:border-[#38316B] hover:bg-[#F5F3FC] dark:hover:bg-[#27234D]'
              }`}
            >
              {w.area !== 'all' && getSkillAreaIcon(w.area, 'w-4 h-4 shrink-0')}
              <span>{w.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Hero Temático da Categoria Selecionada */}
      <div
        className={`rounded-[36px] p-6 sm:p-8 bg-gradient-to-br ${currentWorld.bgClass} border-2 border-b-4 ${currentWorld.borderClass} shadow-soft`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#121024] text-xs font-black text-[#25233A] dark:text-[#E2E8F0] mb-2 border border-[#E4DFF5] dark:border-[#38316B]">
              <Compass size={14} className="text-[#1E82CE] dark:text-[#60A5FA]" />
              <span>Faixa Etária: {activeChild.ageGroup} anos</span>
            </div>
            <h1 className="ak-title-display font-display text-2xl sm:text-3xl font-bold text-[#25233A] dark:text-white">
              {viewMode === 'atelier' ? 'Ateliê de Desenho e Galeria' : currentWorld.worldTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#33466E] dark:text-[#CBD5E1] mt-1 font-semibold max-w-xl">
              {viewMode === 'atelier'
                ? 'Crie artes livres, teste 12 desafios com guia visual e salve tudo na sua Galeria!'
                : currentWorld.worldDesc}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <div className="ak-sticker-badge p-2 rounded-3xl bg-white dark:bg-[#121024] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-sticker">
              {worldGuardian.renderCharacter(76, 'waving')}
            </div>

            <div className="ak-card-3d p-4 rounded-2xl bg-white dark:bg-[#121024] border-2 border-[#36C995]/50 dark:border-[#36C995]/40 border-b-4 text-center shadow-sm min-w-[120px]">
              <span className="text-[10px] font-black text-[#26612B] dark:text-[#6EE7B7] uppercase block">
                Trilha Hoje
              </span>
              <span className="text-xl font-black text-[#25233A] dark:text-white">
                {completedStepsCount}/{totalStepsCount}
              </span>
              <span className="text-[10px] font-bold text-[#5A6D91] dark:text-[#94A3B8] block">Concluídas</span>
            </div>
          </div>
        </div>

        {/* Mode Switcher including Prominent Atelier Button */}
        <div className="flex flex-wrap items-center gap-2.5 mt-6 pt-5 border-t border-slate-900/10 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              audioService.playGentlePop();
              setViewMode('journey_steps');
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black border-2 border-b-4 transition-all ${
              viewMode === 'journey_steps'
                ? 'bg-[#7047E8] dark:bg-[#7047E8] text-white border-[#522BBF] dark:border-[#8B68F7] shadow-sticker'
                : 'bg-white dark:bg-[#1E1B3A] text-[#25233A] dark:text-[#D8D2F8] border-[#E4DFF5] dark:border-[#38316B] hover:bg-[#F5F3FC] dark:hover:bg-[#27234D]'
            }`}
          >
            Trilha Diária ({totalStepsCount} Passos)
          </button>
          <button
            type="button"
            onClick={() => {
              audioService.playGentlePop();
              setViewMode('all_catalog');
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black border-2 border-b-4 transition-all ${
              viewMode === 'all_catalog'
                ? 'bg-[#7047E8] dark:bg-[#7047E8] text-white border-[#522BBF] dark:border-[#8B68F7] shadow-sticker'
                : 'bg-white dark:bg-[#1E1B3A] text-[#25233A] dark:text-[#D8D2F8] border-[#E4DFF5] dark:border-[#38316B] hover:bg-[#F5F3FC] dark:hover:bg-[#27234D]'
            }`}
          >
            Atividades do Mundo ({filteredActivities.length})
          </button>
          <button
            type="button"
            onClick={() => {
              audioService.playGentlePop();
              setViewMode('atelier');
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black border-2 border-b-4 transition-all ${
              viewMode === 'atelier'
                ? 'bg-pink-500 text-white border-pink-700'
                : 'bg-pink-50 dark:bg-[#2D1B2E] text-pink-800 dark:text-[#F9A8D4] border-pink-200 dark:border-[#6B2D5C] hover:bg-pink-100 dark:hover:bg-[#3A223D]'
            }`}
          >
            <AtelierBrushSvg className="w-4 h-4" />
            <span>Ateliê Criativo & Galeria</span>
          </button>
        </div>
      </div>

      {/* MODO C: Estúdio Completo Ateliê Criativo */}
      {viewMode === 'atelier' && <CreativeAtelierView />}

      {/* 3. MODO A: Jornada Passo a Passo (6 etapas) */}
      {viewMode === 'journey_steps' && (
        <div className="space-y-3.5">
          {todayJourney?.steps.map((step, idx) => {
            const isDone = step.status === 'completed';
            const isCurrent = idx === todayJourney.currentStepIndex && !isDone;
            const stepNum = idx + 1;
            const stepGuardian = getCompanionBySkill(step.activity.area);
            const worldToken = WORLD_TOKENS[step.activity.area];
            const taskCount = step.activity.tasks?.length || 1;
            const cardState = isDone ? 'completed' : isCurrent ? 'recommended' : 'available';

            return (
              <div
                key={step.activity.id}
                style={{
                  borderColor: isDone
                    ? isDarkMode ? '#33754C' : '#65C44E'
                    : isCurrent
                    ? isDarkMode ? '#B4831D' : '#F4B41A'
                    : isDarkMode ? worldToken.darkCardBorder : worldToken.cardBorder,
                  boxShadow: `0 5px 0 ${
                    isDone
                      ? isDarkMode ? '#14291E' : '#3E9C28'
                      : isCurrent
                      ? isDarkMode ? '#3D2E0A' : '#CE8C00'
                      : isDarkMode ? worldToken.darkCardLip : worldToken.cardLip
                  }`
                }}
                className={`rounded-[30px] p-5 sm:p-6 transition-all border-2 ${
                  isDone
                    ? 'bg-[#F0FAEB] dark:bg-[#172822]'
                    : isCurrent
                    ? 'bg-[#FFFDF0] dark:bg-[#262019]'
                    : 'bg-white dark:bg-[#1E1B3A]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-start gap-4 min-w-0">
                    <div
                      style={{
                        backgroundColor: isDarkMode ? worldToken.darkIllustrationBg : worldToken.illustrationBg,
                        borderColor: isDarkMode ? worldToken.darkCardBorder : worldToken.cardBorder
                      }}
                      className="shrink-0 p-2 rounded-2xl border-2"
                    >
                      {renderSkillIllustration(step.activity.area, 64)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          style={{
                            backgroundColor: isDarkMode ? worldToken.darkBadgeBg : worldToken.illustrationBg,
                            color: isDarkMode ? worldToken.darkBadgeText : worldToken.badgeText
                          }}
                          className="text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full"
                        >
                          Passo {stepNum} • {stepGuardian.name}
                        </span>
                        <span className="text-xs font-bold text-[#5A6D91] dark:text-[#94A3B8] flex items-center gap-1">
                          <Clock size={12} /> {step.activity.durationMinutes} min
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#25233A] dark:text-[#E2E8F0] bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] px-2.5 py-0.5 rounded-full">
                          <ActivityTypeSvgIcon type={step.activity.content.type} className="w-3.5 h-3.5" />
                          <span>{taskCount > 1 ? `${taskCount} etapas` : '1 etapa'}</span>
                        </span>
                        <StatePill state={cardState} />
                      </div>

                      <h3 className="ak-title-display font-display text-lg sm:text-xl font-bold text-[#25233A] dark:text-white leading-tight">
                        {step.activity.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#33466E] dark:text-[#CBD5E1] mt-1 font-semibold leading-relaxed">
                        {step.activity.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleStartJourneyStep(idx)}
                      className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black border-b-4 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 ${
                        isDone
                          ? 'bg-[#DCF5D2] dark:bg-[#1C3A2B] text-[#1E6917] dark:text-[#6EE7B7] border-[#65C44E] dark:border-[#2E7551]'
                          : 'bg-[#48C71E] hover:bg-[#3EB516] text-white border-[#2FA10D]'
                      }`}
                    >
                      <Play size={14} fill="currentColor" />
                      <span>{isDone ? 'Praticar de Novo' : 'Iniciar Passo'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODO B: Catálogo de Atividades do Mundo Selecionado */}
      {viewMode === 'all_catalog' && (
        <div className="space-y-4">
          <div className="ak-card-3d rounded-3xl p-4 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6D91] dark:text-[#94A3B8]"
              />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Buscar missão por nome, número, som ou idioma..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border-2 border-[#DDD6F3] dark:border-[#38316B] text-xs sm:text-sm font-semibold text-[#25233A] dark:text-white placeholder:text-[#77758A] dark:placeholder:text-[#8E87B8] focus:outline-none focus:border-[#7047E8]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  audioService.playGentlePop();
                  setAgeFilterMode('child');
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black border-2 transition-all ${
                  ageFilterMode === 'child'
                    ? 'bg-[#7047E8] dark:bg-[#7047E8] text-white border-[#522BBF] dark:border-[#8B68F7] shadow-sticker'
                    : 'bg-[#F5F3FC] dark:bg-[#121024] text-[#25233A] dark:text-[#D8D2F8] border-[#E4DFF5] dark:border-[#38316B]'
                }`}
              >
                Para {activeChild.ageGroup} anos
              </button>
              <button
                type="button"
                onClick={() => {
                  audioService.playGentlePop();
                  setAgeFilterMode('all');
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black border-2 transition-all ${
                  ageFilterMode === 'all'
                    ? 'bg-[#7047E8] dark:bg-[#7047E8] text-white border-[#522BBF] dark:border-[#8B68F7] shadow-sticker'
                    : 'bg-[#F5F3FC] dark:bg-[#121024] text-[#25233A] dark:text-[#D8D2F8] border-[#E4DFF5] dark:border-[#38316B]'
                }`}
              >
                Todas as idades
              </button>
              <span className="px-2.5 py-1 rounded-xl bg-[#F3EFFF] dark:bg-[#27234D] text-[11px] font-black text-[#7047E8] dark:text-[#C4B5FD] border border-[#DDD6F3] dark:border-[#493D9E]">
                {filteredActivities.length} {filteredActivities.length === 1 ? 'missão' : 'missões'}
              </span>
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="ak-card-3d rounded-[28px] p-8 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] text-center space-y-3">
              <p className="text-sm font-black text-[#25233A] dark:text-white">
                Nenhuma missão encontrada com esse filtro.
              </p>
              <p className="text-xs font-semibold text-[#5A6D91] dark:text-[#94A3B8]">
                Experimente limpar a busca ou mostrar missões de todas as idades!
              </p>
              <div className="flex items-center justify-center gap-2">
                {catalogSearch && (
                  <button
                    type="button"
                    onClick={() => setCatalogSearch('')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5843F4] text-white text-xs font-black"
                  >
                    <RotateCcw size={13} />
                    <span>Limpar busca</span>
                  </button>
                )}
                {ageFilterMode !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setAgeFilterMode('all')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#E4DFF5] dark:border-[#38316B] text-xs font-black text-[#25233A] dark:text-white"
                  >
                    <span>Ver todas as idades</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActivities.map((act) => {
            const comp = getCompanionBySkill(act.area);
            const worldToken = WORLD_TOKENS[act.area];
            const taskCount = act.tasks?.length || 1;
            return (
              <div
                key={act.id}
                style={{
                  backgroundColor: isDarkMode ? worldToken.darkCardBg : '#FFFDF8',
                  borderColor: isDarkMode ? worldToken.darkCardBorder : worldToken.cardBorder,
                  boxShadow: isDarkMode
                    ? `0 5px 0 ${worldToken.darkCardLip}, 0 8px 18px rgba(3, 6, 18, 0.42)`
                    : `0 5px 0 ${worldToken.cardLip}, 0 8px 18px rgba(30, 43, 72, 0.05)`
                }}
                className="rounded-[30px] p-5 sm:p-6 border-2 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      style={{
                        backgroundColor: isDarkMode ? worldToken.darkIllustrationBg : worldToken.illustrationBg,
                        borderColor: isDarkMode ? worldToken.darkCardBorder : worldToken.cardBorder
                      }}
                      className="shrink-0 p-2 rounded-2xl border-2"
                    >
                      {renderSkillIllustration(act.area, 56)}
                    </div>
                    <div className="text-right space-y-1.5">
                      <span
                        style={{
                          backgroundColor: isDarkMode ? worldToken.darkBadgeBg : worldToken.illustrationBg,
                          color: isDarkMode ? worldToken.darkBadgeText : worldToken.badgeText
                        }}
                        className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block"
                      >
                        {comp.skillLabel}
                      </span>
                      <div className="flex items-center justify-end gap-2 text-xs font-bold text-[#5A6D91] dark:text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {act.durationMinutes} min
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#25233A] dark:text-[#E2E8F0] bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] px-2 py-0.5 rounded-full">
                          <ActivityTypeSvgIcon type={act.content.type} className="w-3.5 h-3.5" />
                          <span>{taskCount > 1 ? `${taskCount} etapas` : 'Desafio'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="ak-title-display font-display font-bold text-lg text-[#25233A] dark:text-white leading-tight mb-1">
                    {act.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#33466E] dark:text-[#CBD5E1] leading-relaxed mb-4">
                    {act.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#33466E] dark:text-[#CBD5E1] flex items-center gap-1.5">
                    {comp.renderCharacter(22, 'happy')}
                    <span>Guardião {comp.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStartDirectActivity(act)}
                    style={{
                      backgroundColor: worldToken.ctaBg,
                      boxShadow: `0 3px 0 ${worldToken.accentDeep}`
                    }}
                    className="px-5 py-2.5 rounded-2xl text-white text-xs font-black active:translate-y-0.5 transition-all flex items-center gap-1.5"
                  >
                    <Play size={13} fill="white" />
                    <span>Praticar</span>
                  </button>
                </div>
              </div>
            );
          })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
