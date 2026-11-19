import React from 'react';
import type { ChildTab } from '@/components/layout/ChildNavBar';

export type BackgroundTheme = ChildTab | 'adult' | 'family';

interface ThematicPageBackgroundProps {
  tab: BackgroundTheme;
}

/**
 * 1. Home Park World — Inspirado no Reference Image 1 ("Yay World!")
 * Céu lavanda-celeste suave com nuvens 3D fofas, brilho solar e colinas verdejantes limpas.
 */
const HomeParkBackdrop: React.FC = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-[#EDF2FF] via-[#F5F3FC] to-[#E9F9F0]">
    <div
      className="ak-ambient-orb absolute -top-28 right-[-8%] w-[520px] h-[520px] rounded-full opacity-55 blur-3xl"
      style={{ background: 'radial-gradient(circle, rgba(255,211,78,0.45) 0%, rgba(255,211,78,0) 72%)' }}
    />
    <div
      className="ak-ambient-orb absolute top-[20%] -left-24 w-[440px] h-[440px] rounded-full opacity-50 blur-3xl"
      style={{
        background: 'radial-gradient(circle, rgba(112,71,232,0.16) 0%, rgba(112,71,232,0) 72%)',
        animationDelay: '-6s'
      }}
    />

    <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="homeHillFar9" x1="0" y1="540" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D7F3E6" />
          <stop offset="100%" stopColor="#BCEBD6" />
        </linearGradient>
        <linearGradient id="homeHillNear9" x1="0" y1="640" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9CE4C6" />
          <stop offset="100%" stopColor="#6CD6AD" />
        </linearGradient>
        <linearGradient id="cloud3dGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E6E4FA" />
        </linearGradient>
      </defs>

      {/* Soft Glossy Clouds */}
      <g className="ak-ambient-cloud-slow" opacity="0.9">
        <path d="M90 155 Q125 105 180 120 Q230 92 275 122 Q325 112 340 155 Q348 182 308 186 L120 186 Q78 182 90 155 Z" fill="url(#cloud3dGrad)" />
      </g>
      <g className="ak-ambient-cloud-reverse" opacity="0.85">
        <path d="M970 120 Q1000 84 1045 96 Q1090 74 1130 98 Q1170 90 1185 120 Q1194 146 1158 150 L1000 150 Q960 146 970 120 Z" fill="url(#cloud3dGrad)" />
      </g>

      {/* Gentle Floating Candy Stars */}
      <circle cx="480" cy="145" r="7" fill="#FFD34E" opacity="0.55" />
      <circle cx="810" cy="195" r="5" fill="#F16E9A" opacity="0.45" />
      <circle cx="1310" cy="230" r="6" fill="#4389F5" opacity="0.4" />

      {/* Layered Mint-Green Hills */}
      <path d="M0 645 Q380 550 760 630 Q1120 700 1440 590 L1440 900 L0 900 Z" fill="url(#homeHillFar9)" />
      <path d="M0 735 Q390 665 810 735 Q1150 785 1440 695 L1440 900 L0 900 Z" fill="url(#homeHillNear9)" />
    </svg>
  </div>
);

/**
 * 2. Mundo dos Livros e Saberes (Aprender)
 */
const LearnSkyBackdrop: React.FC = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-[#EAEFFF] via-[#F5F3FC] to-[#E8F6FF]">
    <div
      className="ak-ambient-orb absolute -top-24 -left-16 w-[520px] h-[520px] rounded-full opacity-55 blur-3xl"
      style={{ background: 'radial-gradient(circle, rgba(67,137,245,0.22) 0%, rgba(67,137,245,0) 70%)' }}
    />
    <div
      className="ak-ambient-orb absolute top-[35%] right-[-10%] w-[460px] h-[460px] rounded-full opacity-50 blur-3xl"
      style={{
        background: 'radial-gradient(circle, rgba(112,71,232,0.18) 0%, rgba(112,71,232,0) 70%)',
        animationDelay: '-8s'
      }}
    />
    <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMax slice">
      <g className="ak-ambient-cloud-slow" opacity="0.92">
        <path d="M130 190 Q175 135 235 152 Q290 118 345 152 Q395 142 415 190 Q422 222 380 226 L160 226 Q116 222 130 190 Z" fill="#FFFFFF" />
      </g>
      <g className="ak-ambient-balloon" opacity="0.55">
        <circle cx="1230" cy="180" r="24" fill="#FFD34E" />
        <circle cx="1220" cy="170" r="8" fill="#FFFFFF" opacity="0.55" />
      </g>
      <path d="M0 715 Q400 620 820 710 Q1180 770 1440 675 L1440 900 L0 900 Z" fill="#DCEBFF" opacity="0.8" />
    </svg>
  </div>
);

