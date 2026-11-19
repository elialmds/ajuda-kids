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
import { useApp } from '@/modules/context/AppContext';
import { getKidCharacter, KID_CHARACTERS } from '@/data/charactersData';
import { RotateCcw, CheckCircle2, Trophy, Sparkles, Clock, Heart } from 'lucide-react';
import { StandingKidSvgIcon, CrouchingKidSvgIcon } from '@/components/illustrations/CustomIcons';
import { audioService } from '@/services/audioService';
import { VictoryCelebrationModal } from '@/components/common/VictoryCelebrationModal';
import { MultiplayerRoomBanner } from './MultiplayerRoomBanner';
import {
  MultiplayerGameRoom,
  multiplayerRoomService
} from '@/services/multiplayerRoomService';
import confetti from 'canvas-confetti';

interface MortoVivo3DProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit?: () => void;
}

type CommandType = 'vivo' | 'morto';
type RoundStage = 'waiting_input' | 'evaluating' | 'victory';

const CHAR_COLOR_MAP: Record<string, { shirt: number; hair: number }> = {
  char_bia: { shirt: 0x83BCE0, hair: 0x303D63 },
  char_leo: { shirt: 0x97C087, hair: 0x303D63 },
  char_nina: { shirt: 0xD89BA7, hair: 0x8C4A32 },
  char_davi: { shirt: 0xB697D8, hair: 0x303D63 },
  char_lara: { shirt: 0xDEC159, hair: 0x26263A },
  char_tico: { shirt: 0x62A8D8, hair: 0x6B3E26 }
};

