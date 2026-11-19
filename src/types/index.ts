export type AgeGroup = '4-6' | '7-9' | '10-12';

export type SkillArea = 
  | 'communication' 
  | 'reasoning' 
  | 'math'
  | 'attention' 
  | 'emotional' 
  | 'motor'
  | 'creativity'
  | 'knowledge'
  | 'music'
  | 'languages';

export interface LearningPreferences {
  prioritySkills: SkillArea[];
  dailyGoalMinutes: number;
  soundEnabled: boolean;
  voiceGuideEnabled: boolean;
}

export interface FamilyAccount {
  id: string;
  parentUserId: string;
  parentName: string;
  parentEmail: string;
  username?: string;
  familyName: string;
  createdAt: string;
  updatedAt: string;
  settings: ParentSettings;
}

export interface AuthSession {
  token: string;
  familyId: string;
  userId: string;
  username: string;
  parentEmail: string;
  parentName: string;
  createdAt: number;
  expiresAt: number;
}

export interface ChildProfile {
  id: string;
  familyId?: string;
  name: string;
  nickname?: string;
  age: number;
  birthdate?: string;
  avatar: string;
  companionId?: string; // Lumi, Teo, Maya, Sol, Pipoca
  ageGroup: AgeGroup;
  targetSkills: SkillArea[];
  learningPreferences?: LearningPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface ChildDevice {
  id: string;
  childId: string;
  familyId: string;
  deviceName: string;
  platform: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Web';
  lastActiveAt: string;
  status: 'active' | 'pending_approval' | 'revoked';
  createdAt: string;
}

export interface PairingSession {
  code: string; // 6-digit one-time code e.g. "482915"
  token: string; // cryptographic random token
  familyId: string;
  childId: string;
  childName: string;
  childAvatar: string;
  createdAt: number;
  expiresAt: number;
  status: 'waiting' | 'claimed_pending_confirm' | 'confirmed' | 'expired' | 'revoked';
  claimedDevice?: {
    deviceId: string;
    deviceName: string;
    platform: ChildDevice['platform'];
  };
}

export interface SyncEvent {
  id: string;
  familyId: string;
  childId: string;
  deviceId: string;
  eventType:
    | 'activity_completed'
    | 'journey_updated'
    | 'game_played'
    | 'emotion_recorded'
    | 'profile_updated'
    | 'device_paired'
    | 'device_revoked'
    | 'settings_updated'
    | 'security_event';
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface PinLockoutState {
  failedAttempts: number;
  lockUntil: number;
  lockoutTier: number;
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: number;
  eventType:
    | 'PIN_SUCCESS'
    | 'PIN_FAILED'
    | 'PIN_LOCKOUT'
    | 'PIN_RECOVERED'
    | 'PIN_RECOVERY_FAILED'
    | 'EMAIL_VERIFIED_REGISTRATION'
    | 'PASSWORD_RESET';
  details: string;
}

export interface ParentSettings {
  pinHash: string;
  pinSalt: string;
  isPinSet: boolean;
  maxDailyMinutes: number;
  allowedTimeRange: {
    start: string; // "08:00"
    end: string;   // "20:00"
  };
  unlimitedGames: boolean;
  soundEffectsEnabled: boolean;
  voiceNarrationEnabled: boolean;
  notificationsEnabled: boolean;
  notificationTimes: string[];
  reminderFrequency: 'daily' | 'weekdays' | 'custom';
  themePreference?: 'light' | 'dark';
}

export type EmotionType = 
  | 'happy' 
  | 'calm' 
  | 'excited' 
  | 'tired' 
  | 'sad' 
  | 'anxious' 
  | 'angry' 
  | 'fear';

export interface EmotionEntry {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  emotion: EmotionType;
  note?: string;
}

export interface ActivityOption {
  id: string;
  text: string;
  image?: string;
  badge?: string;
  isCorrect: boolean;
}

export type ActivityContentType =
  | 'choice'
  | 'pair_matching'
  | 'sequence'
  | 'word_build'
  | 'story_quiz'
  | 'spot_odd'
  | 'breathing'
  | 'physical_action'
  | 'direction_tap'
  | 'pattern_complete'
  | 'drawing_canvas'
  | 'visual_math'
  | 'rhythm_echo';

export interface ActivityMathVisual {
  emoji: string;
  leftCount: number;
  operator: '+' | '-' | '×' | '=';
  rightCount?: number;
  targetAnswer: number;
  unitLabel?: string;
}

export interface ActivityRhythmNote {
  id: string;
  label: string;
  freq: number;
  color: string;
}

export interface ActivityContentBlock {
  type: ActivityContentType;
  prompt: string;
  options?: ActivityOption[];
  pairs?: { left: string; right: string; id: string }[];
  sequence?: string[];
  wordParts?: string[];
  targetWord?: string;
  correctPatternIndex?: number;
  storyText?: string;
  physicalInstruction?: string;
  breathingCycles?: number;
  drawingGuide?: string;
  clue?: string;
  characterPose?: 'stand' | 'wave_left' | 'wave_right' | 'step_left' | 'step_right' | 'tree_left' | 'tree_right';
  mathVisual?: ActivityMathVisual;
  rhythmNotes?: ActivityRhythmNote[];
  rhythmTargetIds?: string[];
}

export interface ActivitySubTask extends ActivityContentBlock {
  id: string;
  title?: string;
  difficulty?: 'facil' | 'medio' | 'dificil';
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  objective?: string;
  area: SkillArea;
  ageGroup: AgeGroup;
  durationMinutes: number;
  instructions: string;
  spokenInstruction?: string;
  content: ActivityContentBlock;
  tasks?: ActivitySubTask[];
  offlineSuggestion: string;
}

export interface SavedDrawing {
  id: string;
  childId: string;
  familyId?: string;
  title: string;
  promptUsed?: string;
  recognitionGuess?: string;
  childExplanation?: string;
  dataUrl: string;
  strokesJson?: string;
  createdAt: string;
  updatedAt: string;
  deviceId?: string;
}

export interface ActivityCompletionRecord {
  id: string;
  childId: string;
  familyId?: string;
  activityId: string;
  activityTitle: string;
  area: SkillArea;
  durationMinutes: number;
  score: number;
  completedAt: string;
  deviceId?: string;
}

export interface DailyJourneyStep {
  stepIndex: number;
  activityId: string;
  activity: ActivityItem;
  status: 'pending' | 'in_progress' | 'completed';
  startedAt?: number;
  completedAt?: number;
  score?: number;
}

export interface DailyJourney {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  steps: DailyJourneyStep[];
  currentStepIndex: number;
  isCompleted: boolean;
  totalMinutesSpent: number;
  completedAt?: string;
}

export interface GamePlayRecord {
  id: string;
  childId: string;
  gameId: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  durationSeconds: number;
  score?: number;
  stars?: number;
  deviceId?: string;
}

export interface GameInfo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  category: 'digital' | 'presencial_guiado' | 'coordenacao';
  color: string;
  minAge: number;
  isOfflinePhysical: boolean;
}

export interface DailyRewardStatus {
  date: string;
  childId: string;
  journeyCompletedToday: boolean;
  playsUsedToday: number;
  maxPlaysPerDay: number;
  isUnlimited: boolean;
  canPlay: boolean;
  reason?: string;
}

export interface SkillStats {
  area: SkillArea;
  name: string;
  activitiesCompleted: number;
  minutesSpent: number;
  percentScore: number;
}

export interface EvolutionReport {
  childId: string;
  period: 'day' | 'week' | 'month';
  journeysCompleted: number;
  totalMinutes: number;
  skills: Record<SkillArea, SkillStats>;
  dailyTrend: { date: string; dayName: string; minutes: number; completed: boolean }[];
  offlineActivitiesSuggested: string[];
  totalActivitiesCatalog?: number;
  gamesPlayed?: number;
  drawingsCreated?: number;
  xpEarned?: number;
  level?: number;
  achievementsUnlocked?: number;
}

export type XpSourceType =
  | 'journey_step'
  | 'journey_bonus'
  | 'activity'
  | 'game_3d'
  | 'drawing'
  | 'emotion'
  | 'challenge_daily'
  | 'challenge_weekly'
  | 'achievement_bonus';

export interface XpTransaction {
  id: string;
  childId: string;
  date: string;
  timestamp: number;
  amount: number;
  source: XpSourceType;
  sourceId: string;
  label: string;
  area?: SkillArea;
}

export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  area?: SkillArea;
  rarity: AchievementRarity;
  xpBonus: number;
  targetValue: number;
  badgeLabel: string;
}