/**
 * 3. Arena Mágica 3D (Jogar)
 */
const PlayAmusementBackdrop: React.FC = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-[#F0ECFF] via-[#F5F3FC] to-[#FFF1F7]">
    <div
      className="ak-ambient-orb absolute -top-24 left-[10%] w-[520px] h-[520px] rounded-full opacity-55 blur-3xl"
      style={{ background: 'radial-gradient(circle, rgba(112,71,232,0.22) 0%, rgba(112,71,232,0) 72%)' }}
    />
    <div
      className="ak-ambient-orb absolute bottom-0 right-[6%] w-[460px] h-[460px] rounded-full opacity-50 blur-3xl"
      style={{
        background: 'radial-gradient(circle, rgba(241,110,154,0.20) 0%, rgba(241,110,154,0) 72%)',
        animationDelay: '-6s'
      }}
    />
    <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMax slice">
      <g className="ak-ambient-balloon" opacity="0.65">
        <circle cx="165" cy="175" r="22" fill="#FF9B42" />
        <circle cx="157" cy="167" r="7" fill="#FFFFFF" opacity="0.5" />
      </g>
      <g className="ak-ambient-balloon" style={{ animationDelay: '-4s' }} opacity="0.65">
        <circle cx="1285" cy="155" r="24" fill="#36C995" />
        <circle cx="1276" cy="147" r="7.5" fill="#FFFFFF" opacity="0.5" />
      </g>
      <path d="M0 730 Q360 660 760 735 Q1140 795 1440 705 L1440 900 L0 900 Z" fill="#EAE2FF" opacity="0.7" />
    </svg>
  </div>
);

/**
 * 4. Vale das Estrelas (Progresso)
 */
const ProgressStarryValleyBackdrop: React.FC = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E2] via-[#F5F3FC] to-[#ECE8FF]">
    <div
      className="ak-ambient-orb absolute -top-20 right-[8%] w-[480px] h-[480px] rounded-full opacity-55 blur-3xl"
      style={{ background: 'radial-gradient(circle, rgba(255,211,78,0.34) 0%, rgba(255,211,78,0) 72%)' }}
    />
    <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMax slice">
      <circle cx="220" cy="150" r="10" fill="#FFD34E" opacity="0.6" />
      <circle cx="1210" cy="190" r="9" fill="#7047E8" opacity="0.35" />
      <path d="M0 725 Q400 645 840 725 Q1160 780 1440 695 L1440 900 L0 900 Z" fill="#EFE9FF" opacity="0.78" />
    </svg>
  </div>
);

/**
 * 5. Clubinho do Explorador (Perfil)
 */
const ProfileClubhouseBackdrop: React.FC = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-[#F5ECFF] via-[#F5F3FC] to-[#EBF6FF]">
    <div
      className="ak-ambient-orb absolute -top-24 -left-16 w-[480px] h-[480px] rounded-full opacity-55 blur-3xl"
      style={{ background: 'radial-gradient(circle, rgba(241,110,154,0.22) 0%, rgba(241,110,154,0) 70%)' }}
    />
    <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMax slice">
      <path d="M0 735 Q390 660 800 730 Q1140 785 1440 700 L1440 900 L0 900 Z" fill="#EDE9FE" opacity="0.75" />
    </svg>
  </div>
);

/**
 * 6. Dark Mode Cosmic Indigo Infantil — Inspirado na Imagem de Referência 2
 * Universo roxo-índigo profundo (#121024 -> #1A1638 -> #231C52) com brilhos etéreos e estrelas sutis.
 */
