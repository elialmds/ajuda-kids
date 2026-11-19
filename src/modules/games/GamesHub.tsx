import React, { useState } from 'react';
import { useApp } from '@/modules/context/AppContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GAMES_CATALOG, gamesService } from '@/services/gamesService';
import { GameInfo } from '@/types';
import { BatataQuenteGame } from './BatataQuenteGame';
import { PatoPatoGansoGame } from './PatoPatoGansoGame';
import { MortoVivoGame } from './MortoVivoGame';
import { JogoMemoriaGame } from './JogoMemoriaGame';
import { SequenciaCoresGame } from './SequenciaCoresGame';
import { SimonSaysGame } from './SimonSaysGame';
import { DesafioObservacaoGame } from './DesafioObservacaoGame';
import {
  Gamepad2,
  Play,
  Lock,
  Sparkles,
  Compass,
  Infinity as InfinityIcon
} from 'lucide-react';
import { Game3DEmblemIcon } from '@/design-system/EliteIcons';
import { AttentionSvgIcon } from '@/components/illustrations/CustomIcons';
import { Games3DHeroIllustration } from '@/components/illustrations/HandDrawnIllustrations';
import { audioService } from '@/services/audioService';

interface GamesHubProps {
  onGoToJourney: () => void;
}

const renderGameBadge3D = (gameId: string) => {
  if (gameId === 'desafio-observacao') {
    return <AttentionSvgIcon className="w-11 h-11" />;
  }
  return <Game3DEmblemIcon gameId={gameId} className="w-11 h-11" />;
};

