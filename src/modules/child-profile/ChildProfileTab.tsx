import React, { useEffect, useState } from 'react';
import { useApp } from '@/modules/context/AppContext';
import { getKidCharacter, KID_CHARACTERS } from '@/data/charactersData';
import { getSkillAreaIcon } from '@/components/illustrations/CustomIcons';
import { WorldMasteryMedallion, MedalRibbonSvg } from '@/design-system/EliteRewards';
import { WORLD_TOKENS } from '@/design-system/tokens';
import { AchievementRarity, SkillArea } from '@/types';
import { storageService } from '@/services/storageService';
import { ACHIEVEMENTS_CATALOG } from '@/services/progressionService';
import {
  Award,
  Clock,
  Sparkles,
  Palette,
  Star,
  Check,
  Smile,
  Lock,
  Trophy,
  Flame
} from 'lucide-react';
import { audioService } from '@/services/audioService';

const FAVORITE_COLORS = [
  { id: 'sky', label: 'Azul Céu', bg: '#C8E0F3', accent: '#4A90B8', border: '#83BCE0', darkBg: '#192948', darkAccent: '#7DD3FC', darkBorder: '#34588E' },
  { id: 'meadow', label: 'Verde Parque', bg: '#DDE9D2', accent: '#2D5A3B', border: '#9BCB7E', darkBg: '#162C24', darkAccent: '#6EE7B7', darkBorder: '#2D684C' },
  { id: 'lavender', label: 'Lilás Mágico', bg: '#E5D2F4', accent: '#6B3FA0', border: '#BA8EE0', darkBg: '#271F4A', darkAccent: '#D8B4FE', darkBorder: '#57439C' },
  { id: 'sun', label: 'Amarelo Sol', bg: '#F4E9A9', accent: '#855E14', border: '#E0C35A', darkBg: '#2C2316', darkAccent: '#FCD34D', darkBorder: '#7D6021' },
  { id: 'rose', label: 'Rosa Alegre', bg: '#F3D9DE', accent: '#9D3F54', border: '#E49EAD', darkBg: '#321D2D', darkAccent: '#F9A8D4', darkBorder: '#783B5E' }
];

const RARITY_STYLES: Record<
  AchievementRarity,
  { label: string; lightCls: string; darkCls: string }
> = {
  bronze: {
    label: 'Bronze',
    lightCls: 'bg-[#FFF0D6] text-[#8E4D08] border-[#F3B65B]',
    darkCls: 'bg-[#312113] text-[#FDBA74] border-[#945721]'
  },
  silver: {
    label: 'Prata',
    lightCls: 'bg-[#EAF5FE] text-[#1A5A8A] border-[#8CC9F2]',
    darkCls: 'bg-[#172A45] text-[#7DD3FC] border-[#2D5482]'
  },
  gold: {
    label: 'Ouro',
    lightCls: 'bg-[#FFF6D1] text-[#7D5406] border-[#F2CA52]',
    darkCls: 'bg-[#2E2514] text-[#FFD43B] border-[#8D6C1E]'
  },
  diamond: {
    label: 'Diamante',
    lightCls: 'bg-[#ECE2FE] text-[#58309E] border-[#C3A3F5]',
    darkCls: 'bg-[#29204F] text-[#D8B4FE] border-[#5D4B9E]'
  }
};

