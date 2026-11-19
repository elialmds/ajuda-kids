import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvasContainer } from './ThreeCanvasContainer';
import {
  createKidCharacter3D,
  createTree3D,
  createDuckling3D,
  updateCharacterSitAndRun
} from './modelFactory';
import { useApp } from '@/modules/context/AppContext';
import { getKidCharacter, KID_CHARACTERS } from '@/data/charactersData';
import { RotateCcw, Sparkles, Zap, Footprints } from 'lucide-react';
import { DuckSvgIcon, GooseSvgIcon } from '@/components/illustrations/CustomIcons';
import { VictoryCelebrationModal } from '@/components/common/VictoryCelebrationModal';
import { audioService } from '@/services/audioService';
import {
  advanceMonotonicAngle,
  computeForwardLapTarget,
  findNextSeatedByCircleOrder,
  getSeatAngle
} from './circleGameMath';
import { MultiplayerRoomBanner } from './MultiplayerRoomBanner';
import {
  MultiplayerGameRoom,
  multiplayerRoomService
} from '@/services/multiplayerRoomService';
import confetti from 'canvas-confetti';

interface PatoPatoGanso3DProps {
  onFinishGame: (durationSeconds: number, score?: number) => void;
  onExit?: () => void;
}

type CirclePhase =
  | 'player_walk'
  | 'bot_walk'
  | 'chase'
  | 'settling'
  | 'victory';

interface Participant {
  slotIndex: number;
  charId: string;
  name: string;
  isPlayer: boolean;
  shirt: number;
  hair: number;
  seatAngle: number;
}

const CHAR_COLOR_MAP: Record<string, { shirt: number; hair: number }> = {
  char_bia: { shirt: 0x83BCE0, hair: 0x303D63 },
  char_leo: { shirt: 0x97C087, hair: 0x303D63 },
  char_nina: { shirt: 0xD89BA7, hair: 0x8C4A32 },
  char_davi: { shirt: 0xB697D8, hair: 0x303D63 },
  char_lara: { shirt: 0xDEC159, hair: 0x26263A },
  char_tico: { shirt: 0x62A8D8, hair: 0x6B3E26 }
};

const SEAT_RADIUS = 2.65;
const TRACK_RADIUS = 3.85;

function normalizeAngle(rad: number): number {
  let a = rad % (Math.PI * 2);
  if (a < 0) a += Math.PI * 2;
  return a;
}

function lerpAngle(current: number, target: number, alpha: number): number {
  let diff = normalizeAngle(target - current);
  if (diff > Math.PI) diff -= Math.PI * 2;
  return current + diff * alpha;
}

