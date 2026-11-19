import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { KID_CHARACTERS } from '@/data/charactersData';
import { Sparkles, RotateCcw, CheckCircle2, Trophy } from 'lucide-react';
import { audioService } from '@/services/audioService';
import confetti from 'canvas-confetti';

interface JogoMemoriaProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit: () => void;
}

interface MemoryCard {
  id: number;
  charId: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const JogoMemoriaGame: React.FC<JogoMemoriaProps> = ({ onFinishGame, onExit }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [isGameOver, setIsGameOver] = useState(false);

  const setupGame = () => {
    // 6 kid characters pairs = 12 cards
    const deck = [...KID_CHARACTERS, ...KID_CHARACTERS];
    const shuffled = deck
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        charId: item.id,
        name: item.name,
        isFlipped: false,
        isMatched: false
      }));

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setIsGameOver(false);
  };

  useEffect(() => {
    setupGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    audioService.playCardFlip();

    const nextFlipped = [...flippedCards, id];
    setCards(prev =>
      prev.map(c => (c.id === id ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = nextFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.charId === secondCard.charId) {
        // Matched!
        setTimeout(() => {
          audioService.playSuccess();
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);
          setMatchedPairs(p => {
            const next = p + 1;
            if (next === KID_CHARACTERS.length) {
              handleGameWin();
            }
            return next;
          });
        }, 400);
      } else {
        // Flip back
        setTimeout(() => {
          audioService.playBellTone(280, 0.15);
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  const handleGameWin = () => {
    setIsGameOver(true);
    audioService.playFanfare();
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const handleFinish = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const score = Math.max(100, 500 - moves * 15);
    onFinishGame(elapsed, score);
  };

  return (
    <Card className="ak-card-3d max-w-xl mx-auto text-center bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4DFF5] dark:border-[#38316B]">
        <div className="flex items-center gap-2.5">
          <div className="ak-sticker-badge w-11 h-11 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#DDD6F3] dark:border-[#38316B] text-[#7047E8] dark:text-[#C4B5FD] flex items-center justify-center shadow-sm">
            <Sparkles size={20} />
          </div>
          <div className="text-left">
            <h3 className="ak-title-display font-black text-lg text-[#25233A] dark:text-white">Jogo da Memória dos Amigos</h3>
            <p className="text-xs text-[#77758A] dark:text-[#C5BFE6]">Encontre os Pares de Crianças</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Sair
        </Button>
      </div>

      <div className="flex justify-between items-center my-3 px-2 text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
        <span>Tentativas: {moves}</span>
        <span>Pares: {matchedPairs} / {KID_CHARACTERS.length}</span>
      </div>

      {/* Cards Grid: 12 cards (3x4 or 4x3) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3 my-4">
        {cards.map(card => {
          const showFace = card.isFlipped || card.isMatched;
          const kid = KID_CHARACTERS.find(k => k.id === card.charId) || KID_CHARACTERS[0];

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card.id)}
              disabled={showFace}
              className={`h-24 sm:h-28 rounded-2xl flex flex-col items-center justify-center p-2 transition-all duration-300 transform ${
                showFace
                  ? card.isMatched
                    ? 'bg-[#E9FBF4] dark:bg-[#133A2E] border-2 border-[#36C995] scale-95 shadow-sm'
                    : 'bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#7047E8] scale-102 shadow-soft'
                  : 'bg-white dark:bg-[#27234D] border-2 border-b-4 border-[#E4DFF5] dark:border-[#38316B] hover:bg-[#F5F3FC] dark:hover:bg-[#342E63] active:scale-95 shadow-sm'
              }`}
            >
              {showFace ? (
                <>
                  <div className="w-12 h-12 flex items-center justify-center">
                    {kid.renderAvatar(44)}
                  </div>
                  <span className="text-[10px] font-black text-[#25233A] dark:text-white mt-1">
                    {kid.name}
                  </span>
                </>
              ) : (
                <span className="text-3xl text-[#7047E8] dark:text-[#C4B5FD]">❓</span>
              )}
            </button>
          );
        })}
      </div>

      {isGameOver ? (
        <div className="p-4 bg-[#E9FBF4] dark:bg-[#133A2E] rounded-3xl border-2 border-[#36C995]/50 dark:border-[#36C995] mt-4 animate-fadeIn">
          <Trophy size={40} className="mx-auto text-[#FFD34E] mb-1" />
          <h4 className="ak-title-display font-black text-xl text-[#115E43] dark:text-[#A7F3D0]">
            Parabéns! Você reuniu todos os amigos!
          </h4>
          <p className="text-xs font-bold text-[#115E43]/80 dark:text-[#C5BFE6] mb-3">
            Você precisou de {moves} tentativas para achar todos os pares.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={setupGame}>
              <RotateCcw size={15} />
              <span>Jogar de Novo</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handleFinish}>
              <CheckCircle2 size={15} />
              <span>Concluir Partida</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="pt-2">
          <Button variant="ghost" size="sm" onClick={setupGame}>
            <RotateCcw size={14} />
            <span>Embaralhar Novamente</span>
          </Button>
        </div>
      )}
    </Card>
  );
};