export const ChildProfileTab: React.FC = () => {
  const { activeChild, parentSettings, saveChildProfile, progression, isDarkMode } = useApp();
  const [selectedThemeId, setSelectedThemeId] = useState<string>('sky');
  const [stats, setStats] = useState({ stars: 0, completedActivities: 0, gamesPlayed: 0 });

  useEffect(() => {
    if (!activeChild) return;
    const savedTheme = localStorage.getItem(`ajuda_kids_club_color_${activeChild.id}`);
    if (savedTheme && FAVORITE_COLORS.some(c => c.id === savedTheme)) {
      setSelectedThemeId(savedTheme);
    }
    const loadStats = async () => {
      const completions = storageService.getActivityCompletions(activeChild.id);
      const games = await storageService.getGameHistory(activeChild.id);
      const stars =
        completions.length * 10 +
        games.reduce((acc, g) => acc + (g.stars || 2), 0);
      setStats({
        stars,
        completedActivities: completions.length,
        gamesPlayed: games.length
      });
    };
    loadStats();
  }, [activeChild, progression?.totalXp]);

  if (!activeChild) return null;

  const character = getKidCharacter(activeChild.avatar);
  const maxDailyMinutes = parentSettings?.maxDailyMinutes || 30;
  const activeColor = FAVORITE_COLORS.find(c => c.id === selectedThemeId) || FAVORITE_COLORS[0];
  const level = progression?.level ?? 1;
  const levelTitle = progression?.levelTitle ?? 'Aprendiz Curioso';
  const totalXp = progression?.totalXp ?? 0;
  const xpIntoLevel = progression?.xpIntoLevel ?? 0;
  const xpForNextLevel = progression?.xpForNextLevel ?? 100;
  const xpPercent = progression?.progressPercent ?? 0;
  const streakDays = progression?.streakDays ?? 0;
  const unlockedCount = progression?.achievementsUnlockedCount ?? 0;

  const handleSelectColor = (colorId: string) => {
    setSelectedThemeId(colorId);
    localStorage.setItem(`ajuda_kids_club_color_${activeChild.id}`, colorId);
    audioService.playGentlePop();
  };

  const handleChangeAvatar = async (charId: string) => {
    if (activeChild.avatar === charId) return;
    audioService.playSuccess();
    await saveChildProfile({ ...activeChild, avatar: charId });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* 1. Meu Clubinho Hero */}
      <div
        style={{
          background: isDarkMode
            ? `linear-gradient(135deg, #1E1B3A 20%, ${activeColor.darkBg} 100%)`
            : `linear-gradient(135deg, #FFFFFF 20%, ${activeColor.bg} 100%)`,
          borderColor: isDarkMode ? activeColor.darkBorder : activeColor.border
        }}
        className="ak-card-3d rounded-[34px] p-6 sm:p-8 border-2 shadow-soft transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div
            style={{ borderColor: isDarkMode ? activeColor.darkBorder : activeColor.border }}
            className="ak-sticker-badge relative shrink-0 p-3 rounded-full bg-white dark:bg-[#121024] border-4 shadow-sticker flex items-center justify-center"
          >
            {character.renderAvatar(96)}
            <span
              style={{ backgroundColor: isDarkMode ? activeColor.darkBorder : activeColor.accent }}
              className="absolute -bottom-1 -right-1 p-2 rounded-full text-white shadow-sm"
            >
              <Sparkles size={14} />
            </span>
          </div>

          <div className="text-center sm:text-left min-w-0 flex-1">
            <div
              style={{
                backgroundColor: isDarkMode ? activeColor.darkBg : activeColor.bg,
                color: isDarkMode ? activeColor.darkAccent : activeColor.accent
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black mb-2 border border-white dark:border-[#3A4D7E]"
            >
              <Smile size={14} />
              <span>Meu Clubinho • {activeChild.ageGroup} anos</span>
            </div>
            <h1 className="ak-title-display font-display text-3xl sm:text-4xl font-bold text-[#25233A] dark:text-white">
              {activeChild.nickname || activeChild.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6] mt-1 font-bold">
              Meu personagem: <span className="font-black text-[#25233A] dark:text-white">{character.name}</span> — {character.personality}
            </p>

            {/* Quick Star Wallet, Level & XP */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#ECE2FE] dark:bg-[#271F4A] text-[#58309E] dark:text-[#D8B4FE] border border-[#C3A3F5] dark:border-[#5D4B9E] text-xs font-black shadow-sm tabular-nums">
                <Trophy size={15} className="text-[#7C3AED] dark:text-[#C4B5FD]" />
                <span>
                  Nível {level} • {levelTitle} ({totalXp} XP)
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#F4E9A9] dark:bg-[#2F2513] text-[#6B4E0C] dark:text-[#FFD43B] border border-transparent dark:border-[#785C1C] text-xs font-black shadow-sm tabular-nums">
                <Star size={15} className="fill-amber-500 text-amber-600 dark:text-[#FFD43B]" />
                <span>{stats.stars} Estrelinhas</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#FFF0D6] dark:bg-[#312113] text-[#8E4D08] dark:text-[#FDBA74] border border-[#F3B65B] dark:border-[#945721] text-xs font-black shadow-sm tabular-nums">
                <Flame size={15} className="text-[#F97316] dark:text-[#FDBA74]" />
                <span>{streakDays} dias seguidos</span>
              </div>
              {activeChild.targetSkills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] text-[11px] font-black text-[#25233A] dark:text-[#E2E8F0]"
                >
                  {getSkillAreaIcon(skill, 'w-4 h-4')}
                  <span>{WORLD_TOKENS[skill]?.shortLabel || 'Habilidade'}</span>
                </span>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-white/95 dark:bg-[#121024] border-2 border-[#E4DFF5] dark:border-[#38316B]">
              <div className="flex items-center justify-between text-[11px] font-black text-[#25233A] dark:text-[#E2E8F0] mb-1.5">
                <span>Progresso para o Nível {level + 1}</span>
                <span className="tabular-nums text-[#58309E] dark:text-[#D8B4FE]">
                  {xpIntoLevel}/{xpForNextLevel} XP ({xpPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-[#F5F3FC] dark:bg-[#1E1B3A] rounded-full overflow-hidden border border-[#E4DFF5] dark:border-[#38316B]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] via-[#38A3F1] to-[#48C71E] transition-all duration-500"
                  style={{ width: `${Math.max(6, xpPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Escolher Meu Personagem (Sincroniza 2D e 3D nos Jogos!) */}
      <div className="ak-card-3d rounded-[30px] p-6 bg-white/95 dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E5D2F4] dark:bg-[#2B224D] text-[#5B3587] dark:text-[#C4B5FD] flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="ak-title-display font-display font-bold text-lg text-[#25233A] dark:text-white">
                Escolha seu Personagem da Turma
              </h3>
              <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6]">
                O amigo selecionado acompanha você nas missões e nos jogos 3D!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {KID_CHARACTERS.map(char => {
            const isSelected = getKidCharacter(activeChild.avatar).id === char.id;
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => handleChangeAvatar(char.id)}
                className={`relative p-3 rounded-2xl border-2 flex flex-col items-center transition-all ${
                  isSelected
                    ? 'bg-[#C8E0F3]/40 dark:bg-[#293563] border-[#4A90B8] dark:border-[#7C6BFF] scale-105 shadow-sm'
                    : 'bg-[#F5F3FC] dark:bg-[#121024] border-transparent dark:border-[#27234D] hover:border-[#DDD6F3] dark:hover:border-[#7047E8] hover:bg-white dark:hover:bg-[#27234D]'
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#4A90B8] dark:bg-[#5843F4] text-white flex items-center justify-center shadow-sm">
                    <Check size={12} />
                  </span>
                )}
                {char.renderAvatar(50)}
                <span className="text-xs font-black text-[#25233A] dark:text-[#F1F5F9] mt-1.5">{char.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Cor Favorita do Meu Clubinho */}
      <div className="ak-card-3d rounded-[30px] p-6 bg-white/95 dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-card">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#F4E9A9] dark:bg-[#2E2514] text-[#855E14] dark:text-[#FCD34D] flex items-center justify-center">
            <Palette size={20} />
          </div>
          <div>
            <h3 className="ak-title-display font-display font-bold text-lg text-[#25233A] dark:text-white">
              Minha Cor Favorita
            </h3>
            <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6]">
              Personalize a cor de destaque do seu cartão de aventureiro
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {FAVORITE_COLORS.map(c => {
            const active = selectedThemeId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectColor(c.id)}
                style={{
                  backgroundColor: isDarkMode ? c.darkBg : c.bg,
                  borderColor: active ? (isDarkMode ? c.darkAccent : c.accent) : 'transparent'
                }}
                className={`px-4 py-2.5 rounded-2xl border-2 text-xs font-black flex items-center gap-2 transition-all ${
                  active ? 'scale-105 shadow-sm' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <span style={{ backgroundColor: isDarkMode ? c.darkAccent : c.accent }} className="w-3.5 h-3.5 rounded-full" />
                <span className="text-[#25233A] dark:text-[#F1F5F9]">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Medalhas de Desenvolvimento Reais */}
      <div className="ak-card-3d rounded-[30px] p-6 bg-white/95 dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <MedalRibbonSvg size={30} />
            <div>
              <h3 className="ak-title-display font-display font-bold text-lg text-[#25233A] dark:text-white">
                Minhas Conquistas &amp; Medalhas
              </h3>
              <p className="text-[11px] font-semibold text-[#5A6D91] dark:text-[#94A3B8]">
                Desbloqueie concluindo missões, jogos 3D, desenhos e sequências diárias
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#F3EFFF] dark:bg-[#121024] border border-[#DDD6F3] dark:border-[#38316B] text-xs font-black text-[#7047E8] dark:text-[#C4B5FD] tabular-nums">
            {unlockedCount} de {ACHIEVEMENTS_CATALOG.length} desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS_CATALOG.map((ach) => {
            const progress = progression?.achievementProgressMap[ach.id];
            const isUnlocked = Boolean(progress?.unlocked);
            const current = progress?.current ?? 0;
            const target = progress?.target ?? ach.targetValue;
            const pct = Math.min(100, Math.round((current / Math.max(1, target)) * 100));
            const rarityStyle = RARITY_STYLES[ach.rarity];

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-white dark:bg-[#121024] border-[#36C995] dark:border-[#36C995]/50 shadow-[0_3px_0_#2BB382] dark:shadow-[0_3px_0_#0D2016]'
                    : 'bg-[#F5F3FC] dark:bg-[#121024] border-[#E4DFF5] dark:border-[#38316B] opacity-90'
                }`}
              >
                <div className={`shrink-0 ${isUnlocked ? '' : 'opacity-65 grayscale'}`}>
                  {ach.area ? (
                    <WorldMasteryMedallion area={ach.area} unlocked={isUnlocked} size={52} />
                  ) : (
                    <div className="ak-sticker-badge w-[52px] h-[52px] rounded-2xl bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-center">
                      <MedalRibbonSvg size={40} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        isDarkMode ? rarityStyle.darkCls : rarityStyle.lightCls
                      }`}
                    >
                      {rarityStyle.label} • +{ach.xpBonus} XP
                    </span>
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#1E6917] dark:text-[#6EE7B7]">
                        <Check size={11} />
                        <span>Conquistada</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                        <Lock size={10} />
                        <span className="tabular-nums">
                          {current}/{target}
                        </span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-[#25233A] dark:text-white truncate">
                    {ach.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-[#475569] dark:text-[#CBD5E1] line-clamp-2 leading-snug">
                    {ach.description}
                  </p>

                  {!isUnlocked && (
                    <div className="mt-1.5 w-full h-1.5 bg-[#F5F3FC] dark:bg-[#1E1B3A] rounded-full overflow-hidden border border-[#E4DFF5] dark:border-[#38316B]">
                      <div
                        className="h-full rounded-full bg-[#38A3F1] transition-all duration-300"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Rotina Saudável Diária */}
      <div className="ak-card-3d rounded-[30px] p-6 bg-white/95 dark:bg-[#1E1B3A] border-2 border-[#36C995]/40 dark:border-[#36C995]/30 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DDE9D2] dark:bg-[#173024] text-[#2D5A3B] dark:text-[#6EE7B7] flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="ak-title-display font-display font-bold text-base text-[#25233A] dark:text-white">
                Combinado da Diversão Saudável
              </h3>
              <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6]">
                Brincar no app e depois correr lá fora!
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-[#2D5A3B] dark:text-[#6EE7B7] px-3 py-1 rounded-full bg-[#DDE9D2] dark:bg-[#173024]">
            {maxDailyMinutes} min/dia
          </span>
        </div>

        <p className="text-xs text-[#77758A] dark:text-[#C5BFE6] leading-relaxed font-medium">
          Depois de completar sua jornada e suas rodadas 3D, lembre-se de beber água, descansar os olhinhos e brincar ao ar livre!
        </p>
      </div>
    </div>
  );
};
