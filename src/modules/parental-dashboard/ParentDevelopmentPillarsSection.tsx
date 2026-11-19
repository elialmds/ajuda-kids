import React, { useState, useMemo } from 'react';
import {
  Brain,
  CheckCircle2,
  Heart,
  MessageCircle,
  Music,
  Plus,
  Sparkles,
  Target,
  Trash2
} from 'lucide-react';
import { ActivityCompletionRecord, ChildProfile } from '@/types';
import { ACTIVITIES_DATABASE } from '@/data/activitiesData';
import {
  PEDAGOGICAL_PILLARS,
  SKILL_AREA_DISPLAY
} from '@/design-system/chartAggregators';
import {
  observationsService,
  ParentObservation,
  PedagogicalPillarId
} from '@/services/observationsService';
import { Button } from '@/components/common/Button';

interface ParentDevelopmentPillarsSectionProps {
  child: ChildProfile;
  completions: ActivityCompletionRecord[];
  onObservationChanged?: () => void;
}

const PILLAR_ICONS: Record<PedagogicalPillarId, React.ElementType> = {
  linguagem: MessageCircle,
  raciocinio: Brain,
  atencao: Target,
  coordenacao: Music,
  socioemocional: Heart
};

export const ParentDevelopmentPillarsSection: React.FC<
  ParentDevelopmentPillarsSectionProps
