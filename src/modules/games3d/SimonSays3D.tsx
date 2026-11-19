import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { ThreeCanvasContainer } from './ThreeCanvasContainer';
import {
  createKidCharacter3D,
  createTree3D,
  setCharacterPosture,
  CharacterPosture
} from './modelFactory';
import { Button } from '@/components/common/Button';
import { RotateCcw, CheckCircle2, Trophy, Sparkles, Hand, Clock } from 'lucide-react';
import { CrownSvgIcon } from '@/components/illustrations/CustomIcons';
import { audioService } from '@/services/audioService';
import { VictoryCelebrationModal } from '@/components/common/VictoryCelebrationModal';
import confetti from 'canvas-confetti';

interface SimonSays3DProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit?: () => void;
}

interface CommandData {
  id: number;
  text: string;
  isMasterCommand: boolean;
  actionPose: 'jump' | 'armsUp' | 'spin' | 'bow';
}

const COMMANDS: CommandData[] = [
  { id: 1, text: 'O Mestre Mandou: Pular bem alto!', isMasterCommand: true, actionPose: 'jump' },
  { id: 2, text: 'Bata palmas bem rápido!', isMasterCommand: false, actionPose: 'armsUp' },
  { id: 3, text: 'O Mestre Mandou: Girar uma vez no lugar!', isMasterCommand: true, actionPose: 'spin' },
  { id: 4, text: 'Agache perto do chão!', isMasterCommand: false, actionPose: 'bow' },
  { id: 5, text: 'O Mestre Mandou: Erguer os braços para o céu!', isMasterCommand: true, actionPose: 'armsUp' },
  { id: 6, text: 'Dê um pulinho para o lado!', isMasterCommand: false, actionPose: 'jump' },
  { id: 7, text: 'O Mestre Mandou: Agachar devagarzinho!', isMasterCommand: true, actionPose: 'bow' }
];

