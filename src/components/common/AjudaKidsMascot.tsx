import React from 'react';

export type MascotPose = 'happy' | 'waving' | 'thinking' | 'celebrating' | 'encouraging';

interface AjudaKidsMascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  animate?: boolean;
  speech?: string;
}

/**
 * Mascote Oficial Ajuda KIDS ("Kiko" / Estrelinha Guardiã 3D)
 * Estética unificada com formas arredondadas, sombreamento tridimensional volumétrico,
 * brilho nos olhos e paleta oficial (#7047E8, #4389F5, #FFD34E, #36C995, #FF9B42, #F16E9A).
 */
export const AjudaKidsMascot: React.FC<AjudaKidsMascotProps> = ({
  pose = 'happy',
  size = 110,
  className = '',
  animate = true,
  speech
}) => {
  const uid = React.useId().replace(/:/g, '');

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        className={`select-none ${animate ? 'animate-floatSlow' : ''}`}
        aria-label="Mascote Oficial do Ajuda KIDS"
      >
        <defs>
          {/* 3D Body Spherical Gradients */}
          <radialGradient id={`bodyGrad-${uid}`} cx="38%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#9B7CFF" />
            <stop offset="48%" stopColor="#7047E8" />
            <stop offset="100%" stopColor="#4323A6" />
          </radialGradient>

          <radialGradient id={`bellyGrad-${uid}`} cx="45%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#F5F3FC" />
            <stop offset="100%" stopColor="#DDD5F8" />
          </radialGradient>

          <radialGradient id={`earGrad-${uid}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#6BA7FF" />
            <stop offset="60%" stopColor="#4389F5" />
            <stop offset="100%" stopColor="#265CC0" />
          </radialGradient>

          <linearGradient id={`starGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE885" />
            <stop offset="55%" stopColor="#FFD34E" />
            <stop offset="100%" stopColor="#FF9B42" />
          </linearGradient>

          <linearGradient id={`scarfGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#36C995" />
            <stop offset="100%" stopColor="#4389F5" />
          </linearGradient>

          <radialGradient id={`shadowGrad-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#25233A" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#25233A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft 3D Ground Contact Shadow */}
        <ellipse cx="80" cy="147" rx="44" ry="8.5" fill={`url(#shadowGrad-${uid})`} />

        {/* Ambient Floating Celebration Sparkles */}
        {(pose === 'celebrating' || pose === 'waving') && (
          <g>
            <path
              d="M22 36 L25 27 L28 36 L37 39 L28 42 L25 51 L22 42 L13 39 Z"
              fill="#FFD34E"
            />
            <circle cx="136" cy="34" r="5" fill="#36C995" />
            <circle cx="142" cy="54" r="3.2" fill="#F16E9A" />
          </g>
        )}

        {/* Thinking Idea Bulb Bubble */}
        {pose === 'thinking' && (
          <g>
            <circle cx="129" cy="30" r="14" fill="#FFD34E" opacity="0.28" />
            <circle cx="129" cy="30" r="9.5" fill="#FFD34E" />
            <circle cx="126" cy="27" r="3" fill="#FFFDF5" opacity="0.7" />
            <circle cx="114" cy="46" r="3.5" fill="#FFD34E" />
          </g>
        )}

        {/* Left & Right 3D Rounded Ears */}
        <g>
          <ellipse cx="42" cy="40" rx="18" ry="22" transform="rotate(-22 42 40)" fill={`url(#earGrad-${uid})`} />
          <ellipse cx="42" cy="41" rx="9.5" ry="13" transform="rotate(-22 42 41)" fill="#F16E9A" opacity="0.88" />
          <ellipse cx="118" cy="40" rx="18" ry="22" transform="rotate(22 118 40)" fill={`url(#earGrad-${uid})`} />
          <ellipse cx="118" cy="41" rx="9.5" ry="13" transform="rotate(22 118 41)" fill="#F16E9A" opacity="0.88" />
        </g>

        {/* Left & Right Poses Arms */}
        {pose === 'waving' || pose === 'celebrating' ? (
          <g>
            <path
              d="M36 90 C14 76 14 54 27 51 C35 49 41 62 43 79 Z"
              fill={`url(#bodyGrad-${uid})`}
            />
            <path
              d="M124 90 C146 76 146 54 133 51 C125 49 119 62 117 79 Z"
              fill={`url(#bodyGrad-${uid})`}
            />
            <circle cx="24" cy="54" r="7.5" fill="#4389F5" />
            <circle cx="136" cy="54" r="7.5" fill="#4389F5" />
          </g>
        ) : pose === 'thinking' ? (
          <g>
            <path
              d="M36 92 C21 96 19 114 31 118 C38 119 42 108 42 96 Z"
              fill={`url(#bodyGrad-${uid})`}
            />
            <path
              d="M120 88 C134 78 130 62 118 66 C110 68 110 80 116 88 Z"
              fill={`url(#bodyGrad-${uid})`}
            />
          </g>
        ) : (
          <g>
            <path
              d="M36 90 C19 95 19 115 32 118 C39 119 43 107 43 95 Z"
              fill={`url(#bodyGrad-${uid})`}
            />
            <path
              d="M124 90 C141 95 141 115 128 118 C121 119 117 107 117 95 Z"
              fill={`url(#bodyGrad-${uid})`}
            />
          </g>
        )}

        {/* Cozy 3D Feet */}
        <ellipse cx="59" cy="136" rx="14" ry="8.5" fill="#FF9B42" />
        <ellipse cx="57" cy="134" rx="6" ry="3" fill="#FFD34E" opacity="0.6" />
        <ellipse cx="101" cy="136" rx="14" ry="8.5" fill="#FF9B42" />
        <ellipse cx="99" cy="134" rx="6" ry="3" fill="#FFD34E" opacity="0.6" />

        {/* Main 3D Rounded Plush Body */}
        <path
          d="M34 86 C32 45 50 26 80 26 C110 26 128 45 126 86 C125 122 108 136 80 136 C52 136 35 122 34 86 Z"
          fill={`url(#bodyGrad-${uid})`}
        />

        {/* Top Crown Star Crest */}
        <path
          d="M80 16 L84.5 25.5 L95 26.8 L87.2 34 L89.2 44 L80 39 L70.8 44 L72.8 34 L65 26.8 L75.5 25.5 Z"
          fill={`url(#starGrad-${uid})`}
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Specular Forehead Gloss */}
        <ellipse cx="62" cy="43" rx="15" ry="6" transform="rotate(-18 62 43)" fill="#FFFFFF" opacity="0.22" />

        {/* Soft Cream-Lavender Face Mask & Belly */}
        <ellipse cx="80" cy="68" rx="34" ry="26" fill={`url(#bellyGrad-${uid})`} />
        <ellipse cx="80" cy="108" rx="28" ry="23" fill={`url(#bellyGrad-${uid})`} />

        {/* Stylish Neck Scarf */}
        <path
          d="M47 84 Q80 98 113 84 L108 93 Q80 105 52 93 Z"
          fill={`url(#scarfGrad-${uid})`}
        />

        {/* Belly Badge Star */}
        <path
          d="M80 99 L83 105.5 L90 106.5 L85 111 L86.3 118 L80 114.6 L73.7 118 L75 111 L70 106.5 L77 105.5 Z"
          fill="#FFD34E"
        />

        {/* Expressive Eyes with Glossy Dual Catchlights */}
        <circle cx="64" cy="64" r="8.2" fill="#25233A" />
        <circle cx="66.5" cy="61" r="3" fill="#FFFFFF" />
        <circle cx="61.5" cy="67.2" r="1.4" fill="#FFFFFF" />

        <circle cx="96" cy="64" r="8.2" fill="#25233A" />
        <circle cx="98.5" cy="61" r="3" fill="#FFFFFF" />
        <circle cx="93.5" cy="67.2" r="1.4" fill="#FFFFFF" />

        {/* Rosy 3D Cheeks */}
        <ellipse cx="52" cy="73" rx="6.5" ry="3.8" fill="#F16E9A" opacity="0.58" />
        <ellipse cx="108" cy="73" rx="6.5" ry="3.8" fill="#F16E9A" opacity="0.58" />

        {/* Nose + Happy/Encouraging Smile */}
        <ellipse cx="80" cy="71" rx="5.2" ry="3.6" fill="#FF9B42" />
        <ellipse cx="78.8" cy="70" rx="2" ry="1" fill="#FFE885" opacity="0.8" />
        {pose === 'celebrating' ? (
          <path d="M70 76 Q80 88 90 76 Z" fill="#F16E9A" stroke="#25233A" strokeWidth="2" strokeLinejoin="round" />
        ) : pose === 'thinking' ? (
          <path d="M74 79 Q80 77 86 79" stroke="#25233A" strokeWidth="2.6" strokeLinecap="round" />
        ) : (
          <path d="M71 76 Q80 85 89 76" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        )}
      </svg>

      {speech && (
        <div className="mt-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#231F46] border border-[#E5DDF7] dark:border-[#38316B] shadow-card text-xs font-bold text-[#25233A] dark:text-[#F8F7FF] text-center max-w-[260px]">
          {speech}
        </div>
      )}
    </div>
  );
};

