import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  LogIn,
  Copy,
  Check,
  Play,
  LogOut,
  Wifi,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  buildRoomInviteUrl,
  MultiplayerGameRoom,
  multiplayerRoomService,
  parseRoomInviteFromUrl,
  RoomGameType
} from '../../services/multiplayerRoomService';

interface MultiplayerRoomBannerProps {
  gameType: RoomGameType;
  playerName: string;
  avatarId: string;
  familyId?: string;
  room: MultiplayerGameRoom | null;
  playerId: string;
  onRoomChange: (room: MultiplayerGameRoom | null, playerId: string) => void;
}

export const MultiplayerRoomBanner: React.FC<MultiplayerRoomBannerProps> = ({
  gameType,
  playerName,
  avatarId,
  familyId,
  room,
  playerId,
  onRoomChange
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [guestName, setGuestName] = useState(playerName || 'Jogador');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setGuestName(playerName || 'Jogador');
  }, [playerName]);

  // Auto-detect invite code in URL query parameters (?room=XXXXX&game=...)
  useEffect(() => {
    const invite = parseRoomInviteFromUrl();
    if (!invite || (invite.gameType && invite.gameType !== gameType) || room) return;
    setJoinCode(invite.code);
    setPanelOpen(true);
  }, [gameType, room]);

  // Poll live room state every 900ms while inside a room
  useEffect(() => {
    if (!room?.code || !playerId) return;
    let active = true;
    const poll = async () => {
      try {
        const latest = await multiplayerRoomService.fetchState(room.code, playerId);
        if (active) {
          onRoomChange(latest, playerId);
          setErrorMsg(null);
        }
      } catch (err: any) {
        if (active) {
          setErrorMsg(err?.message || 'Conexão com a sala perdida.');
        }
      }
    };
    const id = window.setInterval(poll, 900);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [room?.code, playerId, onRoomChange]);

  const handleCreate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await multiplayerRoomService.createRoom({
        gameType,
        playerName: guestName.trim() || playerName || 'Anfitrião',
        avatarId: avatarId || 'dog',
        familyId
      });
      onRoomChange(res.room, res.playerId);
      setPanelOpen(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Não foi possível criar a sala.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = joinCode.trim().toUpperCase();
    if (!clean) {
      setErrorMsg('Digite o código da sala para entrar.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await multiplayerRoomService.joinRoom({
        code: clean,
        playerName: guestName.trim() || playerName || 'Convidado',
        avatarId: avatarId || 'cat'
      });
      onRoomChange(res.room, res.playerId);
      setPanelOpen(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Código inválido ou sala cheia.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!room) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const started = await multiplayerRoomService.startGame(room.code, playerId);
      onRoomChange(started, playerId);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao iniciar partida.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!room) return;
    await multiplayerRoomService.leaveRoom(room.code, playerId);
    onRoomChange(null, '');
    setErrorMsg(null);
  };

  const handleCopyInvite = async () => {
    if (!room) return;
    const url = buildRoomInviteUrl(room.code, gameType);
    try {
      await navigator.clipboard.writeText(
        `Entre na minha sala do Ajuda KIDS!\nCódigo: ${room.code}\nLink: ${url}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const isHost = Boolean(room && room.hostPlayerId === playerId);

  if (!room && !panelOpen) {
    return (
      <div className="ak-card-3d mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#E4DFF5] dark:border-[#38316B] bg-white/95 dark:bg-[#1E1B3A] px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#25233A] dark:text-[#F8FAFC]">
          <Users className="w-4 h-4 text-[#7047E8] dark:text-[#C4B5FD]" />
          <span>Modo atual: Solo com Amigos 3D</span>
        </div>
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#7047E8] hover:bg-[#5E35D9] text-white px-3.5 py-1.5 text-xs font-extrabold border-b-2 border-[#522EC2] shadow-sm transition-colors"
        >
          <Wifi className="w-3.5 h-3.5" />
          Jogar em Sala Multiplayer
        </button>
      </div>
    );
  }

  return (
    <div className="ak-card-3d mb-3 rounded-2xl border-2 border-[#DDD6F3] dark:border-[#38316B] bg-white dark:bg-[#1E1B3A] p-3 sm:p-4 shadow-md space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="ak-sticker-badge w-9 h-9 rounded-xl bg-[#F5F3FC] dark:bg-[#27234D] border border-[#DDD6F3] dark:border-[#38316B] flex items-center justify-center text-[#7047E8] dark:text-[#C4B5FD]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="ak-title-display text-sm font-extrabold text-[#25233A] dark:text-[#F8FAFC] leading-tight">
              {room ? `Sala ${room.code} • Multiplayer Online` : 'Sala Multiplayer com Amigos'}
            </h4>
            <p className="text-[11px] font-semibold text-[#77758A] dark:text-[#C5BFE6]">
              {room
                ? `${room.players.length}/6 jogador(es) conectado(s)`
                : 'Crie uma sala ou digite o código para jogar com até 6 pessoas'}
            </p>
          </div>
        </div>

        {room ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyInvite}
              className="inline-flex items-center gap-1 rounded-xl border border-[#DDD6F3] dark:border-[#38316B] bg-[#F5F3FC] dark:bg-[#27234D] text-[#25233A] dark:text-[#F8FAFC] hover:bg-[#EDE9FE] dark:hover:bg-[#342E63] px-2.5 py-1.5 text-xs font-extrabold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#36C995]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : `Código: ${room.code}`}
            </button>
            <button
              type="button"
              onClick={handleLeave}
              className="inline-flex items-center gap-1 rounded-xl border border-[#FECACA] dark:border-[#9F1239] bg-[#FEF2F2] dark:bg-[#4C0519] text-[#B91C1C] dark:text-[#FDA4AF] px-2.5 py-1.5 text-xs font-extrabold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="text-xs font-bold text-[#77758A] dark:text-[#C5BFE6] hover:text-[#25233A] dark:hover:text-[#F8FAFC]"
          >
            Voltar ao Solo
          </button>
        )}
      </div>

      {!room ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          <div className="md:col-span-4">
            <input
              type="text"
              maxLength={18}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Seu nome na sala"
              className="w-full rounded-xl border border-[#DDD6F3] dark:border-[#38316B] bg-[#F5F3FC] dark:bg-[#121024] px-3 py-2 text-xs sm:text-sm font-bold text-[#25233A] dark:text-[#F8FAFC] placeholder:text-[#77758A] dark:placeholder:text-[#9B94C8] focus:outline-none focus:ring-2 focus:ring-[#7047E8]"
            />
          </div>
          <div className="md:col-span-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleCreate}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7047E8] to-[#4389F5] hover:from-[#5E35D9] hover:to-[#2B6ED9] text-white px-3 py-2 text-xs sm:text-sm font-extrabold border-b-2 border-[#522EC2] shadow-sm disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              Criar Sala
            </button>
          </div>
          <form onSubmit={handleJoin} className="md:col-span-5 flex items-center gap-2">
            <input
              type="text"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Código (ex: AB12C)"
              className="flex-1 rounded-xl border border-[#DDD6F3] dark:border-[#38316B] bg-[#F5F3FC] dark:bg-[#121024] px-3 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#25233A] dark:text-[#F8FAFC] placeholder:normal-case placeholder:tracking-normal placeholder:font-semibold placeholder:text-[#77758A] dark:placeholder:text-[#9B94C8] focus:outline-none focus:ring-2 focus:ring-[#7047E8]"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-xl bg-[#36C995] hover:bg-[#2BB584] text-white px-3 py-2 text-xs sm:text-sm font-extrabold border-b-2 border-[#22986E] shadow-sm disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex flex-wrap gap-2">
            {room.players.map((p) => {
              const isMe = p.playerId === playerId;
              return (
                <div
                  key={p.playerId}
                  className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs font-extrabold ${
                    isMe
                      ? 'border-[#7047E8] bg-[#F5F3FC] dark:bg-[#27234D] text-[#522EC2] dark:text-[#D8D2F8]'
                      : 'border-[#E4DFF5] dark:border-[#38316B] bg-[#F5F3FC]/60 dark:bg-[#121024] text-[#25233A] dark:text-[#F8FAFC]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span>
                    {p.name}
                    {isMe ? ' (Você)' : ''}
                    {p.isHost ? ' ★' : ''}
                  </span>
                  <span className="text-[11px] opacity-80">{p.score} pts</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F5F3FC] dark:bg-[#27234D] border border-[#E4DFF5] dark:border-[#38316B] px-3 py-2 text-xs font-bold text-[#25233A] dark:text-[#D8D2F8]">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD34E]" />
              {room.lastEventMessage}
            </span>

            {room.phase === 'lobby' && (
              isHost ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleStart}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#36C995] hover:bg-[#2BB584] text-white px-3 py-1.5 text-xs font-extrabold border-b-2 border-[#22986E] shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Iniciar Partida da Sala
                </button>
              ) : (
                <span className="text-[11px] font-extrabold text-[#7047E8] dark:text-[#C4B5FD]">
                  Aguardando anfitrião iniciar...
                </span>
              )
            )}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-1.5 rounded-xl border border-[#FECACA] dark:border-[#9F1239] bg-[#FEF2F2] dark:bg-[#4C0519] px-3 py-2 text-xs font-bold text-[#B91C1C] dark:text-[#FDA4AF]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
