import React, { useState } from 'react';
import { useApp } from '@/modules/context/AppContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ActivityRunner } from '@/modules/activities/ActivityRunner';
import { journeyService } from '@/services/journeyService';
import { audioService } from '@/services/audioService';
import { formatFriendlyDate } from '@/utils/dateUtils';
import {
  Compass,
  CheckCircle2,
  Play,
  Lock,
  Sparkles,
  Gamepad2,
  Clock,
  Award,
  ChevronRight
} from 'lucide-react';
import { WorldShortcut3DIcon } from '@/design-system/EliteIcons';
import { StarSymbolSvg } from '@/components/illustrations/CustomIcons';
import confetti from 'canvas-confetti';

interface DailyJourneyViewProps {
  onGoToGames: () => void;
}

export const DailyJourneyView: React.FC<DailyJourneyViewProps> = ({ onGoToGames }) => {
  const { todayJourney, activeChild, refreshJourney, refreshRewards, refreshProgression } = useApp();
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  if (!todayJourney || !activeChild) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-semibold text-[#77758A] dark:text-[#C5BFE6]">Preparando a jornada de hoje...</p>
      </div>
    );
  }

  const completedStepsCount = todayJourney.steps.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedStepsCount / todayJourney.steps.length) * 100);

  const handleStartStep = (index: number) => {
    setActiveStepIndex(index);
    audioService.playGentlePop();
  };

  const handleCompleteStep = async (score = 100) => {
    if (activeStepIndex === null) return;

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
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
      setActiveStepIndex(null);
    } else {
      // Advance to next step or return to journey map
      const nextIndex = activeStepIndex + 1;
      if (nextIndex < updated.steps.length) {
        setActiveStepIndex(nextIndex);
      } else {
        setActiveStepIndex(null);
      }
    }
  };

  // If currently running an activity
  if (activeStepIndex !== null && todayJourney.steps[activeStepIndex]) {
    const currentStep = todayJourney.steps[activeStepIndex];
    return (
      <div className="space-y-4 max-w-2xl mx-auto pb-16">
        <div className="flex items-center justify-between px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveStepIndex(null)}
          >
            ← Voltar para a Jornada
          </Button>
          <span className="text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
            Passo {activeStepIndex + 1} de {todayJourney.steps.length}
          </span>
        </div>

        <ActivityRunner
          activity={currentStep.activity}
          onComplete={handleCompleteStep}
          onCancel={() => setActiveStepIndex(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Journey Hero Header */}
      <Card className="ak-card-3d border-2 border-[#E4DFF5] dark:border-[#38316B] bg-gradient-to-br from-white via-[#FAF8FF] to-[#F3EFFF]/75 dark:from-[#27234D] dark:via-[#1E1B3A] dark:to-[#15122C]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="ak-sticker-badge w-16 h-16 rounded-3xl bg-gradient-to-br from-[#F3EFFF] to-[#DDD6F3] dark:from-[#38316B] dark:to-[#27234D] flex items-center justify-center shadow-sticker shrink-0">
              <WorldShortcut3DIcon kind="learn" className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-[#7047E8] dark:text-[#B5A0FF] uppercase tracking-wide">
                {formatFriendlyDate(todayJourney.date)}
              </span>
              <h1 className="ak-title-display text-2xl sm:text-3xl font-black text-[#25233A] dark:text-white">
                Minha Jornada Diária
              </h1>
              <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6]">
                Rotina saudável de 20 a 30 minutos para {activeChild.name}
              </p>
            </div>
          </div>

          {/* Time spent pill */}
          <div className="flex items-center gap-2 bg-[#F5F3FC] dark:bg-[#121024] px-3.5 py-2 rounded-2xl border-2 border-[#E4DFF5] dark:border-[#38316B] self-start sm:self-auto text-xs font-bold text-[#25233A] dark:text-[#F8FAFC] shadow-sticker">
            <Clock size={16} className="text-[#7047E8] dark:text-[#B5A0FF]" />
            <span>{todayJourney.totalMinutesSpent} min praticados</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center text-xs font-extrabold text-[#25233A] dark:text-[#F8FAFC] mb-1.5">
            <span>Progresso do dia</span>
            <span>{completedStepsCount} de {todayJourney.steps.length} atividades ({progressPercent}%)</span>
          </div>
          <div className="h-3.5 bg-[#F5F3FC] dark:bg-[#121024] rounded-full overflow-hidden border border-[#E4DFF5] dark:border-[#38316B]">
            <div
              className="h-full bg-gradient-to-r from-[#7047E8] via-[#4389F5] to-[#36C995] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Celebration Banner when completed */}
        {todayJourney.isCompleted && (
          <div className="mt-6 p-4 rounded-3xl bg-gradient-to-r from-[#E9FBF4] to-[#FFF4D6] dark:from-[#16382C] dark:to-[#2B244F] border-2 border-[#36C995]/40 dark:border-[#36C995]/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="ak-sticker-badge w-12 h-12 rounded-2xl bg-white dark:bg-[#1E1B3A] flex items-center justify-center shrink-0">
                <StarSymbolSvg className="w-8 h-8" />
              </div>
              <div>
                <h4 className="ak-title-display font-black text-sm text-[#1E7E5B] dark:text-[#6EE7B7]">Jornada de Hoje Concluída!</h4>
                <p className="text-xs text-[#256D53] dark:text-[#D8D2F8]">
                  Parabéns! Você liberou suas 3 jogadas na Hora de Brincar.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onGoToGames}
              className="w-full sm:w-auto bg-[#36C995] hover:bg-[#2BB382] text-white"
            >
              <Gamepad2 size={16} />
              <span>Ir para Hora de Brincar</span>
            </Button>
          </div>
        )}
      </Card>

      {/* Steps List */}
      <div className="space-y-3">
        <h3 className="ak-title-display font-extrabold text-lg text-[#25233A] dark:text-white px-1">Atividades da Jornada</h3>

        {todayJourney.steps.map((step, index) => {
          const isDone = step.status === 'completed';
          const isCurrent = index === todayJourney.currentStepIndex;
          const isLocked = index > todayJourney.currentStepIndex && !isDone;

          return (
            <Card
              key={step.activityId}
              variant={isDone ? 'soft-green' : 'white'}
              hoverable={!isLocked}
              onClick={() => !isLocked && handleStartStep(index)}
              className={`ak-card-3d border-2 transition-all duration-200 ${
                isCurrent
                  ? 'border-[#7047E8] dark:border-[#8B68F7] shadow-card-3d dark:shadow-card-3d-dark ring-2 ring-[#7047E8]/20 dark:ring-[#8B68F7]/30'
                  : isDone
                  ? 'border-[#36C995]/50 dark:border-[#36C995]/50'
                  : 'border-[#E4DFF5] dark:border-[#38316B] opacity-85'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Step circle */}
                  <div
                    className={`ak-sticker-badge w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sticker ${
                      isDone
                        ? 'bg-[#36C995] text-white'
                        : isCurrent
                        ? 'bg-[#7047E8] text-white'
                        : 'bg-[#F5F3FC] dark:bg-[#121024] text-[#77758A] dark:text-[#A59EC9] border border-[#E4DFF5] dark:border-[#38316B]'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={22} /> : isLocked ? <Lock size={18} /> : index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#77758A] dark:text-[#C5BFE6]">
                        Passo {index + 1} • {step.activity.durationMinutes} min
                      </span>
                      {isCurrent && !isDone && (
                        <span className="text-[10px] font-black text-white bg-[#7047E8] px-2 py-0.5 rounded-full animate-pulse">
                          Próximo
                        </span>
                      )}
                    </div>
                    <h4 className="ak-title-display font-black text-base text-[#25233A] dark:text-white mt-0.5">
                      {step.activity.title}
                    </h4>
                    <p className="text-xs text-[#77758A] dark:text-[#C5BFE6] line-clamp-1">
                      {step.activity.description}
                    </p>
                  </div>
                </div>

                {/* Right Action */}
                <div>
                  {isDone ? (
                    <span className="text-xs font-bold text-[#1E7E5B] dark:text-[#6EE7B7] bg-[#E9FBF4] dark:bg-[#16382C] px-3 py-1.5 rounded-xl flex items-center gap-1 border border-[#36C995]/30 dark:border-[#36C995]/40">
                      Concluído
                    </span>
                  ) : isCurrent ? (
                    <Button variant="primary" size="sm" onClick={() => handleStartStep(index)}>
                      <Play size={15} />
                      <span className="hidden sm:inline">Iniciar</span>
                    </Button>
                  ) : (
                    <ChevronRight size={18} className="text-[#77758A]/60 dark:text-[#A59EC9]" />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
