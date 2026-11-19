import React from 'react';
import { Lock, ShieldCheck, Volume2, VolumeX, Users, LogOut, Sun, Moon } from 'lucide-react';
import { useApp } from '@/modules/context/AppContext';
import { getKidCharacter } from '@/data/charactersData';
import { Button } from '@/components/common/Button';
import { AjudaKidsBrandBadge } from '@/components/common/AjudaKidsMascot';

interface HeaderProps {
  currentView: 'child' | 'parent';
  onNavigateToParent: () => void;
  onNavigateToChild: () => void;
  onOpenFamilyHub?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateToParent,
  onNavigateToChild,
  onOpenFamilyHub
}) => {
  const {
    activeChild,
    parentSettings,
    updateParentSettings,
    isAuthenticated,
    isDarkMode,
    toggleDarkMode,
    lockParent,
    logoutParent
  } = useApp();

  const toggleSound = () => {
    if (!parentSettings) return;
    const next = !parentSettings.soundEffectsEnabled;
    updateParentSettings({
      soundEffectsEnabled: next,
      voiceNarrationEnabled: next
    });
  };

  return (
    <header className="sticky top-0 z-40 surface-glass border-b border-[#E4DFF5] dark:border-[#38316B] px-4 py-2.5 sm:px-6 shadow-[0_2px_16px_rgba(37,35,58,0.05)] dark:shadow-[0_6px_22px_rgba(8,6,20,0.45)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand & Active Kid Pill */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onNavigateToChild}
            className="flex items-center cursor-pointer select-none shrink-0 text-left group focus:outline-none transition-transform hover:scale-[1.02]"
          >
            <AjudaKidsBrandBadge
              size={40}
              compact
              subtitle={currentView === 'parent' ? 'Painel dos Responsáveis' : 'Aprender & Brincar'}
            />
          </button>

          {activeChild && (
            <div className="flex items-center gap-2 bg-[#F5F3FC] dark:bg-[#27234D] border border-[#D8CCFA] dark:border-[#38316B] rounded-full py-1 pl-1.5 pr-3.5 text-xs font-extrabold text-[#25233A] dark:text-[#F8F7FF] max-w-[180px] sm:max-w-xs truncate shadow-xs">
              <span className="shrink-0 flex items-center justify-center">
                {getKidCharacter(activeChild.avatar).renderAvatar(28)}
              </span>
              <span className="truncate font-display">{activeChild.nickname || activeChild.name}</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Light / Dark Theme Toggle */}
          <button
            type="button"
            data-testid="header-theme-toggle"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            aria-label={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            className="h-9 px-2.5 sm:px-3 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] text-[#25233A] dark:text-[#FFD34E] hover:bg-[#EFEAFC] dark:hover:bg-[#322D61] border border-[#E4DFF5] dark:border-[#38316B] flex items-center gap-1.5 text-xs font-extrabold transition-colors"
          >
            {isDarkMode ? <Sun size={16} className="text-[#FFD34E]" /> : <Moon size={16} className="text-[#7047E8]" />}
            <span className="hidden md:inline">{isDarkMode ? 'Claro' : 'Escuro'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            title={parentSettings?.soundEffectsEnabled ? 'Sons ativados' : 'Sons desativados'}
            aria-label={parentSettings?.soundEffectsEnabled ? 'Desativar sons' : 'Ativar sons'}
            className="w-9 h-9 rounded-2xl bg-[#F5F3FC] dark:bg-[#1E1B3A] text-[#25233A] dark:text-[#F8F7FF] hover:bg-[#EFEAFC] dark:hover:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-center transition-colors"
          >
            {parentSettings?.soundEffectsEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>

          {/* Parental Mode Controls vs Discreet Parent Lock in Child Interface */}
          {currentView === 'parent' ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isAuthenticated && onOpenFamilyHub && (
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  leftIcon={<Users size={15} />}
                  onClick={onOpenFamilyHub}
                >
                  <span className="hidden sm:inline">Trocar Perfil</span>
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onNavigateToChild}
              >
                Voltar para Criança
              </Button>
              <button
                type="button"
                onClick={() => {
                  lockParent();
                  onNavigateToChild();
                }}
                title="Bloquear acesso dos pais"
                className="w-9 h-9 rounded-2xl bg-[#FFF0F5] dark:bg-[#3B1B2B] border border-[#FACBDD] dark:border-[#832B52] text-[#C83265] dark:text-[#F9A8C6] hover:bg-[#FFE0EB] dark:hover:bg-[#4E2339] flex items-center justify-center transition-colors"
              >
                <ShieldCheck size={17} />
              </button>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={logoutParent}
                  title="Sair da conta familiar"
                  className="w-9 h-9 rounded-2xl bg-[#F5F3FC] dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] text-[#4A4668] dark:text-[#B8B3D6] hover:bg-[#EFEAFC] dark:hover:bg-[#322D61] flex items-center justify-center transition-colors"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onNavigateToParent}
              title="Acesso restrito aos responsáveis com PIN"
              aria-label="Acesso dos Pais"
              className="bg-white/95 dark:bg-[#1E1B3A] hover:bg-[#EFEAFC] dark:hover:bg-[#27234D] text-[#25233A] dark:text-[#F8F7FF] border border-[#D8CCFA] dark:border-[#38316B] shadow-xs font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Lock size={13} className="text-[#7047E8] dark:text-[#A78BFA]" />
              <span className="hidden sm:inline">Acesso dos Pais</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
