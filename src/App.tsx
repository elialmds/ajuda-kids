import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from '@/modules/context/AppContext';
import { Header } from '@/components/layout/Header';
import { ChildNavBar, ChildTab } from '@/components/layout/ChildNavBar';
import { ChildHomeView } from '@/modules/home/ChildHomeView';
import { ActivitiesCatalogView } from '@/modules/activities/ActivitiesCatalogView';
import { ChildProgressView } from '@/modules/progress/ChildProgressView';
import { ChildProfileTab } from '@/modules/child-profile/ChildProfileTab';

const Games3DHub = React.lazy(() =>
  import('@/modules/games3d/Games3DHub').then(m => ({ default: m.Games3DHub }))
);
import { ParentalDashboardView } from '@/modules/parental-dashboard/ParentalDashboardView';
import { ProfileSelectModal } from '@/modules/child-profile/ProfileSelectModal';
import { ChildProfileModal } from '@/modules/child-profile/ChildProfileModal';
import { MindfulBreathing } from '@/modules/activities/MindfulBreathing';
import { WelcomeParkHero } from '@/modules/welcome/WelcomeParkHero';
import { ParentAuthView } from '@/modules/auth/ParentAuthView';
import { FamilyWelcomeHub } from '@/modules/family-hub/FamilyWelcomeHub';
import { PinModal } from '@/components/common/PinModal';
import { AboutView } from '@/components/common/AboutView';
import { ThematicPageBackground } from '@/components/illustrations/ThematicPageBackgrounds';
import { Sparkles } from 'lucide-react';
import { ChildProfile, SkillArea } from '@/types';