interface AjudaKidsBrandBadgeProps {
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Selo Oficial 3D Ajuda KIDS — Ícone de aplicativo volumétrico com brilho vítreo
 * e tipografia multicolorida inspirada no estilo EdTech infantil premium.
 */
export const AjudaKidsBrandBadge: React.FC<AjudaKidsBrandBadgeProps> = ({
  size = 44,
  showWordmark = true,
  subtitle,
  compact = false,
  className = ''
}) => {
  const uid = React.useId().replace(/:/g, '');

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 ak-toy-3d"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 64 64" width={size} height={size} fill="none">
          <defs>
            <linearGradient id={`akBadgeBase-${uid}`} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#9A7BFF" />
              <stop offset="52%" stopColor="#7047E8" />
              <stop offset="100%" stopColor="#4389F5" />
            </linearGradient>
            <linearGradient id={`akBadgeGloss-${uid}`} x1="12" y1="6" x2="48" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`akStar3D-${uid}`} cx="38%" cy="32%" r="65%">
              <stop offset="0%" stopColor="#FFF6B8" />
              <stop offset="52%" stopColor="#FFD34E" />
              <stop offset="100%" stopColor="#FF9B42" />
            </radialGradient>
            <radialGradient id={`akSparkGreen-${uid}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#36C995" />
            </radialGradient>
          </defs>
          {/* Base lip shadow */}
          <rect x="4" y="7" width="56" height="54" rx="18" fill="#4E29BA" />
          {/* 3D glossy squircle */}
          <rect x="4" y="3" width="56" height="54" rx="18" fill={`url(#akBadgeBase-${uid})`} />
          <rect x="6.5" y="5.5" width="51" height="24" rx="15" fill={`url(#akBadgeGloss-${uid})`} />
          {/* Mini floating planetary beads */}
          <circle cx="15" cy="17" r="4.5" fill={`url(#akSparkGreen-${uid})`} />
          <circle cx="13.8" cy="15.8" r="1.4" fill="#FFFFFF" opacity="0.85" />
          <circle cx="49" cy="16" r="3.4" fill="#F16E9A" />
          <circle cx="48" cy="15" r="1.1" fill="#FFFFFF" opacity="0.85" />
          {/* Central 3D Golden Star / Buddy Smile */}
          <path
            d="M32 13 L37.5 23.6 L49.2 25.5 L40.8 33.8 L42.7 45.4 L32 40 L21.3 45.4 L23.2 33.8 L14.8 25.5 L26.5 23.6 Z"
            fill="#E37C19"
            transform="translate(0 2)"
          />
          <path
            d="M32 13 L37.5 23.6 L49.2 25.5 L40.8 33.8 L42.7 45.4 L32 40 L21.3 45.4 L23.2 33.8 L14.8 25.5 L26.5 23.6 Z"
            fill={`url(#akStar3D-${uid})`}
          />
          {/* Cute glossy eyes & smile inside star */}
          <circle cx="28" cy="29.5" r="2.2" fill="#25233A" />
          <circle cx="28.6" cy="28.8" r="0.8" fill="#FFFFFF" />
          <circle cx="36" cy="29.5" r="2.2" fill="#25233A" />
          <circle cx="36.6" cy="28.8" r="0.8" fill="#FFFFFF" />
          <path d="M29.4 33.4 Q32 35.8 34.6 33.4" stroke="#25233A" strokeWidth="1.9" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {showWordmark && (
        <div className="leading-tight">
          <div className={`font-display font-bold tracking-tight flex items-baseline gap-1 ${compact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
            <span className="text-[#25233A] dark:text-[#F8F7FF]">Ajuda</span>
            <span className="inline-flex items-baseline drop-shadow-sm">
              <span className="text-[#7047E8] dark:text-[#A78BFA]">K</span>
              <span className="text-[#4389F5] dark:text-[#60A5FA]">I</span>
              <span className="text-[#FF9B42] dark:text-[#FDBA74]">D</span>
              <span className="text-[#36C995] dark:text-[#6EE7B7]">S</span>
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] font-bold text-[#77758A] dark:text-[#B8B3D6] leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
