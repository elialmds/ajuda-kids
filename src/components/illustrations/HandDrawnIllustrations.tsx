import React from 'react';
import { GoldStarTrophySvg } from '@/design-system/EliteRewards';

interface IllustrationProps {
  size?: number | string;
  className?: string;
}

/**
 * DIORAMAS 3D VOLUMÉTRICOS AJUDA KIDS
 * Todos os mundos e telas principais agora seguem o acabamento 3D suave do Kiko (Guia),
 * com luz volumétrica, brilhos vítreos e a Ilha Flutuante Isométrica 3D dos Jogos!
 */

export const WelcomeIllustration: React.FC<IllustrationProps> = ({ size = 120, className = '' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 160 140" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`wiHalo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD34E" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7047E8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`wiBook-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8BD3FF" />
          <stop offset="100%" stopColor="#4389F5" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="70" r="60" fill={`url(#wiHalo-${uid})`} />
      {/* Open 3D Book */}
      <path d="M24 58 C46 49 66 52 80 62 C94 52 114 49 136 58 V108 C114 100 94 102 80 112 C66 102 46 100 24 108 Z" fill={`url(#wiBook-${uid})`} />
      <path d="M31 61 C50 54 66 56 80 65 V104 C65 96 48 95 31 101 Z" fill="#FFFFFF" />
      <path d="M129 61 C110 54 94 56 80 65 V104 C95 96 112 95 129 101 Z" fill="#F5F3FC" />
      {/* Floating Star, Gem & Planet */}
      <path d="M80 18 L86.5 31 L101 33 L90.5 43 L93 57 L80 50 L67 57 L69.5 43 L59 33 L73.5 31 Z" fill="#FFD34E" />
      <circle cx="42" cy="34" r="7.5" fill="#F16E9A" />
      <circle cx="118" cy="32" r="8.5" fill="#36C995" />
    </svg>
  );
};

export const CommunicationIllustration: React.FC<IllustrationProps> = ({ size = 96, className = '' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`ci1-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8BD3FF" />
          <stop offset="100%" stopColor="#265BC9" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="48" fill="#DCF0FF" fillOpacity="0.65" />
      <path d="M22 44 C22 28 38 18 58 18 C78 18 94 28 94 44 C94 59 78 69 58 69 L38 84 V66 C28 62 22 54 22 44 Z" fill={`url(#ci1-${uid})`} />
      <circle cx="44" cy="44" r="4.5" fill="#FFFFFF" />
      <circle cx="58" cy="44" r="4.5" fill="#FFD34E" />
      <circle cx="72" cy="44" r="4.5" fill="#FFFFFF" />
      <rect x="70" y="68" width="28" height="24" rx="8" fill="#FF9B42" />
      <path d="M79 84 L84 74 L89 84 M80.5 81 H87.5" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
};

export const ReasoningIllustration: React.FC<IllustrationProps> = ({ size = 96, className = '' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`riBulb-${uid}`} cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFF7B8" />
          <stop offset="60%" stopColor="#FFD34E" />
          <stop offset="100%" stopColor="#E69514" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="48" fill="#EDE9FE" fillOpacity="0.7" />
      <path d="M60 18 C43 18 32 30 32 45 C32 55 39 62 43 72 H77 C81 62 88 55 88 45 C88 30 77 18 60 18 Z" fill={`url(#riBulb-${uid})`} />
      <rect x="46" y="72" width="28" height="14" rx="7" fill="#7047E8" />
      <rect x="30" y="80" width="22" height="22" rx="7" fill="#36C995" />
      <rect x="68" y="80" width="22" height="22" rx="7" fill="#4389F5" />
    </svg>
  );
};

export const AttentionIllustration: React.FC<IllustrationProps> = ({ size = 96, className = '' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`aiLens-${uid}`} cx="35%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="48" fill="#DCFCE7" fillOpacity="0.65" />
      <path d="M68 68 L94 94" stroke="#7047E8" strokeWidth="12" strokeLinecap="round" />
      <circle cx="52" cy="52" r="28" fill="#36C995" />
      <circle cx="52" cy="52" r="20" fill={`url(#aiLens-${uid})`} />
      <circle cx="88" cy="30" r="8" fill="#FFD34E" />
    </svg>
  );
};

export const EmotionalIllustration: React.FC<IllustrationProps> = ({ size = 96, className = '' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`emiH-${uid}`} cx="36%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFB8D2" />
          <stop offset="56%" stopColor="#F16E9A" />
          <stop offset="100%" stopColor="#C7386A" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="48" fill="#FFE6EF" fillOpacity="0.7" />
      <path d="M60 95 C60 95 22 72 22 44 C22 30 33 21 44 21 C52 21 57.5 26 60 32 C62.5 26 68 21 76 21 C87 21 98 30 98 44 C98 72 60 95 60 95 Z" fill={`url(#emiH-${uid})`} />
      <circle cx="48" cy="51" r="4" fill="#FFFFFF" />
      <circle cx="72" cy="51" r="4" fill="#FFFFFF" />
      <path d="M51 63 Q60 72 69 63" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </svg>
  );
};

