import React from 'react';
import { SkillArea } from '@/types';
import { WORLD_TOKENS } from './tokens';

interface RewardProps {
  size?: number;
  className?: string;
}

/**
 * Troféu 3D Estrelinha Dourada (Estilo Pixar Metálico Volumétrico)
 */
export const GoldStarTrophySvg: React.FC<RewardProps> = ({ size = 80, className = '' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`goldCup-${uid}`} x1="20" y1="14" x2="76" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF7B8" />
          <stop offset="48%" stopColor="#FFD34E" />
          <stop offset="100%" stopColor="#D98212" />
        </linearGradient>
        <linearGradient id={`cupPedestal-${uid}`} x1="30" y1="68" x2="66" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9A7BFF" />
          <stop offset="100%" stopColor="#522BBF" />
        </linearGradient>
      </defs>
      <ellipse cx="48" cy="87" rx="26" ry="5" fill="#7047E8" opacity="0.22" />
      <path d="M27 25 H17 C16 39 22 44 28 44" stroke="#FF9B42" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M69 25 H79 C80 39 74 44 68 44" stroke="#FF9B42" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M27 17 H69 V38 C69 51 59.5 61 48 61 C36.5 61 27 51 27 38 V17 Z" fill={`url(#goldCup-${uid})`} />
      <ellipse cx="37" cy="28" rx="4.5" ry="12" fill="#FFFFFF" opacity="0.38" />
      <path d="M48 26 L51.4 33.4 L59.4 34.4 L53.5 40 L55 48 L48 44 L41 48 L42.5 40 L36.6 34.4 L44.6 33.4 Z" fill="#FFFFFF" opacity="0.92" />
      <rect x="42" y="60" width="12" height="11" fill="#E69514" />
      <rect x="29" y="70" width="38" height="13" rx="6.5" fill={`url(#cupPedestal-${uid})`} />
      <rect x="34" y="72.5" width="28" height="3.5" rx="1.8" fill="#FFFFFF" opacity="0.28" />
      <circle cx="15" cy="14" r="3" fill="#FFD34E" />
      <circle cx="81" cy="15" r="2.6" fill="#36C995" />
    </svg>
  );
};

/**
 * Medalha 3D com Fita Colecionável
 */
export const MedalRibbonSvg: React.FC<RewardProps & { primary?: string; secondary?: string }> = ({
  size = 64,
  className = '',
  primary = '#4389F5',
  secondary = '#FFD34E'
}) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`medDisc-${uid}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFF7B8" />
          <stop offset="55%" stopColor={secondary} />
          <stop offset="100%" stopColor="#D98212" />
        </radialGradient>
      </defs>
      <path d="M20 7 L28 28 H20 L12 7 H20 Z" fill={primary} />
      <path d="M44 7 L36 28 H44 L52 7 H44 Z" fill="#F16E9A" />
      <circle cx="32" cy="40" r="18" fill={`url(#medDisc-${uid})`} />
      <circle cx="32" cy="40" r="13.5" fill="#FFFFFF" fillOpacity="0.32" />
      <path d="M32 30.5 L34.9 36.4 L41.4 37.3 L36.7 41.9 L37.8 48.3 L32 45.2 L26.2 48.3 L27.3 41.9 L22.6 37.3 L29.1 36.4 Z" fill="#FFFFFF" />
    </svg>
  );
};

/**
 * Escudo 3D de Constância / Ofensiva Diária
 */
export const StreakShieldSvg: React.FC<RewardProps & { days?: number }> = ({
  size = 56,
  className = '',
  days
}) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`shd3d-${uid}`} x1="12" y1="8" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE885" />
          <stop offset="58%" stopColor="#FF9B42" />
          <stop offset="100%" stopColor="#E1497A" />
        </linearGradient>
      </defs>
      <path d="M32 6 L52 14.5 V31 C52 44.5 43.5 53.5 32 58 C20.5 53.5 12 44.5 12 31 V14.5 L32 6 Z" fill={`url(#shd3d-${uid})`} />
      <path d="M32 11 L47 17.5 V30.5 C47 41 40.5 48.5 32 52.5 C23.5 48.5 17 41 17 30.5 V17.5 L32 11 Z" fill="#FFFFFF" fillOpacity="0.22" />
      <path d="M32 18 C36 24 41 28 41 35 C41 40.2 37 44.5 32 44.5 C27 44.5 23 40.2 23 35 C23 30 26 26 28.5 24 C28.5 26.8 30 28 31.2 28 C30.6 24.2 31.2 20.5 32 18 Z" fill="#FFF7B8" />
      {typeof days === 'number' && days > 0 && (
        <text
          x="32"
          y="39.5"
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="900"
          fill="#25233A"
          fontFamily="Fredoka, Nunito, sans-serif"
        >
          {days}
        </text>
      )}
    </svg>
  );
};

