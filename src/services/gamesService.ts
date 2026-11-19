import { GameInfo, DailyRewardStatus, GamePlayRecord } from '@/types';
import { getTodayDateString } from '@/utils/dateUtils';
import { storageService } from './storageService';
import { progressionService, XpAwardOutcome } from './progressionService';

export const GAMES_CATALOG: GameInfo[] = [
  {
    id: 'batata-quente',
    title: 'Batata Quente',
    subtitle: 'Brincadeira em Grupo ou Família',
    description: 'Passe a batata (ou almofada) enquanto a música e o tique-taque tocam! Quem estiver com ela quando parar cumpre uma prenda divertida!',
    iconName: 'Flame',
    category: 'presencial_guiado',
    color: '#F8EBC6',
    minAge: 4,
    isOfflinePhysical: true
  },
  {
    id: 'pato-ganso',
    title: 'Pato, Pato, Ganso!',
    subtitle: 'Roda e Movimento no Espaço',
    description: 'Guia interativo da clássica brincadeira de roda, corrida e muita risada para brincar com amigos ou familiares!',
    iconName: 'Users',
    category: 'presencial_guiado',
    color: '#DCEFE3',
    minAge: 4,
    isOfflinePhysical: true
  },
  {
    id: 'morto-vivo',
    title: 'Morto ou Vivo!',
    subtitle: 'Jogo de Atenção Corporal',
    description: 'Fique atento aos comandos sonoros e visuais: agache no "Morto" e levante no "Vivo"! Cuidado com as pegadinhas!',
    iconName: 'Activity',
    category: 'coordenacao',
    color: '#DCEFFA',
    minAge: 4,
    isOfflinePhysical: false
  },
  {
    id: 'jogo-memoria',
    title: 'Jogo da Memória dos Bichinhos',
    subtitle: 'Atenção e Percepção Visual',
    description: 'Encontre todos os pares de bichinhos no menor número de tentativas e treine sua memória!',
    iconName: 'Sparkles',
    category: 'digital',
    color: '#EAE2F5',
    minAge: 4,
    isOfflinePhysical: false
  },
  {
    id: 'sequencia-cores',
    title: 'Sequência Musical de Cores',
    subtitle: 'Memória Auditiva e Visual',
    description: 'Memorize e reproduza a ordem das cores que acendem e tocam sons suaves!',
    iconName: 'Palette',
    category: 'digital',
    color: '#F8EBC6',
    minAge: 5,
    isOfflinePhysical: false
  },
  {
    id: 'simon-says',
    title: 'O Mestre Mandou (Simon Says)',
    subtitle: 'Atenção e Comandos Corporais',
    description: 'Só faça a ação se o Mestre mandar! Siga os desafios de movimento para mexer o corpo e dar risada.',
    iconName: 'CheckCircle2',
    category: 'coordenacao',
    color: '#DCEFE3',
    minAge: 4,
    isOfflinePhysical: false
  },
  {
    id: 'desafio-observacao',
    title: 'Detetive da Observação',
    description: 'Encontre o objeto escondido ou o detalhe que mudou na imagem antes que o tempo termine!',
    subtitle: 'Foco e Percepção de Detalhes',
    iconName: 'Search',
    category: 'digital',
    color: '#DCEFFA',
    minAge: 5,
    isOfflinePhysical: false
  }
];

export class GamesService {
  /**
   * Evaluates if the child can currently play games according to business rules:
   * 1. Daily journey must be completed.
   * 2. Max 3 plays per day unless "unlimitedGames" is turned on by the parent.
   */
  public async getDailyRewardStatus(childId: string): Promise<DailyRewardStatus> {
    const today = getTodayDateString();
    const settings = await storageService.getParentSettings();
    const journey = await storageService.getDailyJourney(childId, today);
    const playsUsed = await storageService.getDailyPlaysUsed(childId, today);

    const journeyCompleted = Boolean(journey && journey.isCompleted);
    const isUnlimited = settings.unlimitedGames;
    const maxPlays = 3;

    if (isUnlimited) {
      return {
        date: today,
        childId,
        journeyCompletedToday: journeyCompleted,
        playsUsedToday: playsUsed,
        maxPlaysPerDay: Infinity,
        isUnlimited: true,
        canPlay: true,
        reason: 'Jogos ilimitados liberados pelo responsável!'
      };
    }

    if (!journeyCompleted) {
      return {
        date: today,
        childId,
        journeyCompletedToday: false,
        playsUsedToday: playsUsed,
        maxPlaysPerDay: maxPlays,
        isUnlimited: false,
        canPlay: false,
        reason: 'Conclua a sua jornada diária de atividades para liberar a Hora de Brincar!'
      };
    }

    if (playsUsed >= maxPlays) {
      return {
        date: today,
        childId,
        journeyCompletedToday: true,
        playsUsedToday: playsUsed,
        maxPlaysPerDay: maxPlays,
        isUnlimited: false,
        canPlay: false,
        reason: 'Você já usou suas 3 jogadas de hoje! Amanhã haverá mais 3 jogadas novinhas.'
      };
    }

    return {
      date: today,
      childId,
      journeyCompletedToday: true,
      playsUsedToday: playsUsed,
      maxPlaysPerDay: maxPlays,
      isUnlimited: false,
      canPlay: true,
      reason: `Você tem ${maxPlays - playsUsed} jogada(s) disponível(is) hoje!`
    };
  }

  /**
   * Consumes one game play and logs the record
   */
  public async recordAndConsumePlay(
    childId: string,
    gameId: string,
    durationSeconds: number,
    score?: number
  ): Promise<{ success: boolean; playsRemaining: number; isUnlimited: boolean; xpOutcome?: XpAwardOutcome }> {
    const today = getTodayDateString();
    const settings = await storageService.getParentSettings();
    const status = await this.getDailyRewardStatus(childId);

    if (!status.canPlay && !settings.unlimitedGames) {
      return {
        success: false,
        playsRemaining: 0,
        isUnlimited: false
      };
    }

    // Increment play counter
    const newPlaysUsed = await storageService.incrementDailyPlays(childId, today);

    // Save history
    const record: GamePlayRecord = {
      id: `play_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      childId,
      gameId,
      date: today,
      timestamp: Date.now(),
      durationSeconds,
      score
    };
    await storageService.recordGamePlay(record);

    const xpOutcome = await progressionService.recordGameXp(
      childId,
      gameId,
      record.id,
      score ?? 100
    );

    const playsRemaining = settings.unlimitedGames ? 999 : Math.max(0, 3 - newPlaysUsed);

    return {
      success: true,
      playsRemaining,
      isUnlimited: settings.unlimitedGames,
      xpOutcome
    };
  }
}

export const gamesService = new GamesService();
