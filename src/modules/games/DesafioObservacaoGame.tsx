import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Search, RotateCcw, CheckCircle2, Trophy, Sparkles, HelpCircle } from 'lucide-react';
import { audioService } from '@/services/audioService';
import confetti from 'canvas-confetti';

interface DesafioObservacaoProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit: () => void;
}

interface PuzzleLevel {
  id: number;
  title: string;
  instruction: string;
  gridItems: { id: number; symbol: string; isTarget: boolean }[];
  hint: string;
}

const PUZZLES: PuzzleLevel[] = [
  {
    id: 1,
    title: 'O Gatinho Dorminhoco',
    instruction: 'Encontre o gatinho que está tirando uma soneca! 😴',
    hint: 'Procure pelo rostinho com olhinhos fechados dormindo.',
    gridItems: [
      { id: 1, symbol: '🐱', isTarget: false },
      { id: 2, symbol: '🐱', isTarget: false },
      { id: 3, symbol: '🐱', isTarget: false },
      { id: 4, symbol: '🐱', isTarget: false },
      { id: 5, symbol: '😴', isTarget: true },
      { id: 6, symbol: '🐱', isTarget: false },
      { id: 7, symbol: '🐱', isTarget: false },
      { id: 8, symbol: '🐱', isTarget: false },
      { id: 9, symbol: '🐱', isTarget: false },
    ]
  },
  {
    id: 2,
    title: 'A Maçã Verde Especial',
    instruction: 'Ache a maçãzinha verde no meio das maçãs vermelhas! 🍏',
    hint: 'Ela tem a cor da grama verdinha!',
    gridItems: [
      { id: 1, symbol: '🍎', isTarget: false },
      { id: 2, symbol: '🍎', isTarget: false },
      { id: 3, symbol: '🍎', isTarget: false },
      { id: 4, symbol: '🍎', isTarget: false },
      { id: 5, symbol: '🍎', isTarget: false },
      { id: 6, symbol: '🍎', isTarget: false },
      { id: 7, symbol: '🍏', isTarget: true },
      { id: 8, symbol: '🍎', isTarget: false },
      { id: 9, symbol: '🍎', isTarget: false },
      { id: 10, symbol: '🍎', isTarget: false },
      { id: 11, symbol: '🍎', isTarget: false },
      { id: 12, symbol: '🍎', isTarget: false }
    ]
  },
  {
    id: 3,
    title: 'O Foguete Espacial',
    instruction: 'Encontre o foguete que vai viajar para a lua! 🚀',
    hint: 'Não é um avião nem helicóptero, voa direto para as estrelas!',
    gridItems: [
      { id: 1, symbol: '✈️', isTarget: false },
      { id: 2, symbol: '🚁', isTarget: false },
      { id: 3, symbol: '🎈', isTarget: false },
      { id: 4, symbol: '✈️', isTarget: false },
      { id: 5, symbol: '🚀', isTarget: true },
      { id: 6, symbol: '🚁', isTarget: false },
      { id: 7, symbol: '🎈', isTarget: false },
      { id: 8, symbol: '✈️', isTarget: false },
      { id: 9, symbol: '🚁', isTarget: false }
    ]
  }
];

