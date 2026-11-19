import React from 'react';
import { Gamepad2, Lock, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { ChildProfile, GamePlayRecord, ParentSettings } from '@/types';
import { getCompanionById } from '@/data/charactersData';
import { Game3DId } from '@/design-system/tokens';

interface ParentGamesOverviewSectionProps {
  child: ChildProfile | null;
  gamesHistory: GamePlayRecord[];
  parentSettings: ParentSettings | null;
  onGoToParentalControls: () => void;
}

interface ParentGameMeta {
  id: Game3DId;
  title: string;
  subtitle: string;
  pedagogicalFocus: string;
  guardianId: string;
  accent: string;
}

const PARENT_GAMES_CATALOG: ParentGameMeta[] = [
  {
    id: 'batata-quente',
    title: 'Batata Quente 3D',
    subtitle: 'Roda Musical & Ritmo',
    pedagogicalFocus: 'Estimula atenção auditiva, tempo de reação e convivência em grupo.',
    guardianId: 'Pipoca',
    accent: '#FF9B42'
  },
  {
    id: 'pato-ganso',
    title: 'Pato, Pato, Ganso 3D',
    subtitle: 'Parque com Circuito Vivo',
    pedagogicalFocus: 'Trabalha antecipação visual, agilidade motora e percepção espacial.',
    guardianId: 'Pipoca',
    accent: '#FFD34E'
  },
  {
    id: 'morto-vivo',
    title: 'Morto ou Vivo 3D',
    subtitle: 'Controle Inibitório & Reflexo',
    pedagogicalFocus: 'Desenvolve autocontrole, escuta ativa e resposta corporal rápida.',
    guardianId: 'Maya',
    accent: '#36C995'
  },
  {
    id: 'jogo-memoria',
    title: 'Jogo da Memória 3D',
    subtitle: 'Mesa Espacial de Pares',
    pedagogicalFocus: 'Fortalece memória de trabalho visual, associação e paciência.',
    guardianId: 'Teo',
    accent: '#4389F5'
  },
  {
    id: 'sequencia-cores',
    title: 'Sequência de Cores 3D',
    subtitle: 'Pódio Musical Luminoso',
    pedagogicalFocus: 'Treina memória sequencial auditiva-visual e padrões lógicos.',
    guardianId: 'Lumi',
    accent: '#7047E8'
  },
  {
    id: 'simon-says',
    title: 'O Mestre Mandou 3D',
    subtitle: 'Desafios de Imitação Guiada',
    pedagogicalFocus: 'Combina compreensão de comandos curtos com consciência corporal.',
    guardianId: 'Sol',
    accent: '#F16E9A'
  }
];

export const ParentGamesOverviewSection: React.FC<ParentGamesOverviewSectionProps> = ({
  child,
  gamesHistory,
  parentSettings,
  onGoToParentalControls
}) => {
  const isUnlimited = Boolean(parentSettings?.unlimitedGames);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-[24px] p-5 sm:p-6 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2E6] dark:bg-[#362317] text-[#C6630C] dark:text-[#FF9B42] text-[11px] font-extrabold">
            <Gamepad2 size={13} />
            <span>Curadoria de Jogos Educativos 3D</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
            Parque de Jogos 3D {child ? `— ${child.name}` : ''}
          </h2>
          <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] max-w-2xl">
            Acompanhe os 6 minijogos interativos, sua finalidade lúdica e quantas partidas reais foram registradas por {child?.name || 'sua criança'}.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToParentalControls}
          className="px-4 py-2.5 rounded-2xl bg-[#EFEAFC] dark:bg-[#27234D] border border-[#D8CCFA] dark:border-[#38316B] text-xs font-extrabold text-[#5B35C9] dark:text-[#C7B8FF] hover:opacity-90 transition-opacity shrink-0 flex items-center gap-2"
        >
          {isUnlimited ? <Sparkles size={15} className="text-[#36C995]" /> : <Lock size={15} />}
          <span>{isUnlimited ? 'Modo Livre Ativo' : 'Regra: 3 bônus pós-jornada'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PARENT_GAMES_CATALOG.map(game => {
          const companion = getCompanionById(game.guardianId);
          const plays = gamesHistory.filter(g => g.gameId === game.id);
          const totalSecs = plays.reduce((acc, p) => acc + (p.durationSeconds || 0), 0);
          const totalMins = Math.round(totalSecs / 60);

          return (
            <div
              key={game.id}
              className="rounded-[22px] p-5 bg-white dark:bg-[#1E1B3A] border border-[#E4DFF5] dark:border-[#38316B] shadow-edtech flex flex-col justify-between gap-4 hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/50 shadow-xs shrink-0"
                    style={{ backgroundColor: `${game.accent}22` }}
                  >
                    {companion.renderCharacter(38, 'happy')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-extrabold text-[#25233A] dark:text-[#F8F7FF] truncate">
                      {game.title}
                    </h3>
                    <span className="text-[11px] font-bold text-[#77758A] dark:text-[#B8B3D6] block truncate">
                      {game.subtitle}
                    </span>
                  </div>
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0"
                  style={{
                    backgroundColor: isUnlimited ? '#E6F9F2' : '#EFEAFC',
                    color: isUnlimited ? '#177856' : '#5B35C9'
                  }}
                >
                  {isUnlimited ? 'Liberado' : 'Após Jornada'}
                </span>
              </div>

              <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] leading-relaxed">
                {game.pedagogicalFocus}
              </p>

              <div className="pt-3 border-t border-[#E4DFF5] dark:border-[#38316B] flex items-center justify-between text-xs font-extrabold tabular-nums">
                <span className="flex items-center gap-1.5 text-[#25233A] dark:text-[#F8F7FF]">
                  <CheckCircle2 size={14} className="text-[#36C995]" />
                  {plays.length} {plays.length === 1 ? 'partida' : 'partidas'}
                </span>
                <span className="flex items-center gap-1 text-[#77758A] dark:text-[#B8B3D6]">
                  <Clock size={13} /> {totalMins} min
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
