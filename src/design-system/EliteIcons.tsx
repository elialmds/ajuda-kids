import React from 'react';
import { ActivityContentType } from '@/types';
import { CardVisualState, Game3DId } from './tokens';

export type ShortcutIconKind = 'learn' | 'math' | 'atelier' | 'music' | 'games3d' | 'breathe';

/**
 * 1. EMBLEMAS 3D VOLUMÉTRICOS DOS 6 JOGOS (Estilo EdTech Pixar / Sem contornos pesados)
 */
const Game3DEmblemSvgInner: React.FC<{ gameId: Game3DId | string; className: string }> = ({
  gameId,
  className
}) => {
  const uid = React.useId().replace(/:/g, '');

  switch (gameId) {
    case 'batata-quente':
      return (
        <svg viewBox="0 0 64 64" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <radialGradient id={`bqPotato-${uid}`} cx="36%" cy="30%" r="68%">
              <stop offset="0%" stopColor="#FFE19C" />
              <stop offset="56%" stopColor="#FF9B42" />
              <stop offset="100%" stopColor="#C9560E" />
            </radialGradient>
            <radialGradient id={`bqFlame-${uid}`} cx="50%" cy="65%" r="60%">
              <stop offset="0%" stopColor="#FFF7B8" />
              <stop offset="55%" stopColor="#FFD34E" />
              <stop offset="100%" stopColor="#F16E9A" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="18" ry="4" fill="#FF9B42" opacity="0.24" />
          {/* Sparks */}
          <path d="M35 19 Q38 11 45 9" stroke="#C9560E" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d="M47 4 C53 9 52 17 45 17 C40 17 40 9 47 4 Z" fill={`url(#bqFlame-${uid})`} />
          <circle cx="54" cy="11" r="2.2" fill="#FFD34E" />
          {/* 3D Potato Sphere */}
          <ellipse cx="31" cy="36" rx="20" ry="17" fill={`url(#bqPotato-${uid})`} />
          <ellipse cx="23" cy="26" rx="9" ry="4" transform="rotate(-18 23 26)" fill="#FFFFFF" opacity="0.35" />
          {/* Glossy Eyes & Cheeks */}
          <circle cx="24.5" cy="35.5" r="3" fill="#25233A" />
          <circle cx="25.5" cy="34.4" r="1.1" fill="#FFFFFF" />
          <circle cx="37.5" cy="35.5" r="3" fill="#25233A" />
          <circle cx="38.5" cy="34.4" r="1.1" fill="#FFFFFF" />
          <ellipse cx="19" cy="40" rx="3.2" ry="1.8" fill="#F16E9A" opacity="0.65" />
          <ellipse cx="43" cy="40" rx="3.2" ry="1.8" fill="#F16E9A" opacity="0.65" />
          <path d="M26 42 Q31 46 36 42" stroke="#25233A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'pato-ganso':
      return (
        <svg viewBox="0 0 64 64" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <radialGradient id={`pgPond-${uid}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#99ECFF" />
              <stop offset="100%" stopColor="#4389F5" />
            </radialGradient>
            <radialGradient id={`pgDuck-${uid}`} cx="35%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#FFF7B8" />
              <stop offset="56%" stopColor="#FFD34E" />
              <stop offset="100%" stopColor="#E69B12" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="50" rx="25" ry="9" fill={`url(#pgPond-${uid})`} opacity="0.9" />
          <ellipse cx="32" cy="49" rx="18" ry="5" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" />
          {/* Chubby 3D Duck Body & Head */}
          <ellipse cx="33" cy="39" rx="16" ry="12" fill={`url(#pgDuck-${uid})`} />
          <circle cx="28" cy="23" r="12" fill={`url(#pgDuck-${uid})`} />
          <ellipse cx="24" cy="15" rx="6" ry="2.8" transform="rotate(-15 24 15)" fill="#FFFFFF" opacity="0.38" />
          {/* Wing */}
          <ellipse cx="38" cy="39" rx="8" ry="5.5" transform="rotate(-10 38 39)" fill="#FFF2A6" />
          {/* Glossy Eye + Mango Beak */}
          <circle cx="26" cy="21.5" r="2.8" fill="#25233A" />
          <circle cx="26.9" cy="20.6" r="1" fill="#FFFFFF" />
          <path d="M12 24 C15 20 20 21 20 24.5 C20 28 15 28 12 24 Z" fill="#FF9B42" />
          {/* Mini Companion Feather Spark */}
          <circle cx="48" cy="18" r="4" fill="#36C995" />
          <circle cx="47" cy="17" r="1.4" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );

    case 'morto-vivo':
      return (
        <svg viewBox="0 0 64 64" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`mvGreen-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7CF2C6" />
              <stop offset="100%" stopColor="#26A678" />
            </linearGradient>
            <linearGradient id={`mvRose-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFA3C2" />
              <stop offset="100%" stopColor="#E1497A" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="20" ry="4" fill="#36C995" opacity="0.22" />
          {/* Green "Vivo" Pad */}
          <rect x="6" y="10" width="24" height="30" rx="9" fill={`url(#mvGreen-${uid})`} />
          <circle cx="18" cy="20" r="4.5" fill="#FFFFFF" />
          <path d="M11 32 Q18 25 25 32" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
          {/* Rose "Morto" Pad */}
          <rect x="34" y="22" width="24" height="30" rx="9" fill={`url(#mvRose-${uid})`} />
          <circle cx="46" cy="36" r="4.5" fill="#FFFFFF" />
          <path d="M39 45 Q46 41 53 45" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
          {/* Top Golden Star */}
          <path d="M33 6 L35 10.5 L40 11 L36.3 14.5 L37.3 19.5 L33 17 L28.7 19.5 L29.7 14.5 L26 11 L31 10.5 Z" fill="#FFD34E" />
        </svg>
      );

    case 'jogo-memoria':
      return (
        <svg viewBox="0 0 64 64" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`jmCard1-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9D7CFF" />
              <stop offset="100%" stopColor="#653AD9" />
            </linearGradient>
            <linearGradient id={`jmCard2-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#70D4FF" />
              <stop offset="100%" stopColor="#2A74E0" />
            </linearGradient>
          </defs>
          <rect x="8" y="14" width="28" height="36" rx="9" transform="rotate(-10 22 32)" fill={`url(#jmCard1-${uid})`} />
          <rect x="27" y="13" width="28" height="36" rx="9" transform="rotate(8 41 31)" fill={`url(#jmCard2-${uid})`} />
          <rect x="30" y="16" width="22" height="12" rx="6" transform="rotate(8 41 22)" fill="#FFFFFF" opacity="0.22" />
          <path d="M41 21 L43.4 26.2 L49 27 L44.9 30.8 L45.9 36.4 L41 33.7 L36.1 36.4 L37.1 30.8 L33 27 L38.6 26.2 Z" fill="#FFD34E" />
          <circle cx="17" cy="24" r="3.5" fill="#FFD34E" opacity="0.9" />
        </svg>
      );

    case 'sequencia-cores':
      return (
        <svg viewBox="0 0 64 64" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <radialGradient id={`scBase-${uid}`} cx="38%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#3B356E" />
              <stop offset="100%" stopColor="#1D193C" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="26" fill={`url(#scBase-${uid})`} />
          {/* 4 Glossy Candy Domes */}
          <path d="M30 10 A20 20 0 0 0 10 30 H26 A5 5 0 0 1 30 26 Z" fill="#4389F5" />
          <path d="M34 10 A20 20 0 0 1 54 30 H38 A5 5 0 0 0 34 26 Z" fill="#FFD34E" />
          <path d="M10 34 A20 20 0 0 0 30 54 V38 A5 5 0 0 1 26 34 Z" fill="#F16E9A" />
          <path d="M54 34 A20 20 0 0 1 34 54 V38 A5 5 0 0 0 38 34 Z" fill="#36C995" />
          <circle cx="32" cy="32" r="7.5" fill="#FFFFFF" />
          <circle cx="32" cy="32" r="4.5" fill="#7047E8" />
        </svg>
      );

    case 'simon-says':
    default:
      return (
        <svg viewBox="0 0 64 64" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`ssCrown-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF5B8" />
              <stop offset="55%" stopColor="#FFD34E" />
              <stop offset="100%" stopColor="#E69514" />
            </linearGradient>
            <linearGradient id={`ssGem-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9A7BFF" />
              <stop offset="100%" stopColor="#7047E8" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="54" rx="20" ry="4.5" fill="#FFD34E" opacity="0.28" />
          <path d="M11 43 L8 21 L22 30 L32 14 L42 30 L56 21 L53 43 Z" fill={`url(#ssCrown-${uid})`} />
          <rect x="10" y="42" width="44" height="9" rx="4.5" fill="#7047E8" />
          <circle cx="32" cy="34" r="4.5" fill={`url(#ssGem-${uid})`} />
          <circle cx="8" cy="18" r="4" fill="#F16E9A" />
          <circle cx="32" cy="11" r="4.5" fill="#4389F5" />
          <circle cx="56" cy="18" r="4" fill="#36C995" />
        </svg>
      );
  }
};

export const Game3DEmblemIcon: React.FC<{ gameId: Game3DId | string; className?: string }> = ({
  gameId,
  className = 'w-12 h-12'
}) => <Game3DEmblemSvgInner gameId={gameId} className={className} />;

/**
 * 1B. ÍCONES 3D CIRCULARES DOS ATALHOS DA HOME (Estilo EdTech Reference Images 1 & 2)
 */
const WorldShortcut3DSvgInner: React.FC<{ kind: ShortcutIconKind; className: string }> = ({ kind, className }) => {
  const uid = React.useId().replace(/:/g, '');

  switch (kind) {
    case 'learn':
      return (
        <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`wsLearn-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7CC8FF" />
              <stop offset="100%" stopColor="#265BC9" />
            </linearGradient>
          </defs>
          <path d="M8 14 C14 11 20 12 24 16 C28 12 34 11 40 14 V35 C34 33 28 33 24 37 C20 33 14 33 8 35 Z" fill={`url(#wsLearn-${uid})`} />
          <path d="M11 16 C16 14 20 15 24 18 V34 C20 31 15 31 11 33 Z" fill="#FFFFFF" opacity="0.92" />
          <path d="M37 16 C32 14 28 15 24 18 V34 C28 31 33 31 37 33 Z" fill="#EBF5FF" />
          <path d="M24 8 L25.6 11.8 L29.8 12.2 L26.6 15 L27.6 19 L24 16.8 L20.4 19 L21.4 15 L18.2 12.2 L22.4 11.8 Z" fill="#FFD34E" />
        </svg>
      );

    case 'math':
      return (
        <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`wsMath-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFC15E" />
              <stop offset="100%" stopColor="#DF6714" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="32" height="32" rx="10" fill={`url(#wsMath-${uid})`} />
          <rect x="11" y="10" width="26" height="12" rx="7" fill="#FFFFFF" opacity="0.25" />
          <path d="M16 18 H22 M19 15 V21" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M26 18 H32" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
          <rect x="14" y="25" width="20" height="9" rx="4.5" fill="#7047E8" />
          <path d="M19 28.5 H29 M19 31.2 H29" stroke="#FFD34E" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'atelier':
      return (
        <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <radialGradient id={`wsArt-${uid}`} cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#FFF0F6" />
              <stop offset="100%" stopColor="#F9B8D0" />
            </radialGradient>
          </defs>
          <path d="M24 9 C14 9 7 16.5 7 25 C7 33 13 38 20 38 C23 38 24 35.5 24 33.5 C24 31 26.5 29.5 29 30.5 C34 32.5 41 28.5 41 22.5 C41 14.5 33.5 9 24 9 Z" fill={`url(#wsArt-${uid})`} />
          <circle cx="16" cy="21" r="3.4" fill="#F16E9A" />
          <circle cx="23" cy="16" r="3.4" fill="#FFD34E" />
          <circle cx="31" cy="18" r="3.4" fill="#36C995" />
          <circle cx="33" cy="26" r="3.2" fill="#4389F5" />
          <circle cx="16" cy="30" r="2.8" fill="#7047E8" />
        </svg>
      );

    case 'music':
      return (
        <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`wsMus-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A88BFF" />
              <stop offset="100%" stopColor="#7047E8" />
            </linearGradient>
          </defs>
          <circle cx="15.5" cy="34" r="6" fill={`url(#wsMus-${uid})`} />
          <circle cx="32.5" cy="30" r="6" fill="#F16E9A" />
          <path d="M19.5 33 V15 L36.5 11 V29" stroke={`url(#wsMus-${uid})`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="14" cy="32.5" r="2" fill="#FFFFFF" opacity="0.65" />
          <circle cx="31" cy="28.5" r="2" fill="#FFFFFF" opacity="0.65" />
        </svg>
      );

    case 'games3d':
      return (
        <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={`wsPad-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9A7BFF" />
              <stop offset="100%" stopColor="#522BBF" />
            </linearGradient>
          </defs>
          <path d="M13 17 H35 C39 17 42 20 43 26 L44 33 C44 36.5 41.5 39 38 39 C35.5 39 33.5 37 32 34 H16 C14.5 37 12.5 39 10 39 C6.5 39 4 36.5 4 33 L5 26 C6 20 9 17 13 17 Z" fill={`url(#wsPad-${uid})`} />
          <path d="M14 23 V29 M11 26 H17" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="32" cy="23.5" r="2.3" fill="#FFD34E" />
          <circle cx="35.5" cy="27" r="2.3" fill="#36C995" />
          <circle cx="28.5" cy="27" r="2.3" fill="#F16E9A" />
          <circle cx="32" cy="30.5" r="2.3" fill="#4389F5" />
        </svg>
      );

    case 'breathe':
    default:
      return (
        <svg viewBox="0 0 48 48" className={`ak-toy-3d ${className}`} fill="none" aria-hidden="true">
          <defs>
            <radialGradient id={`wsBr-${uid}`} cx="36%" cy="30%" r="68%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="60%" stopColor="#36C995" />
              <stop offset="100%" stopColor="#178760" />
            </radialGradient>
          </defs>
          <ellipse cx="24" cy="20" rx="13" ry="13.5" fill={`url(#wsBr-${uid})`} />
          <ellipse cx="19" cy="14" rx="5" ry="2.5" transform="rotate(-18 19 14)" fill="#FFFFFF" opacity="0.4" />
          <path d="M24 33.5 Q21 38 25 43" stroke="#178760" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="36" cy="14" r="3" fill="#FFD34E" />
          <circle cx="12" cy="30" r="2.4" fill="#4389F5" />
        </svg>
      );
  }
};

export const WorldShortcut3DIcon: React.FC<{ kind: ShortcutIconKind; className?: string }> = ({
  kind,
  className = 'w-7 h-7'
}) => <WorldShortcut3DSvgInner kind={kind} className={className} />;

/**
 * 2. ÍCONES 3D DA BARRA DE NAVEGAÇÃO INFANTIL
 */
const NavTabSvgInner: React.FC<{
  tab: 'home' | 'learn' | 'play' | 'progress' | 'profile';
  active: boolean;
  className: string;
}> = ({ tab, active, className }) => {
  const uid = React.useId().replace(/:/g, '');
  const opacity = active ? 1 : 0.9;

  switch (tab) {
    case 'home':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" style={{ opacity }} aria-hidden="true">
          <defs>
            <linearGradient id={`ntHomeRoof-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFA95C" />
              <stop offset="100%" stopColor="#E66A19" />
            </linearGradient>
            <linearGradient id={`ntHomeWall-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={active ? '#FFF7D6' : '#FFFFFF'} />
              <stop offset="100%" stopColor={active ? '#FFE08A' : '#E4DFF5'} />
            </linearGradient>
          </defs>
          <path d="M9 23 L24 10 L39 23 V39 C39 41.2 37.2 43 35 43 H13 C10.8 43 9 41.2 9 39 V23 Z" fill={`url(#ntHomeWall-${uid})`} />
          <path d="M4.5 23 L24 7 L43.5 23" stroke={`url(#ntHomeRoof-${uid})`} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="19" y="27" width="10" height="16" rx="5" fill="#7047E8" />
          <circle cx="24" cy="18" r="3" fill="#4389F5" />
        </svg>
      );

    case 'learn':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" style={{ opacity }} aria-hidden="true">
          <defs>
            <linearGradient id={`ntBook-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#70C4FF" />
              <stop offset="100%" stopColor="#265BC9" />
            </linearGradient>
          </defs>
          <path d="M6 12 C14 9 20 10 24 14 C28 10 34 9 42 12 V37 C34 34 28 35 24 39 C20 35 14 34 6 37 Z" fill={`url(#ntBook-${uid})`} />
          <path d="M9.5 14.5 C15 12.5 20 13.5 24 16.5 V35.5 C19.5 32.5 14.5 32.5 9.5 34.5 Z" fill="#FFFFFF" />
          <path d="M38.5 14.5 C33 12.5 28 13.5 24 16.5 V35.5 C28.5 32.5 33.5 32.5 38.5 34.5 Z" fill="#F0F7FF" />
          <path d="M24 6 L25.6 10.2 L30 10.8 L26.8 13.8 L27.6 18 L24 15.8 L20.4 18 L21.2 13.8 L18 10.8 L22.4 10.2 Z" fill="#FFD34E" />
        </svg>
      );

    case 'play':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" style={{ opacity }} aria-hidden="true">
          <defs>
            <linearGradient id={`ntPlay-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9A7BFF" />
              <stop offset="100%" stopColor="#522BBF" />
            </linearGradient>
          </defs>
          <path d="M13 15 H35 C39 15 43 19 44 27 L44.5 34 C44.5 37.5 41.5 40 38 40 C35 40 33 38 31.5 35 H16.5 C15 38 13 40 10 40 C6.5 40 3.5 37.5 3.5 34 L4 27 C5 19 9 15 13 15 Z" fill={`url(#ntPlay-${uid})`} />
          <path d="M14.5 22 V29 M11 25.5 H18" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32.5" cy="22.5" r="2.5" fill="#FFD34E" />
          <circle cx="36.5" cy="26" r="2.5" fill="#36C995" />
          <circle cx="28.5" cy="26" r="2.5" fill="#F16E9A" />
          <circle cx="32.5" cy="29.5" r="2.5" fill="#4389F5" />
        </svg>
      );

    case 'progress':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" style={{ opacity }} aria-hidden="true">
          <defs>
            <linearGradient id={`ntCup-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF5B8" />
              <stop offset="55%" stopColor="#FFD34E" />
              <stop offset="100%" stopColor="#E69514" />
            </linearGradient>
          </defs>
          <path d="M14 10 H34 V21 C34 27 29.5 31.5 24 31.5 C18.5 31.5 14 27 14 21 V10 Z" fill={`url(#ntCup-${uid})`} />
          <path d="M14 14 H9.5 C9.5 21 11.5 23.5 14 23.5 M34 14 H38.5 C38.5 21 36.5 23.5 34 23.5" stroke="#FF9B42" strokeWidth="3.2" strokeLinecap="round" />
          <rect x="21" y="31.5" width="6" height="6.5" fill="#E69514" />
          <rect x="14" y="37.5" width="20" height="5.5" rx="2.8" fill="#7047E8" />
          <circle cx="24" cy="19" r="4" fill="#FFFFFF" opacity="0.6" />
        </svg>
      );

    case 'profile':
    default:
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" style={{ opacity }} aria-hidden="true">
          <defs>
            <linearGradient id={`ntProf-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFA3C2" />
              <stop offset="100%" stopColor="#D9447A" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="19" fill="#F5F3FC" />
          <circle cx="24" cy="18" r="8" fill={`url(#ntProf-${uid})`} />
          <path d="M11 39 C13 31 18 28 24 28 C30 28 35 31 37 39" fill={`url(#ntProf-${uid})`} />
          <circle cx="35" cy="14" r="4.5" fill="#FFD34E" />
        </svg>
      );
  }
};

export const NavTabSvgIcon: React.FC<{
  tab: 'home' | 'learn' | 'play' | 'progress' | 'profile';
  active?: boolean;
  className?: string;
}> = ({ tab, active = false, className = 'w-6 h-6' }) => (
  <NavTabSvgInner tab={tab} active={active} className={className} />
);

/**
 * 3. ÍCONES 3D DE ESTADO VISUAL DOS CARDS
 */
const StateBadgeSvgInner: React.FC<{ state: CardVisualState; className: string }> = ({ state, className }) => {
  const uid = React.useId().replace(/:/g, '');
  switch (state) {
    case 'selected':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="12" fill="#4389F5" />
          <path d="M8.5 14.5 L12.2 18.2 L19.8 10.6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'in_progress':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="12" fill="#FF9B42" />
          <path d="M14 7.5 V14.5 L19 17" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'completed':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="12" fill="#36C995" />
          <path d="M8.5 14.5 L12.2 18.2 L19.8 10.6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'recommended':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none" aria-hidden="true">
          <defs>
            <radialGradient id={`sbStar-${uid}`} cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#FFF5B8" />
              <stop offset="100%" stopColor="#FF9B42" />
            </radialGradient>
          </defs>
          <path d="M14 3 L17.3 10.2 L25 11.2 L19.4 16.5 L20.8 24.2 L14 20.5 L7.2 24.2 L8.6 16.5 L3 11.2 L10.7 10.2 Z" fill={`url(#sbStar-${uid})`} />
        </svg>
      );
    case 'new':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="12" fill="#7047E8" />
          <path d="M14 6 L16.2 11.8 L22 14 L16.2 16.2 L14 22 L11.8 16.2 L6 14 L11.8 11.8 Z" fill="#FFD34E" />
        </svg>
      );
    case 'locked':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none" aria-hidden="true">
          <rect x="6" y="12" width="16" height="12" rx="4" fill="#B8B3D6" />
          <path d="M9.5 12 V9 C9.5 6.5 11.5 5 14 5 C16.5 5 18.5 6.5 18.5 9 V12" stroke="#77758A" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="14" cy="17.5" r="2" fill="#25233A" />
        </svg>
      );
    case 'disabled':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="11" fill="#D5C8F5" />
          <path d="M9.5 14 H18.5" stroke="#77758A" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'available':
    default:
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="12" fill="#7047E8" />
          <path d="M11 9.5 L19.5 14 L11 18.5 Z" fill="#FFFFFF" />
        </svg>
      );
  }
};

export const StateBadgeSvgIcon: React.FC<{ state: CardVisualState; className?: string }> = ({
  state,
  className = 'w-4 h-4'
}) => <StateBadgeSvgInner state={state} className={className} />;

/**
 * 4. ÍCONES 3D DE MECÂNICA DE ATIVIDADE
 */
export const ActivityTypeSvgIcon: React.FC<{ type: ActivityContentType; className?: string }> = ({
  type,
  className = 'w-6 h-6'
}) => {
  switch (type) {
    case 'word_build':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="7" width="13" height="14" rx="4.5" fill="#FFD34E" />
          <rect x="19" y="14" width="13" height="14" rx="4.5" fill="#36C995" />
          <path d="M8.5 17 L10.5 10.5 L12.5 17 M9.2 15 H11.8" stroke="#25233A" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M23.5 18 V24 H27.5" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );
    case 'sequence':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="18" width="7" height="12" rx="3.5" fill="#36C995" />
          <rect x="14.5" y="12" width="7" height="18" rx="3.5" fill="#FFD34E" />
          <rect x="25" y="6" width="7" height="24" rx="3.5" fill="#4389F5" />
        </svg>
      );
    case 'pair_matching':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="6" width="12" height="15" rx="4" fill="#9A7BFF" />
          <rect x="20" y="15" width="12" height="15" rx="4" fill="#FFD34E" />
          <path d="M16 14 L20 20" stroke="#7047E8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'direction_tap':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <circle cx="18" cy="18" r="13" fill="#DCF0FF" />
          <path d="M18 10 L25 18 L18 26 L15.5 21 H10 V15 H15.5 Z" fill="#4389F5" />
        </svg>
      );
    case 'drawing_canvas':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <path d="M25 6 L30 11 L15 26 L8 28 L10 21 Z" fill="#F16E9A" />
          <circle cx="11" cy="11" r="3" fill="#FFD34E" />
        </svg>
      );
    case 'breathing':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <ellipse cx="18" cy="15" rx="10" ry="11" fill="#36C995" />
          <ellipse cx="15" cy="11" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.5" />
          <path d="M18 26 Q16 31 20 34" stroke="#178760" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'physical_action':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <circle cx="18" cy="8.5" r="4" fill="#FF9B42" />
          <path d="M10 17 L18 15 L26 17 M18 15 V24 L13 31 M18 24 L23 31" stroke="#7047E8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'visual_math':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="6" width="13" height="13" rx="4" fill="#FF9B42" />
          <path d="M10.5 9.5 V15.5 M7.5 12.5 H13.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="19" y="17" width="13" height="13" rx="4" fill="#4389F5" />
          <path d="M22.5 22 H28.5 M22.5 25.5 H28.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'rhythm_echo':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <path d="M14 25 V10 L27 7.5 V22" stroke="#7047E8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="11" cy="25.5" r="4.5" fill="#F16E9A" />
          <circle cx="24" cy="22.5" r="4.5" fill="#FFD34E" />
        </svg>
      );
    case 'story_quiz':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <rect x="6" y="7" width="24" height="22" rx="6" fill="#4389F5" />
          <path d="M12 14 H24 M12 19 H20" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'spot_odd':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="9.5" fill="#DCFCE7" stroke="#36C995" strokeWidth="3" />
          <path d="M23 23 L29 29" stroke="#7047E8" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'pattern_complete':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <circle cx="11" cy="18" r="5" fill="#F16E9A" />
          <rect x="20" y="13" width="10" height="10" rx="3" fill="#FFD34E" />
        </svg>
      );
    case 'choice':
    default:
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <circle cx="18" cy="18" r="13" fill="#36C995" />
          <path d="M12.5 18.2 L16.2 21.8 L24 14" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

/**
 * 5. ÍCONES 3D DE INTERAÇÃO DO SISTEMA / PAIS / NOTIFICAÇÕES / USUÁRIO
 */
export const SystemGlyphSvg: React.FC<{
  kind: 'family' | 'shield' | 'settings' | 'bell' | 'checklist';
  className?: string;
}> = ({ kind, className = 'w-6 h-6' }) => {
  switch (kind) {
    case 'family':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <circle cx="13" cy="13" r="5" fill="#4389F5" />
          <circle cx="24" cy="14.5" r="4.2" fill="#FFD34E" />
          <path d="M5 29 C6 22 10 19.5 13.5 19.5 C17 19.5 20.5 22 21.5 29" fill="#99D8FF" />
          <path d="M18 29 C19 23.5 21.5 21.5 24.5 21.5 C27.5 21.5 30 23.5 31 29" fill="#FFDF85" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <path d="M18 4.5 L29.5 9.5 V18 C29.5 25.5 24 30 18 32.5 C12 30 6.5 25.5 6.5 18 V9.5 L18 4.5 Z" fill="#36C995" />
          <path d="M13 18.5 L16.5 22 L23.5 14.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <circle cx="18" cy="18" r="12" fill="#7047E8" />
          <circle cx="18" cy="18" r="5.5" fill="#FFFFFF" />
          <circle cx="18" cy="6" r="2.6" fill="#9A7BFF" />
          <circle cx="18" cy="30" r="2.6" fill="#9A7BFF" />
          <circle cx="6" cy="18" r="2.6" fill="#9A7BFF" />
          <circle cx="30" cy="18" r="2.6" fill="#9A7BFF" />
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <path d="M18 6 C13 6 10 9.5 10 15 V21 L7.5 25 H28.5 L26 21 V15 C26 9.5 23 6 18 6 Z" fill="#FFD34E" />
          <circle cx="18" cy="28.5" r="3" fill="#FF9B42" />
          <circle cx="25" cy="9" r="3.5" fill="#F16E9A" />
        </svg>
      );
    case 'checklist':
    default:
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
          <rect x="7" y="5" width="22" height="26" rx="6" fill="#FFFFFF" stroke="#D5C8F5" strokeWidth="2" />
          <path d="M12 13 L14.5 15.5 L19 11" stroke="#36C995" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 22 L14.5 24.5 L19 20" stroke="#7047E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="22" y1="13" x2="25" y2="13" stroke="#77758A" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="22" y1="22" x2="25" y2="22" stroke="#77758A" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
  }
};
