import { describe, it, expect, beforeEach } from 'vitest';
import { ACTIVITIES_DATABASE, getActivitiesForChild } from '../src/data/activitiesData';
import { MUNDO_COMPANIONS } from '../src/data/charactersData';
import { WORLD_TOKENS } from '../src/design-system/tokens';
import {
  ACHIEVEMENTS_CATALOG,
  SKILL_AREA_MEDALLION_MAP,
  ProgressionService
} from '../src/services/progressionService';
import { JourneyService } from '../src/services/journeyService';
import { EvolutionService } from '../src/services/evolutionService';
import { storageService } from '../src/services/storageService';
import { AgeGroup, ChildProfile, SkillArea } from '../src/types';

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

const ALL_TEN_AREAS: SkillArea[] = [
  'communication',
  'reasoning',
  'math',
  'attention',
  'emotional',
  'motor',
  'creativity',
  'knowledge',
  'music',
  'languages'
];

const NEW_FASE3_AREAS: SkillArea[] = ['math', 'music', 'languages'];
const ALL_AGE_GROUPS: AgeGroup[] = ['4-6', '7-9', '10-12'];

function makeChild(overrides?: Partial<ChildProfile>): ChildProfile {
  return {
    id: 'child_fase3_test',
    familyId: 'fam_fase3_test',
    name: 'Sofia',
    age: 8,
    ageGroup: '7-9',
    avatar: 'Estrela',
    targetSkills: ['math', 'music', 'languages'],
    createdAt: '2026-01-01T10:00:00.000Z',
    ...overrides
  };
}

