import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { KID_CHARACTERS } from '@/data/charactersData';
import { Users, Play, RotateCcw, CheckCircle2, Zap } from 'lucide-react';
import { audioService } from '@/services/audioService';
import confetti from 'canvas-confetti';

interface PatoPatoGansoProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit: () => void;
}

export const PatoPatoGansoGame: React.FC<PatoPatoGansoProps> = ({ onFinishGame, onExit }) => {
  const [phase, setPhase] = useState<'intro' | 'circle_tapping' | 'sprint_chase' | 'victory'>('intro');
  const [selectedKidIndex, setSelectedKidIndex] = useState(0);
  const [patosTapped, setPatosTapped] = useState(0);
  const [playerSprintScore, setPlayerSprintScore] = useState(0);
  const [gooseChaseProgress, setGooseChaseProgress] = useState(0); // 0 to 100
  const [score, setScore] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const playerSprintScoreRef = useRef(0);

  const handleStartCircle = () => {
    setPhase('circle_tapping');
    setSelectedKidIndex(0);
    setPatosTapped(0);
    playerSprintScoreRef.current = 0;
    setPlayerSprintScore(0);
    setGooseChaseProgress(0);
    audioService.speak('Toque nos amiguinhos da roda dizendo Pato! Escolha um para ser o Ganso!');
  };

  const handleTapKid = (index: number) => {
    audioService.playGentlePop();
    setSelectedKidIndex(index);
    setPatosTapped(p => p + 1);
    audioService.speak('Pato!');
  };

  const handleTriggerGanso = (index: number) => {
    setSelectedKidIndex(index);
    const kid = KID_CHARACTERS[index];
    playerSprintScoreRef.current = 0;
    setPhase('sprint_chase');
    setPlayerSprintScore(0);
    setGooseChaseProgress(0);
    audioService.playFanfare();
    audioService.speak(`GANSO! ${kid.name} levantou! Toque rápido para correr até o lugar vazio!`);
    try {
      confetti({ particleCount: 40, spread: 70 });
    } catch {
      // ignore
    }
  };

  // Player taps to run during sprint phase
  const handleSprintTap = useCallback(() => {
    if (phase !== 'sprint_chase') return;
    audioService.playGentlePop();
    const clamped = Math.min(100, playerSprintScoreRef.current + 12);
    playerSprintScoreRef.current = clamped;
    setPlayerSprintScore(clamped);

    if (clamped >= 100) {
      // Player made it to the empty spot safely!
      setPhase('victory');
      setScore(s => s + 250);
      audioService.playSuccess();
      try {
        confetti({ particleCount: 70, spread: 80 });
      } catch {
        // ignore
      }
    }
  }, [phase]);

  // Goose progresses automatically on a steady timer
  useEffect(() => {
    if (phase !== 'sprint_chase') return;

    const interval = window.setInterval(() => {
      setGooseChaseProgress(prev => {
        const next = Math.min(100, prev + 4.5);
        if (next >= 100 && playerSprintScoreRef.current < 100) {
          // Goose almost caught, give friendly tie/fun
          setPhase('victory');
          setScore(s => s + 150);
          audioService.playSuccess();
          return 100;
        }
        return next;
      });
    }, 200);

    return () => window.clearInterval(interval);
  }, [phase]);

  // Keyboard sprint accessibility (Space / Enter)
  useEffect(() => {
    if (phase !== 'sprint_chase') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleSprintTap();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, handleSprintTap]);

  const handleFinish = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    onFinishGame(elapsed, score + 100);
  };

  const currentGansoKid = KID_CHARACTERS[selectedKidIndex];

  return (
    <Card className="ak-card-3d max-w-xl mx-auto text-center bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4DFF5] dark:border-[#38316B]">
        <div className="flex items-center gap-2.5">
          <div className="ak-sticker-badge w-11 h-11 rounded-2xl bg-[#E9FBF4] dark:bg-[#27234D] border-2 border-[#36C995]/50 text-[#115E43] dark:text-[#6EE7B7] flex items-center justify-center shadow-sm">
            <Users size={20} />
          </div>
          <div className="text-left">
            <h3 className="ak-title-display font-black text-lg text-[#25233A] dark:text-white">Pato, Pato, Ganso Digital</h3>
            <p className="text-xs text-[#77758A] dark:text-[#C5BFE6]">Roda e Corrida Interativa</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Sair
        </Button>
      </div>

      {/* Intro Phase */}
      {phase === 'intro' && (
        <div className="my-6 space-y-4">
          <div className="p-4 bg-[#F5F3FC] dark:bg-[#27234D] rounded-2xl border border-[#E4DFF5] dark:border-[#38316B] text-xs text-[#77758A] dark:text-[#D8D2F8] text-left leading-relaxed">
            <span className="font-black block text-sm mb-1 text-[#25233A] dark:text-white">
              Como Brincar na Tela:
            </span>
            Os amiguinhos (Bia, Leo, Nina, Davi, Lara e Tico) estão sentados na roda. Toque em cada um dizendo <strong>"Pato"</strong>. Quando você escolher o <strong>"GANSO"</strong>, toque o botão de correr o mais rápido possível para sentar no lugar vago!
          </div>

          <div className="flex justify-center -space-x-3 my-4">
            {KID_CHARACTERS.map(kid => (
              <div key={kid.id} className="w-14 h-14 rounded-full bg-white dark:bg-[#27234D] border-2 border-[#7047E8]/50 p-1 shadow-sm">
                {kid.renderAvatar(48)}
              </div>
            ))}
          </div>

          <Button variant="primary" size="lg" className="w-full" onClick={handleStartCircle}>
            <Play size={18} />
            <span>Iniciar Brincadeira</span>
          </Button>
        </div>
      )}

      {/* Circle Tapping Phase */}
      {phase === 'circle_tapping' && (
        <div className="my-6 space-y-4">
          <p className="text-xs font-black text-[#7047E8] dark:text-[#C4B5FD]">
            Toque nos amigos dizendo "PATO" e depois aperte GANSO! (Patos: {patosTapped})
          </p>

          {/* Characters Circle Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {KID_CHARACTERS.map((kid, idx) => {
              const isSelected = selectedKidIndex === idx;

              return (
                <button
                  key={kid.id}
                  type="button"
                  onClick={() => handleTapKid(idx)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center border-2 border-b-4 transition-all active:scale-90 ${
                    isSelected
                      ? 'border-[#7047E8] bg-[#F5F3FC] dark:bg-[#27234D] scale-105 shadow-card'
                      : 'border-[#E4DFF5] dark:border-[#38316B] bg-white dark:bg-[#121024]/70 hover:bg-[#F5F3FC] dark:hover:bg-[#342E63]'
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    {kid.renderAvatar(44)}
                  </div>
                  <span className="text-xs font-black text-[#25233A] dark:text-white mt-1">
                    {kid.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#4389F5] dark:text-[#7DD3FC]">Pato 🦆</span>
                </button>
              );
            })}
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full max-w-sm mx-auto bg-[#F16E9A] hover:bg-[#D64B7B] border-b-4 border-[#B0355F] shadow-soft"
            onClick={() => handleTriggerGanso(selectedKidIndex)}
          >
            <span>ESCOLHER {currentGansoKid.name} COMO GANSO! 🪿⚡</span>
          </Button>
        </div>
      )}

      {/* Sprint Chase Phase */}
      {phase === 'sprint_chase' && (
        <div className="my-6 space-y-5">
          <div className="flex items-center justify-center gap-4">
            <div className="ak-sticker-badge w-16 h-16 rounded-2xl bg-white dark:bg-[#27234D] border-2 border-[#F16E9A] p-1 shadow-glow animate-bounce">
              {currentGansoKid.renderAvatar(56)}
            </div>
            <div className="text-left">
              <span className="text-xs font-black text-[#F16E9A] uppercase">O Ganso está correndo!</span>
              <h4 className="ak-title-display font-black text-lg text-[#25233A] dark:text-white">
                {currentGansoKid.name} quer te pegar!
              </h4>
            </div>
          </div>

          {/* Progress Race Track */}
          <div className="space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-xs font-black text-[#25233A] dark:text-white">
              <span>Sua Corrida</span>
              <span>{playerSprintScore}%</span>
            </div>
            <div className="h-4 bg-[#F5F3FC] dark:bg-[#121024]/85 rounded-full overflow-hidden border border-[#DDD6F3] dark:border-[#38316B]">
              <div
                className="h-full bg-gradient-to-r from-[#7047E8] via-[#4389F5] to-[#36C995] rounded-full transition-all duration-150"
                style={{ width: `${playerSprintScore}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-bold text-[#F16E9A]">
              <span>Ganso ({currentGansoKid.name})</span>
              <span>{Math.round(gooseChaseProgress)}%</span>
            </div>
            <div className="h-2 bg-[#F5F3FC] dark:bg-[#121024]/85 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F16E9A] rounded-full transition-all duration-200"
                style={{ width: `${gooseChaseProgress}%` }}
              />
            </div>
          </div>

          {/* Big Tap-to-run Button */}
          <button
            type="button"
            onClick={handleSprintTap}
            className="w-full max-w-sm mx-auto py-5 rounded-3xl bg-[#36C995] hover:bg-[#2BB584] text-white font-black text-lg shadow-glow active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 border-b-4 border-[#22986E]"
          >
            <span className="flex items-center gap-2">
              <Zap size={22} />
              <span>TOQUE RÁPIDO PARA CORRER! 🏃‍♂️💨</span>
            </span>
            <span className="text-[11px] font-bold opacity-85">ou aperte Espaço / Enter repetidamente</span>
          </button>
        </div>
      )}

      {/* Victory Phase */}
      {phase === 'victory' && (
        <div className="my-6 space-y-4">
          <div className="p-5 bg-[#E9FBF4] dark:bg-[#133A2E] rounded-3xl border-2 border-[#36C995]/50 dark:border-[#36C995]">
            <span className="text-4xl block mb-2">🎉🏆</span>
            <h4 className="ak-title-display font-black text-xl text-[#115E43] dark:text-[#6EE7B7]">
              Você sentou no lugar vago a salvo!
            </h4>
            <p className="text-xs font-bold text-[#115E43]/80 dark:text-[#D1FAE5] mt-1">
              Todos os amiguinhos vibraram com a sua corrida veloz!
            </p>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <Button variant="outline" size="sm" onClick={handleStartCircle}>
              <RotateCcw size={15} />
              <span>Jogar de Novo</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handleFinish}>
              <CheckCircle2 size={15} />
              <span>Concluir Partida</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
