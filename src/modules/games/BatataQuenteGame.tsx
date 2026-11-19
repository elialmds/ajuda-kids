import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { KID_CHARACTERS } from '@/data/charactersData';
import { Flame, Play, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';
import { audioService } from '@/services/audioService';
import confetti from 'canvas-confetti';

interface BatataQuenteProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit: () => void;
}

const DIGITAL_CHALLENGES = [
  { text: 'Faça um rugido bem forte como um leãozinho! 🦁', bonus: 100 },
  { text: 'Dê 3 toques rápidos na tela antes que o tempo acabe! ⚡', bonus: 120 },
  { text: 'Escolha a careta mais engraçada para o personagem! 🤪', bonus: 110 },
  { text: 'Imite uma estátua congelada sem piscar! ❄️', bonus: 100 },
  { text: 'Diga três coisas que você adora fazer! 🌟', bonus: 150 }
];

export const BatataQuenteGame: React.FC<BatataQuenteProps> = ({ onFinishGame, onExit }) => {
  const [gameState, setGameState] = useState<'idle' | 'passing' | 'caught' | 'challenge_done'>('idle');
  const [activeKidIndex, setActiveKidIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [currentChallenge, setCurrentChallenge] = useState(DIGITAL_CHALLENGES[0]);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const passTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRound = () => {
    setGameState('passing');
    const randomDuration = Math.floor(Math.random() * 10) + 12; // 12-22s
    setSecondsRemaining(randomDuration);
    audioService.speak('A batata quente começou a voar! Passe rápido entre os amiguinhos!');

    // Passing potato between characters every 900ms, getting faster
    if (passTimerRef.current) clearInterval(passTimerRef.current);
    passTimerRef.current = setInterval(() => {
      setActiveKidIndex(prev => (prev + 1) % KID_CHARACTERS.length);
      audioService.playGentlePop();
    }, 800);
  };

  useEffect(() => {
    if (gameState !== 'passing') return;

    gameTimerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Time up! Potato explodes on the current character
          if (passTimerRef.current) clearInterval(passTimerRef.current);
          if (gameTimerRef.current) clearInterval(gameTimerRef.current);

          setGameState('caught');
          setRoundsPlayed(r => r + 1);
          audioService.playBellTone(220, 0.5);
          audioService.speak('Queimou! Quem está com a batata cumpre o desafio!');
          const ch = DIGITAL_CHALLENGES[Math.floor(Math.random() * DIGITAL_CHALLENGES.length)];
          setCurrentChallenge(ch);
          try {
            confetti({ particleCount: 35, spread: 60 });
          } catch {
            // ignore
          }
          return 0;
        }

        // Ticking sounds getting faster
        const tickFreq = prev < 5 ? 750 : prev < 10 ? 600 : 450;
        audioService.playBellTone(tickFreq, 0.08);
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (passTimerRef.current) clearInterval(passTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [gameState]);

  // Player manual fast-pass button
  const handleManualPass = () => {
    if (gameState !== 'passing') return;
    setActiveKidIndex(prev => (prev + 1) % KID_CHARACTERS.length);
    audioService.playGentlePop();
    setScore(s => s + 10);
  };

  const handleCompleteChallenge = () => {
    audioService.playSuccess();
    setScore(s => s + currentChallenge.bonus);
    setGameState('challenge_done');
  };

  const handleFinish = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    onFinishGame(elapsed, score + (roundsPlayed + 1) * 80);
  };

  const caughtKid = KID_CHARACTERS[activeKidIndex];

  return (
    <Card className="ak-card-3d max-w-xl mx-auto text-center bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4DFF5] dark:border-[#38316B]">
        <div className="flex items-center gap-2.5">
          <div className="ak-sticker-badge w-11 h-11 rounded-2xl bg-[#FFF9E6] dark:bg-[#27234D] border-2 border-[#FFD34E]/60 text-[#D97706] dark:text-[#FFD34E] flex items-center justify-center shadow-sm">
            <Flame size={20} />
          </div>
          <div className="text-left">
            <h3 className="ak-title-display font-black text-lg text-[#25233A] dark:text-white">Batata Quente Digital</h3>
            <p className="text-xs text-[#77758A] dark:text-[#C5BFE6]">Roda Animada dos Amiguinhos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#F5F3FC] dark:bg-[#27234D] text-xs font-extrabold text-[#7047E8] dark:text-[#C4B5FD] border border-[#DDD6F3] dark:border-[#38316B]">Pontos: {score}</span>
          <Button variant="ghost" size="sm" onClick={onExit}>
            Sair
          </Button>
        </div>
      </div>

      {/* Arena with Circular Kids */}
      <div className="relative my-6 h-64 sm:h-72 w-full max-w-sm mx-auto flex items-center justify-center">
        {/* Center Potato */}
        <div
          className={`relative z-20 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-soft ${
            gameState === 'passing'
              ? secondsRemaining < 5
                ? 'bg-[#F16E9A] text-white animate-bounce scale-110 shadow-glow'
                : 'bg-[#FFF3D1] dark:bg-[#27234D] border-2 border-[#FFD34E] text-[#9E6A00] dark:text-[#FFD34E] scale-105'
              : gameState === 'caught'
              ? 'bg-rose-600 text-white scale-125 shadow-glow'
              : 'bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#DDD6F3] dark:border-[#38316B] text-[#25233A] dark:text-white'
          }`}
        >
          {gameState === 'idle' && (
            <>
              <span className="text-3xl">🥔</span>
              <span className="text-[10px] font-black uppercase mt-1">Prontos?</span>
            </>
          )}

          {gameState === 'passing' && (
            <>
              <span className="text-3xl animate-pulse">🔥🥔🔥</span>
              <span className="text-[10px] font-black uppercase">
                {secondsRemaining < 5 ? 'VAI QUEIMAR!' : `${secondsRemaining}s`}
              </span>
            </>
          )}

          {(gameState === 'caught' || gameState === 'challenge_done') && (
            <>
              <span className="text-3xl">💥</span>
              <span className="text-[10px] font-black uppercase">QUEIMOU!</span>
            </>
          )}
        </div>

        {/* 6 Kid Characters in a Circle */}
        {KID_CHARACTERS.map((kid, index) => {
          const total = KID_CHARACTERS.length;
          const angle = (index * (360 / total) - 90) * (Math.PI / 180);
          const radius = 105; // radius in px
          const x = Math.round(radius * Math.cos(angle));
          const y = Math.round(radius * Math.sin(angle));

          const hasPotato = activeKidIndex === index && gameState !== 'idle';

          return (
            <div
              key={kid.id}
              style={{
                transform: `translate(${x}px, ${y}px)`
              }}
              className="absolute z-10 flex flex-col items-center transition-all duration-300"
            >
              <div
                className={`w-14 h-14 rounded-2xl p-1 bg-white dark:bg-[#27234D] border-2 transition-all flex items-center justify-center shadow-card ${
                  hasPotato
                    ? 'border-[#F16E9A] scale-125 shadow-glow ring-4 ring-[#F16E9A]/45'
                    : 'border-[#DDD6F3] dark:border-[#38316B] opacity-90'
                }`}
              >
                {kid.renderAvatar(44)}
              </div>
              <span className="text-[10px] font-black text-[#25233A] dark:text-white mt-1 bg-white/95 dark:bg-[#27234D]/95 border border-[#E4DFF5] dark:border-[#38316B] px-2 py-0.5 rounded-full shadow-xs">
                {kid.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Interactive Controls & Feedback */}
      {gameState === 'idle' && (
        <div className="my-4 space-y-3">
          <p className="text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
            Veja a batatinha pular entre os amiguinhos! Quando parar, quem estiver com ela cumpre o desafio.
          </p>
          <Button variant="primary" size="lg" className="w-full" onClick={startRound}>
            <Play size={18} />
            <span>Começar Rodada Digital</span>
          </Button>
        </div>
      )}

      {gameState === 'passing' && (
        <div className="my-4 space-y-3">
          <p className="text-xs font-black text-[#7047E8] dark:text-[#C4B5FD]">
            Batata com: <strong className="text-[#F16E9A]">{caughtKid.name}</strong>!
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-full bg-[#FF9B42] hover:bg-[#E07C22] border-b-4 border-[#B85E0F] shadow-soft"
            onClick={handleManualPass}
          >
            <span>Passar Rápido! 🥔💨</span>
          </Button>
        </div>
      )}

      {gameState === 'caught' && (
        <div className="my-4 p-4 rounded-3xl bg-[#FFF9E6] dark:bg-[#27234D] border-2 border-[#FFD34E] dark:border-[#FFD34E]/60 animate-fadeIn space-y-3">
          <span className="text-xs font-black uppercase text-[#9E6A00] dark:text-[#FFD34E]">
            A batata parou com {caughtKid.name}! Desafio:
          </span>
          <p className="text-base font-black text-[#25233A] dark:text-white">
            {currentChallenge.text}
          </p>
          <Button
            variant="primary"
            size="md"
            className="w-full bg-[#36C995] hover:bg-[#2BB584] border-b-4 border-[#22986E]"
            onClick={handleCompleteChallenge}
          >
            <Sparkles size={16} />
            <span>Cumprir Desafio (+{currentChallenge.bonus} pts)</span>
          </Button>
        </div>
      )}

      {gameState === 'challenge_done' && (
        <div className="my-4 p-4 rounded-3xl bg-[#E9FBF4] dark:bg-[#133A2E] border-2 border-[#36C995]/50 dark:border-[#36C995] animate-fadeIn space-y-3">
          <span className="text-2xl">🎉</span>
          <h4 className="font-black text-sm text-[#115E43] dark:text-[#A7F3D0]">
            Desafio cumprido com sucesso!
          </h4>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={startRound}>
              <RotateCcw size={15} />
              <span>Outra Rodada</span>
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
