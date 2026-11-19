import {
  AchievementDefinition,
  ActivityCompletionRecord,
  DailyJourney,
  GamePlayRecord,
  SkillArea,
  UnlockedAchievement
} from '@/types';
import { ParentObservation, PedagogicalPillarId } from '@/services/observationsService';
import { getDaysAgoDateString, getTodayDateString } from '@/utils/dateUtils';

export interface PedagogicalPillarConfig {
  id: PedagogicalPillarId;
  title: string;
  subtitle: string;
  color: string;
  softBgLight: string;
  softBgDark: string;
  areas: SkillArea[];
}

export const PEDAGOGICAL_PILLARS: PedagogicalPillarConfig[] = [
  {
    id: 'linguagem',
    title: 'Linguagem',
    subtitle: 'Comunicação, vocabulário, leitura inicial e contato com novos idiomas.',
    color: '#4389F5',
    softBgLight: '#EBF3FE',
    softBgDark: '#192948',
    areas: ['communication', 'languages']
  },
  {
    id: 'raciocinio',
    title: 'Raciocínio',
    subtitle: 'Lógica visual, matemática lúdica, sequência de ideias e curiosidade científica.',
    color: '#7047E8',
    softBgLight: '#EFEAFC',
    softBgDark: '#261E4A',
    areas: ['reasoning', 'math', 'knowledge']
  },
  {
    id: 'atencao',
    title: 'Atenção',
    subtitle: 'Foco sustentado, percepção de detalhes e conclusão calma de etapas.',
    color: '#FF9B42',
    softBgLight: '#FFF2E6',
    softBgDark: '#362317',
    areas: ['attention']
  },
  {
    id: 'coordenacao',
    title: 'Coordenação',
    subtitle: 'Movimento ativo, lateralidade, ritmo musical e expressão artística.',
    color: '#36C995',
    softBgLight: '#E6F9F2',
    softBgDark: '#143328',
    areas: ['motor', 'creativity', 'music']
  },
  {
    id: 'socioemocional',
    title: 'Socioemocional',
    subtitle: 'Reconhecimento de sentimentos, respiração consciente e hábitos positivos.',
    color: '#F16E9A',
    softBgLight: '#FCECF2',
    softBgDark: '#371C2B',
    areas: ['emotional']
  }
];

export const SKILL_AREA_DISPLAY: Record<SkillArea, { label: string; color: string; pillarId: PedagogicalPillarId }> = {
  communication: { label: 'Comunicação e Fala', color: '#4389F5', pillarId: 'linguagem' },
  languages: { label: 'Inglês e Idiomas', color: '#3B82F6', pillarId: 'linguagem' },
  reasoning: { label: 'Raciocínio e Lógica', color: '#7047E8', pillarId: 'raciocinio' },
  math: { label: 'Matemática Lúdica', color: '#8B5CF6', pillarId: 'raciocinio' },
  knowledge: { label: 'Conhecimentos Gerais', color: '#5E35D8', pillarId: 'raciocinio' },
  attention: { label: 'Atenção e Foco', color: '#FF9B42', pillarId: 'atencao' },
  motor: { label: 'Coordenação Motora', color: '#36C995', pillarId: 'coordenacao' },
  creativity: { label: 'Criatividade e Artes', color: '#10B981', pillarId: 'coordenacao' },
  music: { label: 'Música e Ritmo', color: '#06B6D4', pillarId: 'coordenacao' },
  emotional: { label: 'Inteligência Emocional', color: '#F16E9A', pillarId: 'socioemocional' }
};

export interface LineTrendPoint {
  date: string;
  label: string;
  minutes: number;
  activitiesCount: number;
  gamesCount: number;
  goalMinutes: number;
  goalMet: boolean;
}

export interface DonutSlice {
  key: string;
  label: string;
  count: number;
  minutes: number;
  percent: number;
  color: string;
}

