import React from 'react';
import { Sparkles } from 'lucide-react';
import { audioService } from '@/services/audioService';
import { NavTabSvgIcon } from '@/design-system/EliteIcons';

export type ChildTab = 'home' | 'learn' | 'play' | 'progress' | 'profile';

interface ChildNavBarProps {
  activeTab: ChildTab;
  onSelectTab: (tab: ChildTab) => void;
  isRewardUnlocked?: boolean;
}

export const ChildNavBar: React.FC<ChildNavBarProps> = ({
  activeTab,
  onSelectTab,
  isRewardUnlocked = false
}) => {
  const tabs: { id: ChildTab; label: string; badge?: boolean }[] = [
    { id: 'home', label: 'Início' },
    { id: 'learn', label: 'Aprender' },
    { id: 'play', label: 'Brincar', badge: isRewardUnlocked },
    { id: 'progress', label: 'Progresso' },
    { id: 'profile', label: 'Perfil' }
  ];

  const handleTabClick = (tabId: ChildTab) => {
    audioService.playGentlePop();
    onSelectTab(tabId);
  };

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 rounded-[24px] bg-white/95 dark:bg-[#1E1B3A]/95 backdrop-blur-lg border-2 border-[#E4DFF5] dark:border-[#38316B] py-2 px-3 shadow-[0_12px_32px_rgba(37,35,58,0.14)] dark:shadow-[0_12px_36px_rgba(8,6,20,0.65)] sm:static sm:bg-transparent sm:dark:bg-transparent sm:backdrop-blur-none sm:border-0 sm:shadow-none sm:py-0 sm:rounded-none">
      <div className="max-w-2xl mx-auto flex items-center justify-around sm:justify-center sm:gap-2 sm:p-1.5 sm:bg-white/95 dark:sm:bg-[#1E1B3A]/95 sm:backdrop-blur-md sm:rounded-full sm:border-2 sm:border-[#E4DFF5] dark:sm:border-[#38316B] sm:shadow-[0_5px_0_#D8CCFA,0_12px_28px_rgba(112,71,232,0.10)] dark:sm:shadow-[0_5px_0_#0D0B1D,0_12px_28px_rgba(8,6,20,0.58)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`btn-elite relative flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-[18px] sm:rounded-full transition-all duration-200 ${
                isActive
                  ? 'text-white bg-[#7047E8] border-2 border-[#8B68F0] shadow-[0_3px_0_#4E28B8] font-extrabold'
                  : 'text-[#77758A] dark:text-[#B8B3D6] border-2 border-transparent hover:text-[#25233A] dark:hover:text-[#F8F7FF] hover:bg-[#F5F3FC] dark:hover:bg-[#27234D] font-bold'
              }`}
            >
              <div className="relative">
                <NavTabSvgIcon tab={tab.id} active={isActive} className="w-6 h-6" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#36C995] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#36C995]"></span>
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-display whitespace-nowrap">{tab.label}</span>
              {tab.id === 'play' && isRewardUnlocked && (
                <Sparkles size={11} className={isActive ? 'text-[#FFD34E] hidden sm:inline' : 'text-[#FF9B42] hidden sm:inline'} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
