import React from 'react';

interface ParkPlaygroundSceneProps {
  isDarkMode?: boolean;
  className?: string;
}

export const ParkPlaygroundScene: React.FC<ParkPlaygroundSceneProps> = ({
  isDarkMode = false,
  className = ''
}) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <div className={`w-full h-full overflow-hidden select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 1200 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id={`daySky-${uid}`} x1="0" y1="0" x2="0" y2="720" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ECEAFF" />
            <stop offset="0.52" stopColor="#F5F3FC" />
            <stop offset="1" stopColor="#E9F9F0" />
          </linearGradient>
          <linearGradient id={`nightSky-${uid}`} x1="0" y1="0" x2="0" y2="720" gradientUnits="userSpaceOnUse">
            <stop stopColor="#121024" />
            <stop offset="0.58" stopColor="#1A1638" />
            <stop offset="1" stopColor="#221B4D" />
          </linearGradient>
          <linearGradient id={`hillFar-${uid}`} x1="0" y1="420" x2="0" y2="720" gradientUnits="userSpaceOnUse">
            <stop stopColor={isDarkMode ? '#1F1B4A' : '#D4F5E6'} />
            <stop offset="1" stopColor={isDarkMode ? '#171436' : '#BCEBD6'} />
          </linearGradient>
          <linearGradient id={`hillNear-${uid}`} x1="0" y1="500" x2="0" y2="720" gradientUnits="userSpaceOnUse">
            <stop stopColor={isDarkMode ? '#29215C' : '#95E3C2'} />
            <stop offset="1" stopColor={isDarkMode ? '#1A1638' : '#5FD0A2'} />
          </linearGradient>
        </defs>

        <rect width="1200" height="720" fill={isDarkMode ? `url(#nightSky-${uid})` : `url(#daySky-${uid})`} />

        {/* Sun or Crescent Moon */}
        {!isDarkMode ? (
          <g transform="translate(1050, 96)">
            <circle cx="0" cy="0" r="46" fill="#FFD34E" opacity="0.28" />
            <circle cx="0" cy="0" r="32" fill="#FFD34E" />
            <circle cx="-10" cy="-10" r="10" fill="#FFF7B8" opacity="0.55" />
          </g>
        ) : (
          <g transform="translate(1050, 96)">
            <circle cx="0" cy="0" r="38" fill="#FFD34E" opacity="0.2" />
            <path d="M12 -28 C26 -28 36 -16 36 0 C36 18 22 32 4 32 C-14 32 -28 18 -28 0 C-18 -2 -7 4 6 4 C18 4 27 -4 28 -16 Z" fill="#FFF2B8" />
            <circle cx="-220" cy="40" r="2.2" fill="#FFFFFF" opacity="0.8" />
            <circle cx="-460" cy="25" r="2.5" fill="#FFD34E" opacity="0.8" />
            <circle cx="-690" cy="48" r="2" fill="#FFFFFF" opacity="0.7" />
          </g>
        )}

        {/* Fluffy 3D Clouds */}
        <g opacity={isDarkMode ? 0.16 : 0.85} fill="#FFFFFF">
          <path d="M120 130 Q140 100 175 110 Q205 90 235 110 Q265 105 275 130 Q282 155 250 160 L140 160 Q110 155 120 130 Z" />
          <path d="M520 95 Q540 70 570 80 Q595 60 620 80 Q645 75 655 95 Q662 115 630 120 L540 120 Q510 115 520 95 Z" />
        </g>

        {/* Hills & Minimalist 3D Playground Gems */}
        <g transform="translate(0, 240)">
          <path d="M0 310 Q280 220 620 280 Q940 330 1200 240 L1200 480 L0 480 Z" fill={`url(#hillFar-${uid})`} />
          <path d="M0 360 Q340 290 700 340 Q1000 380 1200 320 L1200 480 L0 480 Z" fill={`url(#hillNear-${uid})`} />

          {/* Rounded Pastel Park Trees */}
          <g transform="translate(130, 220)">
            <rect x="34" y="55" width="16" height="80" rx="8" fill={isDarkMode ? '#4A3A7A' : '#A47148'} />
            <circle cx="42" cy="36" r="46" fill={isDarkMode ? '#36C995' : '#36C995'} opacity={isDarkMode ? 0.25 : 0.9} />
            <circle cx="30" cy="24" r="18" fill="#8DF0C7" opacity="0.45" />
          </g>
          <g transform="translate(970, 240)">
            <rect x="28" y="45" width="14" height="68" rx="7" fill={isDarkMode ? '#4A3A7A' : '#A47148'} />
            <circle cx="35" cy="30" r="38" fill={isDarkMode ? '#7047E8' : '#36C995'} opacity={isDarkMode ? 0.3 : 0.85} />
          </g>
        </g>
      </svg>
    </div>
  );
};
