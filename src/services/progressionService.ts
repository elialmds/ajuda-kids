import {
  AchievementDefinition,
  ChallengeDefinition,
  ChallengePeriod,
  ChallengeProgressRecord,
  ChildProgressionSnapshot,
  SkillArea,
  XpSourceType,
  XpTransaction
} from '@/types';
import { getDaysAgoDateString, getIsoWeekKey, getTodayDateString, toLocalDateString } from '@/utils/dateUtils';
import { storageService } from './storageService';

export const ACHIEVEMENTS_CATALOG: AchievementDefinition[] = [
  {
    id: 'ach_first_step',
    title: 'Primeiro Passo',
    description: 'Concluiu sua primeira atividade ou etapa da jornada.',
    rarity: 'bronze',
    xpBonus: 25,
    targetValue: 1,
    badgeLabel: 'Início'
  },
  {
    id: 'ach_comm_explorer',
    title: 'Explorador da Fala',
    description: 'Concluiu 2 missões na Ilha da Comunicação e Fala.',
    area: 'communication',
    rarity: 'silver',
    xpBonus: 40,
    targetValue: 2,
    badgeLabel: 'Comunicação'
  },
  {
    id: 'ach_reasoning_mind',
    title: 'Mente Curiosa',
    description: 'Concluiu 2 missões de Aprendizado e Raciocínio.',
    area: 'reasoning',
    rarity: 'silver',
    xpBonus: 40,
    targetValue: 2,
    badgeLabel: 'Raciocínio'
  },
  {
    id: 'ach_attention_eagle',
    title: 'Olhos de Águia',
    description: 'Concluiu 2 missões no Bosque da Atenção e Foco.',
    area: 'attention',
    rarity: 'silver',
    xpBonus: 40,
    targetValue: 2,
    badgeLabel: 'Atenção'
  },
  {
    id: 'ach_emotional_heart',
    title: 'Coração Sereno',
    description: 'Realizou 2 momentos de inteligência emocional ou check-ins.',
    area: 'emotional',
    rarity: 'silver',
    xpBonus: 40,
    targetValue: 2,
    badgeLabel: 'Emocional'
  },
  {
    id: 'ach_motor_champ',
    title: 'Campeão do Movimento',
    description: 'Concluiu 2 desafios no Parque de Movimento.',
    area: 'motor',
    rarity: 'silver',
    xpBonus: 40,
    targetValue: 2,
    badgeLabel: 'Coordenação'
  },
  {
    id: 'ach_creativity_artist',
    title: 'Pequeno Artista',
    description: 'Criou 2 artes no Ateliê ou missões de criatividade.',
    area: 'creativity',
    rarity: 'silver',
    xpBonus: 40,
    targetValue: 2,
    badgeLabel: 'Criatividade'
  },
  {
    id: 'ach_knowledge_discoverer',
    title: 'Descobridor do Mundo',
    description: 'Concluiu 2 explorações em Conhecimentos Gerais.',
    area: 'knowledge',
    rarity: 'silver',
    xpBonus: 40,
    targetValue: 2,
    badgeLabel: 'Conhecimentos'
  },
  {
    id: 'ach_math_wizard',
    title: 'Gênio dos Números',
    description: 'Concluiu 2 desafios na Vila da Matemática.',
    area: 'math',
    rarity: 'silver',
    xpBonus: 40,
    targetValue: 2,
    badgeLabel: 'Matemática'
  },
  {
    id: 'ach_music_maestro',
    title: 'Maestro do Ritmo',
    description: 'Concluiu 2 missões sonoras no Palco da Música.',
    area: 'music',
    rarity: 'silver',
    xpBonus: 40,
    targetValue: 2,
    badgeLabel: 'Música'
  },
  {
    id: 'ach_languages_polyglot',
    title: 'Viajante Bilíngue',
    description: 'Concluiu 2 aventuras na Ponte dos Idiomas.',
    area: 'languages',
    rarity: 'silver',
    xpBonus: 40,
    targetValue: 2,
    badgeLabel: 'Idiomas'
  },
  {
    id: 'ach_journey_hero',
    title: 'Trilha Completa',
    description: 'Concluiu todas as 6 etapas de uma Jornada Diária.',
    rarity: 'gold',
    xpBonus: 60,
    targetValue: 1,
    badgeLabel: 'Jornada 6/6'
  },
  {
    id: 'ach_3d_player',
    title: 'Aventureiro do Parque 3D',
    description: 'Completou 3 partidas divertidas nos jogos 3D.',
    rarity: 'gold',
    xpBonus: 50,
    targetValue: 3,
    badgeLabel: 'Jogos 3D'
  },
  {
    id: 'ach_streak_3',
    title: 'Fogo da Constância',
    description: 'Manteve 3 dias seguidos de prática no Ajuda KIDS.',
    rarity: 'gold',
    xpBonus: 70,
    targetValue: 3,
    badgeLabel: 'Sequência'
  },
  {
    id: 'ach_all_rounder',
    title: 'Colecionador dos Mundos',
    description: 'Praticou pelo menos 1 atividade em todas as 10 áreas.',
    rarity: 'diamond',
    xpBonus: 150,
    targetValue: 10,
    badgeLabel: '10 Mundos'
  },
  {
    id: 'ach_level_5',
    title: 'Estrela em Ascensão',
    description: 'Alcançou o Nível 5 de experiência acumulando XP.',
    rarity: 'diamond',
    xpBonus: 80,
    targetValue: 5,
    badgeLabel: 'Nível 5'
  },
  {
    id: 'ach_challenge_star',
    title: 'Mestre dos Desafios',
    description: 'Completou 3 desafios diários ou semanais.',
    rarity: 'diamond',
    xpBonus: 75,
    targetValue: 3,
    badgeLabel: 'Desafios'
  }
];

