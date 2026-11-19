import React from 'react';
import { EmotionType, SkillArea } from '@/types';

interface IconProps {
  className?: string;
}

/**
 * 10 Ícones 3D Volumétricos das Áreas de Desenvolvimento (Sem contornos escuros)
 */
export const LanguageSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`langB-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8BD3FF" />
          <stop offset="100%" stopColor="#265BC9" />
        </linearGradient>
      </defs>
      <path d="M7 18 C7 11 14 7 24 7 C34 7 41 11 41 18 C41 25 34 29 24 29 L14 37 V28 C9.5 26 7 22.5 7 18 Z" fill={`url(#langB-${uid})`} />
      <circle cx="17" cy="18" r="2.6" fill="#FFFFFF" />
      <circle cx="24" cy="18" r="2.6" fill="#FFD34E" />
      <circle cx="31" cy="18" r="2.6" fill="#FFFFFF" />
    </svg>
  );
};

export const LogicSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`logB-${uid}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFF7B8" />
          <stop offset="60%" stopColor="#FFD34E" />
          <stop offset="100%" stopColor="#E69514" />
        </radialGradient>
      </defs>
      <path d="M24 6 C15 6 10 12 10 20 C10 25 13.5 29 15.5 34 H32.5 C34.5 29 38 25 38 20 C38 12 33 6 24 6 Z" fill={`url(#logB-${uid})`} />
      <rect x="17" y="34" width="14" height="7" rx="3.5" fill="#7047E8" />
      <ellipse cx="20" cy="13" rx="5" ry="2.5" transform="rotate(-20 20 13)" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
};

export const AttentionSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`attL-${uid}`} cx="36%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </radialGradient>
      </defs>
      <path d="M29 29 L41 41" stroke="#7047E8" strokeWidth="6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="14" fill="#36C995" />
      <circle cx="20" cy="20" r="9.5" fill={`url(#attL-${uid})`} />
      <circle cx="17" cy="17" r="3" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
};

export const EmotionalSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`emoH-${uid}`} cx="36%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFB8D2" />
          <stop offset="55%" stopColor="#F16E9A" />
          <stop offset="100%" stopColor="#C7386A" />
        </radialGradient>
      </defs>
      <path d="M24 41 C24 41 7 30 7 18 C7 12 11.5 8 16.5 8 C20 8 22.8 10 24 13 C25.2 10 28 8 31.5 8 C36.5 8 41 12 41 18 C41 30 24 41 24 41 Z" fill={`url(#emoH-${uid})`} />
      <ellipse cx="16" cy="15" rx="4" ry="2.2" transform="rotate(-24 16 15)" fill="#FFFFFF" opacity="0.55" />
    </svg>
  );
};

export const MotorSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`motB-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFA3C2" />
          <stop offset="100%" stopColor="#7047E8" />
        </linearGradient>
      </defs>
      <path d="M27 5 L12 27 H23 L20 43 L37 20 H25 Z" fill={`url(#motB-${uid})`} />
      <circle cx="35" cy="12" r="3" fill="#FFD34E" />
    </svg>
  );
};

export const CreativitySvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
    <path d="M24 8 C13 8 6 16 6 25 C6 33.5 12.5 39 20 39 C23 39 24.5 36.5 24.5 34.5 C24.5 31.5 27 30 29.5 31 C35 33 42 29 42 22.5 C42 14 34 8 24 8 Z" fill="#FFE6EF" />
    <circle cx="15" cy="21" r="3.6" fill="#F16E9A" />
    <circle cx="23" cy="15.5" r="3.6" fill="#FFD34E" />
    <circle cx="32" cy="17.5" r="3.6" fill="#36C995" />
    <circle cx="33" cy="26" r="3.4" fill="#4389F5" />
  </svg>
);

export const KnowledgeSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`knwP-${uid}`} cx="35%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#99F6DC" />
          <stop offset="60%" stopColor="#1DA886" />
          <stop offset="100%" stopColor="#0E6B55" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="14" fill={`url(#knwP-${uid})`} />
      <ellipse cx="24" cy="24" rx="21" ry="6.5" transform="rotate(-22 24 24)" stroke="#FFD34E" strokeWidth="3.5" fill="none" />
      <circle cx="19" cy="18" r="3" fill="#FFFFFF" opacity="0.45" />
    </svg>
  );
};

export const MathSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
    <rect x="6" y="6" width="17" height="17" rx="5.5" fill="#FF9B42" />
    <path d="M14.5 10.5 V18.5 M10.5 14.5 H18.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    <rect x="25" y="25" width="17" height="17" rx="5.5" fill="#4389F5" />
    <path d="M29 31.5 H38 M29 36 H38" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const MusicSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
    <path d="M18 33 V13 L37 9 V29" stroke="#7047E8" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="14" cy="34" r="6" fill="#D946B5" />
    <circle cx="33" cy="30" r="6" fill="#FFD34E" />
  </svg>
);

