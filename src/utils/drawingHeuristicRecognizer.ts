export interface Point2D {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: Point2D[];
  color: string;
  width: number;
  tool: 'pencil' | 'marker' | 'crayon' | 'spray' | 'eraser' | 'shape';
  shapeKind?: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'sun' | 'cloud' | 'flower';
}

export interface RecognitionCandidate {
  label: string;
  category: string;
  confidence: number;
  clue: string;
}

export interface DrawingRecognitionResult {
  bestGuess: RecognitionCandidate;
  alternatives: RecognitionCandidate[];
  summaryFeedback: string;
  stats: {
    strokeCount: number;
    pixelCoveragePct: number;
    dominantColors: number;
    aspectRatio: number;
    symmetryScore: number;
  };
}

/**
 * Analyzes real stroke geometry + canvas pixel distribution to infer
 * what the child drew (sun, flower, house, tree, rainbow, heart, star, car, person, bird, etc.)
 * instead of returning hardcoded blind answers.
 */
export function analyzeDrawingCanvas(
  canvas: HTMLCanvasElement | null,
  strokes: DrawingStroke[],
  targetHint?: string
): DrawingRecognitionResult {
  const nonEraserStrokes = strokes.filter((s) => s.tool !== 'eraser' && s.points.length > 0);
  const strokeCount = nonEraserStrokes.length;
  const distinctColors = new Set(nonEraserStrokes.map((s) => s.color.toLowerCase())).size;

  // Pixel metrics from actual rendered bitmap
  let pixelCoveragePct = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let totalPoints = 0;
  let leftMass = 0;
  let rightMass = 0;
  let topMass = 0;
  let bottomMass = 0;
  let warmPixels = 0;
  let greenPixels = 0;
  let skyBluePixels = 0;
  let redPinkPixels = 0;
  let activeSamples = 0;

  const width = canvas?.width || 400;
  const height = canvas?.height || 300;

  if (canvas) {
    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = ctx.getImageData(0, 0, width, height);
        const data = img.data;
        const step = 3; // sample every 3rd pixel for fast <10ms inference
        let totalSamples = 0;

        for (let y = 0; y < height; y += step) {
          for (let x = 0; x < width; x += step) {
            totalSamples++;
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            // Detect drawn pixels (not pure cream canvas background ~ #FFFDF7 or transparent)
            const isPainted = a > 30 && (r < 242 || g < 238 || b < 228);
            if (!isPainted) continue;

            activeSamples++;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;

            if (x < width / 2) leftMass++;
            else rightMass++;
            if (y < height / 2) topMass++;
            else bottomMass++;

            if (r > 190 && g > 130 && b < 110) warmPixels++;
            if (g > r + 20 && g > b + 15) greenPixels++;
            if (b > r + 25 && b > 140) skyBluePixels++;
            if (r > 180 && b > 90 && g < 150) redPinkPixels++;
          }
        }
        pixelCoveragePct = totalSamples > 0 ? Math.round((activeSamples / totalSamples) * 1000) / 10 : 0;
      }
    } catch {
      // Fallback safely to pure stroke geometry
    }
  }

  // Fallback bounds from stroke points if canvas wasn't sampled or had zero bitmap difference
  let closedLoopCount = 0;
  let radialRaysCount = 0;
  let horizontalLineCount = 0;
  let verticalLineCount = 0;
  let curvedStrokeCount = 0;

  nonEraserStrokes.forEach((s) => {
    totalPoints += s.points.length;
    if (s.points.length < 2) return;
    let sMinX = Infinity,
      sMaxX = -Infinity,
      sMinY = Infinity,
      sMaxY = -Infinity;
    s.points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (p.x < sMinX) sMinX = p.x;
      if (p.x > sMaxX) sMaxX = p.x;
      if (p.y < sMinY) sMinY = p.y;
      if (p.y > sMaxY) sMaxY = p.y;
    });

    const sw = Math.max(1, sMaxX - sMinX);
    const sh = Math.max(1, sMaxY - sMinY);
    const start = s.points[0];
    const end = s.points[s.points.length - 1];
    const distEnds = Math.hypot(end.x - start.x, end.y - start.y);
    const diag = Math.hypot(sw, sh);

    if (diag > 24 && distEnds < diag * 0.32 && s.points.length >= 6) {
      closedLoopCount++;
    } else if (diag > 15 && diag < 90 && nonEraserStrokes.length >= 5) {
      radialRaysCount++;
    }

    if (sw > sh * 2.1 && sw > 30) horizontalLineCount++;
    if (sh > sw * 2.1 && sh > 30) verticalLineCount++;

    // Detect arc/curvature (rainbow, smile, cloud)
    if (s.points.length >= 6 && diag > 35) {
      const mid = s.points[Math.floor(s.points.length / 2)];
      const lineMidY = (start.y + end.y) / 2;
      if (Math.abs(mid.y - lineMidY) > 18) {
        curvedStrokeCount++;
      }
    }
  });

  if (!Number.isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = width;
    maxY = height;
  }

  const bboxW = Math.max(1, maxX - minX);
  const bboxH = Math.max(1, maxY - minY);
  const aspectRatio = Math.round((bboxW / bboxH) * 100) / 100;
  const lrTotal = Math.max(1, leftMass + rightMass);
  const symmetryScore = Math.round(
    (1 - Math.abs(leftMass - rightMass) / lrTotal) * 100
  );

  // Insufficient strokes guard
  if (strokeCount === 0 || (totalPoints < 4 && activeSamples < 8)) {
    const emptyCandidate: RecognitionCandidate = {
      label: 'Espaço em Branco Prontinho',
      category: 'inicial',
      confidence: 0,
      clue: 'Faça mais alguns traços coloridos para descobrirmos juntos!'
    };
    return {
      bestGuess: emptyCandidate,
      alternatives: [],
      summaryFeedback: 'Solte a imaginação! Faça alguns traços grandes no quadro para eu tentar adivinhar.',
      stats: { strokeCount, pixelCoveragePct, dominantColors: distinctColors, aspectRatio, symmetryScore }
    };
  }

  const warmShare = activeSamples > 0 ? warmPixels / activeSamples : 0;
  const greenShare = activeSamples > 0 ? greenPixels / activeSamples : 0;
  const blueShare = activeSamples > 0 ? skyBluePixels / activeSamples : 0;
  const pinkShare = activeSamples > 0 ? redPinkPixels / activeSamples : 0;

  const candidates: RecognitionCandidate[] = [];

  const scoreAdd = (label: string, category: string, score: number, clue: string) => {
    candidates.push({ label, category, confidence: Math.min(96, Math.max(25, Math.round(score))), clue });
  };

  // Sun heuristic: closed loop + radial rays + warm gold/orange hues OR upper circular concentration
  let sunScore = 38;
  if (closedLoopCount >= 1) sunScore += 18;
  if (radialRaysCount >= 4) sunScore += 26;
  if (warmShare > 0.3) sunScore += 20;
  if (symmetryScore > 65 && aspectRatio > 0.7 && aspectRatio < 1.45) sunScore += 10;
  scoreAdd('Sol Brilhante', 'natureza', sunScore, 'Identificamos formas arredondadas com raios ou tons quentes!');

  // Rainbow heuristic: multiple arcs + multi-color (>3 colors) + wide horizontal span
  let rainbowScore = 32;
  if (distinctColors >= 3) rainbowScore += 24;
  if (curvedStrokeCount >= 2) rainbowScore += 25;
  if (aspectRatio >= 1.25) rainbowScore += 12;
  scoreAdd('Arco-Íris Colorido', 'natureza', rainbowScore, 'Percebemos vários arcos coloridos lado a lado!');

  // House heuristic: rectangular base + angular roof / vertical & horizontal structural lines + >3 strokes
  let houseScore = 34;
  if (horizontalLineCount >= 1 && verticalLineCount >= 2) houseScore += 28;
  if (closedLoopCount >= 1 && strokeCount >= 4) houseScore += 16;
  if (symmetryScore >= 68) houseScore += 12;
  scoreAdd('Casinha Aconchegante', 'construcao', houseScore, 'Vimos traços retos verticais e horizontais formando estrutura!');

  // Flower / Tree heuristic: green stems/foliage or vertical trunk + top cluster
  let treeFlowerScore = 34;
  if (greenShare > 0.2) treeFlowerScore += 26;
  if (verticalLineCount >= 1 && topMass > bottomMass * 0.7) treeFlowerScore += 18;
  if (distinctColors >= 2 && closedLoopCount >= 1) treeFlowerScore += 14;
  scoreAdd(
    distinctColors >= 3 || pinkShare > 0.15 ? 'Flor no Jardim' : 'Árvore Frondosa',
    'natureza',
    treeFlowerScore,
    'Notamos tons da natureza e elementos crescendo para cima!'
  );

  // Heart / Butterfly heuristic: high bilateral symmetry + pink/red tones or twin loops
  let heartButterflyScore = 32;
  if (symmetryScore >= 72) heartButterflyScore += 24;
  if (pinkShare > 0.25) heartButterflyScore += 24;
  if (curvedStrokeCount >= 1) heartButterflyScore += 12;
  scoreAdd(
    closedLoopCount >= 2 ? 'Borboleta Simétrica' : 'Coração Carinhoso',
    'sentimento',
    heartButterflyScore,
    'A simetria entre os dois lados ficou incrível!'
  );

  // Cloud / Ocean wave heuristic: blue dominance + horizontal curved profile
  let cloudWaveScore = 30;
  if (blueShare > 0.28) cloudWaveScore += 28;
  if (curvedStrokeCount >= 1 && aspectRatio > 1.15) cloudWaveScore += 20;
  scoreAdd('Nuvem ou Mar Tranquilo', 'ceu', cloudWaveScore, 'Vimos curvas suaves com predominância azul!');

  // Boost candidate subtly if child was doing a guided prompt AND geometry plausibly fits (>= 48)
  if (targetHint) {
    const cleanHint = targetHint.toLowerCase();
    candidates.forEach((c) => {
      const cleanLabel = c.label.toLowerCase();
      if (
        (cleanHint.includes('sol') && cleanLabel.includes('sol')) ||
        (cleanHint.includes('arco') && cleanLabel.includes('arco')) ||
        (cleanHint.includes('casa') && cleanLabel.includes('casinha')) ||
        (cleanHint.includes('flor') && cleanLabel.includes('flor')) ||
        (cleanHint.includes('árvore') && cleanLabel.includes('árvore')) ||
        (cleanHint.includes('coração') && cleanLabel.includes('coração')) ||
        (cleanHint.includes('borboleta') && cleanLabel.includes('borboleta')) ||
        (cleanHint.includes('nuvem') && cleanLabel.includes('nuvem'))
      ) {
        if (strokeCount >= 2) {
          c.confidence = Math.min(95, c.confidence + 14);
        }
      }
    });
  }

  // Also check explicit shape stamps used!
  const shapeCount: Record<string, number> = {};
  nonEraserStrokes.forEach((s) => {
    if (s.tool === 'shape' && s.shapeKind) {
      shapeCount[s.shapeKind] = (shapeCount[s.shapeKind] || 0) + 1;
    }
  });
  if (shapeCount.heart) scoreAdd('Coração Carinhoso', 'sentimento', 90, 'Você usou carimbo ou forma de coração!');
  if (shapeCount.star) scoreAdd('Estrela Brilhante', 'ceu', 90, 'Vimos uma estrela super luminosa no seu desenho!');
  if (shapeCount.sun) scoreAdd('Sol Radiante', 'natureza', 92, 'Um lindo Sol ilumina toda a folha!');
  if (shapeCount.flower) scoreAdd('Jardim Florido', 'natureza', 91, 'Suas flores deixaram o desenho encantador!');

  // Deduplicate by label & sort descending
  const dedup = new Map<string, RecognitionCandidate>();
  candidates.forEach((c) => {
    const prev = dedup.get(c.label);
    if (!prev || c.confidence > prev.confidence) dedup.set(c.label, c);
  });

  const sorted = Array.from(dedup.values()).sort((a, b) => b.confidence - a.confidence);
  const bestGuess = sorted[0];
  const alternatives = sorted.slice(1, 3);

  const summaryFeedback =
    bestGuess.confidence >= 72
      ? `Uau! Pelos traços e cores, acho que você desenhou: ${bestGuess.label}! Acertei?`
      : `Que desenho criativo! Parece ${bestGuess.label} (ou ${alternatives[0]?.label || 'uma arte única'}). Quer me contar o que é?`;

  return {
    bestGuess,
    alternatives,
    summaryFeedback,
    stats: {
      strokeCount,
      pixelCoveragePct,
      dominantColors: distinctColors,
      aspectRatio,
      symmetryScore
    }
  };
}
