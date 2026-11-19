import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { ThreeCanvasContainer } from './ThreeCanvasContainer';
import { Button } from '@/components/common/Button';
import { RotateCcw, CheckCircle2, Trophy, Sparkles, Music } from 'lucide-react';
import { audioService } from '@/services/audioService';
import { VictoryCelebrationModal } from '@/components/common/VictoryCelebrationModal';
import confetti from 'canvas-confetti';
import { createTree3D, createFlowerCluster3D } from './modelFactory';

interface SequenciaCores3DProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit?: () => void;
}

type ColorKey = 'azul' | 'verde' | 'amarelo' | 'lilas';

interface DomeConfig {
  key: ColorKey;
  label: string;
  colorHex: number;
  uiBg: string;
  freq: number;
  x: number;
  z: number;
}

const DOMES: DomeConfig[] = [
  { key: 'azul', label: 'Azul', colorHex: 0x6BB6E3, uiBg: '#83BCE0', freq: 523.25, x: -1.75, z: 0 },
  { key: 'verde', label: 'Verde', colorHex: 0xBBE36B, uiBg: '#D7E995', freq: 659.25, x: 0, z: -1.75 },
  { key: 'amarelo', label: 'Amarelo', colorHex: 0xF7DF6E, uiBg: '#F4E9A9', freq: 783.99, x: 1.75, z: 0 },
  { key: 'lilas', label: 'Lilás', colorHex: 0xCCA7EE, uiBg: '#E5D2F4', freq: 1046.50, x: 0, z: 1.75 }
];