export const LanguagesSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="17" fill="#4389F5" />
    <ellipse cx="24" cy="24" rx="8.5" ry="17" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.85" />
    <line x1="7" y1="24" x2="41" y2="24" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.85" />
    <circle cx="35" cy="13" r="4" fill="#FFD34E" />
  </svg>
);

export const FlameStreakSvg: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`flmOut-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD34E" />
          <stop offset="55%" stopColor="#FF9B42" />
          <stop offset="100%" stopColor="#E1497A" />
        </linearGradient>
      </defs>
      <path d="M24 4 C29 12 38 17 38 28 C38 36 31.8 43 24 43 C16.2 43 10 36 10 28 C10 21 14 15 18 12 C18 16 20 18 22 18 C21 12 22 7 24 4 Z" fill={`url(#flmOut-${uid})`} />
      <path d="M24 21 C27 25 30 28 30 33 C30 37 27.3 40 24 40 C20.7 40 18 37 18 33 C18 28 21 25 24 21 Z" fill="#FFF7B8" />
    </svg>
  );
};

export const AtelierBrushSvg: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
    <path d="M34 8 L40 14 L20 34 L14 28 Z" fill="#FF9B42" />
    <path d="M13 29 C8 30 6 35 6 40 C11 40 16 38 18 34 Z" fill="#F16E9A" />
    <circle cx="15" cy="14" r="3" fill="#FFD34E" />
    <circle cx="33" cy="34" r="3" fill="#36C995" />
  </svg>
);

export function getSkillAreaIcon(area: SkillArea, className = 'w-6 h-6'): React.ReactNode {
  switch (area) {
    case 'communication':
      return <LanguageSvgIcon className={className} />;
    case 'reasoning':
      return <LogicSvgIcon className={className} />;
    case 'attention':
      return <AttentionSvgIcon className={className} />;
    case 'emotional':
      return <EmotionalSvgIcon className={className} />;
    case 'creativity':
      return <CreativitySvgIcon className={className} />;
    case 'knowledge':
      return <KnowledgeSvgIcon className={className} />;
    case 'math':
      return <MathSvgIcon className={className} />;
    case 'music':
      return <MusicSvgIcon className={className} />;
    case 'languages':
      return <LanguagesSvgIcon className={className} />;
    case 'motor':
    default:
      return <MotorSvgIcon className={className} />;
  }
}

// --- 3D VOLUMETRIC EMOTION SPHERES (Matching Kiko Dual Catchlights & Glow) ---

