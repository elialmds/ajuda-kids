import React from 'react';
import { useApp } from '@/modules/context/AppContext';
import { ParkPlaygroundScene } from '@/components/common/ParkPlaygroundScene';
import { Button } from '@/components/common/Button';
import { KID_CHARACTERS } from '@/data/charactersData';
import { AjudaKidsBrandBadge } from '@/components/common/AjudaKidsMascot';
import {
  Sparkles,
  ShieldCheck,
  Compass,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Heart,
  ArrowRight,
  Users
} from 'lucide-react';
import { audioService } from '@/services/audioService';

interface WelcomeParkHeroProps {
  onEnterChildApp: () => void;
  onOpenParentArea: () => void;
  onOpenProfileSelect: () => void;
}

export const WelcomeParkHero: React.FC<WelcomeParkHeroProps> = ({
  onEnterChildApp,
  onOpenParentArea,
  onOpenProfileSelect
}) => {
  const {
    activeChild,
    setActiveChild,
    childrenList,
    isDarkMode,
    toggleDarkMode,
    parentSettings,
    updateParentSettings
  } = useApp();

  const handleToggleSound = () => {
    if (!parentSettings) return;
    const next = !parentSettings.soundEffectsEnabled;
    updateParentSettings({
      soundEffectsEnabled: next,
      voiceNarrationEnabled: next
    });
  };

  const handleSelectCharacterAvatar = (childId: string) => {
    const found = childrenList.find(c => c.id === childId);
    if (found) {
      audioService.playGentlePop();
      setActiveChild(found);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#F5F3FC] dark:bg-[#121024] text-[#25233A] dark:text-[#F8F7FF]">
      {/* Full-bleed Seamless Illustrated Park & Playground Backdrop */}
      <ParkPlaygroundScene isDarkMode={isDarkMode} className="absolute inset-0 w-full h-full z-0" />
      {/* Top Navbar */}
      <header className="relative z-30 px-4 py-4 sm:px-8 max-w-6xl mx-auto w-full flex items-center justify-between">
        {/* Brand */}
        <AjudaKidsBrandBadge size={44} subtitle="DESENVOLVIMENTO INFANTIL" />

        {/* Top Controls: Dark Mode, Sound, Parents */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            aria-label="Alternar tema"
            className="w-10 h-10 rounded-2xl bg-white/90 dark:bg-[#1E1B3A] text-[#7047E8] dark:text-[#FFD34E] border border-[#E4DFF5] dark:border-[#38316B] shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={parentSettings?.soundEffectsEnabled ? 'Sons ativados' : 'Sons desativados'}
            aria-label="Alternar som"
            className="w-10 h-10 rounded-2xl bg-white/90 dark:bg-[#1E1B3A] text-[#25233A] dark:text-[#F8F7FF] border border-[#E4DFF5] dark:border-[#38316B] shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            {parentSettings?.soundEffectsEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>

          {/* Parental Area Button */}
          <button
            type="button"
            onClick={onOpenParentArea}
            className="bg-[#7047E8] hover:bg-[#5E36D4] text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-tactile transition-all active:scale-95 border border-white/10"
          >
            <ShieldCheck size={16} className="text-[#FFD34E]" />
            <span className="hidden sm:inline">Área dos Pais</span>
          </button>
        </div>
      </header>

      {/* Main Hero Card Container */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 py-4 sm:py-8 w-full text-center flex flex-col items-center justify-center flex-1">
        {/* Floating Tag */}
        <div className="inline-flex items-center gap-2 bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#DDD6F3] dark:border-[#38316B] shadow-sm text-xs font-black text-[#7047E8] dark:text-[#C4B5FD] mb-4 animate-fadeIn">
          <Sparkles size={14} className="text-[#FFD34E]" />
          <span>Rotina saudável de 20 a 30 minutos por dia</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#25233A] dark:text-white tracking-tight leading-tight max-w-2xl">
          Aprender, brincar e crescer com carinho e tranquilidade
        </h1>

        <p className="mt-3 text-sm sm:text-base font-medium text-[#77758A] dark:text-[#B8B3D6] max-w-xl leading-relaxed">
          Atividades interativas guiadas, desenvolvimento da fala, raciocínio lógico, emoções e coordenação motora com acompanhamento para os pais.
        </p>

        {/* Kid Character Profiles Showcase */}
        <div className="my-6 p-4 sm:p-5 rounded-[30px] bg-white/90 dark:bg-[#1E1B3A]/90 backdrop-blur-md border-2 border-[#E4DFF5] dark:border-[#38316B] ak-card-3d max-w-lg w-full animate-fadeIn">
          <span className="text-xs font-black uppercase tracking-wider text-[#7047E8] dark:text-[#C4B5FD] block mb-3">
            Quem vai brincar hoje?
          </span>

          <div className="flex items-center justify-center gap-3 sm:gap-4 overflow-x-auto py-1">
            {childrenList.map((child, idx) => {
              const isSelected = activeChild?.id === child.id;
              const char = KID_CHARACTERS[idx % KID_CHARACTERS.length];

              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => handleSelectCharacterAvatar(child.id)}
                  className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-200 transform ${
                    isSelected
                      ? 'scale-110 bg-[#F5F3FC] dark:bg-[#27234D] shadow-card ring-2 ring-[#7047E8]'
                      : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-[#121024] flex items-center justify-center ak-sticker-badge overflow-hidden p-0.5">
                    {char.renderAvatar(50)}
                  </div>
                  <span className="font-display text-xs font-bold text-[#25233A] dark:text-white mt-1.5 truncate max-w-[65px]">
                    {child.nickname || child.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#7047E8] dark:text-[#C4B5FD]">
                    {child.age} anos
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Commercial App Entry Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center">
          <button
            type="button"
            onClick={onEnterChildApp}
            className="w-full sm:w-auto px-8 py-4 rounded-3xl bg-gradient-to-r from-[#7047E8] to-[#4389F5] text-white font-display font-bold text-lg sm:text-xl shadow-tactile hover:brightness-105 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border-b-4 border-[#4A25B8]"
          >
            <span>Entrar na Aventura</span>
            <ArrowRight size={22} />
          </button>

          <Button
            variant="outline"
            size="lg"
            onClick={onOpenProfileSelect}
            className="w-full sm:w-auto text-sm border-2 border-[#DDD6F3] dark:border-[#38316B] bg-white/90 dark:bg-[#1E1B3A]/90 text-[#25233A] dark:text-white"
          >
            <Users size={18} />
            <span>Trocar Criança</span>
          </Button>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pb-8 text-xs font-bold text-[#25233A] dark:text-[#F8F7FF]">
          <span className="flex items-center gap-1.5 bg-white/90 dark:bg-[#1E1B3A]/90 px-3.5 py-1.5 rounded-full border border-[#E4DFF5] dark:border-[#38316B]">
            <Heart size={14} className="text-[#F16E9A]" /> Apoio Emocional
          </span>
          <span className="flex items-center gap-1.5 bg-white/90 dark:bg-[#1E1B3A]/90 px-3.5 py-1.5 rounded-full border border-[#E4DFF5] dark:border-[#38316B]">
            <Compass size={14} className="text-[#4389F5]" /> Minha Jornada Diária
          </span>
          <span className="flex items-center gap-1.5 bg-white/90 dark:bg-[#1E1B3A]/90 px-3.5 py-1.5 rounded-full border border-[#E4DFF5] dark:border-[#38316B]">
            <ShieldCheck size={14} className="text-[#36C995]" /> Controle Parental Seguro
          </span>
        </div>
      </div>
    </div>
  );
};
