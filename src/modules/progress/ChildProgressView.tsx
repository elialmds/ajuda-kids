import React, { useState, useEffect } from 'react';
import { useApp } from '@/modules/context/AppContext';
import { evolutionService } from '@/services/evolutionService';
import { ACHIEVEMENTS_CATALOG, SKILL_AREA_MEDALLION_MAP } from '@/services/progressionService';
import { EvolutionReport, SkillArea } from '@/types';
import {
  CommunicationIllustration,
  ReasoningIllustration,
  AttentionIllustration,
  EmotionalIllustration,
  MotorIllustration,
  CreativityIllustration,
  KnowledgeIllustration,
  MathIllustration,
  MusicIllustration,
  LanguagesIllustration
} from '@/components/illustrations/HandDrawnIllustrations';
import {
  GoldStarTrophySvg,
  StreakShieldSvg,
  WorldMasteryMedallion
} from '@/design-system/EliteRewards';
import { EliteStatCard } from '@/design-system/EliteCards';
import { EliteWeeklyBarChart, EliteCircularRing } from '@/design-system/EliteCharts';
import { AjudaKidsMascot } from '@/components/common/AjudaKidsMascot';
import { WORLD_TOKENS } from '@/design-system/tokens';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Lightbulb,
  Trophy,
  Gamepad2,
  Palette
} from 'lucide-react';

interface SkillCardConfig {
  area: SkillArea;
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
}

const SKILL_CARDS: SkillCardConfig[] = [
  {
    area: 'communication',
    title: 'Comunicação e Fala',
    subtitle: 'Sons, vocabulário e expressão verbal',
    illustration: <CommunicationIllustration size={60} />
  },
  {
    area: 'reasoning',
    title: 'Aprendizado e Lógica',
    subtitle: 'Raciocínio lógico, números e padrões',
    illustration: <ReasoningIllustration size={60} />
  },
  {
    area: 'math',
    title: 'Matemática Lúdica',
    subtitle: 'Contagem visual, somas, subtrações e medidas',
    illustration: <MathIllustration size={60} />
  },
  {
    area: 'attention',
    title: 'Atenção e Foco',
    subtitle: 'Concentração, percepção e detalhes visuais',
    illustration: <AttentionIllustration size={60} />
  },
  {
    area: 'emotional',
    title: 'Inteligência Emocional',
    subtitle: 'Reconhecimento de sentimentos e calma',
    illustration: <EmotionalIllustration size={60} />
  },
  {
    area: 'motor',
    title: 'Coordenação Motora',
    subtitle: 'Movimento corporal ativo e lateralidade',
    illustration: <MotorIllustration size={60} />
  },
  {
    area: 'creativity',
    title: 'Criatividade e Artes',
    subtitle: 'Desenho no Ateliê, cores e invenção',
    illustration: <CreativityIllustration size={60} />
  },
  {
    area: 'knowledge',
    title: 'Conhecimentos Gerais',
    subtitle: 'Sistema Solar, natureza, água e curiosidades',
    illustration: <KnowledgeIllustration size={60} />
  },
  {
    area: 'music',
    title: 'Música & Ritmo',
    subtitle: 'Notas musicais com som real, ritmo e instrumentos',
    illustration: <MusicIllustration size={60} />
  },
  {
    area: 'languages',
    title: 'Inglês & Idiomas',
    subtitle: 'Vocabulário ilustrado e expressões bilíngues',
    illustration: <LanguagesIllustration size={60} />
  }
];

