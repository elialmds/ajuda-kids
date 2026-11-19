import React from 'react';
import { SkillArea } from '@/types';

export type CharacterPose = 'happy' | 'waving' | 'thinking' | 'celebrating';

export interface MundoCompanion {
  id: string;
  name: string;
  title: string;
  skillArea: SkillArea;
  skillLabel: string;
  description: string;
  bgColor: string;
  accentColor: string;
  renderCharacter: (size?: number, pose?: CharacterPose, className?: string) => React.ReactNode;
}

export interface KidCharacter {
  id: string;
  name: string;
  gender: 'girl' | 'boy';
  personality: string;
  companionId: string;
  primaryColor: string;
  accentColor: string;
  renderAvatar: (size?: number, className?: string) => React.ReactNode;
}

interface CompanionSvgProps {
  size: number;
  pose: CharacterPose;
  className: string;
}

interface AvatarSvgProps {
  size: number;
  className: string;
}

/**
 * Shared 3D Eye Pair matching Kiko (Guia) — glossy iris with dual white specular catchlights
 */
const PlushEyes: React.FC<{
  lx: number;
  rx: number;
  y: number;
  r?: number;
  happyArc?: boolean;
}> = ({ lx, rx, y, r = 7.4, happyArc = false }) => {
  if (happyArc) {
    return (
      <>
        <path
          d={`M ${lx - r * 0.85} ${y + 1} Q ${lx} ${y - r * 1.05} ${lx + r * 0.85} ${y + 1}`}
          stroke="#25233A"
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${rx - r * 0.85} ${y + 1} Q ${rx} ${y - r * 1.05} ${rx + r * 0.85} ${y + 1}`}
          stroke="#25233A"
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
      </>
    );
  }
  return (
    <>
      <circle cx={lx} cy={y} r={r} fill="#25233A" />
      <circle cx={lx + r * 0.32} cy={y - r * 0.34} r={r * 0.37} fill="#FFFFFF" />
      <circle cx={lx - r * 0.32} cy={y + r * 0.36} r={r * 0.17} fill="#FFFFFF" />

      <circle cx={rx} cy={y} r={r} fill="#25233A" />
      <circle cx={rx + r * 0.32} cy={y - r * 0.34} r={r * 0.37} fill="#FFFFFF" />
      <circle cx={rx - r * 0.32} cy={y + r * 0.36} r={r * 0.17} fill="#FFFFFF" />
    </>
  );
};

/**
 * 1. LUMI — Guardiã da Comunicação (Passarinha Celeste 3D)
 */
const Lumi3DSvg: React.FC<CompanionSvgProps> = ({ size, pose, className }) => {
  const uid = React.useId().replace(/:/g, '');
  const wingUp = pose === 'waving' || pose === 'celebrating';

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`lumiShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4389F5" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#4389F5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`lumiBody-${uid}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#99D8FF" />
          <stop offset="54%" stopColor="#4389F5" />
          <stop offset="100%" stopColor="#265BC9" />
        </radialGradient>
        <radialGradient id={`lumiBelly-${uid}`} cx="46%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#DCF0FF" />
        </radialGradient>
        <linearGradient id={`lumiWing-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6EC1FF" />
          <stop offset="100%" stopColor="#2357BF" />
        </linearGradient>
        <radialGradient id={`lumiBeak-${uid}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFE680" />
          <stop offset="55%" stopColor="#FF9B42" />
          <stop offset="100%" stopColor="#DF6714" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="144" rx="44" ry="9" fill={`url(#lumiShadow-${uid})`} />

      {/* Celebrating Golden Stars */}
      {pose === 'celebrating' && (
        <g>
          <path d="M24 38 L27 44 L34 45 L29 50 L30 57 L24 53.5 L18 57 L19 50 L14 45 L21 44 Z" fill="#FFD34E" />
          <circle cx="136" cy="40" r="5" fill="#F16E9A" />
        </g>
      )}

      {/* Tail Plume */}
      <path d="M52 120 Q36 142 62 138 Q68 126 66 118 Z" fill="#2B67D9" />

      {/* Plump Wings */}
      <ellipse
        cx={wingUp ? '28' : '34'}
        cy={wingUp ? '84' : '102'}
        rx="16"
        ry="25"
        transform={wingUp ? 'rotate(-36 28 84)' : 'rotate(16 34 102)'}
        fill={`url(#lumiWing-${uid})`}
      />
      <ellipse
        cx={wingUp ? '132' : '126'}
        cy={wingUp ? '82' : '102'}
        rx="16"
        ry="25"
        transform={wingUp ? 'rotate(38 132 82)' : 'rotate(-16 126 102)'}
        fill={`url(#lumiWing-${uid})`}
      />

      {/* Feet */}
      <ellipse cx="64" cy="136" rx="11" ry="6.5" fill={`url(#lumiBeak-${uid})`} />
      <ellipse cx="96" cy="136" rx="11" ry="6.5" fill={`url(#lumiBeak-${uid})`} />

      {/* Sculpted 3D Crest Feathers */}
      <ellipse cx="73" cy="24" rx="9" ry="16" transform="rotate(-18 73 24)" fill="#FFD34E" />
      <ellipse cx="86" cy="22" rx="10" ry="18" transform="rotate(14 86 22)" fill="#7047E8" />
      <ellipse cx="83" cy="18" rx="4" ry="8" transform="rotate(14 83 18)" fill="#A88BFF" opacity="0.6" />

      {/* 3D Body + Head Sphere */}
      <ellipse cx="80" cy="108" rx="40" ry="33" fill={`url(#lumiBody-${uid})`} />
      <ellipse cx="80" cy="68" rx="44" ry="38" fill={`url(#lumiBody-${uid})`} />

      {/* Glossy Top Rim */}
      <ellipse cx="64" cy="43" rx="22" ry="9" transform="rotate(-14 64 43)" fill="#FFFFFF" opacity="0.28" />

      {/* Cream Belly & Face Mask */}
      <ellipse cx="80" cy="111" rx="26" ry="23" fill={`url(#lumiBelly-${uid})`} />
      <ellipse cx="80" cy="70" rx="34" ry="25" fill={`url(#lumiBelly-${uid})`} />

      {/* Belly Speech Heart */}
      <path
        d="M80 119 C70 112 66 104 71 99 C75 95 80 99 80 102 C80 99 85 95 89 99 C94 104 90 112 80 119 Z"
        fill="#F16E9A"
      />

      {/* Glossy Dual-Catchlight Eyes */}
      <PlushEyes lx={63} rx={97} y={65} r={7.6} happyArc={pose === 'celebrating'} />

      {/* Rosy Cheeks */}
      <ellipse cx="51" cy="75" rx="6.2" ry="3.8" fill="#F16E9A" opacity="0.55" />
      <ellipse cx="109" cy="75" rx="6.2" ry="3.8" fill="#F16E9A" opacity="0.55" />

      {/* Sculpted Beak */}
      <path d="M72 72 Q80 68 88 72 L83 84 Q80 87 77 84 Z" fill={`url(#lumiBeak-${uid})`} />
      <ellipse cx="78" cy="73" rx="3" ry="1.4" fill="#FFF7CC" opacity="0.85" />
      {pose === 'thinking' && (
        <circle cx="122" cy="40" r="4.5" fill="#FFD34E" />
      )}
    </svg>
  );
};

/**
 * 2. TÉO — Guardião da Descoberta (Guaxinim Inventor 3D)
 */
const Teo3DSvg: React.FC<CompanionSvgProps> = ({ size, pose, className }) => {
  const uid = React.useId().replace(/:/g, '');
  const raised = pose === 'waving' || pose === 'celebrating';

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`teoShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7047E8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#7047E8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`teoBody-${uid}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#B89DFF" />
          <stop offset="56%" stopColor="#7047E8" />
          <stop offset="100%" stopColor="#4626A8" />
        </radialGradient>
        <radialGradient id={`teoBelly-${uid}`} cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EAE3FF" />
        </radialGradient>
        <linearGradient id={`teoMask-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4B31A6" />
          <stop offset="100%" stopColor="#2B1C69" />
        </linearGradient>
        <radialGradient id={`teoGold-${uid}`} cx="35%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#FFF5B8" />
          <stop offset="60%" stopColor="#FFD34E" />
          <stop offset="100%" stopColor="#E69514" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="144" rx="46" ry="9" fill={`url(#teoShadow-${uid})`} />

      {/* Fluffy Striped Raccoon Tail */}
      <path d="M108 118 Q144 120 144 92 Q142 74 128 84 Q118 98 106 106 Z" fill="#5B37CC" />
      <path d="M122 95 Q134 100 135 110" stroke="#DDD2FF" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M132 85 Q141 88 142 97" stroke="#DDD2FF" strokeWidth="5.5" strokeLinecap="round" fill="none" />

      {/* Rounded Plush Ears */}
      <circle cx="44" cy="40" r="14" fill="#5734C4" />
      <circle cx="45" cy="41" r="7.5" fill="#F16E9A" opacity="0.82" />
      <circle cx="116" cy="40" r="14" fill="#5734C4" />
      <circle cx="115" cy="41" r="7.5" fill="#F16E9A" opacity="0.82" />

      {/* Arms */}
      <ellipse
        cx={raised ? '30' : '37'}
        cy={raised ? '82' : '104'}
        rx="13"
        ry="21"
        transform={raised ? 'rotate(-36 30 82)' : 'rotate(20 37 104)'}
        fill={`url(#teoBody-${uid})`}
      />
      <ellipse
        cx={raised ? '130' : '123'}
        cy={raised ? '80' : '104'}
        rx="13"
        ry="21"
        transform={raised ? 'rotate(36 130 80)' : 'rotate(-20 123 104)'}
        fill={`url(#teoBody-${uid})`}
      />

      {/* Feet */}
      <ellipse cx="62" cy="136" rx="13" ry="7.5" fill="#4626A8" />
      <ellipse cx="98" cy="136" rx="13" ry="7.5" fill="#4626A8" />

      {/* Body + Head */}
      <ellipse cx="80" cy="110" rx="39" ry="31" fill={`url(#teoBody-${uid})`} />
      <ellipse cx="80" cy="68" rx="45" ry="37" fill={`url(#teoBody-${uid})`} />
      <ellipse cx="64" cy="42" rx="22" ry="9" transform="rotate(-12 64 42)" fill="#FFFFFF" opacity="0.25" />

      {/* Cream Belly & Muzzle */}
      <ellipse cx="80" cy="113" rx="26" ry="22" fill={`url(#teoBelly-${uid})`} />
      <ellipse cx="80" cy="76" rx="23" ry="15" fill={`url(#teoBelly-${uid})`} />

      {/* Plump Explorer Bowtie / Gear Gem */}
      <path d="M68 95 L80 100 L68 105 Z" fill="#FF9B42" />
      <path d="M92 95 L80 100 L92 105 Z" fill="#FF9B42" />
      <circle cx="80" cy="100" r="4.5" fill={`url(#teoGold-${uid})`} />

      {/* Raccoon Mask Patches */}
      <ellipse cx="62" cy="63" rx="14" ry="11" transform="rotate(-10 62 63)" fill={`url(#teoMask-${uid})`} />
      <ellipse cx="98" cy="63" rx="14" ry="11" transform="rotate(10 98 63)" fill={`url(#teoMask-${uid})`} />

      {/* Golden Monocle Rim on Left Eye */}
      <circle cx="62" cy="63" r="11" stroke={`url(#teoGold-${uid})`} strokeWidth="2.6" fill="none" />

      {/* Eyes */}
      <PlushEyes lx={62} rx={98} y={63} r={6.8} happyArc={pose === 'celebrating'} />

      {/* Cheeks, Nose, Smile */}
      <ellipse cx="48" cy="74" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.52" />
      <ellipse cx="112" cy="74" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.52" />
      <ellipse cx="80" cy="72" rx="5.2" ry="3.6" fill="#25233A" />
      <ellipse cx="78.5" cy="71" rx="1.8" ry="0.9" fill="#FFFFFF" opacity="0.8" />
      <path d="M72 78 Q80 85 88 78" stroke="#25233A" strokeWidth="2.6" strokeLinecap="round" fill="none" />

      {/* Floating Idea Bulb on Celebrating/Thinking */}
      {(pose === 'thinking' || pose === 'celebrating') && (
        <circle cx="128" cy="34" r="6" fill={`url(#teoGold-${uid})`} />
      )}
    </svg>
  );
};

/**
 * 3. MAYA — Guardiã da Atenção (Raposinha Folha / Guardiã Verde 3D)
 */
const Maya3DSvg: React.FC<CompanionSvgProps> = ({ size, pose, className }) => {
  const uid = React.useId().replace(/:/g, '');
  const wingUp = pose === 'waving' || pose === 'celebrating';

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`mayaShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#36C995" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#36C995" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`mayaBody-${uid}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#8DF0C7" />
          <stop offset="56%" stopColor="#36C995" />
          <stop offset="100%" stopColor="#178760" />
        </radialGradient>
        <radialGradient id={`mayaCream-${uid}`} cx="45%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#DFFBEF" />
        </radialGradient>
        <radialGradient id={`mayaLeaf-${uid}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFF5B8" />
          <stop offset="100%" stopColor="#FFD34E" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="144" rx="45" ry="9" fill={`url(#mayaShadow-${uid})`} />

      {/* Leaf Head Sprout */}
      <path d="M80 34 Q82 14 98 14 Q96 30 80 34 Z" fill="#6EE7B7" />
      <path d="M80 34 Q68 18 58 24 Q64 36 80 34 Z" fill="#36C995" />

      {/* Fluffy Ears */}
      <circle cx="45" cy="40" r="15" fill="#28A97C" />
      <circle cx="46" cy="41" r="8" fill="#FFDFB8" />
      <circle cx="115" cy="40" r="15" fill="#28A97C" />
      <circle cx="114" cy="41" r="8" fill="#FFDFB8" />

      {/* Arms */}
      <ellipse
        cx={wingUp ? '28' : '37'}
        cy={wingUp ? '82' : '104'}
        rx="13"
        ry="21"
        transform={wingUp ? 'rotate(-36 28 82)' : 'rotate(20 37 104)'}
        fill={`url(#mayaBody-${uid})`}
      />
      <ellipse
        cx={wingUp ? '132' : '123'}
        cy={wingUp ? '82' : '104'}
        rx="13"
        ry="21"
        transform={wingUp ? 'rotate(36 132 82)' : 'rotate(-20 123 104)'}
        fill={`url(#mayaBody-${uid})`}
      />

      {/* Feet */}
      <ellipse cx="62" cy="136" rx="13" ry="7.5" fill="#178760" />
      <ellipse cx="98" cy="136" rx="13" ry="7.5" fill="#178760" />

      {/* Body + Head */}
      <ellipse cx="80" cy="110" rx="39" ry="31" fill={`url(#mayaBody-${uid})`} />
      <ellipse cx="80" cy="68" rx="45" ry="37" fill={`url(#mayaBody-${uid})`} />
      <ellipse cx="64" cy="42" rx="22" ry="9" transform="rotate(-12 64 42)" fill="#FFFFFF" opacity="0.28" />

      {/* Cream Face Disc & Belly */}
      <ellipse cx="80" cy="112" rx="26" ry="22" fill={`url(#mayaCream-${uid})`} />
      <ellipse cx="80" cy="70" rx="35" ry="25" fill={`url(#mayaCream-${uid})`} />

      {/* Golden Sun Flower Badge */}
      <circle cx="80" cy="111" r="8.5" fill={`url(#mayaLeaf-${uid})`} />
      <circle cx="80" cy="111" r="4" fill="#FF9B42" />

      {/* Eyes + Cheeks + Smile */}
      <PlushEyes lx={63} rx={97} y={66} r={7.5} happyArc={pose === 'celebrating'} />
      <ellipse cx="50" cy="75" rx="6" ry="3.5" fill="#F16E9A" opacity="0.54" />
      <ellipse cx="110" cy="75" rx="6" ry="3.5" fill="#F16E9A" opacity="0.54" />
      <ellipse cx="80" cy="73" rx="4.5" ry="3" fill="#25233A" />
      <path d="M72 79 Q80 86 88 79" stroke="#25233A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  );
};

/**
 * 4. SOL — Guardião das Emoções (Leãozinho Dourado 3D)
 */
const Sol3DSvg: React.FC<CompanionSvgProps> = ({ size, pose, className }) => {
  const uid = React.useId().replace(/:/g, '');
  const raised = pose === 'waving' || pose === 'celebrating';

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`solShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF9B42" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FF9B42" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`solMane-${uid}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFC15E" />
          <stop offset="56%" stopColor="#FF9B42" />
          <stop offset="100%" stopColor="#D66213" />
        </radialGradient>
        <radialGradient id={`solFace-${uid}`} cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFF5B8" />
          <stop offset="60%" stopColor="#FFD34E" />
          <stop offset="100%" stopColor="#F4A818" />
        </radialGradient>
        <radialGradient id={`solBelly-${uid}`} cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF0C4" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="144" rx="45" ry="9" fill={`url(#solShadow-${uid})`} />

      {/* Arms */}
      <ellipse
        cx={raised ? '28' : '37'}
        cy={raised ? '86' : '106'}
        rx="12.5"
        ry="20"
        transform={raised ? 'rotate(-36 28 86)' : 'rotate(20 37 106)'}
        fill={`url(#solFace-${uid})`}
      />
      <ellipse
        cx={raised ? '132' : '123'}
        cy={raised ? '86' : '106'}
        rx="12.5"
        ry="20"
        transform={raised ? 'rotate(36 132 86)' : 'rotate(-20 123 106)'}
        fill={`url(#solFace-${uid})`}
      />

      {/* Feet */}
      <ellipse cx="63" cy="136" rx="12.5" ry="7.5" fill="#E68A12" />
      <ellipse cx="97" cy="136" rx="12.5" ry="7.5" fill="#E68A12" />

      {/* Plump Body */}
      <ellipse cx="80" cy="112" rx="37" ry="29" fill={`url(#solFace-${uid})`} />
      <ellipse cx="80" cy="115" rx="25" ry="20" fill={`url(#solBelly-${uid})`} />

      {/* Warm Heart on Chest */}
      <path
        d="M80 122 C71 116 68 109 72 104 C75.5 100.5 80 104 80 107 C80 104 84.5 100.5 88 104 C92 109 89 116 80 122 Z"
        fill="#F16E9A"
      />

      {/* Scalloped 3D Fluffy Mane */}
      <g fill={`url(#solMane-${uid})`}>
        <circle cx="80" cy="30" r="19" />
        <circle cx="52" cy="40" r="18" />
        <circle cx="108" cy="40" r="18" />
        <circle cx="38" cy="66" r="18" />
        <circle cx="122" cy="66" r="18" />
        <circle cx="50" cy="91" r="17" />
        <circle cx="110" cy="91" r="17" />
        <circle cx="80" cy="96" r="17" />
      </g>

      {/* Round Cub Ears */}
      <circle cx="49" cy="36" r="11" fill={`url(#solFace-${uid})`} />
      <circle cx="49" cy="37" r="6" fill="#F16E9A" opacity="0.7" />
      <circle cx="111" cy="36" r="11" fill={`url(#solFace-${uid})`} />
      <circle cx="111" cy="37" r="6" fill="#F16E9A" opacity="0.7" />

      {/* 3D Cub Face */}
      <circle cx="80" cy="65" r="35" fill={`url(#solFace-${uid})`} />
      <ellipse cx="66" cy="43" rx="18" ry="7.5" transform="rotate(-12 66 43)" fill="#FFFFFF" opacity="0.34" />
      <ellipse cx="80" cy="76" rx="19" ry="13" fill={`url(#solBelly-${uid})`} />

      {/* Eyes, Cheeks, Nose, Smile */}
      <PlushEyes lx={64} rx={96} y={61} r={7.2} happyArc={pose === 'celebrating'} />
      <ellipse cx="52" cy="71" rx="6" ry="3.5" fill="#F16E9A" opacity="0.58" />
      <ellipse cx="108" cy="71" rx="6" ry="3.5" fill="#F16E9A" opacity="0.58" />
      <ellipse cx="80" cy="71" rx="5.2" ry="3.5" fill="#D66213" />
      <path d="M72 78 Q80 85 88 78" stroke="#25233A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  );
};

/**
 * 5. PIPOCA — Guardião da Criatividade e Movimento (Coelhinho Esportivo 3D)
 */
const Pipoca3DSvg: React.FC<CompanionSvgProps> = ({ size, pose, className }) => {
  const uid = React.useId().replace(/:/g, '');
  const raised = pose === 'waving' || pose === 'celebrating';

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`pipShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F16E9A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#F16E9A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`pipBody-${uid}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFB0CC" />
          <stop offset="56%" stopColor="#F16E9A" />
          <stop offset="100%" stopColor="#C7386A" />
        </radialGradient>
        <radialGradient id={`pipBelly-${uid}`} cx="45%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFE6EF" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="145" rx="42" ry="8.5" fill={`url(#pipShadow-${uid})`} />

      {/* Tall 3D Bunny Ears */}
      <ellipse cx="59" cy="29" rx="12" ry="26" transform="rotate(-14 59 29)" fill={`url(#pipBody-${uid})`} />
      <ellipse cx="60" cy="30" rx="6.5" ry="18" transform="rotate(-14 60 30)" fill="#FFE6EF" />
      <ellipse cx="101" cy="29" rx="12" ry="26" transform="rotate(14 101 29)" fill={`url(#pipBody-${uid})`} />
      <ellipse cx="100" cy="30" rx="6.5" ry="18" transform="rotate(14 100 30)" fill="#FFE6EF" />

      {/* Arms */}
      <ellipse
        cx={raised ? '30' : '38'}
        cy={raised ? '86' : '106'}
        rx="12"
        ry="20"
        transform={raised ? 'rotate(-36 30 86)' : 'rotate(20 38 106)'}
        fill={`url(#pipBody-${uid})`}
      />
      <ellipse
        cx={raised ? '130' : '122'}
        cy={raised ? '86' : '106'}
        rx="12"
        ry="20"
        transform={raised ? 'rotate(36 130 86)' : 'rotate(-20 122 106)'}
        fill={`url(#pipBody-${uid})`}
      />

      {/* Feet */}
      <ellipse cx="63" cy="137" rx="13" ry="7.5" fill="#C7386A" />
      <ellipse cx="97" cy="137" rx="13" ry="7.5" fill="#C7386A" />

      {/* Body + Head */}
      <ellipse cx="80" cy="113" rx="36" ry="28" fill={`url(#pipBody-${uid})`} />
      <ellipse cx="80" cy="72" rx="42" ry="34" fill={`url(#pipBody-${uid})`} />
      <ellipse cx="65" cy="48" rx="20" ry="8" transform="rotate(-12 65 48)" fill="#FFFFFF" opacity="0.28" />

      {/* Sporty Teal Headband */}
      <path d="M41 56 Q80 46 119 56 Q116 63 80 55 Q44 63 41 56 Z" fill="#36C995" />
      <circle cx="80" cy="52" r="5" fill="#FFD34E" />

      {/* Belly + Snout */}
      <ellipse cx="80" cy="115" rx="24" ry="20" fill={`url(#pipBelly-${uid})`} />
      <ellipse cx="80" cy="80" rx="21" ry="13" fill={`url(#pipBelly-${uid})`} />

      {/* Star Chest Badge */}
      <path d="M80 105 L82.8 111 L89.4 111.8 L84.6 116 L85.8 122.4 L80 119 L74.2 122.4 L75.4 116 L70.6 111.8 L77.2 111 Z" fill="#FFD34E" />

      <PlushEyes lx={64} rx={96} y={71} r={7.2} happyArc={pose === 'celebrating'} />
      <ellipse cx="52" cy="80" rx="5.5" ry="3.2" fill="#E11D48" opacity="0.34" />
      <ellipse cx="108" cy="80" rx="5.5" ry="3.2" fill="#E11D48" opacity="0.34" />
      <ellipse cx="80" cy="78" rx="4.5" ry="3.2" fill="#FF9B42" />
      <path d="M72 84 Q80 91 88 84" stroke="#25233A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  );
};

/**
 * 6. FLORA — Artista do Ateliê das Cores (Gatinha Tangerina 3D com Boina)
 */
const Flora3DSvg: React.FC<CompanionSvgProps> = ({ size, pose, className }) => {
  const uid = React.useId().replace(/:/g, '');
  const raised = pose === 'waving' || pose === 'celebrating';

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`floraShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF9B42" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FF9B42" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`floraBody-${uid}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFC894" />
          <stop offset="56%" stopColor="#FF9B42" />
          <stop offset="100%" stopColor="#D66213" />
        </radialGradient>
        <radialGradient id={`floraBelly-${uid}`} cx="45%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFEBD8" />
        </radialGradient>
        <linearGradient id={`floraBeret-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9A7BFF" />
          <stop offset="100%" stopColor="#7047E8" />
        </linearGradient>
      </defs>

      <ellipse cx="80" cy="144" rx="44" ry="9" fill={`url(#floraShadow-${uid})`} />

      {/* Swirly Tail */}
      <path d="M110 120 Q138 118 138 98 Q138 88 128 92 Q122 98 126 105" stroke="#EA7A26" strokeWidth="11" strokeLinecap="round" fill="none" />

      {/* Pointed Rounded Cat Ears */}
      <path d="M40 55 L46 25 Q54 22 65 42 Z" fill={`url(#floraBody-${uid})`} />
      <path d="M45 48 L48 31 L59 42 Z" fill="#FFB0CC" />
      <path d="M120 55 L114 25 Q106 22 95 42 Z" fill={`url(#floraBody-${uid})`} />
      <path d="M115 48 L112 31 L101 42 Z" fill="#FFB0CC" />

      {/* Arms */}
      <ellipse
        cx={raised ? '30' : '38'}
        cy={raised ? '86' : '106'}
        rx="12"
        ry="20"
        transform={raised ? 'rotate(-36 30 86)' : 'rotate(20 38 106)'}
        fill={`url(#floraBody-${uid})`}
      />
      <ellipse
        cx={raised ? '130' : '122'}
        cy={raised ? '86' : '106'}
        rx="12"
        ry="20"
        transform={raised ? 'rotate(36 130 86)' : 'rotate(-20 122 106)'}
        fill={`url(#floraBody-${uid})`}
      />

      {/* Feet */}
      <ellipse cx="62" cy="136" rx="12" ry="7.5" fill="#D66213" />
      <ellipse cx="98" cy="136" rx="12" ry="7.5" fill="#D66213" />

      {/* Body & Head */}
      <ellipse cx="80" cy="112" rx="38" ry="30" fill={`url(#floraBody-${uid})`} />
      <ellipse cx="80" cy="70" rx="43" ry="35" fill={`url(#floraBody-${uid})`} />
      <ellipse cx="64" cy="46" rx="20" ry="8" transform="rotate(-12 64 46)" fill="#FFFFFF" opacity="0.28" />

      {/* Artist Beret */}
      <ellipse cx="88" cy="34" rx="22" ry="10" transform="rotate(14 88 34)" fill={`url(#floraBeret-${uid})`} />
      <circle cx="94" cy="24" r="4" fill="#FFD34E" />

      {/* Belly + Snout + Paint Dots */}
      <ellipse cx="80" cy="114" rx="25" ry="21" fill={`url(#floraBelly-${uid})`} />
      <ellipse cx="80" cy="79" rx="22" ry="14" fill={`url(#floraBelly-${uid})`} />
      <circle cx="72" cy="113" r="4.2" fill="#F16E9A" />
      <circle cx="81" cy="109" r="4.2" fill="#FFD34E" />
      <circle cx="89" cy="114" r="4.2" fill="#36C995" />

      <PlushEyes lx={63} rx={97} y={68} r={7.2} happyArc={pose === 'celebrating'} />
      <ellipse cx="51" cy="77" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.54" />
      <ellipse cx="109" cy="77" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.54" />
      <ellipse cx="80" cy="76" rx="4.5" ry="3" fill="#F16E9A" />
      <path d="M72 82 Q80 89 88 82" stroke="#25233A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  );
};

/**
 * 7. KIKO — Corujinha do Mundo Curioso (Corujinha Esmeralda-Turquesa 3D)
 */
const KikoOwl3DSvg: React.FC<CompanionSvgProps> = ({ size, pose, className }) => {
  const uid = React.useId().replace(/:/g, '');
  const wingUp = pose === 'waving' || pose === 'celebrating';

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`kikoOwlShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1DA886" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#1DA886" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`kikoOwlBody-${uid}`} cx="36%" cy="28%" r="74%">
          <stop offset="0%" stopColor="#7CF2D2" />
          <stop offset="56%" stopColor="#1DA886" />
          <stop offset="100%" stopColor="#0D6E59" />
        </radialGradient>
        <radialGradient id={`kikoOwlCream-${uid}`} cx="45%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D9FBF1" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="144" rx="45" ry="9" fill={`url(#kikoOwlShadow-${uid})`} />

      {/* Plump Owl Ear Tufts */}
      <path d="M40 48 L36 22 Q54 24 62 40 Z" fill="#128A6F" />
      <path d="M120 48 L124 22 Q106 24 98 40 Z" fill="#128A6F" />

      {/* Wings */}
      <ellipse
        cx={wingUp ? '28' : '35'}
        cy={wingUp ? '82' : '102'}
        rx="14"
        ry="24"
        transform={wingUp ? 'rotate(-36 28 82)' : 'rotate(16 35 102)'}
        fill="#128A6F"
      />
      <ellipse
        cx={wingUp ? '132' : '125'}
        cy={wingUp ? '82' : '102'}
        rx="14"
        ry="24"
        transform={wingUp ? 'rotate(36 132 82)' : 'rotate(-16 125 102)'}
        fill="#128A6F"
      />

      {/* Feet */}
      <ellipse cx="64" cy="136" rx="11" ry="6.5" fill="#FF9B42" />
      <ellipse cx="96" cy="136" rx="11" ry="6.5" fill="#FF9B42" />

      {/* Round Plush Owl Body */}
      <ellipse cx="80" cy="92" rx="46" ry="48" fill={`url(#kikoOwlBody-${uid})`} />
      <ellipse cx="64" cy="54" rx="22" ry="9" transform="rotate(-12 64 54)" fill="#FFFFFF" opacity="0.28" />

      {/* Owl Eye Mask & Belly */}
      <circle cx="62" cy="68" r="19" fill={`url(#kikoOwlCream-${uid})`} />
      <circle cx="98" cy="68" r="19" fill={`url(#kikoOwlCream-${uid})`} />
      <ellipse cx="80" cy="112" rx="28" ry="23" fill={`url(#kikoOwlCream-${uid})`} />

      {/* Cute Planet Emblem */}
      <circle cx="80" cy="112" r="8" fill="#4389F5" />
      <ellipse cx="80" cy="112" rx="14" ry="3.8" transform="rotate(-18 80 112)" stroke="#FFD34E" strokeWidth="2.4" fill="none" />

      {/* Eyes + Beak */}
      <PlushEyes lx={62} rx={98} y={68} r={7.6} happyArc={pose === 'celebrating'} />
      <ellipse cx="48" cy="79" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.52" />
      <ellipse cx="112" cy="79" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.52" />
      <path d="M74 73 Q80 70 86 73 L82 83 Q80 86 78 83 Z" fill="#FF9B42" />
    </svg>
  );
};

/**
 * 8. BETO — Castor da Matemática (Castorzinho Caramelo-Ouro 3D)
 */
const Beto3DSvg: React.FC<CompanionSvgProps> = ({ size, pose, className }) => {
  const uid = React.useId().replace(/:/g, '');
  const raised = pose === 'waving' || pose === 'celebrating';

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`betoShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E68A00" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#E68A00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`betoBody-${uid}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFCA80" />
          <stop offset="56%" stopColor="#E68A00" />
          <stop offset="100%" stopColor="#9E5608" />
        </radialGradient>
        <radialGradient id={`betoBelly-${uid}`} cx="45%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFE9C7" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="144" rx="45" ry="9" fill={`url(#betoShadow-${uid})`} />

      {/* Paddle Beaver Tail */}
      <ellipse cx="126" cy="116" rx="20" ry="12" transform="rotate(-18 126 116)" fill="#8A4705" />

      {/* Round Ears */}
      <circle cx="44" cy="40" r="13" fill="#B56409" />
      <circle cx="45" cy="41" r="7" fill="#FFE2BC" />
      <circle cx="116" cy="40" r="13" fill="#B56409" />
      <circle cx="115" cy="41" r="7" fill="#FFE2BC" />

      {/* Arms */}
      <ellipse
        cx={raised ? '28' : '37'}
        cy={raised ? '86' : '106'}
        rx="12.5"
        ry="20"
        transform={raised ? 'rotate(-36 28 86)' : 'rotate(20 37 106)'}
        fill={`url(#betoBody-${uid})`}
      />
      <ellipse
        cx={raised ? '132' : '123'}
        cy={raised ? '86' : '106'}
        rx="12.5"
        ry="20"
        transform={raised ? 'rotate(36 132 86)' : 'rotate(-20 123 106)'}
        fill={`url(#betoBody-${uid})`}
      />

      {/* Feet */}
      <ellipse cx="62" cy="136" rx="13" ry="7.5" fill="#9E5608" />
      <ellipse cx="98" cy="136" rx="13" ry="7.5" fill="#9E5608" />

      {/* Body + Head */}
      <ellipse cx="80" cy="110" rx="39" ry="31" fill={`url(#betoBody-${uid})`} />
      <ellipse cx="80" cy="68" rx="44" ry="36" fill={`url(#betoBody-${uid})`} />
      <ellipse cx="64" cy="42" rx="22" ry="9" transform="rotate(-12 64 42)" fill="#FFFFFF" opacity="0.28" />

      {/* Belly + Snout */}
      <ellipse cx="80" cy="113" rx="26" ry="22" fill={`url(#betoBelly-${uid})`} />
      <ellipse cx="80" cy="77" rx="22" ry="14" fill={`url(#betoBelly-${uid})`} />

      {/* Math Plus Cube Emblem on Belly */}
      <rect x="70" y="104" width="20" height="20" rx="6" fill="#4389F5" />
      <path d="M80 109 V119 M75 114 H85" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />

      {/* Cute Beaver Teeth + Eyes */}
      <rect x="74" y="81" width="5.5" height="6.5" rx="2" fill="#FFFFFF" />
      <rect x="80.5" y="81" width="5.5" height="6.5" rx="2" fill="#FFFFFF" />
      <PlushEyes lx={63} rx={97} y={64} r={7.2} happyArc={pose === 'celebrating'} />
      <ellipse cx="50" cy="74" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.54" />
      <ellipse cx="110" cy="74" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.54" />
      <ellipse cx="80" cy="72" rx="5.2" ry="3.6" fill="#5E3004" />
      <path d="M72 78 Q80 84 88 78" stroke="#25233A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
};

/**
 * 9. TOM — Canarinho Maestro (Canarinho Orquídea/Ouro 3D com Fone)
 */
const Tom3DSvg: React.FC<CompanionSvgProps> = ({ size, pose, className }) => {
  const uid = React.useId().replace(/:/g, '');
  const wingUp = pose === 'waving' || pose === 'celebrating';

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`tomShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D946B5" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#D946B5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`tomBody-${uid}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFA3E6" />
          <stop offset="56%" stopColor="#D946B5" />
          <stop offset="100%" stopColor="#941C79" />
        </radialGradient>
        <radialGradient id={`tomBelly-${uid}`} cx="45%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FCE1F6" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="144" rx="43" ry="9" fill={`url(#tomShadow-${uid})`} />

      {/* Wings */}
      <ellipse
        cx={wingUp ? '28' : '35'}
        cy={wingUp ? '82' : '103'}
        rx="14"
        ry="22"
        transform={wingUp ? 'rotate(-36 28 82)' : 'rotate(16 35 103)'}
        fill="#B62D96"
      />
      <ellipse
        cx={wingUp ? '132' : '125'}
        cy={wingUp ? '82' : '103'}
        rx="14"
        ry="22"
        transform={wingUp ? 'rotate(36 132 82)' : 'rotate(-16 125 103)'}
        fill="#B62D96"
      />

      {/* Feet */}
      <ellipse cx="64" cy="136" rx="11" ry="6.5" fill="#FF9B42" />
      <ellipse cx="96" cy="136" rx="11" ry="6.5" fill="#FF9B42" />

      {/* Plump Body + Head */}
      <ellipse cx="80" cy="110" rx="38" ry="30" fill={`url(#tomBody-${uid})`} />
      <ellipse cx="80" cy="68" rx="42" ry="36" fill={`url(#tomBody-${uid})`} />
      <ellipse cx="64" cy="43" rx="20" ry="8.5" transform="rotate(-12 64 43)" fill="#FFFFFF" opacity="0.3" />

      {/* Cream Belly & Cheeks */}
      <ellipse cx="80" cy="113" rx="25" ry="21" fill={`url(#tomBelly-${uid})`} />
      <ellipse cx="80" cy="70" rx="32" ry="23" fill={`url(#tomBelly-${uid})`} />

      {/* 3D Turquoise DJ/Maestro Headphones */}
      <path d="M36 66 C36 24 124 24 124 66" stroke="#36C995" strokeWidth="7" strokeLinecap="round" fill="none" />
      <rect x="29" y="54" width="13" height="26" rx="6.5" fill="#4389F5" />
      <rect x="118" y="54" width="13" height="26" rx="6.5" fill="#4389F5" />

      {/* Golden Music Note on Belly */}
      <circle cx="76" cy="118" r="5" fill="#FFD34E" />
      <path d="M80 118 V104 L90 102 V114" stroke="#7047E8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="87" cy="115" r="4.5" fill="#FFD34E" />

      {/* Eyes + Beak */}
      <PlushEyes lx={64} rx={96} y={66} r={7.2} happyArc={pose === 'celebrating'} />
      <ellipse cx="52" cy="75" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.58" />
      <ellipse cx="108" cy="75" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.58" />
      <path d="M74 71 Q80 68 86 71 L82 81 Q80 84 78 81 Z" fill="#FFD34E" />
    </svg>
  );
};

/**
 * 10. BELLA — Borboleta dos Idiomas (Borboleta Azul-Violeta 3D)
 */
const Bella3DSvg: React.FC<CompanionSvgProps> = ({ size, pose, className }) => {
  const uid = React.useId().replace(/:/g, '');
  const wingSpread = pose === 'waving' || pose === 'celebrating' ? 1.06 : 1;

  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={`bellaShadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4389F5" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#4389F5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`bellaWingTop-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9A7BFF" />
          <stop offset="55%" stopColor="#4389F5" />
          <stop offset="100%" stopColor="#2858C8" />
        </linearGradient>
        <linearGradient id={`bellaWingBot-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF9B42" />
          <stop offset="100%" stopColor="#F16E9A" />
        </linearGradient>
        <radialGradient id={`bellaBody-${uid}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#B8D9FF" />
          <stop offset="58%" stopColor="#4389F5" />
          <stop offset="100%" stopColor="#2252BE" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="144" rx="44" ry="9" fill={`url(#bellaShadow-${uid})`} />

      {/* Plump 3D Butterfly Wings */}
      <g transform={`translate(80 90) scale(${wingSpread}) translate(-80 -90)`}>
        <ellipse cx="44" cy="70" rx="28" ry="22" transform="rotate(-20 44 70)" fill={`url(#bellaWingTop-${uid})`} />
        <ellipse cx="116" cy="70" rx="28" ry="22" transform="rotate(20 116 70)" fill={`url(#bellaWingTop-${uid})`} />
        <ellipse cx="48" cy="108" rx="21" ry="16" transform="rotate(15 48 108)" fill={`url(#bellaWingBot-${uid})`} />
        <ellipse cx="112" cy="108" rx="21" ry="16" transform="rotate(-15 112 108)" fill={`url(#bellaWingBot-${uid})`} />
        <circle cx="38" cy="66" r="7" fill="#FFD34E" opacity="0.92" />
        <circle cx="122" cy="66" r="7" fill="#FFD34E" opacity="0.92" />
      </g>

      {/* Cute Antennae with Glowing Jewels */}
      <path d="M68 38 Q56 18 46 22" stroke="#7047E8" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="46" cy="22" r="6" fill="#FFD34E" />
      <path d="M92 38 Q104 18 114 22" stroke="#7047E8" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="114" cy="22" r="6" fill="#36C995" />

      {/* Plump Chibi Body + Head */}
      <ellipse cx="80" cy="112" rx="26" ry="26" fill={`url(#bellaBody-${uid})`} />
      <ellipse cx="80" cy="68" rx="37" ry="33" fill={`url(#bellaBody-${uid})`} />
      <ellipse cx="66" cy="45" rx="18" ry="7.5" transform="rotate(-12 66 45)" fill="#FFFFFF" opacity="0.32" />

      {/* Face Cream Disc + Globe Badge */}
      <ellipse cx="80" cy="70" rx="29" ry="23" fill="#F0F8FF" />
      <circle cx="80" cy="114" r="9" fill="#36C995" />
      <path d="M74 111 Q80 118 86 111" stroke="#FFFFFF" strokeWidth="2.2" fill="none" />

      <PlushEyes lx={65} rx={95} y={67} r={7} happyArc={pose === 'celebrating'} />
      <ellipse cx="55" cy="76" rx="5.2" ry="3.1" fill="#F16E9A" opacity="0.55" />
      <ellipse cx="105" cy="76" rx="5.2" ry="3.1" fill="#F16E9A" opacity="0.55" />
      <path d="M73 79 Q80 86 87 79" stroke="#25233A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  );
};

/* ==================== 6 CHILD AVATARS (3D VOLUMETRIC PORTRAITS) ==================== */

const BiaAvatar3D: React.FC<AvatarSvgProps> = ({ size, className }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`biaBg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7CC8FF" />
          <stop offset="100%" stopColor="#4389F5" />
        </linearGradient>
        <radialGradient id={`biaSkin-${uid}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFE1C8" />
          <stop offset="68%" stopColor="#F5B890" />
          <stop offset="100%" stopColor="#DC956A" />
        </radialGradient>
        <radialGradient id={`biaHair-${uid}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#925A3C" />
          <stop offset="100%" stopColor="#4A2716" />
        </radialGradient>
      </defs>
      <circle cx="70" cy="70" r="66" fill={`url(#biaBg-${uid})`} />
      <circle cx="70" cy="70" r="63" stroke="#FFFFFF" strokeWidth="3.5" strokeOpacity="0.65" />
      {/* Sculpted Hair Pigtails */}
      <circle cx="28" cy="64" r="17" fill={`url(#biaHair-${uid})`} />
      <circle cx="112" cy="64" r="17" fill={`url(#biaHair-${uid})`} />
      <circle cx="38" cy="54" r="6" fill="#FFD34E" />
      <circle cx="102" cy="54" r="6" fill="#FFD34E" />
      {/* Hoodie Shoulders */}
      <path d="M24 134 C28 102 112 102 116 134 Z" fill="#7047E8" />
      <ellipse cx="70" cy="108" rx="18" ry="8" fill="#FFFFFF" opacity="0.25" />
      {/* Ears + Face Sphere */}
      <circle cx="34" cy="72" r="8" fill={`url(#biaSkin-${uid})`} />
      <circle cx="106" cy="72" r="8" fill={`url(#biaSkin-${uid})`} />
      <circle cx="70" cy="68" r="35" fill={`url(#biaSkin-${uid})`} />
      {/* Sculpted Bangs */}
      <path d="M35 64 C35 32 105 32 105 64 C92 48 48 48 35 64 Z" fill={`url(#biaHair-${uid})`} />
      <ellipse cx="58" cy="42" rx="16" ry="5" transform="rotate(-14 58 42)" fill="#FFFFFF" opacity="0.22" />
      {/* Eyes + Smile */}
      <PlushEyes lx={56} rx={84} y={71} r={5.4} />
      <ellipse cx="45" cy="80" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.58" />
      <ellipse cx="95" cy="80" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.58" />
      <path d="M61 84 Q70 93 79 84" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    </svg>
  );
};

const LeoAvatar3D: React.FC<AvatarSvgProps> = ({ size, className }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`leoBg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7CF2C6" />
          <stop offset="100%" stopColor="#36C995" />
        </linearGradient>
        <radialGradient id={`leoSkin-${uid}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#F4C19B" />
          <stop offset="70%" stopColor="#D6946A" />
          <stop offset="100%" stopColor="#AE6D47" />
        </radialGradient>
        <radialGradient id={`leoHair-${uid}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#523E66" />
          <stop offset="100%" stopColor="#25233A" />
        </radialGradient>
      </defs>
      <circle cx="70" cy="70" r="66" fill={`url(#leoBg-${uid})`} />
      <circle cx="70" cy="70" r="63" stroke="#FFFFFF" strokeWidth="3.5" strokeOpacity="0.65" />
      <path d="M24 134 C28 102 112 102 116 134 Z" fill="#FF9B42" />
      <circle cx="34" cy="72" r="8" fill={`url(#leoSkin-${uid})`} />
      <circle cx="106" cy="72" r="8" fill={`url(#leoSkin-${uid})`} />
      <circle cx="70" cy="68" r="35" fill={`url(#leoSkin-${uid})`} />
      {/* Fluffy Curly Hair Tufts */}
      <g fill={`url(#leoHair-${uid})`}>
        <circle cx="48" cy="40" r="14" />
        <circle cx="70" cy="34" r="16" />
        <circle cx="92" cy="40" r="14" />
        <circle cx="38" cy="54" r="11" />
        <circle cx="102" cy="54" r="11" />
      </g>
      {/* Cute Explorer Glasses */}
      <circle cx="56" cy="70" r="11" stroke="#FFD34E" strokeWidth="3" fill="#FFFFFF" fillOpacity="0.2" />
      <circle cx="84" cy="70" r="11" stroke="#FFD34E" strokeWidth="3" fill="#FFFFFF" fillOpacity="0.2" />
      <path d="M67 70 H73" stroke="#FFD34E" strokeWidth="3" />
      <PlushEyes lx={56} rx={84} y={70} r={5} />
      <ellipse cx="45" cy="81" rx="5.2" ry="3" fill="#F16E9A" opacity="0.5" />
      <ellipse cx="95" cy="81" rx="5.2" ry="3" fill="#F16E9A" opacity="0.5" />
      <path d="M61 85 Q70 93 79 85" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    </svg>
  );
};

const NinaAvatar3D: React.FC<AvatarSvgProps> = ({ size, className }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`ninaBg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF9EC2" />
          <stop offset="100%" stopColor="#F16E9A" />
        </linearGradient>
        <radialGradient id={`ninaSkin-${uid}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFE8D6" />
          <stop offset="68%" stopColor="#F6C3A4" />
          <stop offset="100%" stopColor="#DF9F7A" />
        </radialGradient>
        <radialGradient id={`ninaHair-${uid}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#FF9B42" />
          <stop offset="100%" stopColor="#C95412" />
        </radialGradient>
      </defs>
      <circle cx="70" cy="70" r="66" fill={`url(#ninaBg-${uid})`} />
      <circle cx="70" cy="70" r="63" stroke="#FFFFFF" strokeWidth="3.5" strokeOpacity="0.65" />
      <circle cx="32" cy="40" r="14" fill={`url(#ninaHair-${uid})`} />
      <circle cx="108" cy="40" r="14" fill={`url(#ninaHair-${uid})`} />
      <path d="M24 134 C28 102 112 102 116 134 Z" fill="#36C995" />
      <circle cx="34" cy="72" r="8" fill={`url(#ninaSkin-${uid})`} />
      <circle cx="106" cy="72" r="8" fill={`url(#ninaSkin-${uid})`} />
      <circle cx="70" cy="68" r="35" fill={`url(#ninaSkin-${uid})`} />
      <path d="M35 63 C35 30 105 30 105 63 C92 50 48 50 35 63 Z" fill={`url(#ninaHair-${uid})`} />
      {/* Flower Hairpin */}
      <circle cx="96" cy="48" r="7" fill="#FFD34E" />
      <circle cx="96" cy="48" r="3" fill="#7047E8" />
      <PlushEyes lx={56} rx={84} y={71} r={5.4} />
      <ellipse cx="45" cy="80" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.58" />
      <ellipse cx="95" cy="80" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.58" />
      <path d="M61 84 Q70 93 79 84" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    </svg>
  );
};

const DaviAvatar3D: React.FC<AvatarSvgProps> = ({ size, className }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`daviBg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A88BFF" />
          <stop offset="100%" stopColor="#7047E8" />
        </linearGradient>
        <radialGradient id={`daviSkin-${uid}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFE2CA" />
          <stop offset="68%" stopColor="#F0B58E" />
          <stop offset="100%" stopColor="#D38C62" />
        </radialGradient>
        <linearGradient id={`daviCap-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4389F5" />
          <stop offset="100%" stopColor="#265BC9" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r="66" fill={`url(#daviBg-${uid})`} />
      <circle cx="70" cy="70" r="63" stroke="#FFFFFF" strokeWidth="3.5" strokeOpacity="0.65" />
      <path d="M24 134 C28 102 112 102 116 134 Z" fill="#4389F5" />
      <circle cx="34" cy="72" r="8" fill={`url(#daviSkin-${uid})`} />
      <circle cx="106" cy="72" r="8" fill={`url(#daviSkin-${uid})`} />
      <circle cx="70" cy="70" r="34" fill={`url(#daviSkin-${uid})`} />
      {/* Cool 3D Cap */}
      <path d="M35 60 C35 28 105 28 105 60 Z" fill={`url(#daviCap-${uid})`} />
      <ellipse cx="76" cy="58" rx="34" ry="8" fill="#FFD34E" />
      <circle cx="70" cy="43" r="6.5" fill="#FFD34E" />
      <PlushEyes lx={56} rx={84} y={73} r={5.4} />
      <ellipse cx="45" cy="82" rx="5.2" ry="3.1" fill="#F16E9A" opacity="0.54" />
      <ellipse cx="95" cy="82" rx="5.2" ry="3.1" fill="#F16E9A" opacity="0.54" />
      <path d="M61 86 Q70 95 79 86" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    </svg>
  );
};

const LaraAvatar3D: React.FC<AvatarSvgProps> = ({ size, className }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`laraBg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE885" />
          <stop offset="100%" stopColor="#FF9B42" />
        </linearGradient>
        <radialGradient id={`laraSkin-${uid}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#CE946D" />
          <stop offset="68%" stopColor="#A96E4A" />
          <stop offset="100%" stopColor="#804B2D" />
        </radialGradient>
        <radialGradient id={`laraHair-${uid}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#463559" />
          <stop offset="100%" stopColor="#1F1933" />
        </radialGradient>
      </defs>
      <circle cx="70" cy="70" r="66" fill={`url(#laraBg-${uid})`} />
      <circle cx="70" cy="70" r="63" stroke="#FFFFFF" strokeWidth="3.5" strokeOpacity="0.65" />
      <circle cx="34" cy="40" r="15" fill={`url(#laraHair-${uid})`} />
      <circle cx="106" cy="40" r="15" fill={`url(#laraHair-${uid})`} />
      <path d="M24 134 C28 102 112 102 116 134 Z" fill="#F16E9A" />
      <circle cx="34" cy="72" r="8" fill={`url(#laraSkin-${uid})`} />
      <circle cx="106" cy="72" r="8" fill={`url(#laraSkin-${uid})`} />
      <circle cx="70" cy="68" r="35" fill={`url(#laraSkin-${uid})`} />
      <path d="M35 62 C35 30 105 30 105 62 C92 48 48 48 35 62 Z" fill={`url(#laraHair-${uid})`} />
      {/* Heart Headband */}
      <circle cx="37" cy="49" r="5.5" fill="#F16E9A" />
      <circle cx="103" cy="49" r="5.5" fill="#F16E9A" />
      <PlushEyes lx={56} rx={84} y={71} r={5.4} />
      <ellipse cx="45" cy="80" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.58" />
      <ellipse cx="95" cy="80" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.58" />
      <path d="M61 84 Q70 93 79 84" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    </svg>
  );
};

const TicoAvatar3D: React.FC<AvatarSvgProps> = ({ size, className }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none" className={`ak-toy-3d ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`ticoBg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6EC1FF" />
          <stop offset="100%" stopColor="#7047E8" />
        </linearGradient>
        <radialGradient id={`ticoSkin-${uid}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFE5CF" />
          <stop offset="68%" stopColor="#F5BD95" />
          <stop offset="100%" stopColor="#D7926A" />
        </radialGradient>
        <radialGradient id={`ticoHair-${uid}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#FFD34E" />
          <stop offset="100%" stopColor="#D98216" />
        </radialGradient>
      </defs>
      <circle cx="70" cy="70" r="66" fill={`url(#ticoBg-${uid})`} />
      <circle cx="70" cy="70" r="63" stroke="#FFFFFF" strokeWidth="3.5" strokeOpacity="0.65" />
      <path d="M24 134 C28 102 112 102 116 134 Z" fill="#36C995" />
      <circle cx="34" cy="72" r="8" fill={`url(#ticoSkin-${uid})`} />
      <circle cx="106" cy="72" r="8" fill={`url(#ticoSkin-${uid})`} />
      <circle cx="70" cy="69" r="35" fill={`url(#ticoSkin-${uid})`} />
      {/* Playful Golden Spiky Quiff */}
      <path d="M35 60 C35 30 78 24 98 34 L106 58 C88 46 52 46 35 60 Z" fill={`url(#ticoHair-${uid})`} />
      <ellipse cx="64" cy="37" rx="14" ry="4.5" transform="rotate(-12 64 37)" fill="#FFFFFF" opacity="0.34" />
      <PlushEyes lx={56} rx={84} y={71} r={5.4} />
      <ellipse cx="45" cy="80" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.54" />
      <ellipse cx="95" cy="80" rx="5.5" ry="3.2" fill="#F16E9A" opacity="0.54" />
      <path d="M61 84 Q70 93 79 84" stroke="#25233A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    </svg>
  );
};

/**
 * Família Oficial de Guardiões 3D — Estilo Volumétrico Ajuda KIDS (igual ao Kiko Guia)
 */
export const MUNDO_COMPANIONS: MundoCompanion[] = [
  {
    id: 'Lumi',
    name: 'Lumi',
    title: 'Guardiã da Comunicação',
    skillArea: 'communication',
    skillLabel: 'Comunicação e Fala',
    description: 'Adora contar histórias, descobrir o som das letras e cantar rimas divertidas.',
    bgColor: '#D8EEFE',
    accentColor: '#2D9CDB',
    renderCharacter: (size = 84, pose = 'happy', className = '') => (
      <Lumi3DSvg size={size} pose={pose} className={className} />
    )
  },
  {
    id: 'Teo',
    name: 'Téo',
    title: 'Guardião da Descoberta',
    skillArea: 'reasoning',
    skillLabel: 'Descoberta e Raciocínio',
    description: 'Curioso e inventor! Gosta de quebra-cabeças, números, formas e mistérios lógicos.',
    bgColor: '#ECE2FE',
    accentColor: '#8B5CF6',
    renderCharacter: (size = 84, pose = 'happy', className = '') => (
      <Teo3DSvg size={size} pose={pose} className={className} />
    )
  },
  {
    id: 'Maya',
    name: 'Maya',
    title: 'Guardiã da Atenção',
    skillArea: 'attention',
    skillLabel: 'Atenção e Foco',
    description: 'Observadora da natureza! Encontra cada detalhe com calma, foco e memória visual.',
    bgColor: '#DCF3D1',
    accentColor: '#46B138',
    renderCharacter: (size = 84, pose = 'happy', className = '') => (
      <Maya3DSvg size={size} pose={pose} className={className} />
    )
  },
  {
    id: 'Sol',
    name: 'Sol',
    title: 'Guardião das Emoções',
    skillArea: 'emotional',
    skillLabel: 'Inteligência Emocional',
    description: 'Acolhedor e sereno. Ajuda a reconhecer sentimentos, respirar fundo e cultivar a calma.',
    bgColor: '#FFF0B8',
    accentColor: '#E8A80C',
    renderCharacter: (size = 84, pose = 'happy', className = '') => (
      <Sol3DSvg size={size} pose={pose} className={className} />
    )
  },
  {
    id: 'Pipoca',
    name: 'Pipoca',
    title: 'Guardião da Criatividade e Movimento',
    skillArea: 'motor',
    skillLabel: 'Coordenação e Criatividade',
    description: 'Cheio de energia positiva! Adora pular, dançar, desenhar e brincar ao ar livre.',
    bgColor: '#FFDCE4',
    accentColor: '#E85376',
    renderCharacter: (size = 84, pose = 'happy', className = '') => (
      <Pipoca3DSvg size={size} pose={pose} className={className} />
    )
  },
  {
    id: 'Flora',
    name: 'Flora',
    title: 'Artista do Ateliê das Cores',
    skillArea: 'creativity',
    skillLabel: 'Criatividade e Arte',
    description: 'Adora misturar cores suaves, inventar desenhos e transformar formas em histórias!',
    bgColor: '#FFE5C8',
    accentColor: '#F07E26',
    renderCharacter: (size = 84, pose = 'happy', className = '') => (
      <Flora3DSvg size={size} pose={pose} className={className} />
    )
  },
  {
    id: 'Kiko',
    name: 'Kiko',
    title: 'Corujinha do Mundo Curioso',
    skillArea: 'knowledge',
    skillLabel: 'Conhecimentos Gerais',
    description: 'Super curioso sobre animais, plantas, planetas e descobertas incríveis da natureza!',
    bgColor: '#D2F5EA',
    accentColor: '#1DA886',
    renderCharacter: (size = 84, pose = 'happy', className = '') => (
      <KikoOwl3DSvg size={size} pose={pose} className={className} />
    )
  },
  {
    id: 'Beto',
    name: 'Beto',
    title: 'Castor da Matemática',
    skillArea: 'math',
    skillLabel: 'Matemática Lúdica',
    description: 'Adora contar blocos, somar estrelas e resolver desafios com medidas e formas!',
    bgColor: '#FFE7BD',
    accentColor: '#E68A00',
    renderCharacter: (size = 84, pose = 'happy', className = '') => (
      <Beto3DSvg size={size} pose={pose} className={className} />
    )
  },
  {
    id: 'Tom',
    name: 'Tom',
    title: 'Canarinho Maestro',
    skillArea: 'music',
    skillLabel: 'Música & Ritmo',
    description: 'Canta melodias alegres, marca o ritmo com palmas e apresenta instrumentos musicais!',
    bgColor: '#FAD1EF',
    accentColor: '#D946B5',
    renderCharacter: (size = 84, pose = 'happy', className = '') => (
      <Tom3DSvg size={size} pose={pose} className={className} />
    )
  },
  {
    id: 'Bella',
    name: 'Bella',
    title: 'Borboleta dos Idiomas',
    skillArea: 'languages',
    skillLabel: 'Inglês & Idiomas',
    description: 'Viaja por palavras em inglês, cumprimentos bilíngues e expressões do dia a dia!',
    bgColor: '#D5E9FF',
    accentColor: '#3B82F6',
    renderCharacter: (size = 84, pose = 'happy', className = '') => (
      <Bella3DSvg size={size} pose={pose} className={className} />
    )
  }
];

export const getCompanionBySkill = (area: SkillArea): MundoCompanion => {
  return MUNDO_COMPANIONS.find(c => c.skillArea === area) || MUNDO_COMPANIONS[0];
};

export const getCompanionById = (id?: string): MundoCompanion => {
  return MUNDO_COMPANIONS.find(c => c.id.toLowerCase() === (id || '').toLowerCase()) || MUNDO_COMPANIONS[0];
};

export const getKidCharacter = (avatarName?: string): KidCharacter => {
  if (!avatarName) return KID_CHARACTERS[0];
  const clean = avatarName.trim().toLowerCase();
  const found = KID_CHARACTERS.find(
    c =>
      c.id.toLowerCase() === clean ||
      c.name.toLowerCase() === clean ||
      clean.includes(c.name.toLowerCase())
  );
  return found || KID_CHARACTERS[0];
};

/**
 * 6 Avatares Infantis 3D Volumétricos — Medalhões Brilhantes Sem Contornos Pesados
 */
export const KID_CHARACTERS: KidCharacter[] = [
  {
    id: 'char_bia',
    name: 'Bia',
    gender: 'girl',
    personality: 'Comunicativa e contadora de histórias',
    companionId: 'Lumi',
    primaryColor: '#38A3F1',
    accentColor: '#D8EEFE',
    renderAvatar: (size = 64, className = '') => <BiaAvatar3D size={size} className={className} />
  },
  {
    id: 'char_leo',
    name: 'Leo',
    gender: 'boy',
    personality: 'Observador da natureza e calmo',
    companionId: 'Maya',
    primaryColor: '#46B138',
    accentColor: '#DCF3D1',
    renderAvatar: (size = 64, className = '') => <LeoAvatar3D size={size} className={className} />
  },
  {
    id: 'char_nina',
    name: 'Nina',
    gender: 'girl',
    personality: 'Criativa e exploradora de cores',
    companionId: 'Pipoca',
    primaryColor: '#E85376',
    accentColor: '#FFDCE4',
    renderAvatar: (size = 64, className = '') => <NinaAvatar3D size={size} className={className} />
  },
  {
    id: 'char_davi',
    name: 'Davi',
    gender: 'boy',
    personality: 'Inventor lógico e curioso',
    companionId: 'Teo',
    primaryColor: '#8B5CF6',
    accentColor: '#ECE2FE',
    renderAvatar: (size = 64, className = '') => <DaviAvatar3D size={size} className={className} />
  },
  {
    id: 'char_lara',
    name: 'Lara',
    gender: 'girl',
    personality: 'Doce, empática e serena',
    companionId: 'Sol',
    primaryColor: '#E8A80C',
    accentColor: '#FFF0B8',
    renderAvatar: (size = 64, className = '') => <LaraAvatar3D size={size} className={className} />
  },
  {
    id: 'char_tico',
    name: 'Tico',
    gender: 'boy',
    personality: 'Aventureiro e cheio de energia',
    companionId: 'Pipoca',
    primaryColor: '#2D9CDB',
    accentColor: '#D8EEFE',
    renderAvatar: (size = 64, className = '') => <TicoAvatar3D size={size} className={className} />
  }
];
