import { describe, it, expect, beforeEach } from 'vitest';
import {
  PEDAGOGICAL_PILLARS,
  buildActivityHeatmapData,
  buildCategoryDonutData,
  buildLineTrendData,
  buildTimelineEvents
} from '../src/design-system/chartAggregators';
import { observationsService } from '../src/services/observationsService';
import { ACHIEVEMENTS_CATALOG } from '../src/services/progressionService';
import {
  ActivityCompletionRecord,
  DailyJourney,
  GamePlayRecord,
  UnlockedAchievement
} from '../src/types';

class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

global.localStorage = new LocalStorageMock() as unknown as Storage;

function makeCompletion(
  id: string,
  area: ActivityCompletionRecord['area'],
  completedAt: string,
  durationMinutes = 6,
  score = 95
): ActivityCompletionRecord {
  return {
    id,
    childId: 'child_test_charts',
    familyId: 'fam_test_charts',
    activityId: `act_${id}`,
    activityTitle: `Atividade ${id}`,
    area,
    durationMinutes,
    score,
    completedAt
  };
}

function makeGame(
  id: string,
  gameId: string,
  date: string,
  timestamp: number,
  durationSeconds = 120
): GamePlayRecord {
  return {
    id,
    childId: 'child_test_charts',
    gameId,
    date,
    timestamp,
    durationSeconds,
    score: 100
  };
}

