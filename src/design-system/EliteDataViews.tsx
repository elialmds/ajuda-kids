import React, { useMemo, useState } from 'react';
import { ActivityCompletionRecord, ChildDevice, ChildProfile, SkillArea } from '@/types';
import { WORLD_TOKENS, useDocumentDarkMode } from '@/design-system/tokens';
import { getSkillAreaIcon } from '@/components/illustrations/CustomIcons';
import { EliteSearchInput, EliteSelect } from '@/design-system/EliteForms';
import { Button } from '@/components/common/Button';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Smartphone,
  Sparkles,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export type CompletionSortField = 'date' | 'title' | 'duration' | 'score';
export type SortDirection = 'asc' | 'desc';

export function filterAndSortCompletions(
  records: ActivityCompletionRecord[],
  options: {
    searchQuery?: string;
    areaFilter?: SkillArea | 'all';
    childFilter?: string;
    sortField?: CompletionSortField;
    sortDirection?: SortDirection;
  }
): ActivityCompletionRecord[] {
  const {
    searchQuery = '',
    areaFilter = 'all',
    childFilter = 'all',
    sortField = 'date',
    sortDirection = 'desc'
  } = options;

  const q = searchQuery.trim().toLowerCase();

  const filtered = records.filter((item) => {
    if (areaFilter !== 'all' && item.area !== areaFilter) return false;
    if (childFilter !== 'all' && item.childId !== childFilter) return false;
    if (q) {
      const worldLabel = WORLD_TOKENS[item.area]?.shortLabel.toLowerCase() || '';
      const matchTitle = item.activityTitle.toLowerCase().includes(q);
      const matchArea = worldLabel.includes(q);
      if (!matchTitle && !matchArea) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'date') {
      cmp = new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
    } else if (sortField === 'title') {
      cmp = a.activityTitle.localeCompare(b.activityTitle, 'pt-BR');
    } else if (sortField === 'duration') {
      cmp = a.durationMinutes - b.durationMinutes;
    } else if (sortField === 'score') {
      cmp = a.score - b.score;
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  return sorted;
}

interface EliteActivityHistoryTableProps {
  records: ActivityCompletionRecord[];
  childrenList: ChildProfile[];
  title?: string;
  pageSize?: number;
}

export const EliteActivityHistoryTable: React.FC<EliteActivityHistoryTableProps> = ({
  records,
  childrenList,
  title = 'Histórico Estruturado de Atividades',
  pageSize = 8
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<SkillArea | 'all'>('all');
  const [childFilter, setChildFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<CompletionSortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const isDark = useDocumentDarkMode();

  const processed = useMemo(
    () =>
      filterAndSortCompletions(records, {
        searchQuery,
        areaFilter,
        childFilter,
        sortField,
        sortDirection
      }),
    [records, searchQuery, areaFilter, childFilter, sortField, sortDirection]
  );

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = processed.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (field: CompletionSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'title' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="ak-card-3d rounded-[30px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-[0_1px_2px_rgba(37,35,58,0.03),0_10px_24px_rgba(37,35,58,0.05)] dark:shadow-[0_14px_32px_rgba(4,6,18,0.55)] space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="ak-title-display font-executive text-lg font-extrabold text-[#25233A] dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6]">
            Busca, filtros por área ou criança, ordenação por coluna e sincronização em tempo real
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <EliteSearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar atividade..."
            className="w-full sm:w-52"
          />

          <EliteSelect
            value={areaFilter}
            onChange={(val) => {
              setAreaFilter(val as SkillArea | 'all');
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'Todas as Áreas' },
              { value: 'communication', label: 'Comunicação' },
              { value: 'reasoning', label: 'Lógica' },
              { value: 'math', label: 'Matemática' },
              { value: 'attention', label: 'Atenção' },
              { value: 'emotional', label: 'Emoções' },
              { value: 'motor', label: 'Movimento' },
              { value: 'creativity', label: 'Criatividade' },
              { value: 'knowledge', label: 'Conhecimentos' },
              { value: 'music', label: 'Música' },
              { value: 'languages', label: 'Idiomas' }
            ]}
          />

          {childrenList.length > 1 && (
            <EliteSelect
              value={childFilter}
              onChange={(val) => {
                setChildFilter(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'Todos os Filhos' },
                ...childrenList.map((c) => ({ value: c.id, label: c.name }))
              ]}
            />
          )}
        </div>
      </div>

      {processed.length === 0 ? (
        <div className="py-10 px-4 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border border-dashed border-[#DDD6F3] dark:border-[#38316B] text-center space-y-2">
          <Sparkles size={22} className="mx-auto text-[#7047E8] dark:text-[#B5A0FF]" />
          <p className="text-xs font-extrabold text-[#25233A] dark:text-white">
            {records.length === 0
              ? 'Nenhuma atividade concluída registrada ainda'
              : 'Nenhuma atividade corresponde aos filtros selecionados'}
          </p>
          <p className="text-[11px] font-semibold text-[#77758A] dark:text-[#C5BFE6]">
            {records.length === 0
              ? 'As atividades concluídas pelas crianças aparecerão aqui automaticamente.'
              : 'Tente limpar a busca ou selecionar todas as áreas.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Structured Data Table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#E4DFF5] dark:border-[#38316B]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F3FC] dark:bg-[#121024] border-b border-[#E4DFF5] dark:border-[#38316B] text-[11px] font-extrabold uppercase tracking-wider text-[#77758A] dark:text-[#C5BFE6]">
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('title')}
                      className="inline-flex items-center gap-1 hover:text-[#25233A] dark:hover:text-white"
                    >
                      <span>Atividade</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="py-3 px-3">Criança</th>
                  <th className="py-3 px-3">Área</th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => handleSort('duration')}
                      className="inline-flex items-center gap-1 hover:text-[#25233A] dark:hover:text-white"
                    >
                      <span>Duração</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => handleSort('score')}
                      className="inline-flex items-center gap-1 hover:text-[#25233A] dark:hover:text-white"
                    >
                      <span>Desempenho</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('date')}
                      className="inline-flex items-center gap-1 hover:text-[#25233A] dark:hover:text-white"
                    >
                      <span>Concluída em</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEAF8] dark:divide-[#27234D] text-xs font-semibold text-[#25233A] dark:text-[#F8FAFC]">
                {pageItems.map((item) => {
                  const childObj = childrenList.find((c) => c.id === item.childId);
                  const world = WORLD_TOKENS[item.area];
                  const dt = new Date(item.completedAt);

                  return (
                    <tr key={item.id} className="table-row-elite hover:bg-[#FAF8FF] dark:hover:bg-[#27234D]/70">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="ak-sticker-badge w-7 h-7 rounded-lg bg-[#F5F3FC] dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-center shrink-0">
                            {getSkillAreaIcon(item.area, 'w-5 h-5')}
                          </div>
                          <span className="font-extrabold text-[#25233A] dark:text-white truncate max-w-[240px]">
                            {item.activityTitle}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#77758A] dark:text-[#C5BFE6]">
                        {childObj?.name || 'Criança'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          style={{
                            backgroundColor: isDark
                              ? world?.darkCardBg || '#27234D'
                              : world?.cardBg || '#F3EFFF',
                            color: isDark
                              ? world?.darkBadgeText || '#C4B5FD'
                              : world?.badgeText || '#7047E8',
                            borderColor: isDark
                              ? world?.darkCardBorder || '#38316B'
                              : world?.cardBorder || '#DDD6F3'
                          }}
                          className="inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold whitespace-nowrap"
                        >
                          {world?.shortLabel || item.area}
                        </span>
                      </td>
                      <td className="py-3 px-3 tabular-nums text-[#5A6D91] dark:text-[#CBD5E1]">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {item.durationMinutes} min
                        </span>
                      </td>
                      <td className="py-3 px-3 tabular-nums">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCF5D2] dark:bg-[#133A27] border border-[#8ED97A] dark:border-[#25D366]/60 text-[#1E6917] dark:text-[#86EFAC] text-[11px] font-extrabold">
                          <CheckCircle2 size={11} />
                          {item.score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#5A6D91] dark:text-[#CBD5E1]">
                        {dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às{' '}
                        {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards Fallback */}
          <div className="md:hidden space-y-2.5">
            {pageItems.map((item) => {
              const childObj = childrenList.find((c) => c.id === item.childId);
              const world = WORLD_TOKENS[item.area];
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getSkillAreaIcon(item.area, 'w-7 h-7 shrink-0')}
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold text-[#7047E8] dark:text-[#B5A0FF] block truncate">
                        {childObj?.name || 'Criança'} • {world?.shortLabel || item.area}
                      </span>
                      <p className="text-xs font-extrabold text-[#25233A] dark:text-white truncate">
                        {item.activityTitle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <span className="block text-xs font-extrabold text-[#1E7E5B] dark:text-[#4ADE80]">
                      {item.score}%
                    </span>
                    <span className="text-[10px] font-semibold text-[#77758A] dark:text-[#C5BFE6]">
                      {item.durationMinutes} min
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-2 text-xs font-bold text-[#77758A] dark:text-[#C5BFE6]">
              <span className="tabular-nums">
                Exibindo {(safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, processed.length)} de {processed.length} registros
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft size={14} />}
                >
                  Anterior
                </Button>
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F3FC] dark:bg-[#27234D] text-[#25233A] dark:text-white font-extrabold tabular-nums">
                  {safePage}/{totalPages}
                </span>
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  rightIcon={<ChevronRight size={14} />}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface EliteDevicesTableProps {
  devices: ChildDevice[];
  childrenList: ChildProfile[];
  onRevokeDevice: (deviceId: string) => void;
}

export const EliteDevicesTable: React.FC<EliteDevicesTableProps> = ({
  devices,
  childrenList,
  onRevokeDevice
}) => {
  return (
    <div className="ak-card-3d rounded-[30px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-[0_1px_2px_rgba(37,35,58,0.03),0_10px_24px_rgba(37,35,58,0.05)] dark:shadow-[0_14px_32px_rgba(4,6,18,0.55)] space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="ak-title-display font-executive text-lg font-extrabold text-[#25233A] dark:text-white">
            Dispositivos Conectados à Família
          </h3>
          <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6]">
            Controle de sessão e revogação instantânea dos aparelhos infantis pareados
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#F3EFFF] dark:bg-[#27234D] border border-[#DDD6F3] dark:border-[#38316B] text-xs font-extrabold text-[#7047E8] dark:text-[#C4B5FD] tabular-nums">
          {devices.filter((d) => d.status === 'active').length} ativos
        </span>
      </div>

      {devices.length === 0 ? (
        <div className="py-8 px-4 rounded-2xl bg-[#F5F3FC] dark:bg-[#121024] border border-dashed border-[#DDD6F3] dark:border-[#38316B] text-center space-y-1.5">
          <Smartphone size={22} className="mx-auto text-[#7047E8] dark:text-[#B5A0FF]" />
          <p className="text-xs font-extrabold text-[#25233A] dark:text-white">
            Nenhum dispositivo externo pareado ainda
          </p>
          <p className="text-[11px] font-semibold text-[#77758A] dark:text-[#C5BFE6]">
            Use o gerador de QR Code acima para conectar o tablet ou celular da criança.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#EDEAF8] dark:divide-[#27234D] rounded-2xl border border-[#E4DFF5] dark:border-[#38316B] overflow-hidden">
          {devices.map((dev) => {
            const owner = childrenList.find((c) => c.id === dev.childId);
            const isRevoked = dev.status === 'revoked';

            return (
              <div
                key={dev.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isRevoked
                    ? 'bg-[#F5F3FC] dark:bg-[#121024] opacity-75'
                    : 'bg-white dark:bg-[#1E1B3A] hover:bg-[#FAF8FF] dark:hover:bg-[#27234D]/70'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      isRevoked
                        ? 'bg-[#F1F5F9] dark:bg-[#121024] border-[#E2E8F0] dark:border-[#27234D] text-[#64748B] dark:text-[#94A3B8]'
                        : 'bg-[#F3EFFF] dark:bg-[#27234D] border-[#DDD6F3] dark:border-[#38316B] text-[#7047E8] dark:text-[#B5A0FF]'
                    }`}
                  >
                    <Smartphone size={19} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-[#25233A] dark:text-white truncate">
                        {dev.deviceName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-[#F5F3FC] dark:bg-[#27234D] text-[#77758A] dark:text-[#C5BFE6] text-[10px] font-extrabold">
                        {dev.platform}
                      </span>
                      {!isRevoked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E9FBF4] dark:bg-[#16382C] text-[#1E7E5B] dark:text-[#86EFAC] text-[10px] font-extrabold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#36C995] dark:bg-[#4ADE80]" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE4E6] dark:bg-[#4C1D24] text-[#9F1239] dark:text-[#FDA4AF] text-[10px] font-extrabold">
                          <ShieldAlert size={10} />
                          Revogado
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#77758A] dark:text-[#C5BFE6] mt-0.5 tabular-nums">
                      Vinculado a: <strong className="text-[#25233A] dark:text-white">{owner?.name || 'Família'}</strong> • Última atividade:{' '}
                      {new Date(dev.lastActiveAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {!isRevoked && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onRevokeDevice(dev.id)}
                  >
                    Revogar Acesso
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