export const SKILL_AREA_MEDALLION_MAP: Record<SkillArea, string> = {
  communication: 'ach_comm_explorer',
  reasoning: 'ach_reasoning_mind',
  math: 'ach_math_wizard',
  attention: 'ach_attention_eagle',
  emotional: 'ach_emotional_heart',
  motor: 'ach_motor_champ',
  creativity: 'ach_creativity_artist',
  knowledge: 'ach_knowledge_discoverer',
  music: 'ach_music_maestro',
  languages: 'ach_languages_polyglot'
};

export interface XpAwardOutcome {
  xpAdded: number;
  reason?: 'daily_cap' | 'duplicate' | 'awarded';
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  newlyUnlockedAchievements: AchievementDefinition[];
  newlyCompletedChallenges: ChallengeProgressRecord[];
  snapshot: ChildProgressionSnapshot;
}

export function getXpRequiredForLevelUp(currentLevel: number): number {
  return 100 + Math.max(0, currentLevel - 1) * 50;
}

export function getLevelTitle(level: number): string {
  if (level >= 10) return 'Lenda Ajuda KIDS';
  if (level >= 7) return 'Mestre da Turma';
  if (level >= 5) return 'Guardião das Ideias';
  if (level >= 3) return 'Explorador do Parque';
  return 'Aprendiz Curioso';
}

export function computeLevelFromXp(totalXp: number): {
  level: number;
  levelTitle: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let remaining = safeXp;
  let needed = getXpRequiredForLevelUp(level);

  while (remaining >= needed && level < 50) {
    remaining -= needed;
    level += 1;
    needed = getXpRequiredForLevelUp(level);
  }

  return {
    level,
    levelTitle: getLevelTitle(level),
    xpIntoLevel: remaining,
    xpForNextLevel: needed,
    progressPercent: Math.min(100, Math.round((remaining / Math.max(1, needed)) * 100))
  };
}

function deterministicSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function generateDailyChallengesForDate(childId: string, today: string): ChallengeDefinition[] {
  const seed = deterministicSeed(`${childId}_${today}`);
  const primaryPool: Omit<ChallengeDefinition, 'dateKey'>[] = [
    {
      id: `daily_steps_${today}`,
      period: 'daily',
      title: 'Explorador do Dia',
      description: 'Conclua 2 atividades ou etapas da trilha hoje.',
      metric: 'activities_count',
      targetCount: 2,
      xpReward: 45
    },
    {
      id: `daily_journey_${today}`,
      period: 'daily',
      title: 'Passos Firmes',
      description: 'Avance 3 etapas na Jornada Diária de hoje.',
      metric: 'journey_steps',
      targetCount: 3,
      xpReward: 50
    }
  ];

  const secondaryPool: Omit<ChallengeDefinition, 'dateKey'>[] = [
    {
      id: `daily_games_${today}`,
      period: 'daily',
      title: 'Hora de Brincar no Parque',
      description: 'Complete 1 partida em qualquer jogo do Parque 3D.',
      metric: 'games_played',
      targetCount: 1,
      xpReward: 35
    },
    {
      id: `daily_art_${today}`,
      period: 'daily',
      title: 'Pequena Obra no Ateliê',
      description: 'Salve 1 desenho criativo ou pratique hoje.',
      metric: 'drawings_saved',
      targetCount: 1,
      xpReward: 35
    },
    {
      id: `daily_emotion_${today}`,
      period: 'daily',
      title: 'Check-in dos Sentimentos',
      description: 'Conte como você está se sentindo hoje na tela inicial.',
      metric: 'emotions_checked',
      targetCount: 1,
      xpReward: 30
    }
  ];

  const c1 = primaryPool[seed % primaryPool.length];
  const c2 = secondaryPool[seed % secondaryPool.length];

  return [
    { ...c1, dateKey: today },
    { ...c2, dateKey: today }
  ];
}

export function generateWeeklyChallengesForWeek(childId: string, weekKey: string): ChallengeDefinition[] {
  const seed = deterministicSeed(`${childId}_${weekKey}`);
  const firstOptions: Omit<ChallengeDefinition, 'dateKey'>[] = [
    {
      id: `weekly_areas_${weekKey}`,
      period: 'weekly',
      title: 'Tour pelos Mundos',
      description: 'Pratique atividades em 4 áreas diferentes nesta semana.',
      metric: 'distinct_areas',
      targetCount: 4,
      xpReward: 100
    },
    {
      id: `weekly_areas5_${weekKey}`,
      period: 'weekly',
      title: 'Mente Versátil',
      description: 'Explore 5 áreas diferentes ao longo desta semana.',
      metric: 'distinct_areas',
      targetCount: 5,
      xpReward: 120
    }
  ];

  const c1 = firstOptions[seed % firstOptions.length];
  const c2: Omit<ChallengeDefinition, 'dateKey'> = {
    id: `weekly_combo_${weekKey}`,
    period: 'weekly',
    title: 'Super Semana Ativa',
    description: 'Conclua 6 atividades ou partidas de jogos 3D nesta semana.',
    metric: 'activities_count',
    targetCount: 6,
    xpReward: 110
  };

  return [
    { ...c1, dateKey: weekKey },
    { ...c2, dateKey: weekKey }
  ];
}

