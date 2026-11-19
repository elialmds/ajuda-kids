import React, { useState } from 'react';
import { EvolutionReport, SkillArea, SkillStats } from '@/types';
import { WORLD_TOKENS, useDocumentDarkMode } from '@/design-system/tokens';
import { getCompanionBySkill } from '@/data/charactersData';
import {
  DonutSlice,
  HeatmapCell,
  LineTrendPoint,
  TimelineEventItem
} from '@/design-system/chartAggregators';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Info,
  Calendar,
  PieChart,
  Award,
  Gamepad2,
  BookOpen,
  MessageSquareText
} from 'lucide-react';

interface EliteWeeklyBarChartProps {
  dailyTrend: EvolutionReport['dailyTrend'];
  targetMinutes?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const EliteWeeklyBarChart: React.FC<EliteWeeklyBarChartProps> = ({
  dailyTrend,
  targetMinutes = 30,
  title = 'Evolução nos Últimos 7 Dias',
  subtitle = 'Tempo diário dedicado às jornadas com faixa ideal de 20 a 30 min',
  className = ''
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxObserved = Math.max(targetMinutes, ...dailyTrend.map((d) => d.minutes), 30);
  const scaleMax = Math.ceil(maxObserved / 10) * 10;
  const totalMinutes = dailyTrend.reduce((acc, d) => acc + d.minutes, 0);
  const activeDays = dailyTrend.filter((d) => d.minutes > 0 || d.completed).length;
  const goalLinePercent = Math.min(96, Math.round((targetMinutes / scaleMax) * 100));

  return (
    <div
      className={`ak-card-3d rounded-[30px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-[0_1px_2px_rgba(37,35,58,0.03),0_10px_24px_rgba(37,35,58,0.05)] dark:shadow-[0_14px_32px_rgba(4,6,18,0.55)] ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="ak-title-display font-executive text-lg sm:text-xl font-extrabold text-[#25233A] dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6] mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-[#F3EFFF] dark:bg-[#27234D] border border-[#DDD6F3] dark:border-[#38316B] text-[11px] font-extrabold text-[#7047E8] dark:text-[#C4B5FD] tabular-nums">
            {totalMinutes} min totais
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-extrabold ${
              activeDays >= 3
                ? 'bg-[#DCF5D2] dark:bg-[#133A27] border-[#8ED97A] dark:border-[#25D366]/60 text-[#1E6917] dark:text-[#86EFAC]'
                : 'bg-[#FFF6D1] dark:bg-[#3A2E1A] border-[#F2CA52] dark:border-[#D99B1C] text-[#7D5406] dark:text-[#FDE68A]'
            }`}
          >
            <TrendingUp size={13} />
            <span>
              {activeDays > 0 ? `${activeDays}/7 dias ativos` : 'Pronto para iniciar'}
            </span>
          </span>
        </div>
      </div>

      {/* Chart Area with Y-Axis Grid & Goal Reference Line */}
      <div className="relative pl-9 pr-1 pt-6 pb-2">
        {/* Horizontal Grid Lines */}
        <div className="relative h-48 border-b-2 border-[#D5E4F0] dark:border-[#3A4A74]">
          {[100, 50, 0].map((pct) => {
            const labelVal = Math.round((pct / 100) * scaleMax);
            return (
              <div
                key={pct}
                style={{ bottom: `${pct}%` }}
                className="absolute left-0 right-0 flex items-center pointer-events-none"
              >
                <span className="-ml-9 w-8 text-right pr-1.5 text-[10px] font-bold text-[#8A9BB8] dark:text-[#94A3B8] tabular-nums">
                  {labelVal}m
                </span>
                {pct > 0 && (
                  <div className="w-full border-t border-dashed border-[#E2ECF5] dark:border-[#2B395F]" />
                )}
              </div>
            );
          })}

          {/* Healthy Goal Reference Line */}
          <div
            style={{ bottom: `${goalLinePercent}%` }}
            className="absolute left-0 right-0 border-t-2 border-dashed border-[#48C71E]/75 pointer-events-none z-10 flex justify-end"
          >
            <span className="-mt-5 px-2 py-0.5 rounded-full bg-[#E3F8DA] dark:bg-[#133A27] border border-[#8ED97A] dark:border-[#25D366]/60 text-[10px] font-extrabold text-[#1E6917] dark:text-[#86EFAC] shadow-xs">
              Meta {targetMinutes} min
            </span>
          </div>

          {/* 7 Bars */}
          <div className="relative z-20 grid grid-cols-7 gap-2 sm:gap-4 h-full items-end px-1 sm:px-2">
            {dailyTrend.map((day, idx) => {
              const heightPct =
                day.minutes > 0
                  ? Math.max(10, Math.min(100, Math.round((day.minutes / scaleMax) * 100)))
                  : 4;
              const isCompleted = day.completed || day.minutes >= 15;
              const isToday = idx === dailyTrend.length - 1;
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="relative flex flex-col items-center justify-end h-full group cursor-pointer"
                >
                  {/* Floating Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-11 z-30 px-2.5 py-1.5 rounded-xl bg-[#25233A] dark:bg-[#121024] border border-transparent dark:border-[#7047E8]/60 text-white text-[10px] font-bold whitespace-nowrap shadow-lg pointer-events-none animate-fadeIn">
                      <span className="block font-extrabold tabular-nums">
                        {day.dayName}: {day.minutes} min
                      </span>
                      <span className="text-[#C4B5FD]">
                        {isCompleted ? 'Meta atingida ✓' : day.minutes > 0 ? 'Em progresso' : 'Sem registro'}
                      </span>
                    </div>
                  )}

                  {/* Numeric value above bar */}
                  <span
                    className={`text-[10px] font-extrabold tabular-nums mb-1 transition-colors ${
                      day.minutes > 0 ? 'text-[#25233A] dark:text-[#F8FAFC]' : 'text-[#94A3B8] dark:text-[#64748B]'
                    }`}
                  >
                    {day.minutes > 0 ? `${day.minutes}m` : '0m'}
                  </span>

                  {/* Track & Bar */}
                  <div className="w-full max-w-[38px] h-[calc(100%-20px)] rounded-t-2xl bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] p-1 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-t from-[#4389F5] via-[#36C995] to-[#4ADE80]'
                          : day.minutes > 0
                          ? 'bg-gradient-to-t from-[#7047E8] to-[#4389F5]'
                          : 'bg-[#E4DFF5] dark:bg-[#27234D]'
                      } ${isHovered ? 'brightness-105 scale-y-[1.03] origin-bottom' : ''} ${
                        isToday ? 'ring-2 ring-[#7047E8] dark:ring-[#FFD34E] ring-offset-1 dark:ring-offset-[#121024]' : ''
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Labels Row */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 px-1 sm:px-2 mt-2.5">
          {dailyTrend.map((day, idx) => {
            const isToday = idx === dailyTrend.length - 1;
            return (
              <div key={`${day.date}-lbl`} className="text-center">
                <span
                  className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${
                    isToday
                      ? 'bg-[#7047E8] dark:bg-[#7047E8] text-white'
                      : 'text-[#77758A] dark:text-[#C5BFE6]'
                  }`}
                >
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Empty Notice */}
      <div className="mt-4 pt-3.5 border-t border-[#E6EEF6] dark:border-[#2B395F] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-semibold text-[#5A6D91] dark:text-[#CBD5E1]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-[#2D9CDB] to-[#48C71E]" />
            <span>Dia completo / Meta saudável</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#60B8F7]" />
            <span>Em progresso</span>
          </span>
        </div>

        {totalMinutes === 0 && (
          <span className="inline-flex items-center gap-1 text-[#1A5A8A] dark:text-[#7DD3FC] font-bold">
            <Info size={13} />
            As barras preenchem automaticamente após concluir atividades!
          </span>
        )}
      </div>
    </div>
  );
};

interface EliteCircularRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  accentColor?: string;
  trackColor?: string;
  centerLabel?: string;
  caption?: string;
}

export const EliteCircularRing: React.FC<EliteCircularRingProps> = ({
  value,
  max,
  size = 64,
  strokeWidth = 6,
  accentColor = '#2D9CDB',
  trackColor,
  centerLabel,
  caption
}) => {
  const isDark = useDocumentDarkMode();
  const effectiveTrackColor = trackColor || (isDark ? '#2B395F' : '#E2ECF5');
  const safeMax = max > 0 ? max : 1;
  const pct = Math.min(1, Math.max(0, value / safeMax));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={effectiveTrackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-extrabold text-[#25233A] dark:text-[#F8FAFC] tabular-nums">
            {centerLabel ?? `${Math.round(pct * 100)}%`}
          </span>
        </div>
      </div>
      {caption && (
        <span className="text-[10px] font-bold text-[#5A6D91] dark:text-[#CBD5E1] text-center">{caption}</span>
      )}
    </div>
  );
};

interface EliteSkillComparisonBarsProps {
  skills: Record<SkillArea, SkillStats>;
  childName: string;
}

export const EliteSkillComparisonBars: React.FC<EliteSkillComparisonBarsProps> = ({
  skills,
  childName
}) => {
  const isDark = useDocumentDarkMode();
  const orderedAreas: SkillArea[] = [
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

  const list = orderedAreas.map((area) => skills[area]).filter(Boolean);
  const totalCompleted = list.reduce((sum, s) => sum + s.activitiesCompleted, 0);

  return (
    <div className="ak-card-3d rounded-[30px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-[0_1px_2px_rgba(37,35,58,0.03),0_10px_24px_rgba(37,35,58,0.05)] dark:shadow-[0_14px_32px_rgba(4,6,18,0.55)] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7047E8] dark:text-[#B5A0FF]">
            Matriz de Habilidades
          </span>
          <h3 className="ak-title-display font-executive text-lg sm:text-xl font-extrabold text-[#25233A] dark:text-white">
            Desempenho nas 10 Áreas — {childName}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F3FC] dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] text-xs font-extrabold text-[#25233A] dark:text-[#F8FAFC] tabular-nums">
          <CheckCircle2 size={14} className="text-[#36C995] dark:text-[#4ADE80]" />
          <span>{totalCompleted} missões totais</span>
        </span>
      </div>

      {totalCompleted === 0 ? (
        <div className="p-6 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border border-dashed border-[#DDD6F3] dark:border-[#38316B] text-center space-y-1.5">
          <Sparkles size={20} className="mx-auto text-[#7047E8] dark:text-[#B5A0FF]" />
          <p className="text-xs font-extrabold text-[#25233A] dark:text-white">
            Nenhuma missão registrada para {childName} neste período
          </p>
          <p className="text-[11px] font-semibold text-[#77758A] dark:text-[#C5BFE6]">
            Assim que {childName} completar atividades nos 10 mundos, os indicadores de domínio aparecerão aqui.
          </p>
        </div>
      ) : null}

      <div className="space-y-3.5">
        {list.map((skill) => {
          const token = WORLD_TOKENS[skill.area];
          const comp = getCompanionBySkill(skill.area);
          const pct = Math.min(100, Math.max(skill.activitiesCompleted > 0 ? 12 : 4, skill.percentScore));
          const levelLabel =
            skill.activitiesCompleted >= 6
              ? 'Nível 3 • Mestre'
              : skill.activitiesCompleted >= 2
              ? 'Nível 2 • Explorador'
              : skill.activitiesCompleted >= 1
              ? 'Nível 1 • Iniciante'
              : 'Aguardando';

          return (
            <div
              key={skill.area}
              className="p-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] hover:border-[#7047E8]/60 dark:hover:border-[#7047E8]/70 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="ak-sticker-badge w-8 h-8 rounded-xl bg-white dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-center shrink-0">
                    {comp.renderCharacter(26, 'happy')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-[#25233A] dark:text-white">
                        {skill.name}
                      </span>
                      <span
                        style={{
                          backgroundColor: isDark ? token.darkCardBg : token.cardBg,
                          color: isDark ? token.darkBadgeText : token.badgeText,
                          borderColor: isDark ? token.darkCardBorder : token.cardBorder
                        }}
                        className="px-2 py-0.5 rounded-full border text-[10px] font-extrabold"
                      >
                        {levelLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-extrabold tabular-nums">
                  <span className="text-[#5A6D91] dark:text-[#CBD5E1]">
                    {skill.activitiesCompleted} concl. • {skill.minutesSpent} min
                  </span>
                  <span
                    style={{ color: isDark ? token.darkAccent : token.accentDeep }}
                    className="min-w-[36px] text-right"
                  >
                    {skill.percentScore}%
                  </span>
                </div>
              </div>

              <div className="w-full h-2.5 rounded-full bg-white dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] overflow-hidden">
                <div
                  style={{
                    width: `${pct}%`,
                    backgroundColor:
                      skill.activitiesCompleted > 0
                        ? isDark
                          ? token.darkAccent
                          : token.accent
                        : isDark
                        ? '#38316B'
                        : '#D8CCFA'
                  }}
                  className="h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * ETAPA 4 — NOVOS GRÁFICOS INTERATIVOS COM DADOS REAIS (SVG PURO + HOVER + VAZIO)
 * ============================================================================ */

interface EliteLineTrendChartProps {
  points: LineTrendPoint[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const EliteLineTrendChart: React.FC<EliteLineTrendChartProps> = ({
  points,
  title = 'Tendência de Frequência e Metas',
  subtitle = 'Minutos diários reais comparados à meta saudável configurada pelos responsáveis',
  className = ''
}) => {
  const isDark = useDocumentDarkMode();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const uid = React.useId().replace(/:/g, '');

  const hasData = points.some(p => p.minutes > 0 || p.activitiesCount > 0 || p.gamesCount > 0);
  const maxY = Math.max(
    30,
    ...points.map(p => p.minutes),
    ...points.map(p => p.goalMinutes)
  );
  const scaleMax = Math.ceil(maxY / 10) * 10;

  const svgW = 640;
  const svgH = 210;
  const padL = 36;
  const padR = 16;
  const padT = 18;
  const padB = 30;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const coords = points.map((pt, idx) => {
    const x = points.length <= 1 ? padL + plotW / 2 : padL + (idx / (points.length - 1)) * plotW;
    const y = padT + plotH - (Math.min(scaleMax, pt.minutes) / scaleMax) * plotH;
    return { x, y, pt };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
      : '';

  const goalVal = points[0]?.goalMinutes || 30;
  const goalY = padT + plotH - (Math.min(scaleMax, goalVal) / scaleMax) * plotH;
  const activePoint = hoveredIdx !== null ? coords[hoveredIdx] : null;
  const goalsMetCount = points.filter(p => p.goalMet).length;

  return (
    <div
      className={`rounded-[22px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#7047E8] dark:text-[#A78BFA]" />
            <h3 className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
              {title}
            </h3>
          </div>
          <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-[#EFEAFC] dark:bg-[#27234D] border border-[#D8CCFA] dark:border-[#38316B] text-[11px] font-extrabold text-[#5B35C9] dark:text-[#C7B8FF] tabular-nums">
            Meta: {goalVal} min/dia
          </span>
          <span className="px-3 py-1 rounded-full bg-[#E6F9F2] dark:bg-[#143328] border border-[#8DE3C4] dark:border-[#246950] text-[11px] font-extrabold text-[#177856] dark:text-[#6EE7B7] tabular-nums">
            {goalsMetCount} dia(s) com meta cumprida
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="rounded-2xl p-6 bg-[#F5F3FC] dark:bg-[#171430] border border-dashed border-[#D8CCFA] dark:border-[#38316B] text-center space-y-1.5">
          <TrendingUp size={22} className="mx-auto text-[#7047E8] dark:text-[#A78BFA]" />
          <p className="text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
            Sem atividades registradas neste período ainda
          </p>
          <p className="text-[11px] font-medium text-[#77758A] dark:text-[#B8B3D6]">
            Quando a criança concluir missões ou jogos 3D, a linha de evolução aparecerá automaticamente com os dados reais.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full min-w-[360px] h-auto select-none"
              role="img"
              aria-label={title}
            >
              <defs>
                <linearGradient id={`lineArea-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7047E8" stopOpacity={isDark ? 0.42 : 0.28} />
                  <stop offset="100%" stopColor="#7047E8" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Horizontal grid ticks */}
              {[0, 0.5, 1].map((ratio, idx) => {
                const y = padT + plotH * (1 - ratio);
                const val = Math.round(scaleMax * ratio);
                return (
                  <g key={idx}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={svgW - padR}
                      y2={y}
                      stroke={isDark ? '#38316B' : '#E4DFF5'}
                      strokeDasharray={ratio === 0 ? undefined : '4 4'}
                    />
                    <text
                      x={padL - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fontWeight="700"
                      fill={isDark ? '#B8B3D6' : '#77758A'}
                    >
                      {val}m
                    </text>
                  </g>
                );
              })}

              {/* Daily Goal Dashed Line */}
              <line
                x1={padL}
                y1={goalY}
                x2={svgW - padR}
                y2={goalY}
                stroke="#36C995"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />

              {/* Area and Smooth Line */}
              {areaPath && <path d={areaPath} fill={`url(#lineArea-${uid})`} />}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#7047E8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Active hover guide */}
              {activePoint && (
                <line
                  x1={activePoint.x}
                  y1={padT}
                  x2={activePoint.x}
                  y2={padT + plotH}
                  stroke={isDark ? '#A78BFA' : '#7047E8'}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Data Points + X Labels */}
              {coords.map((c, idx) => {
                const showLabel =
                  points.length <= 10 ||
                  idx === 0 ||
                  idx === points.length - 1 ||
                  idx % Math.ceil(points.length / 6) === 0;
                const isHover = hoveredIdx === idx;
                return (
                  <g key={c.pt.date}>
                    {showLabel && (
                      <text
                        x={c.x}
                        y={svgH - 8}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill={isDark ? '#B8B3D6' : '#77758A'}
                      >
                        {c.pt.label}
                      </text>
                    )}
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={isHover ? 6.5 : c.pt.minutes > 0 ? 4 : 2.5}
                      fill={c.pt.goalMet ? '#36C995' : '#7047E8'}
                      stroke={isDark ? '#1E1B3A' : '#FFFFFF'}
                      strokeWidth="2"
                      className="transition-all cursor-pointer"
                    />
                    <rect
                      x={c.x - Math.max(8, plotW / Math.max(1, points.length * 2))}
                      y={padT}
                      width={Math.max(16, plotW / Math.max(1, points.length))}
                      height={plotH}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      onClick={() => setHoveredIdx(idx)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="min-h-[34px] px-3.5 py-2 rounded-2xl bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-between gap-2 text-xs">
            {activePoint ? (
              <>
                <span className="font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                  {activePoint.pt.label}: {activePoint.pt.minutes} min registrados
                </span>
                <span className="font-semibold text-[#77758A] dark:text-[#B8B3D6] tabular-nums">
                  {activePoint.pt.activitiesCount} ativ. • {activePoint.pt.gamesCount} jogos{' '}
                  {activePoint.pt.goalMet ? '• Meta concluída ✓' : ''}
                </span>
              </>
            ) : (
              <span className="font-medium text-[#77758A] dark:text-[#B8B3D6] flex items-center gap-1.5">
                <Info size={13} className="text-[#7047E8]" />
                Passe o cursor ou toque em um ponto do gráfico para detalhar o dia.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface EliteDonutDistributionChartProps {
  slices: DonutSlice[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const EliteDonutDistributionChart: React.FC<EliteDonutDistributionChartProps> = ({
  slices,
  title = 'Distribuição por Áreas de Desenvolvimento',
  subtitle = 'Proporção real de atividades concluídas em cada conjunto de habilidades',
  className = ''
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const totalCount = slices.reduce((acc, s) => acc + s.count, 0);
  const hoveredSlice = slices.find(s => s.key === hoveredKey) || null;

  const size = 190;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeFraction = 0;

  return (
    <div
      className={`rounded-[22px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech ${className}`}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <PieChart size={18} className="text-[#4389F5]" />
          <h3 className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
            {title}
          </h3>
        </div>
        <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] mt-0.5">{subtitle}</p>
      </div>

      {slices.length === 0 ? (
        <div className="rounded-2xl p-6 bg-[#F5F3FC] dark:bg-[#171430] border border-dashed border-[#D8CCFA] dark:border-[#38316B] text-center space-y-1.5">
          <PieChart size={22} className="mx-auto text-[#4389F5]" />
          <p className="text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
            Aguardando as primeiras atividades concluídas
          </p>
          <p className="text-[11px] font-medium text-[#77758A] dark:text-[#B8B3D6]">
            A distribuição por áreas é calculada exclusivamente com base no histórico real da criança.
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-[#F5F3FC] dark:text-[#27234D]"
                strokeWidth={strokeWidth}
              />
              {slices.map(slice => {
                const fraction = totalCount > 0 ? slice.count / totalCount : 0;
                const dashLength = fraction * circumference;
                const dashOffset = -cumulativeFraction * circumference;
                cumulativeFraction += fraction;
                const isHighlighted = hoveredKey === null || hoveredKey === slice.key;
                return (
                  <circle
                    key={slice.key}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={hoveredKey === slice.key ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${dashLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    opacity={isHighlighted ? 1 : 0.35}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredKey(slice.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6">
              <span className="font-display text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF] tabular-nums">
                {hoveredSlice ? `${hoveredSlice.percent}%` : totalCount}
              </span>
              <span className="text-[11px] font-bold text-[#77758A] dark:text-[#B8B3D6] truncate max-w-full">
                {hoveredSlice ? hoveredSlice.label : 'atividades'}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-2">
            {slices.map(slice => {
              const isActive = hoveredKey === slice.key;
              return (
                <button
                  key={slice.key}
                  type="button"
                  onMouseEnter={() => setHoveredKey(slice.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => setHoveredKey(prev => (prev === slice.key ? null : slice.key))}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-[#F5F3FC] dark:bg-[#27234D] border-[#7047E8]/50'
                      : 'bg-[#F5F3FC]/55 dark:bg-[#171430] border-[#E4DFF5] dark:border-[#38316B]'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF] truncate">
                      {slice.label}
                    </span>
                  </span>
                  <span className="text-xs font-extrabold text-[#77758A] dark:text-[#B8B3D6] tabular-nums shrink-0">
                    {slice.count} ({slice.percent}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface EliteActivityHeatmapCalendarProps {
  columns: HeatmapCell[][];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const EliteActivityHeatmapCalendar: React.FC<EliteActivityHeatmapCalendarProps> = ({
  columns,
  title = 'Calendário de Constância (12 Semanas)',
  subtitle = 'Intensidade diária real de missões e jogos concluídos',
  className = ''
}) => {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const totalActiveDays = columns.flat().filter(c => c.count > 0 || c.minutes > 0).length;

  const levelClasses: Record<HeatmapCell['level'], string> = {
    0: 'bg-[#EFEAFC] dark:bg-[#171430] border-[#E4DFF5] dark:border-[#38316B]',
    1: 'bg-[#D8CCFA] dark:bg-[#3A2E75] border-[#C5B3F7] dark:border-[#4F3F9E]',
    2: 'bg-[#A78BFA] dark:bg-[#5B3FD1] border-[#8B68F0] dark:border-[#7047E8]',
    3: 'bg-[#7047E8] dark:bg-[#7D57EE] border-[#5B35C9] dark:border-[#9B7CFF]',
    4: 'bg-[#36C995] dark:bg-[#36C995] border-[#21996E] dark:border-[#6EE7B7]'
  };

  return (
    <div
      className={`rounded-[22px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#36C995]" />
            <h3 className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
              {title}
            </h3>
          </div>
          <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] mt-0.5">{subtitle}</p>
        </div>

        <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#E6F9F2] dark:bg-[#143328] border border-[#8DE3C4] dark:border-[#246950] text-[11px] font-extrabold text-[#177856] dark:text-[#6EE7B7] tabular-nums">
          {totalActiveDays} dia(s) ativo(s)
        </span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1.5 min-w-full justify-between">
          {columns.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map(cell => (
                <button
                  key={cell.date}
                  type="button"
                  title={`${cell.date}: ${cell.count} ações • ${cell.minutes} min`}
                  onMouseEnter={() => setSelectedCell(cell)}
                  onClick={() => setSelectedCell(cell)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-[6px] border transition-transform hover:scale-110 focus:outline-none ${levelClasses[cell.level]} ${
                    selectedCell?.date === cell.date ? 'ring-2 ring-[#7047E8] dark:ring-[#FFD34E]' : ''
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E4DFF5] dark:border-[#38316B] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="font-bold text-[#77758A] dark:text-[#B8B3D6]">
          {selectedCell
            ? `Dia ${selectedCell.date.split('-').reverse().join('/')}: ${selectedCell.count} atividade(s)/etapa(s) • ${selectedCell.minutes} min`
            : 'Toque ou passe o cursor sobre um quadrado para ver o detalhe do dia.'}
        </span>

        <div className="flex items-center gap-1.5 text-[#77758A] dark:text-[#B8B3D6] font-semibold">
          <span>Menos</span>
          {([0, 1, 2, 3, 4] as const).map(lvl => (
            <span key={lvl} className={`w-3.5 h-3.5 rounded-[4px] border ${levelClasses[lvl]}`} />
          ))}
          <span>Mais</span>
        </div>
      </div>
    </div>
  );
};

interface EliteVisualTimelineProps {
  events: TimelineEventItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const EliteVisualTimeline: React.FC<EliteVisualTimelineProps> = ({
  events,
  title = 'Linha do Tempo Pedagógica',
  subtitle = 'Registro cronológico de atividades, jogos 3D, conquistas e notas da família',
  className = ''
}) => {
  const renderIcon = (type: TimelineEventItem['type']) => {
    switch (type) {
      case 'achievement':
        return <Award size={15} />;
      case 'game':
        return <Gamepad2 size={15} />;
      case 'observation':
        return <MessageSquareText size={15} />;
      default:
        return <BookOpen size={15} />;
    }
  };

  return (
    <div
      className={`rounded-[22px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech ${className}`}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#FF9B42]" />
          <h3 className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
            {title}
          </h3>
        </div>
        <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] mt-0.5">{subtitle}</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl p-6 bg-[#F5F3FC] dark:bg-[#171430] border border-dashed border-[#D8CCFA] dark:border-[#38316B] text-center space-y-1.5">
          <Sparkles size={22} className="mx-auto text-[#FF9B42]" />
          <p className="text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
            Nenhum marco registrado ainda
          </p>
          <p className="text-[11px] font-medium text-[#77758A] dark:text-[#B8B3D6]">
            Atividades concluídas, medalhas ganhas e anotações dos responsáveis aparecerão aqui em ordem cronológica.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-3 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4DFF5] dark:before:bg-[#38316B]">
          {events.map(ev => (
            <div key={ev.id} className="relative">
              <span
                style={{ backgroundColor: ev.color }}
                className="absolute -left-6 top-2 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-xs ring-4 ring-white dark:ring-[#1E1B3A]"
              >
                {renderIcon(ev.type)}
              </span>

              <div className="rounded-2xl p-3.5 bg-[#F5F3FC]/75 dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-extrabold text-[#25233A] dark:text-[#F8F7FF] truncate">
                      {ev.title}
                    </span>
                    <span
                      style={{
                        backgroundColor: `${ev.color}1E`,
                        color: ev.color
                      }}
                      className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                    >
                      {ev.badge}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] mt-0.5 break-words">
                    {ev.subtitle}
                  </p>
                </div>

                <span className="text-[11px] font-bold text-[#77758A] dark:text-[#B8B3D6] tabular-nums shrink-0">
                  {ev.date.split('-').reverse().join('/')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
