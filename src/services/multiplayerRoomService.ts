export type RoomGameType = 'morto-vivo' | 'pato-ganso';

export interface MultiplayerRoomPlayer {
  playerId: string;
  name: string;
  avatarId: string;
  color: string;
  isHost: boolean;
  ready: boolean;
  score: number;
  lives: number;
  posture: 'stand' | 'morto_crouch' | 'vivo_jump' | 'celebrate';
  seatIndex: number;
  lastActionRound?: number;
  lastActionChoice?: string;
  lastSeenAt: number;
}

export interface MultiplayerGameRoom {
  code: string;
  gameType: RoomGameType;
  familyId?: string;
  hostPlayerId: string;
  phase: 'lobby' | 'playing' | 'chasing' | 'finished';
  round: number;
  command: 'vivo' | 'morto';
  roundIssuedAt: number;
  roundDeadlineAt: number;
  walkerIndex: number;
  walkerStep: number;
  gooseIndex: number | null;
  emptySeatIndex: number;
  seatOrder: number[];
  chaseRunnerProgress: number;
  chaseGooseProgress: number;
  lastEventMessage: string;
  winnerPlayerId?: string | null;
  players: MultiplayerRoomPlayer[];
  createdAt: number;
  updatedAt: number;
}

const TAB_PLAYER_ID_KEY = 'ajuda_kids_mp_tab_player_id_v1';

export function getTabPlayerId(): string {
  try {
    const existing = sessionStorage.getItem(TAB_PLAYER_ID_KEY);
    if (existing) return existing;
    const generated = `plr_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    sessionStorage.setItem(TAB_PLAYER_ID_KEY, generated);
    return generated;
  } catch {
    return `plr_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function buildRoomInviteUrl(code: string, gameType: RoomGameType): string {
  if (typeof window === 'undefined') return `?room=${code}&game=${gameType}`;
  const url = new URL(window.location.href);
  url.searchParams.set('room', code.toUpperCase());
  url.searchParams.set('game', gameType);
  return url.toString();
}

export function parseRoomInviteFromUrl(): { code: string; gameType?: RoomGameType } | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get('room') || '').trim().toUpperCase();
    if (!code || code.length < 4) return null;
    const g = params.get('game');
    const gameType: RoomGameType | undefined =
      g === 'morto-vivo' || g === 'pato-ganso' ? g : undefined;
    return { code, gameType };
  } catch {
    return null;
  }
}

async function postRoomJson<T>(endpoint: string, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || `Falha na comunicação com a sala (${res.status}).`);
  }
  return data as T;
}

export const multiplayerRoomService = {
  async createRoom(params: {
    gameType: RoomGameType;
    playerName: string;
    avatarId: string;
    familyId?: string;
  }): Promise<{ room: MultiplayerGameRoom; playerId: string }> {
    const playerId = getTabPlayerId();
    const res = await postRoomJson<{ ok: boolean; room: MultiplayerGameRoom; playerId: string }>(
      '/api/games/rooms/create',
      {
        ...params,
        playerId
      }
    );
    return { room: res.room, playerId: res.playerId || playerId };
  },

  async joinRoom(params: {
    code: string;
    playerName: string;
    avatarId: string;
  }): Promise<{ room: MultiplayerGameRoom; playerId: string }> {
    const playerId = getTabPlayerId();
    const cleanCode = params.code.trim().toUpperCase();
    const res = await postRoomJson<{ ok: boolean; room: MultiplayerGameRoom; playerId: string }>(
      '/api/games/rooms/join',
      {
        code: cleanCode,
        playerName: params.playerName,
        avatarId: params.avatarId,
        playerId
      }
    );
    return { room: res.room, playerId: res.playerId || playerId };
  },

  async fetchState(code: string, playerId: string): Promise<MultiplayerGameRoom> {
    const cleanCode = encodeURIComponent(code.trim().toUpperCase());
    const cleanPlayer = encodeURIComponent(playerId);
    const res = await fetch(`/api/games/rooms/state?code=${cleanCode}&playerId=${cleanPlayer}`, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok || !data?.room) {
      throw new Error(data?.error || 'Sala não encontrada ou encerrada.');
    }
    return data.room as MultiplayerGameRoom;
  },

  async startGame(code: string, playerId: string): Promise<MultiplayerGameRoom> {
    const res = await postRoomJson<{ ok: boolean; room: MultiplayerGameRoom }>(
      '/api/games/rooms/start',
      {
        code: code.trim().toUpperCase(),
        playerId
      }
    );
    return res.room;
  },

  async sendAction(params: {
    code: string;
    playerId: string;
    type: 'posture' | 'next_round' | 'pato' | 'ganso' | 'dash';
    choice?: 'vivo' | 'morto';
    targetIndex?: number;
  }): Promise<MultiplayerGameRoom> {
    const res = await postRoomJson<{ ok: boolean; room: MultiplayerGameRoom }>(
      '/api/games/rooms/action',
      {
        ...params,
        code: params.code.trim().toUpperCase()
      }
    );
    return res.room;
  },

  async leaveRoom(code: string, playerId: string): Promise<void> {
    await fetch('/api/games/rooms/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase(), playerId })
    }).catch(() => undefined);
  }
};