export interface HeatmapCell {
  date: string;
  count: number;
  minutes: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface TimelineEventItem {
  id: string;
  timestamp: number;
  date: string;
  type: 'activity' | 'game' | 'achievement' | 'observation';
  title: string;
  subtitle: string;
  badge: string;
  color: string;
}

const toLocalIsoDate = (isoOrDate: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) return isoOrDate;
  const parsed = new Date(isoOrDate);
  if (Number.isNaN(parsed.getTime())) return getTodayDateString();
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatShortDayLabel = (dateStr: string): string => {
  const [, month, day] = dateStr.split('-');
  return `${day}/${month}`;
};

export function buildLineTrendData(params: {
  completions: ActivityCompletionRecord[];
  journeys: DailyJourney[];
  games: GamePlayRecord[];
  periodDays: 7 | 30 | 90;
  dailyGoalMinutes: number;
  referenceDate?: string;
}): LineTrendPoint[] {
  const { completions, journeys, games, periodDays, dailyGoalMinutes, referenceDate } = params;

  const baseDate = referenceDate ? new Date(`${referenceDate}T12:00:00`) : new Date();
  const dates: string[] = [];
  for (let i = periodDays - 1; i >= 0; i--) {
    if (referenceDate) {
      const dt = new Date(baseDate);
      dt.setDate(dt.getDate() - i);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
    } else {
      dates.push(getDaysAgoDateString(i));
    }
  }

  const bucket: Record<string, { minutes: number; activities: number; games: number; journeyMins: number; completed: boolean }> = {};
  dates.forEach(d => {
    bucket[d] = { minutes: 0, activities: 0, games: 0, journeyMins: 0, completed: false };
  });

  completions.forEach(c => {
    const d = toLocalIsoDate(c.completedAt);
    if (!bucket[d]) return;
    bucket[d].activities += 1;
    bucket[d].minutes += Math.max(1, c.durationMinutes || 0);
  });

  games.forEach(g => {
    const d = toLocalIsoDate(g.date);
    if (!bucket[d]) return;
    bucket[d].games += 1;
    bucket[d].minutes += Math.max(1, Math.round((g.durationSeconds || 60) / 60));
  });

  journeys.forEach(j => {
    const d = toLocalIsoDate(j.date);
    if (!bucket[d]) return;
    bucket[d].journeyMins = Math.max(bucket[d].journeyMins, j.totalMinutesSpent || 0);
    if (j.isCompleted) {
      bucket[d].completed = true;
    }
  });

  return dates.map(d => {
    const item = bucket[d];
    const totalMinutes = Math.max(item.minutes, item.journeyMins);
    return {
      date: d,
      label: formatShortDayLabel(d),
      minutes: totalMinutes,
      activitiesCount: item.activities,
      gamesCount: item.games,
      goalMinutes: dailyGoalMinutes,
      goalMet: item.completed || totalMinutes >= dailyGoalMinutes
    };
  });
}

export function buildCategoryDonutData(params: {
  completions: ActivityCompletionRecord[];
  groupBy?: 'pillar' | 'area';
}): DonutSlice[] {
  const { completions, groupBy = 'pillar' } = params;
  if (completions.length === 0) return [];

  const counts = new Map<string, { label: string; count: number; minutes: number; color: string }>();

  if (groupBy === 'pillar') {
    completions.forEach(item => {
      const pillar = PEDAGOGICAL_PILLARS.find(p => p.areas.includes(item.area)) || PEDAGOGICAL_PILLARS[1];
      const existing = counts.get(pillar.id) || {
        label: pillar.title,
        count: 0,
        minutes: 0,
        color: pillar.color
      };
      existing.count += 1;
      existing.minutes += Math.max(1, item.durationMinutes || 0);
      counts.set(pillar.id, existing);
    });
  } else {
    completions.forEach(item => {
      const meta = SKILL_AREA_DISPLAY[item.area] || { label: item.area, color: '#7047E8' };
      const existing = counts.get(item.area) || {
        label: meta.label,
        count: 0,
        minutes: 0,
        color: meta.color
      };
      existing.count += 1;
      existing.minutes += Math.max(1, item.durationMinutes || 0);
      counts.set(item.area, existing);
    });
  }

  const total = completions.length;
  return Array.from(counts.entries())
    .map(([key, val]) => ({
      key,
      label: val.label,
      count: val.count,
      minutes: val.minutes,
      percent: Math.round((val.count / total) * 100),
      color: val.color
    }))
    .sort((a, b) => b.count - a.count);
}

export function buildActivityHeatmapData(params: {
  completions: ActivityCompletionRecord[];
  journeys: DailyJourney[];
  games: GamePlayRecord[];
  weeks?: number;
  referenceDate?: string;
}): HeatmapCell[][] {
  const { completions, journeys, games, weeks = 12, referenceDate } = params;
  const totalDays = weeks * 7;
  const baseDate = referenceDate ? new Date(`${referenceDate}T12:00:00`) : new Date();

  const dailyTotals = new Map<string, { count: number; minutes: number }>();

  const bump = (dateKey: string, countDelta: number, minDelta: number) => {
    const prev = dailyTotals.get(dateKey) || { count: 0, minutes: 0 };
    prev.count += countDelta;
    prev.minutes += minDelta;
    dailyTotals.set(dateKey, prev);
  };

  completions.forEach(c => bump(toLocalIsoDate(c.completedAt), 1, Math.max(1, c.durationMinutes || 0)));
  games.forEach(g => bump(toLocalIsoDate(g.date), 1, Math.max(1, Math.round((g.durationSeconds || 60) / 60))));
  journeys.forEach(j => {
    const doneSteps = j.steps.filter(s => s.status === 'completed').length;
    if (doneSteps > 0 || j.isCompleted) {
      bump(toLocalIsoDate(j.date), doneSteps, j.totalMinutesSpent || 0);
    }
  });

  const flat: HeatmapCell[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    let dateStr: string;
    if (referenceDate) {
      const dt = new Date(baseDate);
      dt.setDate(dt.getDate() - i);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      dateStr = `${y}-${m}-${d}`;
    } else {
      dateStr = getDaysAgoDateString(i);
    }
    const stats = dailyTotals.get(dateStr) || { count: 0, minutes: 0 };
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (stats.count >= 5 || stats.minutes >= 25) level = 4;
    else if (stats.count >= 3 || stats.minutes >= 15) level = 3;
    else if (stats.count >= 2 || stats.minutes >= 8) level = 2;
    else if (stats.count >= 1 || stats.minutes >= 1) level = 1;

    flat.push({
      date: dateStr,
      count: stats.count,
      minutes: stats.minutes,
      level
    });
  }

  const columns: HeatmapCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(flat.slice(w * 7, w * 7 + 7));
  }
  return columns;
}