export const EmotionSvgIcon: React.FC<{ emotion: EmotionType; className?: string }> = ({
  emotion,
  className = 'w-10 h-10'
}) => {
  const uid = React.useId().replace(/:/g, '');
  const faceTheme: Record<EmotionType, { top: string; mid: string; edge: string; blush: string }> = {
    happy: { top: '#FFF6B8', mid: '#FFD34E', edge: '#E69B12', blush: '#F16E9A' },
    calm: { top: '#B8F7DF', mid: '#36C995', edge: '#178760', blush: '#FFA3C2' },
    excited: { top: '#A8DCFF', mid: '#4389F5', edge: '#2458C7', blush: '#F16E9A' },
    tired: { top: '#D5C8F5', mid: '#9A7BFF', edge: '#5A38C4', blush: '#F16E9A' },
    anxious: { top: '#FFE0B8', mid: '#FF9B42', edge: '#C95A12', blush: '#F16E9A' },
    sad: { top: '#B3DCFF', mid: '#569CE8', edge: '#2656A8', blush: '#93C5FD' },
    angry: { top: '#FFB8D2', mid: '#F16E9A', edge: '#BE2B5D', blush: '#FB7185' },
    fear: { top: '#E4D8FE', mid: '#A88BFF', edge: '#7047E8', blush: '#F9A8D4' }
  };

  const t = faceTheme[emotion] || faceTheme.happy;

  const renderExpression = () => {
    switch (emotion) {
      case 'happy':
        return (
          <>
            <path d="M16 24 Q19.5 19.5 23 24" stroke="#25233A" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M33 24 Q36.5 19.5 40 24" stroke="#25233A" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M19 32 Q28 42 37 32 Z" fill="#F16E9A" stroke="#25233A" strokeWidth="2.2" strokeLinejoin="round" />
          </>
        );
      case 'calm':
        return (
          <>
            <path d="M16 24 Q19.5 27 23 24" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M33 24 Q36.5 27 40 24" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M22 33 Q28 38 34 33" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          </>
        );
      case 'excited':
        return (
          <>
            <circle cx="19.5" cy="23.5" r="3.6" fill="#25233A" />
            <circle cx="20.7" cy="22.1" r="1.4" fill="#FFFFFF" />
            <circle cx="36.5" cy="23.5" r="3.6" fill="#25233A" />
            <circle cx="37.7" cy="22.1" r="1.4" fill="#FFFFFF" />
            <path d="M19 31 Q28 42 37 31 Z" fill="#FFFFFF" stroke="#25233A" strokeWidth="2.2" strokeLinejoin="round" />
          </>
        );
      case 'tired':
        return (
          <>
            <line x1="15.5" y1="24" x2="23.5" y2="24" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="32.5" y1="24" x2="40.5" y2="24" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" />
            <ellipse cx="28" cy="34.5" rx="4.2" ry="3.2" fill="#FFFFFF" opacity="0.85" />
          </>
        );
      case 'sad':
        return (
          <>
            <circle cx="19.5" cy="24" r="3.2" fill="#25233A" />
            <circle cx="20.5" cy="22.8" r="1.2" fill="#FFFFFF" />
            <circle cx="36.5" cy="24" r="3.2" fill="#25233A" />
            <circle cx="37.5" cy="22.8" r="1.2" fill="#FFFFFF" />
            <path d="M21 36 Q28 30 35 36" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          </>
        );
      case 'anxious':
        return (
          <>
            <circle cx="19.5" cy="23.5" r="3.2" fill="#25233A" />
            <circle cx="20.5" cy="22.3" r="1.2" fill="#FFFFFF" />
            <circle cx="36.5" cy="23.5" r="3.2" fill="#25233A" />
            <circle cx="37.5" cy="22.3" r="1.2" fill="#FFFFFF" />
            <path d="M19 34 Q23.5 31 28 34 Q32.5 37 37 34" stroke="#25233A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          </>
        );
      case 'angry':
        return (
          <>
            <path d="M15 19 L23 22 M41 19 L33 22" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="19.5" cy="25" r="3" fill="#25233A" />
            <circle cx="20.5" cy="23.9" r="1.1" fill="#FFFFFF" />
            <circle cx="36.5" cy="25" r="3" fill="#25233A" />
            <circle cx="37.5" cy="23.9" r="1.1" fill="#FFFFFF" />
            <path d="M21 36 Q28 31 35 36" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          </>
        );
      case 'fear':
      default:
        return (
          <>
            <circle cx="19.5" cy="23.5" r="3.8" fill="#FFFFFF" />
            <circle cx="19.5" cy="23.5" r="2.1" fill="#25233A" />
            <circle cx="36.5" cy="23.5" r="3.8" fill="#FFFFFF" />
            <circle cx="36.5" cy="23.5" r="2.1" fill="#25233A" />
            <ellipse cx="28" cy="35" rx="4.2" ry="3.8" fill="#25233A" />
          </>
        );
    }
  };

  return (
    <svg viewBox="0 0 56 56" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`emoSphere-${uid}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor={t.top} />
          <stop offset="56%" stopColor={t.mid} />
          <stop offset="100%" stopColor={t.edge} />
        </radialGradient>
      </defs>
      <circle cx="28" cy="28" r="24" fill={`url(#emoSphere-${uid})`} />
      <ellipse cx="21" cy="15" rx="9" ry="4" transform="rotate(-18 21 15)" fill="#FFFFFF" opacity="0.38" />
      <ellipse cx="14.5" cy="29.5" rx="3.8" ry="2.2" fill={t.blush} opacity="0.58" />
      <ellipse cx="41.5" cy="29.5" rx="3.8" ry="2.2" fill={t.blush} opacity="0.58" />
      {renderExpression()}
    </svg>
  );
};

// --- 3D VOLUMETRIC GAME & SYMBOL ILLUSTRATIONS ---

export const DuckSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`duck3d-${uid}`} cx="36%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#FFF7B8" />
          <stop offset="58%" stopColor="#FFD34E" />
          <stop offset="100%" stopColor="#E69B12" />
        </radialGradient>
      </defs>
      <ellipse cx="26" cy="31" rx="14" ry="10.5" fill={`url(#duck3d-${uid})`} />
      <circle cx="20" cy="17" r="9.5" fill={`url(#duck3d-${uid})`} />
      <ellipse cx="30" cy="31" rx="6.5" ry="4.5" fill="#FFF2A6" />
      <path d="M7 18 C10 14.5 14 15.5 14 18.5 C14 21 10 21 7 18 Z" fill="#FF9B42" />
      <circle cx="18.5" cy="15.5" r="2.2" fill="#25233A" />
      <circle cx="19.2" cy="14.8" r="0.8" fill="#FFFFFF" />
    </svg>
  );
};