const isSobrePathname = () =>
  typeof window !== 'undefined' && /^\/sobre\/?$/i.test(window.location.pathname);

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    isPairedChildDevice,
    isFamilyHubOpen,
    setIsFamilyHubOpen,
    activeChild,
    setActiveChild,
    childrenList,
    rewardStatus,
    toastMessage,
    isLoading,
    saveChildProfile,
    deleteChildProfile,
    isParentUnlocked,
    unlockParent,
    lockParent
  } = useApp();

  const [urlPairingCode, setUrlPairingCode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('pair');
    }
    return null;
  });

  const [showWelcomeHero, setShowWelcomeHero] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'child' | 'parent'>('child');
  const [activeTab, setActiveTab] = useState<ChildTab>('home');
  const [learnAreaFilter, setLearnAreaFilter] = useState<SkillArea | 'all'>('all');
  const [isProfileSelectOpen, setIsProfileSelectOpen] = useState(false);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [isParentPinModalOpen, setIsParentPinModalOpen] = useState(false);
  const [pendingParentDestination, setPendingParentDestination] = useState<'parent' | 'family-hub'>('parent');
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(() => isSobrePathname());
  const [isDirectSobreRoute, setIsDirectSobreRoute] = useState<boolean>(() => isSobrePathname());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      const sobre = isSobrePathname();
      setIsDirectSobreRoute(sobre);
      setIsAboutOpen(sobre);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const openAbout = () => {
    setIsAboutOpen(true);
    if (typeof window !== 'undefined' && window.history?.pushState && !isSobrePathname()) {
      window.history.pushState({}, '', '/sobre');
    }
  };

  const closeAbout = () => {
    setIsAboutOpen(false);
    setIsDirectSobreRoute(false);
    if (typeof window !== 'undefined' && isSobrePathname() && window.history?.pushState) {
      window.history.pushState({}, '', '/');
    }
  };

  const requestProtectedNavigation = (dest: 'parent' | 'family-hub') => {
    if (isParentUnlocked) {
      if (dest === 'family-hub') {
        setCurrentView('child');
        setIsFamilyHubOpen(true);
      } else {
        setIsFamilyHubOpen(false);
        setCurrentView('parent');
      }
      return;
    }
    setPendingParentDestination(dest);
    setIsParentPinModalOpen(true);
  };

  const handleEnterChildWorld = (child: ChildProfile) => {
    setActiveChild(child);
    lockParent();
    if (typeof window !== 'undefined') {
      localStorage.setItem('ajuda_kids_entered_child_mode', 'true');
    }
    setIsFamilyHubOpen(false);
    setCurrentView('child');
    setActiveTab('home');
  };

  const handleNavigateTab = (tab: ChildTab, filterArea?: SkillArea) => {
    if (tab === 'learn') {
      setLearnAreaFilter(filterArea || 'all');
    }
    setActiveTab(tab);
  };

  if (isDirectSobreRoute && isAboutOpen) {
    return <AboutView onClose={closeAbout} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#0E1324] flex flex-col items-center justify-center p-4 transition-colors">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#38A3F1] to-[#C8E0F3] dark:from-[#5843F4] dark:to-[#38A3F1] flex items-center justify-center shadow-apple text-[#1E2B48] dark:text-white animate-bounce">
          <Sparkles size={32} />
        </div>
        <h2 className="mt-4 font-display font-bold text-2xl text-[#1E2B48] dark:text-white">Ajuda KIDS</h2>
        <p className="text-xs font-bold text-[#5A6D91] dark:text-[#CBD5E1] mt-1">
          Preparando o Mundo Ajuda KIDS...
        </p>
      </div>
    );
  }

  // 1. FIRST OPENING & ROUTE PROTECTION: Unauthenticated parent -> dedicated Parent Auth View
  if (!isAuthenticated && !isPairedChildDevice) {
    return (
      <>
        <ParentAuthView
          initialPairingCode={urlPairingCode}
          onPairingComplete={() => setUrlPairingCode(null)}
          onOpenAbout={openAbout}
        />
        {isAboutOpen && <AboutView asModal onClose={closeAbout} />}
      </>
    );
  }

  // 2. AUTHENTICATED POST-LOGIN INTERNAL FAMILY WELCOME HUB
  if (
    isAuthenticated &&
    currentView !== 'parent' &&
    (isFamilyHubOpen || childrenList.length === 0 || !activeChild)
  ) {
    return (
      <>
        <FamilyWelcomeHub
          onEnterChild={handleEnterChildWorld}
          onOpenParentDashboard={() => setIsParentPinModalOpen(true)}
          onOpenCreateChild={() => setIsCreateProfileOpen(true)}
          onOpenAbout={openAbout}
        />

        <PinModal
          isOpen={isParentPinModalOpen}
          onClose={() => setIsParentPinModalOpen(false)}
          onSuccess={() => {
            setIsParentPinModalOpen(false);
            setIsFamilyHubOpen(false);
            setCurrentView('parent');
          }}
          verifyPinFn={unlockParent}
        />

        <ChildProfileModal
          isOpen={isCreateProfileOpen}
          onClose={() => setIsCreateProfileOpen(false)}
          onSave={saveChildProfile}
          onDelete={deleteChildProfile}
        />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#303D63] dark:bg-[#1E293E] text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-soft flex items-center gap-2 animate-fadeIn border border-[#83BCE0]/40">
            <Sparkles size={16} className="text-[#F4E9A9]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {isAboutOpen && <AboutView asModal onClose={closeAbout} />}
      </>
    );
  }

  // 3. Optional Illustrated Park Entrance
  if (showWelcomeHero) {
    return (
      <>
        <WelcomeParkHero
          onEnterChildApp={() => setShowWelcomeHero(false)}
          onOpenParentArea={() => setIsParentPinModalOpen(true)}
          onOpenProfileSelect={() => setIsProfileSelectOpen(true)}
        />

        <PinModal
          isOpen={isParentPinModalOpen}
          onClose={() => setIsParentPinModalOpen(false)}
          onSuccess={() => {
            setIsParentPinModalOpen(false);
            setShowWelcomeHero(false);
            setCurrentView('parent');
          }}
          verifyPinFn={unlockParent}
        />

        <ProfileSelectModal
          isOpen={isProfileSelectOpen}
          onClose={() => setIsProfileSelectOpen(false)}
          onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
        />

        <ChildProfileModal
          isOpen={isCreateProfileOpen}
          onClose={() => setIsCreateProfileOpen(false)}
          onSave={saveChildProfile}
          onDelete={deleteChildProfile}
        />
      </>
    );
  }

  // 4. Main Application Interface (Child World vs Parental Dashboard)
  return (
    <div
      className={`relative min-h-screen text-[#25233A] dark:text-[#F8F7FF] flex flex-col selection:bg-[#D8CCFA] dark:selection:bg-[#7047E8]/40 transition-colors duration-300 ${
        currentView === 'parent'
          ? 'bg-[#F5F3FC] dark:bg-[#121024]'
          : 'bg-[#F5F3FC] dark:bg-[#121024]'
      }`}
    >
      <ThematicPageBackground tab={currentView === 'parent' ? 'adult' : activeTab} />
      <Header
        currentView={currentView}
        onNavigateToParent={() => requestProtectedNavigation('parent')}
        onNavigateToChild={() => {
          lockParent();
          setCurrentView('child');
        }}
        onOpenFamilyHub={() => requestProtectedNavigation('family-hub')}
        onOpenAbout={openAbout}
      />

      <main className={`relative z-10 flex-1 w-full mx-auto p-4 sm:p-6 pb-28 sm:pb-10 ${currentView === 'parent' ? 'max-w-7xl' : 'max-w-6xl'}`}>
        {/* Desktop Navigation Bar */}
        {currentView === 'child' && (
          <div className="hidden sm:flex justify-center items-center mb-6">
            <ChildNavBar
              activeTab={activeTab}
              onSelectTab={t => handleNavigateTab(t)}
              isRewardUnlocked={Boolean(rewardStatus?.canPlay)}
            />
          </div>
        )}

        {currentView === 'parent' ? (
          <div className="min-h-screen">
            <ParentalDashboardView />
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <ChildHomeView
                onNavigateTab={handleNavigateTab}
                onOpenBreathingModal={() => setIsBreathingModalOpen(true)}
              />
            )}
            {activeTab === 'learn' && (
              <ActivitiesCatalogView initialArea={learnAreaFilter} />
            )}
            {activeTab === 'play' && (
              <React.Suspense
                fallback={
                  <div className="py-16 text-center text-sm font-black text-[#303D63] dark:text-[#CBD5E1]">
                    Carregando Parque de Jogos 3D...
                  </div>
                }
              >
                <Games3DHub onGoToJourney={() => handleNavigateTab('learn')} />
              </React.Suspense>
            )}
            {activeTab === 'progress' && <ChildProgressView />}
            {activeTab === 'profile' && <ChildProfileTab />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {currentView === 'child' && (
        <div className="sm:hidden">
          <ChildNavBar
            activeTab={activeTab}
            onSelectTab={t => handleNavigateTab(t)}
            isRewardUnlocked={Boolean(rewardStatus?.canPlay)}
          />
        </div>
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-[#303D63] dark:bg-[#1E293E] text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-soft flex items-center gap-2 animate-fadeIn border border-[#83BCE0]/40">
          <Sparkles size={16} className="text-[#F4E9A9]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PinModal
        isOpen={isParentPinModalOpen}
        onClose={() => setIsParentPinModalOpen(false)}
        onSuccess={() => {
          setIsParentPinModalOpen(false);
          if (pendingParentDestination === 'family-hub') {
            setCurrentView('child');
            setIsFamilyHubOpen(true);
          } else {
            setIsFamilyHubOpen(false);
            setCurrentView('parent');
          }
        }}
        verifyPinFn={unlockParent}
      />

      <ProfileSelectModal
        isOpen={isProfileSelectOpen}
        onClose={() => setIsProfileSelectOpen(false)}
        onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
      />

      <ChildProfileModal
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        onSave={saveChildProfile}
        onDelete={deleteChildProfile}
      />

      {isBreathingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#303D63]/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg">
            <MindfulBreathing
              totalCycles={4}
              onClose={() => setIsBreathingModalOpen(false)}
              onComplete={() => setIsBreathingModalOpen(false)}
            />
          </div>
        </div>
      )}

      {isAboutOpen && <AboutView asModal onClose={closeAbout} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
