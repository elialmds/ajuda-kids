import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityItem, ActivityOption, ActivitySubTask, SkillArea } from '@/types';
import { AudioNarrationButton } from '@/components/common/AudioNarrationButton';
import { VictoryCelebrationModal } from '@/components/common/VictoryCelebrationModal';
import { AjudaKidsMascot } from '@/components/common/AjudaKidsMascot';
import { MindfulBreathing } from './MindfulBreathing';
import { CreativeAtelierView } from './CreativeAtelierView';
import { audioService } from '@/services/audioService';
import { storageService } from '@/services/storageService';
import { useApp } from '@/modules/context/AppContext';
import { getCompanionBySkill } from '@/data/charactersData';
import {
  CommunicationIllustration,
  ReasoningIllustration,
  AttentionIllustration,
  EmotionalIllustration,
  MotorIllustration,
  CreativityIllustration,
  KnowledgeIllustration,
  MathIllustration,
  MusicIllustration,
  LanguagesIllustration,
  ProgressTrophyIllustration
} from '@/components/illustrations/HandDrawnIllustrations';
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Clock,
  Footprints,
  GripVertical,
  Heart,
  Minus,
  Music,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActivityRunnerProps {
  activity: ActivityItem;
  onComplete: (score?: number) => void;
  onCancel?: () => void;
  stepNumber?: number;
  totalSteps?: number;
}

export const renderSkillIllustration = (area: SkillArea, size = 90) => {
  switch (area) {
    case 'communication':
      return <CommunicationIllustration size={size} />;
    case 'reasoning':
      return <ReasoningIllustration size={size} />;
    case 'math':
      return <MathIllustration size={size} />;
    case 'attention':
      return <AttentionIllustration size={size} />;
    case 'emotional':
      return <EmotionalIllustration size={size} />;
    case 'motor':
      return <MotorIllustration size={size} />;
    case 'creativity':
      return <CreativityIllustration size={size} />;
    case 'knowledge':
      return <KnowledgeIllustration size={size} />;
    case 'music':
      return <MusicIllustration size={size} />;
    case 'languages':
      return <LanguagesIllustration size={size} />;
    default:
      return <ProgressTrophyIllustration size={size} />;
  }
};

/**
 * Interactive animated SVG character scene for Spatial Direction ("Direita e Esquerda").
 * Character faces INTO the trail (back view) so character right == screen right,
 * avoiding left/right mirror confusion while giving zero textual arrow hints.
 */
const DirectionStageIllustration: React.FC<{
  pose?: ActivitySubTask['characterPose'];
  primaryColor?: string;
}> = ({ pose = 'wave_right', primaryColor = '#38BDF8' }) => {
  const isStepRight = pose === 'step_right';
  const isStepLeft = pose === 'step_left';
  const charX = isStepRight ? 215 : isStepLeft ? 105 : 160;

  return (
    <div className="my-4 rounded-3xl overflow-hidden border-2 border-[#D7E4CF] bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#DCFCE7] p-3">
      <svg viewBox="0 0 320 175" className="w-full max-w-md mx-auto block" role="img" aria-label="Cenário animado do personagem na trilha">
        {/* Sky sunbeams & fluffy clouds */}
        <circle cx="46" cy="34" r="18" fill="#FDE047" />
        <g fill="#FFFFFF" opacity="0.9">
          <circle cx="230" cy="34" r="12" />
          <circle cx="244" cy="30" r="15" />
          <circle cx="260" cy="35" r="11" />
        </g>

        {/* Distant rolling hills */}
        <path d="M0 120 Q80 88 165 112 Q245 86 320 116 L320 175 L0 175 Z" fill="#BBF7D0" />
        <path d="M0 132 Q120 115 320 136 L320 175 L0 175 Z" fill="#86EFAC" />

        {/* Central park winding trail */}
        <path d="M118 175 Q142 128 152 104 L172 104 Q182 128 206 175 Z" fill="#FDE68A" />

        {/* Contextual props: tree on left or right without textual label */}
        {(pose === 'tree_left' || pose === 'wave_left') && (
          <g transform="translate(55, 78)">
            <rect x="-6" y="16" width="12" height="34" rx="4" fill="#92400E" />
            <circle cx="0" cy="8" r="24" fill="#22C55E" />
            <circle cx="-12" cy="14" r="14" fill="#16A34A" />
            <circle cx="12" cy="14" r="14" fill="#16A34A" />
            <circle cx="-7" cy="2" r="4" fill="#F472B6" />
            <circle cx="8" cy="10" r="4" fill="#F472B6" />
            <circle cx="1" cy="17" r="3.5" fill="#FACC15" />
          </g>
        )}

        {(pose === 'tree_right' || pose === 'wave_right') && (
          <g transform="translate(262, 78)">
            <rect x="-6" y="16" width="12" height="34" rx="4" fill="#92400E" />
            <circle cx="0" cy="8" r="24" fill="#22C55E" />
            <circle cx="-12" cy="14" r="14" fill="#16A34A" />
            <circle cx="12" cy="14" r="14" fill="#16A34A" />
            <circle cx="-6" cy="4" r="4" fill="#F472B6" />
            <circle cx="9" cy="9" r="4" fill="#F472B6" />
            <circle cx="0" cy="16" r="3.5" fill="#FACC15" />
          </g>
        )}

        {/* Footprints showing sideways step */}
        {isStepRight && (
          <g fill="#B45309" opacity="0.45">
            <ellipse cx="164" cy="150" rx="6" ry="3.5" />
            <ellipse cx="182" cy="146" rx="6" ry="3.5" />
            <polygon points="244,122 256,122 256,154 244,154" fill="#92400E" opacity="1" />
            <rect x="234" y="114" width="32" height="14" rx="5" fill="#F59E0B" opacity="1" />
          </g>
        )}
        {isStepLeft && (
          <g fill="#B45309" opacity="0.45">
            <ellipse cx="154" cy="150" rx="6" ry="3.5" />
            <ellipse cx="136" cy="146" rx="6" ry="3.5" />
            <polygon points="62,122 74,122 74,154 62,154" fill="#92400E" opacity="1" />
            <rect x="52" y="114" width="32" height="14" rx="5" fill="#F59E0B" opacity="1" />
          </g>
        )}

        {/* Animated Explorer Character (Back-view facing trail so left=left, right=right!) */}
        <g transform={`translate(${charX}, 118)`} className="transition-all duration-500">
          {/* Shadow */}
          <ellipse cx="0" cy="36" rx="18" ry="5" fill="#15803D" opacity="0.22" />

          {/* Legs */}
          <rect x="-11" y="16" width="8" height="18" rx="4" fill="#1E3A8A" />
          <rect x="3" y="16" width="8" height="18" rx="4" fill="#1E3A8A" />
          {/* Sneakers */}
          <ellipse cx="-7" cy="34" rx="6" ry="3.5" fill="#EF4444" />
          <ellipse cx="7" cy="34" rx="6" ry="3.5" fill="#EF4444" />

          {/* Left Arm */}
          {pose === 'wave_left' ? (
            <g>
              <path d="M-13 -4 Q-30 -24 -26 -38" stroke="#FDBA74" strokeWidth="7.5" strokeLinecap="round" fill="none" />
              <circle cx="-26" cy="-40" r="5.5" fill="#FDE047" stroke="#F59E0B" strokeWidth="2" />
              <path d="M-36 -43 Q-39 -36 -34 -29" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <line x1="-14" y1="-2" x2="-21" y2="15" stroke="#FDBA74" strokeWidth="7" strokeLinecap="round" />
          )}

          {/* Right Arm */}
          {pose === 'wave_right' ? (
            <g>
              <path d="M13 -4 Q30 -24 26 -38" stroke="#FDBA74" strokeWidth="7.5" strokeLinecap="round" fill="none" />
              <circle cx="26" cy="-40" r="5.5" fill="#FDE047" stroke="#F59E0B" strokeWidth="2" />
              <path d="M36 -43 Q39 -36 34 -29" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <line x1="14" y1="-2" x2="21" y2="15" stroke="#FDBA74" strokeWidth="7" strokeLinecap="round" />
          )}

          {/* Torso + cute explorer backpack */}
          <rect x="-15" y="-12" width="30" height="30" rx="10" fill={primaryColor} />
          <rect x="-11" y="-8" width="22" height="21" rx="7" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <rect x="-7" y="-2" width="14" height="8" rx="3" fill="#FEF3C7" />

          {/* Head (back with soft brown hair & explorer cap!) */}
          <circle cx="0" cy="-24" r="14" fill="#78350F" />
          <path d="M-13 -27 Q0 -40 13 -27 Z" fill="#EF4444" />
          <circle cx="0" cy="-35" r="3" fill="#FDE047" />
        </g>
      </svg>
      <p className="text-[11px] font-extrabold text-slate-600 text-center mt-1">
        Dica visual: imagine que você está atrás do explorador olhando para a mesma paisagem!
      </p>
    </div>
  );
};

