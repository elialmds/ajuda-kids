import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Eraser,
  Expand,
  FolderHeart,
  Image as ImageIcon,
  Minimize2,
  Palette,
  Pencil,
  Redo2,
  Sparkles,
  SprayCan,
  Stamp,
  Trash2,
  Undo2,
  Wand2,
  X
} from 'lucide-react';
import { useApp } from '@/modules/context/AppContext';
import { storageService } from '@/services/storageService';
import { progressionService } from '@/services/progressionService';
import { audioService } from '@/services/audioService';
import {
  analyzeDrawingCanvas,
  DrawingRecognitionResult,
  DrawingStroke,
  Point2D
} from '@/utils/drawingHeuristicRecognizer';
import { SavedDrawing } from '@/types';
import { AtelierBrushSvg, CreativitySvgIcon, StarSymbolSvg } from '@/components/illustrations/CustomIcons';

export interface AtelierPrompt {
  id: string;
  title: string;
  subtitle: string;
  hintKey: string;
  suggestedColor: string;
  guideLabel: string;
  previewShape: 'sun' | 'house' | 'rainbow' | 'flower' | 'rocket' | 'butterfly' | 'fish' | 'tree' | 'cat' | 'robot' | 'mountains' | 'heart';
}

export const ATELIER_PROMPTS: AtelierPrompt[] = [
  {
    id: 'sol',
    title: 'Sol Radiante',
    subtitle: 'Um círculo dourado com raios bem quentinhos!',
    hintKey: 'sol',
    suggestedColor: '#FACC15',
    guideLabel: 'Desenhe um círculo no centro e vários raios em volta',
    previewShape: 'sun'
  },
  {
    id: 'casa',
    title: 'Casinha Feliz',
    subtitle: 'Paredes aconchegantes, telhado e porta!',
    hintKey: 'casa',
    suggestedColor: '#EF4444',
    guideLabel: 'Monte um quadrado com um triângulo em cima como telhado',
    previewShape: 'house'
  },
  {
    id: 'arco_iris',
    title: 'Arco-Íris Mágico',
    subtitle: 'Misture várias cores formando arcos no céu!',
    hintKey: 'arco-iris',
    suggestedColor: '#EC4899',
    guideLabel: 'Faça arcos coloridos um em cima do outro usando 4 ou mais cores',
    previewShape: 'rainbow'
  },
  {
    id: 'flor',
    title: 'Flor no Jardim',
    subtitle: 'Pétalas coloridas com cabinho e folhas verdes!',
    hintKey: 'flor',
    suggestedColor: '#10B981',
    guideLabel: 'Faça o miolo, pétalas em volta e um cabinho verde embaixo',
    previewShape: 'flower'
  },
  {
    id: 'foguete',
    title: 'Foguetinho Espacial',
    subtitle: 'Pronto para viajar até as estrelas!',
    hintKey: 'foguete',
    suggestedColor: '#3B82F6',
    guideLabel: 'Desenhe um corpo comprido apontando para cima com chama colorida embaixo',
    previewShape: 'rocket'
  },
  {
    id: 'borboleta',
    title: 'Borboleta Colorida',
    subtitle: 'Duas asas grandes e simétricas!',
    hintKey: 'borboleta',
    suggestedColor: '#8B5CF6',
    guideLabel: 'Desenhe um corpinho no meio e asas iguais dos dois lados',
    previewShape: 'butterfly'
  },
  {
    id: 'peixe',
    title: 'Peixinho no Mar',
    subtitle: 'Nadando feliz nas águas azuis!',
    hintKey: 'peixe',
    suggestedColor: '#38BDF8',
    guideLabel: 'Faça o corpo arredondado, cauda de triângulo e bolhinhas azuis',
    previewShape: 'fish'
  },
  {
    id: 'arvore',
    title: 'Árvore Mágica',
    subtitle: 'Tronco firme e copa cheia de folhas verdes!',
    hintKey: 'arvore',
    suggestedColor: '#22C55E',
    guideLabel: 'Um tronco marrom embaixo e uma nuvem verde grande em cima',
    previewShape: 'tree'
  },
  {
    id: 'gatinho',
    title: 'Gatinho Amigo',
    subtitle: 'Orelhinhas pontudas, bigodes e sorriso fofo!',
    hintKey: 'gato',
    suggestedColor: '#F97316',
    guideLabel: 'Faça uma carinha redonda com duas orelhas pontudas no alto',
    previewShape: 'cat'
  },
  {
    id: 'robo',
    title: 'Robô Divertido',
    subtitle: 'Cabeça quadrada, anteninha e botões!',
    hintKey: 'robo',
    suggestedColor: '#3B82F6',
    guideLabel: 'Use quadrados para a cabeça e o corpo e desenhe uma antena',
    previewShape: 'robot'
  },
  {
    id: 'montanhas',
    title: 'Montanhas ao Amanhecer',
    subtitle: 'Picos altos com sol nascendo atrás!',
    hintKey: 'montanha',
    suggestedColor: '#10B981',
    guideLabel: 'Trace picos triangulares largos na parte de baixo e um sol em cima',
    previewShape: 'mountains'
  },
  {
    id: 'coracao',
    title: 'Coração Brilhante',
    subtitle: 'Cheio de carinho e cores vibrantes!',
    hintKey: 'coracao',
    suggestedColor: '#EF4444',
    guideLabel: 'Desenhe um coração grande no centro e enfeite com estrelinhas',
    previewShape: 'heart'
  }
];

const PALETTE_COLORS = [
  { hex: '#1E293B', name: 'Preto Noite' },
  { hex: '#EF4444', name: 'Vermelho Morango' },
  { hex: '#F97316', name: 'Laranja Tangerina' },
  { hex: '#FACC15', name: 'Amarelo Sol' },
  { hex: '#22C55E', name: 'Verde Folha' },
  { hex: '#10B981', name: 'Verde Menta' },
  { hex: '#38BDF8', name: 'Azul Céu' },
  { hex: '#3B82F6', name: 'Azul Oceano' },
  { hex: '#8B5CF6', name: 'Roxo Mágico' },
  { hex: '#EC4899', name: 'Rosa Chiclete' },
  { hex: '#A16207', name: 'Marrom Terra' },
  { hex: '#FFFFFF', name: 'Branco Nuvem' }
];