const ChildNightIndigoBackdrop: React.FC<{ tab: BackgroundTheme }> = ({ tab }) => {
  const glowColor =
    tab === 'play'
      ? 'rgba(241, 110, 154, 0.24)'
      : tab === 'progress'
        ? 'rgba(255, 211, 78, 0.2)'
        : tab === 'learn'
          ? 'rgba(67, 137, 245, 0.24)'
          : tab === 'profile'
            ? 'rgba(54, 201, 149, 0.2)'
            : 'rgba(112, 71, 232, 0.34)';

  return (
    <div
      className="hidden dark:block absolute inset-0"
      style={{
        background: 'linear-gradient(180deg, #121024 0%, #191536 52%, #221B4D 100%)'
      }}
    >
      <div
        className="ak-ambient-orb absolute -top-32 left-[-8%] w-[600px] h-[600px] rounded-full opacity-50 blur-3xl"
        style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 72%)` }}
      />
      <div
        className="ak-ambient-orb absolute top-[22%] right-[-10%] w-[520px] h-[520px] rounded-full opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(67,137,245,0.28) 0%, transparent 72%)',
          animationDelay: '-8s'
        }}
      />
      <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMax slice">
        <g opacity="0.7">
          <circle cx="170" cy="110" r="2.2" fill="#FFFFFF" className="ak-ambient-star" />
          <circle cx="420" cy="160" r="2.8" fill="#FFD34E" className="ak-ambient-star" style={{ animationDelay: '-1.2s' }} />
          <circle cx="690" cy="88" r="2" fill="#FFFFFF" className="ak-ambient-star" style={{ animationDelay: '-2.1s' }} />
          <circle cx="960" cy="145" r="2.6" fill="#A88BFF" className="ak-ambient-star" style={{ animationDelay: '-0.8s' }} />
          <circle cx="1260" cy="118" r="2.2" fill="#FFD34E" className="ak-ambient-star" style={{ animationDelay: '-3s' }} />
        </g>
        <path d="M0 730 Q390 660 790 730 Q1140 785 1440 700 L1440 900 L0 900 Z" fill="#171336" opacity="0.65" />
      </svg>
    </div>
  );
};

/**
 * 7. Ambiente Família / Pais / Auth
 */
export const AmbientAdultBackdrop: React.FC = () => (
  <div
    className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    data-testid="thematic-bg-adult"
    aria-hidden="true"
  >
    <div
      className="dark:hidden absolute inset-0"
      style={{ background: 'linear-gradient(180deg, #F5F3FC 0%, #EFEAFD 56%, #F8F7FE 100%)' }}
    >
      <div
        className="ak-ambient-orb absolute -top-36 -left-24 w-[620px] h-[620px] rounded-full opacity-55 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(112,71,232,0.16) 0%, rgba(112,71,232,0) 70%)' }}
      />
      <div
        className="ak-ambient-orb absolute top-[18%] -right-28 w-[540px] h-[540px] rounded-full opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(67,137,245,0.15) 0%, rgba(67,137,245,0) 70%)',
          animationDelay: '-8s'
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.3]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="adult-grid-9-light" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#E4DFF5" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#adult-grid-9-light)" />
      </svg>
    </div>

    <div
      className="hidden dark:block absolute inset-0"
      style={{ background: 'linear-gradient(180deg, #121024 0%, #171430 55%, #1E1B3A 100%)' }}
    >
      <div
        className="ak-ambient-orb absolute -top-40 left-[-8%] w-[620px] h-[620px] rounded-full opacity-45 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(112,71,232,0.42) 0%, rgba(112,71,232,0) 70%)' }}
      />
      <div
        className="ak-ambient-orb absolute top-[12%] right-[-8%] w-[540px] h-[540px] rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(67,137,245,0.32) 0%, rgba(67,137,245,0) 70%)',
          animationDelay: '-7s'
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.22]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="adult-grid-9-dark" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#38316B" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#adult-grid-9-dark)" />
      </svg>
    </div>
  </div>
);

export const ThematicPageBackground: React.FC<ThematicPageBackgroundProps> = ({ tab }) => {
  if (tab === 'adult' || tab === 'family') {
    return <AmbientAdultBackdrop />;
  }

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      data-testid={`thematic-bg-${tab}`}
      aria-hidden="true"
    >
      <div className="dark:hidden absolute inset-0">
        {tab === 'home' && <HomeParkBackdrop />}
        {tab === 'learn' && <LearnSkyBackdrop />}
        {tab === 'play' && <PlayAmusementBackdrop />}
        {tab === 'progress' && <ProgressStarryValleyBackdrop />}
        {tab === 'profile' && <ProfileClubhouseBackdrop />}
      </div>
      <ChildNightIndigoBackdrop tab={tab} />
    </div>
  );
};
