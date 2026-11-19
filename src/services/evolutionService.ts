import { ChildProfile, EvolutionReport, SkillArea, SkillStats } from '@/types';
import { storageService } from './storageService';
import { progressionService } from './progressionService';
import { getLast7Days, getDayNameShort, getTodayDateString, toLocalDateString } from '@/utils/dateUtils';

const AREA_LABELS: Record<SkillArea, string> = {
  communication: 'Comunicação e Fala',
  reasoning: 'Aprendizado e Raciocínio',
  math: 'Matemática Lúdica',
  attention: 'Atenção e Concentração',
  emotional: 'Inteligência Emocional',
  motor: 'Coordenação e Movimento',
  creativity: 'Criatividade e Arte',
  knowledge: 'Conhecimentos Gerais',
  music: 'Música e Ritmo',
  languages: 'Inglês e Idiomas'
};

const OFFLINE_TIPS: Record<SkillArea, string[]> = {
  communication: [
    'Leiam juntos uma história curta antes de dormir e peçam para a criança recontar com as palavras dela.',
    'Brinquem de "rimas malucas" durante o almoço (ex: o que rima com prato? Sapato!).'
  ],
  reasoning: [
    'Envolva a criança na contagem de objetos ao guardar compras ou arrumar brinquedos.',
    'Façam brincadeiras de adivinhações e charadas leves sobre animais e objetos comuns.'
  ],
  math: [
    'Usem frutas, talheres ou tampinhas para montar contas divertidas de somar e dividir na mesa.',
    'Comparem medidas e preços simples juntos em um mercadinho imaginário em casa.'
  ],
  attention: [
    'Brinque de "O que sumiu?": coloque 4 objetos em uma mesa, peça para a criança fechar os olhos e tire um.',
    'Faça pequenas pausas de silêncio para escutar os sons do ambiente da casa.'
  ],
  emotional: [
    'Faça o check-in do dia: "Qual foi o momento mais feliz e qual foi o mais desafiador hoje?".',
    'Pratiquem a respiração do balãozinho ou da florzinha juntos quando alguém sentir frustração.'
  ],
  motor: [
    'Crie um pequeno circuito no chão da sala com almofadas para desviar ou pular com segurança.',
    'Brinque de imitar animais (o pulo do sapo, o passo da girafa, o equilíbrio do flamingo).'
  ],
  creativity: [
    'Separe folhas recicladas, giz ou tampinhas para montar colagens e invenções livres em família.',
    'Criem juntos uma história onde cada pessoa inventa uma frase e um desenho da cena.'
  ],
  knowledge: [
    'Durante um passeio no quintal ou rua, observem as plantas, nuvens e insetos descobrindo curiosidades.',
    'Explorem juntos um mapa ou globo simples conversando sobre animais de outros países e oceanos.'
  ],
  music: [
    'Façam uma banda na cozinha com colheres de pau e potes plásticos batendo ritmos de palmas para imitar.',
    'Escutem uma música calma juntos tentando identificar os sons dos diferentes instrumentos.'
  ],
  languages: [
    'Colem pequenos recadinhos com nomes em inglês em objetos da casa como "door", "book" e "chair".',
    'Brinquem de dar "Good morning!" e contar de 1 a 10 em inglês antes da brincadeira.'
  ]
};