export const GamesHub: React.FC<GamesHubProps> = ({ onGoToJourney }) => {
  const { rewardStatus, activeChild, refreshRewards, parentSettings } = useApp();
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  if (!rewardStatus || !activeChild) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-semibold text-[#77758A] dark:text-[#C5BFE6]">Carregando Hora de Brincar...</p>
      </div>
    );
  }

  const { canPlay, isUnlimited, playsUsedToday, maxPlaysPerDay, reason, journeyCompletedToday } =
    rewardStatus;
  const playsRemaining = isUnlimited ? Infinity : Math.max(0, maxPlaysPerDay - playsUsedToday);

  const handleLaunchGame = (game: GameInfo) => {
    if (!canPlay && !isUnlimited) {
      audioService.playBellTone(280, 0.3);
      return;
    }
    audioService.playGentlePop();
    setActiveGameId(game.id);
  };

  const handleFinishGame = async (durationSeconds: number, score?: number) => {
    if (!activeGameId) return;

    await gamesService.recordAndConsumePlay(activeChild.id, activeGameId, durationSeconds, score);
    await refreshRewards();
    setActiveGameId(null);
  };

  // Render active game
  if (activeGameId) {
    switch (activeGameId) {
      case 'batata-quente':
        return <BatataQuenteGame onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />;
      case 'pato-ganso':
        return <PatoPatoGansoGame onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />;
      case 'morto-vivo':
        return <MortoVivoGame onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />;
      case 'jogo-memoria':
        return <JogoMemoriaGame onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />;
      case 'sequencia-cores':
        return <SequenciaCoresGame onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />;
      case 'simon-says':
        return <SimonSaysGame onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />;
      case 'desafio-observacao':
        return <DesafioObservacaoGame onFinishGame={handleFinishGame} onExit={() => setActiveGameId(null)} />;
      default:
        return null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <Card className="ak-card-3d border-2 border-[#E4DFF5] dark:border-[#38316B] bg-gradient-to-br from-white via-[#FAF8FF] to-[#FFF4D6]/60 dark:from-[#27234D] dark:via-[#1E1B3A] dark:to-[#171430]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="ak-sticker-badge w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FFF4D6] to-[#FFE08A] dark:from-[#38316B] dark:to-[#27234D] flex items-center justify-center shadow-sticker shrink-0">
              <Games3DHeroIllustration size={56} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="ak-title-display text-2xl sm:text-3xl font-black text-[#25233A] dark:text-white">Hora de Brincar</h1>
                {isUnlimited && (
                  <span className="flex items-center gap-1 text-[11px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    <InfinityIcon size={12} /> Ilimitado
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#77758A] dark:text-[#C5BFE6]">
                Jogos divertidos, cooperativos e educativos para relaxar
              </p>
            </div>
          </div>

          {/* Reward Status Pill */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#27234D] px-4 py-2.5 rounded-2xl border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-sticker self-start sm:self-auto">
            <Sparkles size={18} className="text-amber-500" />
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#77758A] dark:text-[#C5BFE6] block">
                Jogadas de hoje
              </span>
              <span className="text-sm font-black text-[#25233A] dark:text-white">
                {isUnlimited ? 'Ilimitadas (Liberado)' : `${playsRemaining} de 3 restantes`}
              </span>
            </div>
          </div>
        </div>

        {/* Locked Alert if Journey Not Completed */}
        {!journeyCompletedToday && !isUnlimited && (
          <div className="mt-6 p-4 rounded-3xl bg-[#F3EFFF] dark:bg-[#27234D] border-2 border-[#DDD6F3] dark:border-[#38316B] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="ak-sticker-badge w-10 h-10 rounded-2xl bg-white dark:bg-[#1E1B3A] text-[#7047E8] dark:text-[#B5A0FF] flex items-center justify-center shadow-sticker">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#25233A] dark:text-white">
                  Área Bloqueada Temporariamente
                </h4>
                <p className="text-xs text-[#77758A] dark:text-[#C5BFE6] mt-0.5">
                  Conclua sua jornada diária (20-30 min) para liberar as 3 jogadas de recompensa!
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={onGoToJourney}>
              <Compass size={16} />
              <span>Ir para Minha Jornada</span>
            </Button>
          </div>
        )}

        {/* Limit Reached Notice */}
        {journeyCompletedToday && playsRemaining <= 0 && !isUnlimited && (
          <div className="mt-6 p-4 rounded-3xl bg-[#FFF4D6]/90 dark:bg-[#38316B]/90 border-2 border-[#FFD34E]/40 flex items-center gap-3 animate-fadeIn">
            <span className="text-2xl">🌟</span>
            <div>
              <h4 className="font-extrabold text-sm text-[#8A5A00] dark:text-[#FFD34E]">
                Limite Diário de Jogos Atingido!
              </h4>
              <p className="text-xs text-[#8A5A00]/85 dark:text-[#EDE9FE]">
                Você aproveitou suas 3 jogadas de hoje. Amanhã haverá mais 3 jogadas para você brincar!
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Catalog of 7 Games */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES_CATALOG.map(game => {
          const isPlayable = canPlay || isUnlimited;

          return (
            <Card
              key={game.id}
              hoverable={isPlayable}
              onClick={() => isPlayable && handleLaunchGame(game)}
              className={`ak-card-3d border-2 transition-all duration-200 flex flex-col justify-between bg-white dark:bg-[#1E1B3A] ${
                isPlayable
                  ? 'border-[#E4DFF5] dark:border-[#38316B] hover:border-[#7047E8] dark:hover:border-[#8B68F7]'
                  : 'border-[#EAE6F7] dark:border-[#2B2552] opacity-75'
              }`}
            >
              <div>
                {/* Category & Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    style={{ backgroundColor: game.color }}
                    className="ak-sticker-badge w-14 h-14 rounded-2xl flex items-center justify-center shadow-sticker"
                  >
                    {renderGameBadge3D(game.id)}
                  </div>

                  {game.isOfflinePhysical && (
                    <span className="text-[10px] font-black bg-[#E9FBF4] dark:bg-[#133A2E] text-[#115E43] dark:text-[#6EE7B7] border border-[#36C995]/40 px-2.5 py-0.5 rounded-full">
                      Brincadeira em Grupo
                    </span>
                  )}
                </div>

                <h3 className="ak-title-display font-black text-lg text-[#25233A] dark:text-white mb-0.5">{game.title}</h3>
                <span className="text-xs font-bold text-[#7047E8] dark:text-[#B5A0FF] block mb-2">{game.subtitle}</span>
                <p className="text-xs text-[#77758A] dark:text-[#C5BFE6] leading-relaxed mb-4">
                  {game.description}
                </p>
              </div>

              {/* Card Footer Button */}
              <div className="pt-3 border-t border-[#E4DFF5] dark:border-[#38316B]">
                <Button
                  variant={isPlayable ? 'primary' : 'soft'}
                  size="sm"
                  className="w-full"
                  disabled={!isPlayable}
                  onClick={() => isPlayable && handleLaunchGame(game)}
                >
                  {isPlayable ? (
                    <>
                      <Play size={16} fill="currentColor" />
                      <span>Jogar Agora</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>Bloqueado</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