export const SequenciaCores3D: React.FC<SequenciaCores3DProps> = ({ onFinishGame }) => {
  const [sequence, setSequence] = useState<ColorKey[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [isShowingSequence, setIsShowingSequence] = useState(true);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [statusText, setStatusText] = useState('Prepare os olhinhos! A primeira melodia está chegando...');
  const [startTime, setStartTime] = useState<number>(Date.now());

  const domeMeshesRef = useRef<Record<ColorKey, THREE.Mesh>>({} as Record<ColorKey, THREE.Mesh>);
  const domeLightsRef = useRef<Record<ColorKey, THREE.PointLight>>({} as Record<ColorKey, THREE.PointLight>);
  const sequenceTimerRef = useRef<number | null>(null);

  const flashDome = useCallback((key: ColorKey, duration = 460) => {
    const mesh = domeMeshesRef.current[key];
    const light = domeLightsRef.current[key];
    const cfg = DOMES.find(d => d.key === key);

    if (cfg) {
      audioService.playBellTone(cfg.freq, duration / 1000);
    }

    if (mesh && light && cfg) {
      mesh.scale.set(1.26, 1.38, 1.26);
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(cfg.colorHex);
      mat.emissiveIntensity = 0.85;
      light.intensity = 2.4;

      setTimeout(() => {
        mesh.scale.set(1.0, 1.0, 1.0);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        light.intensity = 0;
      }, duration);
    }
  }, []);

  const playSequence = useCallback((seq: ColorKey[]) => {
    if (sequenceTimerRef.current) clearInterval(sequenceTimerRef.current);
    setIsShowingSequence(true);
    setStatusText(`Observe as ${seq.length} notas luminosas no pódio...`);
    let step = 0;

    sequenceTimerRef.current = window.setInterval(() => {
      if (step < seq.length) {
        flashDome(seq[step], 480);
        step++;
      } else {
        if (sequenceTimerRef.current) clearInterval(sequenceTimerRef.current);
        setIsShowingSequence(false);
        setPlayerIndex(0);
        setStatusText('Sua vez! Toque nos domos 3D ou nos botões coloridos.');
      }
    }, 760);
  }, [flashDome]);

  const startNewGame = useCallback(() => {
    if (sequenceTimerRef.current) clearInterval(sequenceTimerRef.current);
    setIsGameOver(false);
    setScore(0);
    setPlayerIndex(0);
    setStartTime(Date.now());
    const keys: ColorKey[] = ['azul', 'verde', 'amarelo', 'lilas'];
    const first = keys[Math.floor(Math.random() * keys.length)];
    const initial = [first];
    setSequence(initial);

    setTimeout(() => {
      playSequence(initial);
    }, 600);
  }, [playSequence]);

  useEffect(() => {
    startNewGame();
    return () => {
      if (sequenceTimerRef.current) clearInterval(sequenceTimerRef.current);
    };
  }, [startNewGame]);

  const handleDomeClick = (key: ColorKey) => {
    if (isShowingSequence || isGameOver || sequence.length === 0) return;

    flashDome(key, 340);

    if (key === sequence[playerIndex]) {
      const nextIdx = playerIndex + 1;
      setPlayerIndex(nextIdx);

      if (nextIdx === sequence.length) {
        const nextScore = score + sequence.length * 60;
        setScore(nextScore);
        audioService.playSuccess();
        setStatusText('Perfeito! Preparando próxima melodia...');

        const keys: ColorKey[] = ['azul', 'verde', 'amarelo', 'lilas'];
        const nextColor = keys[Math.floor(Math.random() * keys.length)];
        const nextSeq = [...sequence, nextColor];
        setSequence(nextSeq);
        setIsShowingSequence(true);

        setTimeout(() => {
          playSequence(nextSeq);
        }, 1050);
      }
    } else {
      audioService.playBellTone(220, 0.4);
      setIsGameOver(true);
      setStatusText('Que partida linda! Sua memória musical cresceu bastante.');
      if (sequence.length > 2) {
        try {
          confetti({ particleCount: 50, spread: 75 });
        } catch {
          // ignore
        }
      }
    }
  };

  // Always-fresh ref so Three.js pointer listener never captures stale closure state!
  const clickHandlerRef = useRef<(key: ColorKey) => void>(() => {});
  clickHandlerRef.current = handleDomeClick;

  const initScene = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    // 1. Lush Garden Meadow
    const meadow = new THREE.Mesh(
      new THREE.CircleGeometry(14, 36),
      new THREE.MeshToonMaterial({ color: 0xBCE3A5 })
    );
    meadow.rotation.x = -Math.PI / 2;
    meadow.position.y = -0.45;
    meadow.receiveShadow = true;
    scene.add(meadow);

    const treeL = createTree3D();
    treeL.position.set(-5.8, -0.45, -4.5);
    const treeR = createTree3D();
    treeR.position.set(5.8, -0.45, -4.2);
    scene.add(treeL, treeR);

    const fl1 = createFlowerCluster3D(0xF4E9A9);
    fl1.position.set(-4.3, -0.45, 2.3);
    const fl2 = createFlowerCluster3D(0xE5D2F4);
    fl2.position.set(4.5, -0.45, 2.0);
    scene.add(fl1, fl2);

    // 2. Musical Stage Podium
    const podio = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 3.9, 0.5, 36),
      new THREE.MeshToonMaterial({ color: 0xFFFFFF })
    );
    podio.position.y = -0.22;
    podio.receiveShadow = true;
    scene.add(podio);

    const podiumTrim = new THREE.Mesh(
      new THREE.TorusGeometry(3.62, 0.08, 10, 48),
      new THREE.MeshToonMaterial({ color: 0x83BCE0 })
    );
    podiumTrim.rotation.x = Math.PI / 2;
    podiumTrim.position.y = 0.02;
    scene.add(podiumTrim);

    const centerOrb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.85, 0.4, 24),
      new THREE.MeshToonMaterial({ color: 0x303D63 })
    );
    centerOrb.position.y = 0.08;
    scene.add(centerOrb);

    const centerGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.4, 0),
      new THREE.MeshToonMaterial({ color: 0xFACC15 })
    );
    centerGem.position.y = 0.65;
    scene.add(centerGem);

    // 3. 4 Musical Crystal Domes with glowing rings
    DOMES.forEach(d => {
      const baseRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.08, 10, 28),
        new THREE.MeshToonMaterial({ color: 0x303D63 })
      );
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.set(d.x, 0.03, d.z);
      scene.add(baseRing);

      const domeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.76, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.54),
        new THREE.MeshStandardMaterial({
          color: d.colorHex,
          roughness: 0.25,
          metalness: 0.08
        })
      );
      domeMesh.position.set(d.x, 0.02, d.z);
      domeMesh.castShadow = true;
      domeMesh.userData = { domeKey: d.key };
      scene.add(domeMesh);

      const ptLight = new THREE.PointLight(d.colorHex, 0, 5);
      ptLight.position.set(d.x, 1.3, d.z);
      scene.add(ptLight);

      domeMeshesRef.current[d.key] = domeMesh;
      domeLightsRef.current[d.key] = ptLight;
    });

    camera.position.set(0, 5.8, 5.6);
    camera.lookAt(0, 0.1, 0);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(domeMeshesRef.current));
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.domeKey) {
          clickHandlerRef.current(hit.userData.domeKey as ColorKey);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    let animId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (scene.userData.updateBackdrop) scene.userData.updateBackdrop(t);

      centerGem.rotation.y = t * 1.4;
      centerGem.position.y = 0.65 + Math.sin(t * 2.4) * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const handleFinish = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    onFinishGame(elapsed, Math.max(80, score));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      {/* HUD */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#E9FBF4] dark:bg-[#133A2E] border border-[#36C995]/50 text-[#115E43] dark:text-[#6EE7B7] text-xs font-black flex items-center gap-1.5">
            <Music size={14} />
            Nível {Math.max(1, sequence.length)}
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#EEF5FF] dark:bg-[#27234D] border border-[#4389F5]/40 text-[#1E54B7] dark:text-[#93C5FD] text-xs font-black">
            Progresso: {playerIndex}/{Math.max(1, sequence.length)}
          </span>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-[#FFF3CC] dark:bg-[#27234D] border border-[#FFD34E]/60 text-[#8A5A00] dark:text-[#FFD34E] text-xs font-black flex items-center gap-1">
          <Sparkles size={14} />
          {score} pts
        </span>
      </div>

      {/* 3D Scene */}
      <div className="relative rounded-[32px] overflow-hidden border-2 border-[#DDD6F3] dark:border-[#38316B] shadow-soft cursor-pointer">
        <ThreeCanvasContainer onInit={initScene} theme="garden" className="w-full h-80 sm:h-[410px]" />

        <div className="absolute bottom-3 inset-x-3 mx-auto w-fit max-w-[92%] z-20 bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#DDD6F3] dark:border-[#38316B] shadow-sm text-center">
          <span className="text-xs sm:text-sm font-black text-[#25233A] dark:text-white">{statusText}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="ak-card-3d rounded-[28px] p-5 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-card">
        {!isGameOver ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DOMES.map(d => (
              <button
                key={d.key}
                type="button"
                onClick={() => handleDomeClick(d.key)}
                disabled={isShowingSequence}
                style={{ backgroundColor: d.uiBg }}
                className="btn-lingo py-4 rounded-2xl border-2 border-b-4 border-[#25233A]/15 dark:border-white/25 text-[#25233A] font-black text-base shadow-tactile-soft disabled:opacity-55"
              >
                {d.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 text-center animate-popIn">
            <Trophy size={42} className="mx-auto text-[#FFD34E]" />
            <h4 className="ak-title-display font-display text-2xl font-bold text-[#115E43] dark:text-[#6EE7B7]">
              Excelente Memória Musical!
            </h4>
            <p className="text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
              Você chegou ao nível {sequence.length} com {score} pontos!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
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
      </div>

      <VictoryCelebrationModal
        isOpen={isGameOver}
        title="Melodia Brilhante!"
        subtitle={`Você chegou ao nível ${Math.max(1, sequence.length)} com ${score} pontos!`}
        starsEarned={25}
        score={Math.max(80, score)}
        durationSeconds={Math.max(1, Math.round((Date.now() - startTime) / 1000))}
        onReplay={startNewGame}
        onContinue={handleFinish}
      />
    </div>
  );
};
