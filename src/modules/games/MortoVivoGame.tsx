import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { KID_CHARACTERS } from '@/data/charactersData';
import { Activity, Play, RotateCcw, CheckCircle2, Trophy } from 'lucide-react';
import { audioService } from '@/services/audioService';
import confetti from 'canvas-confetti';

interface MortoVivoProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit: () => void;
}

type CommandType = 'VIVO' | 'MORTO';

export const MortoVivoGame: React.FC<MortoVivoProps> = ({ onFinishGame, onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<CommandType>('VIVO');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const roundTimerRef = useRef<number | null>(null);

  const totalRounds = 8;
  const leoChar = KID_CHARACTERS[1]; // Leo
  const biaChar = KID_CHARACTERS[0]; // Bia

  const clearRoundTimer = useCallback(() => {
    if (roundTimerRef.current !== null) {
      window.clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearRoundTimer();
  }, [clearRoundTimer]);

  const endGame = useCallback(() => {
    clearRoundTimer();
    setIsPlaying(false);
    setIsGameOver(true);
    audioService.playFanfare();
    try {
      confetti({ particleCount: 50, spread: 80 });
    } catch {
      // ignore
    }
  }, [clearRoundTimer]);

  const nextCommand = useCallback(
    (r: number) => {
      if (r >= totalRounds) {
        endGame();
        return;
      }

      const commands: CommandType[] = ['VIVO', 'MORTO'];
      const chosen = commands[Math.floor(Math.random() * commands.length)];
      setCurrentCommand(chosen);
      setRound(r + 1);
      setFeedback(null);

      if (chosen === 'VIVO') {
        audioService.speak('VIVO! Fique de pé!');
        audioService.playBellTone(620, 0.2);
      } else {
        audioService.speak('MORTO! Agache no chão!');
        audioService.playBellTone(320, 0.2);
      }
    },
    [endGame]
  );

  const startGame = () => {
    clearRoundTimer();
    setIsPlaying(true);
    setScore(0);
    setRound(0);
    setIsGameOver(false);
    nextCommand(0);
  };

  const handlePlayerResponse = useCallback(
    (userPosture: CommandType) => {
      if (feedback !== null) return;
      clearRoundTimer();
      audioService.playGentlePop();

      if (userPosture === currentCommand) {
        setScore((s) => s + 100);
        setFeedback('Acertou! Postura correta!');
        audioService.playSuccess();
      } else {
        setFeedback('Ops! Pegadinha do Morto ou Vivo!');
        audioService.playBellTone(240, 0.3);
      }

      roundTimerRef.current = window.setTimeout(() => {
        nextCommand(round);
      }, 1400);
    },
    [clearRoundTimer, currentCommand, feedback, nextCommand, round]
  );

  useEffect(() => {
    if (!isPlaying || feedback !== null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handlePlayerResponse('VIVO');
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        handlePlayerResponse('MORTO');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying, feedback, handlePlayerResponse]);

  const handleFinish = () => {
    clearRoundTimer();
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    onFinishGame(elapsed, score);
  };

  return (
    <Card className="ak-card-3d max-w-xl mx-auto text-center bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4DFF5] dark:border-[#38316B]">
        <div className="flex items-center gap-2.5">
          <div className="ak-sticker-badge w-11 h-11 rounded-2xl bg-[#EEF5FF] dark:bg-[#27234D] border-2 border-[#4389F5]/40 text-[#4389F5] dark:text-[#7DD3FC] flex items-center justify-center shadow-sm">
            <Activity size={20} />
          </div>
          <div className="text-left">
            <h3 className="ak-title-display font-black text-lg text-[#25233A] dark:text-white">Morto ou Vivo Digital</h3>
            <p className="text-xs text-[#77758A] dark:text-[#C5BFE6]">Atenção e Agilidade com Amigos</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Sair
        </Button>
      </div>

      {!isPlaying && !isGameOver && (
        <div className="my-6 space-y-4">
          <p className="text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
            Veja a postura dos amiguinhos na tela e toque rápido no botão certo!
          </p>

          <div className="flex justify-center gap-6 my-6">
            <div className="ak-card-3d p-4 bg-[#F5F3FC] dark:bg-[#27234D] rounded-3xl border-2 border-[#E4DFF5] dark:border-[#38316B] flex flex-col items-center shadow-sm">
              <div className="w-16 h-16 mb-2">{biaChar.renderAvatar(56)}</div>
              <span className="font-black text-xs text-[#25233A] dark:text-white">VIVO (Em pé) 🧍‍♀️</span>
            </div>
            <div className="ak-card-3d p-4 bg-[#F5F3FC] dark:bg-[#27234D] rounded-3xl border-2 border-[#E4DFF5] dark:border-[#38316B] flex flex-col items-center shadow-sm">
              <div className="w-16 h-16 mb-2 translate-y-3 scale-90">{leoChar.renderAvatar(56)}</div>
              <span className="font-black text-xs text-[#25233A] dark:text-white">MORTO (Agachado) 🧎‍♂️</span>
            </div>
          </div>

          <Button variant="primary" size="lg" className="w-full" onClick={startGame}>
            <Play size={18} />
            <span>Começar Jogo</span>
          </Button>
        </div>
      )}

      {isPlaying && (
        <div className="my-5 space-y-5">
          <div className="flex justify-between items-center px-4 text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
            <span>Rodada {round} de {totalRounds}</span>
            <span>Pontos: {score}</span>
          </div>

          {/* Animated Characters Arena */}
          <div className="h-44 flex items-end justify-center gap-8 py-3 bg-[#F5F3FC] dark:bg-[#121024]/85 rounded-3xl border-2 border-[#DDD6F3] dark:border-[#38316B]">
            {/* Bia Character */}
            <div
              className={`flex flex-col items-center transition-all duration-300 ${
                currentCommand === 'VIVO'
                  ? 'translate-y-0 scale-105'
                  : 'translate-y-8 scale-90 opacity-90'
              }`}
            >
              <div className="w-20 h-20">{biaChar.renderAvatar(72)}</div>
              <span className="text-xs font-black text-[#25233A] dark:text-white mt-1">Bia</span>
            </div>

            {/* Leo Character */}
            <div
              className={`flex flex-col items-center transition-all duration-300 ${
                currentCommand === 'VIVO'
                  ? 'translate-y-0 scale-105'
                  : 'translate-y-8 scale-90 opacity-90'
              }`}
            >
              <div className="w-20 h-20">{leoChar.renderAvatar(72)}</div>
              <span className="text-xs font-black text-[#25233A] dark:text-white mt-1">Leo</span>
            </div>
          </div>

          {/* Big Command Banner */}
          <div
            className={`p-4 rounded-2xl text-center font-black text-2xl tracking-wider transition-all shadow-sm ${
              currentCommand === 'VIVO'
                ? 'bg-[#E9FBF4] dark:bg-[#133A2E] text-[#115E43] dark:text-[#6EE7B7] border-2 border-[#36C995]'
                : 'bg-[#FFF3CC] dark:bg-[#27234D] text-[#8A5A00] dark:text-[#FFD34E] border-2 border-[#FFD34E]'
            }`}
          >
            {currentCommand === 'VIVO' ? '🧍 VIVO!' : '🧎 MORTO!'}
          </div>

          {feedback && (
            <div className="text-sm font-extrabold text-[#25233A] dark:text-white animate-fadeIn">
              {feedback}
            </div>
          )}

          {/* Response Buttons */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => handlePlayerResponse('VIVO')}
              className="py-5 px-3 rounded-2xl bg-white dark:bg-[#27234D] hover:bg-[#E9FBF4] dark:hover:bg-[#133A2E] border-2 border-b-4 border-[#36C995] text-[#115E43] dark:text-[#A7F3D0] font-black text-base shadow-sm active:scale-95 transition-all flex flex-col items-center"
            >
              <span className="text-3xl mb-1">🧍</span>
              <span>EM PÉ (VIVO!)</span>
              <span className="text-[11px] font-bold opacity-70 mt-1">Tecla ↑ / W</span>
            </button>

            <button
              type="button"
              onClick={() => handlePlayerResponse('MORTO')}
              className="py-5 px-3 rounded-2xl bg-white dark:bg-[#27234D] hover:bg-[#FFF9E6] dark:hover:bg-[#342E63] border-2 border-b-4 border-[#FFD34E] text-[#8A5A00] dark:text-[#FFD34E] font-black text-base shadow-sm active:scale-95 transition-all flex flex-col items-center"
            >
              <span className="text-3xl mb-1">🧎</span>
              <span>AGACHADO (MORTO!)</span>
              <span className="text-[11px] font-bold opacity-70 mt-1">Tecla ↓ / S</span>
            </button>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="my-6 space-y-4">
          <div className="p-5 bg-[#E9FBF4] dark:bg-[#133A2E] rounded-3xl border-2 border-[#36C995]/50 dark:border-[#36C995]">
            <Trophy size={42} className="mx-auto text-[#FFD34E] mb-1" />
            <h4 className="ak-title-display font-black text-xl text-[#115E43] dark:text-[#6EE7B7]">
              Sensacional! Você tem ótimos reflexos!
            </h4>
            <p className="text-sm font-bold text-[#115E43]/80 dark:text-[#D1FAE5] mt-1">
              Pontuação conquistada: {score} pontos!
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={startGame}>
              <RotateCcw size={15} />
              <span>Jogar de Novo</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handleFinish}>
              <CheckCircle2 size={15} />
              <span>Concluir Jogo</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