describe('Etapa 4 & 5 — Agregadores Reais de Gráficos e Observações dos Pais', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Estados vazios honestos (sem dados fictícios)', () => {
    it('retorna séries zeradas e listas vazias quando criança não possui registros', () => {
      const trend7 = buildLineTrendData({
        completions: [],
        journeys: [],
        games: [],
        periodDays: 7,
        dailyGoalMinutes: 25,
        referenceDate: '2026-11-15'
      });
      expect(trend7).toHaveLength(7);
      expect(trend7.every(p => p.minutes === 0 && p.activitiesCount === 0 && !p.goalMet)).toBe(true);

      const donut = buildCategoryDonutData({ completions: [], groupBy: 'pillar' });
      expect(donut).toEqual([]);

      const heatmap = buildActivityHeatmapData({
        completions: [],
        journeys: [],
        games: [],
        weeks: 12,
        referenceDate: '2026-11-15'
      });
      expect(heatmap).toHaveLength(12);
      expect(heatmap.every(col => col.length === 7 && col.every(cell => cell.level === 0 && cell.count === 0))).toBe(true);

      const timeline = buildTimelineEvents({
        completions: [],
        games: [],
        unlockedAchievements: [],
        observations: [],
        achievementsCatalog: ACHIEVEMENTS_CATALOG
      });
      expect(timeline).toEqual([]);
    });
  });

  describe('2. buildLineTrendData para 7, 30 e 90 dias', () => {
    it('agrega minutos, contagens e metas cumpridas exatamente nas datas corretas', () => {
      const completions: ActivityCompletionRecord[] = [
        makeCompletion('c1', 'communication', '2026-11-15T10:30:00', 12, 100),
        makeCompletion('c2', 'math', '2026-11-15T14:00:00', 10, 90),
        makeCompletion('c3', 'attention', '2026-11-12T09:00:00', 8, 85)
      ];
      const games: GamePlayRecord[] = [
        makeGame('g1', 'pato-ganso', '2026-11-15', new Date('2026-11-15T16:00:00').getTime(), 240) // 4 min
      ];
      const journeys: DailyJourney[] = [];

      const trend7 = buildLineTrendData({
        completions,
        journeys,
        games,
        periodDays: 7,
        dailyGoalMinutes: 20,
        referenceDate: '2026-11-15'
      });

      expect(trend7).toHaveLength(7);
      const todayPoint = trend7.find(p => p.date === '2026-11-15');
      expect(todayPoint).toMatchObject({
        minutes: 26,
        activitiesCount: 2,
        gamesCount: 1,
        goalMinutes: 20,
        goalMet: true
      });

      const day12Point = trend7.find(p => p.date === '2026-11-12');
      expect(day12Point).toMatchObject({
        minutes: 8,
        activitiesCount: 1,
        gamesCount: 0,
        goalMet: false
      });

      const trend30 = buildLineTrendData({
        completions,
        journeys,
        games,
        periodDays: 30,
        dailyGoalMinutes: 20,
        referenceDate: '2026-11-15'
      });
      expect(trend30).toHaveLength(30);

      const trend90 = buildLineTrendData({
        completions,
        journeys,
        games,
        periodDays: 90,
        dailyGoalMinutes: 20,
        referenceDate: '2026-11-15'
      });
      expect(trend90).toHaveLength(90);
    });
  });

  describe('3. buildCategoryDonutData e buildActivityHeatmapData', () => {
    it('agrupa conclusões pelos 5 pilares pedagógicos e calcula porcentagens corretamente', () => {
      expect(PEDAGOGICAL_PILLARS).toHaveLength(5);

      const completions: ActivityCompletionRecord[] = [
        makeCompletion('a1', 'communication', '2026-11-14T10:00:00', 5),
        makeCompletion('a2', 'languages', '2026-11-14T11:00:00', 5),
        makeCompletion('a3', 'math', '2026-11-15T10:00:00', 8),
        makeCompletion('a4', 'emotional', '2026-11-15T11:00:00', 4)
      ];

      const byPillar = buildCategoryDonutData({ completions, groupBy: 'pillar' });
      expect(byPillar[0]).toMatchObject({
        key: 'linguagem',
        count: 2,
        percent: 50
      });
      const sumCounts = byPillar.reduce((acc, s) => acc + s.count, 0);
      expect(sumCounts).toBe(4);

      const byArea = buildCategoryDonutData({ completions, groupBy: 'area' });
      expect(byArea).toHaveLength(4);
    });

    it('calcula níveis 0..4 do calendário heatmap baseado em atividade real', () => {
      const completions: ActivityCompletionRecord[] = [
        makeCompletion('h1', 'communication', '2026-11-15T09:00:00', 10),
        makeCompletion('h2', 'math', '2026-11-15T10:00:00', 10),
        makeCompletion('h3', 'attention', '2026-11-15T11:00:00', 10)
      ];
      const grid = buildActivityHeatmapData({
        completions,
        journeys: [],
        games: [],
        weeks: 12,
        referenceDate: '2026-11-15'
      });
      const lastCell = grid[11][6];
      expect(lastCell.date).toBe('2026-11-15');
      expect(lastCell.count).toBe(3);
      expect(lastCell.minutes).toBe(30);
      expect(lastCell.level).toBe(4);
    });
  });

  describe('4. observationsService CRUD e buildTimelineEvents cronológico', () => {
    it('persiste e exclui anotações dos responsáveis por criança e ordena linha do tempo', async () => {
      const obs1 = observationsService.addObservation({
        childId: 'child_a',
        pillarId: 'linguagem',
        note: '  Contou uma história inteira hoje no jantar.  ',
        date: '2026-11-14'
      });
      observationsService.addObservation({
        childId: 'child_b',
        pillarId: 'coordenacao',
        note: 'Nota de outra criança',
        date: '2026-11-14'
      });

      expect(obs1.note).toBe('Contou uma história inteira hoje no jantar.');
      const childANotes = observationsService.getObservations('child_a');
      expect(childANotes).toHaveLength(1);
      expect(observationsService.getObservations('child_b')).toHaveLength(1);

      const baseNow = Date.now();
      const ach: UnlockedAchievement = {
        id: 'u1',
        childId: 'child_a',
        achievementId: ACHIEVEMENTS_CATALOG[0].id,
        unlockedAt: new Date(baseNow + 60_000).toISOString()
      };
      const comp = makeCompletion(
        't1',
        'communication',
        new Date(baseNow - 120_000).toISOString(),
        7,
        100
      );
      const game = makeGame('g_tl', 'pato-ganso', '2026-11-15', baseNow - 60_000, 90);

      const timeline = buildTimelineEvents({
        completions: [comp],
        games: [game],
        unlockedAchievements: [ach],
        observations: childANotes,
        achievementsCatalog: ACHIEVEMENTS_CATALOG,
        limit: 10
      });

      expect(timeline.length).toBe(4);
      // Mais recente primeiro: achievement (+60s) -> observation (now) -> game (-60s) -> activity (-120s)
      expect(timeline.map(t => t.type)).toEqual(['achievement', 'observation', 'game', 'activity']);

      observationsService.deleteObservation(obs1.id);
      expect(observationsService.getObservations('child_a')).toHaveLength(0);
      expect(observationsService.getObservations('child_b')).toHaveLength(1);
    });
  });
});