/**
 * Medalhão 3D Colecionável por Mundo (Todos os 10 Mundos sem contornos pretos)
 */
export const WorldMasteryMedallion: React.FC<{
  area: SkillArea;
  unlocked?: boolean;
  size?: number;
  className?: string;
}> = ({ area, unlocked = true, size = 60, className = '' }) => {
  const uid = React.useId().replace(/:/g, '');
  const token = WORLD_TOKENS[area];

  const renderInnerEmblem = () => {
    switch (area) {
      case 'communication':
        return (
          <>
            <path d="M19 25 C19 20.5 24 17 31 17 C38 17 43 20.5 43 25 C43 29.5 38 33 32 33 L25 38 V32.2 C21.5 31 19 28.4 19 25 Z" fill="#FFFFFF" />
            <circle cx="27" cy="25" r="2" fill={token.accent} />
            <circle cx="32" cy="25" r="2" fill="#FFD34E" />
            <circle cx="37" cy="25" r="2" fill={token.accent} />
          </>
        );
      case 'reasoning':
        return (
          <>
            <path d="M32 16 C26 16 22 20 22 25.5 C22 29.5 25 32 26.5 35.5 H37.5 C39 32 42 29.5 42 25.5 C42 20 38 16 32 16 Z" fill="#FFD34E" />
            <rect x="27.5" y="35.5" width="9" height="5" rx="2.5" fill="#FFFFFF" />
          </>
        );
      case 'attention':
        return (
          <>
            <circle cx="29" cy="27" r="9" fill="#FFFFFF" />
            <circle cx="29" cy="27" r="4.5" fill="#36C995" />
            <path d="M36 34 L43 41" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          </>
        );
      case 'emotional':
        return (
          <path d="M32 41 C32 41 19 33 19 24.5 C19 20.5 22 17.5 25.8 17.5 C28.5 17.5 30.7 19 32 21.2 C33.3 19 35.5 17.5 38.2 17.5 C42 17.5 45 20.5 45 24.5 C45 33 32 41 32 41 Z" fill="#FFFFFF" />
        );
      case 'motor':
        return <path d="M33 15 L22 30 H31 L29 42 L42 26 H33 Z" fill="#FFD34E" />;
      case 'creativity':
        return (
          <>
            <path d="M36 17 L43 24 L27 40 L19 42 L21 34 Z" fill="#FFFFFF" />
            <circle cx="23" cy="22" r="3.5" fill="#FFD34E" />
          </>
        );
      case 'math':
        return (
          <>
            <rect x="20" y="18" width="24" height="22" rx="6" fill="#FFFFFF" />
            <path d="M27 24 V34 M22 29 H32" stroke="#FF9B42" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M35 27 H41 M35 31.5 H41" stroke="#4389F5" strokeWidth="2.6" strokeLinecap="round" />
          </>
        );
      case 'music':
        return (
          <>
            <path d="M26 35 V20 L40 17 V32" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="23.5" cy="35.5" r="4" fill="#FFD34E" />
            <circle cx="37.5" cy="32.5" r="4" fill="#FFD34E" />
          </>
        );
      case 'languages':
        return (
          <>
            <circle cx="32" cy="29" r="11" fill="#FFFFFF" fillOpacity="0.92" />
            <ellipse cx="32" cy="29" rx="5.5" ry="11" stroke="#4389F5" strokeWidth="2" />
            <line x1="21" y1="29" x2="43" y2="29" stroke="#4389F5" strokeWidth="2" />
          </>
        );
      case 'knowledge':
      default:
        return (
          <>
            <circle cx="32" cy="29" r="11" fill="#A7F3D0" />
            <ellipse cx="32" cy="29" rx="16" ry="5" transform="rotate(-22 32 29)" stroke="#FFD34E" strokeWidth="3" />
          </>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={`ak-toy-3d ${className}`}
      style={{ filter: unlocked ? undefined : 'grayscale(0.85) opacity(0.6)' }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`wmGrad-${area}-${uid}`} cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor={token.illustrationBg} />
          <stop offset="56%" stopColor={token.accent} />
          <stop offset="100%" stopColor={token.accentDeep} />
        </radialGradient>
      </defs>
      <circle cx="32" cy="30" r="24" fill={`url(#wmGrad-${area}-${uid})`} />
      <circle cx="32" cy="30" r="20.5" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.45" />
      {renderInnerEmblem()}
    </svg>
  );
};
