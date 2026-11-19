import { DailyJourney, DailyJourneyStep, ChildProfile, ActivityItem } from '@/types';
import { getTodayDateString } from '@/utils/dateUtils';
import { ACTIVITIES_DATABASE } from '@/data/activitiesData';
import { storageService } from './storageService';
import { progressionService } from './progressionService';

export class JourneyService {
  /**
   * Generates or fetches today's personalized daily journey for the given child.
   * Balances the 5 core pillars across the week based on child's age and target areas.
   */
  public async getOrCreateTodayJourney(child: ChildProfile): Promise<DailyJourney> {
    const today = getTodayDateString();
    const existing = await storageService.getDailyJourney(child.id, today);
    if (existing) {
      return existing;
    }

    // Generate new journey structured according to the 5 stages
    const steps = this.generateJourneySteps(child, today);
    const newJourney: DailyJourney = {
      id: `journey_${child.id}_${today}`,
      childId: child.id,
      date: today,
      steps,
      currentStepIndex: 0,
      isCompleted: false,
      totalMinutesSpent: 0
    };

    await storageService.saveDailyJourney(newJourney);
    return newJourney;
  }

  private generateJourneySteps(child: ChildProfile, dateStr: string): DailyJourneyStep[] {
    const age = child.ageGroup;
    const seed = this.getSeedFromDate(dateStr) + child.id.charCodeAt(0);
    const pool = ACTIVITIES_DATABASE.filter(a => a.ageGroup === age || a.id.includes('all'));
    const fallbackPool = pool.length >= 6 ? pool : ACTIVITIES_DATABASE;

    const usedIds = new Set<string>();
    const pickUnique = (candidates: ActivityItem[], offset: number): ActivityItem => {
      const filtered = candidates.filter(a => !usedIds.has(a.id));
      const source =
        filtered.length > 0
          ? filtered
          : fallbackPool.filter(a => !usedIds.has(a.id));
      const chosen =
        source.length > 0
          ? source[(seed + offset) % source.length]
          : fallbackPool[(seed + offset) % fallbackPool.length];
      usedIds.add(chosen.id);
      return chosen;
    };

    // 6-step balanced daily trail weaving across all 10 educational categories
    const step1 = pickUnique(fallbackPool.filter(a => a.area === 'emotional'), 0);
    const step2 = pickUnique(fallbackPool.filter(a => a.area === 'communication' || a.area === 'languages'), 1);
    const step3 = pickUnique(fallbackPool.filter(a => a.area === 'reasoning' || a.area === 'math'), 2);
    const step4 = pickUnique(fallbackPool.filter(a => a.area === 'attention'), 3);
    const step5 = pickUnique(
      fallbackPool.filter(a => a.area === 'creativity' || a.area === 'knowledge' || a.area === 'music'),
      4
    );
    const step6 = pickUnique(fallbackPool.filter(a => a.area === 'motor'), 5);

    const selectedActivities: ActivityItem[] = [step1, step2, step3, step4, step5, step6];

    return selectedActivities.map((activity, idx) => ({
      stepIndex: idx,
      activityId: activity.id,
      activity,
      status: 'pending'
    }));
  }

  private getSeedFromDate(dateStr: string): number {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  public async updateStepProgress(
    journey: DailyJourney,
    stepIndex: number,
    status: 'in_progress' | 'completed',
    score?: number
  ): Promise<DailyJourney> {
    const updatedSteps = [...journey.steps];
    const current = updatedSteps[stepIndex];
    if (current) {
      updatedSteps[stepIndex] = {
        ...current,
        status,
        score: score !== undefined ? score : current.score,
        completedAt: status === 'completed' ? Date.now() : current.completedAt,
        startedAt: current.startedAt || Date.now()
      };
    }

    const allCompleted = updatedSteps.every(s => s.status === 'completed');
    const nextStepIndex = Math.min(stepIndex + (status === 'completed' ? 1 : 0), updatedSteps.length);

    // Sum estimated or tracked minutes
    const totalMinutesSpent = updatedSteps.reduce((acc, s) => {
      return acc + (s.status === 'completed' ? s.activity.durationMinutes : 0);
    }, 0);

    const updatedJourney: DailyJourney = {
      ...journey,
      steps: updatedSteps,
      currentStepIndex: nextStepIndex,
      isCompleted: allCompleted,
      completedAt: allCompleted ? new Date().toISOString() : journey.completedAt,
      totalMinutesSpent
    };

    await storageService.saveDailyJourney(updatedJourney);

    // Track time spent and deterministic XP progression
    if (status === 'completed') {
      const completedStep = updatedSteps[stepIndex];
      const minutesToAdd = completedStep?.activity.durationMinutes || 4;
      storageService.addTodayMinutesSpent(journey.childId, minutesToAdd);
      if (completedStep?.activity) {
        await progressionService.recordJourneyStepXp(
          journey.childId,
          journey.date,
          stepIndex,
          completedStep.activity.title,
          completedStep.activity.area,
          score ?? 100,
          allCompleted && !journey.isCompleted
        );
      }
    }

    return updatedJourney;
  }
}

export const journeyService = new JourneyService();
