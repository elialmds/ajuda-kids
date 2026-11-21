import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Readable } from 'stream';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createFamilyApiHandler } from '../server/familyApiMiddleware';
import vercelApiHandler from '../api/index.js';
import {
  advanceMonotonicAngle,
  computeForwardLapTarget,
  findNextSeatedByCircleOrder,
  getSeatAngle,
  TWO_PI
} from '../src/modules/games3d/circleGameMath';
import { createKidCharacter3D, setCharacterPosture } from '../src/modules/games3d/modelFactory';

describe('Fase 1 — Estabilização: Cinemática 3D & Lógica de Ciranda', () => {
  it('percorre os assentos em ordem física da ciranda após troca de lugares (sem zigue-zague)', () => {
    // Participante 0 sentou no assento 3, participante 3 virou o pegador (-1), assento 0 está livre
    const seatsAfterSwap = [3, 1, 2, -1, 4, 5];

    const afterP0 = findNextSeatedByCircleOrder(seatsAfterSwap, 0, 0);
    expect(afterP0).toBe(4); // assento 4

    const afterP4 = findNextSeatedByCircleOrder(seatsAfterSwap, 4, 0);
    expect(afterP4).toBe(5); // assento 5

    // Salta assento 0 que está vazio e encontra participante 1 no assento 1!
    const afterP5 = findNextSeatedByCircleOrder(seatsAfterSwap, 5, 0);
    expect(afterP5).toBe(1);

    // Quando o novo pegador (idx 3, seat -1) parte da posição onde caiu (assento 3)
    const fromStandingRunner = findNextSeatedByCircleOrder(seatsAfterSwap, 3, 3);
    expect(fromStandingRunner).toBe(4);
  });

  it('calcula exatamente uma volta horária alinhada ao ângulo do assento-alvo', () => {
    const startAngle = getSeatAngle(2) - 0.12;
    const goalSeat = 2;
    const finishAngle = computeForwardLapTarget(startAngle, goalSeat);

    expect(finishAngle - startAngle).toBeGreaterThan(Math.PI * 1.45);
    const wrappedDiff = Math.abs((finishAngle % TWO_PI) - getSeatAngle(goalSeat));
    expect(wrappedDiff).toBeLessThan(1e-6);
  });

  it('avança ângulo de caminhada de forma monotônica sem dar voltas extras ao se aproximar', () => {
    let angle = 0.2;
    const target = getSeatAngle(1) - 0.14;
    for (let i = 0; i < 40; i++) {
      const next = advanceMonotonicAngle(angle, target, 0.08);
      expect(next).toBeGreaterThanOrEqual(angle - 0.05);
      angle = next;
    }
    expect(Math.abs(angle - target)).toBeLessThan(0.05);
  });

  it('mantém postura morto_crouch estável entre taxas de quadros (30fps e 120fps) e retorna ao normal', () => {
    const kidSlow = createKidCharacter3D('Bia', 0x83bce0, 0x303d63);
    const kidFast = createKidCharacter3D('Léo', 0x97c087, 0x303d63);

    // 0.5 segundo em 30fps (15 passos) vs 120fps (60 passos)
    for (let i = 0; i < 15; i++) {
      setCharacterPosture(kidSlow, 'morto_crouch', i * (1 / 30), 1 / 30);
    }
    for (let i = 0; i < 60; i++) {
      setCharacterPosture(kidFast, 'morto_crouch', i * (1 / 120), 1 / 120);
    }

    const upperSlow = kidSlow.getObjectByName('upperBody')!;
    const upperFast = kidFast.getObjectByName('upperBody')!;
    expect(kidSlow.position.y).toBe(0);
    expect(upperSlow.position.y).toBeLessThan(-0.2);
    expect(upperSlow.position.z).toBeLessThan(-0.04);
    expect(Math.abs(upperSlow.position.y - upperFast.position.y)).toBeLessThan(0.02);

    // Retorna para em pé (vivo/stand)
    for (let i = 0; i < 60; i++) {
      setCharacterPosture(kidSlow, 'stand', 1 + i * (1 / 60), 1 / 60);
    }
    expect(Math.abs(upperSlow.position.z)).toBeLessThan(0.005);
  });
});