function shuffleNonMatching(items: string[]): string[] {
  if (items.length <= 1) return [...items];
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  const sameAsOriginal = copy.every((val, idx) => val === items[idx]);
  if (sameAsOriginal) {
    [copy[0], copy[1]] = [copy[1], copy[0]];
  }
  return copy;
}

const DIFFICULTY_BADGE: Record<'facil' | 'medio' | 'dificil', { label: string; cls: string }> = {
  facil: { label: 'Fácil', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  medio: { label: 'Médio', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  dificil: { label: 'Desafio', cls: 'bg-violet-100 text-violet-800 border-violet-200' }
};

export const ActivityRunner: React.FC<ActivityRunnerProps> = ({
  activity,
  onComplete,
  onCancel,
  stepNumber,
  totalSteps
}) => {
  const { activeChild } = useApp();
  const childId = activeChild?.id || 'guest_child';
  const companion = getCompanionBySkill(activity.area);

  const taskList: ActivitySubTask[] = useMemo(() => {
    if (activity.tasks && activity.tasks.length > 0) return activity.tasks;
    return [
      {
        id: `${activity.id}_main`,
        title: activity.title,
        ...activity.content
      }
    ];
  }, [activity]);

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [accumulatedScore, setAccumulatedScore] = useState(0);
  const [resumedNotice, setResumedNotice] = useState<string | null>(null);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const currentTask = taskList[currentTaskIndex] || taskList[0];

  // Task interaction state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [wrongAttemptsOnTask, setWrongAttemptsOnTask] = useState(0);

  // Word builder state
  const [builtWord, setBuiltWord] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>(currentTask.wordParts || []);

  // Pair matching state
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [shuffledRightPairs, setShuffledRightPairs] = useState<{ id: string; right: string }[]>([]);

  // Sequence ordering state (no numerical spoilers, supports drag + reorder buttons!)
  const [orderedSequence, setOrderedSequence] = useState<string[]>([]);
  const [wrongSequenceIndices, setWrongSequenceIndices] = useState<number[]>([]);
  const [draggedSeqIdx, setDraggedSeqIdx] = useState<number | null>(null);

  // Physical action state
  const [physicalDone, setPhysicalDone] = useState(false);

  // Visual math counter state
  const [mathAnswerValue, setMathAnswerValue] = useState<number>(0);

  // Rhythm echo audio pad state
  const [rhythmPlayedIds, setRhythmPlayedIds] = useState<string[]>([]);
  const [rhythmActiveNoteId, setRhythmActiveNoteId] = useState<string | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);
  const rhythmTimerRefs = useRef<number[]>([]);

  const clearRhythmTimers = useCallback(() => {
    rhythmTimerRefs.current.forEach((t) => window.clearTimeout(t));
    rhythmTimerRefs.current = [];
  }, []);

  useEffect(() => {
    return () => clearRhythmTimers();
  }, [clearRhythmTimers]);

  // Restore partial multi-task progress when switching to a multi-task activity
  useEffect(() => {
    startTimeRef.current = Date.now();
    setVictoryOpen(false);
    setResumedNotice(null);

    if (taskList.length > 1) {
      const saved = storageService.getActivityPartialProgress(childId, activity.id);
      if (saved && saved.taskIndex > 0 && saved.taskIndex < taskList.length) {
        setCurrentTaskIndex(saved.taskIndex);
        setAccumulatedScore(saved.score || 0);
        setResumedNotice(`Retomando da tarefa ${saved.taskIndex + 1} de ${taskList.length}!`);
        return;
      }
    }
    setCurrentTaskIndex(0);
    setAccumulatedScore(0);
  }, [activity.id, childId, taskList.length]);

  // Reset per-task interactive state whenever task changes
  const resetTaskState = useCallback((task: ActivitySubTask) => {
    clearRhythmTimers();
    setSelectedOptionId(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setFeedbackMsg('');
    setWrongAttemptsOnTask(0);
    setBuiltWord([]);
    setAvailableLetters(task.wordParts ? [...task.wordParts] : []);
    setPhysicalDone(false);
    setMatchedPairIds([]);
    setSelectedLeftId(null);
    setWrongSequenceIndices([]);
    setDraggedSeqIdx(null);
    setMathAnswerValue(0);
    setRhythmPlayedIds([]);
    setRhythmActiveNoteId(null);
    setIsPlayingDemo(false);

    if (task.pairs) {
      const rights = task.pairs.map((p) => ({ id: p.id, right: p.right }));
      setShuffledRightPairs([...rights].sort(() => Math.random() - 0.5));
    } else {
      setShuffledRightPairs([]);
    }

    if (task.sequence) {
      setOrderedSequence(shuffleNonMatching(task.sequence));
    } else {
      setOrderedSequence([]);
    }
  }, [clearRhythmTimers]);

  useEffect(() => {
    resetTaskState(currentTask);
  }, [currentTask, resetTaskState]);

  const celebrateTaskSuccess = (msg: string) => {
    setIsAnswerChecked(true);
    setIsCorrect(true);
    setFeedbackMsg(msg);
    audioService.playSuccess();
    try {
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.65 } });
    } catch {
      // ignore confetti failures in headless test environments
    }
  };

  const handleSelectOption = (opt: ActivityOption) => {
    setSelectedOptionId(opt.id);
    setIsAnswerChecked(true);

    if (opt.isCorrect) {
      celebrateTaskSuccess(`${companion.name} diz: Muito bem! Resposta certinha!`);
    } else {
      setIsCorrect(false);
      setWrongAttemptsOnTask((c) => c + 1);
      setFeedbackMsg(`${companion.name} diz: Quase lá! Observe com calma e tente outra opção.`);
      audioService.playBellTone(260, 0.25);
    }
  };

  // Word builder handlers
  const handleTapLetter = (letter: string, index: number) => {
    audioService.playGentlePop();
    const nextBuilt = [...builtWord, letter];
    setBuiltWord(nextBuilt);

    const nextAvail = [...availableLetters];
    nextAvail.splice(index, 1);
    setAvailableLetters(nextAvail);

    if (currentTask.targetWord && nextBuilt.join('') === currentTask.targetWord) {
      celebrateTaskSuccess(`Parabéns! Você montou a palavra "${currentTask.targetWord}"!`);
    } else if (
      currentTask.targetWord &&
      nextBuilt.length === currentTask.targetWord.length
    ) {
      setIsAnswerChecked(true);
      setIsCorrect(false);
      setWrongAttemptsOnTask((c) => c + 1);
      setFeedbackMsg('A ordem das letrinhas ainda não formou a palavra. Vamos tentar de novo?');
      audioService.playBellTone(280, 0.3);
    }
  };

  const handleResetWord = () => {
    setBuiltWord([]);
    setAvailableLetters(currentTask.wordParts ? [...currentTask.wordParts] : []);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setFeedbackMsg('');
  };

  // Pair matching handlers
  const handleMatchRight = (rightPairId: string) => {
    if (!selectedLeftId) return;
    if (selectedLeftId === rightPairId) {
      audioService.playGentlePop();
      const nextMatched = [...matchedPairIds, rightPairId];
      setMatchedPairIds(nextMatched);
      setSelectedLeftId(null);

      if (currentTask.pairs && nextMatched.length === currentTask.pairs.length) {
        celebrateTaskSuccess(`Incrível! Você conectou todos os pares com ${companion.name}!`);
      }
    } else {
      audioService.playBellTone(260, 0.2);
      setWrongAttemptsOnTask((c) => c + 1);
      setSelectedLeftId(null);
      setFeedbackMsg('Esses dois ainda não formam par. Tente ligar outro item!');
    }
  };

  // Sequence Reordering Handlers (Buttons + Drag-and-Drop, preserves partial progress!)
  const swapSequencePositions = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= orderedSequence.length || fromIdx === toIdx) return;
    audioService.playGentlePop();
    const copy = [...orderedSequence];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    setOrderedSequence(copy);
    // Clear previous check banner so user can re-verify cleanly without resetting progress
    setWrongSequenceIndices([]);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setFeedbackMsg('');
  };

  const handleVerifySequence = () => {
    if (!currentTask.sequence) return;
    const mismatches: number[] = [];
    currentTask.sequence.forEach((expected, idx) => {
      if (orderedSequence[idx] !== expected) {
        mismatches.push(idx);
      }
    });

    if (mismatches.length === 0) {
      setWrongSequenceIndices([]);
      celebrateTaskSuccess('Sequência lógica perfeita! Todas as etapas estão no lugar certo!');
    } else {
      setWrongSequenceIndices(mismatches);
      setIsAnswerChecked(true);
      setIsCorrect(false);
      setWrongAttemptsOnTask((c) => c + 1);
      const correctCount = currentTask.sequence.length - mismatches.length;
      audioService.playBellTone(270, 0.25);
      setFeedbackMsg(
        correctCount > 0
          ? `${correctCount} de ${currentTask.sequence.length} etapas já estão no lugar certo! Ajuste os cartões destacados em amarelo.`
          : 'Observe a história com calma e reordene os cartões do começo até o final.'
      );
    }
  };

  const handleFinishPhysical = () => {
    setPhysicalDone(true);
    celebrateTaskSuccess('Excelente movimento! Você mexeu o corpo longe da tela!');
  };

  // Visual math interactive counter handlers
  const handleCheckVisualMath = () => {
    if (!currentTask.mathVisual) return;
    const { targetAnswer, unitLabel } = currentTask.mathVisual;
    const unitSuffix = unitLabel ? ` ${unitLabel}` : '';

    if (mathAnswerValue === targetAnswer) {
      celebrateTaskSuccess(
        `${companion.name} comemora: Exatamente ${targetAnswer}${unitSuffix}! Você mandou muito bem!`
      );
    } else {
      setIsAnswerChecked(true);
      setIsCorrect(false);
      setWrongAttemptsOnTask((c) => c + 1);
      audioService.playBellTone(260, 0.25);
      setFeedbackMsg(
        mathAnswerValue < targetAnswer
          ? `Quase lá! ${mathAnswerValue}${unitSuffix} ainda é pouco. Conte os elementos com calma e aumente um pouquinho!`
          : `Quase lá! ${mathAnswerValue}${unitSuffix} passou um pouquinho. Tente diminuir e conferir novamente!`
      );
    }
  };

  // Rhythm echo pad handlers
  const handleResetRhythm = () => {
    clearRhythmTimers();
    setRhythmPlayedIds([]);
    setRhythmActiveNoteId(null);
    setIsPlayingDemo(false);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setFeedbackMsg('');
  };

  const handlePlayRhythmDemo = () => {
    const notes = currentTask.rhythmNotes || [];
    const targetIds = currentTask.rhythmTargetIds || [];
    if (notes.length === 0 || targetIds.length === 0 || isPlayingDemo) return;

    clearRhythmTimers();
    setIsPlayingDemo(true);
    setRhythmPlayedIds([]);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setFeedbackMsg('Escute e observe as cores piscando! Depois repita a sequência nos botões.');

    targetIds.forEach((targetId, idx) => {
      const note = notes.find((n) => n.id === targetId);
      if (!note) return;

      const startTimer = window.setTimeout(() => {
        setRhythmActiveNoteId(note.id);
        audioService.playBellTone(note.freq, 0.42);
      }, idx * 560);

      const clearTimer = window.setTimeout(() => {
        setRhythmActiveNoteId((prev) => (prev === note.id ? null : prev));
      }, idx * 560 + 360);

      rhythmTimerRefs.current.push(startTimer, clearTimer);
    });

    const endTimer = window.setTimeout(() => {
      setIsPlayingDemo(false);
      setRhythmActiveNoteId(null);
      setFeedbackMsg('Sua vez! Toque os botões musicais na mesma ordem.');
    }, targetIds.length * 560 + 180);

    rhythmTimerRefs.current.push(endTimer);
  };

  const handleTapRhythmNote = (note: { id: string; label: string; freq: number }) => {
    if (isPlayingDemo || isCorrect) return;
    const targetIds = currentTask.rhythmTargetIds || [];
    if (targetIds.length === 0) return;

    audioService.playBellTone(note.freq, 0.35);
    setRhythmActiveNoteId(note.id);
    const flashTimer = window.setTimeout(() => {
      setRhythmActiveNoteId((prev) => (prev === note.id ? null : prev));
    }, 220);
    rhythmTimerRefs.current.push(flashTimer);

    const nextIdx = rhythmPlayedIds.length;
    if (nextIdx < targetIds.length && targetIds[nextIdx] === note.id) {
      const nextPlayed = [...rhythmPlayedIds, note.id];
      setRhythmPlayedIds(nextPlayed);

      if (nextPlayed.length === targetIds.length) {
        celebrateTaskSuccess(
          `${companion.name} aplaudiu! Você repetiu toda a sequência musical de ${targetIds.length} notas!`
        );
      } else if (isAnswerChecked && !isCorrect) {
        setIsAnswerChecked(false);
        setFeedbackMsg('');
      }
    } else {
      setIsAnswerChecked(true);
      setIsCorrect(false);
      setWrongAttemptsOnTask((c) => c + 1);
      setRhythmPlayedIds([]);
      audioService.playBellTone(230, 0.28);
      setFeedbackMsg(
        `Ops! A nota "${note.label}" saiu da ordem esperada. Clique em "Ouvir Melodia" se quiser relembrar!`
      );
    }
  };

  // Advance to next sub-task OR finish entire activity with Victory Modal
  const handleAdvanceOrComplete = () => {
    const taskScore = Math.max(75, 100 - wrongAttemptsOnTask * 8);
    const nextAccumulated = accumulatedScore + taskScore;

    if (currentTaskIndex < taskList.length - 1) {
      const nextIdx = currentTaskIndex + 1;
      setAccumulatedScore(nextAccumulated);
      setCurrentTaskIndex(nextIdx);
      setResumedNotice(null);
      storageService.saveActivityPartialProgress(
        childId,
        activity.id,
        nextIdx,
        taskList.length,
        nextAccumulated
      );
      audioService.playGentlePop();
    } else {
      storageService.clearActivityPartialProgress(childId, activity.id);
      setAccumulatedScore(nextAccumulated);
      audioService.playFanfare();
      setVictoryOpen(true);
    }
  };

  const finalAverageScore = Math.min(
    100,
    Math.round((accumulatedScore || 100) / Math.max(1, currentTaskIndex + 1))
  );
  const elapsedSeconds = Math.max(5, Math.round((Date.now() - startTimeRef.current) / 1000));
  const earnedStars = finalAverageScore >= 90 ? 3 : finalAverageScore >= 75 ? 2 : 1;

  if (currentTask.type === 'breathing') {
    return (
      <MindfulBreathing
        totalCycles={currentTask.breathingCycles || 4}
        onComplete={() => onComplete(100)}
        onClose={() => onComplete(100)}
      />
    );
  }

  const narrationText = `${activity.title}. ${
    currentTask.title ? currentTask.title + '.' : ''
  } ${currentTask.prompt}`;

  const progressPct = Math.round(((currentTaskIndex + (isCorrect ? 1 : 0.25)) / taskList.length) * 100);

  return (
    <div className="max-w-3xl mx-auto rounded-[26px] p-5 sm:p-8 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] border-b-4 dark:border-[#38316B] shadow-card text-[#25233A] dark:text-[#F8F7FF]">
      {/* Top Bar + Segmented Capsule Progress Bar */}
      <div className="space-y-3 pb-4 border-b border-[#E4DFF5] dark:border-[#38316B]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {stepNumber && (
              <span className="px-3 py-1 rounded-full bg-[#7047E8] text-[#FFD34E] text-xs font-extrabold">
                Passo {stepNumber} {totalSteps ? `de ${totalSteps}` : ''}
              </span>
            )}
            <span
              style={{ backgroundColor: companion.bgColor }}
              className="text-[11px] font-extrabold uppercase tracking-wider text-[#25233A] px-3 py-1 rounded-full"
            >
              {companion.skillLabel}
            </span>
            {currentTask.difficulty && (
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  DIFFICULTY_BADGE[currentTask.difficulty].cls
                }`}
              >
                {DIFFICULTY_BADGE[currentTask.difficulty].label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <AudioNarrationButton textToSpeak={narrationText} size="md" />
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-extrabold text-[#77758A] hover:text-[#25233A] dark:text-[#D3CEF0] dark:hover:text-white px-3.5 py-2 rounded-[14px] bg-[#F5F3FC] dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] hover:border-[#7047E8] transition-colors"
              >
                Sair
              </button>
            )}
          </div>
        </div>

        {/* Multi-task segmented progress capsule */}
        {taskList.length > 1 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#77758A] dark:text-[#D3CEF0]">
              <span>
                Tarefa {currentTaskIndex + 1} de {taskList.length}
                {currentTask.title ? ` — ${currentTask.title}` : ''}
              </span>
              {resumedNotice && (
                <span className="text-[#177A57] dark:text-[#6EE7B7] bg-[#E6F9F2] dark:bg-[#102E24] px-2.5 py-0.5 rounded-full border border-[#9FE8CD] dark:border-[#245946]">
                  {resumedNotice}
                </span>
              )}
            </div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${taskList.length}, minmax(0, 1fr))` }}>
              {taskList.map((t, idx) => {
                const done = idx < currentTaskIndex || (idx === currentTaskIndex && Boolean(isCorrect));
                const active = idx === currentTaskIndex && !isCorrect;
                return (
                  <div
                    key={t.id}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      done
                        ? 'bg-[#36C995] border-b-2 border-[#239B71]'
                        : active
                        ? 'bg-[#7047E8] border-b-2 border-[#5933CC] animate-pulse'
                        : 'bg-[#F5F3FC] dark:bg-[#27234D]'
                    }`}
                  />
                );
              })}
            </div>
            <span className="sr-only">Progresso: {progressPct}%</span>
          </div>
        )}
      </div>

      {/* Companion Character & AjudaKidsMascot Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 my-5">
        <div className="shrink-0 p-3 rounded-[22px] bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#E4DFF5] dark:border-[#38316B] flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            {companion.renderCharacter(
              62,
              isCorrect ? 'celebrating' : isAnswerChecked ? 'thinking' : 'happy'
            )}
            <AjudaKidsMascot
              size={54}
              pose={isCorrect ? 'celebrating' : isAnswerChecked ? 'thinking' : 'encouraging'}
            />
          </div>
          <span className="text-[10px] font-extrabold text-[#7047E8] dark:text-[#C4B5FD] mt-1">
            Guardião {companion.name}
          </span>
        </div>

        <div className="text-center sm:text-left min-w-0 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-3 text-xs font-bold text-[#77758A] dark:text-[#B8B3D6] mb-1">
            <span className="flex items-center gap-1">
              <Clock size={13} /> {activity.durationMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Target size={13} /> Faixa {activity.ageGroup} anos
            </span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#25233A] dark:text-white leading-tight">
            {activity.title}
          </h2>

          {activity.objective && (
            <p className="text-xs font-extrabold text-[#4389F5] dark:text-[#7DD3FC] mt-1">
              Objetivo: {activity.objective}
            </p>
          )}

          <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#D3CEF0] mt-1 font-medium leading-relaxed">
            {activity.instructions}
          </p>
        </div>
      </div>

      {/* Story Context if any */}
      {currentTask.storyText && (
        <div className="p-4 rounded-[20px] bg-[#E6F9F2] dark:bg-[#102E24] border border-[#9FE8CD] dark:border-[#245946] text-sm font-bold text-[#25233A] dark:text-[#D1FAE5] leading-relaxed mb-4">
          “{currentTask.storyText}”
        </div>
      )}

      {/* Main Challenge Prompt */}
      <div className="p-4 sm:p-5 rounded-[22px] bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#E4DFF5] border-b-4 dark:border-[#38316B] text-center my-4">
        <h3 className="font-display text-base sm:text-lg font-extrabold text-[#25233A] dark:text-white">
          {currentTask.prompt}
        </h3>
      </div>

      {/* Animated Direction Stage when type === 'direction_tap' */}
      {currentTask.type === 'direction_tap' && (
        <DirectionStageIllustration
          pose={currentTask.characterPose}
          primaryColor={companion.accentColor}
        />
      )}

      {/* INTERACTION TYPE 1: Multiple Choice / Direction Tap / Pattern / Story Quiz */}
      {(currentTask.type === 'choice' ||
        currentTask.type === 'spot_odd' ||
        currentTask.type === 'direction_tap' ||
        currentTask.type === 'pattern_complete' ||
        currentTask.type === 'story_quiz') &&
        currentTask.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
            {currentTask.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let btnClass =
                'border-2 border-b-4 border-[#E4DFF5] dark:border-[#38316B] bg-white dark:bg-[#27234D] text-[#25233A] dark:text-white hover:bg-[#F5F3FC] dark:hover:bg-[#322C63] hover:border-[#7047E8] shadow-xs';

              if (isAnswerChecked && isSelected) {
                btnClass = opt.isCorrect
                  ? 'border-2 border-b-4 border-[#36C995] bg-[#E6F9F2] dark:bg-[#102E24] text-[#177A57] dark:text-[#6EE7B7] font-extrabold scale-[1.01] shadow-md'
                  : 'border-2 border-b-4 border-[#FF9B42] bg-[#FFF0E2] dark:bg-[#331F0E] text-[#B25400] dark:text-[#FDBA74] font-bold';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-[20px] text-left transition-all duration-150 active:translate-y-0.5 flex items-center justify-between min-h-[62px] ${btnClass}`}
                >
                  <span className="text-sm sm:text-base font-extrabold break-words">{opt.text}</span>
                  {isAnswerChecked && isSelected && (
                    <span className="shrink-0 ml-2 flex items-center">
                      {opt.isCorrect ? (
                        <CheckCircle2 size={20} className="text-[#36C995]" />
                      ) : (
                        <Heart size={18} className="text-[#FF9B42]" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

      {/* INTERACTION TYPE 2: Word Builder */}
      {currentTask.type === 'word_build' && (
        <div className="my-6 text-center">
          <div className="flex justify-center items-center gap-3 mb-6 flex-wrap">
            {currentTask.targetWord?.split('').map((_, i) => (
              <div
                key={i}
                className="w-14 h-16 rounded-2xl border-2 border-dashed border-[#7047E8] dark:border-[#8B68F7] bg-white dark:bg-[#27234D] flex items-center justify-center text-2xl font-black text-[#25233A] dark:text-white shadow-sm"
              >
                {builtWord[i] || ''}
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-3 flex-wrap">
            {availableLetters.map((letter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTapLetter(letter, idx)}
                className="w-14 h-14 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#DDD6F3] dark:border-[#38316B] border-b-4 text-[#25233A] dark:text-white font-black text-xl hover:bg-[#7047E8] hover:text-white hover:border-[#522EC2] dark:hover:bg-[#7047E8] active:translate-y-0.5 transition-all"
              >
                {letter}
              </button>
            ))}
          </div>

          {builtWord.length > 0 && !isCorrect && (
            <button
              type="button"
              onClick={handleResetWord}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-[#77758A] hover:text-[#25233A] dark:text-[#C5BFE6] dark:hover:text-white"
            >
              <RotateCcw size={14} />
              <span>Recomeçar palavra</span>
            </button>
          )}
        </div>
      )}

      {/* INTERACTION TYPE 3: Interactive Pair Matching */}
      {currentTask.type === 'pair_matching' && currentTask.pairs && (
        <div className="my-5 space-y-3">
          <p className="text-xs font-extrabold text-center text-[#77758A] dark:text-[#C5BFE6]">
            1º Toque em um item da esquerda • 2º Toque no par correspondente à direita
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            <div className="space-y-2.5">
              {currentTask.pairs.map((p) => {
                const isMatched = matchedPairIds.includes(p.id);
                const isSelected = selectedLeftId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => {
                      audioService.playGentlePop();
                      setSelectedLeftId(p.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-xs sm:text-sm font-black transition-all text-left flex items-center justify-between ${
                      isMatched
                        ? 'bg-[#E9FBF4] dark:bg-[#133A2E] border-[#36C995] dark:border-[#36C995] text-[#115E43] dark:text-[#A7F3D0] opacity-90'
                        : isSelected
                        ? 'bg-[#7047E8] text-white border-[#522EC2] scale-[1.01] shadow-sm'
                        : 'bg-white dark:bg-[#27234D] border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-white hover:border-[#7047E8] dark:hover:border-[#8B68F7]'
                    }`}
                  >
                    <span>{p.left}</span>
                    {isMatched && <CheckCircle2 size={16} className="text-[#36C995] dark:text-[#6EE7B7]" />}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2.5">
              {shuffledRightPairs.map((r) => {
                const isMatched = matchedPairIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleMatchRight(r.id)}
                    className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-xs sm:text-sm font-black transition-all text-left flex items-center justify-between ${
                      isMatched
                        ? 'bg-[#E9FBF4] dark:bg-[#133A2E] border-[#36C995] dark:border-[#36C995] text-[#115E43] dark:text-[#A7F3D0] opacity-90'
                        : selectedLeftId
                        ? 'bg-[#FFF9E6] dark:bg-[#27234D] border-[#FFD34E] dark:border-[#FFD34E]/80 text-[#25233A] dark:text-white hover:bg-[#FFF2CC] dark:hover:bg-[#342E63]'
                        : 'bg-white dark:bg-[#27234D] border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-white'
                    }`}
                  >
                    <span>{r.right}</span>
                    {isMatched && <CheckCircle2 size={16} className="text-[#36C995] dark:text-[#6EE7B7]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INTERACTION TYPE 4: Rebuilt Sequence Ordering (Drag & Swap without number hints) */}
      {currentTask.type === 'sequence' && currentTask.sequence && (
        <div className="my-5 space-y-4">
          <p className="text-xs font-extrabold text-[#77758A] dark:text-[#C5BFE6] text-center">
            Arraste os cartões ou use as setinhas Subir / Descer para colocar do primeiro ao último acontecimento!
          </p>

          <div className="space-y-2.5">
            {orderedSequence.map((item, idx) => {
              const isWrongAfterCheck = wrongSequenceIndices.includes(idx);
              const isRightAfterCheck =
                isAnswerChecked &&
                (isCorrect || (wrongSequenceIndices.length > 0 && !isWrongAfterCheck));

              return (
                <div
                  key={item}
                  draggable={!isCorrect}
                  onDragStart={() => setDraggedSeqIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedSeqIdx !== null && draggedSeqIdx !== idx) {
                      swapSequencePositions(draggedSeqIdx, idx);
                    }
                    setDraggedSeqIdx(null);
                  }}
                  className={`p-3.5 rounded-2xl border-2 border-b-4 flex items-center justify-between gap-3 transition-all ${
                    isRightAfterCheck
                      ? 'bg-[#E9FBF4] dark:bg-[#133A2E] border-[#36C995] dark:border-[#36C995] text-[#115E43] dark:text-[#A7F3D0]'
                      : isWrongAfterCheck
                      ? 'bg-[#FFF4E5] dark:bg-[#3A281A] border-[#FF9B42] dark:border-[#FF9B42] text-[#7A3E00] dark:text-[#FED7AA] animate-shake'
                      : 'bg-white dark:bg-[#27234D] border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-white cursor-grab'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GripVertical className="w-5 h-5 text-[#9E9BAE] dark:text-[#7F76B8] shrink-0 hidden sm:block" />
                    <span className="w-7 h-7 rounded-xl bg-[#F5F3FC] dark:bg-[#1E1B3A] text-[#7047E8] dark:text-[#C4B5FD] border border-[#DDD6F3] dark:border-[#494285] font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}º
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold break-words">{item}</span>
                  </div>

                  {!isCorrect && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => swapSequencePositions(idx, idx - 1)}
                        aria-label={`Mover "${item}" para cima`}
                        className="p-2 rounded-xl bg-[#F5F3FC] dark:bg-[#1E1B3A] hover:bg-[#EDE9FE] dark:hover:bg-[#342E63] text-[#25233A] dark:text-white disabled:opacity-35 border border-[#E4DFF5] dark:border-[#38316B]"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === orderedSequence.length - 1}
                        onClick={() => swapSequencePositions(idx, idx + 1)}
                        aria-label={`Mover "${item}" para baixo`}
                        className="p-2 rounded-xl bg-[#F5F3FC] dark:bg-[#1E1B3A] hover:bg-[#EDE9FE] dark:hover:bg-[#342E63] text-[#25233A] dark:text-white disabled:opacity-35 border border-[#E4DFF5] dark:border-[#38316B]"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isCorrect && (
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={handleVerifySequence}
                className="px-6 py-3.5 rounded-2xl bg-[#36C995] hover:bg-[#2BB584] text-white font-black text-sm border-b-4 border-[#22986E] active:translate-y-0.5 transition-all inline-flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verificar Sequência</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* INTERACTION TYPE 5: Embedded Full Creative Atelier Canvas */}
      {currentTask.type === 'drawing_canvas' && (
        <div className="my-4">
          <CreativeAtelierView
            initialPrompt={currentTask.drawingGuide}
            embeddedMode={true}
            onCompleteActivity={() =>
              celebrateTaskSuccess(
                `Obra-prima salva na Galeria! ${companion.name} amou sua criatividade!`
              )
            }
          />
        </div>
      )}

      {/* INTERACTION TYPE 6: Physical Action (Away from Screen) */}
      {currentTask.type === 'physical_action' && (
        <div className="ak-card-3d my-6 p-6 rounded-3xl bg-[#E9FBF4] dark:bg-[#1E1B3A] border-2 border-[#36C995]/50 dark:border-[#36C995]/60 text-center">
          <div className="ak-sticker-badge w-16 h-16 rounded-3xl bg-white dark:bg-[#27234D] text-[#36C995] dark:text-[#6EE7B7] mx-auto flex items-center justify-center mb-4 shadow-sm border-2 border-[#36C995]/30">
            <Footprints size={34} />
          </div>
          <h4 className="ak-title-display text-lg font-black text-[#25233A] dark:text-white mb-2">
            Movimento Corporal Fora da Tela!
          </h4>
          <p className="text-xs sm:text-sm font-semibold text-[#25233A]/85 dark:text-[#D8D2F8] leading-relaxed max-w-md mx-auto mb-6">
            {currentTask.physicalInstruction || currentTask.prompt}
          </p>

          {!physicalDone && (
            <button
              type="button"
              onClick={handleFinishPhysical}
              className="px-6 py-3.5 rounded-2xl bg-[#36C995] hover:bg-[#2BB584] text-white font-black text-sm border-b-4 border-[#22986E] active:translate-y-0.5 transition-all inline-flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              <span>Concluí o Movimento!</span>
            </button>
          )}
        </div>
      )}

      {/* INTERACTION TYPE 7: Visual Math Counter */}
      {currentTask.type === 'visual_math' && currentTask.mathVisual && (() => {
        const mv = currentTask.mathVisual;
        const quickCandidates = Array.from(
          new Set([
            mv.targetAnswer,
            Math.max(0, mv.targetAnswer - 2),
            Math.max(0, mv.targetAnswer - 1),
            mv.targetAnswer + 1,
            mv.targetAnswer + 2
          ])
        )
          .sort((a, b) => a - b)
          .slice(0, 5);

        return (
          <div className="my-5 space-y-5">
            {/* Concrete visual counting groups */}
            <div className="ak-card-3d p-4 sm:p-5 rounded-3xl bg-[#F5F3FC] dark:bg-[#121024]/85 border-2 border-[#DDD6F3] dark:border-[#38316B] flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[230px] p-3 rounded-2xl bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B]">
                  {Array.from({ length: Math.min(mv.leftCount, 24) }).map((_, i) => (
                    <span key={`left_${i}`} className="text-2xl sm:text-3xl leading-none select-none">
                      {mv.emoji}
                    </span>
                  ))}
                </div>
                <span className="px-3 py-0.5 rounded-full bg-[#E9FBF4] dark:bg-[#133A2E] text-xs font-black text-[#115E43] dark:text-[#6EE7B7]">
                  {mv.leftCount} {mv.unitLabel || ''}
                </span>
              </div>

              {mv.operator !== '=' && (
                <div className="w-11 h-11 rounded-2xl bg-[#7047E8] text-white font-black text-2xl flex items-center justify-center shadow-sm border-b-4 border-[#522EC2] shrink-0">
                  {mv.operator}
                </div>
              )}

              {mv.operator !== '=' && typeof mv.rightCount === 'number' && (
                mv.operator === '×' ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="px-5 py-4 rounded-2xl bg-white dark:bg-[#1E1B3A] border-2 border-[#4389F5]/40 dark:border-[#38316B] font-display font-black text-2xl sm:text-3xl text-[#25233A] dark:text-white">
                      {mv.rightCount}
                    </div>
                    <span className="px-3 py-0.5 rounded-full bg-[#EEF5FF] dark:bg-[#27234D] text-xs font-black text-[#2B6ED9] dark:text-[#93C5FD]">
                      {mv.rightCount === 1 ? 'grupo igual' : 'grupos iguais'}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[230px] p-3 rounded-2xl bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B]">
                      {Array.from({ length: Math.min(mv.rightCount, 24) }).map((_, i) => (
                        <span
                          key={`right_${i}`}
                          className={`text-2xl sm:text-3xl leading-none select-none ${
                            mv.operator === '-' ? 'opacity-65' : ''
                          }`}
                        >
                          {mv.emoji}
                        </span>
                      ))}
                    </div>
                    <span className="px-3 py-0.5 rounded-full bg-[#EEF5FF] dark:bg-[#27234D] text-xs font-black text-[#2B6ED9] dark:text-[#93C5FD]">
                      {mv.rightCount} {mv.unitLabel || ''}
                    </span>
                  </div>
                )
              )}

              <div className="w-10 h-10 rounded-2xl bg-[#FFD34E] text-[#25233A] font-black text-xl flex items-center justify-center shadow-sm shrink-0">
                =
              </div>

              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#27234D] border-2 border-dashed border-[#7047E8] dark:border-[#8B68F7] flex items-center justify-center font-display font-black text-2xl text-[#25233A] dark:text-white">
                {isCorrect ? mv.targetAnswer : mathAnswerValue}
              </div>
            </div>

            {/* Interactive Stepper + Quick Choice Pills */}
            {!isCorrect && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    aria-label="Diminuir resposta"
                    onClick={() => {
                      audioService.playGentlePop();
                      setMathAnswerValue((v) => Math.max(0, v - 1));
                    }}
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-[#27234D] hover:bg-rose-50 dark:hover:bg-[#342E63] border-2 border-b-4 border-[#DDD6F3] dark:border-[#38316B] flex items-center justify-center text-[#25233A] dark:text-white font-black active:translate-y-0.5 transition-all"
                  >
                    <Minus size={20} />
                  </button>

                  <div className="min-w-[120px] px-5 py-3 rounded-2xl bg-[#F5F3FC] dark:bg-[#1E1B3A] border-2 border-[#DDD6F3] dark:border-[#38316B] text-center">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[#77758A] dark:text-[#C5BFE6]">
                      Sua Resposta
                    </span>
                    <span className="font-display text-3xl font-black text-[#25233A] dark:text-white">
                      {mathAnswerValue}
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-label="Aumentar resposta"
                    onClick={() => {
                      audioService.playGentlePop();
                      setMathAnswerValue((v) => v + 1);
                    }}
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-[#27234D] hover:bg-[#E9FBF4] dark:hover:bg-[#342E63] border-2 border-b-4 border-[#DDD6F3] dark:border-[#38316B] flex items-center justify-center text-[#25233A] dark:text-white font-black active:translate-y-0.5 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {quickCandidates.map((val) => {
                    const isPicked = mathAnswerValue === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          audioService.playGentlePop();
                          setMathAnswerValue(val);
                        }}
                        className={`min-w-[52px] px-4 py-2 rounded-2xl text-sm font-black border-2 border-b-4 transition-all ${
                          isPicked
                            ? 'bg-[#7047E8] text-white border-[#522EC2] scale-105'
                            : 'bg-white dark:bg-[#27234D] text-[#25233A] dark:text-[#E8E2FF] border-[#E4DFF5] dark:border-[#38316B] hover:bg-[#EDE9FE] dark:hover:bg-[#342E63]'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleCheckVisualMath}
                    className="px-7 py-3.5 rounded-2xl bg-[#36C995] hover:bg-[#2BB584] text-white font-black text-sm border-b-4 border-[#22986E] active:translate-y-0.5 transition-all inline-flex items-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    <span>Conferir Conta!</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* INTERACTION TYPE 8: Rhythm Echo Musical Pads */}
      {currentTask.type === 'rhythm_echo' && currentTask.rhythmNotes && (
        <div className="my-5 space-y-5">
          <div className="ak-card-3d p-4 sm:p-5 rounded-3xl bg-[#F5F3FC] dark:bg-[#121024]/85 border-2 border-[#DDD6F3] dark:border-[#5D49B3] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-[#7047E8] dark:text-[#D8B4FE]">
                <Music size={17} />
                <span>Ouça a sequência musical e repita na ordem certa!</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isPlayingDemo}
                  onClick={handlePlayRhythmDemo}
                  className="px-4 py-2.5 rounded-2xl bg-[#7047E8] hover:bg-[#5E35D9] disabled:opacity-60 text-white text-xs font-black border-b-4 border-[#522EC2] active:translate-y-0.5 transition-all inline-flex items-center gap-2"
                >
                  <Volume2 size={15} />
                  <span>{isPlayingDemo ? 'Tocando Melodia...' : 'Ouvir Melodia'}</span>
                </button>
                {!isCorrect && rhythmPlayedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetRhythm}
                    className="px-3 py-2 rounded-2xl bg-white dark:bg-[#27234D] text-[#25233A] dark:text-[#D8D2F8] text-xs font-black border-2 border-[#DDD6F3] dark:border-[#38316B] inline-flex items-center gap-1"
                  >
                    <RotateCcw size={13} />
                    <span>Reiniciar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Cue & Progress Dots (Accessible even muted) */}
            <div className="flex flex-wrap items-center justify-center gap-2 py-2">
              {(currentTask.rhythmTargetIds || []).map((targetId, stepIdx) => {
                const targetNote = currentTask.rhythmNotes?.find((n) => n.id === targetId);
                const isDone = stepIdx < rhythmPlayedIds.length;
                const isCurrentlyDemo = isPlayingDemo && rhythmActiveNoteId === targetId;

                return (
                  <div
                    key={`${targetId}_${stepIdx}`}
                    style={{
                      borderColor: targetNote?.color || '#7047E8',
                      backgroundColor: isDone || isCurrentlyDemo ? targetNote?.color : undefined
                    }}
                    className={`px-3 py-1.5 rounded-full border-2 text-xs font-black transition-all flex items-center gap-1.5 ${
                      isDone || isCurrentlyDemo
                        ? 'text-white scale-105 shadow-sm'
                        : 'bg-white dark:bg-[#27234D] text-[#25233A] dark:text-white'
                    }`}
                  >
                    <span>{stepIdx + 1}.</span>
                    <span>{targetNote?.label || targetId}</span>
                    {isDone && <CheckCircle2 size={12} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Musical Bell Pads */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentTask.rhythmNotes.map((note) => {
              const isHighlighted = rhythmActiveNoteId === note.id;
              return (
                <button
                  key={note.id}
                  type="button"
                  disabled={isPlayingDemo || !!isCorrect}
                  onClick={() => handleTapRhythmNote(note)}
                  style={{
                    backgroundColor: note.color,
                    boxShadow: isHighlighted
                      ? `0 0 0 4px rgba(255,255,255,0.85), 0 6px 18px ${note.color}`
                      : '0 5px 0 rgba(15, 23, 42, 0.25)'
                  }}
                  className={`py-5 px-4 rounded-3xl text-white font-display font-black text-base sm:text-lg border-2 border-white/40 transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isHighlighted ? 'scale-105 -translate-y-1 brightness-110' : 'hover:-translate-y-0.5 active:translate-y-1'
                  } disabled:opacity-80`}
                >
                  <Music size={22} />
                  <span>{note.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback & Progression Button */}
      {(isAnswerChecked || feedbackMsg) && (
        <div className="mt-6 pt-5 border-t-2 border-[#E4DFF5] dark:border-[#38316B] animate-fadeIn">
          <div
            className={`p-4 rounded-2xl mb-4 text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
              isCorrect
                ? 'bg-[#E9FBF4] dark:bg-[#133A2E] text-[#115E43] dark:text-[#A7F3D0] border-2 border-[#36C995]/50 dark:border-[#36C995]'
                : 'bg-[#FFF9E6] dark:bg-[#27234D] text-[#8A5A00] dark:text-[#FFD34E] border-2 border-[#FFD34E] dark:border-[#FFD34E]/60'
            }`}
          >
            {isCorrect ? (
              <Sparkles size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle size={20} className="shrink-0 text-amber-600 dark:text-amber-400" />
            )}
            <span>{feedbackMsg}</span>
          </div>

          {isCorrect && currentTaskIndex === taskList.length - 1 && activity.offlineSuggestion && (
            <div className="p-4 rounded-2xl bg-[#FFF9E6] dark:bg-[#27234D] border-2 border-[#FFD34E] dark:border-[#FFD34E]/60 text-xs text-[#25233A] dark:text-[#FFD34E] mb-4">
              <span className="font-black block mb-1">Brincadeira em Família (Fora da Tela):</span>
              <span className="font-semibold text-[#77758A] dark:text-[#D8D2F8]">{activity.offlineSuggestion}</span>
            </div>
          )}

          {isCorrect ? (
            <button
              type="button"
              onClick={handleAdvanceOrComplete}
              className="w-full py-4 rounded-[18px] bg-[#36C995] hover:bg-[#2EB887] text-white font-extrabold text-base border-b-4 border-[#239B71] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>
                {currentTaskIndex < taskList.length - 1
                  ? `Próxima Tarefa (${currentTaskIndex + 2} de ${taskList.length})`
                  : 'Concluir Atividade e Ganhar Estrelas'}
              </span>
              <ArrowRight size={18} />
            </button>
          ) : (
            currentTask.type !== 'sequence' && (
              <button
                type="button"
                onClick={() => {
                  setIsAnswerChecked(false);
                  setSelectedOptionId(null);
                  setIsCorrect(null);
                  setFeedbackMsg('');
                  if (currentTask.type === 'word_build') handleResetWord();
                  if (currentTask.type === 'rhythm_echo') handleResetRhythm();
                }}
                className="w-full py-3.5 rounded-[18px] border-2 border-b-4 border-[#E4DFF5] dark:border-[#38316B] bg-[#F5F3FC] dark:bg-[#27234D] text-[#25233A] dark:text-white font-extrabold text-sm hover:border-[#7047E8] flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw size={16} />
                <span>Tentar Novamente</span>
              </button>
            )
          )}
        </div>
      )}

      {/* Celebratory Victory Modal on Final Task */}
      <VictoryCelebrationModal
        isOpen={victoryOpen}
        title="Atividade Concluída!"
        subtitle={`Você completou todas as tarefas de "${activity.title}" com o Guardião ${companion.name}!`}
        starsEarned={earnedStars}
        score={finalAverageScore}
        durationSeconds={elapsedSeconds}
        characterId={activeChild?.avatar}
        characterName={activeChild?.name || companion.name}
        replayLabel="Fazer de Novo"
        continueLabel="Continuar Aventura"
        onReplay={() => {
          setVictoryOpen(false);
          setCurrentTaskIndex(0);
          setAccumulatedScore(0);
          startTimeRef.current = Date.now();
          resetTaskState(taskList[0]);
        }}
        onContinue={() => {
          setVictoryOpen(false);
          onComplete(finalAverageScore);
        }}
      />
    </div>
  );
};