export interface UnlockedAchievement {
  id: string;
  childId: string;
  achievementId: string;
  unlockedAt: string;
  updatedAt?: string;
}

export type ChallengePeriod = 'daily' | 'weekly';

export type ChallengeMetric =
  | 'journey_steps'
  | 'activities_count'
  | 'games_played'
  | 'distinct_areas'
  | 'drawings_saved'
  | 'emotions_checked';

export interface ChallengeDefinition {
  id: string;
  period: ChallengePeriod;
  dateKey: string;
  title: string;
  description: string;
  metric: ChallengeMetric;
  targetCount: number;
  xpReward: number;
}

export interface ChallengeProgressRecord {
  id: string;
  childId: string;
  challengeId: string;
  period: ChallengePeriod;
  dateKey: string;
  title: string;
  description: string;
  metric: ChallengeMetric;
  currentCount: number;
  targetCount: number;
  xpReward: number;
  completed: boolean;
  rewardClaimed: boolean;
  completedAt?: string;
  updatedAt: string;
}

export interface ChildProgressionSnapshot {
  childId: string;
  totalXp: number;
  level: number;
  levelTitle: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  streakDays: number;
  unlockedAchievementIds: string[];
  achievementProgressMap: Record<string, { current: number; target: number; unlocked: boolean; unlockedAt?: string }>;
  achievementsUnlockedCount: number;
  totalAchievementsCount: number;
  dailyChallenges: ChallengeProgressRecord[];
  weeklyChallenges: ChallengeProgressRecord[];
  recentXpTransactions: XpTransaction[];
}