export const DesafioObservacaoGame: React.FC<DesafioObservacaoProps> = ({ onFinishGame, onExit }) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [foundInLevel, setFoundInLevel] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const currentPuzzle = PUZZLES[currentLevelIdx];

  const handleItemClick = (isTarget: boolean) => {
    if (foundInLevel) return;

    if (isTarget) {
      audioService.playSuccess();
      setFoundInLevel(true);
      setScore(s => s + (showHint ? 80 : 120));
      try {
        confetti({ particleCount: 40, spread: 60 });
      } catch {
        // ignore
      }
    } else {
      audioService.playBellTone(320, 0.2);
    }
  };

  const advanceLevel = () => {
    setFoundInLevel(false);
    setShowHint(false);
    const nextIdx = currentLevelIdx + 1;
    if (nextIdx < PUZZLES.length) {
      setCurrentLevelIdx(nextIdx);
    } else {
      setIsGameOver(true);
      audioService.playFanfare();
      try {
        confetti({ particleCount: 70, spread: 80 });
      } catch {
        // ignore
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
          <div className="ak-sticker-badge w-11 h-11 rounded-2xl bg-[#EEF5FF] dark:bg-[#27234D] border-2 border-[#4389F5]/40 text-[#4389F5] dark:text-[#7DD3FC] flex items-center justify-center shadow-sm">
            <Search size={20} />
          </div>
          <div className="text-left">
            <h3 className="ak-title-display font-black text-lg text-[#25233A] dark:text-white">Detetive da Observação</h3>
            <p className="text-xs text-[#77758A] dark:text-[#C5BFE6]">Foco e Percepção de Detalhes</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Sair
        </Button>
      </div>

      {!isGameOver && currentPuzzle && (
        <div className="my-5 space-y-4">
          <div className="flex justify-between items-center px-2 text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
            <span>Fase {currentLevelIdx + 1} de {PUZZLES.length}</span>
            <span>Pontos: {score}</span>
          </div>

          <div className="p-4 bg-[#F5F3FC] dark:bg-[#27234D] rounded-2xl border-2 border-[#DDD6F3] dark:border-[#38316B]">
            <h4 className="ak-title-display font-black text-base text-[#25233A] dark:text-white mb-1">{currentPuzzle.title}</h4>
            <p className="text-sm font-bold text-[#7047E8] dark:text-[#C4B5FD]">{currentPuzzle.instruction}</p>
          </div>

          {/* Grid of Items */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-sm mx-auto p-4 bg-white dark:bg-[#121024]/70 rounded-3xl border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-sm">
            {currentPuzzle.gridItems.map(item => {
              const isFound = foundInLevel && item.isTarget;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.isTarget)}
                  className={`h-16 rounded-2xl text-3xl flex items-center justify-center transition-all duration-200 transform ${
                    isFound
                      ? 'bg-[#E9FBF4] dark:bg-[#133A2E] border-2 border-[#36C995] scale-110 shadow-glow animate-bounce'
                      : 'bg-[#F5F3FC] dark:bg-[#27234D] hover:bg-[#EDE9FE] dark:hover:bg-[#342E63] active:scale-90 border border-[#E4DFF5] dark:border-[#38316B]'
                  }`}
                >
                  {item.symbol}
                </button>
              );
            })}
          </div>

          {showHint && (
            <p className="text-xs font-bold text-[#8A5A00] dark:text-[#FFD34E] bg-[#FFF9E6] dark:bg-[#27234D] p-2.5 rounded-xl border border-[#FFD34E] dark:border-[#FFD34E]/60 animate-fadeIn">
              💡 Pista: {currentPuzzle.hint}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            {!foundInLevel && !showHint && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(true)}
                className="text-xs text-[#77758A] dark:text-[#C5BFE6]"
              >
                <HelpCircle size={15} />
                <span>Pedir uma dica</span>
              </Button>
            )}

            {foundInLevel && (
              <Button
                variant="primary"
                size="md"
                onClick={advanceLevel}
                className="w-full bg-[#36C995] hover:bg-[#2BB584] border-b-4 border-[#22986E]"
              >
                <CheckCircle2 size={16} />
                <span>Encontrei! Próxima Fase</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="my-6 space-y-4">
          <div className="p-5 bg-[#E9FBF4] dark:bg-[#133A2E] rounded-3xl border-2 border-[#36C995]/50 dark:border-[#36C995]">
            <Trophy size={42} className="mx-auto text-[#FFD34E] mb-1" />
            <h4 className="ak-title-display font-black text-xl text-[#115E43] dark:text-[#A7F3D0]">Detetive Incrível!</h4>
            <p className="text-sm font-bold text-[#115E43]/80 dark:text-[#D1FAE5] mt-1">
              Seus olhos de águia encontraram todos os objetos escondidos! Pontuação: {score}
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentLevelIdx(0);
                setScore(0);
                setIsGameOver(false);
              }}
            >
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
