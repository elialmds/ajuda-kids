import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { ThreeCanvasContainer } from './ThreeCanvasContainer';
import { Button } from '@/components/common/Button';
import { RotateCcw, CheckCircle2, Trophy, Sparkles, Clock } from 'lucide-react';
import { audioService } from '@/services/audioService';
import { VictoryCelebrationModal } from '@/components/common/VictoryCelebrationModal';
import confetti from 'canvas-confetti';
import { createTree3D, createFlowerCluster3D } from './modelFactory';

interface JogoMemoria3DProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit?: () => void;
}

type SymbolKind = 'star' | 'heart' | 'leaf' | 'cloud' | 'flower' | 'sun' | 'rainbow' | 'butterfly';

interface SymbolDef {
  kind: SymbolKind;
  label: string;
  bgHex: string;
}

const SYMBOLS: SymbolDef[] = [
  { kind: 'star', label: 'Estrela', bgHex: '#FFF6D1' },
  { kind: 'heart', label: 'Coração', bgHex: '#FCE3E8' },
  { kind: 'leaf', label: 'Folha', bgHex: '#E4F3D8' },
  { kind: 'cloud', label: 'Nuvem', bgHex: '#DFF0FC' },
  { kind: 'flower', label: 'Flor', bgHex: '#EFE2FA' },
  { kind: 'sun', label: 'Sol', bgHex: '#FFF1C2' },
  { kind: 'rainbow', label: 'Arco-Íris', bgHex: '#E8F7FF' },
  { kind: 'butterfly', label: 'Borboleta', bgHex: '#FDE8F3' }
];

interface MemoryCardData {
  id: number;
  pairId: SymbolKind;
  label: string;
  bgHex: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function drawSymbolOnCanvas(ctx: CanvasRenderingContext2D, kind: SymbolKind) {
  ctx.save();
  ctx.translate(128, 128);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#25233A';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (kind === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 64 : 28;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#FACC15';
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'heart') {
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.bezierCurveTo(-72, 8, -72, -52, -32, -52);
    ctx.bezierCurveTo(-12, -52, 0, -34, 0, -24);
    ctx.bezierCurveTo(0, -34, 12, -52, 32, -52);
    ctx.bezierCurveTo(72, -52, 72, 8, 0, 52);
    ctx.fillStyle = '#FB7185';
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'leaf') {
    ctx.beginPath();
    ctx.moveTo(-48, 44);
    ctx.quadraticCurveTo(-52, -46, 50, -50);
    ctx.quadraticCurveTo(46, 48, -48, 44);
    ctx.fillStyle = '#6EE7B7';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-48, 44);
    ctx.quadraticCurveTo(0, 0, 38, -38);
    ctx.stroke();
  } else if (kind === 'cloud') {
    ctx.beginPath();
    ctx.arc(-28, 12, 26, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(-8, -16, 30, Math.PI * 1.0, Math.PI * 1.9);
    ctx.arc(28, -4, 24, Math.PI * 1.4, Math.PI * 0.5);
    ctx.lineTo(-28, 38);
    ctx.closePath();
    ctx.fillStyle = '#83BCE0';
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'flower') {
    ctx.fillStyle = '#C084FC';
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 34, Math.sin(a) * 34, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#FACC15';
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'sun') {
    // sun
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 44, Math.sin(a) * 44);
      ctx.lineTo(Math.cos(a) * 66, Math.sin(a) * 66);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'rainbow') {
    const bands = [
      { r: 58, color: '#FB7185' },
      { r: 44, color: '#FACC15' },
      { r: 30, color: '#4ADE80' },
      { r: 16, color: '#38BDF8' }
    ];
    bands.forEach((b) => {
      ctx.beginPath();
      ctx.arc(0, 26, b.r, Math.PI, 0);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 14;
      ctx.stroke();
    });
    ctx.strokeStyle = '#25233A';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 26, 64, Math.PI, 0);
    ctx.stroke();
  } else {
    // butterfly
    ctx.fillStyle = '#F16E9A';
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.ellipse(side * 30, -16, 28, 34, side * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(side * 24, 24, 20, 24, side * -0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#8B68F7';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F16E9A';
    });
    ctx.beginPath();
    ctx.ellipse(0, 4, 10, 38, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#25233A';
    ctx.fill();
  }

  ctx.restore();
}