export class ProgressionService {
  private async collectChildData(childId: string) {
    const today = getTodayDateString();
    const weekKey = getIsoWeekKey(today);
    const journeys = await storageService.getAllJourneysForChild(childId);
    const catalogCompletions = storageService.getActivityCompletions(childId);
    const gameRecords = await storageService.getGameHistory(childId);
    const drawings = storageService.getSavedDrawings(childId);
    const emotions = await storageService.getEmotions(childId);

    // Deduplicate identical (activityId, date) events logged in both journey & catalog
    const areaCounts: Record<SkillArea, number> = {
      communication: 0,
      reasoning: 0,
      math: 0,
      attention: 0,
      emotional: 0,
      motor: 0,
      creativity: 0,
      knowledge: 0,
      music: 0,
      languages: 0
    };
    const seenActivityDateKeys = new Set<string>();
    const activeDatesSet = new Set<string>();

    let journeysCompleted = 0;
    let totalJourneyStepsDone = 0;
    let todayJourneyStepsDone = 0;
    let todayActivitiesDone = 0;
    let weekActivitiesDone = 0;
    const weekDistinctAreasSet = new Set<SkillArea>();
    const todayDistinctAreasSet = new Set<SkillArea>();

    journeys.forEach(j => {
      if (j.isCompleted) journeysCompleted += 1;
      j.steps.forEach(step => {
        if (step.status === 'completed' && step.activity) {
          totalJourneyStepsDone += 1;
          activeDatesSet.add(j.date);
          if (j.date === today) todayJourneyStepsDone += 1;

          const dedupKey = `${j.date}:${step.activity.id}`;
          seenActivityDateKeys.add(dedupKey);
          areaCounts[step.activity.area] = (areaCounts[step.activity.area] || 0) + 1;

          if (j.date === today) {
            todayActivitiesDone += 1;
            todayDistinctAreasSet.add(step.activity.area);
          }
          if (getIsoWeekKey(j.date) === weekKey) {
            weekActivitiesDone += 1;
            weekDistinctAreasSet.add(step.activity.area);
          }
        }
      });
    });

    catalogCompletions.forEach(comp => {
      const dateStr = toLocalDateString(comp.completedAt || today);
      activeDatesSet.add(dateStr);
      const dedupKey = `${dateStr}:${comp.activityId}`;
      if (seenActivityDateKeys.has(dedupKey)) return;
      seenActivityDateKeys.add(dedupKey);

      areaCounts[comp.area] = (areaCounts[comp.area] || 0) + 1;
      if (dateStr === today) {
        todayActivitiesDone += 1;
        todayDistinctAreasSet.add(comp.area);
      }
      if (getIsoWeekKey(dateStr) === weekKey) {
        weekActivitiesDone += 1;
        weekDistinctAreasSet.add(comp.area);
      }
    });

    // Count drawings toward creativity if not already filled, plus today/week metrics
    let todayDrawings = 0;
    let weekDrawings = 0;
    drawings.forEach(d => {
      const dateStr = toLocalDateString(d.createdAt || today);
      activeDatesSet.add(dateStr);
      areaCounts.creativity += 1;
      if (dateStr === today) {
        todayDrawings += 1;
        todayDistinctAreasSet.add('creativity');
      }
      if (getIsoWeekKey(dateStr) === weekKey) {
        weekDrawings += 1;
        weekDistinctAreasSet.add('creativity');
      }
    });

    let todayEmotions = 0;
    emotions.forEach(e => {
      const dateStr = e.date || today;
      activeDatesSet.add(dateStr);
      if (dateStr === today) todayEmotions += 1;
    });
    // Emotional area counts activities + unique emotion check-in days
    const uniqueEmotionDays = new Set(emotions.map(e => e.date)).size;
    areaCounts.emotional += uniqueEmotionDays;

    let todayGames = 0;
    let weekGames = 0;
    gameRecords.forEach(g => {
      const dateStr = g.date || today;
      activeDatesSet.add(dateStr);
      if (dateStr === today) todayGames += 1;
      if (getIsoWeekKey(dateStr) === weekKey) {
        weekGames += 1;
        weekActivitiesDone += 1;
      }
    });

    // Consecutive active days streak ending today or yesterday
    let streakDays = 0;
    const startOffset = activeDatesSet.has(today) ? 0 : 1;
    for (let i = startOffset; i < 365; i++) {
      if (activeDatesSet.has(getDaysAgoDateString(i))) {
        streakDays += 1;
      } else {
        break;
      }
    }

    const totalActivitiesAndSteps = Object.values(areaCounts).reduce((a, b) => a + b, 0);
    const areasTouchedCount = (Object.keys(areaCounts) as SkillArea[]).filter(
      a => areaCounts[a] > 0
    ).length;

    return {
      today,
      weekKey,
      areaCounts,
      totalActivitiesAndSteps,
      totalJourneyStepsDone,
      journeysCompleted,
      gamesCount: gameRecords.length,
      streakDays,
      areasTouchedCount,
      todayJourneyStepsDone,
      todayActivitiesDone,
      todayGames,
      todayDrawings,
      todayEmotions,
      todayDistinctAreas: todayDistinctAreasSet.size,
      weekActivitiesDone,
      weekGames,
      weekDrawings,
      weekDistinctAreas: weekDistinctAreasSet.size
    };
  }

