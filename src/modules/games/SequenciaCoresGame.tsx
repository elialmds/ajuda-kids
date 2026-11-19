import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Palette, Play, RotateCcw, CheckCircle2, Trophy } from 'lucide-react';
import { audioService } from '@/services/audioService';
import confetti from 'canvas-confetti';

interface SequenciaCoresProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit: () => void;
}

type ColorKey = 'azul' | 'verde' | 'amarelo' | 'lilas';

interface ColorPad {
  key: ColorKey;
  label: string;
  freq: number;
  idleColor: string;
  activeColor: string;
  textColor: string;
}

const PADS: ColorPad[] = [
  { key: 'azul', label: 'Azul', freq: 523.25, idleColor: '#DCEBFF', activeColor: '#4389F5', textColor: '#1E54B7' },
  { key: 'verde', label: 'Verde', freq: 659.25, idleColor: '#DDF9EE', activeColor: '#36C995', textColor: '#115E43' },
  { key: 'amarelo', label: 'Amarelo', freq: 783.99, idleColor: '#FFF3CC', activeColor: '#FF9B42', textColor: '#8A5A00' },
  { key: 'lilas', label: 'Lilás', freq: 1046.50, idleColor: '#EDE9FE', activeColor: '#7047E8', textColor: '#522EC2' }
];

export const SequenciaCoresGame: React.FC<SequenciaCoresProps> = ({ onFinishGame, onExit }) => {
  const [sequence, setSequence] = useState<ColorKey[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activePad, setActivePad] = useState<ColorKey | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const flashPad = (padKey: ColorKey, duration = 400) => {
    const pad = PADS.find(p => p.key === padKey);
    if (pad) {
      setActivePad(padKey);
      audioService.playBellTone(pad.freq, duration / 1000);
      setTimeout(() => {
        setActivePad(null);
      }, duration);
    }
  };

  const playSequence = (seq: ColorKey[]) => {
    setIsShowingSequence(true);
    let step = 0;

    const interval = setInterval(() => {
      if (step < seq.length) {
        flashPad(seq[step], 500);
        step++;
      } else {
        clearInterval(interval);
        setIsShowingSequence(false);
        setPlayerIndex(0);
      }
    }, 750);
  };

  const startNewGame = () => {
    setHasStarted(true);
    setIsGameOver(false);
    setScore(0);
    const keys: ColorKey[] = ['azul', 'verde', 'amarelo', 'lilas'];
    const first = keys[Math.floor(Math.random() * keys.length)];
    const initial = [first];
    setSequence(initial);
    setTimeout(() => {
      playSequence(initial);
    }, 500);
  };

  const handlePadClick = (key: ColorKey) => {
    if (isShowingSequence || isGameOver || !hasStarted) return;

    flashPad(key, 300);

    if (key === sequence[playerIndex]) {
      // Correct step
      const nextIdx = playerIndex + 1;
      setPlayerIndex(nextIdx);

      if (nextIdx === sequence.length) {
        // Completed sequence!
        const newScore = score + sequence.length * 50;
        setScore(newScore);
        audioService.playSuccess();

        // Add next color
        const keys: ColorKey[] = ['azul', 'verde', 'amarelo', 'lilas'];
        const nextColor = keys[Math.floor(Math.random() * keys.length)];
        const nextSeq = [...sequence, nextColor];
        setSequence(nextSeq);

        setTimeout(() => {
          playSequence(nextSeq);
        }, 1000);
      }
    } else {
      // Mistake
      audioService.playBellTone(220, 0.4);
      setIsGameOver(true);
      if (sequence.length > 3) {
        try {
          confetti({ particleCount: 40, spread: 70 });
        } catch {
          // ignore
        }
      }
    }
  };

  const handleFinish = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    onFinishGame(elapsed, score);
  };

  return (
    <Card className="ak-card-3d max-w-xl mx-auto text-center bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B]">
      <div className="flex items-center justify-between pb-3 border-b border-[#E4DFF5] dark:border-[#38316B]">
        <div className="flex items-center gap-2.5">
          <div className="ak-sticker-badge w-11 h-11 rounded-2xl bg-[#FFF9E6] dark:bg-[#27234D] border-2 border-[#FFD34E]/60 text-[#D97706] dark:text-[#FFD34E] flex items-center justify-center shadow-sm">
            <Palette size={20} />
          </div>
          <div className="text-left">
            <h3 className="ak-title-display font-black text-lg text-[#25233A] dark:text-white">Sequência de Cores</h3>
            <p className="text-xs text-[#77758A] dark:text-[#C5BFE6]">Memória Sonora e Visual</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Sair
        </Button>
      </div>

      <div className="flex justify-between items-center my-3 px-2 text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
        <span>Pontuação: {score}</span>
        <span>Nível: {sequence.length || 1}</span>
      </div>

      {/* 2x2 Color Pads */}
      <div className="grid grid-cols-2 gap-4 max-w-[280px] mx-auto my-6">
        {PADS.map(pad => {
          const isLit = activePad === pad.key;

          return (
            <button
              key={pad.key}
              type="button"
              onClick={() => handlePadClick(pad.key)}
              disabled={isShowingSequence || isGameOver || !hasStarted}
              style={{
                backgroundColor: isLit ? pad.activeColor : pad.idleColor,
                color: isLit ? '#FFFFFF' : pad.textColor
              }}
              className={`h-32 rounded-3xl font-black text-sm flex items-center justify-center border-2 border-b-4 border-white/70 dark:border-white/20 transition-all duration-200 transform shadow-card ${
                isLit
                  ? 'scale-105 shadow-glow ring-4 ring-white dark:ring-[#FFD34E]'
                  : 'hover:scale-102 active:scale-95'
              } ${isShowingSequence ? 'cursor-wait' : 'cursor-pointer'}`}
            >
              <span className="text-base uppercase tracking-wider">{pad.label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs font-bold text-[#77758A] dark:text-[#C5BFE6] mb-4 h-6">
        {!hasStarted && 'Toque em Começar para ver a primeira cor!'}
        {hasStarted && isShowingSequence && '👀 Observe a sequência com atenção...'}
        {hasStarted && !isShowingSequence && !isGameOver && '👉 Sua vez! Repita as cores na mesma ordem.'}
      </p>

      {!hasStarted && (
        <Button variant="primary" size="lg" className="w-full" onClick={startNewGame}>
          <Play size={18} />
          <span>Começar Jogo</span>
        </Button>
      )}

      {isGameOver && (
        <div className="p-4 bg-[#E9FBF4] dark:bg-[#133A2E] rounded-3xl border-2 border-[#36C995]/50 dark:border-[#36C995] mt-2 animate-fadeIn">
          <Trophy size={36} className="mx-auto text-[#FFD34E] mb-1" />
          <h4 className="ak-title-display font-black text-lg text-[#115E43] dark:text-[#A7F3D0]">Excelente Memória!</h4>
          <p className="text-xs font-bold text-[#115E43]/80 dark:text-[#D1FAE5] mb-3">
            Você atingiu o nível {sequence.length} e somou {score} pontos!
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={startNewGame}>
              <RotateCcw size={15} />
              <span>Tentar de Novo</span>
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