export const MotorIllustration: React.FC<IllustrationProps> = ({ size = 96, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
    <circle cx="60" cy="60" r="48" fill="#FFE6EF" fillOpacity="0.7" />
    <path d="M68 18 L34 62 H58 L50 100 L88 54 H64 Z" fill="#F16E9A" />
    <circle cx="28" cy="36" r="7" fill="#FFD34E" />
    <circle cx="92" cy="84" r="7" fill="#36C995" />
  </svg>
);

export const CreativityIllustration: React.FC<IllustrationProps> = ({ size = 96, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
    <circle cx="60" cy="60" r="48" fill="#FFEDD5" fillOpacity="0.7" />
    <path d="M60 24 C36 24 20 40 20 59 C20 77 33 90 50 90 C57 90 61 84 61 79 C61 73 66 69 72 72 C84 77 100 68 100 54 C100 36 83 24 60 24 Z" fill="#FFFFFF" />
    <circle cx="40" cy="48" r="8" fill="#F16E9A" />
    <circle cx="58" cy="37" r="8" fill="#FFD34E" />
    <circle cx="78" cy="43" r="8" fill="#36C995" />
    <circle cx="82" cy="62" r="7.5" fill="#4389F5" />
  </svg>
);

export const KnowledgeIllustration: React.FC<IllustrationProps> = ({ size = 96, className = '' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`knPl-${uid}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#99F6DC" />
          <stop offset="58%" stopColor="#1DA886" />
          <stop offset="100%" stopColor="#0E6B55" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="48" fill="#D1FAE5" fillOpacity="0.65" />
      <circle cx="60" cy="60" r="28" fill={`url(#knPl-${uid})`} />
      <ellipse cx="60" cy="60" rx="44" ry="13" transform="rotate(-22 60 60)" stroke="#FFD34E" strokeWidth="6" fill="none" />
      <circle cx="28" cy="28" r="5" fill="#7047E8" />
    </svg>
  );
};

export const MathIllustration: React.FC<IllustrationProps> = ({ size = 96, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
    <circle cx="60" cy="60" r="48" fill="#FFEDD5" fillOpacity="0.7" />
    <rect x="20" y="24" width="38" height="38" rx="11" fill="#FF9B42" />
    <path d="M39 34 V52 M30 43 H48" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
    <rect x="62" y="58" width="38" height="38" rx="11" fill="#4389F5" />
    <path d="M72 73 H90 M72 82 H90" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
    <circle cx="84" cy="34" r="10" fill="#FFD34E" />
  </svg>
);

export const MusicIllustration: React.FC<IllustrationProps> = ({ size = 96, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
    <circle cx="60" cy="60" r="48" fill="#FCE7F3" fillOpacity="0.75" />
    <path d="M44 76 V34 L82 26 V68" stroke="#7047E8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="36" cy="79" r="12" fill="#D946B5" />
    <circle cx="74" cy="70" r="12" fill="#FFD34E" />
  </svg>
);

export const LanguagesIllustration: React.FC<IllustrationProps> = ({ size = 96, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
    <circle cx="60" cy="60" r="48" fill="#DBEAFE" fillOpacity="0.75" />
    <circle cx="60" cy="62" r="30" fill="#4389F5" />
    <ellipse cx="60" cy="62" rx="14" ry="30" stroke="#FFFFFF" strokeWidth="3.5" strokeOpacity="0.85" />
    <line x1="30" y1="62" x2="90" y2="62" stroke="#FFFFFF" strokeWidth="3.5" strokeOpacity="0.85" />
    <circle cx="88" cy="28" r="9" fill="#FFD34E" />
  </svg>
);

/**
 * Ilha Flutuante Isométrica 3D dos Jogos (Inspirada na Imagem de Referência 2)
 */
export const Games3DHeroIllustration: React.FC<IllustrationProps> = ({ size = 110, className = '' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 160 150" fill="none" className={`select-none ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`g3dTop-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8DF0C7" />
          <stop offset="100%" stopColor="#36C995" />
        </linearGradient>
        <linearGradient id={`g3dSideL-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6E52C4" />
          <stop offset="100%" stopColor="#4626A8" />
        </linearGradient>
        <linearGradient id={`g3dSideR-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5235B0" />
          <stop offset="100%" stopColor="#2F197A" />
        </linearGradient>
        <linearGradient id={`g3dPond-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#70D4FF" />
          <stop offset="100%" stopColor="#265BC9" />
        </linearGradient>
      </defs>

      {/* Soft Floating Aura */}
      <ellipse cx="80" cy="134" rx="54" ry="9" fill="#7047E8" opacity="0.22" />

      {/* Isometric 3D Block Sides */}
      <polygon points="22,82 80,114 80,132 22,100" fill={`url(#g3dSideL-${uid})`} />
      <polygon points="80,114 138,82 138,100 80,132" fill={`url(#g3dSideR-${uid})`} />
      {/* Top Isometric Grass Slab */}
      <polygon points="80,50 138,82 80,114 22,82" fill={`url(#g3dTop-${uid})`} />

      {/* Isometric Waterfall Pond on Left Front */}
      <polygon points="36,84 62,98 48,106 24,92" fill={`url(#g3dPond-${uid})`} />
      <rect x="44" y="96" width="12" height="24" rx="4" fill={`url(#g3dPond-${uid})`} opacity="0.9" />

      {/* Upper Tier Terraced Island */}
      <polygon points="80,38 118,59 80,80 42,59" fill="#A7F3D0" />

      {/* Cute 3D Adventure House / Castle on Top */}
      <polygon points="64,46 82,36 100,46 100,64 82,74 64,64" fill="#FFF7EE" />
      <polygon points="61,47 82,25 103,47 82,58" fill="#FF9B42" />
      <circle cx="82" cy="56" r="4.5" fill="#7047E8" />

      {/* Glowing Game Path Nodes */}
      <ellipse cx="96" cy="86" rx="7" ry="4.5" fill="#FFFFFF" />
      <ellipse cx="96" cy="85" rx="5" ry="3" fill="#FFD34E" />
      <ellipse cx="78" cy="96" rx="7" ry="4.5" fill="#FFFFFF" />
      <ellipse cx="78" cy="95" rx="5" ry="3" fill="#4389F5" />

      {/* Floating 3D Trees & Sky Stars */}
      <ellipse cx="44" cy="56" rx="10" ry="12" fill="#FFD34E" />
      <rect x="42" y="64" width="4" height="10" rx="2" fill="#B45309" />
      <circle cx="28" cy="36" r="4" fill="#FFD34E" />
      <circle cx="132" cy="38" r="5" fill="#F16E9A" />
      <path d="M124 14 L126.2 19 L131.5 19.8 L127.6 23.4 L128.5 28.6 L124 26 L119.5 28.6 L120.4 23.4 L116.5 19.8 L121.8 19 Z" fill="#FFD34E" />
    </svg>
  );
};

export const ProgressTrophyIllustration: React.FC<IllustrationProps> = ({ size = 110, className = '' }) => (
  <GoldStarTrophySvg size={typeof size === 'number' ? size : 110} className={className} />
);