const BRUSH_WIDTHS = [
  { value: 4, label: 'Fino' },
  { value: 9, label: 'Médio' },
  { value: 16, label: 'Grosso' },
  { value: 26, label: 'Gigante' }
];

type ShapeKind = NonNullable<DrawingStroke['shapeKind']>;

const SHAPE_OPTIONS: { id: ShapeKind; label: string }[] = [
  { id: 'circle', label: 'Círculo' },
  { id: 'square', label: 'Quadrado' },
  { id: 'triangle', label: 'Triângulo' },
  { id: 'star', label: 'Estrela' },
  { id: 'heart', label: 'Coração' },
  { id: 'sun', label: 'Sol' },
  { id: 'cloud', label: 'Nuvem' },
  { id: 'flower', label: 'Flor' }
];

function PromptMiniIcon({ shape, color }: { shape: AtelierPrompt['previewShape']; color: string }) {
  return (
    <svg viewBox="0 0 64 64" className="w-11 h-11 shrink-0" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#FFFFFF" stroke="#E4DFF5" strokeWidth="2.5" />
      {shape === 'sun' && (
        <g stroke={color} strokeWidth="3.5" strokeLinecap="round">
          <circle cx="32" cy="32" r="11" fill="#FDE047" />
          <line x1="32" y1="11" x2="32" y2="16" />
          <line x1="32" y1="48" x2="32" y2="53" />
          <line x1="11" y1="32" x2="16" y2="32" />
          <line x1="48" y1="32" x2="53" y2="32" />
          <line x1="17" y1="17" x2="21" y2="21" />
          <line x1="43" y1="43" x2="47" y2="47" />
          <line x1="47" y1="17" x2="43" y2="21" />
          <line x1="21" y1="43" x2="17" y2="47" />
        </g>
      )}
      {shape === 'house' && (
        <g>
          <polygon points="14,31 32,14 50,31" fill={color} stroke="#1E293B" strokeWidth="2" strokeLinejoin="round" />
          <rect x="18" y="31" width="28" height="19" rx="3" fill="#FEF3C7" stroke="#1E293B" strokeWidth="2" />
          <rect x="28" y="38" width="8" height="12" rx="2" fill="#92400E" />
        </g>
      )}
      {shape === 'rainbow' && (
        <g fill="none" strokeWidth="4" strokeLinecap="round">
          <path d="M14 44 A18 18 0 0 1 50 44" stroke="#EF4444" />
          <path d="M19 44 A13 13 0 0 1 45 44" stroke="#FACC15" />
          <path d="M24 44 A8 8 0 0 1 40 44" stroke="#38BDF8" />
        </g>
      )}
      {shape === 'flower' && (
        <g>
          <line x1="32" y1="32" x2="32" y2="52" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="24" cy="24" r="6" fill="#F472B6" />
          <circle cx="40" cy="24" r="6" fill="#F472B6" />
          <circle cx="24" cy="34" r="6" fill="#F472B6" />
          <circle cx="40" cy="34" r="6" fill="#F472B6" />
          <circle cx="32" cy="29" r="6.5" fill="#FACC15" />
        </g>
      )}
      {shape === 'rocket' && (
        <g>
          <path d="M32 13 C39 21 40 34 38 42 L26 42 C24 34 25 21 32 13 Z" fill="#60A5FA" stroke="#1E293B" strokeWidth="2" />
          <circle cx="32" cy="28" r="4" fill="#FEF08A" />
          <polygon points="27,42 37,42 32,52" fill="#F97316" />
        </g>
      )}
      {shape === 'butterfly' && (
        <g>
          <ellipse cx="22" cy="26" rx="9" ry="7" fill="#C084FC" />
          <ellipse cx="42" cy="26" rx="9" ry="7" fill="#C084FC" />
          <ellipse cx="23" cy="39" rx="7" ry="6" fill="#F472B6" />
          <ellipse cx="41" cy="39" rx="7" ry="6" fill="#F472B6" />
          <rect x="30" y="20" width="4" height="26" rx="2" fill="#334155" />
        </g>
      )}
      {shape === 'fish' && (
        <g>
          <polygon points="44,32 54,23 54,41" fill="#0284C7" />
          <ellipse cx="30" cy="32" rx="15" ry="10" fill={color} />
          <circle cx="22" cy="30" r="2.2" fill="#0F172A" />
        </g>
      )}
      {shape === 'tree' && (
        <g>
          <rect x="28" y="34" width="8" height="17" rx="2" fill="#92400E" />
          <circle cx="32" cy="25" r="12" fill={color} />
          <circle cx="24" cy="29" r="8" fill="#16A34A" />
          <circle cx="40" cy="29" r="8" fill="#16A34A" />
        </g>
      )}
      {shape === 'cat' && (
        <g>
          <polygon points="18,26 21,15 29,22" fill={color} />
          <polygon points="46,26 43,15 35,22" fill={color} />
          <circle cx="32" cy="34" r="14" fill="#FDBA74" />
          <circle cx="27" cy="32" r="2.2" fill="#1E293B" />
          <circle cx="37" cy="32" r="2.2" fill="#1E293B" />
          <polygon points="30,36 34,36 32,39" fill="#EC4899" />
        </g>
      )}
      {shape === 'robot' && (
        <g>
          <line x1="32" y1="12" x2="32" y2="19" stroke="#475569" strokeWidth="3" />
          <circle cx="32" cy="11" r="3" fill="#EF4444" />
          <rect x="19" y="19" width="26" height="22" rx="5" fill="#93C5FD" stroke="#1E293B" strokeWidth="2" />
          <circle cx="26" cy="28" r="2.8" fill="#1E293B" />
          <circle cx="38" cy="28" r="2.8" fill="#1E293B" />
          <rect x="26" y="34" width="12" height="3.5" rx="1.5" fill="#1E293B" />
        </g>
      )}
      {shape === 'mountains' && (
        <g>
          <circle cx="45" cy="20" r="6" fill="#FACC15" />
          <polygon points="12,48 27,22 42,48" fill="#10B981" />
          <polygon points="27,48 41,26 53,48" fill="#059669" />
        </g>
      )}
      {shape === 'heart' && (
        <path
          d="M32 49 C20 40 13 31 13 23 C13 17 18 13 23.5 13 C27.5 13 30.5 15.2 32 18 C33.5 15.2 36.5 13 40.5 13 C46 13 51 17 51 23 C51 31 44 40 32 49 Z"
          fill={color}
        />
      )}
    </svg>
  );
}

