import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvasContainer } from './ThreeCanvasContainer';
import {
  createKidCharacter3D,
  createPotato3D,
  createTree3D,
  setCharacterSeated
} from './modelFactory';
import { Button } from '@/components/common/Button';
import { useApp } from '@/modules/context/AppContext';
import { getKidCharacter, KID_CHARACTERS } from '@/data/charactersData';
import { RotateCcw, CheckCircle2, Trophy, Sparkles, Flame, Clock } from 'lucide-react';
import { HotPotatoSvgIcon } from '@/components/illustrations/CustomIcons';
import { audioService } from '@/services/audioService';
import { VictoryCelebrationModal } from '@/components/common/VictoryCelebrationModal';
import confetti from 'canvas-confetti';

interface BatataQuente3DProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit?: () => void;
}

const CHAR_COLOR_MAP: Record<string, { shirt: number; hair: number }> = {
  char_bia: { shirt: 0x83BCE0, hair: 0x303D63 },
  char_leo: { shirt: 0x97C087, hair: 0x303D63 },
  char_nina: { shirt: 0xD89BA7, hair: 0x8C4A32 },
  char_davi: { shirt: 0xB697D8, hair: 0x303D63 },
  char_lara: { shirt: 0xDEC159, hair: 0x26263A },
  char_tico: { shirt: 0x62A8D8, hair: 0x6B3E26 }
};

