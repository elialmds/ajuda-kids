import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw, ArrowRight, Volume2, VolumeX, Trophy, Sparkles, Clock } from 'lucide-react';
import { audioService } from '@/services/audioService';
import { KID_CHARACTERS } from '@/data/charactersData';
import { StarSymbolSvg } from '@/components/illustrations/CustomIcons';
import { GoldStarTrophySvg } from '@/design-system/EliteRewards';

export interface VictoryCelebrationModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  starsEarned?: number;
  score?: number;
  durationSeconds?: number;
  characterId?: string;
  characterName?: string;
  replayLabel?: string;
  continueLabel?: string;
  onReplay?: () => void;
  onContinue: () => void;
}

const CELEBRATION_PHRASES = [
  'Incrível! Você mandou super bem!',
  'Sensacional! Que conquista brilhante!',
  'Mandou muito bem! Continue explorando!',
  'Show! Cada passo deixa você mais esperto!',
  'Uau! Missão cumprida com alegria!'
];

const CONFETTI_ITEMS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + ((i * 19) % 90)}%`,
  delay: `${(i % 6) * 0.14}s`,
  duration: `${2.2 + (i % 4) * 0.35}s`,
  color: ['#FACC15', '#58CC02', '#1CB0F6', '#CE82FF', '#FF9600', '#F472B6'][i % 6],
  size: i % 2 === 0 ? 'w-3 h-3 rounded-full' : 'w-2.5 h-4 rounded-sm rotate-12'
}));

export const VictoryCelebrationModal: React.FC<VictoryCelebrationModalProps> = ({
  isOpen,
  title,
  subtitle,
  starsEarned = 25,
  score,
  durationSeconds,
  characterId,
  characterName,
  replayLabel = 'Jogar Novamente',
  continueLabel = 'Continuar Jornada',
  onReplay,
  onContinue
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const selectedPhrase = useMemo(() => {
    const idx = Math.floor(Math.random() * CELEBRATION_PHRASES.length);
    return CELEBRATION_PHRASES[idx];
  }, [isOpen]);

  const companion = useMemo(() => {
    if (characterId) {
      const found = KID_CHARACTERS.find((c) => c.id === characterId);
      if (found) return found;
    }
    if (characterName) {
      const clean = characterName.toLowerCase();
      const found = KID_CHARACTERS.find((c) => c.name.toLowerCase().includes(clean));
      if (found) return found;
    }
    return KID_CHARACTERS[0];
  }, [characterId, characterName]);

  useEffect(() => {
    if (!isOpen) return;
    if (!isMuted) {
      audioService.playFanfare();
    }
  }, [isOpen, isMuted]);

  if (!isOpen) return null;

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioService.setPreferences(!nextMuted, !nextMuted);
    if (!nextMuted) {
      audioService.playGentlePop();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Celebração de conquista"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#1E2A4A]/55 backdrop-blur-sm animate-fadeIn overflow-hidden"
    >
      {/* Subtle falling confetti overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI_ITEMS.map((piece) => (
          <span
            key={piece.id}
            style={{
              left: piece.left,
              backgroundColor: piece.color,
              animationDelay: piece.delay,
              animationDuration: piece.duration
            }}
            className={`absolute -top-6 ${piece.size} opacity-90 animate-confetti-drop`}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md rounded-[34px] bg-white dark:bg-[#1E1B3A] border-4 border-[#FFD34E] dark:border-[#FF9B42] shadow-[0_14px_0_#D99B1C,0_24px_48px_rgba(37,35,58,0.42)] dark:shadow-[0_14px_0_#9A5610,0_24px_48px_rgba(4,3,18,0.78)] p-6 sm:p-7 text-center text-[#25233A] dark:text-[#F8F7FF] animate-scaleIn">
        {/* Sound toggle */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
          className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#DDD6F3] dark:border-[#38316B] text-[#25233A] dark:text-[#F8F7FF] flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Hero Badge & 3D Character */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#FFF6B8] to-[#FFD34E] dark:from-[#3A2E1A] dark:to-[#27234D] border-4 border-white dark:border-[#FFD34E]/70 ak-sticker-badge flex items-center justify-center animate-bounce-gentle">
              {companion.renderAvatar(80)}
            </div>
            <div className="absolute -bottom-2 -right-3 flex items-center justify-center">
              <GoldStarTrophySvg size={46} />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9F9F0] dark:bg-[#163D34] border border-[#36C995]/50 text-[#0E6B4B] dark:text-[#6EE7B7] text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles size={13} /> Conquista Desbloqueada
          </span>

          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-[#25233A] dark:text-white">
            {title || selectedPhrase}
          </h2>

          {subtitle && (
            <p className="text-sm font-bold text-[#77758A] dark:text-[#B8B3D6] mt-1.5 max-w-xs">
              {subtitle}
            </p>
          )}
        </div>

        {/* Reward Metrics Pill Bar */}
        <div className="mt-5 grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-2.5">
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFF8DB] dark:bg-[#3A2E1A] border-2 border-[#FFD34E] dark:border-[#D99B1C]">
            <StarSymbolSvg className="w-6 h-6 shrink-0" />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase text-[#9B7200] dark:text-[#FFD34E]">Recompensa</p>
              <p className="font-display text-base font-bold text-[#25233A] dark:text-white">
                +{starsEarned} Estrelas
              </p>
            </div>
          </div>

          {typeof score === 'number' && (
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#EDF5FF] dark:bg-[#1E254D] border-2 border-[#93C5FD] dark:border-[#4389F5]">
              <Trophy size={20} className="text-[#4389F5] dark:text-[#70C4FF] shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-[#2458C7] dark:text-[#93C5FD]">Pontos</p>
                <p className="font-display text-base font-bold text-[#25233A] dark:text-white">
                  {score}
                </p>
              </div>
            </div>
          )}

          {typeof durationSeconds === 'number' && durationSeconds > 0 && (
            <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#C4B5FD] dark:border-[#7047E8]">
              <Clock size={18} className="text-[#7047E8] dark:text-[#A78BFA] shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-[#522BBF] dark:text-[#C4B5FD]">Tempo</p>
                <p className="font-display text-base font-bold text-[#25233A] dark:text-white">
                  {durationSeconds}s
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tactile Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {onReplay && (
            <button
              type="button"
              onClick={() => {
                audioService.playGentlePop();
                onReplay();
              }}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#DDD6F3] dark:border-[#38316B] border-b-4 text-[#25233A] dark:text-white font-black text-sm hover:brightness-95 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={17} />
              <span>{replayLabel}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              audioService.playSuccess();
              onContinue();
            }}
            className="flex-1 px-5 py-3.5 rounded-2xl bg-[#36C995] border-2 border-[#1E9B6E] border-b-4 text-white font-black text-sm hover:brightness-105 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{continueLabel}</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};