describe('Fase 1 — Estabilização: Segurança HTTP, Rate Limits, Pareamento e Salas Multiplayer', () => {
  let handler: ReturnType<typeof createFamilyApiHandler>;
  let tempDataDir = '';
  const capturedEmails: Array<{ to: string; subject: string; html: string; code?: string }> = [];

  beforeAll(() => {
    tempDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ajuda-kids-stage1-'));
    handler = createFamilyApiHandler({
      rootDir: process.cwd(),
      dataDir: tempDataDir,
      getSmtpEnv: () => ({
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: 587,
        SMTP_SECURE: false,
        EMAIL_USER: 'test-sender@gmail.com',
        EMAIL_PASS: 'app-pass-placeholder',
        EMAIL_FROM: 'Ajuda KIDS <test-sender@gmail.com>'
      }),
      sendMailOverride: async (mailOptions) => {
        const match = mailOptions.html.match(/>\s*(\d{6})\s*</);
        capturedEmails.push({
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
          code: match?.[1]
        });
        return { accepted: [mailOptions.to], messageId: `<msg-${capturedEmails.length}@test>` };
      }
    });
  });

  afterAll(() => {
    fs.rmSync(tempDataDir, { recursive: true, force: true });
  });

  const apiJson = (
    endpoint: string,
    options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
  ): Promise<{ status: number; data: any }> => {
    return new Promise((resolve, reject) => {
      const payload = options.body !== undefined ? JSON.stringify(options.body) : '';
      const rawHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(options.headers || {})) {
        rawHeaders[k.toLowerCase()] = v;
      }
      if (payload) {
        rawHeaders['content-type'] = 'application/json';
      }

      const req = Object.assign(
        Readable.from(payload ? [Buffer.from(payload, 'utf8')] : []),
        {
          url: endpoint,
          method: options.method || 'GET',
          headers: rawHeaders,
          socket: { remoteAddress: '127.0.0.1' }
        }
      ) as unknown as http.IncomingMessage;

      let settled = false;
      const responseHeaders: Record<string, string> = {};
      let statusCode = 200;
      const chunks: string[] = [];

      const res = {
        get statusCode() {
          return statusCode;
        },
        set statusCode(val: number) {
          statusCode = val;
        },
        setHeader(name: string, value: string) {
          responseHeaders[name.toLowerCase()] = String(value);
        },
        writeHead(code: number, hdrs?: Record<string, string>) {
          statusCode = code;
          if (hdrs) {
            for (const [k, v] of Object.entries(hdrs)) {
              responseHeaders[k.toLowerCase()] = String(v);
            }
          }
          return res;
        },
        end(chunk?: any) {
          if (chunk !== undefined) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk));
          }
          if (!settled) {
            settled = true;
            const raw = chunks.join('');
            let parsed: any = {};
            try {
              parsed = raw ? JSON.parse(raw) : {};
            } catch {
              parsed = { raw };
            }
            resolve({ status: statusCode, data: parsed });
          }
          return res;
        }
      } as unknown as http.ServerResponse;

      Promise.resolve(
        handler(req, res, () => {
          if (!settled) {
            settled = true;
            resolve({ status: 404, data: { error: 'Not found' } });
          }
        })
      ).catch(reject);
    });
  };

  const registerFamily = async (tag: string, password: string) => {
    const email = `familia_${tag}@gmail.com`;
    const username = `familia_${tag}`;
    const reqOtp = await apiJson('/api/auth/request-email-verification', {
      method: 'POST',
      body: {
        parentName: `Resp ${tag}`,
        username,
        email,
        password,
        passwordHash: `hash_${tag}`,
        passwordSalt: `salt_${tag}`,
        settings: { parentPinHash: 'pinhash', parentPinSalt: 'pinsalt' }
      }
    });
    expect(reqOtp.status).toBe(200);
    const lastMail = [...capturedEmails].reverse().find((m) => m.to === email);
    expect(lastMail?.code).toMatch(/^\d{6}$/);

    const confirm = await apiJson('/api/auth/confirm-email-verification', {
      method: 'POST',
      body: { email, code: lastMail?.code }
    });
    expect(confirm.status).toBe(200);
    expect(typeof confirm.data.session?.token).toBe('string');
    expect(confirm.data.session.token.length).toBeGreaterThanOrEqual(48);
    return {
      email,
      username,
      token: confirm.data.session.token as string,
      familyId: confirm.data.session.familyId as string,
      userId: confirm.data.session.userId as string
    };
  };

  it('rejeita senha fraca no backend e protege /api/auth/session contra token na URL', async () => {
    const weak = await apiJson('/api/auth/request-email-verification', {
      method: 'POST',
      body: {
        parentName: 'Teste',
        username: 'weak_user_1',
        email: 'weak1@gmail.com',
        password: 'abc',
        passwordHash: 'h',
        passwordSalt: 's'
      }
    });
    expect(weak.status).toBe(400);
    expect(weak.data.code).toBe('WEAK_PASSWORD');

    const famA = await registerFamily('a1', 'Senha@123');

    // Token em query string deve ser recusado
    const querySession = await apiJson(`/api/auth/session?token=${encodeURIComponent(famA.token)}`);
    expect(querySession.status).toBe(401);

    // Bearer header deve ser aceito
    const bearerSession = await apiJson('/api/auth/session', {
      headers: { Authorization: `Bearer ${famA.token}` }
    });
    expect(bearerSession.status).toBe(200);
    expect(bearerSession.data.session.username).toBe(famA.username);
  });

  it('bloqueia acesso não autenticado (401) e acesso cruzado entre famílias (403)', async () => {
    const famA = await registerFamily('iso_a', 'Senha@123');
    const famB = await registerFamily('iso_b', 'Senha@123');

    const anonSync = await apiJson('/api/family/sync', {
      method: 'POST',
      body: { familyId: famA.familyId, state: { children: [] } }
    });
    expect(anonSync.status).toBe(401);

    const crossSync = await apiJson('/api/family/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${famB.token}` },
      body: { familyId: famA.familyId, state: { children: [{ id: 'hack' }] } }
    });
    expect(crossSync.status).toBe(403);

    const crossState = await apiJson(`/api/family/state?familyId=${encodeURIComponent(famA.familyId)}`, {
      headers: { Authorization: `Bearer ${famB.token}` }
    });
    expect(crossState.status).toBe(403);

    const ownSync = await apiJson('/api/family/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${famA.token}` },
      body: { familyId: famA.familyId, state: { children: [{ id: 'c1', name: 'Ana' }] } }
    });
    expect(ownSync.status).toBe(200);

    const ownState = await apiJson(`/api/family/state?familyId=${encodeURIComponent(famA.familyId)}`, {
      headers: { Authorization: `Bearer ${famA.token}` }
    });
    expect(ownState.status).toBe(200);
    expect(ownState.data.family.children[0].name).toBe('Ana');
  });

  it('aplica bloqueio progressivo contra força bruta no login (429 após 5 falhas)', async () => {
    const fam = await registerFamily('brute', 'Senha@123');
    for (let i = 0; i < 4; i++) {
      const fail = await apiJson('/api/auth/login', {
        method: 'POST',
        body: { identifier: fam.email, passwordHash: 'wrong_hash' }
      });
      expect(fail.status).toBe(401);
    }

    const fifth = await apiJson('/api/auth/login', {
      method: 'POST',
      body: { identifier: fam.email, passwordHash: 'wrong_hash' }
    });
    expect(fifth.status).toBe(429);
    expect(fifth.data.code).toBe('TOO_MANY_ATTEMPTS');

    // Até tentativa subsequente dentro da janela de bloqueio deve ser recusada com 429
    const blockedCorrect = await apiJson('/api/auth/login', {
      method: 'POST',
      body: { identifier: fam.email, passwordHash: 'hash_brute' }
    });
    expect(blockedCorrect.status).toBe(429);
  });

  it('emite token de dispositivo pareado e bloqueia imediatamente após revogação parental', async () => {
    const fam = await registerFamily('pair', 'Senha@123');
    const code = '739104';

    const created = await apiJson('/api/pairing/create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${fam.token}` },
      body: {
        session: {
          code,
          familyId: fam.familyId,
          childId: 'child_1',
          childName: 'Lucas',
          childAvatar: 'char_leo',
          status: 'waiting',
          createdAt: Date.now(),
          expiresAt: Date.now() + 300_000
        },
        familySnapshot: { id: fam.familyId, children: [{ id: 'child_1', name: 'Lucas' }] }
      }
    });
    expect(created.status).toBe(200);

    const claimed = await apiJson('/api/pairing/claim', {
      method: 'POST',
      body: {
        code,
        deviceId: 'tablet_kids_1',
        deviceName: 'Tablet do Lucas',
        platform: 'Android'
      }
    });
    expect(claimed.status).toBe(200);
    const claimSecret = claimed.data.claimSecret as string;
    expect(claimSecret.startsWith('pclaim_')).toBe(true);

    const confirmed = await apiJson('/api/pairing/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${fam.token}` },
      body: { code }
    });
    expect(confirmed.status).toBe(200);

    const statusPoll = await apiJson(`/api/pairing/status?code=${code}`, {
      headers: { 'X-Pairing-Claim': claimSecret }
    });
    expect(statusPoll.status).toBe(200);
    const deviceToken = statusPoll.data.deviceToken as string;
    expect(deviceToken.startsWith('devtok_')).toBe(true);

    // Dispositivo pareado consegue consultar estado usando apenas X-Device-Token
    const childRead = await apiJson(`/api/family/state?familyId=${encodeURIComponent(fam.familyId)}`, {
      headers: {
        'X-Device-Token': deviceToken,
        'X-Device-Id': 'tablet_kids_1'
      }
    });
    expect(childRead.status).toBe(200);

    // Responsável revoga o dispositivo
    const revoked = await apiJson('/api/device/revoke', {
      method: 'POST',
      headers: { Authorization: `Bearer ${fam.token}` },
      body: { familyId: fam.familyId, deviceId: 'tablet_kids_1' }
    });
    expect(revoked.status).toBe(200);

    // Acesso do dispositivo revogado é bloqueado na hora!
    const deniedAfterRevoke = await apiJson(`/api/family/state?familyId=${encodeURIComponent(fam.familyId)}`, {
      headers: {
        'X-Device-Token': deviceToken,
        'X-Device-Id': 'tablet_kids_1'
      }
    });
    expect(deniedAfterRevoke.status).toBe(401);
  });

  it('executa ciclo completo das salas multiplayer (/api/games/rooms/*) para Morto-Vivo e Pato-Pato-Ganso', async () => {
    const createMv = await apiJson('/api/games/rooms/create', {
      method: 'POST',
      body: {
        gameType: 'morto-vivo',
        playerName: 'Anfitriã',
        avatarId: 'char_bia',
        playerId: 'p_host'
      }
    });
    expect(createMv.status).toBe(200);
    const roomCode = createMv.data.room.code as string;
    expect(roomCode.length).toBeGreaterThanOrEqual(4);

    const joinMv = await apiJson('/api/games/rooms/join', {
      method: 'POST',
      body: {
        code: roomCode,
        playerName: 'Convidado',
        avatarId: 'char_leo',
        playerId: 'p_guest'
      }
    });
    expect(joinMv.status).toBe(200);
    expect(joinMv.data.room.players.length).toBe(2);

    const startMv = await apiJson('/api/games/rooms/start', {
      method: 'POST',
      body: { code: roomCode, playerId: 'p_host' }
    });
    expect(startMv.status).toBe(200);
    expect(startMv.data.room.phase).toBe('playing');

    const currentCmd = startMv.data.room.command as 'vivo' | 'morto';
    const actGuest = await apiJson('/api/games/rooms/action', {
      method: 'POST',
      body: { code: roomCode, playerId: 'p_guest', type: 'posture', choice: currentCmd }
    });
    expect(actGuest.status).toBe(200);
    const guestRec = actGuest.data.room.players.find((p: any) => p.playerId === 'p_guest');
    expect(guestRec.score).toBe(100);

    const nextRound = await apiJson('/api/games/rooms/action', {
      method: 'POST',
      body: { code: roomCode, playerId: 'p_host', type: 'next_round' }
    });
    expect(nextRound.status).toBe(200);
    expect(nextRound.data.room.round).toBe(2);

    // Agora testa sala de Pato Pato Ganso
    const createPg = await apiJson('/api/games/rooms/create', {
      method: 'POST',
      body: {
        gameType: 'pato-ganso',
        playerName: 'Bia',
        avatarId: 'char_bia',
        playerId: 'pg_host'
      }
    });
    expect(createPg.status).toBe(200);
    const pgCode = createPg.data.room.code as string;

    await apiJson('/api/games/rooms/join', {
      method: 'POST',
      body: { code: pgCode, playerName: 'Léo', avatarId: 'char_leo', playerId: 'pg_guest' }
    });
    const pgStart = await apiJson('/api/games/rooms/start', {
      method: 'POST',
      body: { code: pgCode, playerId: 'pg_host' }
    });
    expect(pgStart.data.room.phase).toBe('playing');

    const patoRes = await apiJson('/api/games/rooms/action', {
      method: 'POST',
      body: { code: pgCode, playerId: 'pg_host', type: 'pato' }
    });
    expect(patoRes.data.room.walkerStep).toBe(1);

    const gansoRes = await apiJson('/api/games/rooms/action', {
      method: 'POST',
      body: { code: pgCode, playerId: 'pg_host', type: 'ganso', targetIndex: 1 }
    });
    expect(gansoRes.data.room.phase).toBe('chasing');

    const dashRes = await apiJson('/api/games/rooms/action', {
      method: 'POST',
      body: { code: pgCode, playerId: 'pg_host', type: 'dash' }
    });
    expect(dashRes.status).toBe(200);
    expect(dashRes.data.room.chaseRunnerProgress).toBeGreaterThan(0.1);

    const leftRes = await apiJson('/api/games/rooms/leave', {
      method: 'POST',
      body: { code: pgCode, playerId: 'pg_guest' }
    });
    expect(leftRes.status).toBe(200);
  });

  it('aplica cooldown na recuperação de senha e libera username de verificação expirada', async () => {
    const fam = await registerFamily('pwdcool', 'Senha@123');
    const firstReset = await apiJson('/api/auth/request-password-reset', {
      method: 'POST',
      body: { identifier: fam.email }
    });
    expect(firstReset.status).toBe(200);

    const secondResetImmediate = await apiJson('/api/auth/request-password-reset', {
      method: 'POST',
      body: { identifier: fam.email }
    });
    expect(secondResetImmediate.status).toBe(429);

    // Simula registro pendente antigo expirado com username 'temp_free_name' no banco de teste
    const dbPath = path.join(tempDataDir, 'family_cloud_db.json');
    const store = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    store.users['expired_unverified_user'] = {
      id: 'expired_unverified_user',
      username: 'temp_free_name',
      usernameLower: 'temp_free_name',
      email: 'stale_unverified@gmail.com',
      emailLower: 'stale_unverified@gmail.com',
      emailVerified: false,
      createdAt: Date.now() - 48 * 60 * 60 * 1000
    };
    fs.writeFileSync(dbPath, JSON.stringify(store), 'utf8');

    const claimFreedUsername = await apiJson('/api/auth/request-email-verification', {
      method: 'POST',
      body: {
        parentName: 'Novo Responsável',
        username: 'temp_free_name',
        email: 'novo_valido@gmail.com',
        password: 'Password@99',
        passwordHash: 'hash_new',
        passwordSalt: 'salt_new'
      }
    });
    expect(claimFreedUsername.status).toBe(200);
  });

  it('roteia /api/* no handler serverless da Vercel e suporta fallback via cookie entre instâncias', async () => {
    const runMock = (
      fn: (req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => Promise<void> | void,
      url: string,
      method: string,
      bodyObj?: any,
      extraHeaders: Record<string, string> = {}
    ): Promise<{ status: number; data: any; headers: Record<string, string> }> =>
      new Promise((resolve) => {
        const req = Object.assign(Readable.from([]), {
          url,
          method,
          headers: extraHeaders,
          body: bodyObj,
          socket: { remoteAddress: '127.0.0.1' }
        }) as unknown as http.IncomingMessage;
        const headers: Record<string, string> = {};
        let statusCode = 200;
        const chunks: string[] = [];
        const res = {
          get statusCode() {
            return statusCode;
          },
          set statusCode(val: number) {
            statusCode = val;
          },
          setHeader(k: string, v: string) {
            headers[k.toLowerCase()] = String(v);
          },
          end(chunk?: any) {
            if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk));
            resolve({ status: statusCode, data: JSON.parse(chunks.join('') || '{}'), headers });
          }
        } as unknown as http.ServerResponse;
        Promise.resolve(fn(req, res, () => {})).catch(() => {});
      });

    const healthDirect = await runMock((req, res) => vercelApiHandler(req, res), '/api/health', 'GET');
    expect(healthDirect.status).toBe(200);
    expect(healthDirect.data.ok).toBe(true);

    const healthRewritten = await runMock(
      (req, res) => vercelApiHandler(req, res),
      '/api/index?__path=health',
      'GET'
    );
    expect(healthRewritten.status).toBe(200);
    expect(healthRewritten.data.ok).toBe(true);

    const parsedBodyValidation = await runMock(
      (req, res) => vercelApiHandler(req, res),
      '/api/index?__path=auth/request-email-verification',
      'POST',
      { email: 'invalido' }
    );
    expect(parsedBodyValidation.status).toBe(400);
    expect(parsedBodyValidation.data.code).toBe('INVALID_EMAIL');

    // Simula duas instâncias serverless sem armazenamento compartilhado (Container A -> Container B)
    const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'ak-serverless-a-'));
    const dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'ak-serverless-b-'));
    try {
      let sentCode = '';
      const sharedSmtp = () => ({
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: 587,
        SMTP_SECURE: false,
        EMAIL_USER: 'serverless@gmail.com',
        EMAIL_PASS: 'serverless-secret-test',
        EMAIL_FROM: 'Ajuda KIDS <serverless@gmail.com>'
      });
      const handlerA = createFamilyApiHandler({
        rootDir: process.cwd(),
        dataDir: dirA,
        getSmtpEnv: sharedSmtp,
        sendMailOverride: async (mail) => {
          sentCode = mail.html.match(/>\s*(\d{6})\s*</)?.[1] || '';
          return { accepted: [mail.to], messageId: '<serverless-1@test>' };
        }
      });
      const handlerB = createFamilyApiHandler({
        rootDir: process.cwd(),
        dataDir: dirB,
        getSmtpEnv: sharedSmtp
      });

      const reqOtp = await runMock(handlerA, '/api/auth/request-email-verification', 'POST', {
        parentName: 'Mãe Cloud',
        username: 'mae.cloud',
        email: 'mae_cloud@gmail.com',
        password: 'Password@99',
        passwordHash: 'h_cloud',
        passwordSalt: 's_cloud',
        settings: {}
      });
      expect(reqOtp.status).toBe(200);
      expect(sentCode).toMatch(/^\d{6}$/);
      expect(reqOtp.headers['set-cookie']).toContain('ak_reg_verify=');

      const cookiePair = reqOtp.headers['set-cookie'].split(';')[0];
      const confirmOnB = await runMock(
        handlerB,
        '/api/auth/confirm-email-verification',
        'POST',
        { email: 'mae_cloud@gmail.com', code: sentCode },
        { cookie: cookiePair }
      );
      expect(confirmOnB.status).toBe(200);
      expect(confirmOnB.data.ok).toBe(true);
      expect(confirmOnB.data.session?.parentEmail).toBe('mae_cloud@gmail.com');
    } finally {
      fs.rmSync(dirA, { recursive: true, force: true });
      fs.rmSync(dirB, { recursive: true, force: true });
    }
  });

  it('persiste e carrega estado via Supabase PostgREST quando SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão ativos', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ak-supa-root-'));
    const origFetch = globalThis.fetch;
    const origUrl = process.env.SUPABASE_URL;
    const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const origVercel = process.env.VERCEL;
    let savedRowData: any = null;
    let savedFamilyRows: any[] = [];

    process.env.SUPABASE_URL = 'https://exemplo-ajuda.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_test_key';
    process.env.VERCEL = '1';

    (globalThis as any).fetch = async (url: string, init?: RequestInit) => {
      const urlStr = String(url);
      expect(urlStr).toMatch(
        /^https:\/\/exemplo-ajuda\.supabase\.co\/rest\/v1\/(ajuda_kids_state|family_accounts|child_profiles)/
      );
      const headers = (init?.headers || {}) as Record<string, string>;
      expect(headers.apikey).toBe('sb_secret_test_key');
      expect(headers.Authorization).toBeUndefined();

      if ((init?.method || 'GET').toUpperCase() === 'POST') {
        const body = JSON.parse(String(init?.body || '{}'));
        if (urlStr.includes('/family_accounts')) {
          savedFamilyRows = Array.isArray(body) ? body : [body];
          return new Response(null, { status: 201 });
        }
        if (urlStr.includes('/child_profiles')) {
          return new Response(null, { status: 201 });
        }
        expect(body.id).toBe('primary');
        savedRowData = body.data;
        return new Response(null, { status: 201 });
      }
      return new Response(JSON.stringify(savedRowData ? [{ data: savedRowData }] : []), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    try {
      let otpCode = '';
      const supaHandler = createFamilyApiHandler({
        rootDir: tempRoot,
        getSmtpEnv: () => ({
          SMTP_HOST: 'smtp.gmail.com',
          SMTP_PORT: 587,
          SMTP_SECURE: false,
          EMAIL_USER: 'supa@gmail.com',
          EMAIL_PASS: 'supa-app-pass',
          EMAIL_FROM: 'Ajuda KIDS <supa@gmail.com>'
        }),
        sendMailOverride: async (mail) => {
          otpCode = mail.html.match(/>\s*(\d{6})\s*</)?.[1] || '';
          return { accepted: [mail.to], messageId: '<supa-1@test>' };
        }
      });

      const callSupa = (url: string, method: string, bodyObj?: any): Promise<{ status: number; data: any }> =>
        new Promise((resolve) => {
          const req = Object.assign(Readable.from([]), {
            url,
            method,
            headers: {},
            body: bodyObj,
            socket: { remoteAddress: '127.0.0.1' }
          }) as unknown as http.IncomingMessage;
          let statusCode = 200;
          const chunks: string[] = [];
          const res = {
            get statusCode() {
              return statusCode;
            },
            set statusCode(val: number) {
              statusCode = val;
            },
            setHeader() {},
            end(chunk?: any) {
              if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk));
              resolve({ status: statusCode, data: JSON.parse(chunks.join('') || '{}') });
            }
          } as unknown as http.ServerResponse;
          Promise.resolve(supaHandler(req, res, () => {})).catch(() => {});
        });

      const health = await callSupa('/api/health', 'GET');
      expect(health.status).toBe(200);
      expect(health.data.storageBackend).toBe('supabase');
      expect(health.data.persistentStorageConfigured).toBe(true);

      const reqOtp = await callSupa('/api/auth/request-email-verification', 'POST', {
        parentName: 'Pai Supabase',
        username: 'pai.supa',
        email: 'pai_supa@gmail.com',
        password: 'Password@99',
        passwordHash: 'h_supa',
        passwordSalt: 's_supa',
        settings: {}
      });
      expect(reqOtp.status).toBe(200);
      expect(savedRowData?.emailVerifications?.['pai_supa@gmail.com']).toBeTruthy();

      // Simula nova instância fria da Vercel lendo exclusivamente do Supabase mockado
      delete (globalThis as any).__ajudaKidsWarmStore;
      const coldHandler = createFamilyApiHandler({ rootDir: tempRoot });
      const confirmRes = await new Promise<{ status: number; data: any }>((resolve) => {
        const req = Object.assign(Readable.from([]), {
          url: '/api/auth/confirm-email-verification',
          method: 'POST',
          headers: {},
          body: { email: 'pai_supa@gmail.com', code: otpCode },
          socket: { remoteAddress: '127.0.0.1' }
        }) as unknown as http.IncomingMessage;
        let statusCode = 200;
        const chunks: string[] = [];
        const res = {
          get statusCode() {
            return statusCode;
          },
          set statusCode(val: number) {
            statusCode = val;
          },
          setHeader() {},
          end(chunk?: any) {
            if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk));
            resolve({ status: statusCode, data: JSON.parse(chunks.join('') || '{}') });
          }
        } as unknown as http.ServerResponse;
        Promise.resolve(coldHandler(req, res, () => {})).catch(() => {});
      });

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.data.ok).toBe(true);
      expect(Object.keys(savedRowData?.sessions || {}).length).toBeGreaterThan(0);
      expect(savedFamilyRows[0]?.parent_name).toBe('Pai Supabase');
    } finally {
      globalThis.fetch = origFetch;
      if (origUrl === undefined) delete process.env.SUPABASE_URL;
      else process.env.SUPABASE_URL = origUrl;
      if (origKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = origKey;
      if (origVercel === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = origVercel;
      delete (globalThis as any).__ajudaKidsWarmStore;
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
