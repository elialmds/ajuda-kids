import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Wind, Heart, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';
import { audioService } from '@/services/audioService';

interface MindfulBreathingProps {
  totalCycles?: number;
  onComplete?: () => void;
  onClose?: () => void;
}

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'finished';

export const MindfulBreathing: React.FC<MindfulBreathingProps> = ({
  totalCycles = 4,
  onComplete,
  onClose
}) => {
  const [phase, setPhase] = useState<Phase>('ready');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(4);

  const startExercise = () => {
    setCurrentCycle(1);
    setPhase('inhale');
    setSecondsLeft(4);
    audioService.speak('Puxe o ar pelo nariz como se cheirasse uma florzinha bem perfumada.');
    audioService.playBellTone(520, 0.4);
  };

  useEffect(() => {
    if (phase === 'ready' || phase === 'finished') return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Transition phases
          if (phase === 'inhale') {
            setPhase('hold');
            audioService.speak('Segure o ar...');
            return 2;
          } else if (phase === 'hold') {
            setPhase('exhale');
            audioService.speak('Solte o ar pela boca devagarzinho, como quem apaga uma velinha.');
            audioService.playBellTone(440, 0.4);
            return 4;
          } else if (phase === 'exhale') {
            if (currentCycle >= totalCycles) {
              setPhase('finished');
              audioService.speak('Muito bem! Você respirou com calma e seu corpo está relaxado.');
              audioService.playSuccess();
              onComplete?.();
              return 0;
            } else {
              setCurrentCycle(c => c + 1);
              setPhase('inhale');
              audioService.speak('Inspire suavemente...');
              audioService.playBellTone(520, 0.4);
              return 4;
            }
          }
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, currentCycle, totalCycles, onComplete]);

  return (
    <Card className="ak-card-3d max-w-xl mx-auto text-center border-2 border-[#36C995]/40 dark:bg-[#1E1B3A] dark:border-[#36C995]/40 dark:text-[#F8FAFC]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="ak-sticker-badge w-11 h-11 rounded-2xl bg-[#E9FBF4] dark:bg-[#16382C] text-[#1E7E5B] dark:text-[#6EE7B7] flex items-center justify-center shadow-sticker">
            <Wind size={20} />
          </div>
          <div className="text-left">
            <h3 className="ak-title-display font-extrabold text-lg text-[#25233A] dark:text-white">Respiração Consciente</h3>
            <p className="text-xs text-[#77758A] dark:text-[#C5BFE6]">Flor e Velinha (Calma e Foco)</p>
          </div>
        </div>

        {phase !== 'ready' && phase !== 'finished' && (
          <span className="text-xs font-bold text-[#1E7E5B] dark:text-[#6EE7B7] bg-[#E9FBF4] dark:bg-[#16382C] px-3 py-1 rounded-full">
            Ciclo {currentCycle} de {totalCycles}
          </span>
        )}
      </div>

      {/* Main Visual Circle */}
      <div className="my-8 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center w-64 h-64">
          {/* Animated pulsing outer rings */}
          <div
            className={`absolute rounded-full transition-all duration-1000 ease-in-out ${
              phase === 'inhale'
                ? 'w-60 h-60 bg-[#4389F5]/20 dark:bg-[#7047E8]/35 scale-110'
                : phase === 'hold'
                ? 'w-60 h-60 bg-[#FFD34E]/35 dark:bg-[#FF9B42]/30 scale-105'
                : phase === 'exhale'
                ? 'w-36 h-36 bg-[#36C995]/25 dark:bg-[#36C995]/30 scale-90'
                : 'w-44 h-44 bg-[#F5F3FC] dark:bg-[#121024]'
            }`}
          />

          {/* Central Ball */}
          <div
            className={`ak-toy-3d relative rounded-full shadow-soft flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${
              phase === 'inhale'
                ? 'w-48 h-48 bg-gradient-to-tr from-[#4389F5] to-[#87B8FF] text-white scale-105'
                : phase === 'hold'
                ? 'w-48 h-48 bg-gradient-to-tr from-[#FFD34E] to-[#FFECA8] text-[#25233A]'
                : phase === 'exhale'
                ? 'w-32 h-32 bg-gradient-to-tr from-[#36C995] to-[#98E8C8] text-[#114232]'
                : 'w-40 h-40 bg-white dark:bg-[#27234D] border-4 border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-[#F8FAFC]'
            }`}
          >
            {phase === 'ready' && (
              <>
                <span className="text-3xl mb-1">🌸</span>
                <span className="font-extrabold text-sm">Pronto para relaxar?</span>
              </>
            )}

            {phase === 'inhale' && (
              <>
                <Wind size={28} className="mb-1 text-white" />
                <span className="font-black text-sm uppercase tracking-wide">Inspire</span>
                <span className="text-2xl font-black">{secondsLeft}</span>
              </>
            )}

            {phase === 'hold' && (
              <>
                <Sparkles size={28} className="mb-1 text-[#7047E8]" />
                <span className="font-black text-xs uppercase tracking-wide">Segure</span>
                <span className="text-xl font-black">{secondsLeft}</span>
              </>
            )}

            {phase === 'exhale' && (
              <>
                <Heart size={26} className="mb-1 text-[#114232]" />
                <span className="font-black text-xs uppercase tracking-wide">Expire</span>
                <span className="text-lg font-black">{secondsLeft}</span>
              </>
            )}

            {phase === 'finished' && (
              <>
                <CheckCircle2 size={32} className="mb-1 text-[#36C995]" />
                <span className="font-extrabold text-sm">Tudo em paz!</span>
              </>
            )}
          </div>
        </div>

        {/* Phase instruction text */}
        <p className="mt-4 text-sm font-bold text-[#77758A] dark:text-[#C5BFE6] max-w-sm h-10 flex items-center justify-center">
          {phase === 'ready' && 'Respire no seu tempo: cheire a flor e assopre a velinha devagar.'}
          {phase === 'inhale' && 'Puxe o ar suavemente pelo nariz como quem sente o cheirinho de uma flor.'}
          {phase === 'hold' && 'Mantenha o ar no peito com tranquilidade.'}
          {phase === 'exhale' && 'Solte o ar pela boquinha devagar, apagando a vela sem pressa.'}
          {phase === 'finished' && 'Parabéns! Sua mente e seu corpo estão calminhos agora.'}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#E4DFF5] dark:border-white/10">
        {phase === 'ready' && (
          <Button variant="primary" size="lg" onClick={startExercise}>
            <Wind size={18} />
            <span>Começar Respiração</span>
          </Button>
        )}

        {phase === 'finished' && (
          <div className="flex gap-2">
            <Button variant="outline" size="md" onClick={startExercise}>
              <RotateCcw size={16} />
              <span>Repetir</span>
            </Button>
            {onClose && (
              <Button variant="primary" size="md" onClick={onClose}>
                <CheckCircle2 size={16} />
                <span>Continuar</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
