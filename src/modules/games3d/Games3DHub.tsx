import React, { useState } from 'react';
import { useApp } from '@/modules/context/AppContext';
import { gamesService } from '@/services/gamesService';
import { BatataQuente3D } from './BatataQuente3D';
import { PatoPatoGanso3D } from './PatoPatoGanso3D';
import { MortoVivo3D } from './MortoVivo3D';
import { JogoMemoria3D } from './JogoMemoria3D';
import { SequenciaCores3D } from './SequenciaCores3D';
import { SimonSays3D } from './SimonSays3D';
import { MUNDO_COMPANIONS } from '@/data/charactersData';
import { Games3DHeroIllustration } from '@/components/illustrations/HandDrawnIllustrations';
import { Game3DEmblemIcon } from '@/design-system/EliteIcons';
import { GAME3D_TOKENS, Game3DId } from '@/design-system/tokens';
import { StarSymbolSvg } from '@/components/illustrations/CustomIcons';
import {
  Gamepad2,
  Play,
  Compass,
  Pause,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import { audioService } from '@/services/audioService';

interface Games3DHubProps {
  onGoToJourney: () => void;
}

interface Game3DInfo {
  id: Game3DId;
  title: string;
  subtitle: string;
  desc: string;
  howToPlay: string;
  badge: string;
  skillTag: string;
  guardianId: string;
}

const GAMES_3D_LIST: Game3DInfo[] = [
  {
    id: 'batata-quente',
    title: 'Batata Quente 3D',
    subtitle: 'Roda e Ritmo no Gramado',
    desc: 'Cenário tridimensional com 6 amigos em círculo e batata saltando em tempo real com física e rotação.',
    howToPlay: 'Toque em "Passar Batata" rapidamente para enviá-la ao próximo amigo da roda antes que o cronômetro zere!',
    badge: 'Círculo 3D',
    skillTag: 'Agilidade',
    guardianId: 'Pipoca'
  },
  {
    id: 'pato-ganso',
    title: 'Pato, Pato, Ganso 3D',
    subtitle: 'Parque Infantil com Árvores',
    desc: 'Ambiente de parque com árvores 3D, personagens sentados na grama e corrida interativa ao redor da roda.',
    howToPlay: 'Caminhe ao redor da roda tocando nos amigos ("Pato..."). Quando escolher o "Ganso", toque rápido para correr até o lugar vago!',
    badge: 'Parque 3D',
    skillTag: 'Atenção',
    guardianId: 'Pipoca'
  },
  {
    id: 'morto-vivo',
    title: 'Morto ou Vivo 3D',
    subtitle: 'Palco de Reflexo Corporal',
    desc: 'O personagem pula, agacha e executa posturas tridimensionais conforme os comandos de voz em tempo real.',
    howToPlay: 'Ouça e observe o comando: toque em "Ficar em Pé (Vivo)" ou "Agachar (Morto)" acompanhando o personagem 3D!',
    badge: 'Palco 3D',
    skillTag: 'Reflexo',
    guardianId: 'Maya'
  },
  {
    id: 'jogo-memoria',
    title: 'Jogo da Memória 3D',
    subtitle: 'Mesa Espacial de Cartas',
    desc: 'Cartas tridimensionais que giram 180° no espaço em uma mesa de jogos com sombras e efeitos luminosos.',
    howToPlay: 'Toque diretamente nas cartas 3D sobre a mesa para virá-las e encontrar todos os pares iguais!',
    badge: 'Cartas 3D',
    skillTag: 'Memória',
    guardianId: 'Teo'
  },
  {
    id: 'sequencia-cores',
    title: 'Sequência de Cores 3D',
    subtitle: 'Pódio Musical Luminoso',
    desc: 'Plataforma 3D com 4 domos luminosos que acendem com luz pontual, tocam melodias e testam a memória.',
    howToPlay: 'Observe a ordem em que os domos 3D acendem e repetem as notas musicais. Depois, reproduza a mesma sequência!',
    badge: 'Luzes 3D',
    skillTag: 'Sequência',
    guardianId: 'Lumi'
  },
  {
    id: 'simon-says',
    title: 'O Mestre Mandou 3D',
    subtitle: 'O Mestre Coroado no Palco',
    desc: 'Personagem 3D com coroa dourada que executa gestos corporais na tela para treinar atenção seletiva.',
    howToPlay: 'Atenção! Só realize o movimento se a frase começar com "O Mestre Mandou". Se não tiver essa frase, fique parado!',
    badge: 'Mestre 3D',
    skillTag: 'Foco Seletivo',
    guardianId: 'Sol'
  }
];

export const Games3DHub: React.FC<Games3DHubProps> = ({ onGoToJourney }) => {
  const { rewardStatus, activeChild, refreshRewards, refreshProgression, showToast, isDarkMode } = useApp();
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [stagePhase, setStagePhase] = useState<'presentation' | 'playing' | 'paused'>('presentation');
  const [restartNonce, setRestartNonce] = useState<number>(0);

  if (!rewardStatus || !activeChild) {
    return null;
  }

  const { isUnlimited, playsUsedToday, maxPlaysPerDay, journeyCompletedToday } = rewardStatus;
  const playsRemaining = isUnlimited ? Infinity : Math.max(0, maxPlaysPerDay - playsUsedToday);

  const handleSelectGame = (gameId: string) => {
    audioService.playGentlePop();
    setActiveGameId(gameId);
    setStagePhase('presentation');
    setRestartNonce(prev => prev + 1);
  };

  const handleFinishGame = async (durationSeconds: number, score?: number) => {
    if (!activeGameId) return;
    const playRes = await gamesService.recordAndConsumePlay(activeChild.id, activeGameId, durationSeconds, score);
    await refreshRewards();
    await refreshProgression();
    const xpNote = playRes.xpOutcome && playRes.xpOutcome.xpAdded > 0 ? ` (+${playRes.xpOutcome.xpAdded} XP)` : '';
    const unlocked = playRes.xpOutcome?.newlyUnlockedAchievements;
    const badgeNote = unlocked && unlocked.length > 0 ? ` • Nova medalha: ${unlocked[0].title}!` : '';
    showToast(`Partida 3D concluída! Pontuação: ${score || 100} estrelas!${xpNote}${badgeNote}`);
    setActiveGameId(null);
  };

  const activeGameObj = GAMES_3D_LIST.find(g => g.id === activeGameId);

  if (activeGameId && activeGameObj) {
    const guardian =
      MUNDO_COMPANIONS.find(c => c.id === activeGameObj.guardianId) || MUNDO_COMPANIONS[0];
    const token = GAME3D_TOKENS[activeGameObj.id];

    return (
      <div className="max-w-4xl mx-auto space-y-5 pb-20 text-[#25233A] dark:text-[#F8F7FF]">
        {/* Universal 3D Game Top Control Bar */}
        <div
          style={{
            borderColor: isDarkMode ? token.darkBorderColor : token.borderColor,
            boxShadow: isDarkMode ? `0 4px 0 ${token.darkLipColor}` : '0 4px 12px rgba(37, 35, 58, 0.05)'
          }}
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-[22px] bg-white dark:bg-[#1E1B3A] border-2"
        >
          <button
            type="button"
            onClick={() => setActiveGameId(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F3FC] dark:bg-[#27234D] text-xs font-extrabold text-[#25233A] dark:text-white hover:bg-[#ECE7FC] dark:hover:bg-[#38316B] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Parque 3D</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <Game3DEmblemIcon gameId={activeGameObj.id} className="w-7 h-7 shrink-0" />
            <h2 className="font-display text-sm sm:text-base font-extrabold text-[#25233A] dark:text-white truncate">
              {activeGameObj.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                audioService.playGentlePop();
                setRestartNonce(n => n + 1);
                setStagePhase('playing');
              }}
              className="px-3.5 py-2 rounded-xl bg-[#F5F3FC] dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] text-xs font-extrabold text-[#25233A] dark:text-white flex items-center gap-1.5 hover:border-[#7047E8] transition-colors"
              title="Reiniciar Jogo 3D"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>

            {stagePhase === 'playing' && (
              <button
                type="button"
                onClick={() => {
                  audioService.playGentlePop();
                  setStagePhase('paused');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#7047E8] hover:bg-[#5E35D9] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Pause size={14} />
                <span>Pausar</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. PRESENTATION SCREEN FOR THE SELECTED 3D GAME */}
        {stagePhase === 'presentation' && (
          <div
            style={{
              borderColor: isDarkMode ? token.darkBorderColor : token.borderColor,
              boxShadow: isDarkMode
                ? `0 6px 0 ${token.darkLipColor}, 0 14px 30px rgba(3, 6, 18, 0.5)`
                : `0 6px 0 ${token.lipColor}, 0 14px 30px rgba(37, 35, 58, 0.08)`
            }}
            className="ak-card-3d rounded-[26px] p-6 sm:p-10 bg-white dark:bg-[#1E1B3A] border-2 text-center space-y-6 animate-fadeIn"
          >
            <div className="flex items-center justify-center gap-4">
              <div
                style={{
                  background: isDarkMode ? token.darkHeaderGradient : token.headerGradient,
                  borderColor: isDarkMode ? token.darkBorderColor : token.borderColor
                }}
                className="ak-sticker-badge p-4 rounded-[24px] border-2 shadow-sm"
              >
                <Game3DEmblemIcon gameId={activeGameObj.id} className="w-20 h-20" />
              </div>
              <div
                style={{
                  backgroundColor: isDarkMode ? '#27234D' : '#F5F3FC',
                  borderColor: isDarkMode ? token.darkBorderColor : token.borderColor
                }}
                className="p-2.5 rounded-[24px] border-2 shadow-sm"
              >
                {guardian.renderCharacter(92, 'celebrating')}
              </div>
            </div>

            <div className="max-w-lg mx-auto space-y-2">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#7047E8] text-[#FFD34E] text-xs font-extrabold uppercase">
                Experiência 3D • Guardião {guardian.name}
              </span>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#25233A] dark:text-white pt-1">
                {activeGameObj.title}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-[#77758A] dark:text-[#D3CEF0] leading-relaxed">
                {activeGameObj.desc}
              </p>
            </div>

            <div
              style={{
                backgroundColor: isDarkMode ? token.darkBadgeBg : token.badgeBg,
                borderColor: isDarkMode ? token.darkBorderColor : token.borderColor
              }}
              className="max-w-md mx-auto p-4 rounded-[20px] border-2 text-left"
            >
              <span
                style={{ color: isDarkMode ? token.darkSubtitleColor : token.subtitleColor }}
                className="text-[10px] font-extrabold uppercase block mb-1"
              >
                Como Brincar:
              </span>
              <p className="text-xs font-bold text-[#25233A] dark:text-[#F8F7FF] leading-relaxed">
                {activeGameObj.howToPlay}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  audioService.playSuccess();
                  setStagePhase('playing');
                }}
                style={{
                  backgroundColor: token.ctaBg,
                  boxShadow: `0 5px 0 ${token.ctaLip}`
                }}
                className="w-full sm:w-auto px-9 py-4 rounded-[18px] text-white font-extrabold text-base active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5"
              >
                <Play size={18} fill="white" />
                <span>Entrar no Cenário 3D</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. PAUSE OVERLAY MODAL */}
        {stagePhase === 'paused' && (
          <div className="ak-card-3d rounded-[26px] p-8 bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-card text-center space-y-5 animate-fadeIn">
            <h3 className="font-display text-2xl font-extrabold text-[#25233A] dark:text-white">
              Jogo 3D Pausado
            </h3>
            <p className="text-xs sm:text-sm font-medium text-[#77758A] dark:text-[#D3CEF0] max-w-md mx-auto">
              Respire fundo, beba água ou continue sua partida quando quiser!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStagePhase('playing')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-[18px] bg-[#36C995] hover:bg-[#2EB887] border-b-4 border-[#239B71] text-white font-extrabold text-xs transition-all"
              >
                Continuar Brincando
              </button>
              <button
                type="button"
                onClick={() => {
                  setRestartNonce(n => n + 1);
                  setStagePhase('playing');
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-[18px] bg-[#F5F3FC] dark:bg-[#27234D] border-2 border-[#C9BCFF] dark:border-[#493D9E] text-[#7047E8] dark:text-[#D7CBFF] font-extrabold text-xs"
              >
                Reiniciar do Começo
              </button>
              <button
                type="button"
                onClick={() => setActiveGameId(null)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-[18px] bg-white dark:bg-[#121024] border-2 border-[#E4DFF5] dark:border-[#38316B] text-[#25233A] dark:text-white font-extrabold text-xs"
              >
                Sair para o Parque
              </button>
            </div>
          </div>
        )}

        {/* 3. ACTIVE 3D WEBGL SCENE */}
        {stagePhase === 'playing' && (
          <div key={restartNonce}>
            {activeGameId === 'batata-quente' && (
              <BatataQuente3D onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />
            )}
            {activeGameId === 'pato-ganso' && (
              <PatoPatoGanso3D onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />
            )}
            {activeGameId === 'morto-vivo' && (
              <MortoVivo3D onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />
            )}
            {activeGameId === 'jogo-memoria' && (
              <JogoMemoria3D onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />
            )}
            {activeGameId === 'sequencia-cores' && (
              <SequenciaCores3D onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />
            )}
            {activeGameId === 'simon-says' && (
              <SimonSays3D onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 text-[#25233A] dark:text-[#F8F7FF]">
      {/* 1. Hero do Parque 3D */}
      <div className="rounded-[26px] p-6 sm:p-9 bg-gradient-to-br from-[#7047E8] via-[#5B38D6] to-[#4389F5] dark:from-[#282158] dark:via-[#1E1B3A] dark:to-[#182952] text-white border-2 border-[#5933CC] dark:border-[#493D9E] shadow-[0_7px_0_#4E2CB8,0_16px_32px_rgba(112,71,232,0.22)] dark:shadow-[0_7px_0_#0D1024,0_16px_32px_rgba(3,6,18,0.5)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 mb-2 px-3.5 py-1 rounded-full bg-[#36C995] text-white text-xs font-extrabold shadow-sm">
              <Gamepad2 size={14} />
              <span>Parque de Brincadeiras 3D • WebGL</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Mundo de Jogos 3D
            </h1>
            <p className="text-xs sm:text-sm text-[#EEF2FF] mt-2 leading-relaxed font-medium">
              Explore 6 cenários interativos com personagens expressivos e desafios de atenção, memória e movimento.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5">
              <div className="px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center gap-2 text-xs font-extrabold text-white">
                <StarSymbolSvg className="w-5 h-5" />
                <span>
                  {isUnlimited
                    ? 'Modo Livre Ilimitado Ativo'
                    : journeyCompletedToday
                    ? `${playsRemaining} de ${maxPlaysPerDay} partidas bônus hoje`
                    : 'Modo Exploração 3D Disponível'}
                </span>
              </div>

              {!journeyCompletedToday && (
                <button
                  type="button"
                  onClick={onGoToJourney}
                  className="px-4 py-2 rounded-2xl bg-[#FFD34E] text-[#25233A] text-xs font-extrabold border-b-4 border-[#D89B00] flex items-center gap-1.5 hover:bg-[#FFCA2C] transition-all"
                >
                  <Compass size={14} />
                  <span>Completar Trilha (+3 Bônus)</span>
                </button>
              )}
            </div>
          </div>

          <div className="shrink-0 p-3.5 rounded-[24px] bg-white/15 border border-white/25 backdrop-blur-sm">
            <Games3DHeroIllustration size={126} />
          </div>
        </div>
      </div>

      {/* 2. Galeria dos 6 Jogos 3D */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {GAMES_3D_LIST.map(game => {
          const guardian =
            MUNDO_COMPANIONS.find(c => c.id === game.guardianId) || MUNDO_COMPANIONS[0];
          const token = GAME3D_TOKENS[game.id];

          return (
            <div
              key={game.id}
              onClick={() => handleSelectGame(game.id)}
              style={{
                borderColor: isDarkMode ? token.darkBorderColor : token.borderColor,
                boxShadow: isDarkMode
                  ? `0 5px 0 ${token.darkLipColor}, 0 12px 24px rgba(3, 6, 18, 0.45)`
                  : `0 5px 0 ${token.lipColor}, 0 12px 24px rgba(37, 35, 58, 0.06)`
              }}
              className="ak-card-3d group rounded-[24px] overflow-hidden bg-white dark:bg-[#1E1B3A] border-2 hover:-translate-y-1 active:translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              {/* Colorful Scenic Header Banner with Illustrated Game Emblem + Guardian */}
              <div>
                <div
                  style={{ background: isDarkMode ? token.darkHeaderGradient : token.headerGradient }}
                  className="px-5 pt-5 pb-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-3 relative"
                >
                  <div className="ak-sticker-badge w-16 h-16 rounded-[20px] bg-white dark:bg-[#27234D] border-2 border-white dark:border-[#38316B] shadow-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-2">
                    <Game3DEmblemIcon gameId={game.id} className="w-12 h-12" />
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{
                          backgroundColor: isDarkMode ? token.darkBadgeBg : token.badgeBg,
                          color: isDarkMode ? token.darkBadgeText : token.badgeText,
                          borderColor: isDarkMode ? token.darkBorderColor : token.borderColor
                        }}
                        className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shadow-sm"
                      >
                        {game.badge}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white dark:bg-[#27234D] text-[#25233A] dark:text-[#F8F7FF] border border-black/10 dark:border-white/15 shadow-sm">
                        {game.skillTag}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/95 dark:bg-[#27234D]/95 pl-1 pr-2.5 py-0.5 rounded-full border border-white dark:border-[#38316B] shadow-sm">
                      {guardian.renderCharacter(26, 'happy')}
                      <span className="text-[10px] font-extrabold text-[#25233A] dark:text-white">
                        {guardian.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 pb-3">
                  <h3 className="font-display font-extrabold text-xl text-[#25233A] dark:text-white mb-0.5 leading-snug">
                    {game.title}
                  </h3>
                  <span
                    style={{ color: isDarkMode ? token.darkSubtitleColor : token.subtitleColor }}
                    className="text-xs font-extrabold block mb-2"
                  >
                    {game.subtitle}
                  </span>
                  <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] leading-relaxed">
                    {game.desc}
                  </p>
                </div>
              </div>

              {/* Footer Action */}
              <div className="px-5 py-3.5 bg-[#F5F3FC] dark:bg-[#27234D] border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-[#77758A] dark:text-[#B8B3D6]">
                  Com Guardião {guardian.name}
                </span>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleSelectGame(game.id);
                  }}
                  style={{
                    backgroundColor: token.ctaBg,
                    boxShadow: `0 3px 0 ${token.ctaLip}`
                  }}
                  className="px-4 py-2 rounded-[14px] text-white font-extrabold text-xs flex items-center gap-1.5 active:translate-y-0.5 transition-all"
                >
                  <Play size={12} fill="white" />
                  <span>Abrir 3D</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