function buildShuffledDeck(pairCount: number, startFlipped = false): MemoryCardData[] {
  const chosen = SYMBOLS.slice(0, pairCount);
  const deck = [...chosen, ...chosen]
    .sort(() => Math.random() - 0.5)
    .map((s, idx) => ({
      id: idx,
      pairId: s.kind,
      label: s.label,
      bgHex: s.bgHex,
      isFlipped: startFlipped,
      isMatched: false
    }));
  return deck;
}

export const JogoMemoria3D: React.FC<JogoMemoria3DProps> = ({ onFinishGame }) => {
  const [pairCount, setPairCount] = useState<3 | 6 | 8>(3);
  const [cardsState, setCardsState] = useState<MemoryCardData[]>(() => buildShuffledDeck(3));
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [feedback, setFeedback] = useState<string>('Toque em duas cartas sobre a mesa para formar pares!');
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);
  const [deckRevision, setDeckRevision] = useState(0);
  const peekTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isGameOver) return;
    const interval = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => window.clearInterval(interval);
  }, [startTime, isGameOver]);

  useEffect(() => {
    return () => {
      if (peekTimerRef.current !== null) window.clearTimeout(peekTimerRef.current);
    };
  }, []);

  // Refs synced so WebGL Pointer Raycaster NEVER reads stale closure state!
  const cardsRef = useRef<MemoryCardData[]>(cardsState);
  cardsRef.current = cardsState;

  const flippedIdsRef = useRef<number[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const cardMeshesRef = useRef<THREE.Mesh[]>([]);
  const flipAnimationsRef = useRef<{ [id: number]: number }>({});

  useEffect(() => {
    cardsState.forEach(c => {
      flipAnimationsRef.current[c.id] = c.isFlipped || c.isMatched ? Math.PI : 0;
    });
  }, [cardsState]);

  const handleCardSelect = useCallback((id: number) => {
    if (isProcessingRef.current) return;
    const currentCards = cardsRef.current;
    const clicked = currentCards.find(c => c.id === id);
    if (!clicked || clicked.isFlipped || clicked.isMatched) return;

    audioService.playGentlePop();

    const updatedCards = currentCards.map(c => (c.id === id ? { ...c, isFlipped: true } : c));
    cardsRef.current = updatedCards;
    setCardsState(updatedCards);

    const nextFlipped = [...flippedIdsRef.current, id];
    flippedIdsRef.current = nextFlipped;

    if (nextFlipped.length === 2) {
      setMoves(m => m + 1);
      isProcessingRef.current = true;
      const [idA, idB] = nextFlipped;
      const cardA = updatedCards.find(c => c.id === idA);
      const cardB = updatedCards.find(c => c.id === idB);

      if (cardA && cardB && cardA.pairId === cardB.pairId) {
        setTimeout(() => {
          audioService.playSuccess();
          setFeedback(`Par encontrado: ${cardA.label}! Muito bem!`);

          const nextDeck = cardsRef.current.map(c =>
            c.id === idA || c.id === idB ? { ...c, isMatched: true } : c
          );
          cardsRef.current = nextDeck;
          setCardsState(nextDeck);

          const matchedPairsNow = nextDeck.filter(c => c.isMatched).length / 2;
          setMatchedCount(matchedPairsNow);
          flippedIdsRef.current = [];
          isProcessingRef.current = false;

          if (matchedPairsNow === nextDeck.length / 2) {
            setIsGameOver(true);
            audioService.playFanfare();
            try {
              confetti({ particleCount: 70, spread: 85 });
            } catch {
              // ignore
            }
          }
        }, 420);
      } else {
        setFeedback('Quase! Observe onde cada figura está guardada.');
        setTimeout(() => {
          const resetDeck = cardsRef.current.map(c =>
            c.id === idA || c.id === idB ? { ...c, isFlipped: false } : c
          );
          cardsRef.current = resetDeck;
          setCardsState(resetDeck);
          flippedIdsRef.current = [];
          isProcessingRef.current = false;
        }, 900);
      }
    } else {
      setFeedback(`Você virou ${clicked.label}. Agora encontre o par!`);
    }
  }, []);

  const resetDeck = (pairs: 3 | 6 | 8) => {
    if (peekTimerRef.current !== null) {
      window.clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }
    audioService.playGentlePop();
    const useInitialPeek = pairs === 8;
    const fresh = buildShuffledDeck(pairs, useInitialPeek);
    cardsRef.current = fresh;
    flippedIdsRef.current = [];
    isProcessingRef.current = useInitialPeek;
    setPairCount(pairs);
    setCardsState(fresh);
    setMoves(0);
    setMatchedCount(0);
    setElapsedSec(0);
    setIsGameOver(false);
    setStartTime(Date.now());
    setDeckRevision(r => r + 1);

    if (useInitialPeek) {
      setFeedback('Memorize as posições! As cartas vão virar em 2 segundos...');
      peekTimerRef.current = window.setTimeout(() => {
        const hidden = cardsRef.current.map(c => ({ ...c, isFlipped: false }));
        cardsRef.current = hidden;
        setCardsState(hidden);
        isProcessingRef.current = false;
        setStartTime(Date.now());
        setFeedback('Valendo! Encontre todos os 8 pares!');
      }, 2100);
    } else {
      setFeedback('Toque em duas cartas sobre a mesa para formar pares!');
    }
  };

  const initScene = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    const deck = cardsRef.current;

    // 1. Lush Garden Meadow + Warm Wooden Play Table
    const meadow = new THREE.Mesh(
      new THREE.CircleGeometry(15, 36),
      new THREE.MeshToonMaterial({ color: 0xC6E5B1 })
    );
    meadow.rotation.x = -Math.PI / 2;
    meadow.position.y = -0.5;
    meadow.receiveShadow = true;
    scene.add(meadow);

    const isBigGrid = deck.length >= 16;
    const tableW = isBigGrid ? 8.8 : 8.2;
    const tableD = isBigGrid ? 6.2 : 5.4;

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(tableW, 0.45, tableD),
      new THREE.MeshToonMaterial({ color: 0xE7C697 })
    );
    table.position.y = -0.25;
    table.receiveShadow = true;
    scene.add(table);

    const tableTrim = new THREE.Mesh(
      new THREE.BoxGeometry(tableW + 0.3, 0.14, tableD + 0.3),
      new THREE.MeshToonMaterial({ color: 0xC4945B })
    );
    tableTrim.position.y = -0.45;
    scene.add(tableTrim);

    // Decorative Trees & Flowers around the garden table
    const treeL = createTree3D();
    treeL.position.set(-6.4, -0.5, -4.6);
    scene.add(treeL);

    const treeR = createTree3D();
    treeR.position.set(6.4, -0.5, -4.6);
    scene.add(treeR);

    const fl1 = createFlowerCluster3D(0xE5D2F4);
    fl1.position.set(-5.2, -0.5, 2.5);
    const fl2 = createFlowerCluster3D(0xF3D9DE);
    fl2.position.set(5.3, -0.5, 2.2);
    scene.add(fl1, fl2);

    // 2. Setup 3D Card Meshes matching current deck (3x2 = 6, 4x3 = 12, 4x4 = 16)
    cardMeshesRef.current = [];
    const cols = deck.length === 6 ? 3 : 4;
    const rows = deck.length === 6 ? 2 : deck.length === 12 ? 3 : 4;
    const xSpacing = cols === 3 ? 2.15 : 1.78;
    const zSpacing = rows === 2 ? 2.25 : rows === 3 ? 1.62 : 1.38;

    const backCanvas = document.createElement('canvas');
    backCanvas.width = 256;
    backCanvas.height = 256;
    const bCtx = backCanvas.getContext('2d');
    if (bCtx) {
      bCtx.fillStyle = '#1E1B3A';
      bCtx.fillRect(0, 0, 256, 256);
      bCtx.strokeStyle = '#7047E8';
      bCtx.lineWidth = 14;
      bCtx.strokeRect(16, 16, 224, 224);
      bCtx.fillStyle = '#FFD34E';
      bCtx.beginPath();
      bCtx.arc(128, 128, 42, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.fillStyle = '#25233A';
      bCtx.font = 'bold 54px Fredoka, Nunito, sans-serif';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText('?', 128, 132);
    }
    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;
    const backMat = new THREE.MeshStandardMaterial({ map: backTexture });
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xF5F6F3 });

    deck.forEach((card, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = (col - (cols - 1) / 2) * xSpacing;
      const z = (row - (rows - 1) / 2) * zSpacing;

      const symCanvas = document.createElement('canvas');
      symCanvas.width = 256;
      symCanvas.height = 256;
      const sCtx = symCanvas.getContext('2d');
      if (sCtx) {
        sCtx.fillStyle = card.bgHex;
        sCtx.fillRect(0, 0, 256, 256);
        sCtx.strokeStyle = '#83BCE0';
        sCtx.lineWidth = 12;
        sCtx.strokeRect(12, 12, 232, 232);
        drawSymbolOnCanvas(sCtx, card.pairId);
      }
      const symTex = new THREE.CanvasTexture(symCanvas);
      symTex.colorSpace = THREE.SRGBColorSpace;
      const frontMat = new THREE.MeshStandardMaterial({ map: symTex });

      // Face index 2 = +Y (back up initially), Face index 3 = -Y (front revealed at Math.PI flip around X)
      const mats = [edgeMat, edgeMat, backMat, frontMat, edgeMat, edgeMat];
      const cardGeo = new THREE.BoxGeometry(cols === 3 ? 1.56 : 1.38, 0.14, rows === 2 ? 1.82 : rows === 3 ? 1.36 : 1.18);
      const cardMesh = new THREE.Mesh(cardGeo, mats);
      cardMesh.position.set(x, 0.09, z);
      cardMesh.castShadow = true;
      cardMesh.userData = { cardId: card.id };

      scene.add(cardMesh);
      cardMeshesRef.current.push(cardMesh);
      flipAnimationsRef.current[card.id] = 0;
    });

    camera.position.set(0, 6.9, 5.2);
    camera.lookAt(0, -0.1, 0);

    // 3. Direct Canvas Raycaster Picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardMeshesRef.current);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (typeof hit.userData?.cardId === 'number') {
          handleCardSelect(hit.userData.cardId);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 4. Smooth Card Flip & Celebration Float Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (scene.userData.updateBackdrop) {
        scene.userData.updateBackdrop(t);
      }

      cardMeshesRef.current.forEach((mesh, idx) => {
        const id = mesh.userData.cardId as number;
        const targetRot = flipAnimationsRef.current[id] || 0;
        mesh.rotation.x += (targetRot - mesh.rotation.x) * 0.18;

        const isFlipped = targetRot > 1.5;
        const cObj = cardsRef.current.find(c => c.id === id);
        if (cObj?.isMatched) {
          mesh.position.y = 0.22 + Math.sin(t * 3 + idx) * 0.04;
          mesh.scale.setScalar(1.04);
        } else {
          mesh.position.y += ((isFlipped ? 0.28 : 0.09) - mesh.position.y) * 0.15;
          mesh.scale.setScalar(1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [handleCardSelect, deckRevision]);

  const handleFinish = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const finalScore = Math.max(120, pairCount * 100 - Math.max(0, moves - pairCount) * 15);
    onFinishGame(elapsed, finalScore);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      {/* HUD + Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center flex-wrap gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#F5F3FC] dark:bg-[#27234D] border border-[#DDD6F3] dark:border-[#38316B] text-[#7047E8] dark:text-[#C4B5FD] text-xs font-black">
            Pares: {matchedCount}/{pairCount}
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#EEF5FF] dark:bg-[#27234D] border border-[#4389F5]/40 text-[#1E54B7] dark:text-[#93C5FD] text-xs font-black">
            Tentativas: {moves}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[#FFF3CC] dark:bg-[#27234D] border border-[#FFD34E]/60 text-[#8A5A00] dark:text-[#FFD34E] text-xs font-black flex items-center gap-1">
            <Clock size={12} />
            {elapsedSec}s
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-[#1E1B3A] p-1 rounded-full border-2 border-[#E4DFF5] dark:border-[#38316B]">
          <button
            type="button"
            onClick={() => resetDeck(3)}
            className={`px-3 py-1 rounded-full text-xs font-black transition-colors ${
              pairCount === 3 ? 'bg-[#36C995] text-white' : 'text-[#77758A] dark:text-[#C5BFE6]'
            }`}
          >
            Fácil (6)
          </button>
          <button
            type="button"
            onClick={() => resetDeck(6)}
            className={`px-3 py-1 rounded-full text-xs font-black transition-colors ${
              pairCount === 6 ? 'bg-[#4389F5] text-white' : 'text-[#77758A] dark:text-[#C5BFE6]'
            }`}
          >
            Médio (12)
          </button>
          <button
            type="button"
            onClick={() => resetDeck(8)}
            className={`px-3 py-1 rounded-full text-xs font-black transition-colors ${
              pairCount === 8 ? 'bg-[#7047E8] text-white' : 'text-[#77758A] dark:text-[#C5BFE6]'
            }`}
          >
            Difícil (16)
          </button>
        </div>
      </div>

      {/* 3D Interactive Table Viewport */}
      <div className="relative rounded-[32px] overflow-hidden border-2 border-[#DDD6F3] dark:border-[#38316B] shadow-soft cursor-pointer">
        <ThreeCanvasContainer
          key={deckRevision}
          onInit={initScene}
          theme="garden"
          className="w-full h-80 sm:h-[420px]"
        />

        <div className="absolute bottom-3 inset-x-3 mx-auto w-fit max-w-[92%] z-20 bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#DDD6F3] dark:border-[#38316B] shadow-sm text-center">
          <span className="text-xs sm:text-sm font-black text-[#25233A] dark:text-white flex items-center justify-center gap-1.5">
            <Sparkles size={15} className="text-[#7047E8] dark:text-[#C4B5FD] shrink-0" />
            <span>{feedback}</span>
          </span>
        </div>
      </div>

      {/* Accessible Touch Fallback Cards (helps small phone screens too!) */}
      {!isGameOver ? (
        <div className="ak-card-3d rounded-[28px] p-4 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-card space-y-2.5">
          <p className="text-center text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
            Você pode tocar direto nas cartas 3D acima ou escolher pelo número abaixo:
          </p>
          <div className={`grid gap-2 ${pairCount === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
            {cardsState.map((card, i) => (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardSelect(card.id)}
                disabled={card.isFlipped || card.isMatched}
                style={{
                  backgroundColor: card.isFlipped || card.isMatched ? card.bgHex : undefined
                }}
                className={`py-2.5 px-2 rounded-2xl text-xs font-black border-2 transition-all ${
                  card.isMatched
                    ? 'border-[#36C995] text-[#115E43]'
                    : card.isFlipped
                    ? 'border-[#7047E8] text-[#25233A]'
                    : 'bg-[#F5F3FC] dark:bg-[#27234D] border-[#E4DFF5] dark:border-[#38316B] hover:border-[#7047E8] text-[#25233A] dark:text-white'
                }`}
              >
                {card.isFlipped || card.isMatched ? card.label : `Carta ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="ak-card-3d rounded-[28px] p-6 bg-white dark:bg-[#1E1B3A] border-2 border-[#36C995] shadow-card text-center space-y-3 animate-popIn">
          <Trophy size={42} className="mx-auto text-[#FFD34E]" />
          <h3 className="ak-title-display font-display text-2xl font-bold text-[#115E43] dark:text-[#6EE7B7]">
            Você encontrou todos os pares!
          </h3>
          <p className="text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
            Memória afiada! Todos os {pairCount} pares concluídos em {moves} jogadas ({elapsedSec}s).
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-1">
            <Button variant="outline" size="sm" onClick={() => resetDeck(pairCount)}>
              <RotateCcw size={15} />
              <span>Jogar de Novo</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handleFinish}>
              <CheckCircle2 size={15} />
              <span>Resgatar Estrelas</span>
            </Button>
          </div>
        </div>
      )}

      <VictoryCelebrationModal
        isOpen={isGameOver}
        title="Memória Brilhante!"
        subtitle={`Todos os ${pairCount} pares encontrados em ${moves} tentativas e ${elapsedSec}s!`}
        starsEarned={25}
        score={Math.max(120, pairCount * 100 - Math.max(0, moves - pairCount) * 15)}
        durationSeconds={Math.max(1, elapsedSec)}
        onReplay={() => resetDeck(pairCount)}
        onContinue={handleFinish}
      />
    </div>
  );
};
