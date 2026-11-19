import React from 'react';
import { CARD_STATE_TOKENS, CardVisualState, useDocumentDarkMode } from './tokens';
import { StateBadgeSvgIcon } from './EliteIcons';

interface StatePillProps {
  state: CardVisualState;
  customLabel?: string;
  className?: string;
}

/**
 * Selo de Estado Semântico (ícone vetorial 3D + texto + borda).
 */
export const StatePill: React.FC<StatePillProps> = ({
  state,
  customLabel,
  className = ''
}) => {
  const isDark = useDocumentDarkMode();
  const token = CARD_STATE_TOKENS[state];
  return (
    <span
      style={{
        backgroundColor: isDark ? token.darkBadgeBg : token.badgeBg,
        color: isDark ? token.darkBadgeText : token.badgeText,
        borderColor: isDark ? token.darkBadgeBorder : token.badgeBorder
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide shrink-0 transition-colors ${className}`}
    >
      <StateBadgeSvgIcon state={state} className="w-3.5 h-3.5" />
      <span>{customLabel || token.label}</span>
    </span>
  );
};

interface EliteSurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: CardVisualState;
  interactive?: boolean;
  children: React.ReactNode;
}

/**
 * Card Tátil Base Ajuda KIDS (Superfície clara/escura com relevo 3D e destaque vítreo).
 */
export const EliteSurfaceCard: React.FC<EliteSurfaceCardProps> = ({
  state = 'available',
  interactive = false,
  className = '',
  style,
  children,
  ...rest
}) => {
  const isDark = useDocumentDarkMode();
  const token = CARD_STATE_TOKENS[state];
  const bg = isDark ? token.darkContainerBg : token.containerBg;
  const border = isDark ? token.darkBorderColor : token.borderColor;
  const lip = isDark ? token.darkLipColor : token.lipColor;
  const ink = isDark ? token.darkTextColor : token.textColor;

  return (
    <div
      style={{
        backgroundColor: bg,
        borderColor: border,
        boxShadow: isDark
          ? `0 5px 0 ${lip}, 0 14px 28px rgba(4, 3, 18, 0.5), inset 0 1px 0 rgba(255,255,255,0.06)`
          : `0 5px 0 ${lip}, 0 12px 26px rgba(112, 71, 232, 0.08), inset 0 2px 0 rgba(255,255,255,0.9)`,
        color: ink,
        ...style
      }}
      className={`rounded-[28px] border-2 transition-all duration-200 ${token.opacityClass} ${
        interactive
          ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-1'
          : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

interface EliteStatCardProps {
  label: string;
  value: string | number;
  caption?: string;
  icon: React.ReactNode;
  accentBg: string;
  borderColor: string;
  lipColor: string;
  labelColor: string;
  darkAccentBg?: string;
  darkBorderColor?: string;
  darkLipColor?: string;
  darkLabelColor?: string;
}

/**
 * Card de Métrica / Progresso com hierarquia clara e emblema 3D.
 */
export const EliteStatCard: React.FC<EliteStatCardProps> = ({
  label,
  value,
  caption,
  icon,
  accentBg,
  borderColor,
  lipColor,
  labelColor,
  darkAccentBg,
  darkBorderColor,
  darkLipColor,
  darkLabelColor
}) => {
  const isDark = useDocumentDarkMode();

  return (
    <div
      style={{
        backgroundColor: isDark ? '#1E1B3A' : '#FFFFFF',
        borderColor: isDark ? darkBorderColor || '#38316B' : borderColor,
        boxShadow: isDark
          ? `0 5px 0 ${darkLipColor || '#100E24'}, 0 12px 24px rgba(4, 3, 18, 0.48), inset 0 1px 0 rgba(255,255,255,0.07)`
          : `0 5px 0 ${lipColor}, 0 10px 22px rgba(112, 71, 232, 0.07), inset 0 2px 0 rgba(255,255,255,0.9)`
      }}
      className="p-4 rounded-[26px] border-2 flex flex-col items-center text-center transition-colors"
    >
      <div
        style={{ backgroundColor: isDark ? darkAccentBg || '#27234D' : accentBg }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 border border-black/5 dark:border-white/10 shadow-sm"
      >
        {icon}
      </div>
      <span
        style={{ color: isDark ? darkLabelColor || '#C4B5FD' : labelColor }}
        className="text-[11px] font-black uppercase tracking-wider"
      >
        {label}
      </span>
      <span className="font-display text-2xl font-bold text-[#25233A] dark:text-[#F8F7FF] mt-0.5 leading-tight tabular-nums">
        {value}
      </span>
      {caption && (
        <span className="text-[10px] font-bold text-[#77758A] dark:text-[#B8B3D6] mt-0.5">
          {caption}
        </span>
      )}
    </div>
  );
};