  private evaluateChallengeMetric(
    def: ChallengeDefinition,
    metrics: Awaited<ReturnType<ProgressionService['collectChildData']>>
  ): number {
    if (def.period === 'daily') {
      switch (def.metric) {
        case 'journey_steps':
          return metrics.todayJourneyStepsDone;
        case 'activities_count':
          return metrics.todayActivitiesDone;
        case 'games_played':
          return metrics.todayGames;
        case 'drawings_saved':
          return metrics.todayDrawings;
        case 'emotions_checked':
          return metrics.todayEmotions;
        case 'distinct_areas':
          return metrics.todayDistinctAreas;
        default:
          return 0;
      }
    }

    // Weekly metrics
    switch (def.metric) {
      case 'distinct_areas':
        return metrics.weekDistinctAreas;
      case 'activities_count':
        return metrics.weekActivitiesDone;
      case 'games_played':
        return metrics.weekGames;
      case 'drawings_saved':
        return metrics.weekDrawings;
      default:
        return metrics.weekActivitiesDone;
    }
  }

  private computeAchievementCurrentValue(
    achId: string,
    metrics: Awaited<ReturnType<ProgressionService['collectChildData']>>,
    level: number,
    completedChallengesCount: number
  ): number {
    switch (achId) {
      case 'ach_first_step':
        return metrics.totalActivitiesAndSteps + metrics.gamesCount;
      case 'ach_comm_explorer':
        return metrics.areaCounts.communication;
      case 'ach_reasoning_mind':
        return metrics.areaCounts.reasoning;
      case 'ach_attention_eagle':
        return metrics.areaCounts.attention;
      case 'ach_emotional_heart':
        return metrics.areaCounts.emotional;
      case 'ach_motor_champ':
        return metrics.areaCounts.motor;
      case 'ach_creativity_artist':
        return metrics.areaCounts.creativity;
      case 'ach_knowledge_discoverer':
        return metrics.areaCounts.knowledge;
      case 'ach_math_wizard':
        return metrics.areaCounts.math;
      case 'ach_music_maestro':
        return metrics.areaCounts.music;
      case 'ach_languages_polyglot':
        return metrics.areaCounts.languages;
      case 'ach_journey_hero':
        return metrics.journeysCompleted;
      case 'ach_3d_player':
        return metrics.gamesCount;
      case 'ach_streak_3':
        return metrics.streakDays;
      case 'ach_all_rounder':
        return metrics.areasTouchedCount;
      case 'ach_level_5':
        return level;
      case 'ach_challenge_star':
        return completedChallengesCount;
      default:
        return 0;
    }
  }

