import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { CheckCircle2, Play, RotateCcw, Trophy, Crown, Sparkles } from 'lucide-react';
import { audioService } from '@/services/audioService';
import confetti from 'canvas-confetti';

interface SimonSaysProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit: () => void;
}

interface CommandPrompt {
  id: number;
  text: string;
  isMasterCommand: boolean;
  actionText: string;
}

const COMMANDS_POOL: CommandPrompt[] = [
  { id: 1, text: 'O Mestre Mandou: Colocar a mão na cabeça! 💆‍♂️', isMasterCommand: true, actionText: 'Colocar a mão na cabeça' },
  { id: 2, text: 'Bata 3 palmas bem rápido! 👏', isMasterCommand: false, actionText: 'Bater 3 palmas' },
  { id: 3, text: 'O Mestre Mandou: Dar uma piscadinha com um olho só! 😉', isMasterCommand: true, actionText: 'Dar uma piscadinha' },
  { id: 4, text: 'Pule bem alto! 🦘', isMasterCommand: false, actionText: 'Pular bem alto' },
  { id: 5, text: 'O Mestre Mandou: Dar um abraço em si mesmo! 🤗', isMasterCommand: true, actionText: 'Dar um abraço em si mesmo' },
  { id: 6, text: 'Gire uma vez no lugar! 🌀', isMasterCommand: false, actionText: 'Girar no lugar' },
  { id: 7, text: 'O Mestre Mandou: Fazer uma pose de super-herói! 🦸', isMasterCommand: true, actionText: 'Pose de super-herói' }
];

export const SimonSaysGame: React.FC<SimonSaysProps> = ({ onFinishGame, onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const startGame = () => {
    setIsPlaying(true);
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setIsGameOver(false);
    playCommand(0);
  };

  const playCommand = (idx: number) => {
    const cmd = COMMANDS_POOL[idx];
    if (cmd) {
      audioService.speak(cmd.text);
    }
  };

  const handleUserAction = (didAction: boolean) => {
    const cmd = COMMANDS_POOL[currentIndex];
    const isCorrect = didAction === cmd.isMasterCommand;

    if (isCorrect) {
      setScore(s => s + 100);
      setFeedback('Acertou! Excelente atenção ao Mestre!');
      audioService.playSuccess();
    } else {
      setFeedback(
        cmd.isMasterCommand
          ? 'Opa! O Mestre tinha mandado fazer!'
          : 'Pegadinha! O Mestre NÃO tinha mandado!'
      );
      audioService.playBellTone(280, 0.25);
    }

    setTimeout(() => {
      const next = currentIndex + 1;
      if (next < COMMANDS_POOL.length) {
        setCurrentIndex(next);
        setFeedback(null);
        playCommand(next);
      } else {
        handleGameWin();
      }
    }, 1800);
  };

  const handleGameWin = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    audioService.playFanfare();
    try {
      confetti({ particleCount: 50, spread: 80 });
    } catch {
      // ignore
    }
  };

  const handleFinish = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    onFinishGame(elapsed, score);
  };

  const currentCmd = COMMANDS_POOL[currentIndex];

  return (
    <Card className="ak-card-3d max-w-xl mx-auto text-center bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B]">
      <div className="flex items-center justify-between pb-3 border-b border-[#E4DFF5] dark:border-[#38316B]">
        <div className="flex items-center gap-2.5">
          <div className="ak-sticker-badge w-11 h-11 rounded-2xl bg-[#E9FBF4] dark:bg-[#27234D] border-2 border-[#36C995]/50 text-[#115E43] dark:text-[#6EE7B7] flex items-center justify-center shadow-sm">
            <Crown size={20} />
          </div>
          <div className="text-left">
            <h3 className="ak-title-display font-black text-lg text-[#25233A] dark:text-white">O Mestre Mandou</h3>
            <p className="text-xs text-[#77758A] dark:text-[#C5BFE6]">Simon Says Interativo</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Sair
        </Button>
      </div>

      {!isPlaying && !isGameOver && (
        <div className="my-6 space-y-4">
          <div className="p-4 bg-[#F5F3FC] dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] rounded-2xl text-xs text-[#77758A] dark:text-[#D8D2F8] text-left leading-relaxed">
            <span className="font-black block text-[#25233A] dark:text-white text-sm mb-1">Atenção às Regras:</span>
            Você só deve fazer a ação se ouvir <strong>"O Mestre Mandou"</strong> antes! Se falarem a ação direta sem o Mestre mandar, fique quietinho sem fazer nada e clique no botão correspondente!
          </div>

          <div className="ak-sticker-badge w-28 h-28 rounded-full bg-[#FFF3CC] dark:bg-[#27234D] border-2 border-[#FFD34E] text-[#8A5A00] dark:text-[#FFD34E] mx-auto flex items-center justify-center text-5xl shadow-card">
            👑
          </div>

          <Button variant="primary" size="lg" className="w-full" onClick={startGame}>
            <Play size={18} />
            <span>Começar Jogo</span>
          </Button>
        </div>
      )}

      {isPlaying && currentCmd && (
        <div className="my-6 space-y-6">
          <div className="flex justify-between items-center px-4 text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
            <span>Comando {currentIndex + 1} de {COMMANDS_POOL.length}</span>
            <span>Pontos: {score}</span>
          </div>

          {/* Prompt card */}
          <div className="ak-card-3d p-6 rounded-3xl bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#7047E8]/50 dark:border-[#7047E8] text-center shadow-soft">
            <span className="text-4xl block mb-2">📢</span>
            <h4 className="ak-title-display text-xl sm:text-2xl font-black text-[#25233A] dark:text-white">
              {currentCmd.text}
            </h4>
          </div>

          {feedback ? (
            <div className="p-3 bg-[#E9FBF4] dark:bg-[#133A2E] rounded-2xl border-2 border-[#36C995] text-sm font-extrabold text-[#115E43] dark:text-[#A7F3D0] animate-fadeIn">
              {feedback}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleUserAction(true)}
                className="py-4 bg-[#36C995] hover:bg-[#2BB584] border-b-4 border-[#22986E]"
              >
                <span>Fiz a Ação! ✅</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => handleUserAction(false)}
                className="py-4 border-2 border-b-4 border-[#FFD34E] bg-[#FFF9E6] dark:bg-[#27234D] text-[#8A5A00] dark:text-[#FFD34E] hover:bg-[#FFF2CC] dark:hover:bg-[#342E63]"
              >
                <span>Não fiz (Mestre não mandou!) ✋</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {isGameOver && (
        <div className="my-6 space-y-4">
          <div className="p-5 bg-[#E9FBF4] dark:bg-[#133A2E] rounded-3xl border-2 border-[#36C995]/50 dark:border-[#36C995]">
            <Trophy size={40} className="mx-auto text-[#FFD34E] mb-1" />
            <h4 className="ak-title-display font-black text-xl text-[#115E43] dark:text-[#A7F3D0]">Mestre da Atenção!</h4>
            <p className="text-sm font-bold text-[#115E43]/80 dark:text-[#D1FAE5] mt-1">
              Você conquistou {score} pontos prestando muita atenção!
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={startGame}>
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