export const BatataQuente3D: React.FC<BatataQuente3DProps> = ({ onFinishGame }) => {
  const { activeChild } = useApp();
  const playerChar = getKidCharacter(activeChild?.avatar);

  // Player sits at index 0, accompanied by 4 other characters from the gang
  const circleKids = useMemo(() => {
    const others = KID_CHARACTERS.filter(c => c.id !== playerChar.id).slice(0, 4);
    return [playerChar, ...others].map((c, idx) => ({
      id: idx,
      name: idx === 0 ? `${c.name} (Você)` : c.name,
      rawName: c.name,
      color: CHAR_COLOR_MAP[c.id]?.shirt || 0x83BCE0,
      hair: CHAR_COLOR_MAP[c.id]?.hair || 0x303D63
    }));
  }, [playerChar]);

  const [round, setRound] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentHolderIdx, setCurrentHolderIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);
  const [playerHoldPct, setPlayerHoldPct] = useState(100);
  const [roundEndReason, setRoundEndReason] = useState<string>('');
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [passCount, setPassCount] = useState(0);
  const [startTime] = useState<number>(Date.now());

  const kidsMeshesRef = useRef<THREE.Group[]>([]);
  const potatoMeshRef = useRef<THREE.Group | null>(null);
  const potatoTargetPosRef = useRef(new THREE.Vector3(2.05, 1.35, 0));
  const holderIdxRef = useRef(0);
  holderIdxRef.current = currentHolderIdx;

  const updatePotatoPosition = useCallback((holderIdx: number) => {
    const angle = (holderIdx / 5) * Math.PI * 2;
    potatoTargetPosRef.current.set(Math.cos(angle) * 2.05, 1.38, Math.sin(angle) * 2.05);
  }, []);

  const initScene = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    const grass = new THREE.Mesh(
      new THREE.CircleGeometry(15, 40),
      new THREE.MeshStandardMaterial({ color: 0xBCE3A5, roughness: 0.85 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    scene.add(grass);

    const rug = new THREE.Mesh(
      new THREE.CircleGeometry(3.4, 32),
      new THREE.MeshStandardMaterial({ color: 0xF4E9A9, roughness: 0.7 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.y = 0.02;
    scene.add(rug);

    const rugInner = new THREE.Mesh(
      new THREE.RingGeometry(1.8, 3.0, 32),
      new THREE.MeshStandardMaterial({ color: 0xC8E0F3, side: THREE.DoubleSide, roughness: 0.7 })
    );
    rugInner.rotation.x = -Math.PI / 2;
    rugInner.position.y = 0.03;
    scene.add(rugInner);

    const t1 = createTree3D();
    t1.position.set(-5.5, 0, -4.5);
    const t2 = createTree3D();
    t2.position.set(5.6, 0, -4.2);
    scene.add(t1, t2);

    kidsMeshesRef.current = [];
    const radius = 2.65;
    circleKids.forEach((kidCfg, idx) => {
      const angle = (idx / 5) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const cushion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.5, 0.12, 18),
        new THREE.MeshStandardMaterial({ color: idx === 0 ? 0xD7E995 : 0xFFFFFF, roughness: 0.55 })
      );
      cushion.position.set(x, 0.06, z);
      scene.add(cushion);

      const kid = createKidCharacter3D(kidCfg.rawName, kidCfg.color, kidCfg.hair);
      kid.position.set(x, 0, z);
      kid.lookAt(0, 0, 0);
      setCharacterSeated(kid, true);
      scene.add(kid);
      kidsMeshesRef.current.push(kid);
    });

    const potato = createPotato3D();
    potato.position.set(2.05, 1.38, 0);
    scene.add(potato);
    potatoMeshRef.current = potato;
    potatoTargetPosRef.current.set(2.05, 1.38, 0);

    camera.position.set(0, 5.2, 7.8);
    camera.lookAt(0, 0.6, 0);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (scene.userData.updateBackdrop) scene.userData.updateBackdrop(t);

      if (potatoMeshRef.current) {
        potatoMeshRef.current.position.lerp(potatoTargetPosRef.current, 0.2);
        potatoMeshRef.current.position.y += Math.sin(t * 7) * 0.025;
        potatoMeshRef.current.rotation.y += 0.08;
        potatoMeshRef.current.rotation.z = Math.sin(t * 5) * 0.22;
      }

      kidsMeshesRef.current.forEach((kid, idx) => {
        const isHolder = holderIdxRef.current === idx;
        const armL = kid.getObjectByName('armL');
        const armR = kid.getObjectByName('armR');
        if (armL && armR) {
          if (isHolder) {
            armL.rotation.z = 1.2 + Math.sin(t * 14) * 0.2;
            armR.rotation.z = -1.2 - Math.sin(t * 14) * 0.2;
          } else {
            armL.rotation.z = 0.24 + Math.sin(t * 5 + idx) * 0.08;
            armR.rotation.z = -0.24 - Math.sin(t * 5 + idx) * 0.08;
          }
        }
        kid.position.y = isHolder ? Math.abs(Math.sin(t * 9)) * 0.18 : 0;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [circleKids]);

  // Round Music Countdown
  useEffect(() => {
    if (!isPlaying || isRoundOver) return;

    const timer = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsPlaying(false);
          setIsRoundOver(true);
          const unluckyName = circleKids[holderIdxRef.current]?.name || 'o amigo';
          setRoundEndReason(`A música parou com ${unluckyName} segurando a Batata Quente!`);
          audioService.playFanfare();
          try {
            confetti({ particleCount: 50, spread: 70 });
          } catch {
            // ignore
          }
          return 0;
        }
        if (prev <= 4) {
          audioService.playBellTone(720 + (4 - prev) * 90, 0.1);
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying, isRoundOver, circleKids]);

  // Autonomous circle passing for AI friends + 2.6s player retention timeout!
  useEffect(() => {
    if (!isPlaying || isRoundOver) return;

    if (currentHolderIdx !== 0) {
      setPlayerHoldPct(100);
      const aiDelay = Math.max(420, 780 - round * 55);
      const passTimer = window.setTimeout(() => {
        const nextIdx = (currentHolderIdx + 1) % circleKids.length;
        setCurrentHolderIdx(nextIdx);
        updatePotatoPosition(nextIdx);
        setPassCount(p => p + 1);
        audioService.playBellTone(520 + nextIdx * 30, 0.08);
      }, aiDelay);
      return () => window.clearTimeout(passTimer);
    }

    // Player (idx 0) holds potato: active countdown up to 2.6s so round never hangs
    setPlayerHoldPct(100);
    const holdStepMs = Math.max(45, 75 - round * 4);
    const burnTimer = window.setInterval(() => {
      setPlayerHoldPct(prev => {
        if (prev <= 3) {
          window.clearInterval(burnTimer);
          setIsPlaying(false);
          setIsRoundOver(true);
          setRoundEndReason('Ai, ai, ai! Você segurou a Batata Quente tempo demais e queimou a mão!');
          audioService.playBellTone(240, 0.35);
          return 0;
        }
        return prev - 3;
      });
    }, holdStepMs);

    return () => window.clearInterval(burnTimer);
  }, [currentHolderIdx, isPlaying, isRoundOver, round, circleKids.length, updatePotatoPosition]);

  const startNextRound = (nextRoundNum: number) => {
    const duration = Math.max(8, 13 - nextRoundNum);
    setRound(nextRoundNum);
    setIsPlaying(true);
    setIsRoundOver(false);
    setRoundEndReason('');
    setPlayerHoldPct(100);
    setTimeLeft(duration);
    setCurrentHolderIdx(0);
    updatePotatoPosition(0);
  };

  const restartFullGame = () => {
    setRound(1);
    setScore(0);
    setPassCount(0);
    setCurrentHolderIdx(0);
    setIsPlaying(true);
    setIsRoundOver(false);
    setRoundEndReason('');
    setPlayerHoldPct(100);
    setTimeLeft(12);
    updatePotatoPosition(0);
  };

  const handlePassPotato = () => {
    if (!isPlaying || isRoundOver || currentHolderIdx !== 0) return;
    const nextIdx = 1;
    setCurrentHolderIdx(nextIdx);
    updatePotatoPosition(nextIdx);
    setPassCount(p => p + 1);
    setScore(s => s + 40 * round);
    setPlayerHoldPct(100);
    audioService.playGentlePop();
  };

  const handleFinish = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    onFinishGame(elapsed, Math.max(100, score));
  };

  const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const holderName = circleKids[currentHolderIdx].name;
  const isPlayerHolding = currentHolderIdx === 0;

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      {/* HUD */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#FFF3CC] dark:bg-[#27234D] border border-[#FFD34E]/60 text-[#8A5A00] dark:text-[#FFD34E] text-xs font-black">
            Rodada {round}
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#E9FBF4] dark:bg-[#133A2E] border border-[#36C995]/50 text-[#115E43] dark:text-[#6EE7B7] text-xs font-black">
            Passes: {passCount}
          </span>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-[#F5F3FC] dark:bg-[#27234D] border border-[#DDD6F3] dark:border-[#38316B] text-[#7047E8] dark:text-[#C4B5FD] text-xs font-black flex items-center gap-1">
          <Sparkles size={14} />
          {score} pts
        </span>
      </div>

      {/* 3D Picnic Circle Scene */}
      <div className="relative rounded-[32px] overflow-hidden border-2 border-[#DDD6F3] dark:border-[#38316B] shadow-soft">
        <ThreeCanvasContainer onInit={initScene} theme="park" className="w-full h-80 sm:h-[410px]" />

        <div className="absolute top-3 left-3 z-20 bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-md px-4 py-2 rounded-full border-2 border-[#FFD34E]/60 dark:border-[#38316B] flex items-center gap-2 text-xs font-black text-[#25233A] dark:text-white shadow-sm">
          <Flame size={16} className={timeLeft <= 4 && isPlaying ? 'text-[#F16E9A] animate-bounce' : 'text-[#FF9B42]'} />
          <span>{timeLeft > 0 ? `Tempo da música: ${timeLeft}s` : 'A música parou!'}</span>
        </div>

        <div className="absolute bottom-3 inset-x-3 mx-auto w-fit max-w-[92%] z-20 bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-sm text-center">
          <span className="text-xs sm:text-sm font-black text-[#25233A] dark:text-[#F8FAFC]">
            {isPlaying
              ? isPlayerHolding
                ? 'CHEGOU EM VOCÊ! Passe a Batata Quente agora!'
                : `A Batata Quente está girando com ${holderName}...`
              : roundEndReason}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="ak-card-3d rounded-[28px] p-5 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-card">
        {isPlaying && !isRoundOver ? (
          <div className="space-y-3">
            {isPlayerHolding && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-black text-rose-600 dark:text-rose-300">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Queimando a mão! Passe rápido!
                  </span>
                  <span>{Math.round(playerHoldPct)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-rose-100 dark:bg-rose-950/60 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-75"
                    style={{ width: `${playerHoldPct}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!isPlayerHolding}
              onClick={handlePassPotato}
              className={`btn-lingo w-full py-5 rounded-2xl border-2 border-b-4 font-black text-lg shadow-tactile-soft flex items-center justify-center gap-3 transition-all ${
                isPlayerHolding
                  ? 'bg-[#FFD34E] border-[#D89B00] text-[#25233A] hover:bg-[#FFCA2C] animate-pulse'
                  : 'bg-[#F5F3FC] dark:bg-[#27234D] border-[#E4DFF5] dark:border-[#38316B] text-[#77758A] dark:text-[#C5BFE6] opacity-75 cursor-wait'
              }`}
            >
              <HotPotatoSvgIcon className="w-8 h-8" />
              <span>
                {isPlayerHolding
                  ? 'PASSAR BATATA QUENTE AGORA!'
                  : `Aguarde (${holderName} está passando...)`}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center animate-popIn">
            <Trophy size={42} className="mx-auto text-[#FFD34E]" />
            <h4 className="ak-title-display font-display text-2xl font-bold text-[#115E43] dark:text-[#6EE7B7]">
              Rodada {round} Concluída!
            </h4>
            <p className="text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
              {roundEndReason} • {passCount} passes ({score} pts)!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="primary" size="sm" onClick={() => startNextRound(round + 1)}>
                <span>Próxima Rodada (+Rápida!)</span>
              </Button>
              <Button variant="outline" size="sm" onClick={restartFullGame}>
                <RotateCcw size={15} />
                <span>Recomeçar</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleFinish}>
                <CheckCircle2 size={15} />
                <span>Concluir Jogo</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      <VictoryCelebrationModal
        isOpen={isRoundOver && round >= 3}
        title="Campeão da Batata Quente!"
        subtitle={`${roundEndReason} • ${passCount} passes rápidos!`}
        starsEarned={25}
        score={Math.max(100, score)}
        durationSeconds={elapsedSeconds}
        characterId={playerChar.id}
        onReplay={restartFullGame}
        onContinue={handleFinish}
      />
    </div>
  );
};