function drawShapeStamp(
  ctx: CanvasRenderingContext2D,
  shape: ShapeKind,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(3, size * 0.14);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const r = size * 1.45;

  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  } else if (shape === 'square') {
    ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);
  } else if (shape === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy + r * 0.85);
    ctx.lineTo(cx - r, cy + r * 0.85);
    ctx.closePath();
    ctx.stroke();
  } else if (shape === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? r : r * 0.45;
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  } else if (shape === 'heart') {
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.8);
    ctx.bezierCurveTo(cx - r * 1.3, cy + r * 0.05, cx - r * 0.9, cy - r * 0.95, cx, cy - r * 0.3);
    ctx.bezierCurveTo(cx + r * 0.9, cy - r * 0.95, cx + r * 1.3, cy + r * 0.05, cx, cy + r * 0.8);
    ctx.closePath();
    ctx.fill();
  } else if (shape === 'sun') {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * (r * 0.72), cy + Math.sin(angle) * (r * 0.72));
      ctx.lineTo(cx + Math.cos(angle) * (r * 1.05), cy + Math.sin(angle) * (r * 1.05));
      ctx.stroke();
    }
  } else if (shape === 'cloud') {
    ctx.beginPath();
    ctx.arc(cx - r * 0.45, cy + r * 0.1, r * 0.48, 0, Math.PI * 2);
    ctx.arc(cx, cy - r * 0.12, r * 0.58, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.48, cy + r * 0.1, r * 0.46, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'flower') {
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * (r * 0.55), cy + Math.sin(angle) * (r * 0.55), r * 0.36, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function renderStrokeOnCanvas(ctx: CanvasRenderingContext2D, stroke: DrawingStroke) {
  if (stroke.points.length === 0) return;
  if (stroke.tool === 'shape' && stroke.shapeKind) {
    const p = stroke.points[0];
    drawShapeStamp(ctx, stroke.shapeKind, p.x, p.y, stroke.width * 1.8, stroke.color);
    return;
  }

  ctx.save();
  const isEraser = stroke.tool === 'eraser';
  ctx.strokeStyle = isEraser ? '#FFFDF8' : stroke.color;
  ctx.fillStyle = isEraser ? '#FFFDF8' : stroke.color;
  ctx.lineWidth = isEraser ? stroke.width * 1.6 : stroke.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (stroke.tool === 'pencil') {
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = Math.max(2, stroke.width * 0.65);
  } else if (stroke.tool === 'marker') {
    ctx.globalAlpha = 0.72;
    ctx.lineWidth = stroke.width * 1.25;
  } else if (stroke.tool === 'crayon') {
    ctx.globalAlpha = 0.62;
  }

  if (stroke.tool === 'spray') {
    // Deterministic seeded spray around each sampled point so undo/redo is identical
    let seed = stroke.points.length * 37 + Math.round(stroke.points[0].x * 13);
    const nextRand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const radius = stroke.width * 1.6;
    for (const pt of stroke.points) {
      for (let d = 0; d < 10; d++) {
        const ang = nextRand() * Math.PI * 2;
        const dist = nextRand() * radius;
        const dotX = pt.x + Math.cos(ang) * dist;
        const dotY = pt.y + Math.sin(ang) * dist;
        ctx.fillRect(dotX, dotY, 2.2, 2.2);
      }
    }
    ctx.restore();
    return;
  }

  if (stroke.points.length === 1) {
    ctx.beginPath();
    ctx.arc(stroke.points[0].x, stroke.points[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }

  ctx.restore();
}

export interface CreativeAtelierProps {
  initialPrompt?: string;
  embeddedMode?: boolean;
  onCompleteActivity?: (score: number, dataUrl?: string) => void;
  onClose?: () => void;
}

export const CreativeAtelierView: React.FC<CreativeAtelierProps> = ({
  initialPrompt,
  embeddedMode = false,
  onCompleteActivity,
  onClose
}) => {
  const { activeChild, showToast, syncNow, refreshProgression } = useApp();

  const initialMatch = useMemo(
    () =>
      initialPrompt
        ? ATELIER_PROMPTS.find(
            (p) =>
              p.id === initialPrompt ||
              p.title.toLowerCase().includes(initialPrompt.toLowerCase()) ||
              p.hintKey.toLowerCase() === initialPrompt.toLowerCase()
          ) || null
        : ATELIER_PROMPTS[0],
    [initialPrompt]
  );

  const [studioTab, setStudioTab] = useState<'prompts' | 'free_draw' | 'gallery'>(
    initialPrompt ? 'prompts' : 'prompts'
  );
  const [activePrompt, setActivePrompt] = useState<AtelierPrompt | null>(initialMatch);

  // Canvas & tool state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeStrokeRef = useRef<DrawingStroke | null>(null);
  const isDrawingRef = useRef(false);

  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingStroke[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(initialMatch?.suggestedColor || '#FACC15');
  const [selectedWidth, setSelectedWidth] = useState<number>(9);
  const [selectedTool, setSelectedTool] = useState<DrawingStroke['tool']>('crayon');
  const [selectedShape, setSelectedShape] = useState<ShapeKind>('star');
  const [showGuideOverlay, setShowGuideOverlay] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Heuristic discovery + naming state
  const [recognition, setRecognition] = useState<DrawingRecognitionResult | null>(null);
  const [drawingTitle, setDrawingTitle] = useState<string>(initialMatch?.title || 'Minha Obra Criativa');
  const [childExplanation, setChildExplanation] = useState<string>('');
  const [showExplanationBox, setShowExplanationBox] = useState<boolean>(false);
  const [isSavedBanner, setIsSavedBanner] = useState<boolean>(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState<boolean>(false);
  const [editingDrawingId, setEditingDrawingId] = useState<string | null>(null);
  const [baseBackgroundDataUrl, setBaseBackgroundDataUrl] = useState<string | null>(null);

  // Gallery state
  const [savedGallery, setSavedGallery] = useState<SavedDrawing[]>([]);
  const [previewGalleryItem, setPreviewGalleryItem] = useState<SavedDrawing | null>(null);

  const childId = activeChild?.id || 'guest_child';

  const reloadGallery = useCallback(() => {
    setSavedGallery(storageService.getSavedDrawings(childId));
  }, [childId]);

  useEffect(() => {
    reloadGallery();
  }, [reloadGallery]);

  const redrawCanvas = useCallback(
    (strokeList: DrawingStroke[], bgDataUrl: string | null = baseBackgroundDataUrl) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const drawStrokesAndFinish = () => {
        for (const s of strokeList) {
          renderStrokeOnCanvas(ctx, s);
        }
      };

      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (bgDataUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          drawStrokesAndFinish();
        };
        img.src = bgDataUrl;
      } else {
        drawStrokesAndFinish();
      }
    },
    [baseBackgroundDataUrl]
  );

  useEffect(() => {
    redrawCanvas(strokes);
  }, [strokes, redrawCanvas, studioTab, isFullscreen]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point2D => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(e);

    if (selectedTool === 'shape') {
      const newShapeStroke: DrawingStroke = {
        points: [point],
        color: selectedColor,
        width: selectedWidth,
        tool: 'shape',
        shapeKind: selectedShape
      };
      setStrokes((prev) => [...prev, newShapeStroke]);
      setRedoStack([]);
      setIsSavedBanner(false);
      audioService.playGentlePop();
      return;
    }

    isDrawingRef.current = true;
    const stroke: DrawingStroke = {
      points: [point],
      color: selectedColor,
      width: selectedWidth,
      tool: selectedTool
    };
    activeStrokeRef.current = stroke;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      renderStrokeOnCanvas(ctx, stroke);
    }
    setIsSavedBanner(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getCanvasPoint(e);
    const prevPoints = activeStrokeRef.current.points;
    const last = prevPoints[prevPoints.length - 1];
    if (last && Math.hypot(point.x - last.x, point.y - last.y) < 1.5) return;

    activeStrokeRef.current.points.push(point);

    // Draw incremental segment cleanly
    const segment: DrawingStroke = {
      ...activeStrokeRef.current,
      points: last ? [last, point] : [point]
    };
    renderStrokeOnCanvas(ctx, segment);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    isDrawingRef.current = false;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if already released
    }
    const completed = activeStrokeRef.current;
    activeStrokeRef.current = null;
    if (completed.points.length > 0) {
      setStrokes((prev) => [...prev, completed]);
      setRedoStack([]);
    }
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    audioService.playGentlePop();
    const last = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
    setIsSavedBanner(false);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    audioService.playGentlePop();
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setStrokes((prev) => [...prev, next]);
    setIsSavedBanner(false);
  };

  const handleClearCanvas = () => {
    audioService.playGentlePop();
    setStrokes([]);
    setRedoStack([]);
    setBaseBackgroundDataUrl(null);
    setRecognition(null);
    setIsSavedBanner(false);
  };

  const handleSelectPrompt = (prompt: AtelierPrompt) => {
    audioService.playGentlePop();
    setStudioTab('prompts');
    setActivePrompt(prompt);
    setDrawingTitle(prompt.title);
    setSelectedColor(prompt.suggestedColor);
    setShowGuideOverlay(true);
    setRecognition(null);
  };

  const handleDiscoverDrawing = () => {
    if (strokes.length === 0 && !baseBackgroundDataUrl) {
      showToast('Faça alguns tracinhos no papel primeiro para eu tentar adivinhar!');
      return;
    }
    const result = analyzeDrawingCanvas(
      canvasRef.current,
      strokes,
      studioTab === 'prompts' ? activePrompt?.hintKey : undefined
    );
    setRecognition(result);
    audioService.playSuccess();
    audioService.speak(result.summaryFeedback);
  };

  const handleSaveDrawing = async () => {
    if (strokes.length === 0 && !baseBackgroundDataUrl) {
      showToast('Desenhe algo lindo na tela antes de salvar na galeria!');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const nowIso = new Date().toISOString();

    const item: SavedDrawing = {
      id: editingDrawingId || `draw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      childId,
      familyId: activeChild?.familyId,
      title: drawingTitle.trim() || activePrompt?.title || 'Obra Livre',
      promptUsed: studioTab === 'prompts' ? activePrompt?.title : 'Desenho Livre',
      recognitionGuess: recognition?.bestGuess.label,
      childExplanation: childExplanation.trim() || undefined,
      dataUrl,
      strokesJson: JSON.stringify(strokes),
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const updated = await storageService.saveDrawing(item);
    setSavedGallery(updated);
    setIsSavedBanner(true);
    setEditingDrawingId(item.id);
    const xpOutcome = activeChild
      ? await progressionService.recordDrawingXp(activeChild.id, item.id, item.title)
      : null;
    if (xpOutcome) {
      await refreshProgression();
    }
    const xpNote = xpOutcome && xpOutcome.xpAdded > 0 ? ` (+${xpOutcome.xpAdded} XP)` : '';
    const unlocked = xpOutcome?.newlyUnlockedAchievements;
    const badgeNote = unlocked && unlocked.length > 0 ? ` • Nova medalha: ${unlocked[0].title}!` : '';
    audioService.playFanfare();
    showToast(`Desenho salvo com carinho na sua Galeria!${xpNote}${badgeNote}`);
    await syncNow().catch(() => {});

    if (embeddedMode && onCompleteActivity) {
      onCompleteActivity(100, dataUrl);
    }
  };

  const handleDiscardConfirmed = () => {
    setConfirmDiscardOpen(false);
    handleClearCanvas();
    setChildExplanation('');
    setShowExplanationBox(false);
    setEditingDrawingId(null);
    if (embeddedMode && onClose) {
      onClose();
    } else if (onClose) {
      onClose();
    } else {
      showToast('Tela limpa! Pode começar uma nova arte quando quiser.');
    }
  };

  const handleReopenSavedDrawing = (drawing: SavedDrawing) => {
    audioService.playGentlePop();
    setEditingDrawingId(drawing.id);
    setDrawingTitle(drawing.title);
    setChildExplanation(drawing.childExplanation || '');
    setShowExplanationBox(Boolean(drawing.childExplanation));
    setRecognition(null);
    setIsSavedBanner(false);

    if (drawing.strokesJson) {
      try {
        const parsed = JSON.parse(drawing.strokesJson) as DrawingStroke[];
        setBaseBackgroundDataUrl(null);
        setStrokes(parsed);
        setRedoStack([]);
      } catch {
        setBaseBackgroundDataUrl(drawing.dataUrl);
        setStrokes([]);
      }
    } else {
      setBaseBackgroundDataUrl(drawing.dataUrl);
      setStrokes([]);
    }
    setStudioTab('free_draw');
  };

  const handleDeleteSavedDrawing = async (id: string) => {
    const updated = await storageService.deleteDrawing(id, childId);
    setSavedGallery(updated);
    if (previewGalleryItem?.id === id) setPreviewGalleryItem(null);
    showToast('Desenho removido da galeria.');
    await syncNow().catch(() => {});
  };

  const toolButtons: { id: DrawingStroke['tool']; label: string; icon: React.ReactNode }[] = [
    { id: 'crayon', label: 'Giz', icon: <Palette className="w-4 h-4" /> },
    { id: 'pencil', label: 'Lápis', icon: <Pencil className="w-4 h-4" /> },
    { id: 'marker', label: 'Caneta', icon: <AtelierBrushSvg className="w-4 h-4" /> },
    { id: 'spray', label: 'Spray', icon: <SprayCan className="w-4 h-4" /> },
    { id: 'shape', label: 'Formas', icon: <Stamp className="w-4 h-4" /> },
    { id: 'eraser', label: 'Borracha', icon: <Eraser className="w-4 h-4" /> }
  ];

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#F5F3FC] dark:bg-[#121024] p-3 sm:p-5 overflow-y-auto'
          : 'w-full'
      } space-y-5 font-rounded`}
    >
      {/* Studio Top Bar & Mode Switcher */}
      <div className="ak-card-3d bg-white dark:bg-[#1E1B3A]/95 border-2 border-[#E4DFF5] dark:border-[#38316B] border-b-4 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="ak-sticker-badge w-12 h-12 p-1.5 rounded-2xl bg-[#FFF0F6] dark:bg-[#27234D] border-2 border-[#F16E9A]/40 dark:border-[#F16E9A]/50 flex items-center justify-center shrink-0">
            <CreativitySvgIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">
              Ateliê Criativo
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-[#CBD5E1]">
              {studioTab === 'prompts' && activePrompt
                ? `Desafio: ${activePrompt.title}`
                : studioTab === 'free_draw'
                ? 'Folha livre para inventar o que imaginar'
                : `${savedGallery.length} ${savedGallery.length === 1 ? 'obra guardada' : 'obras guardadas'}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              audioService.playGentlePop();
              setStudioTab('prompts');
              if (!activePrompt) setActivePrompt(ATELIER_PROMPTS[0]);
            }}
            className={`px-4 py-2 rounded-2xl text-sm font-extrabold border-2 border-b-4 transition-all ${
              studioTab === 'prompts'
                ? 'bg-[#F16E9A] text-white border-[#D64B7B] shadow-sm'
                : 'bg-[#F5F3FC] dark:bg-[#27234D] text-[#25233A] dark:text-[#F8FAFC] border-[#E4DFF5] dark:border-[#38316B] hover:bg-[#FFF0F6] dark:hover:bg-[#342E63]'
            }`}
          >
            Desafios com Guia
          </button>
          <button
            type="button"
            onClick={() => {
              audioService.playGentlePop();
              setStudioTab('free_draw');
              setShowGuideOverlay(false);
              setDrawingTitle('Desenho Livre');
            }}
            className={`px-4 py-2 rounded-2xl text-sm font-extrabold border-2 border-b-4 transition-all ${
              studioTab === 'free_draw'
                ? 'bg-[#4389F5] text-white border-[#2B6ED9] shadow-sm'
                : 'bg-[#F5F3FC] dark:bg-[#27234D] text-[#25233A] dark:text-[#F8FAFC] border-[#E4DFF5] dark:border-[#38316B] hover:bg-[#EEF5FF] dark:hover:bg-[#342E63]'
            }`}
          >
            Desenho Livre
          </button>
          <button
            type="button"
            onClick={() => {
              audioService.playGentlePop();
              reloadGallery();
              setStudioTab('gallery');
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-extrabold border-2 border-b-4 transition-all ${
              studioTab === 'gallery'
                ? 'bg-[#FF9B42] text-white border-[#E07C22] shadow-sm'
                : 'bg-[#F5F3FC] dark:bg-[#27234D] text-[#25233A] dark:text-[#F8FAFC] border-[#E4DFF5] dark:border-[#38316B] hover:bg-[#FFF8EB] dark:hover:bg-[#342E63]'
            }`}
          >
            <FolderHeart className="w-4 h-4" />
            Galeria ({savedGallery.length})
          </button>
          {onClose && (
            <button
              type="button"
              onClick={() => {
                if (strokes.length > 0 && !isSavedBanner) {
                  setConfirmDiscardOpen(true);
                } else {
                  onClose();
                }
              }}
              className="p-2.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#E4DFF5] dark:border-[#38316B] text-[#77758A] dark:text-[#D8D2F8] hover:text-[#25233A] dark:hover:text-white hover:bg-[#EDE9FE] dark:hover:bg-[#342E63]"
              aria-label="Fechar Ateliê"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* GALLERY TAB */}
      {studioTab === 'gallery' ? (
        <div className="ak-card-3d bg-white dark:bg-[#1E1B3A]/95 border-2 border-[#E4DFF5] dark:border-[#38316B] border-b-4 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="ak-title-display text-lg font-extrabold text-[#25233A] dark:text-white">Minha Galeria de Artes</h3>
              <p className="text-sm font-medium text-[#77758A] dark:text-[#C5BFE6]">
                Toque em um quadro para admirar, continuar desenhando ou baixar!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingDrawingId(null);
                setBaseBackgroundDataUrl(null);
                setStrokes([]);
                setStudioTab('free_draw');
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#36C995] hover:bg-[#2BB584] text-white font-extrabold text-sm border-b-4 border-[#22986E] transition-all"
            >
              + Novo Desenho Livre
            </button>
          </div>

          {savedGallery.length === 0 ? (
            <div className="text-center py-12 bg-[#F5F3FC] dark:bg-[#27234D] rounded-3xl border-2 border-dashed border-[#D8CFF5] dark:border-[#38316B]">
              <ImageIcon className="w-12 h-12 text-[#B8B0DC] dark:text-[#7F76B8] mx-auto mb-3" />
              <p className="font-extrabold text-[#25233A] dark:text-white text-lg">Sua galeria ainda está esperando a primeira obra!</p>
              <p className="text-sm text-[#77758A] dark:text-[#C5BFE6] mt-1 mb-4">
                Escolha um desafio ou solte a imaginação no Desenho Livre e clique em SALVAR DESENHO.
              </p>
              <button
                type="button"
                onClick={() => setStudioTab('prompts')}
                className="px-5 py-2.5 rounded-2xl bg-[#7047E8] hover:bg-[#5E35D9] text-white font-extrabold text-sm border-b-4 border-[#522EC2]"
              >
                Escolher um Desafio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedGallery.map((item) => (
                <div
                  key={item.id}
                  className="ak-card-3d bg-white dark:bg-[#27234D] rounded-3xl border-2 border-[#E4DFF5] dark:border-[#38316B] border-b-4 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewGalleryItem(item)}
                    className="aspect-[4/3] w-full bg-[#FFFDF8] overflow-hidden border-b-2 border-[#EDE9FE] dark:border-[#38316B] relative group"
                  >
                    <img
                      src={item.dataUrl}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform"
                    />
                  </button>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-[#25233A] dark:text-white truncate">{item.title}</h4>
                        <StarSymbolSvg className="w-5 h-5 shrink-0" />
                      </div>
                      {item.recognitionGuess && (
                        <p className="text-xs font-bold text-[#F16E9A] dark:text-[#F9A8D4] mt-0.5">
                          Adivinhamos: {item.recognitionGuess}
                        </p>
                      )}
                      {item.childExplanation && (
                        <p className="text-xs text-[#77758A] dark:text-[#C5BFE6] italic mt-1 line-clamp-2">
                          “{item.childExplanation}”
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-[#EDE9FE] dark:border-[#38316B]">
                      <button
                        type="button"
                        onClick={() => handleReopenSavedDrawing(item)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#EEF5FF] dark:bg-[#1E1B3A] hover:bg-[#DCEBFF] dark:hover:bg-[#342E63] text-[#2B6ED9] dark:text-[#7DD3FC] font-extrabold text-xs border border-[#C6DDFC] dark:border-[#494285]"
                      >
                        Editar Obra
                      </button>
                      <a
                        href={item.dataUrl}
                        download={`${item.title.replace(/\s+/g, '_').toLowerCase()}.png`}
                        className="p-2 rounded-xl bg-[#F5F3FC] dark:bg-[#1E1B3A] hover:bg-[#EDE9FE] dark:hover:bg-[#342E63] text-[#77758A] dark:text-[#D8D2F8] border border-[#E4DFF5] dark:border-[#38316B]"
                        title="Baixar PNG"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedDrawing(item.id)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/70 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-700/60"
                        title="Excluir desenho"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* STUDIO CANVAS WORKSPACE */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Guided Prompts Carousel (only in 'prompts' tab) */}
          {studioTab === 'prompts' && !embeddedMode && (
            <div className="xl:col-span-4 ak-card-3d bg-white dark:bg-[#1E1B3A]/95 border-2 border-[#E4DFF5] dark:border-[#38316B] border-b-4 rounded-3xl p-4 flex flex-col gap-3 max-h-[680px]">
              <div className="flex items-center justify-between">
                <h3 className="ak-title-display text-base font-extrabold text-[#25233A] dark:text-white">
                  12 Ideias Divertidas
                </h3>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#FFF0F6] dark:bg-[#27234D] text-[#D64B7B] dark:text-[#F9A8D4] border border-[#FBCFE8] dark:border-[#F16E9A]/40">
                  Toque para escolher
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2.5 overflow-y-auto pr-1">
                {ATELIER_PROMPTS.map((p) => {
                  const isActive = activePrompt?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPrompt(p)}
                      className={`w-full text-left p-2.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        isActive
                          ? 'bg-[#FFF0F6] dark:bg-[#27234D] border-[#F16E9A] dark:border-[#F16E9A] shadow-sm'
                          : 'bg-[#F5F3FC] dark:bg-[#121024]/80 border-[#E4DFF5] dark:border-[#38316B] hover:border-[#F16E9A]/60 dark:hover:border-[#F16E9A]/70'
                      }`}
                    >
                      <PromptMiniIcon shape={p.previewShape} color={p.suggestedColor} />
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm text-[#25233A] dark:text-white truncate">{p.title}</p>
                        <p className="text-xs font-medium text-[#77758A] dark:text-[#C5BFE6] line-clamp-1">{p.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Interactive Canvas + Toolbar */}
          <div
            className={`${
              studioTab === 'prompts' && !embeddedMode ? 'xl:col-span-8' : 'xl:col-span-12'
            } ak-card-3d bg-white dark:bg-[#1E1B3A]/95 border-2 border-[#E4DFF5] dark:border-[#38316B] border-b-4 rounded-3xl p-4 sm:p-5 space-y-4`}
          >
            {/* Active Prompt Hint Banner */}
            {studioTab === 'prompts' && activePrompt && (
              <div className="bg-[#FFF9E6] dark:bg-[#27234D] border-2 border-[#FFD34E] dark:border-[#FFD34E]/60 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PromptMiniIcon shape={activePrompt.previewShape} color={activePrompt.suggestedColor} />
                  <div>
                    <p className="font-extrabold text-[#25233A] dark:text-white text-sm sm:text-base">{activePrompt.title}</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#9E6A00] dark:text-[#FFD34E]">{activePrompt.guideLabel}</p>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-extrabold text-[#8A5A00] dark:text-[#FFE082] bg-white dark:bg-[#121024] px-3 py-1.5 rounded-xl border border-[#FFE082] dark:border-[#494285] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGuideOverlay}
                    onChange={(e) => setShowGuideOverlay(e.target.checked)}
                    className="rounded text-[#7047E8]"
                  />
                  Mostrar guia leve
                </label>
              </div>
            )}

            {/* Brushes & Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F5F3FC] dark:bg-[#121024]/85 p-2.5 rounded-2xl border-2 border-[#E4DFF5] dark:border-[#38316B]">
              <div className="flex flex-wrap items-center gap-1.5">
                {toolButtons.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      audioService.playGentlePop();
                      setSelectedTool(t.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border-2 transition-all ${
                      selectedTool === t.id
                        ? 'bg-[#7047E8] text-white border-[#522EC2] shadow-sm'
                        : 'bg-white dark:bg-[#27234D] text-[#25233A] dark:text-[#F8FAFC] border-[#E4DFF5] dark:border-[#38316B] hover:bg-[#EDE9FE] dark:hover:bg-[#342E63]'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={strokes.length === 0}
                  className="p-2 rounded-xl bg-white dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-white disabled:opacity-40 hover:bg-[#EDE9FE] dark:hover:bg-[#342E63]"
                  title="Desfazer traço"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="p-2 rounded-xl bg-white dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-white disabled:opacity-40 hover:bg-[#EDE9FE] dark:hover:bg-[#342E63]"
                  title="Refazer traço"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-700/70 text-rose-700 dark:text-rose-200 font-extrabold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/70"
                >
                  Limpar Papel
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen((v) => !v)}
                  className="p-2 rounded-xl bg-white dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-white hover:bg-[#EDE9FE] dark:hover:bg-[#342E63]"
                  title={isFullscreen ? 'Sair da tela cheia' : 'Expandir papel'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Shape Stamp Picker (when shape tool active) */}
            {selectedTool === 'shape' && (
              <div className="flex flex-wrap items-center gap-2 bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#DDD6F3] dark:border-[#7047E8]/60 rounded-2xl p-2.5">
                <span className="text-xs font-extrabold text-[#522EC2] dark:text-[#D8D2F8] px-1">Escolha o carimbo e toque no papel:</span>
                {SHAPE_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedShape(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all ${
                      selectedShape === s.id
                        ? 'bg-[#7047E8] text-white border-[#522EC2]'
                        : 'bg-white dark:bg-[#1E1B3A] text-[#522EC2] dark:text-[#E9D5FF] border-[#DDD6F3] dark:border-[#38316B]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* Color Palette + Stroke Thickness */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F5F3FC] dark:bg-[#121024]/85 p-3 rounded-2xl border-2 border-[#E4DFF5] dark:border-[#38316B]">
              <div className="flex flex-wrap items-center gap-2">
                {PALETTE_COLORS.map((c) => {
                  const active = selectedColor.toLowerCase() === c.hex.toLowerCase() && selectedTool !== 'eraser';
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      aria-label={c.name}
                      onClick={() => {
                        audioService.playGentlePop();
                        setSelectedColor(c.hex);
                        if (selectedTool === 'eraser') setSelectedTool('crayon');
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        active ? 'scale-115 ring-4 ring-[#7047E8]/35 dark:ring-[#FFD34E]/75 border-[#25233A] dark:border-white' : 'border-[#D8CFF5] dark:border-[#494285] hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#77758A] dark:text-[#C5BFE6]">Tamanho:</span>
                {BRUSH_WIDTHS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setSelectedWidth(w.value)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border-2 flex items-center gap-1.5 ${
                      selectedWidth === w.value
                        ? 'bg-[#7047E8] dark:bg-[#FFD34E] text-white dark:text-[#121024] border-[#522EC2] dark:border-[#FFD34E]'
                        : 'bg-white dark:bg-[#27234D] text-[#25233A] dark:text-[#F8FAFC] border-[#E4DFF5] dark:border-[#38316B]'
                    }`}
                  >
                    <span
                      className="rounded-full bg-current inline-block"
                      style={{ width: Math.min(14, Math.max(4, w.value / 1.6)), height: Math.min(14, Math.max(4, w.value / 1.6)) }}
                    />
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Frame with optional faint guide (white art paper preserved for accurate colors) */}
            <div className="relative rounded-3xl border-4 border-[#DDD6F3] dark:border-[#38316B] bg-[#FFFDF8] overflow-hidden shadow-inner">
              {showGuideOverlay && studioTab === 'prompts' && activePrompt && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15">
                  <div className="scale-[4.2]">
                    <PromptMiniIcon shape={activePrompt.previewShape} color="#94A3B8" />
                  </div>
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={800}
                height={480}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-[300px] sm:h-[400px] lg:h-[440px] block touch-none cursor-crosshair relative z-10 bg-transparent"
              />
            </div>

            {/* Heuristic Discovery Card + Optional Child Explanation */}
            <div className="bg-[#F5F3FC] dark:bg-[#121024]/85 border-2 border-[#E4DFF5] dark:border-[#38316B] rounded-3xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-extrabold text-[#77758A] dark:text-[#C5BFE6] uppercase tracking-wide mb-1">
                    Nome da sua obra
                  </label>
                  <input
                    type="text"
                    value={drawingTitle}
                    onChange={(e) => setDrawingTitle(e.target.value)}
                    placeholder="Ex: Meu Sol Mágico"
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#E4DFF5] dark:border-[#38316B] bg-white dark:bg-[#27234D] font-bold text-[#25233A] dark:text-white placeholder:text-[#9E9BAE] dark:placeholder:text-[#9B94C8] text-sm focus:border-[#7047E8] dark:focus:border-[#FFD34E] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDiscoverDrawing}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#7047E8] hover:bg-[#5E35D9] text-white font-extrabold text-sm border-b-4 border-[#522EC2] active:translate-y-0.5 transition-all shrink-0 sm:mt-5"
                >
                  <Wand2 className="w-4 h-4" />
                  Descobrir meu desenho!
                </button>
              </div>

              {recognition && (
                <div className="bg-white dark:bg-[#27234D] border-2 border-[#DDD6F3] dark:border-[#7047E8]/60 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#7047E8] dark:text-[#C4B5FD] shrink-0" />
                      <p className="font-extrabold text-[#25233A] dark:text-white text-base">
                        Palpite principal: {recognition.bestGuess.label}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#F5F3FC] dark:bg-[#1E1B3A] border border-[#DDD6F3] dark:border-[#494285] text-xs font-extrabold text-[#522EC2] dark:text-[#D8D2F8]">
                      Confiança visual: {Math.min(100, Math.round(recognition.bestGuess.confidence))}%
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#25233A] dark:text-[#E8E2FF]">{recognition.summaryFeedback}</p>
                  {recognition.alternatives.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#7047E8] dark:text-[#C4B5FD]">Também parece com:</span>
                      {recognition.alternatives.map((alt) => (
                        <span
                          key={alt.label}
                          className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-[#F5F3FC] dark:bg-[#1E1B3A] border border-[#DDD6F3] dark:border-[#494285] text-[#522EC2] dark:text-[#E9D5FF]"
                        >
                          {alt.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div>
                    {!showExplanationBox ? (
                      <button
                        type="button"
                        onClick={() => setShowExplanationBox(true)}
                        className="text-xs font-extrabold text-[#7047E8] dark:text-[#C4B5FD] underline hover:text-[#522EC2] dark:hover:text-white"
                      >
                        Quero explicar minha criação com minhas palavras!
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-[#522EC2] dark:text-[#E9D5FF]">
                          O que você criou na sua imaginação?
                        </label>
                        <input
                          type="text"
                          value={childExplanation}
                          onChange={(e) => setChildExplanation(e.target.value)}
                          placeholder="Conte sobre o seu desenho..."
                          className="w-full px-3 py-2 rounded-xl border-2 border-[#DDD6F3] dark:border-[#494285] bg-[#F5F3FC] dark:bg-[#1E1B3A] text-sm font-semibold text-[#25233A] dark:text-white placeholder:text-[#9E9BAE]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isSavedBanner && (
                <div className="bg-[#E9FBF4] dark:bg-[#133A2E] border-2 border-[#36C995]/50 dark:border-[#36C995] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-[#115E43] dark:text-[#D1FAE5]">
                  <div className="flex items-center gap-2 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#36C995] dark:text-[#4ADE80]" />
                    <span>Obra guardada com sucesso na sua Galeria!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      reloadGallery();
                      setStudioTab('gallery');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#36C995] hover:bg-[#2BB584] text-white text-xs font-extrabold"
                  >
                    Abrir Galeria
                  </button>
                </div>
              )}

              {/* Explicit Save / Discard Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmDiscardOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-white dark:bg-[#27234D] hover:bg-rose-50 dark:hover:bg-rose-950/60 text-[#25233A] dark:text-[#D8D2F8] hover:text-rose-700 dark:hover:text-rose-200 font-extrabold text-sm border-2 border-[#E4DFF5] dark:border-[#38316B] hover:border-rose-200 border-b-4 transition-all"
                >
                  NÃO SALVAR
                </button>
                <button
                  type="button"
                  onClick={handleSaveDrawing}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#36C995] hover:bg-[#2BB584] text-white font-extrabold text-sm border-b-4 border-[#22986E] active:translate-y-0.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  SALVAR DESENHO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {confirmDiscardOpen && (
        <div className="fixed inset-0 z-50 bg-[#121024]/65 dark:bg-[#0A0818]/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="ak-card-3d bg-white dark:bg-[#1E1B3A] border-4 border-[#F16E9A]/50 dark:border-[#F16E9A]/70 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="ak-title-display text-xl font-extrabold text-[#25233A] dark:text-white">
              Tem certeza que quer sair sem salvar este desenho?
            </h3>
            <p className="text-sm font-medium text-[#77758A] dark:text-[#C5BFE6]">
              Se você descartar agora, os tracinhos atuais serão apagados do papel.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDiscardOpen(false)}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#7047E8] hover:bg-[#5E35D9] text-white font-extrabold text-sm border-b-4 border-[#522EC2]"
              >
                Continuar Desenhando
              </button>
              <button
                type="button"
                onClick={handleDiscardConfirmed}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-200 dark:hover:bg-rose-900/80 text-rose-800 dark:text-rose-200 font-extrabold text-sm border-2 border-rose-300 dark:border-rose-700"
              >
                Sim, descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Lightbox Modal */}
      {previewGalleryItem && (
        <div className="fixed inset-0 z-50 bg-[#121024]/65 dark:bg-[#0A0818]/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="ak-card-3d bg-white dark:bg-[#1E1B3A] border-4 border-[#FFD34E]/60 dark:border-[#38316B] rounded-3xl max-w-2xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="ak-title-display text-lg font-extrabold text-[#25233A] dark:text-white">{previewGalleryItem.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewGalleryItem(null)}
                className="p-2 rounded-xl bg-[#F5F3FC] dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] text-[#77758A] dark:text-[#D8D2F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border-2 border-[#E4DFF5] dark:border-[#38316B] bg-[#FFFDF8]">
              <img src={previewGalleryItem.dataUrl} alt={previewGalleryItem.title} className="w-full max-h-[60vh] object-contain" />
            </div>
            {previewGalleryItem.childExplanation && (
              <p className="text-sm font-semibold text-[#25233A] dark:text-[#F8FAFC] bg-[#F5F3FC] dark:bg-[#27234D] p-3 rounded-2xl border border-[#E4DFF5] dark:border-[#38316B]">
                Explicação do artista: “{previewGalleryItem.childExplanation}”
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const item = previewGalleryItem;
                  setPreviewGalleryItem(null);
                  handleReopenSavedDrawing(item);
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#4389F5] hover:bg-[#2B6ED9] text-white font-extrabold text-sm border-b-4 border-[#1F56B0]"
              >
                Continuar Desenhando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