export const ChildProgressView: React.FC = () => {
  const { activeChild, progression, isDarkMode } = useApp();
  const [report, setReport] = useState<EvolutionReport | null>(null);

  useEffect(() => {
    if (activeChild) {
      evolutionService.generateReport(activeChild, 'week').then(setReport);
    }
  }, [activeChild, progression?.totalXp]);

  if (!activeChild || !report) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-bold text-[#33466E] dark:text-[#CBD5E1]">
          Carregando seu desenvolvimento...
        </p>
      </div>
    );
  }

  const activeDaysCount = report.dailyTrend.filter((d) => d.minutes > 0 || d.completed).length;
  const totalActivitiesCount = Object.values(report.skills).reduce(
    (acc, s) => acc + s.activitiesCompleted,
    0
  );
  const level = progression?.level ?? report.level ?? 1;
  const levelTitle = progression?.levelTitle ?? 'Aprendiz Curioso';
  const totalXp = progression?.totalXp ?? report.xpEarned ?? 0;
  const xpIntoLevel = progression?.xpIntoLevel ?? 0;
  const xpForNextLevel = progression?.xpForNextLevel ?? 100;
  const xpProgressPercent = progression?.progressPercent ?? 0;
  const streakDays = progression?.streakDays ?? activeDaysCount;
  const unlockedCount = progression?.achievementsUnlockedCount ?? report.achievementsUnlocked ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 text-[#25233A] dark:text-[#F8F7FF]">
      {/* 1. Header Hero with Elite Golden Trophy + Mascot + Circular Gauges */}
      <div className="rounded-[26px] p-6 sm:p-8 bg-gradient-to-r from-[#FFFFFF] via-[#F5F3FC] to-[#ECE7FC] dark:from-[#27234D] dark:via-[#1E1B3A] dark:to-[#15132C] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-[0_6px_0_#D8D0F2,0_14px_30px_rgba(37,35,58,0.06)] dark:shadow-[0_6px_0_#0D0B1C,0_14px_30px_rgba(3,6,18,0.5)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0ECFF] dark:bg-[#282158] border border-[#C9BCFF] dark:border-[#493D9E] text-xs font-extrabold text-[#7047E8] dark:text-[#D7CBFF]">
                <Sparkles size={14} />
                <span>Evolução & Conquistas</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5CC] dark:bg-[#332709] border border-[#FFE082] dark:border-[#634C14] text-xs font-extrabold text-[#8A5A00] dark:text-[#FFD34E] tabular-nums">
                <Trophy size={13} />
                <span>
                  Nível {level} • {levelTitle}
                </span>
              </div>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#25233A] dark:text-white">
              Meu Desenvolvimento
            </h1>
            <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#D3CEF0] mt-1 font-medium leading-relaxed">
              Acompanhe de forma leve e acolhedora cada conquista de{' '}
              {activeChild.nickname || activeChild.name} nas 10 áreas de aprendizagem!
            </p>
            <div className="mt-3 max-w-md p-3 rounded-[18px] bg-white dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B]">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-[#25233A] dark:text-[#F8F7FF] mb-1.5">
                <span>{totalXp} XP acumulados</span>
                <span className="tabular-nums text-[#7047E8] dark:text-[#C4B5FD]">
                  {xpIntoLevel}/{xpForNextLevel} para o Nível {level + 1}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#F5F3FC] dark:bg-[#1E1B3A] rounded-full overflow-hidden border border-[#E4DFF5] dark:border-[#38316B]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7047E8] via-[#4389F5] to-[#36C995] transition-all duration-500"
                  style={{ width: `${Math.max(6, xpProgressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <AjudaKidsMascot size={76} pose="celebrating" />
            <EliteCircularRing
              value={activeDaysCount}
              max={7}
              size={64}
              accentColor="#36C995"
              centerLabel={`${activeDaysCount}/7`}
              caption="Semana"
            />
            <StreakShieldSvg size={64} days={streakDays} />
            <GoldStarTrophySvg size={88} />
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-[#C3A3F5]/40 dark:border-white/10">
          <EliteStatCard
            label="Dias Ativos"
            value={`${activeDaysCount} de 7`}
            caption="Dias nesta semana"
            icon={<Calendar size={20} className="text-[#1E82CE] dark:text-[#60A5FA]" />}
            accentBg="#E1F4FE"
            darkAccentBg="#172A45"
            borderColor="#8CC9F2"
            darkBorderColor="#2D5482"
            lipColor="#5FA7DB"
            darkLipColor="#0E1D33"
            labelColor="#1A5A8A"
            darkLabelColor="#7DD3FC"
          />
          <EliteStatCard
            label="Atividades"
            value={totalActivitiesCount}
            caption="Praticadas com carinho"
            icon={<CheckCircle2 size={20} className="text-[#2FA10D] dark:text-[#6EE7B7]" />}
            accentBg="#DCF5D2"
            darkAccentBg="#162E24"
            borderColor="#88CE77"
            darkBorderColor="#2B6648"
            lipColor="#56A445"
            darkLipColor="#0D2118"
            labelColor="#1E6917"
            darkLabelColor="#6EE7B7"
          />
          <EliteStatCard
            label="Tempo Saudável"
            value={`${report.totalMinutes} min`}
            caption="Equilíbrio sem excessos"
            icon={<Clock size={20} className="text-[#C96400] dark:text-[#FBBF24]" />}
            accentBg="#FFF3D4"
            darkAccentBg="#2B2216"
            borderColor="#F2CA52"
            darkBorderColor="#755924"
            lipColor="#D4A11B"
            darkLipColor="#1B150A"
            labelColor="#7D5406"
            darkLabelColor="#FCD34D"
          />
        </div>

        {/* Cross-Module Activity Pills: 3D Games, Atelier Drawings, Unlocked Medals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3.5">
          <div className="px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-[#121024] border-2 border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-between text-xs font-extrabold">
            <span className="flex items-center gap-2 text-[#25233A] dark:text-[#E2E8F0]">
              <Gamepad2 size={15} className="text-[#7047E8] dark:text-[#C4B5FD]" />
              Jogos 3D (semana)
            </span>
            <span className="tabular-nums text-[#7047E8] dark:text-[#D8B4FE]">
              {report.gamesPlayed ?? 0}
            </span>
          </div>
          <div className="px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-[#121024] border-2 border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-between text-xs font-extrabold">
            <span className="flex items-center gap-2 text-[#25233A] dark:text-[#E2E8F0]">
              <Palette size={15} className="text-[#F16E9A] dark:text-[#F9A8D4]" />
              Obras no Ateliê
            </span>
            <span className="tabular-nums text-[#C94072] dark:text-[#F9A8D4]">
              {report.drawingsCreated ?? 0}
            </span>
          </div>
          <div className="px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-[#121024] border-2 border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-between text-xs font-extrabold">
            <span className="flex items-center gap-2 text-[#25233A] dark:text-[#E2E8F0]">
              <Trophy size={15} className="text-[#FF9B42] dark:text-[#FFD34E]" />
              Medalhas Reais
            </span>
            <span className="tabular-nums text-[#8A5A00] dark:text-[#FFD34E]">
              {unlockedCount}/{ACHIEVEMENTS_CATALOG.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Gráfico Elite de Evolução Semanal com Meta de 20-30 min e Tooltips */}
      <EliteWeeklyBarChart
        dailyTrend={report.dailyTrend}
        targetMinutes={30}
        title="Evolução nos Dias da Semana"
        subtitle="Tempo dedicado por dia com metas saudáveis de 20 a 30 minutos"
      />

      {/* 3. Módulos das 7 Habilidades + Medalhões Colecionáveis */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="ak-title-display font-display text-xl font-bold text-[#25233A] dark:text-white">
              10 Habilidades em Desenvolvimento
            </h2>
            <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6]">
              Nível atual e medalhões conquistados nos 10 pilares educativos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKILL_CARDS.map((skillCard) => {
            const stats = report.skills[skillCard.area];
            const activitiesCount = stats?.activitiesCompleted || 0;
            const world = WORLD_TOKENS[skillCard.area];
            const medallionId = SKILL_AREA_MEDALLION_MAP[skillCard.area];
            const medalProgress = progression?.achievementProgressMap[medallionId];
            const isMedalUnlocked = medalProgress ? medalProgress.unlocked : activitiesCount >= 2;
            const areaCurrent = medalProgress?.current ?? activitiesCount;

            const areaLevel =
              areaCurrent >= 6
                ? 'Nível 3 • Mestre'
                : areaCurrent >= 2
                ? 'Nível 2 • Explorador'
                : 'Nível 1 • Curioso';
            const progressPercent = Math.min(100, Math.max(8, (areaCurrent / 6) * 100));
            const dynamicStatus = isMedalUnlocked
              ? `Medalha desbloqueada! ${areaCurrent} missões realizadas nesta área.`
              : areaCurrent > 0
              ? `Em progresso: ${areaCurrent} de 2 missões para a medalha.`
              : 'Pronto para explorar! Faça sua primeira missão nesta área.';

            return (
              <div
                key={skillCard.area}
                style={{
                  backgroundColor: isDarkMode ? world.darkCardBg : world.cardBg,
                  borderColor: isDarkMode ? world.darkCardBorder : world.cardBorder,
                  boxShadow: isDarkMode
                    ? `0 5px 0 ${world.darkCardLip}, 0 8px 18px rgba(3, 6, 18, 0.42)`
                    : `0 5px 0 ${world.cardLip}, 0 8px 18px rgba(30, 43, 72, 0.05)`
                }}
                className="ak-card-3d rounded-[30px] p-5 sm:p-6 border-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span
                        style={{ color: isDarkMode ? world.darkBadgeText : world.badgeText }}
                        className="text-[11px] font-black uppercase tracking-wider block"
                      >
                        {areaLevel}
                      </span>
                      <h3 className="ak-title-display font-display text-xl font-bold text-[#25233A] dark:text-white mt-0.5">
                        {skillCard.title}
                      </h3>
                      <p className="text-xs text-[#77758A] dark:text-[#C5BFE6] mt-1 font-semibold">
                        {skillCard.subtitle}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <WorldMasteryMedallion
                        area={skillCard.area}
                        unlocked={isMedalUnlocked}
                        size={48}
                      />
                      <div className="ak-sticker-badge p-1.5 rounded-2xl bg-white dark:bg-[#121024] border border-[#E4DFF5] dark:border-white/15 shadow-sticker">
                        {skillCard.illustration}
                      </div>
                    </div>
                  </div>

                  <div className="my-4">
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#25233A] dark:text-[#E2E8F0] mb-1.5">
                      <span>{areaCurrent} missões realizadas</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full h-3.5 bg-[#F5F3FC] dark:bg-[#121024] rounded-full overflow-hidden p-0.5 border border-[#E4DFF5] dark:border-white/15">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: world.accent
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center gap-2 text-xs font-extrabold text-[#25233A] dark:text-[#F1F5F9]">
                  <Sparkles size={14} className="shrink-0 text-[#FF9600]" />
                  <span className="truncate">{dynamicStatus}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Dica Lúdica Fora da Tela */}
      {report.offlineActivitiesSuggested && report.offlineActivitiesSuggested.length > 0 && (
        <div className="ak-card-3d rounded-[30px] p-6 bg-gradient-to-r from-[#E9FBF4] via-white to-[#F5F3FC] dark:from-[#16382C] dark:via-[#1E1B3A] dark:to-[#121024] border-2 border-[#36C995]/60 dark:border-[#36C995]/40 shadow-[0_5px_0_#2BB382] dark:shadow-[0_5px_0_#0D2016]">
          <div className="flex items-start gap-4">
            <div className="ak-sticker-badge w-12 h-12 rounded-2xl bg-white dark:bg-[#121024] text-[#1E7E5B] dark:text-[#6EE7B7] flex items-center justify-center shrink-0 shadow-sticker border border-[#36C995]/50 dark:border-[#36C995]/40">
              <Lightbulb size={24} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#1E7E5B] dark:text-[#6EE7B7] block mb-0.5">
                Dica de Estimulação Fora da Tela
              </span>
              <h3 className="ak-title-display font-display text-base font-bold text-[#25233A] dark:text-white">
                Momento em Família
              </h3>
              <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6] mt-1.5 leading-relaxed font-semibold">
                “{report.offlineActivitiesSuggested[0]}”
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