describe('Fase 3 — Expansão para 10 Categorias e Novos Exercícios Interativos', () => {
  let progression: ProgressionService;
  let journeySvc: JourneyService;
  let evolutionSvc: EvolutionService;

  beforeEach(() => {
    localStorage.clear();
    progression = new ProgressionService();
    journeySvc = new JourneyService();
    evolutionSvc = new EvolutionService();
  });

  describe('1. Contratos das 10 Áreas de Aprendizagem', () => {
    it('registra todas as 10 áreas em WORLD_TOKENS, MUNDO_COMPANIONS, SKILL_AREA_MEDALLION_MAP e catálogo', () => {
      expect(MUNDO_COMPANIONS).toHaveLength(10);
      expect(ACHIEVEMENTS_CATALOG).toHaveLength(17);

      ALL_TEN_AREAS.forEach((area) => {
        expect(WORLD_TOKENS[area]).toBeDefined();
        expect(WORLD_TOKENS[area].darkCardBg).toMatch(/^#/);
        expect(MUNDO_COMPANIONS.some((c) => c.skillArea === area)).toBe(true);
        expect(SKILL_AREA_MEDALLION_MAP[area]).toBeTruthy();

        const activitiesInArea = ACTIVITIES_DATABASE.filter((a) => a.area === area);
        expect(activitiesInArea.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('cobre todas as faixas etárias (4-6, 7-9, 10-12) nas novas áreas (math, music, languages)', () => {
      NEW_FASE3_AREAS.forEach((area) => {
        ALL_AGE_GROUPS.forEach((ageGroup) => {
          const matching = ACTIVITIES_DATABASE.filter(
            (a) => a.area === area && a.ageGroup === ageGroup
          );
          expect(matching.length).toBeGreaterThanOrEqual(1);
        });
      });

      expect(ACTIVITIES_DATABASE.length).toBeGreaterThanOrEqual(38);
    });
  });

  describe('2. Integridade dos Novos Tipos de Exercício (visual_math, rhythm_echo, word_build)', () => {
    it('valida todos os blocos visual_math, rhythm_echo e word_build do catálogo completo', () => {
      const allBlocks = ACTIVITIES_DATABASE.flatMap((act) => [
        act.content,
        ...(act.tasks || [])
      ]);

      const visualMathBlocks = allBlocks.filter((b) => b.type === 'visual_math');
      const rhythmEchoBlocks = allBlocks.filter((b) => b.type === 'rhythm_echo');
      const wordBuildBlocks = allBlocks.filter((b) => b.type === 'word_build');

      expect(visualMathBlocks.length).toBeGreaterThanOrEqual(5);
      expect(rhythmEchoBlocks.length).toBeGreaterThanOrEqual(5);
      expect(wordBuildBlocks.length).toBeGreaterThanOrEqual(3);

      visualMathBlocks.forEach((block) => {
        expect(block.mathVisual).toBeDefined();
        const mv = block.mathVisual!;
        expect(mv.leftCount).toBeGreaterThan(0);
        expect(mv.targetAnswer).toBeGreaterThanOrEqual(0);
        if (mv.operator === '+') {
          expect(mv.leftCount + (mv.rightCount || 0)).toBe(mv.targetAnswer);
        } else if (mv.operator === '-') {
          expect(mv.leftCount - (mv.rightCount || 0)).toBe(mv.targetAnswer);
        } else if (mv.operator === '×') {
          expect(mv.leftCount * (mv.rightCount || 1)).toBe(mv.targetAnswer);
        } else if (mv.operator === '=') {
          expect(mv.leftCount).toBe(mv.targetAnswer);
        }
      });

      rhythmEchoBlocks.forEach((block) => {
        expect(block.rhythmNotes && block.rhythmNotes.length).toBeGreaterThanOrEqual(3);
        expect(block.rhythmTargetIds && block.rhythmTargetIds.length).toBeGreaterThanOrEqual(3);
        const noteIds = new Set(block.rhythmNotes!.map((n) => n.id));
        block.rhythmTargetIds!.forEach((id) => {
          expect(noteIds.has(id)).toBe(true);
        });
      });

      wordBuildBlocks.forEach((block) => {
        expect(block.targetWord).toBeTruthy();
        expect(block.wordParts).toBeDefined();
        const target = block.targetWord!;
        const parts = block.wordParts!;
        // ActivityRunner checks built.length === targetWord.length, so every wordPart must be 1 char
        expect(parts.every((p) => p.length === 1)).toBe(true);
        expect(parts.length).toBe(target.length);
        expect([...parts].sort().join('')).toBe(target.split('').sort().join(''));
      });
    });
  });

  describe('3. Jornadas, XP, Conquistas e Relatório para 10 Áreas', () => {
    it('gera jornada diária com atividades únicas e incorpora novas áreas priorizadas', async () => {
      const child = makeChild({ targetSkills: ['math', 'music', 'languages'] });
      const recommended = getActivitiesForChild(child.ageGroup, child.targetSkills);
      expect(recommended.some((a) => a.area === 'math')).toBe(true);

      const journey = await journeySvc.getOrCreateTodayJourney(child);
      expect(journey.steps).toHaveLength(6);

      const uniqueIds = new Set(journey.steps.map((s) => s.activityId));
      expect(uniqueIds.size).toBe(6);
      expect(
        journey.steps.some((s) =>
          NEW_FASE3_AREAS.includes(s.activity.area)
        )
      ).toBe(true);
    });

    it('desbloqueia ach_math_wizard, ach_music_maestro, ach_languages_polyglot e ach_all_rounder (10/10)', async () => {
      const child = makeChild();

      // 2 activities each in math, music, languages -> unlock the 3 new area medallions
      for (const area of NEW_FASE3_AREAS) {
        for (let idx = 1; idx <= 2; idx++) {
          const actId = `${area}_test_${idx}`;
          await storageService.recordActivityCompletion({
            childId: child.id,
            familyId: child.familyId,
            activityId: actId,
            activityTitle: `Missão ${area} #${idx}`,
            area,
            durationMinutes: 6,
            score: 100
          });
          await progression.recordCatalogActivityXp(
            child.id,
            actId,
            `Missão ${area} #${idx}`,
            area,
            100
          );
        }
      }

      const midSync = await progression.syncAndGetProgression(child.id);
      expect(midSync.snapshot.unlockedAchievementIds).toContain('ach_math_wizard');
      expect(midSync.snapshot.unlockedAchievementIds).toContain('ach_music_maestro');
      expect(midSync.snapshot.unlockedAchievementIds).toContain('ach_languages_polyglot');
      expect(midSync.snapshot.achievementProgressMap['ach_all_rounder'].current).toBe(3);
      expect(midSync.snapshot.achievementProgressMap['ach_all_rounder'].unlocked).toBe(false);

      // Complete 1 activity in each of the remaining 7 areas to reach 10/10
      const remainingAreas = ALL_TEN_AREAS.filter((a) => !NEW_FASE3_AREAS.includes(a));
      for (const area of remainingAreas) {
        const actId = `${area}_test_1`;
        await storageService.recordActivityCompletion({
          childId: child.id,
          familyId: child.familyId,
          activityId: actId,
          activityTitle: `Missão ${area}`,
          area,
          durationMinutes: 5,
          score: 95
        });
        await progression.recordCatalogActivityXp(child.id, actId, `Missão ${area}`, area, 95);
      }

      const finalSync = await progression.syncAndGetProgression(child.id);
      expect(finalSync.snapshot.achievementProgressMap['ach_all_rounder'].current).toBe(10);
      expect(finalSync.snapshot.unlockedAchievementIds).toContain('ach_all_rounder');

      const report = await evolutionSvc.generateReport(child, 'week');
      ALL_TEN_AREAS.forEach((area) => {
        expect(report.skills[area].activitiesCompleted).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
