import React, { useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  LogOut,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  Smartphone,
  Award,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '@/modules/context/AppContext';
import { ChildProfile } from '@/types';
import { getKidCharacter, getCompanionById, MUNDO_COMPANIONS } from '@/data/charactersData';
import { storageService } from '@/services/storageService';
import { getSkillAreaIcon, StarSymbolSvg } from '@/components/illustrations/CustomIcons';
import { AmbientAdultBackdrop } from '@/components/illustrations/ThematicPageBackgrounds';
import { EliteCircularRing } from '@/design-system/EliteCharts';
import { Button } from '@/components/common/Button';
import { AjudaKidsMascot, AjudaKidsBrandBadge } from '@/components/common/AjudaKidsMascot';

interface FamilyWelcomeHubProps {
  onEnterChild: (child: ChildProfile) => void;
  onOpenParentDashboard: () => void;
  onOpenCreateChild: () => void;
}

export const FamilyWelcomeHub: React.FC<FamilyWelcomeHubProps> = ({
  onEnterChild,
  onOpenParentDashboard,
  onOpenCreateChild
}) => {
  const {
    authSession,
    familyAccount,
    childrenList,
    devicesList,
    isDarkMode,
    toggleDarkMode,
    logoutParent
  } = useApp();

  const parentName = authSession?.parentName || familyAccount?.parentName || 'Responsável';
  const firstName = parentName.split(' ')[0];

  const recentCompletions = useMemo(() => {
    const all = storageService.getActivityCompletions();
    return [...all]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5);
  }, [childrenList]);

  const activeDevices = useMemo(
    () => devicesList.filter(d => d.status === 'active'),
    [devicesList]
  );

  const allJourneys = useMemo(() => storageService.getAllJourneys(), [childrenList]);

  const getChildStats = (childId: string) => {
    const completions = storageService.getActivityCompletions(childId);
    const todayMins = storageService.getTodayMinutesSpent(childId);
    const childJourneys = Object.values(allJourneys).filter(j => j.childId === childId);
    const completedJourneys = childJourneys.filter(j => j.isCompleted).length;
    return {
      totalActivities: completions.length,
      todayMins,
      completedJourneys
    };
  };

  return (
    <div className="relative min-h-screen bg-[#F5F3FC] dark:bg-[#121024] text-[#25233A] dark:text-[#F8F7FF] flex flex-col transition-colors">
      <AmbientAdultBackdrop />

      {/* Top Executive Glass Header */}
      <header className="sticky top-0 z-30 surface-glass border-b border-[#E4DFF5] dark:border-[#38316B] px-4 py-3 sm:px-6 shadow-[0_2px_16px_rgba(37,35,58,0.05)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <AjudaKidsBrandBadge
            size={40}
            compact
            subtitle={`Hub da Família • @${authSession?.username || familyAccount?.username || 'familia'}`}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="welcome-theme-toggle"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              aria-label={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              className="h-9 px-2.5 sm:px-3 rounded-2xl bg-white dark:bg-[#1E1B3A] text-[#25233A] dark:text-[#FFD34E] border border-[#E4DFF5] dark:border-[#38316B] hover:bg-[#EFEAFC] dark:hover:bg-[#27234D] flex items-center gap-1.5 text-xs font-extrabold transition-colors"
            >
              {isDarkMode ? <Sun size={15} className="text-[#FFD34E]" /> : <Moon size={15} className="text-[#7047E8]" />}
              <span className="hidden sm:inline">{isDarkMode ? 'Claro' : 'Escuro'}</span>
            </button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<ShieldCheck size={15} className="text-[#FFD34E]" />}
              onClick={onOpenParentDashboard}
            >
              <span className="hidden sm:inline">Painel dos Pais</span>
              <span className="sm:hidden">Pais</span>
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              leftIcon={<LogOut size={15} />}
              onClick={logoutParent}
            >
              <span className="hidden xs:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Hub Body */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Welcome Hero Banner */}
        <section
          className="rounded-[26px] p-6 sm:p-8 bg-gradient-to-r from-[#EFEAFC] via-[#FFFFFF] to-[#EBF3FE] dark:from-[#27234D] dark:via-[#1E1B3A] dark:to-[#171430] border border-[#DDD6F3] dark:border-[#38316B] shadow-edtech flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="shrink-0 animate-floatSlow">
              <AjudaKidsMascot size={92} pose="waving" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#171430] border border-[#DDD6F3] dark:border-[#38316B] text-xs font-extrabold text-[#7047E8] dark:text-[#C7B8FF] shadow-xs">
                <StarSymbolSvg className="w-4 h-4" />
                <span>Bem-vindo ao Hub Familiar</span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#25233A] dark:text-[#F8F7FF] tracking-tight">
                Olá, {firstName}! Quem vai brincar e aprender hoje?
              </h1>
              <p className="text-xs sm:text-sm font-medium text-[#77758A] dark:text-[#B8B3D6] max-w-xl leading-relaxed">
                Escolha o perfil de uma criança para iniciar sua trilha personalizada ou entre no Painel dos Responsáveis para acompanhar evolução, gráficos e rotina.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="accent"
              size="lg"
              leftIcon={<Plus size={18} />}
              onClick={onOpenCreateChild}
            >
              Novo Perfil Infantil
            </Button>
          </div>
        </section>

        {/* Child Profiles Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
              Perfis das Crianças ({childrenList.length})
            </h2>
          </div>

          {childrenList.length === 0 ? (
            <div className="rounded-[24px] p-8 sm:p-10 bg-white dark:bg-[#1E1B3A] border-2 border-dashed border-[#C5B8F3] dark:border-[#38316B] text-center space-y-5 shadow-edtech">
              <div className="flex items-center justify-center gap-3">
                <AjudaKidsMascot size={82} pose="waving" />
                {MUNDO_COMPANIONS.slice(0, 2).map(comp => (
                  <div key={comp.id} className="animate-floatSlow">
                    {comp.renderCharacter(72, 'happy')}
                  </div>
                ))}
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-display text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                  Vamos cadastrar a primeira criança!
                </h3>
                <p className="text-xs sm:text-sm font-medium text-[#77758A] dark:text-[#B8B3D6]">
                  Sua conta familiar já está ativa e protegida. Crie o perfil infantil escolhendo nome, idade e personagem favorito.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="lg"
                leftIcon={<Plus size={20} />}
                onClick={onOpenCreateChild}
              >
                Criar Primeiro Perfil Infantil
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {childrenList.map(child => {
                const char = getKidCharacter(child.avatar);
                const comp = getCompanionById(child.companionId || char.companionId);
                const stats = getChildStats(child.id);
                const dailyLimit = familyAccount?.settings?.maxDailyMinutes || 30;

                return (
                  <div
                    key={child.id}
                    className="rounded-[22px] p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative p-2 rounded-[20px] bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#D8CCFA] dark:border-[#4B428A]">
                        {char.renderAvatar(72)}
                        <div
                          title={`Guardião: ${comp.name}`}
                          className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#7047E8] flex items-center justify-center shadow-sm"
                        >
                          {comp.renderCharacter(30, 'happy')}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E6F9F2] dark:bg-[#153429] border border-[#8DE3C4] dark:border-[#246950] text-[#177856] dark:text-[#6EE7B7] text-[10px] font-extrabold uppercase">
                          {child.age} anos • Faixa {child.ageGroup}
                        </span>
                        <h3 className="font-display text-2xl font-extrabold truncate mt-1 text-[#25233A] dark:text-[#F8F7FF]">
                          {child.nickname || child.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#77758A] dark:text-[#B8B3D6] truncate">
                          Guardião: {comp.name}
                        </p>
                      </div>
                    </div>

                    {/* Mini stats row with Circular Daily Gauge */}
                    <div className="grid grid-cols-3 gap-2 items-center text-center bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] rounded-2xl p-3">
                      <div className="flex justify-center">
                        <EliteCircularRing
                          value={stats.todayMins}
                          max={dailyLimit}
                          size={48}
                          strokeWidth={5}
                          accentColor="#7047E8"
                          centerLabel={`${stats.todayMins}m`}
                          caption="Hoje"
                        />
                      </div>
                      <div className="border-x border-[#E4DFF5] dark:border-[#38316B] px-1">
                        <span className="text-[10px] font-bold text-[#77758A] dark:text-[#B8B3D6] block">
                          Missões
                        </span>
                        <span className="font-executive text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF] tabular-nums">
                          {stats.totalActivities}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#77758A] dark:text-[#B8B3D6] block">
                          Jornadas
                        </span>
                        <span className="font-executive text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF] tabular-nums">
                          {stats.completedJourneys}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      className="w-full"
                      leftIcon={<Play size={16} fill="white" />}
                      onClick={() => onEnterChild(child)}
                    >
                      Entrar no Mundo de {child.nickname || child.name}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom 3 Family Summary Columns */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-10">
          {/* Card 1: Recent Activities */}
          <div className="rounded-[28px] p-5 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] ak-card-3d space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#36C995]" />
                <h3 className="font-display text-base font-bold text-[#25233A] dark:text-white">
                  Atividades Recentes
                </h3>
              </div>
              <span className="text-[11px] font-extrabold text-[#7047E8] dark:text-[#C4B5FD] tabular-nums">
                {recentCompletions.length} registros
              </span>
            </div>

            {recentCompletions.length === 0 ? (
              <p className="text-xs font-semibold text-[#5A6D91] dark:text-[#94A3B8] py-4 text-center">
                As atividades concluídas pelas crianças aparecerão aqui em tempo real.
              </p>
            ) : (
              <div className="space-y-2">
                {recentCompletions.map(item => {
                  const kid = childrenList.find(c => c.id === item.childId);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B]"
                    >
                      {getSkillAreaIcon(item.area, 'w-7 h-7 shrink-0')}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-[#25233A] dark:text-white truncate">
                          {item.activityTitle}
                        </p>
                        <span className="text-[10px] font-bold text-[#77758A] dark:text-[#B8B3D6] tabular-nums">
                          {kid?.name || 'Criança'} • +{item.score} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 2: Children Progress Overview */}
          <div className="rounded-[28px] p-5 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] ak-card-3d space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#7047E8] dark:text-[#A78BFA]" />
                <h3 className="font-display text-base font-bold text-[#25233A] dark:text-white">
                  Progresso da Família
                </h3>
              </div>
              <button
                type="button"
                onClick={onOpenParentDashboard}
                className="text-xs font-extrabold text-[#7047E8] dark:text-[#C4B5FD] hover:underline flex items-center"
              >
                Detalhes <ChevronRight size={14} />
              </button>
            </div>

            {childrenList.length === 0 ? (
              <p className="text-xs font-semibold text-[#77758A] dark:text-[#B8B3D6] py-4 text-center">
                Crie um perfil infantil para acompanhar tempo diário e habilidades.
              </p>
            ) : (
              <div className="space-y-2.5">
                {childrenList.map(c => {
                  const st = getChildStats(c.id);
                  const maxMin = familyAccount?.settings?.maxDailyMinutes || 30;
                  const pct = Math.min(100, Math.round((st.todayMins / maxMin) * 100));
                  return (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                        <span className="flex items-center gap-1.5 text-[#25233A] dark:text-white">
                          <Clock size={13} className="text-[#4389F5] dark:text-[#70C4FF]" />
                          {c.name}
                        </span>
                        <span className="text-[#77758A] dark:text-[#B8B3D6]">
                          {st.todayMins} / {maxMin} min
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#F5F3FC] dark:bg-[#121024] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7047E8] via-[#4389F5] to-[#36C995] transition-all duration-500"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: Connected Devices */}
          <div className="rounded-[28px] p-5 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] ak-card-3d space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-[#0E6B4B] dark:text-[#6EE7B7]" />
                <h3 className="font-display text-base font-bold text-[#25233A] dark:text-white">
                  Dispositivos Conectados
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E9F9F0] dark:bg-[#163D34] border border-[#36C995]/50 text-[#0E6B4B] dark:text-[#6EE7B7] text-[10px] font-extrabold tabular-nums">
                {activeDevices.length} ativos
              </span>
            </div>

            {activeDevices.length === 0 ? (
              <div className="py-3 text-center space-y-2">
                <p className="text-xs font-semibold text-[#77758A] dark:text-[#B8B3D6]">
                  Conecte o tablet ou celular da criança usando QR Code ou código único no Painel dos Pais.
                </p>
                <button
                  type="button"
                  onClick={onOpenParentDashboard}
                  className="text-xs font-extrabold text-[#7047E8] dark:text-[#C4B5FD] hover:underline"
                >
                  Gerar Código de Pareamento
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {activeDevices.slice(0, 3).map(dev => {
                  const linkedChild = childrenList.find(c => c.id === dev.childId);
                  return (
                    <div
                      key={dev.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B]"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#25233A] dark:text-white truncate">
                          {dev.deviceName}
                        </p>
                        <span className="text-[10px] font-bold text-[#77758A] dark:text-[#B8B3D6]">
                          {dev.platform} • {linkedChild?.name || 'Criança'}
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#36C995] shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