  public async syncAndGetProgression(childId: string): Promise<{
    snapshot: ChildProgressionSnapshot;
    newlyUnlockedAchievements: AchievementDefinition[];
    newlyCompletedChallenges: ChallengeProgressRecord[];
    bonusXpAdded: number;
  }> {
    const metrics = await this.collectChildData(childId);
    const nowIso = new Date().toISOString();

    const dailyDefs = generateDailyChallengesForDate(childId, metrics.today);
    const weeklyDefs = generateWeeklyChallengesForWeek(childId, metrics.weekKey);
    const allDefs = [...dailyDefs, ...weeklyDefs];
    const existingChallengeRecords = storageService.getChallengeProgress(childId);
    const existingMap = new Map(existingChallengeRecords.map(r => [r.id, r]));

    const updatedChallenges: ChallengeProgressRecord[] = [];
    const newlyCompletedChallenges: ChallengeProgressRecord[] = [];
    let bonusXpAdded = 0;

    for (const def of allDefs) {
      const recordId = `${childId}:${def.id}`;
      const prev = existingMap.get(recordId);
      const currentVal = this.evaluateChallengeMetric(def, metrics);
      const cappedCount = Math.min(def.targetCount, currentVal);
      const completed = Boolean(prev?.completed) || currentVal >= def.targetCount;
      let rewardClaimed = Boolean(prev?.rewardClaimed);

      if (completed && !rewardClaimed) {
        const xpSource: XpSourceType =
          def.period === 'daily' ? 'challenge_daily' : 'challenge_weekly';
        const txResult = await storageService.saveXpTransaction({
          id: `xp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          childId,
          date: metrics.today,
          timestamp: Date.now(),
          amount: def.xpReward,
          source: xpSource,
          sourceId: `${def.period}:${def.dateKey}:${def.id}`,
          label: `Desafio concluído: ${def.title}`
        });
        if (txResult.saved) {
          bonusXpAdded += def.xpReward;
        }
        rewardClaimed = true;
      }

      const rec: ChallengeProgressRecord = {
        id: recordId,
        childId,
        challengeId: def.id,
        period: def.period,
        dateKey: def.dateKey,
        title: def.title,
        description: def.description,
        metric: def.metric,
        currentCount: completed ? def.targetCount : cappedCount,
        targetCount: def.targetCount,
        xpReward: def.xpReward,
        completed,
        rewardClaimed,
        completedAt: prev?.completedAt || (completed ? nowIso : undefined),
        updatedAt: nowIso
      };

      if (completed && !prev?.completed) {
        newlyCompletedChallenges.push(rec);
      }
      updatedChallenges.push(rec);
    }

    await storageService.upsertChallengeProgress(updatedChallenges);

    // Count total completed challenges historically for the challenge-master achievement
    const allSavedChallenges = storageService.getChallengeProgress(childId);
    const totalCompletedChallenges = allSavedChallenges.filter(c => c.completed).length;

    // Evaluate unlockable achievements against current XP level + metrics
    const existingUnlocked = storageService.getUnlockedAchievements(childId);
    const unlockedSet = new Map(existingUnlocked.map(u => [u.achievementId, u]));
    const newlyUnlockedAchievements: AchievementDefinition[] = [];

    const initialXpList = storageService.getXpTransactions(childId);
    const initialTotalXp = initialXpList.reduce((acc, t) => acc + (t.amount || 0), 0);
    const preliminaryLevel = computeLevelFromXp(initialTotalXp).level;

    for (const ach of ACHIEVEMENTS_CATALOG) {
      if (unlockedSet.has(ach.id)) continue;
      const curVal = this.computeAchievementCurrentValue(
        ach.id,
        metrics,
        preliminaryLevel,
        totalCompletedChallenges
      );
      if (curVal >= ach.targetValue) {
        const recordId = `${childId}:${ach.id}`;
        await storageService.saveUnlockedAchievement({
          id: recordId,
          childId,
          achievementId: ach.id,
          unlockedAt: nowIso,
          updatedAt: nowIso
        });
        unlockedSet.set(ach.id, {
          id: recordId,
          childId,
          achievementId: ach.id,
          unlockedAt: nowIso
        });
        const bonusRes = await storageService.saveXpTransaction({
          id: `xp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          childId,
          date: metrics.today,
          timestamp: Date.now(),
          amount: ach.xpBonus,
          source: 'achievement_bonus',
          sourceId: ach.id,
          label: `Medalha conquistada: ${ach.title}`,
          area: ach.area
        });
        if (bonusRes.saved) {
          bonusXpAdded += ach.xpBonus;
        }
        newlyUnlockedAchievements.push(ach);
      }
    }

    const finalTransactions = storageService
      .getXpTransactions(childId)
      .sort((a, b) => b.timestamp - a.timestamp);
    const totalXp = finalTransactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
    const levelInfo = computeLevelFromXp(totalXp);

    const achievementProgressMap: ChildProgressionSnapshot['achievementProgressMap'] = {};
    for (const ach of ACHIEVEMENTS_CATALOG) {
      const unlockedEntry = unlockedSet.get(ach.id);
      const curVal = this.computeAchievementCurrentValue(
        ach.id,
        metrics,
        levelInfo.level,
        totalCompletedChallenges
      );
      achievementProgressMap[ach.id] = {
        current: unlockedEntry ? ach.targetValue : Math.min(ach.targetValue, curVal),
        target: ach.targetValue,
        unlocked: Boolean(unlockedEntry),
        unlockedAt: unlockedEntry?.unlockedAt
      };
    }

    const snapshot: ChildProgressionSnapshot = {
      childId,
      totalXp,
      level: levelInfo.level,
      levelTitle: levelInfo.levelTitle,
      xpIntoLevel: levelInfo.xpIntoLevel,
      xpForNextLevel: levelInfo.xpForNextLevel,
      progressPercent: levelInfo.progressPercent,
      streakDays: metrics.streakDays,
      unlockedAchievementIds: Array.from(unlockedSet.keys()),
      achievementProgressMap,
      achievementsUnlockedCount: unlockedSet.size,
      totalAchievementsCount: ACHIEVEMENTS_CATALOG.length,
      dailyChallenges: updatedChallenges.filter(c => c.period === 'daily'),
      weeklyChallenges: updatedChallenges.filter(c => c.period === 'weekly'),
      recentXpTransactions: finalTransactions.slice(0, 15)
    };

    return {
      snapshot,
      newlyUnlockedAchievements,
      newlyCompletedChallenges,
      bonusXpAdded
    };
  }