export class EvolutionService {
  public async generateReport(child: ChildProfile, period: 'day' | 'week' | 'month' = 'week'): Promise<EvolutionReport> {
    const journeys = await storageService.getAllJourneysForChild(child.id);
    const catalogCompletions = storageService.getActivityCompletions(child.id);
    const gameRecords = await storageService.getGameHistory(child.id);
    const drawings = storageService.getSavedDrawings(child.id);
    const emotions = await storageService.getEmotions(child.id);
    const { snapshot } = await progressionService.syncAndGetProgression(child.id);
    const last7Days = getLast7Days();
    const today = getTodayDateString();

    // Initialize skill counts across all 10 areas
    const skillStats: Record<SkillArea, SkillStats> = {
      communication: { area: 'communication', name: AREA_LABELS.communication, activitiesCompleted: 0, minutesSpent: 0, percentScore: 0 },
      reasoning: { area: 'reasoning', name: AREA_LABELS.reasoning, activitiesCompleted: 0, minutesSpent: 0, percentScore: 0 },
      math: { area: 'math', name: AREA_LABELS.math, activitiesCompleted: 0, minutesSpent: 0, percentScore: 0 },
      attention: { area: 'attention', name: AREA_LABELS.attention, activitiesCompleted: 0, minutesSpent: 0, percentScore: 0 },
      emotional: { area: 'emotional', name: AREA_LABELS.emotional, activitiesCompleted: 0, minutesSpent: 0, percentScore: 0 },
      motor: { area: 'motor', name: AREA_LABELS.motor, activitiesCompleted: 0, minutesSpent: 0, percentScore: 0 },
      creativity: { area: 'creativity', name: AREA_LABELS.creativity, activitiesCompleted: 0, minutesSpent: 0, percentScore: 0 },
      knowledge: { area: 'knowledge', name: AREA_LABELS.knowledge, activitiesCompleted: 0, minutesSpent: 0, percentScore: 0 },
      music: { area: 'music', name: AREA_LABELS.music, activitiesCompleted: 0, minutesSpent: 0, percentScore: 0 },
      languages: { area: 'languages', name: AREA_LABELS.languages, activitiesCompleted: 0, minutesSpent: 0, percentScore: 0 }
    };

    let totalCompletedJourneys = 0;
    let totalMinutes = 0;
    const seenActivityDateKeys = new Set<string>();
    const minutesByDate: Record<string, number> = {};
    const completedDateSet = new Set<string>();

    // 1. Daily journeys
    journeys.forEach(journey => {
      if (journey.isCompleted) {
        totalCompletedJourneys++;
        completedDateSet.add(journey.date);
      }
      const jMin = journey.totalMinutesSpent || 0;
      totalMinutes += jMin;
      minutesByDate[journey.date] = (minutesByDate[journey.date] || 0) + jMin;

      journey.steps.forEach(step => {
        if (step.status === 'completed' && step.activity) {
          const area = step.activity.area;
          seenActivityDateKeys.add(`${journey.date}:${step.activity.id}`);
          if (skillStats[area]) {
            skillStats[area].activitiesCompleted += 1;
            skillStats[area].minutesSpent += step.activity.durationMinutes;
          }
        }
      });
    });

    // 2. Catalog completions (excluding duplicates already counted in journey on same day)
    let catalogOnlyMinutes = 0;
    let catalogCount = 0;
    catalogCompletions.forEach(comp => {
      const dateStr = toLocalDateString(comp.completedAt || today);
      const key = `${dateStr}:${comp.activityId}`;
      if (seenActivityDateKeys.has(key)) return;
      seenActivityDateKeys.add(key);

      catalogCount += 1;
      const mins = comp.durationMinutes || 5;
      catalogOnlyMinutes += mins;
      minutesByDate[dateStr] = (minutesByDate[dateStr] || 0) + mins;
      if (skillStats[comp.area]) {
        skillStats[comp.area].activitiesCompleted += 1;
        skillStats[comp.area].minutesSpent += mins;
      }
    });
    totalMinutes += catalogOnlyMinutes;

    // 3. Creative Atelier saved drawings
    drawings.forEach(d => {
      const dateStr = toLocalDateString(d.createdAt || today);
      skillStats.creativity.activitiesCompleted += 1;
      skillStats.creativity.minutesSpent += 5;
      totalMinutes += 5;
      minutesByDate[dateStr] = (minutesByDate[dateStr] || 0) + 5;
    });

    // 4. Emotional check-ins (by unique days)
    const emotionDays = new Set(emotions.map(e => e.date || today));
    emotionDays.forEach(dateStr => {
      skillStats.emotional.activitiesCompleted += 1;
      skillStats.emotional.minutesSpent += 2;
      totalMinutes += 2;
      minutesByDate[dateStr] = (minutesByDate[dateStr] || 0) + 2;
    });

    // 5. 3D / Interactive Game sessions
    gameRecords.forEach(game => {
      const mins = Math.max(1, Math.round((game.durationSeconds || 60) / 60));
      totalMinutes += mins;
      const dStr = game.date || today;
      minutesByDate[dStr] = (minutesByDate[dStr] || 0) + mins;
    });

    // Compute scores percentage relative to completed activities
    const maxCompleted = Math.max(1, ...Object.values(skillStats).map(s => s.activitiesCompleted));
    Object.keys(skillStats).forEach(key => {
      const area = key as SkillArea;
      skillStats[area].percentScore = Math.round((skillStats[area].activitiesCompleted / maxCompleted) * 100);
    });

    // Build 7-day trend merging journeys, catalog, games & atelier
    const dailyTrend = last7Days.map(dateStr => {
      const tracked =
        dateStr === today
          ? Math.max(minutesByDate[dateStr] || 0, storageService.getTodayMinutesSpent(child.id))
          : (minutesByDate[dateStr] || 0);
      return {
        date: dateStr,
        dayName: getDayNameShort(dateStr),
        minutes: tracked,
        completed: completedDateSet.has(dateStr) || tracked >= 10
      };
    });

    // Deterministic offline tip selection based on least stimulated areas
    const sortedAreas = (Object.keys(skillStats) as SkillArea[]).sort(
      (a, b) => skillStats[a].activitiesCompleted - skillStats[b].activitiesCompleted
    );
    const leastStimulated = sortedAreas.slice(0, 2);

    const offlineSuggestions: string[] = [];
    leastStimulated.forEach((area, idx) => {
      const tips = OFFLINE_TIPS[area];
      if (tips && tips.length > 0) {
        const dayIndex = (today.charCodeAt(today.length - 1) + idx) % tips.length;
        offlineSuggestions.push(tips[dayIndex]);
      }
    });

    return {
      childId: child.id,
      period,
      journeysCompleted: totalCompletedJourneys,
      totalMinutes,
      skills: skillStats,
      dailyTrend,
      offlineActivitiesSuggested: offlineSuggestions,
      totalActivitiesCatalog: catalogCompletions.length,
      gamesPlayed: gameRecords.length,
      drawingsCreated: drawings.length,
      xpEarned: snapshot.totalXp,
      level: snapshot.level,
      achievementsUnlocked: snapshot.achievementsUnlockedCount
    };
  }
}

export const evolutionService = new EvolutionService();