export const PatoPatoGanso3D: React.FC<PatoPatoGanso3DProps> = ({ onFinishGame }) => {
  const { activeChild, authSession } = useApp();
  const playerChar = getKidCharacter(activeChild?.avatar);
  const [mpRoom, setMpRoom] = useState<MultiplayerGameRoom | null>(null);
  const [mpPlayerId, setMpPlayerId] = useState<string>('');
  const mpRoomRef = useRef<MultiplayerGameRoom | null>(mpRoom);
  mpRoomRef.current = mpRoom;

  // 6 participants total: index 0 is player, indices 1..5 are bots (5 sit in circle, 1 runs)
  const participants: Participant[] = useMemo(() => {
    const pSpec = CHAR_COLOR_MAP[playerChar.id] || { shirt: 0x83BCE0, hair: 0x303D63 };
    const others = KID_CHARACTERS.filter((c) => c.id !== playerChar.id).slice(0, 5);
    const all = [
      {
        slotIndex: 0,
        charId: playerChar.id,
        name: playerChar.name,
        isPlayer: true,
        shirt: pSpec.shirt,
        hair: pSpec.hair,
        seatAngle: 0
      },
      ...others.map((c, idx) => ({
        slotIndex: idx + 1,
        charId: c.id,
        name: c.name,
        isPlayer: false,
        shirt: CHAR_COLOR_MAP[c.id]?.shirt || 0x83BCE0,
        hair: CHAR_COLOR_MAP[c.id]?.hair || 0x303D63,
        seatAngle: ((idx + 1) / 6) * Math.PI * 2
      }))
    ];
    return all;
  }, [playerChar.id, playerChar.name]);

  const [phase, setPhase] = useState<CirclePhase>('player_walk');
  const [round, setRound] = useState(1);
  const roundRef = useRef(round);
  roundRef.current = round;
  const [maxRounds] = useState(3);
  const [score, setScore] = useState(0);
  const [patoCount, setPatoCount] = useState(0);
  const [activeRunnerIdx, setActiveRunnerIdx] = useState(0);
  const [targetedSlotIdx, setTargetedSlotIdx] = useState(1);
  const [boostClicks, setBoostClicks] = useState(0);
  const [hudStatus, setHudStatus] = useState(
    'Sua vez na roda! Toque em "Pato" para passar pelos amigos ou "GANSO!" para apostar corrida.'
  );
  const [callBubble, setCallBubble] = useState<'pato' | 'ganso' | null>(null);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Mutable simulation state accessed directly inside requestAnimationFrame (60fps smooth)
  const simRef = useRef({
    phase: 'player_walk' as CirclePhase,
    runnerIdx: 0,
    gooseIdx: -1,
    patSlotIdx: 1,
    nextRunnerIdx: 0,
    // Occupied seat index per participant (-1 means currently standing/outside circle)
    seatOfParticipant: [-1, 1, 2, 3, 4, 5] as number[],
    // Polar coordinates, heading, sitProgress (0 = stand/run, 1 = seated)
    angles: [0, 1, 2, 3, 4, 5].map((i) => (i / 6) * Math.PI * 2),
    radii: [TRACK_RADIUS, SEAT_RADIUS, SEAT_RADIUS, SEAT_RADIUS, SEAT_RADIUS, SEAT_RADIUS],
    sitProgress: [0, 1, 1, 1, 1, 1],
    targetAngles: [0, 1, 2, 3, 4, 5].map((i) => (i / 6) * Math.PI * 2),
    chaseTargetAngle: Math.PI * 2,
    runnerChaseAngle: 0,
    gooseChaseAngle: 0,
    runnerSpeedBoost: 0,
    gooseSpeedBoost: 0,
    settlingTimer: 0,
    botPatTimer: 0,
    botStepsRemaining: 4,
    emptySeatAngle: 0,
    raceGoalSeatIdx: 0,
    prevAngles: [0, 1, 2, 3, 4, 5].map((i) => (i / 6) * Math.PI * 2),
    prevRadii: [TRACK_RADIUS, SEAT_RADIUS, SEAT_RADIUS, SEAT_RADIUS, SEAT_RADIUS, SEAT_RADIUS],
    walkPhase: [0, 0, 0, 0, 0, 0]
  });

  const meshesRef = useRef<THREE.Group[]>([]);
  const seatRingMeshesRef = useRef<THREE.Mesh[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const botTimerRef = useRef<number | null>(null);
  const lastRafTickRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (botTimerRef.current !== null) {
      window.clearInterval(botTimerRef.current);
      botTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!mpRoom) return;
    clearTimers();
    const me = mpRoom.players.find((p) => p.playerId === mpPlayerId);
    if (me) setScore(me.score);
    setRound(Math.max(1, mpRoom.round));
    if (mpRoom.lastEventMessage) {
      setHudStatus(`Sala ${mpRoom.code}: ${mpRoom.lastEventMessage}`);
    }
    if (mpRoom.phase === 'chasing') {
      setCallBubble('ganso');
    } else if (mpRoom.lastEventMessage?.toLowerCase().includes('pato')) {
      setCallBubble('pato');
    }
    if (mpRoom.phase === 'finished') {
      simRef.current.phase = 'victory';
      setPhase('victory');
      setIsVictoryOpen(true);
    }
  }, [mpRoom, mpPlayerId, clearTimers]);

  const syncSeatRings = useCallback(() => {
    const sim = simRef.current;
    seatRingMeshesRef.current.forEach((ring, seatIdx) => {
      if (!ring) return;
      const mat = ring.material as THREE.MeshStandardMaterial;
      const focusedParticipantIdx = sim.seatOfParticipant.indexOf(seatIdx);
      const isNextPatTarget =
        (sim.phase === 'player_walk' || sim.phase === 'bot_walk') &&
        focusedParticipantIdx === sim.patSlotIdx;
      const isEmptySeat =
        sim.phase === 'chase'
          ? seatIdx === sim.raceGoalSeatIdx
          : focusedParticipantIdx === -1;

      if (isNextPatTarget) {
        mat.color.setHex(0xFACC15);
        mat.emissive.setHex(0xF59E0B);
        mat.emissiveIntensity = 0.65;
        ring.scale.setScalar(1.22);
      } else if (isEmptySeat) {
        mat.color.setHex(0x58CC02);
        mat.emissive.setHex(0x58CC02);
        mat.emissiveIntensity = 0.35;
        ring.scale.setScalar(1.08);
      } else {
        mat.color.setHex(0xF5F6F3);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        ring.scale.setScalar(1.0);
      }
    });
  }, []);

  const findNextSeatedParticipant = useCallback((afterIdx: number): number => {
    const sim = simRef.current;
    return findNextSeatedByCircleOrder(sim.seatOfParticipant, afterIdx, sim.raceGoalSeatIdx);
  }, []);

  const startChaseSequence = useCallback(
    (runnerIdx: number, gooseIdx: number) => {
      clearTimers();
      const sim = simRef.current;
      const fallbackEmpty = [0, 1, 2, 3, 4, 5].find(
        (seatIdx) => !sim.seatOfParticipant.includes(seatIdx)
      );
      const occupiedGooseSeat = sim.seatOfParticipant[gooseIdx];
      const contestedSeatIdx =
        occupiedGooseSeat >= 0
          ? occupiedGooseSeat
          : typeof fallbackEmpty === 'number'
            ? fallbackEmpty
            : 0;
      const targetSeatAngle = getSeatAngle(contestedSeatIdx);

      // Vacate the goose's seat so both athletes stand and race clockwise for it
      sim.seatOfParticipant[gooseIdx] = -1;
      sim.raceGoalSeatIdx = contestedSeatIdx;
      sim.phase = 'chase';
      sim.runnerIdx = runnerIdx;
      sim.gooseIdx = gooseIdx;
      sim.emptySeatAngle = targetSeatAngle;
      sim.runnerChaseAngle = sim.angles[runnerIdx];
      sim.gooseChaseAngle = sim.angles[gooseIdx];
      sim.chaseTargetAngle = computeForwardLapTarget(
        Math.max(sim.runnerChaseAngle, sim.gooseChaseAngle),
        contestedSeatIdx
      );
      sim.runnerSpeedBoost = 0;
      sim.gooseSpeedBoost = 0;
      sim.nextRunnerIdx = runnerIdx;

      setPhase('chase');
      setTargetedSlotIdx(gooseIdx);
      setBoostClicks(0);
      setCallBubble('ganso');
      audioService.playFanfare();
      audioService.speak(`Ganso! Corre ${participants[gooseIdx]?.name}!`);

      const runnerIsPlayer = runnerIdx === 0;
      const gooseIsPlayer = gooseIdx === 0;
      if (runnerIsPlayer) {
        setHudStatus(
          `GANSO em ${participants[gooseIdx].name}! Toque rápido em CORRER para sentar no lugar livre!`
        );
      } else if (gooseIsPlayer) {
        setHudStatus(
          `${participants[runnerIdx].name} gritou GANSO para VOCÊ! Aperte CORRER para pegar o lugar!`
        );
      } else {
        setHudStatus(
          `${participants[runnerIdx].name} escolheu ${participants[gooseIdx].name}! Corrida emocionante!`
        );
      }
      syncSeatRings();
    },
    [clearTimers, participants, syncSeatRings]
  );

  // Triggered when player clicks "Pato" during player_walk
  const handlePatoTap = useCallback(() => {
    const sim = simRef.current;
    if (sim.phase !== 'player_walk' || sim.runnerIdx !== 0) return;

    const currentTarget = sim.patSlotIdx;
    const nextTarget = findNextSeatedParticipant(currentTarget);
    sim.patSlotIdx = nextTarget;
    sim.targetAngles[0] = getSeatAngle(sim.seatOfParticipant[nextTarget] ?? 0) - 0.14;

    if (mpRoom && mpPlayerId) {
      void multiplayerRoomService
        .sendAction({ code: mpRoom.code, playerId: mpPlayerId, type: 'pato' })
        .then((updated) => setMpRoom(updated))
        .catch(() => undefined);
    }

    setTargetedSlotIdx(nextTarget);
    setPatoCount((c) => c + 1);
    setScore((s) => s + 25);
    setCallBubble('pato');
    audioService.playGentlePop();
    audioService.speak('Pato!');
    setHudStatus(
      `Pato em ${participants[currentTarget].name}! Próximo amigo: ${participants[nextTarget].name}.`
    );
    syncSeatRings();
  }, [findNextSeatedParticipant, mpRoom, mpPlayerId, participants, syncSeatRings]);

  // Triggered when player clicks "GANSO!" during player_walk
  const handleGansoTap = useCallback(() => {
    const sim = simRef.current;
    if (sim.phase !== 'player_walk' || sim.runnerIdx !== 0) return;
    if (mpRoom && mpPlayerId) {
      void multiplayerRoomService
        .sendAction({
          code: mpRoom.code,
          playerId: mpPlayerId,
          type: 'ganso',
          targetIndex: sim.patSlotIdx
        })
        .then((updated) => setMpRoom(updated))
        .catch(() => undefined);
    }
    startChaseSequence(0, sim.patSlotIdx);
  }, [mpRoom, mpPlayerId, startChaseSequence]);

  // Boost button during chase (works whether player is runner OR chosen goose!)
  const handleBoostRun = useCallback(() => {
    const sim = simRef.current;
    if (sim.phase !== 'chase') return;
    setBoostClicks((c) => c + 1);
    if (sim.runnerIdx === 0) {
      sim.runnerSpeedBoost = Math.min(1.85, sim.runnerSpeedBoost + 0.52);
    } else if (sim.gooseIdx === 0) {
      sim.gooseSpeedBoost = Math.min(1.9, sim.gooseSpeedBoost + 0.55);
    }
    if (mpRoom && mpPlayerId) {
      void multiplayerRoomService
        .sendAction({ code: mpRoom.code, playerId: mpPlayerId, type: 'dash' })
        .then((updated) => setMpRoom(updated))
        .catch(() => undefined);
    }
    audioService.playGentlePop();
  }, [mpRoom, mpPlayerId]);

  // Active Bot Walk controller when it's a bot's turn around the circle
  const startBotTurn = useCallback(
    (botParticipantIdx: number) => {
      clearTimers();
      const sim = simRef.current;
      sim.phase = 'bot_walk';
      sim.runnerIdx = botParticipantIdx;
      sim.gooseIdx = -1;
      sim.patSlotIdx = findNextSeatedParticipant(botParticipantIdx);
      sim.botStepsRemaining = 2 + Math.floor(Math.random() * 3); // 2..4 pats before picking Ganso

      setPhase('bot_walk');
      setActiveRunnerIdx(botParticipantIdx);
      setTargetedSlotIdx(sim.patSlotIdx);
      setCallBubble('pato');
      setHudStatus(`${participants[botParticipantIdx].name} está rodando a ciranda dizendo "Pato..."`);
      syncSeatRings();

      botTimerRef.current = window.setInterval(() => {
        const s = simRef.current;
        if (s.phase !== 'bot_walk') {
          clearTimers();
          return;
        }
        if (s.botStepsRemaining <= 0) {
          // Prefer choosing player occasionally so child experiences defending their seat!
          const candidateGoose =
            s.seatOfParticipant[0] !== -1 && Math.random() < 0.65 ? 0 : s.patSlotIdx;
          startChaseSequence(botParticipantIdx, candidateGoose);
          return;
        }
        const curTarget = s.patSlotIdx;
        const nextTarget = findNextSeatedParticipant(curTarget);
        s.patSlotIdx = nextTarget;
        s.botStepsRemaining -= 1;
        setTargetedSlotIdx(nextTarget);
        setCallBubble('pato');
        audioService.playGentlePop();
        setHudStatus(
          `${participants[botParticipantIdx].name}: "Pato em ${participants[curTarget].name}..."`
        );
        syncSeatRings();
      }, 1150);
    },
    [clearTimers, findNextSeatedParticipant, participants, startChaseSequence, syncSeatRings]
  );

  // Spacebar / Enter accessibility shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      if (isVictoryOpen) return;
      if (phase === 'player_walk') {
        e.preventDefault();
        handlePatoTap();
      } else if (phase === 'chase' && (activeRunnerIdx === 0 || targetedSlotIdx === 0)) {
        e.preventDefault();
        handleBoostRun();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, activeRunnerIdx, targetedSlotIdx, isVictoryOpen, handlePatoTap, handleBoostRun]);

  // Reset full game cleanly
  const resetFullGame = useCallback(() => {
    clearTimers();
    const sim = simRef.current;
    sim.phase = 'player_walk';
    sim.runnerIdx = 0;
    sim.gooseIdx = -1;
    sim.patSlotIdx = 1;
    sim.seatOfParticipant = [-1, 1, 2, 3, 4, 5];
    sim.angles = [0, 1, 2, 3, 4, 5].map((i) => (i / 6) * Math.PI * 2);
    sim.targetAngles = [...sim.angles];
    sim.radii = [TRACK_RADIUS, SEAT_RADIUS, SEAT_RADIUS, SEAT_RADIUS, SEAT_RADIUS, SEAT_RADIUS];
    sim.sitProgress = [0, 1, 1, 1, 1, 1];
    sim.chaseTargetAngle = Math.PI * 2;
    sim.runnerChaseAngle = 0;
    sim.gooseChaseAngle = 0;
    sim.runnerSpeedBoost = 0;
    sim.gooseSpeedBoost = 0;
    sim.settlingTimer = 0;
    sim.botPatTimer = 0;
    sim.botStepsRemaining = 4;
    sim.emptySeatAngle = 0;
    sim.raceGoalSeatIdx = 0;
    sim.prevAngles = [...sim.angles];
    sim.prevRadii = [...sim.radii];
    sim.walkPhase = [0, 0, 0, 0, 0, 0];

    setPhase('player_walk');
    roundRef.current = 1;
    setRound(1);
    setScore(0);
    setPatoCount(0);
    setBoostClicks(0);
    setActiveRunnerIdx(0);
    setTargetedSlotIdx(1);
    setCallBubble(null);
    setIsVictoryOpen(false);
    setStartTime(Date.now());
    setHudStatus(
      'Sua vez na roda! Toque em "Pato" pelos amigos e clique em "GANSO!" para correr.'
    );
    syncSeatRings();
  }, [clearTimers, syncSeatRings]);

  const participantsRef = useRef(participants);
  participantsRef.current = participants;
  const syncSeatRingsRef = useRef(syncSeatRings);
  syncSeatRingsRef.current = syncSeatRings;
  const findNextSeatedRef = useRef(findNextSeatedParticipant);
  findNextSeatedRef.current = findNextSeatedParticipant;
  const startBotTurnRef = useRef(startBotTurn);
  startBotTurnRef.current = startBotTurn;

  // Software simulation fallback if WebGL RAF isn't ticking (e.g. headless/disabled WebGL fallback mode)
  useEffect(() => {
    if (phase !== 'chase' && phase !== 'settling') return;
    const interval = window.setInterval(() => {
      if (performance.now() - lastRafTickRef.current < 160) return;
      const sim = simRef.current;
      const dt = 0.05;

      if (sim.phase === 'chase') {
        const rIdx = sim.runnerIdx;
        const gIdx = sim.gooseIdx;
        sim.runnerSpeedBoost = Math.max(0, sim.runnerSpeedBoost - dt * 1.45);
        sim.gooseSpeedBoost = Math.max(0, sim.gooseSpeedBoost - dt * 1.45);
        const baseRunnerSpeed = 1.65 + (rIdx === 0 ? sim.runnerSpeedBoost : 0.14);
        const baseGooseSpeed = 1.52 + (gIdx === 0 ? sim.gooseSpeedBoost : 0.18 + roundRef.current * 0.06);
        sim.runnerChaseAngle += baseRunnerSpeed * dt;
        sim.gooseChaseAngle += baseGooseSpeed * dt;
        sim.angles[rIdx] = sim.runnerChaseAngle;
        sim.angles[gIdx] = sim.gooseChaseAngle;

        if (sim.runnerChaseAngle >= sim.chaseTargetAngle || sim.gooseChaseAngle >= sim.chaseTargetAngle) {
          const runnerWonSeat = sim.runnerChaseAngle >= sim.gooseChaseAngle;
          const seatWinnerIdx = runnerWonSeat ? rIdx : gIdx;
          const newRunnerIdx = runnerWonSeat ? gIdx : rIdx;
          const assignedSeat = sim.raceGoalSeatIdx >= 0 ? sim.raceGoalSeatIdx : 0;
          sim.seatOfParticipant[newRunnerIdx] = -1;
          sim.seatOfParticipant[seatWinnerIdx] = assignedSeat;
          sim.phase = 'settling';
          sim.settlingTimer = 1.2;
          sim.runnerIdx = newRunnerIdx;
          setPhase('settling');
          setCallBubble(null);
          audioService.playSuccess();
          if (seatWinnerIdx === 0 || rIdx === 0) {
            setScore((prev) => prev + (seatWinnerIdx === 0 ? 150 : 85));
          }
          setHudStatus(
            `${participantsRef.current[seatWinnerIdx].name} garantiu o lugar! ${participantsRef.current[newRunnerIdx].name} vai rodar agora...`
          );
          syncSeatRingsRef.current();
        }
      } else if (sim.phase === 'settling') {
        sim.settlingTimer -= dt;
        if (sim.settlingTimer <= 0) {
          if (mpRoomRef.current) {
            sim.phase = 'player_walk';
            sim.runnerIdx = 0;
            setPhase('player_walk');
            setActiveRunnerIdx(0);
          } else {
            const nextR = roundRef.current + 1;
            if (nextR > maxRounds) {
              sim.phase = 'victory';
              setPhase('victory');
              setIsVictoryOpen(true);
              setHudStatus('Fim de ciranda! Todos comemorando no parque!');
            } else {
              roundRef.current = nextR;
              setRound(nextR);
              if (sim.runnerIdx === 0) {
                sim.phase = 'player_walk';
                sim.patSlotIdx = findNextSeatedRef.current(0);
                setPhase('player_walk');
                setActiveRunnerIdx(0);
                setTargetedSlotIdx(sim.patSlotIdx);
                setHudStatus(
                  `Rodada ${nextR}/${maxRounds}: sua vez de rodar! Toque "Pato" ou grite "GANSO!"`
                );
                syncSeatRingsRef.current();
              } else {
                startBotTurnRef.current(sim.runnerIdx);
              }
            }
          }
        }
      }
    }, 50);
    return () => window.clearInterval(interval);
  }, [phase, maxRounds]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const initScene = useCallback(
    (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
      cameraRef.current = camera;

      // Soft Meadow Lawn & Ciranda Track
      const grass = new THREE.Mesh(
        new THREE.CircleGeometry(15, 42),
        new THREE.MeshStandardMaterial({ color: 0xBAE29D, roughness: 0.9 })
      );
      grass.rotation.x = -Math.PI / 2;
      grass.receiveShadow = true;
      scene.add(grass);

      const innerRug = new THREE.Mesh(
        new THREE.CircleGeometry(2.9, 36),
        new THREE.MeshStandardMaterial({ color: 0xDDE9D2, roughness: 0.9 })
      );
      innerRug.rotation.x = -Math.PI / 2;
      innerRug.position.y = 0.01;
      scene.add(innerRug);

      const trackRing = new THREE.Mesh(
        new THREE.RingGeometry(3.45, 4.35, 48),
        new THREE.MeshStandardMaterial({ color: 0xFCEEC7, side: THREE.DoubleSide, roughness: 0.9 })
      );
      trackRing.rotation.x = -Math.PI / 2;
      trackRing.position.y = 0.015;
      scene.add(trackRing);

      // Scenic Trees & Duck Pond with Animated Ducklings
      const treeCoords: [number, number][] = [
        [-6.6, -4.6],
        [6.6, -4.6],
        [-7.2, 2.2],
        [7.2, 2.5]
      ];
      treeCoords.forEach(([tx, tz]) => {
        const tree = createTree3D();
        tree.position.set(tx, 0, tz);
        scene.add(tree);
      });

      const pond = new THREE.Mesh(
        new THREE.CircleGeometry(1.45, 26),
        new THREE.MeshStandardMaterial({ color: 0x8FD3F4, roughness: 0.25 })
      );
      pond.rotation.x = -Math.PI / 2;
      pond.position.set(-5.2, 0.015, 4.6);
      scene.add(pond);

      const ducklingA = createDuckling3D();
      const ducklingB = createDuckling3D();
      ducklingB.scale.setScalar(0.8);
      scene.add(ducklingA, ducklingB);

      // 6 Seat Markers around circle
      seatRingMeshesRef.current = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.46, 0.62, 24),
          new THREE.MeshStandardMaterial({ color: 0xF5F6F3, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(Math.cos(a) * SEAT_RADIUS, 0.025, Math.sin(a) * SEAT_RADIUS);
        scene.add(ring);
        seatRingMeshesRef.current.push(ring);
      }

      // 6 Articulated Kid Characters
      meshesRef.current = participantsRef.current.map((p, idx) => {
        const kid = createKidCharacter3D(p.name, p.shirt, p.hair);
        const startSeated = idx !== 0;
        const r = startSeated ? SEAT_RADIUS : TRACK_RADIUS;
        const angle = (idx / 6) * Math.PI * 2;
        kid.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
        kid.rotation.y = startSeated
          ? Math.atan2(-Math.cos(angle), -Math.sin(angle))
          : Math.atan2(-Math.sin(angle), Math.cos(angle));
        updateCharacterSitAndRun(kid, startSeated ? 1 : 0, 0, false, 0);
        scene.add(kid);
        return kid;
      });

      camera.position.set(0, 6.2, 8.8);
      camera.lookAt(0, 0.7, 0);
      syncSeatRingsRef.current();

      let animId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);
        lastRafTickRef.current = performance.now();
        const dt = Math.min(0.05, clock.getDelta());
        const t = clock.elapsedTime;
        const sim = simRef.current;

        if (scene.userData.updateBackdrop) scene.userData.updateBackdrop(t);

        // Animate pond ducklings gliding in figure-8
        ducklingA.position.set(-5.2 + Math.cos(t * 0.9) * 0.55, 0.04, 4.6 + Math.sin(t * 0.9) * 0.45);
        ducklingA.rotation.y = -t * 0.9;
        ducklingB.position.set(-5.2 - Math.cos(t * 0.9) * 0.45, 0.04, 4.6 - Math.sin(t * 0.9) * 0.4);
        ducklingB.rotation.y = Math.PI - t * 0.9;

        // Smooth camera gentle celebration zoom when match finished
        if (sim.phase === 'victory') {
          camera.position.x += (0 - camera.position.x) * 0.06;
          camera.position.y += (4.6 - camera.position.y) * 0.06;
          camera.position.z += (6.6 - camera.position.z) * 0.06;
          camera.lookAt(0, 0.9, 0);
        } else {
          camera.position.x += (0 - camera.position.x) * 0.06;
          camera.position.y += (6.2 - camera.position.y) * 0.06;
          camera.position.z += (8.8 - camera.position.z) * 0.06;
          camera.lookAt(0, 0.7, 0);
        }

        // Phase state updates
        if (sim.phase === 'player_walk' || sim.phase === 'bot_walk') {
          const rIdx = sim.runnerIdx;
          const targetSeatIdx = sim.seatOfParticipant[sim.patSlotIdx];
          const seatAng = getSeatAngle(targetSeatIdx >= 0 ? targetSeatIdx : sim.patSlotIdx);
          const desiredAngle = seatAng - 0.14;
          sim.targetAngles[rIdx] = desiredAngle;

          // Monotonic clockwise advancement toward target friend
          sim.angles[rIdx] = advanceMonotonicAngle(sim.angles[rIdx], desiredAngle, dt * 3.4);
          sim.radii[rIdx] += (TRACK_RADIUS - sim.radii[rIdx]) * Math.min(1, dt * 6);
          sim.sitProgress[rIdx] += (0 - sim.sitProgress[rIdx]) * Math.min(1, dt * 7);
        } else if (sim.phase === 'chase') {
          const rIdx = sim.runnerIdx;
          const gIdx = sim.gooseIdx;

          // Decay boosts naturally
          sim.runnerSpeedBoost = Math.max(0, sim.runnerSpeedBoost - dt * 1.45);
          sim.gooseSpeedBoost = Math.max(0, sim.gooseSpeedBoost - dt * 1.45);

          const baseRunnerSpeed = 1.65 + (rIdx === 0 ? sim.runnerSpeedBoost : Math.sin(t * 4) * 0.12 + 0.1);
          const baseGooseSpeed = 1.52 + (gIdx === 0 ? sim.gooseSpeedBoost : 0.18 + roundRef.current * 0.06);

          sim.runnerChaseAngle += baseRunnerSpeed * dt;
          sim.gooseChaseAngle += baseGooseSpeed * dt;
          sim.angles[rIdx] = sim.runnerChaseAngle;
          sim.angles[gIdx] = sim.gooseChaseAngle;

          sim.radii[rIdx] += (TRACK_RADIUS - sim.radii[rIdx]) * Math.min(1, dt * 7);
          sim.radii[gIdx] += ((TRACK_RADIUS + 0.42) - sim.radii[gIdx]) * Math.min(1, dt * 7);
          sim.sitProgress[rIdx] += (0 - sim.sitProgress[rIdx]) * Math.min(1, dt * 9);
          sim.sitProgress[gIdx] += (0 - sim.sitProgress[gIdx]) * Math.min(1, dt * 9);

          const targetLapAngle = sim.chaseTargetAngle;
          if (sim.runnerChaseAngle >= targetLapAngle || sim.gooseChaseAngle >= targetLapAngle) {
            const runnerWonSeat = sim.runnerChaseAngle >= sim.gooseChaseAngle;
            const seatWinnerIdx = runnerWonSeat ? rIdx : gIdx;
            const newRunnerIdx = runnerWonSeat ? gIdx : rIdx;

            // Seat winner takes the contested vacated goal seat right at finish line!
            const assignedSeat = sim.raceGoalSeatIdx >= 0 ? sim.raceGoalSeatIdx : 0;

            sim.seatOfParticipant[newRunnerIdx] = -1;
            sim.seatOfParticipant[seatWinnerIdx] = assignedSeat;
            sim.phase = 'settling';
            sim.settlingTimer = 1.4;
            sim.runnerIdx = newRunnerIdx;

            setPhase('settling');
            setCallBubble(null);
            audioService.playSuccess();
            try {
              confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
            } catch {
              // ignore
            }

            if (seatWinnerIdx === 0 || rIdx === 0) {
              setScore((prev) => prev + (seatWinnerIdx === 0 ? 150 : 85));
            }
            setHudStatus(
              `${participantsRef.current[seatWinnerIdx].name} garantiu o lugar! ${participantsRef.current[newRunnerIdx].name} vai rodar agora...`
            );
            syncSeatRingsRef.current();
          }
        } else if (sim.phase === 'settling') {
          sim.settlingTimer -= dt;
          if (sim.settlingTimer <= 0) {
            if (mpRoomRef.current) {
              sim.phase = 'player_walk';
              sim.runnerIdx = 0;
              setPhase('player_walk');
              setActiveRunnerIdx(0);
            } else {
              const nextR = roundRef.current + 1;
              if (nextR > maxRounds) {
                sim.phase = 'victory';
                setPhase('victory');
                setIsVictoryOpen(true);
                setHudStatus('Fim de ciranda! Todos comemorando no parque!');
              } else {
                roundRef.current = nextR;
                setRound(nextR);
                if (sim.runnerIdx === 0) {
                  sim.phase = 'player_walk';
                  sim.patSlotIdx = findNextSeatedRef.current(0);
                  setPhase('player_walk');
                  setActiveRunnerIdx(0);
                  setTargetedSlotIdx(sim.patSlotIdx);
                  setHudStatus(
                    `Rodada ${nextR}/${maxRounds}: sua vez de rodar! Toque "Pato" ou grite "GANSO!"`
                  );
                  syncSeatRingsRef.current();
                } else {
                  startBotTurnRef.current(sim.runnerIdx);
                }
              }
            }
          }
        }

        // Apply transforms + articulated knee/elbow/blink animations to every kid
        participantsRef.current.forEach((p, idx) => {
          const mesh = meshesRef.current[idx];
          if (!mesh) return;

          const seatIdx = sim.seatOfParticipant[idx];
          const isCurrentlySeated = seatIdx !== -1;

          if (sim.phase === 'victory') {
            // Everyone sits neatly or stands & hops gently around center
            const angle = (idx / 6) * Math.PI * 2;
            const r = SEAT_RADIUS;
            mesh.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
            mesh.rotation.y = Math.atan2(-Math.cos(angle), -Math.sin(angle));
            updateCharacterSitAndRun(mesh, 0, t * 7 + idx, false, t);
            mesh.position.y = Math.abs(Math.sin(t * 5 + idx)) * 0.22;
            return;
          }

          if (isCurrentlySeated && idx !== sim.runnerIdx) {
            const targetAngle = (seatIdx / 6) * Math.PI * 2;
            sim.angles[idx] = lerpAngle(sim.angles[idx], targetAngle, Math.min(1, dt * 5.2));
            sim.radii[idx] += (SEAT_RADIUS - sim.radii[idx]) * Math.min(1, dt * 5.2);
            sim.sitProgress[idx] += (1 - sim.sitProgress[idx]) * Math.min(1, dt * 4.4);

            const rawDiff = normalizeAngle(sim.angles[idx] - sim.prevAngles[idx]);
            const angleStep = rawDiff > Math.PI ? Math.PI * 2 - rawDiff : rawDiff;
            const radiusStep = Math.abs(sim.radii[idx] - sim.prevRadii[idx]);
            const groundStep = angleStep * Math.max(sim.radii[idx], 0.5) + radiusStep;
            sim.walkPhase[idx] += groundStep * 3.8;
            sim.prevAngles[idx] = sim.angles[idx];
            sim.prevRadii[idx] = sim.radii[idx];

            const x = Math.cos(sim.angles[idx]) * sim.radii[idx];
            const z = Math.sin(sim.angles[idx]) * sim.radii[idx];
            mesh.position.set(x, 0, z);
            const lookInwardYaw = Math.atan2(-x, -z);
            mesh.rotation.y = lerpAngle(mesh.rotation.y, lookInwardYaw, Math.min(1, dt * 7));
            const isGlidingIntoSeat = groundStep > 0.002 && sim.sitProgress[idx] < 0.72;
            updateCharacterSitAndRun(mesh, sim.sitProgress[idx], sim.walkPhase[idx], isGlidingIntoSeat, t);
          } else {
            // Standing/running participant on the outer track
            sim.radii[idx] += (TRACK_RADIUS - sim.radii[idx]) * Math.min(1, dt * 5.6);
            sim.sitProgress[idx] += (0 - sim.sitProgress[idx]) * Math.min(1, dt * 5.2);

            const rawDiff = normalizeAngle(sim.angles[idx] - sim.prevAngles[idx]);
            const angleStep = rawDiff > Math.PI ? Math.PI * 2 - rawDiff : rawDiff;
            const radiusStep = Math.abs(sim.radii[idx] - sim.prevRadii[idx]);
            const groundStep = angleStep * Math.max(sim.radii[idx], 0.5) + radiusStep;
            sim.walkPhase[idx] += groundStep * 3.8;
            sim.prevAngles[idx] = sim.angles[idx];
            sim.prevRadii[idx] = sim.radii[idx];

            const x = Math.cos(sim.angles[idx]) * sim.radii[idx];
            const z = Math.sin(sim.angles[idx]) * sim.radii[idx];
            mesh.position.set(x, 0, z);

            const tangentYaw = Math.atan2(-Math.sin(sim.angles[idx]), Math.cos(sim.angles[idx]));
            mesh.rotation.y = lerpAngle(mesh.rotation.y, tangentYaw, Math.min(1, dt * 8));

            const isMovingNow =
              groundStep > 0.0015 ||
              Math.abs(normalizeAngle(sim.targetAngles[idx] - sim.angles[idx])) > 0.04;
            updateCharacterSitAndRun(
              mesh,
              sim.sitProgress[idx],
              sim.walkPhase[idx],
              isMovingNow,
              t
            );
          }
        });

        // Subtle pulse on golden targeted ring
        seatRingMeshesRef.current.forEach((ring) => {
          if (ring.scale.x > 1.15) {
            const pulse = 1.2 + Math.sin(t * 7) * 0.08;
            ring.scale.set(pulse, pulse, 1);
          }
        });

        renderer.render(scene, camera);
      };

      renderer.render(scene, camera);
      animate();
      return () => {
        cancelAnimationFrame(animId);
      };
    },
    [maxRounds]
  );

  const render2DFallbackStage = () => {
    const sim = simRef.current;
    return (
      <div className="relative w-full h-full min-h-[320px] sm:min-h-[420px] bg-gradient-to-b from-[#9AD0EC] via-[#C8E8FA] to-[#BAE29D] dark:from-[#1B1838] dark:via-[#26224D] dark:to-[#18382B] flex items-center justify-center overflow-hidden p-4">
        <svg viewBox="0 0 560 360" className="w-full h-full max-w-[540px]" aria-label="Ciranda Pato, Pato, Ganso no Parque">
          <defs>
            <radialGradient id="cirandaMeadow" cx="50%" cy="55%" r="55%">
              <stop offset="0%" stopColor="#D7F4C2" />
              <stop offset="100%" stopColor="#9EDB84" />
            </radialGradient>
            <linearGradient id="pondBlue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#89D6F8" />
              <stop offset="100%" stopColor="#4389F5" />
            </linearGradient>
          </defs>

          {/* Clouds */}
          <g opacity="0.85" fill="#FFFFFF">
            <ellipse cx="95" cy="48" rx="34" ry="15" />
            <ellipse cx="118" cy="42" rx="22" ry="13" />
            <ellipse cx="455" cy="54" rx="38" ry="16" />
            <ellipse cx="430" cy="48" rx="20" ry="12" />
          </g>

          {/* Meadow ellipse + pond */}
          <ellipse cx="280" cy="215" rx="248" ry="128" fill="url(#cirandaMeadow)" stroke="#75BA64" strokeWidth="4" />
          <ellipse cx="78" cy="274" rx="46" ry="24" fill="url(#pondBlue)" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.9" />
          {/* Little ducklings on pond */}
          <circle cx="66" cy="272" r="7" fill="#FFD34E" />
          <polygon points="72,272 78,274 72,276" fill="#FF9B42" />
          <circle cx="92" cy="278" r="5.5" fill="#FFD34E" />

          {/* Outer Running Track */}
          <ellipse cx="280" cy="202" rx="166" ry="104" fill="none" stroke="#FFF4C8" strokeWidth="26" strokeDasharray="12 6" opacity="0.9" />
          <ellipse cx="280" cy="202" rx="112" ry="68" fill="#E6F8DC" stroke="#8BD67A" strokeWidth="3" />

          {/* Center Ciranda Emblem */}
          <g transform="translate(280 202)">
            <circle r="34" fill="#FFFFFF" stroke="#E4DFF5" strokeWidth="3" />
            <text y="-3" textAnchor="middle" fill="#7047E8" fontSize="11" fontWeight="900">
              CIRANDA
            </text>
            <text y="12" textAnchor="middle" fill="#36C995" fontSize="10" fontWeight="800">
              Rodada {round}/{maxRounds}
            </text>
          </g>

          {/* 6 Seat Rings */}
          {[0, 1, 2, 3, 4, 5].map((seatIdx) => {
            const a = (seatIdx / 6) * Math.PI * 2 - Math.PI / 2;
            const sx = 280 + Math.cos(a) * 112;
            const sy = 202 + Math.sin(a) * 68;
            const occupantIdx = sim.seatOfParticipant.indexOf(seatIdx);
            const isTarget = (phase === 'player_walk' || phase === 'bot_walk') && occupantIdx === targetedSlotIdx;
            const isEmpty = occupantIdx === -1;

            return (
              <g key={seatIdx} transform={`translate(${sx} ${sy})`}>
                <ellipse
                  rx="22"
                  ry="14"
                  fill={isTarget ? '#FFD34E' : isEmpty ? '#C8F7E5' : '#FFFFFF'}
                  stroke={isTarget ? '#FF9B42' : isEmpty ? '#36C995' : '#B7CFAC'}
                  strokeWidth={isTarget ? '4' : '2.5'}
                />
              </g>
            );
          })}

          {/* 6 Participants */}
          {participants.map((p, idx) => {
            const seatIdx = sim.seatOfParticipant[idx];
            const isRunner = idx === activeRunnerIdx;
            const isTarget = idx === targetedSlotIdx;
            const radiusX = isRunner || seatIdx === -1 ? 166 : 112;
            const radiusY = isRunner || seatIdx === -1 ? 104 : 68;
            const displayIdx = seatIdx >= 0 ? seatIdx : idx;
            const angle = (displayIdx / 6) * Math.PI * 2 - Math.PI / 2 + (isRunner ? 0.28 : 0);
            const px = 280 + Math.cos(angle) * radiusX;
            const py = 202 + Math.sin(angle) * radiusY - (isRunner ? 12 : 0);
            const shirtHex = `#${p.shirt.toString(16).padStart(6, '0')}`;

            return (
              <g key={p.slotIndex} transform={`translate(${px} ${py})`}>
                {isTarget && (
                  <circle r="24" fill="none" stroke="#FFD34E" strokeWidth="3.5" strokeDasharray="5 3" />
                )}
                {isRunner && (
                  <circle r="24" fill="none" stroke="#7047E8" strokeWidth="3" opacity="0.85" />
                )}
                {/* Body & Head */}
                <ellipse cx="0" cy="8" rx="13" ry="11" fill={shirtHex} stroke="#25233A" strokeWidth="1.8" />
                <circle cx="0" cy="-8" r="11" fill="#FCD7BD" stroke="#25233A" strokeWidth="1.8" />
                <path d="M -10 -11 Q 0 -22 10 -11" fill="#25233A" />
                <circle cx="-3.5" cy="-8" r="1.5" fill="#25233A" />
                <circle cx="3.5" cy="-8" r="1.5" fill="#25233A" />
                <path d="M -3 -4 Q 0 -1.5 3 -4" fill="none" stroke="#25233A" strokeWidth="1.5" strokeLinecap="round" />
                {/* Name Label */}
                <rect x="-26" y="18" width="52" height="15" rx="7.5" fill={p.isPlayer ? '#7047E8' : '#FFFFFF'} stroke="#E4DFF5" strokeWidth="1" />
                <text y="28.5" textAnchor="middle" fill={p.isPlayer ? '#FFFFFF' : '#25233A'} fontSize="9" fontWeight="900">
                  {p.isPlayer ? 'Você' : p.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const playerInvolvedInChase =
    phase === 'chase' && (activeRunnerIdx === 0 || targetedSlotIdx === 0);

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      <MultiplayerRoomBanner
        gameType="pato-ganso"
        playerName={activeChild?.name || playerChar.name}
        avatarId={playerChar.id}
        familyId={authSession?.familyId}
        room={mpRoom}
        playerId={mpPlayerId}
        onRoomChange={(nextRoom, nextPid) => {
          setMpRoom(nextRoom);
          setMpPlayerId(nextPid);
          if (!nextRoom) {
            resetFullGame();
          } else {
            const me = nextRoom.players.find((p) => p.playerId === nextPid);
            if (me) setScore(me.score);
            if (nextRoom.lastEventMessage) {
              setHudStatus(`Sala ${nextRoom.code}: ${nextRoom.lastEventMessage}`);
            }
          }
        }}
      />

      {/* HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#E6F9F2] dark:bg-[#102E24] border border-[#9FE8CD] dark:border-[#245946] text-[#177A57] dark:text-[#6EE7B7] text-xs font-extrabold">
            Rodada {round} de {maxRounds}
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#FFF5CC] dark:bg-[#332709] border border-[#FFE082] dark:border-[#634C14] text-[#8A5A00] dark:text-[#FDE68A] text-xs font-extrabold">
            Patos: {patoCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetFullGame}
            className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF] flex items-center gap-1.5 hover:border-[#7047E8] transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reiniciar</span>
          </button>
          <span className="px-3.5 py-1.5 rounded-full bg-[#F0ECFF] dark:bg-[#282158] border border-[#C9BCFF] dark:border-[#493D9E] text-[#7047E8] dark:text-[#D7CBFF] text-xs font-extrabold flex items-center gap-1">
            <Sparkles size={14} />
            {score} pts
          </span>
        </div>
      </div>

      {/* 3D Scene with Automatic Interactive 2D Park Fallback */}
      <div className="relative rounded-[28px] overflow-hidden border-2 border-[#C8F0DF] dark:border-[#2C5E4B] shadow-card">
        <ThreeCanvasContainer
          onInit={initScene}
          theme="park"
          className="w-full h-80 sm:h-[420px]"
          fallbackNode={render2DFallbackStage()}
        />

        {callBubble && (
          <div className="absolute top-3 inset-x-0 mx-auto w-fit z-20 px-5 py-2 rounded-full bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-md border-2 border-[#FFD34E] shadow-md flex items-center gap-2 animate-bounce-gentle">
            {callBubble === 'pato' ? (
              <DuckSvgIcon className="w-6 h-6" />
            ) : (
              <GooseSvgIcon className="w-6 h-6" />
            )}
            <span className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
              {callBubble === 'pato' ? 'PATO!' : 'GANSO!!'}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 inset-x-3 mx-auto w-fit max-w-[94%] z-20 bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#E4DFF5] dark:border-[#38316B] shadow-sm text-center">
          <span className="text-xs sm:text-sm font-bold text-[#25233A] dark:text-[#F8F7FF]">
            {hudStatus}
          </span>
        </div>
      </div>

      {/* Tactile Interactive Controls */}
      <div className="rounded-[26px] p-5 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-sm">
        {phase === 'player_walk' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePatoTap}
              className="btn-lingo py-4 px-5 rounded-[18px] bg-[#FFF5CC] dark:bg-[#3A2E0D] hover:bg-[#FFEC9E] dark:hover:bg-[#4A3B12] border-2 border-[#FFD34E] dark:border-[#A88218] border-b-4 text-[#25233A] dark:text-[#FDE68A] font-extrabold text-base flex items-center justify-center gap-3 active:translate-y-0.5 transition-all"
            >
              <DuckSvgIcon className="w-8 h-8" />
              <span>PATO (Tocar Próximo)</span>
            </button>
            <button
              type="button"
              onClick={handleGansoTap}
              className="btn-lingo py-4 px-5 rounded-[18px] bg-[#FF9B42] hover:bg-[#F38728] border-2 border-[#D8721E] border-b-4 text-white font-extrabold text-base flex items-center justify-center gap-3 active:translate-y-0.5 transition-all shadow-sm"
            >
              <GooseSvgIcon className="w-8 h-8" />
              <span>GANSO! (Correr!)</span>
            </button>
          </div>
        )}

        {phase === 'bot_walk' && (
          <div className="text-center py-3 space-y-1.5">
            <p className="font-display text-lg font-extrabold text-[#25233A] dark:text-white flex items-center justify-center gap-2">
              <Footprints size={20} className="text-[#36C995]" />
              <span>Fique atento! Se {participants[activeRunnerIdx]?.name} falar GANSO em você, corra!</span>
            </p>
            <p className="text-xs font-bold text-[#77758A] dark:text-[#B8B3D6]">
              Alvo atual na ciranda: {participants[targetedSlotIdx]?.name}
            </p>
          </div>
        )}

        {phase === 'chase' && (
          <div className="space-y-3 text-center">
            {playerInvolvedInChase ? (
              <button
                type="button"
                onClick={handleBoostRun}
                className="btn-lingo w-full py-5 rounded-[18px] bg-[#36C995] hover:bg-[#2EB887] border-2 border-[#239B71] border-b-4 text-white font-extrabold text-lg flex items-center justify-center gap-2.5 animate-pulse active:translate-y-0.5 transition-all"
              >
                <Zap size={22} />
                <span>CORRER MAIS RÁPIDO! ({boostClicks} impulsos)</span>
              </button>
            ) : (
              <p className="text-sm font-extrabold text-[#25233A] dark:text-white py-3">
                Torcendo pela corrida de {participants[targetedSlotIdx]?.name}!
              </p>
            )}
          </div>
        )}

        {phase === 'settling' && (
          <div className="text-center py-3 text-sm font-extrabold text-[#177A57] dark:text-[#6EE7B7]">
            Acomodando na roda para a próxima rodada...
          </div>
        )}
      </div>

      <VictoryCelebrationModal
        isOpen={isVictoryOpen}
        title="Ciranda Super Divertida!"
        subtitle={`Você completou ${maxRounds} rodadas de Pato, Pato, Ganso com ${score} pontos!`}
        starsEarned={25}
        score={Math.max(120, score)}
        durationSeconds={Math.max(1, Math.round((Date.now() - startTime) / 1000))}
        characterId={playerChar.id}
        onReplay={resetFullGame}
        onContinue={() =>
          onFinishGame(Math.max(1, Math.round((Date.now() - startTime) / 1000)), Math.max(120, score))
        }
      />
    </div>
  );
};
