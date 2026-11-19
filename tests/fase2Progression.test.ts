import { describe, it, expect, beforeEach } from 'vitest';
import {
  ACHIEVEMENTS_CATALOG,
  ProgressionService,
  computeLevelFromXp,
  getLevelTitle,
  getXpRequiredForLevelUp
} from '../src/services/progressionService';
import { JourneyService } from '../src/services/journeyService';
import { GamesService } from '../src/services/gamesService';
import { EvolutionService } from '../src/services/evolutionService';
import { storageService } from '../src/services/storageService';
import { ChildProfile } from '../src/types';
import { getTodayDateString } from '../src/utils/dateUtils';

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

function makeChild(overrides?: Partial<ChildProfile>): ChildProfile {
  return {
    id: 'child_fase2_test',
    familyId: 'fam_fase2_test',
    name: 'Luna',
    age: 6,
    ageGroup: '6-7',
    avatar: 'Estrela',
    targetSkills: ['communication', 'reasoning'],
    createdAt: '2026-01-01T10:00:00.000Z',
    ...overrides
  };
}

describe('Fase 2 — Sistema de Progresso, XP, Conquistas, Desafios e Evolução', () => {
  let progression: ProgressionService;
  let journeySvc: JourneyService;
  let gamesSvc: GamesService;
  let evolutionSvc: EvolutionService;
  let child: ChildProfile;

  beforeEach(() => {
    localStorage.clear();
    progression = new ProgressionService();
    journeySvc = new JourneyService();
    gamesSvc = new GamesService();
    evolutionSvc = new EvolutionService();
    child = makeChild();
  });

  describe('1. Curva Progressiva de Níveis e XP', () => {
    it('calcula corretamente limites de nível e títulos', () => {
      expect(getXpRequiredForLevelUp(1)).toBe(100);
      expect(getXpRequiredForLevelUp(2)).toBe(150);
      expect(getXpRequiredForLevelUp(3)).toBe(200);

      expect(computeLevelFromXp(0)).toMatchObject({
        level: 1,
        levelTitle: 'Aprendiz Curioso',
        xpIntoLevel: 0,
        xpForNextLevel: 100,
        progressPercent: 0
      });

      expect(computeLevelFromXp(99).level).toBe(1);
      expect(computeLevelFromXp(100)).toMatchObject({
        level: 2,
        xpIntoLevel: 0,
        xpForNextLevel: 150
      });

      expect(computeLevelFromXp(250)).toMatchObject({
        level: 3,
        levelTitle: 'Explorador do Parque',
        xpIntoLevel: 0,
        xpForNextLevel: 200
      });

      expect(computeLevelFromXp(700)).toMatchObject({
        level: 5,
        levelTitle: getLevelTitle(5)
      });
    });
  });

  describe('2. Anti-Farming, Idempotência e Limites Diários de XP', () => {
    it('impede XP duplicado para mesma etapa de jornada no mesmo dia e garante bônus único 6/6', async () => {
      const today = getTodayDateString();
      const first = await progression.recordJourneyStepXp(child.id, today, 0, 'Passo 1', 'communication', 100, false);
      expect(first.xpAdded).toBe(40);
      expect(first.reason).toBe('awarded');

      const duplicate = await progression.recordJourneyStepXp(child.id, today, 0, 'Passo 1', 'communication', 100, false);
      expect(duplicate.xpAdded).toBe(0);
      expect(duplicate.reason).toBe('duplicate');

      const completeStep = await progression.recordJourneyStepXp(child.id, today, 5, 'Passo 6', 'knowledge', 90, true);
      expect(completeStep.xpAdded).toBe(35 + 80);

      const repeatComplete = await progression.recordJourneyStepXp(child.id, today, 5, 'Passo 6', 'knowledge', 90, true);
      expect(repeatComplete.xpAdded).toBe(0);
    });

    it('deduplica mesma atividade de catálogo no dia e aplica teto diário de 6 atividades com XP', async () => {
      const r1 = await progression.recordCatalogActivityXp(child.id, 'act_same', 'Contar Histórias', 'communication', 95);
      expect(r1.xpAdded).toBe(50);

      const rDup = await progression.recordCatalogActivityXp(child.id, 'act_same', 'Contar Histórias', 'communication', 95);
      expect(rDup.xpAdded).toBe(0);
      expect(rDup.reason).toBe('duplicate');

      for (let i = 2; i <= 6; i++) {
        const res = await progression.recordCatalogActivityXp(child.id, `act_${i}`, `Atividade ${i}`, 'reasoning', 80);
        expect(res.xpAdded).toBe(40);
      }

      const capped = await progression.recordCatalogActivityXp(child.id, 'act_7', 'Atividade 7', 'reasoning', 100);
      expect(capped.xpAdded).toBe(0);
      expect(capped.reason).toBe('daily_cap');
    });

    it('aplica limite diário de XP em jogos 3D (5/dia), desenhos (3/dia, idempotente) e emoção (1/dia)', async () => {
      const today = getTodayDateString();

      // Emoção: 1x por dia
      const emo1 = await progression.recordEmotionXp(child.id, today);
      expect(emo1.xpAdded).toBe(20);
      const emo2 = await progression.recordEmotionXp(child.id, today);
      expect(emo2.xpAdded).toBe(0);

      // Desenho: mesmo ID não duplica e máx 3 por dia
      const d1 = await progression.recordDrawingXp(child.id, 'draw_1', 'Sol');
      expect(d1.xpAdded).toBe(25);
      const d1Edit = await progression.recordDrawingXp(child.id, 'draw_1', 'Sol Editado');
      expect(d1Edit.xpAdded).toBe(0);
      await progression.recordDrawingXp(child.id, 'draw_2', 'Casa');
      await progression.recordDrawingXp(child.id, 'draw_3', 'Flor');
      const dCap = await progression.recordDrawingXp(child.id, 'draw_4', 'Foguete');
      expect(dCap.xpAdded).toBe(0);
      expect(dCap.reason).toBe('daily_cap');

      // Jogos 3D: máx 5 partidas com XP por dia
      for (let i = 1; i <= 5; i++) {
        const g = await progression.recordGameXp(child.id, 'morto_vivo', `rec_${i}`, 150);
        expect(g.xpAdded).toBe(50);
      }
      const gCap = await progression.recordGameXp(child.id, 'morto_vivo', 'rec_6', 150);
      expect(gCap.xpAdded).toBe(0);
      expect(gCap.reason).toBe('daily_cap');
    });
  });

  describe('3. Conquistas Reais Desbloqueáveis & Desafios Rotativos', () => {
    it('criança nova começa com 0 medalhas desbloqueadas e sem conquistas falsas', async () => {
      const { snapshot } = await progression.syncAndGetProgression(child.id);
      expect(snapshot.totalXp).toBe(0);
      expect(snapshot.level).toBe(1);
      expect(snapshot.achievementsUnlockedCount).toBe(0);
      expect(snapshot.totalAchievementsCount).toBe(ACHIEVEMENTS_CATALOG.length);
      expect(Object.values(snapshot.achievementProgressMap).every(p => !p.unlocked)).toBe(true);
      expect(snapshot.dailyChallenges).toHaveLength(2);
      expect(snapshot.weeklyChallenges).toHaveLength(2);
    });

    it('desbloqueia medalhas e reivindica recompensa de desafio automaticamente uma única vez', async () => {
      // Conclui 1 atividade real de comunicação -> desbloqueia ach_first_step (+25 bonus XP)
      await storageService.recordActivityCompletion({
        childId: child.id,
        familyId: child.familyId,
        activityId: 'comm_1',
        activityTitle: 'Falar Palavras',
        area: 'communication',
        durationMinutes: 5,
        score: 100
      });
      const out1 = await progression.recordCatalogActivityXp(child.id, 'comm_1', 'Falar Palavras', 'communication', 100);
      expect(out1.newlyUnlockedAchievements.some(a => a.id === 'ach_first_step')).toBe(true);
      expect(out1.snapshot.achievementProgressMap['ach_comm_explorer'].unlocked).toBe(false);
      expect(out1.snapshot.achievementProgressMap['ach_comm_explorer'].current).toBe(1);

      // Conclui 2ª atividade de comunicação -> desbloqueia ach_comm_explorer (+40 bonus XP) e completa desafio diário de 2 atividades
      await storageService.recordActivityCompletion({
        childId: child.id,
        familyId: child.familyId,
        activityId: 'comm_2',
        activityTitle: 'História Curta',
        area: 'communication',
        durationMinutes: 5,
        score: 95
      });
      const out2 = await progression.recordCatalogActivityXp(child.id, 'comm_2', 'História Curta', 'communication', 95);
      expect(out2.newlyUnlockedAchievements.some(a => a.id === 'ach_comm_explorer')).toBe(true);
      expect(out2.snapshot.achievementsUnlockedCount).toBeGreaterThanOrEqual(2);

      // XP acumulado não deve multiplicar em sync subsequente
      const xpAfterUnlock = out2.snapshot.totalXp;
      const resync = await progression.syncAndGetProgression(child.id);
      expect(resync.snapshot.totalXp).toBe(xpAfterUnlock);
      expect(resync.bonusXpAdded).toBe(0);
    });

    it('desbloqueia Trilha Completa (ach_journey_hero) e Aventureiro 3D (ach_3d_player) pelas ações reais', async () => {
      let journey = await journeySvc.getOrCreateTodayJourney(child);
      for (let i = 0; i < 6; i++) {
        journey = await journeySvc.updateStepProgress(journey, i, 'completed', 100);
      }

      // Completa 3 partidas via GamesService (desbloqueia jogadas ilimitadas após jornada 6/6)
      for (let g = 0; g < 3; g++) {
        const playRes = await gamesSvc.recordAndConsumePlay(child.id, 'pato_pato_ganso', 45, 100);
        expect(playRes.success).toBe(true);
      }

      const { snapshot } = await progression.syncAndGetProgression(child.id);
      expect(snapshot.unlockedAchievementIds).toContain('ach_journey_hero');
      expect(snapshot.unlockedAchievementIds).toContain('ach_3d_player');
      expect(snapshot.totalXp).toBeGreaterThan(250);
      expect(snapshot.level).toBeGreaterThanOrEqual(3);
    });
  });

  describe('4. EvolutionService sem Duplicação Multi-Fonte', () => {
    it('gera relatório zerado para criança nova e agrega sem duplicar jornada + catálogo iguais', async () => {
      const emptyReport = await evolutionSvc.generateReport(child, 'week');
      expect(emptyReport.totalActivitiesCatalog).toBe(0);
      expect(emptyReport.gamesPlayed).toBe(0);
      expect(emptyReport.drawingsCreated).toBe(0);
      expect(emptyReport.xpEarned).toBe(0);
      expect(emptyReport.level).toBe(1);
      expect(emptyReport.offlineActivitiesSuggested.length).toBeGreaterThan(0);

      // Cria jornada e completa etapa 0
      const journey = await journeySvc.getOrCreateTodayJourney(child);
      const stepActivity = journey.steps[0].activity;
      await journeySvc.updateStepProgress(journey, 0, 'completed', 90);

      // Simula ActivitiesCatalogView gravando também a mesma atividade no mesmo dia
      await storageService.recordActivityCompletion({
        childId: child.id,
        familyId: child.familyId,
        activityId: stepActivity.id,
        activityTitle: stepActivity.title,
        area: stepActivity.area,
        durationMinutes: stepActivity.durationMinutes,
        score: 90
      });

      // Adiciona desenho + emoção + jogo 3D
      await storageService.saveDrawing({
        id: 'draw_evo_1',
        childId: child.id,
        title: 'Nuvem Feliz',
        dataUrl: 'data:image/png;base64,AAA',
        createdAt: new Date().toISOString()
      });
      await storageService.recordEmotion({
        id: 'emo_evo_1',
        childId: child.id,
        date: getTodayDateString(),
        timestamp: Date.now(),
        emotion: 'happy'
      });
      const settings = await storageService.getParentSettings();
      await storageService.saveParentSettings({ ...settings, unlimitedGames: true });
      const playRes = await gamesSvc.recordAndConsumePlay(child.id, 'morto_vivo', 60, 120);
      expect(playRes.success).toBe(true);

      const report = await evolutionSvc.generateReport(child, 'week');
      // Atividade de jornada + mesma atividade no catálogo no mesmo dia NÃO deve contar 2x na área
      const totalSkillActivities = Object.values(report.skills).reduce((s, item) => s + item.activitiesCompleted, 0);
      // Espera 1 atividade (etapa) + 1 desenho (creativity) + 1 emoção (emotional) = 3 se etapa não for criatividade/emocional, ou somado coerentemente
      expect(totalSkillActivities).toBe(3);
      expect(report.gamesPlayed).toBe(1);
      expect(report.drawingsCreated).toBe(1);
      expect((report.xpEarned ?? 0)).toBeGreaterThan(0);
    });
  });
});