> = ({ child, completions, onObservationChanged }) => {
  const [selectedPillarId, setSelectedPillarId] = useState<PedagogicalPillarId>('linguagem');
  const [noteText, setNoteText] = useState('');
  const [observations, setObservations] = useState<ParentObservation[]>(() =>
    observationsService.getObservations(child.id)
  );

  React.useEffect(() => {
    setObservations(observationsService.getObservations(child.id));
  }, [child.id]);

  const childCompletions = useMemo(
    () => completions.filter(c => c.childId === child.id),
    [completions, child.id]
  );

  const activePillar =
    PEDAGOGICAL_PILLARS.find(p => p.id === selectedPillarId) || PEDAGOGICAL_PILLARS[0];

  const relatedActivities = useMemo(
    () =>
      ACTIVITIES_DATABASE.filter(
        act => activePillar.areas.includes(act.area) && act.ageGroup === child.ageGroup
      ).slice(0, 6),
    [activePillar, child.ageGroup]
  );

  const pillarObservations = useMemo(
    () => observations.filter(o => o.pillarId === activePillar.id),
    [observations, activePillar.id]
  );

  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    observationsService.addObservation({
      childId: child.id,
      pillarId: activePillar.id,
      note: noteText.trim()
    });
    setNoteText('');
    setObservations(observationsService.getObservations(child.id));
    onObservationChanged?.();
  };

  const handleDeleteObservation = (id: string) => {
    observationsService.deleteObservation(id);
    setObservations(observationsService.getObservations(child.id));
    onObservationChanged?.();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Banner (Explicit Non-Clinical Family Framing) */}
      <div className="rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEAFC] dark:bg-[#27234D] text-[#5B35C9] dark:text-[#C7B8FF] text-[11px] font-extrabold">
            <Sparkles size={13} />
            <span>Acompanhamento Pedagógico Familiar</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
            Pilares de Desenvolvimento — {child.name}
          </h2>
          <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] max-w-2xl">
            Organização clara das atividades concluídas e anotações dos responsáveis sobre interesses e avanços cotidianos de {child.name}, em linguagem acolhedora e educativa (sem avaliações clínicas).
          </p>
        </div>
        <div className="px-4 py-2.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] text-right shrink-0">
          <span className="text-[11px] font-bold text-[#77758A] dark:text-[#B8B3D6] block">
            Faixa Etária Ativa
          </span>
          <span className="font-display text-lg font-extrabold text-[#7047E8] dark:text-[#A78BFA]">
            {child.ageGroup} anos
          </span>
        </div>
      </div>

      {/* 5 Pillars Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
        {PEDAGOGICAL_PILLARS.map(pillar => {
          const Icon = PILLAR_ICONS[pillar.id];
          const statsForPillar = childCompletions.filter(c => pillar.areas.includes(c.area));
          const mins = statsForPillar.reduce((acc, item) => acc + (item.durationMinutes || 0), 0);
          const isSelected = activePillar.id === pillar.id;

          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setSelectedPillarId(pillar.id)}
              className={`text-left rounded-[20px] p-4 border-2 transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-white dark:bg-[#27234D] shadow-edtech -translate-y-0.5'
                  : 'bg-white/85 dark:bg-[#1E1B3A] border-[#E4DFF5] dark:border-[#38316B] hover:border-[#C5B8F3]'
              }`}
              style={{
                borderColor: isSelected ? pillar.color : undefined
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: pillar.color }}
                >
                  <Icon size={20} />
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tabular-nums"
                  style={{
                    backgroundColor: `${pillar.color}20`,
                    color: pillar.color
                  }}
                >
                  {statsForPillar.length} concl.
                </span>
              </div>

              <div>
                <h3 className="font-display text-base font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
                  {pillar.title}
                </h3>
                <p className="text-[11px] font-medium text-[#77758A] dark:text-[#B8B3D6] line-clamp-2 mt-0.5">
                  {pillar.subtitle}
                </p>
              </div>

              <div className="text-[11px] font-bold text-[#77758A] dark:text-[#B8B3D6] tabular-nums">
                {mins} min dedicados
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Pillar Detail + Activities + Family Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Related Activities & Real Progress */}
        <div className="lg:col-span-6 rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3
                className="font-display text-lg font-extrabold"
                style={{ color: activePillar.color }}
              >
                Trilha de {activePillar.title}
              </h3>
              <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6]">
                Atividades recomendadas para {child.name} ({child.ageGroup} anos)
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {relatedActivities.map(act => {
              const completedTimes = childCompletions.filter(c => c.activityId === act.id).length;
              const areaMeta = SKILL_AREA_DISPLAY[act.area];
              return (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-[#F5F3FC]/80 dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-[#25233A] dark:text-[#F8F7FF] truncate">
                        {act.title}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                        style={{
                          backgroundColor: `${areaMeta.color}1E`,
                          color: areaMeta.color
                        }}
                      >
                        {areaMeta.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-[#77758A] dark:text-[#B8B3D6] truncate mt-0.5">
                      {act.objective || act.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {completedTimes > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F9F2] dark:bg-[#143328] text-[#177856] dark:text-[#6EE7B7] text-[11px] font-extrabold tabular-nums">
                        <CheckCircle2 size={12} /> {completedTimes}x
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#77758A] dark:text-[#B8B3D6]">
                        {act.durationMinutes} min
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Persisted Parent Pedagogical Observation Notes */}
        <div className="lg:col-span-6 rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech space-y-4">
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
              Diário de Observações da Família
            </h3>
            <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6]">
              Registre comentários práticos sobre o que {child.name} mais gostou ou descobriu em {activePillar.title}.
            </p>
          </div>

          <form onSubmit={handleSaveObservation} className="space-y-3">
            <textarea
              rows={3}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder={`Ex: Hoje ${child.name} se divertiu bastante explorando atividades de ${activePillar.title.toLowerCase()}...`}
              className="w-full rounded-2xl border border-[#DDD6F3] dark:border-[#38316B] bg-[#F5F3FC]/60 dark:bg-[#171430] text-sm text-[#25233A] dark:text-[#F8F7FF] p-3.5 focus:outline-none focus:ring-2 focus:ring-[#7047E8]/40 resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Plus size={14} />}
                disabled={!noteText.trim()}
              >
                Salvar Observação
              </Button>
            </div>
          </form>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {pillarObservations.length === 0 ? (
              <div className="rounded-2xl p-4 bg-[#F5F3FC] dark:bg-[#171430] border border-dashed border-[#D8CCFA] dark:border-[#38316B] text-center text-xs font-medium text-[#77758A] dark:text-[#B8B3D6]">
                Nenhuma observação salva ainda neste pilar para {child.name}.
              </div>
            ) : (
              pillarObservations.map(obs => (
                <div
                  key={obs.id}
                  className="p-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#171430] border border-[#E4DFF5] dark:border-[#38316B] flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7047E8] dark:text-[#A78BFA]">
                      {obs.date.split('-').reverse().join('/')}
                    </span>
                    <p className="text-xs font-semibold text-[#25233A] dark:text-[#F8F7FF] mt-0.5 break-words">
                      {obs.note}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteObservation(obs.id)}
                    title="Remover observação"
                    className="p-1.5 rounded-xl text-[#77758A] hover:text-[#C83265] hover:bg-[#FFF0F5] dark:hover:bg-[#3B1B2B] transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