export function buildTimelineEvents(params: {
  completions: ActivityCompletionRecord[];
  games: GamePlayRecord[];
  unlockedAchievements: UnlockedAchievement[];
  observations: ParentObservation[];
  achievementsCatalog: AchievementDefinition[];
  limit?: number;
}): TimelineEventItem[] {
  const { completions, games, unlockedAchievements, observations, achievementsCatalog, limit = 18 } = params;
  const items: TimelineEventItem[] = [];

  completions.forEach(c => {
    const meta = SKILL_AREA_DISPLAY[c.area] || { label: c.area, color: '#7047E8' };
    items.push({
      id: `tl_act_${c.id}`,
      timestamp: new Date(c.completedAt).getTime(),
      date: toLocalIsoDate(c.completedAt),
      type: 'activity',
      title: c.activityTitle,
      subtitle: `${meta.label} • ${c.durationMinutes} min • Nota ${c.score}%`,
      badge: 'Atividade',
      color: meta.color
    });
  });

  games.forEach(g => {
    const gameLabels: Record<string, string> = {
      'pato-ganso': 'Pato, Pato, Ganso 3D',
      'batata-quente': 'Batata Quente 3D',
      'morto-vivo': 'Morto-Vivo 3D',
      'jogo-memoria': 'Memória 3D',
      'sequencia-cores': 'Sequência de Cores 3D',
      'simon-says': 'Mestre Mandou 3D'
    };
    items.push({
      id: `tl_game_${g.id}`,
      timestamp: g.timestamp,
      date: toLocalIsoDate(g.date),
      type: 'game',
      title: gameLabels[g.gameId] || g.gameId,
      subtitle: `Jogo 3D • ${Math.max(1, Math.round((g.durationSeconds || 30) / 60))} min`,
      badge: 'Jogo 3D',
      color: '#FF9B42'
    });
  });

  unlockedAchievements.forEach(u => {
    const def = achievementsCatalog.find(a => a.id === u.achievementId);
    items.push({
      id: `tl_ach_${u.id}`,
      timestamp: new Date(u.unlockedAt).getTime(),
      date: toLocalIsoDate(u.unlockedAt),
      type: 'achievement',
      title: def?.title || 'Conquista Desbloqueada',
      subtitle: def?.description || 'Marco alcançado na jornada da criança.',
      badge: 'Medalha',
      color: '#FFD34E'
    });
  });

  observations.forEach(o => {
    const pillar = PEDAGOGICAL_PILLARS.find(p => p.id === o.pillarId);
    items.push({
      id: `tl_obs_${o.id}`,
      timestamp: new Date(o.createdAt).getTime(),
      date: o.date,
      type: 'observation',
      title: `Observação Familiar (${pillar?.title || 'Geral'})`,
      subtitle: o.note,
      badge: 'Nota dos Pais',
      color: pillar?.color || '#36C995'
    });
  });

  return items
    .filter(item => !Number.isNaN(item.timestamp))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