export const SimonSays3D: React.FC<SimonSays3DProps> = ({ onFinishGame }) => {
  const [cmdIndex, setCmdIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeftPct, setTimeLeftPct] = useState(100);
  const [feedback, setFeedback] = useState<string>('Só faça a ação se disser "O Mestre Mandou"!');
  const [isLocked, setIsLocked] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const masterGroupRef = useRef<THREE.Group | null>(null);
  const helperLRef = useRef<THREE.Group | null>(null);
  const helperRRef = useRef<THREE.Group | null>(null);
  const masterPostureRef = useRef<CharacterPosture>('stand');
  const helperPostureRef = useRef<CharacterPosture>('stand');
  const targetRotYRef = useRef(0);
  const roundLockedRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);

  const clearScheduled = () => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  };

  const trigger3DPose = useCallback((pose: CommandData['actionPose']) => {
    if (pose === 'jump' || pose === 'armsUp') {
      masterPostureRef.current = 'vivo_jump';
      helperPostureRef.current = 'vivo_jump';
      window.setTimeout(() => {
        masterPostureRef.current = 'stand';
        helperPostureRef.current = 'stand';
      }, 900);
    } else if (pose === 'bow') {
      masterPostureRef.current = 'morto_crouch';
      helperPostureRef.current = 'morto_crouch';
      window.setTimeout(() => {
        masterPostureRef.current = 'stand';
        helperPostureRef.current = 'stand';
      }, 950);
    } else if (pose === 'spin') {
      masterPostureRef.current = 'celebrate';
      targetRotYRef.current += Math.PI * 2;
      window.setTimeout(() => {
        masterPostureRef.current = 'stand';
      }, 900);
    }
  }, []);

  const playCommand = useCallback(
    (idx: number) => {
      const cmd = COMMANDS[idx];
      if (!cmd) return;
      roundLockedRef.current = false;
      setIsLocked(false);
      setTimeLeftPct(100);
      audioService.speak(cmd.text);
      trigger3DPose(cmd.actionPose);
    },
    [trigger3DPose]
  );

  useEffect(() => {
    const t = window.setTimeout(() => playCommand(0), 220);
    return () => {
      window.clearTimeout(t);
      clearScheduled();
    };
  }, [playCommand]);

  const advanceToNextCommand = useCallback(
    (currentIdx: number) => {
      clearScheduled();
      advanceTimerRef.current = window.setTimeout(() => {
        const next = currentIdx + 1;
        if (next < COMMANDS.length) {
          setCmdIndex(next);
          setFeedback('Ouça com atenção o próximo comando!');
          playCommand(next);
        } else {
          setIsGameOver(true);
          masterPostureRef.current = 'celebrate';
          helperPostureRef.current = 'celebrate';
          audioService.playFanfare();
          try {
            confetti({ particleCount: 65, spread: 80 });
          } catch {
            // ignore
          }
        }
      }, 1300);
    },
    [playCommand]
  );

  // Per-command active timer (if time hits 0 without clicks, resolves fairly & advances!)
  useEffect(() => {
    if (isGameOver || isLocked) return;

    const timer = window.setInterval(() => {
      setTimeLeftPct(prev => {
        if (prev <= 2) {
          window.clearInterval(timer);
          if (!roundLockedRef.current) {
            roundLockedRef.current = true;
            setIsLocked(true);
            const cmd = COMMANDS[cmdIndex];
            if (cmd && !cmd.isMasterCommand) {
              // Staying still when Master didn't command is CORRECT!
              setScore(s => s + 100);
              setFeedback('Excelente! O Mestre NÃO mandou e você ficou paradinho! (+100 pts)');
              audioService.playSuccess();
              masterPostureRef.current = 'celebrate';
            } else {
              setFeedback('Tempo esgotado! Dessa vez "O Mestre Mandou" e era para fazer!');
              audioService.playBellTone(260, 0.28);
            }
            advanceToNextCommand(cmdIndex);
          }
          return 0;
        }
        return prev - 2;
      });
    }, 110);

    return () => window.clearInterval(timer);
  }, [cmdIndex, isGameOver, isLocked, advanceToNextCommand]);

  const initScene = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    const grass = new THREE.Mesh(
      new THREE.CircleGeometry(14, 36),
      new THREE.MeshStandardMaterial({ color: 0xBCE3A5, roughness: 0.85 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.1;
    grass.receiveShadow = true;
    scene.add(grass);

    const stage = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 3.9, 0.4, 36),
      new THREE.MeshStandardMaterial({ color: 0xF4E9A9, roughness: 0.65 })
    );
    stage.position.y = 0.02;
    stage.receiveShadow = true;
    scene.add(stage);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(3.62, 0.09, 10, 48),
      new THREE.MeshStandardMaterial({ color: 0x303D63, roughness: 0.5 })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.22;
    scene.add(rim);

    const tL = createTree3D();
    tL.position.set(-5.5, -0.1, -3.6);
    const tR = createTree3D();
    tR.position.set(5.5, -0.1, -3.6);
    scene.add(tL, tR);

    // Crowned Master in Center (crown attached to upperBody so it tracks head movements cleanly)
    const master = createKidCharacter3D('Mestre', 0x303D63, 0x9E5A28);
    master.position.set(0, 0.18, 0.2);
    master.scale.set(1.38, 1.38, 1.38);

    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.22, 0.24, 6),
      new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.35, metalness: 0.25 })
    );
    crown.position.set(0, 2.02, -0.02);
    const masterUpper = master.getObjectByName('upperBody');
    if (masterUpper) {
      masterUpper.add(crown);
    } else {
      master.add(crown);
    }
    scene.add(master);
    masterGroupRef.current = master;

    const helperL = createKidCharacter3D('Lara', 0xDEC159, 0x26263A);
    helperL.position.set(-2.2, 0.2, -0.7);
    const helperR = createKidCharacter3D('Davi', 0xB697D8, 0x303D63);
    helperR.position.set(2.2, 0.2, -0.7);
    scene.add(helperL, helperR);
    helperLRef.current = helperL;
    helperRRef.current = helperR;

    camera.position.set(0, 3.6, 7.6);
    camera.lookAt(0, 1.3, 0);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (scene.userData.updateBackdrop) scene.userData.updateBackdrop(t);

      if (masterGroupRef.current) {
        masterGroupRef.current.rotation.y += (targetRotYRef.current - masterGroupRef.current.rotation.y) * 0.16;
        setCharacterPosture(masterGroupRef.current, masterPostureRef.current, t);
      }
      if (helperLRef.current) {
        setCharacterPosture(helperLRef.current, helperPostureRef.current, t + 0.35);
      }
      if (helperRRef.current) {
        setCharacterPosture(helperRRef.current, helperPostureRef.current, t + 0.7);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleUserAction = (didAction: boolean) => {
    if (isGameOver || isLocked || roundLockedRef.current) return;
    roundLockedRef.current = true;
    setIsLocked(true);

    const cmd = COMMANDS[cmdIndex];
    const isCorrect = didAction === cmd.isMasterCommand;

    if (isCorrect) {
      setScore(s => s + 100);
      setFeedback('Acertou em cheio! O Mestre adorou sua atenção!');
      audioService.playSuccess();
      masterPostureRef.current = 'celebrate';
      targetRotYRef.current += Math.PI * 2;
    } else {
      setFeedback(
        cmd.isMasterCommand
          ? 'Opa! Dessa vez o Mestre tinha mandado fazer!'
          : 'Pegadinha! O Mestre NÃO tinha dito "O Mestre Mandou"!'
      );
      audioService.playBellTone(280, 0.25);
    }

    advanceToNextCommand(cmdIndex);
  };

  const restartGame = () => {
    clearScheduled();
    setCmdIndex(0);
    setScore(0);
    setIsGameOver(false);
    setFeedback('Só faça a ação se disser "O Mestre Mandou"!');
    playCommand(0);
  };

  const handleFinish = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    onFinishGame(elapsed, Math.max(100, score));
  };

  const currentCmd = COMMANDS[cmdIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      {/* HUD */}
      <div className="flex items-center justify-between px-1">
        <span className="px-3.5 py-1.5 rounded-full bg-[#FFF3CC] dark:bg-[#27234D] border border-[#FFD34E]/60 text-[#8A5A00] dark:text-[#FFD34E] text-xs font-black flex items-center gap-1.5">
          <CrownSvgIcon className="w-5 h-5" />
          Desafio {cmdIndex + 1} de {COMMANDS.length}
        </span>
        <span className="px-3.5 py-1.5 rounded-full bg-[#EEF5FF] dark:bg-[#27234D] border border-[#4389F5]/40 text-[#1E54B7] dark:text-[#93C5FD] text-xs font-black flex items-center gap-1">
          <Sparkles size={14} />
          {score} pts
        </span>
      </div>

      {/* 3D Royal Stage */}
      <div className="relative rounded-[32px] overflow-hidden border-2 border-[#DDD6F3] dark:border-[#38316B] shadow-soft">
        <ThreeCanvasContainer onInit={initScene} theme="stage" className="w-full h-80 sm:h-[410px]" />

        {!isGameOver && currentCmd && (
          <div className="absolute top-3 inset-x-3 mx-auto w-fit max-w-[92%] z-20 px-5 py-2.5 rounded-2xl bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-md border-2 border-[#FFD34E]/70 dark:border-[#7047E8] shadow-sm text-center">
            <span className="ak-title-display font-display text-base sm:text-xl font-bold text-[#25233A] dark:text-white">
              {currentCmd.text}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 inset-x-3 mx-auto w-fit max-w-[92%] z-20 bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#DDD6F3] dark:border-[#38316B] shadow-sm text-center">
          <span className="text-xs sm:text-sm font-black text-[#25233A] dark:text-[#F8FAFC]">{feedback}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="ak-card-3d rounded-[28px] p-5 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-card space-y-4">
        {!isGameOver ? (
          <>
            {/* Command Countdown Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-black text-[#77758A] dark:text-[#C5BFE6]">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Tempo de decisão
                </span>
                <span>{currentCmd?.isMasterCommand ? 'Obedeça antes de zerar!' : 'Segure sem agir até zerar!'}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#F5F3FC] dark:bg-[#121024] overflow-hidden border border-[#DDD6F3] dark:border-[#38316B]">
                <div
                  className={`h-full transition-all duration-100 ${
                    timeLeftPct < 30 ? 'bg-[#FF9B42]' : 'bg-[#7047E8]'
                  }`}
                  style={{ width: `${timeLeftPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isLocked}
                onClick={() => handleUserAction(true)}
                className="btn-lingo py-4 px-5 rounded-2xl bg-[#E9FBF4] hover:bg-[#D5F7EA] dark:bg-[#133A2E] dark:hover:bg-[#1B4E3E] border-2 border-b-4 border-[#36C995] text-[#115E43] dark:text-[#A7F3D0] font-black text-base shadow-tactile-soft flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CheckCircle2 size={20} />
                <span>Fiz a Ação!</span>
              </button>

              <button
                type="button"
                disabled={isLocked}
                onClick={() => handleUserAction(false)}
                className="btn-lingo py-4 px-5 rounded-2xl bg-[#FFF0F6] hover:bg-[#FFE0EE] dark:bg-[#3A1E30] dark:hover:bg-[#4E263F] border-2 border-b-4 border-[#F16E9A] text-[#B0355F] dark:text-[#FECDD3] font-black text-base shadow-tactile-soft flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Hand size={20} />
                <span>Fiquei Parado! (Não mandou)</span>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4 text-center animate-popIn">
            <Trophy size={42} className="mx-auto text-[#FFD34E]" />
            <h4 className="ak-title-display font-display text-2xl font-bold text-[#115E43] dark:text-[#6EE7B7]">
              Excelente Foco e Atenção!
            </h4>
            <p className="text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
              Você conquistou {score} pontos prestando atenção em cada detalhe!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={restartGame}>
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
      </div>

      <VictoryCelebrationModal
        isOpen={isGameOver}
        title="O Mestre Adorou!"
        subtitle={`Você prestou muita atenção e conquistou ${score} pontos!`}
        starsEarned={25}
        score={Math.max(100, score)}
        durationSeconds={Math.max(1, Math.round((Date.now() - startTime) / 1000))}
        characterId="mestre"
        onReplay={restartGame}
        onContinue={handleFinish}
      />
    </div>
  );
};