export const GooseSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`goose3d-${uid}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D6ECFF" />
        </radialGradient>
      </defs>
      <ellipse cx="27" cy="31" rx="14" ry="10" fill={`url(#goose3d-${uid})`} />
      <path d="M16 28 Q13 17 18 11" stroke={`url(#goose3d-${uid})`} strokeWidth="8.5" strokeLinecap="round" fill="none" />
      <circle cx="18.5" cy="12" r="7" fill={`url(#goose3d-${uid})`} />
      <path d="M7 13 C10 9.5 14 10.5 14 13.5 C14 16 10 16 7 13 Z" fill="#FF9B42" />
      <circle cx="17.5" cy="11" r="2" fill="#25233A" />
      <circle cx="18.1" cy="10.4" r="0.7" fill="#FFFFFF" />
    </svg>
  );
};

export const StandingKidSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
    <circle cx="24" cy="12" r="7" fill="#FFD34E" />
    <circle cx="21.5" cy="11.5" r="1.3" fill="#25233A" />
    <circle cx="26.5" cy="11.5" r="1.3" fill="#25233A" />
    <rect x="16" y="20" width="16" height="16" rx="7" fill="#36C995" />
    <path d="M10 17 L17 22 M38 17 L31 22" stroke="#FF9B42" strokeWidth="4.2" strokeLinecap="round" />
    <path d="M20 35 V43 M28 35 V43" stroke="#4389F5" strokeWidth="4.5" strokeLinecap="round" />
  </svg>
);

export const CrouchingKidSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
    <circle cx="24" cy="18" r="7" fill="#FFD34E" />
    <circle cx="21.5" cy="17.5" r="1.3" fill="#25233A" />
    <circle cx="26.5" cy="17.5" r="1.3" fill="#25233A" />
    <rect x="14" y="25" width="20" height="14" rx="7" fill="#F16E9A" />
    <ellipse cx="18" cy="40" rx="5.5" ry="3.5" fill="#7047E8" />
    <ellipse cx="30" cy="40" rx="5.5" ry="3.5" fill="#7047E8" />
  </svg>
);

export const HotPotatoSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`hp3d-${uid}`} cx="36%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFE19C" />
          <stop offset="56%" stopColor="#FF9B42" />
          <stop offset="100%" stopColor="#C9560E" />
        </radialGradient>
      </defs>
      <path d="M26 13 Q29 7 34 6" stroke="#C9560E" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="36" cy="6" r="3.5" fill="#FFD34E" />
      <ellipse cx="24" cy="27" rx="16" ry="13" fill={`url(#hp3d-${uid})`} />
      <circle cx="19" cy="26" r="2.2" fill="#25233A" />
      <circle cx="19.7" cy="25.2" r="0.8" fill="#FFFFFF" />
      <circle cx="29" cy="26" r="2.2" fill="#25233A" />
      <circle cx="29.7" cy="25.2" r="0.8" fill="#FFFFFF" />
      <path d="M21 31 Q24 34 27 31" stroke="#25233A" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
};

export const CrownSvgIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
    <path d="M8 33 L6 16 L17 24 L24 11 L31 24 L42 16 L40 33 Z" fill="#FFD34E" />
    <rect x="8" y="33" width="32" height="7" rx="3.5" fill="#7047E8" />
    <circle cx="24" cy="26" r="3" fill="#F16E9A" />
  </svg>
);

export const StarSymbolSvg: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`starSym-${uid}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFF7B8" />
          <stop offset="56%" stopColor="#FFD34E" />
          <stop offset="100%" stopColor="#E69514" />
        </radialGradient>
      </defs>
      <path d="M24 6 L29.2 17 L41.2 18.6 L32.4 26.8 L34.6 38.8 L24 33 L13.4 38.8 L15.6 26.8 L6.8 18.6 L18.8 17 Z" fill={`url(#starSym-${uid})`} />
    </svg>
  );
};

export const CloudSymbolSvg: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`cldSym-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#C8E6FF" />
        </linearGradient>
      </defs>
      <path d="M13 35 H36 C40 35 43 32 43 28 C43 24.5 40.5 21.5 37 21 C35.5 14.5 29.8 10 23 10 C15.8 10 10 15.5 10 22.5 C7 23.5 5 26.2 5 29.5 C5 32.8 8 35 13 35 Z" fill={`url(#cldSym-${uid})`} />
    </svg>
  );
};