  private async grantXpAndSync(params: {
    childId: string;
    date: string;
    amount: number;
    source: XpSourceType;
    sourceId: string;
    label: string;
    area?: SkillArea;
  }): Promise<XpAwardOutcome> {
    const prevList = storageService.getXpTransactions(params.childId);
    const prevXp = prevList.reduce((acc, tx) => acc + (tx.amount || 0), 0);
    const prevLevel = computeLevelFromXp(prevXp).level;

    let savedAmount = 0;
    let reason: XpAwardOutcome['reason'] = 'duplicate';

    if (params.amount > 0) {
      const res = await storageService.saveXpTransaction({
        id: `xp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        childId: params.childId,
        date: params.date,
        timestamp: Date.now(),
        amount: params.amount,
        source: params.source,
        sourceId: params.sourceId,
        label: params.label,
        area: params.area
      });
      if (res.saved) {
        savedAmount = params.amount;
        reason = 'awarded';
      }
    }

    const synced = await this.syncAndGetProgression(params.childId);
    const totalXpAdded = savedAmount + synced.bonusXpAdded;
    if (totalXpAdded > 0) {
      await storageService.pushSyncToServer();
    }

    return {
      xpAdded: totalXpAdded,
      reason,
      leveledUp: synced.snapshot.level > prevLevel,
      previousLevel: prevLevel,
      newLevel: synced.snapshot.level,
      newlyUnlockedAchievements: synced.newlyUnlockedAchievements,
      newlyCompletedChallenges: synced.newlyCompletedChallenges,
      snapshot: synced.snapshot
    };
  }

  public async recordJourneyStepXp(
    childId: string,
    dateStr: string,
    stepIndex: number,
    activityTitle: string,
    area: SkillArea,
    score: number = 100,
    isJourneyCompletedNow: boolean = false
  ): Promise<XpAwardOutcome> {
    const stepAmount = score >= 95 ? 40 : 35;
    const stepOutcome = await this.grantXpAndSync({
      childId,
      date: dateStr,
      amount: stepAmount,
      source: 'journey_step',
      sourceId: `${dateStr}:step_${stepIndex}`,
      label: `Jornada (${stepIndex + 1}/6): ${activityTitle}`,
      area
    });

    if (!isJourneyCompletedNow) {
      return stepOutcome;
    }

    const bonusOutcome = await this.grantXpAndSync({
      childId,
      date: dateStr,
      amount: 80,
      source: 'journey_bonus',
      sourceId: `${dateStr}:journey_complete`,
      label: 'Bônus de Jornada Completa (6/6)!'
    });

    return {
      ...bonusOutcome,
      xpAdded: stepOutcome.xpAdded + bonusOutcome.xpAdded,
      leveledUp: bonusOutcome.snapshot.level > stepOutcome.previousLevel,
      previousLevel: stepOutcome.previousLevel,
      newLevel: bonusOutcome.snapshot.level,
      newlyUnlockedAchievements: [
        ...stepOutcome.newlyUnlockedAchievements,
        ...bonusOutcome.newlyUnlockedAchievements
      ],
      newlyCompletedChallenges: [
        ...stepOutcome.newlyCompletedChallenges,
        ...bonusOutcome.newlyCompletedChallenges
      ]
    };
  }

  public async recordCatalogActivityXp(
    childId: string,
    activityId: string,
    activityTitle: string,
    area: SkillArea,
    score: number = 100
  ): Promise<XpAwardOutcome> {
    const today = getTodayDateString();
    const todayCatalogXpCount = storageService
      .getXpTransactions(childId)
      .filter(tx => tx.date === today && tx.source === 'activity').length;

    if (todayCatalogXpCount >= 6) {
      const synced = await this.syncAndGetProgression(childId);
      return {
        xpAdded: 0,
        reason: 'daily_cap',
        leveledUp: false,
        previousLevel: synced.snapshot.level,
        newLevel: synced.snapshot.level,
        newlyUnlockedAchievements: synced.newlyUnlockedAchievements,
        newlyCompletedChallenges: synced.newlyCompletedChallenges,
        snapshot: synced.snapshot
      };
    }

    const amount = score >= 90 ? 50 : 40;
    return this.grantXpAndSync({
      childId,
      date: today,
      amount,
      source: 'activity',
      sourceId: `${today}:act_${activityId}`,
      label: `Missão concluída: ${activityTitle}`,
      area
    });
  }

  public async recordGameXp(
    childId: string,
    gameId: string,
    gameRecordId: string,
    score: number = 100
  ): Promise<XpAwardOutcome> {
    const today = getTodayDateString();
    const todayGameXpCount = storageService
      .getXpTransactions(childId)
      .filter(tx => tx.date === today && tx.source === 'game_3d').length;

    if (todayGameXpCount >= 5) {
      const synced = await this.syncAndGetProgression(childId);
      return {
        xpAdded: 0,
        reason: 'daily_cap',
        leveledUp: false,
        previousLevel: synced.snapshot.level,
        newLevel: synced.snapshot.level,
        newlyUnlockedAchievements: synced.newlyUnlockedAchievements,
        newlyCompletedChallenges: synced.newlyCompletedChallenges,
        snapshot: synced.snapshot
      };
    }

    const bonus = score >= 150 ? 20 : score >= 80 ? 10 : 0;
    return this.grantXpAndSync({
      childId,
      date: today,
      amount: 30 + bonus,
      source: 'game_3d',
      sourceId: gameRecordId,
      label: `Partida no Parque: ${gameId}`
    });
  }

  public async recordDrawingXp(
    childId: string,
    drawingId: string,
    title: string
  ): Promise<XpAwardOutcome> {
    const today = getTodayDateString();
    const todayDrawingXpCount = storageService
      .getXpTransactions(childId)
      .filter(tx => tx.date === today && tx.source === 'drawing').length;

    if (todayDrawingXpCount >= 3) {
      const synced = await this.syncAndGetProgression(childId);
      return {
        xpAdded: 0,
        reason: 'daily_cap',
        leveledUp: false,
        previousLevel: synced.snapshot.level,
        newLevel: synced.snapshot.level,
        newlyUnlockedAchievements: synced.newlyUnlockedAchievements,
        newlyCompletedChallenges: synced.newlyCompletedChallenges,
        snapshot: synced.snapshot
      };
    }

    return this.grantXpAndSync({
      childId,
      date: today,
      amount: 25,
      source: 'drawing',
      sourceId: drawingId,
      label: `Obra no Ateliê: ${title}`,
      area: 'creativity'
    });
  }

  public async recordEmotionXp(childId: string, dateStr: string): Promise<XpAwardOutcome> {
    return this.grantXpAndSync({
      childId,
      date: dateStr,
      amount: 20,
      source: 'emotion',
      sourceId: `${dateStr}:emotion`,
      label: 'Check-in emocional diário',
      area: 'emotional'
    });
  }
}

export const progressionService = new ProgressionService();