export const MortoVivo3D: React.FC<MortoVivo3DProps> = ({ onFinishGame }) => {
  const { activeChild, authSession } = useApp();
  const playerChar = getKidCharacter(activeChild?.avatar);
  const friendChars = KID_CHARACTERS.filter(c => c.id !== playerChar.id).slice(0, 2);

  const [mpRoom, setMpRoom] = useState<MultiplayerGameRoom | null>(null);
  const [mpPlayerId, setMpPlayerId] = useState<string>('');
  const [command, setCommand] = useState<CommandType>('vivo');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [maxRounds] = useState(10);
  const [reactionTimeMs, setReactionTimeMs] = useState(100);
  const [stage, setStage] = useState<RoundStage>('waiting_input');
  const [feedback, setFeedback] = useState<string>('Ouça e siga rápido: VIVO (em pé) ou MORTO (agachar)!');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const isLocked = stage !== 'waiting_input' || Boolean(mpRoom && mpRoom.phase !== 'playing');
  const isGameOver = stage === 'victory';

  const mainKidRef = useRef<THREE.Group | null>(null);
  const friendLRef = useRef<THREE.Group | null>(null);
  const friendRRef = useRef<THREE.Group | null>(null);

  // Articulated postures (NO scale.y squashing!)
  const playerPostureRef = useRef<CharacterPosture>('stand');
  const friendsPostureRef = useRef<CharacterPosture>('stand');
  const friendLPostureRef = useRef<CharacterPosture>('stand');
  const friendRPostureRef = useRef<CharacterPosture>('stand');
  const roundLockedRef = useRef<boolean>(false);
  const nextTimerRef = useRef<number | null>(null);
  const livesRef = useRef<number>(lives);
  livesRef.current = lives;
  const mpRoomRef = useRef<MultiplayerGameRoom | null>(mpRoom);
  mpRoomRef.current = mpRoom;
  const lastSyncedMpRoundRef = useRef<number>(0);

  const clearScheduledNext = () => {
    if (nextTimerRef.current !== null) {
      window.clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
  };

  const issueRoundCommand = useCallback((rNum: number) => {
    const cmds: CommandType[] = ['vivo', 'morto'];
    const nextCmd = cmds[Math.floor(Math.random() * cmds.length)];
    setCommand(nextCmd);
    setReactionTimeMs(100);
    setStage('waiting_input');
    roundLockedRef.current = false;
    playerPostureRef.current = 'stand';
    friendsPostureRef.current = 'stand';
    friendLPostureRef.current = 'stand';
    friendRPostureRef.current = 'stand';

    if (nextCmd === 'vivo') {
      audioService.playBellTone(784, 0.22);
      audioService.speak('Vivo!');
    } else {
      audioService.playBellTone(392, 0.22);
      audioService.speak('Morto!');
    }
    setFeedback(`Rodada ${rNum} de ${maxRounds}: toque na resposta certa antes do tempo acabar!`);
  }, [maxRounds]);

  useEffect(() => {
    if (!mpRoom) {
      issueRoundCommand(1);
    }
    return () => clearScheduledNext();
  }, [issueRoundCommand, mpRoom]);

  // Synchronize Multiplayer Room state into local 3D stage & postures
  useEffect(() => {
    if (!mpRoom) return;
    const remotePlayers = mpRoom.players.filter((p) => p.playerId !== mpPlayerId);
    friendLPostureRef.current = (remotePlayers[0]?.posture as CharacterPosture) || 'stand';
    friendRPostureRef.current = (remotePlayers[1]?.posture as CharacterPosture) || 'stand';

    const localPlayer = mpRoom.players.find((p) => p.playerId === mpPlayerId);
    if (localPlayer) {
      setScore(localPlayer.score);
      setLives(localPlayer.lives);
    }

    if (mpRoom.phase === 'finished') {
      clearScheduledNext();
      setStage('victory');
      playerPostureRef.current = 'celebrate';
      friendLPostureRef.current = 'celebrate';
      friendRPostureRef.current = 'celebrate';
      setFeedback(mpRoom.lastEventMessage || 'Partida concluída na sala!');
      return;
    }

    if (mpRoom.phase === 'lobby') {
      lastSyncedMpRoundRef.current = 0;
      clearScheduledNext();
      playerPostureRef.current = 'stand';
      friendLPostureRef.current = 'stand';
      friendRPostureRef.current = 'stand';
      setFeedback('Sala conectada! Aguardando o anfitrião iniciar a partida...');
      return;
    }

    if (mpRoom.phase === 'playing' && mpRoom.round !== lastSyncedMpRoundRef.current) {
      lastSyncedMpRoundRef.current = mpRoom.round;
      clearScheduledNext();
      roundLockedRef.current = false;
      playerPostureRef.current = 'stand';
      setRound(mpRoom.round);
      setCommand(mpRoom.command);
      setStage('waiting_input');
      setReactionTimeMs(100);
      if (mpRoom.command === 'vivo') {
        audioService.playBellTone(784, 0.22);
        audioService.speak('Vivo!');
      } else {
        audioService.playBellTone(392, 0.22);
        audioService.speak('Morto!');
      }
      setFeedback(`Sala ${mpRoom.code} • Rodada ${mpRoom.round}/10: faça o movimento!`);
    }
  }, [mpRoom, mpPlayerId]);

  const scheduleAdvance = useCallback(
    (currentRound: number, remainingLives: number) => {
      clearScheduledNext();
      setStage('evaluating');
      nextTimerRef.current = window.setTimeout(() => {
        const activeRoom = mpRoomRef.current;
        if (activeRoom) {
          if (activeRoom.hostPlayerId === mpPlayerId) {
            void multiplayerRoomService
              .sendAction({ code: activeRoom.code, playerId: mpPlayerId, type: 'next_round' })
              .then((updated) => setMpRoom(updated))
              .catch(() => undefined);
          }
          return;
        }
        if (remainingLives <= 0 || currentRound >= maxRounds) {
          setStage('victory');
          playerPostureRef.current = remainingLives > 0 ? 'celebrate' : 'stand';
          friendsPostureRef.current = remainingLives > 0 ? 'celebrate' : 'stand';
          if (remainingLives > 0) {
            audioService.playFanfare();
            try {
              confetti({ particleCount: 65, spread: 80 });
            } catch {
              // ignore
            }
          }
        } else {
          const nextR = currentRound + 1;
          setRound(nextR);
          issueRoundCommand(nextR);
        }
      }, 1150);
    },
    [issueRoundCommand, maxRounds, mpPlayerId]
  );

  // Active command countdown timer + automatic timeout progression
  useEffect(() => {
    if (stage !== 'waiting_input') return;
    if (mpRoom && mpRoom.phase !== 'playing') return;

    const stepMs = Math.max(55, 110 - round * 5);
    const barTimer = window.setInterval(() => {
      setReactionTimeMs(prev => {
        if (prev <= 3) {
          window.clearInterval(barTimer);
          return 0;
        }
        return prev - 3;
      });
    }, stepMs);

    return () => window.clearInterval(barTimer);
  }, [round, stage, mpRoom]);

  useEffect(() => {
    if (stage !== 'waiting_input' || reactionTimeMs > 0 || roundLockedRef.current) return;
    if (mpRoom && mpRoom.phase !== 'playing') return;

    roundLockedRef.current = true;
    setStage('evaluating');
    audioService.playBellTone(220, 0.32);
    playerPostureRef.current = 'stand';
    friendsPostureRef.current = command === 'vivo' ? 'vivo_jump' : 'morto_crouch';
    setFeedback(
      `Tempo esgotado! O comando era "${command === 'vivo' ? 'VIVO (em pé)' : 'MORTO (agachar)'}"!`
    );
    const nextLives = Math.max(0, livesRef.current - 1);
    livesRef.current = nextLives;
    setLives(nextLives);
    scheduleAdvance(round, nextLives);
  }, [reactionTimeMs, stage, mpRoom, command, round, scheduleAdvance]);

  const initScene = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    const grass = new THREE.Mesh(
      new THREE.CircleGeometry(14, 36),
      new THREE.MeshStandardMaterial({ color: 0xBCE3A5, roughness: 0.85 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.1;
    grass.receiveShadow = true;
    scene.add(grass);

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.5, 0.36, 36),
      new THREE.MeshStandardMaterial({ color: 0xC8E0F3, roughness: 0.65 })
    );
    floor.position.y = 0.02;
    floor.receiveShadow = true;
    scene.add(floor);

    const floorRim = new THREE.Mesh(
      new THREE.TorusGeometry(4.2, 0.1, 10, 48),
      new THREE.MeshStandardMaterial({ color: 0x303D63, roughness: 0.5 })
    );
    floorRim.rotation.x = Math.PI / 2;
    floorRim.position.y = 0.2;
    scene.add(floorRim);

    const tL = createTree3D();
    tL.position.set(-5.6, -0.1, -3.5);
    const tR = createTree3D();
    tR.position.set(5.6, -0.1, -3.5);
    scene.add(tL, tR);

    const pSpec = CHAR_COLOR_MAP[playerChar.id] || { shirt: 0x83BCE0, hair: 0x303D63 };
    const kidCenter = createKidCharacter3D(playerChar.name, pSpec.shirt, pSpec.hair);
    kidCenter.position.set(0, 0.2, 0.3);
    kidCenter.scale.set(1.22, 1.22, 1.22);
    scene.add(kidCenter);
    mainKidRef.current = kidCenter;

    const fLChar = friendChars[0] || KID_CHARACTERS[1];
    const fLSpec = CHAR_COLOR_MAP[fLChar.id] || { shirt: 0x97C087, hair: 0x303D63 };
    const friendL = createKidCharacter3D(fLChar.name, fLSpec.shirt, fLSpec.hair);
    friendL.position.set(-2.1, 0.2, -0.8);
    scene.add(friendL);
    friendLRef.current = friendL;

    const fRChar = friendChars[1] || KID_CHARACTERS[2];
    const fRSpec = CHAR_COLOR_MAP[fRChar.id] || { shirt: 0xD89BA7, hair: 0x8C4A32 };
    const friendR = createKidCharacter3D(fRChar.name, fRSpec.shirt, fRSpec.hair);
    friendR.position.set(2.1, 0.2, -0.8);
    scene.add(friendR);
    friendRRef.current = friendR;

    camera.position.set(0, 3.4, 7.6);
    camera.lookAt(0, 1.2, 0);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.getElapsedTime();
      if (scene.userData.updateBackdrop) scene.userData.updateBackdrop(t);

      const isMpActive = Boolean(mpRoomRef.current);
      // Articulated posture animation ONLY — preserves natural uniform scale!
      if (mainKidRef.current) {
        setCharacterPosture(mainKidRef.current, playerPostureRef.current, t, dt);
      }
      if (friendLRef.current) {
        setCharacterPosture(
          friendLRef.current,
          isMpActive ? friendLPostureRef.current : friendsPostureRef.current,
          t + 0.3,
          dt
        );
      }
      if (friendRRef.current) {
        setCharacterPosture(
          friendRRef.current,
          isMpActive ? friendRPostureRef.current : friendsPostureRef.current,
          t + 0.6,
          dt
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [playerChar.id, playerChar.name, friendChars]);

  const handleUserMove = useCallback(
    (action: CommandType) => {
      if (stage !== 'waiting_input' || roundLockedRef.current) return;
      if (mpRoom && mpRoom.phase !== 'playing') return;
      roundLockedRef.current = true;
      setStage('evaluating');

      playerPostureRef.current = action === 'vivo' ? 'vivo_jump' : 'morto_crouch';
      if (!mpRoom) {
        friendsPostureRef.current = command === 'vivo' ? 'vivo_jump' : 'morto_crouch';
      }

      if (mpRoom && mpPlayerId) {
        void multiplayerRoomService
          .sendAction({
            code: mpRoom.code,
            playerId: mpPlayerId,
            type: 'posture',
            choice: action
          })
          .then((updated) => setMpRoom(updated))
          .catch(() => undefined);
      }

      if (action === command) {
        const speedBonus = reactionTimeMs > 45 ? 100 : 75;
        if (!mpRoom) {
          setScore(s => s + speedBonus);
        }
        setFeedback(`Acertou em cheio! ${playerChar.name} fez direitinho! (+${speedBonus})`);
        audioService.playSuccess();
        scheduleAdvance(round, livesRef.current);
      } else {
        audioService.playBellTone(250, 0.3);
        setFeedback(`Ops! O comando era "${command === 'vivo' ? 'VIVO (em pé)' : 'MORTO (agachar)'}"!`);
        if (mpRoom) {
          scheduleAdvance(round, livesRef.current);
        } else {
          const nextLives = Math.max(0, livesRef.current - 1);
          livesRef.current = nextLives;
          setLives(nextLives);
          scheduleAdvance(round, nextLives);
        }
      }
    },
    [stage, mpRoom, mpPlayerId, command, reactionTimeMs, playerChar.name, round, scheduleAdvance]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleUserMove('vivo');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleUserMove('morto');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUserMove]);

  const handleRoomChange = useCallback(
    (nextRoom: MultiplayerGameRoom | null, nextPlayerId: string) => {
      setMpRoom(nextRoom);
      setMpPlayerId(nextPlayerId);
      if (!nextRoom) {
        lastSyncedMpRoundRef.current = 0;
        clearScheduledNext();
        playerPostureRef.current = 'stand';
        friendsPostureRef.current = 'stand';
        livesRef.current = 3;
        setLives(3);
        setScore(0);
        setRound(1);
        setStartTime(Date.now());
        issueRoundCommand(1);
      }
    },
    [issueRoundCommand]
  );

  const restartGame = () => {
    clearScheduledNext();
    playerPostureRef.current = 'stand';
    friendsPostureRef.current = 'stand';
    livesRef.current = 3;
    setRound(1);
    setScore(0);
    setLives(3);
    setStartTime(Date.now());
    setStage('waiting_input');
    if (mpRoom && mpRoom.hostPlayerId === mpPlayerId) {
      void multiplayerRoomService
        .startGame(mpRoom.code, mpPlayerId)
        .then((updated) => {
          lastSyncedMpRoundRef.current = 0;
          setMpRoom(updated);
        })
        .catch(() => undefined);
    } else {
      issueRoundCommand(1);
    }
  };

  const handleFinish = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    onFinishGame(elapsed, Math.max(100, score));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      <MultiplayerRoomBanner
        gameType="morto-vivo"
        playerName={activeChild?.name || playerChar.name}
        avatarId={playerChar.id}
        familyId={authSession?.familyId}
        room={mpRoom}
        playerId={mpPlayerId}
        onRoomChange={handleRoomChange}
      />

      {/* HUD */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#EEF5FF] dark:bg-[#27234D] border border-[#4389F5]/40 text-[#1E54B7] dark:text-[#93C5FD] text-xs font-black">
            Rodada {round} de {maxRounds}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[#FFF0F6] dark:bg-[#27234D] border border-[#F16E9A]/40 text-[#D64B7B] dark:text-[#F9A8D4] text-xs font-black flex items-center gap-1">
            {[1, 2, 3].map(h => (
              <Heart
                key={h}
                size={13}
                className={h <= lives ? 'fill-[#F16E9A] text-[#F16E9A]' : 'text-[#F16E9A]/30 opacity-40'}
              />
            ))}
          </span>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-[#FFF3CC] dark:bg-[#27234D] border border-[#FFD34E]/60 text-[#8A5A00] dark:text-[#FFD34E] text-xs font-black flex items-center gap-1">
          <Sparkles size={14} />
          {score} pts
        </span>
      </div>

      {/* 3D Stage */}
      <div className="relative rounded-[32px] overflow-hidden border-2 border-[#DDD6F3] dark:border-[#38316B] shadow-soft">
        <ThreeCanvasContainer onInit={initScene} theme="stage" className="w-full h-80 sm:h-[410px]" />

        {/* Live Command Pill */}
        {!isGameOver && (
          <div className="absolute top-3 inset-x-0 mx-auto w-fit z-20 px-6 py-2.5 rounded-2xl bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-md border-2 border-[#7047E8]/60 dark:border-[#7047E8] shadow-sm flex items-center gap-2.5">
            {command === 'vivo' ? (
              <StandingKidSvgIcon className="w-7 h-7" />
            ) : (
              <CrouchingKidSvgIcon className="w-7 h-7" />
            )}
            <span className="ak-title-display font-display text-xl sm:text-2xl font-bold text-[#25233A] dark:text-white tracking-wide">
              {command === 'vivo' ? 'VIVO! (Em Pé)' : 'MORTO! (Agacha)'}
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
            {/* Active Countdown Timer Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-black text-[#77758A] dark:text-[#C5BFE6]">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Tempo de reação
                </span>
                <span>{reactionTimeMs > 45 ? 'Super Rápido (+100)' : reactionTimeMs > 0 ? 'Na hora (+75)' : 'Tempo esgotado!'}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#F5F3FC] dark:bg-[#121024] overflow-hidden border border-[#DDD6F3] dark:border-[#38316B]">
                <div
                  className={`h-full transition-all duration-75 ${
                    reactionTimeMs < 30 ? 'bg-[#F16E9A]' : 'bg-[#7047E8]'
                  }`}
                  style={{ width: `${reactionTimeMs}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isLocked}
                onClick={() => handleUserMove('vivo')}
                className="btn-lingo py-4 px-5 rounded-2xl bg-[#E9FBF4] dark:bg-[#133A2E] hover:bg-[#D5F7EA] dark:hover:bg-[#1B4E3E] border-2 border-b-4 border-[#36C995] text-[#115E43] dark:text-[#A7F3D0] font-black text-base shadow-tactile-soft flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                <StandingKidSvgIcon className="w-8 h-8" />
                <span>VIVO (Ficar em Pé)</span>
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] rounded-lg bg-white/60 dark:bg-black/30 border border-black/10 dark:border-white/15 font-mono">
                  ↑ / W
                </kbd>
              </button>

              <button
                type="button"
                disabled={isLocked}
                onClick={() => handleUserMove('morto')}
                className="btn-lingo py-4 px-5 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] hover:bg-[#EDE9FE] dark:hover:bg-[#342E63] border-2 border-b-4 border-[#7047E8]/60 dark:border-[#7047E8] text-[#522EC2] dark:text-[#D8D2F8] font-black text-base shadow-tactile-soft flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                <CrouchingKidSvgIcon className="w-8 h-8" />
                <span>MORTO (Agachar)</span>
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] rounded-lg bg-white/60 dark:bg-black/30 border border-black/10 dark:border-white/15 font-mono">
                  ↓ / S
                </kbd>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4 text-center animate-popIn">
            <Trophy size={42} className="mx-auto text-[#FFD34E]" />
            <h4 className="ak-title-display font-display text-2xl font-bold text-[#115E43] dark:text-[#6EE7B7]">
              {lives > 0 ? 'Excelente Agilidade Corporal!' : 'Boa Tentativa! Vamos De Novo?'}
            </h4>
            <p className="text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
              Você alcançou a rodada {round} de {maxRounds} com {score} pontos!
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
        title={lives > 0 ? 'Reflexos de Campeão!' : 'Ótima Prática de Atenção!'}
        subtitle={`Você chegou à rodada ${round} de ${maxRounds} com ${score} pontos!`}
        starsEarned={25}
        score={Math.max(100, score)}
        durationSeconds={Math.max(1, Math.round((Date.now() - startTime) / 1000))}
        characterId={playerChar.id}
        onReplay={restartGame}
        onContinue={handleFinish}
      />
    </div>
  );
};
