import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  computeLegacyBitwiseHash,
  hashPin,
  sha256Hex,
  verifyPin
} from '../src/utils/security';
import { authService } from '../src/services/authService';
import { analyzeDrawingCanvas, DrawingStroke } from '../src/utils/drawingHeuristicRecognizer';
import { EvolutionService } from '../src/services/evolutionService';
import { JourneyService } from '../src/services/journeyService';
import { StorageService } from '../src/services/storageService';
import { ACTIVITIES_DATABASE } from '../src/data/activitiesData';
import { ChildProfile, SavedDrawing } from '../src/types';

function ensureNodeLocalStorage() {
  const store = new Map<string, string>();
  const mockStorage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    }
  };

  if (typeof globalThis.localStorage === 'undefined') {
    vi.stubGlobal('localStorage', mockStorage);
  }
  if (typeof globalThis.window === 'undefined') {
    vi.stubGlobal('window', { localStorage: globalThis.localStorage } as unknown as Window);
  }
}

function createSampleChild(overrides: Partial<ChildProfile> = {}): ChildProfile {
  return {
    id: 'child_ak6_1',
    familyId: 'fam_ak6_1',
    name: 'Sofia',
    nickname: 'Sofi',
    age: 7,
    avatar: 'Sofia',
    ageGroup: '7-9',
    targetSkills: ['creativity', 'knowledge', 'reasoning'],
    createdAt: '2026-11-10T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z',
    ...overrides
  };
}

describe('Ajuda KIDS 6.0 — Segurança, Atividades, Desenho e 7 Habilidades', () => {
  beforeAll(() => {
    ensureNodeLocalStorage();
  });

  beforeEach(() => {
    ensureNodeLocalStorage();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Segurança Determinística Cross-Device (SHA-256 + Legado fb_)', () => {
    it('sha256Hex deve gerar hash determinístico idêntico ao padrão FIPS 180-4 sem WebCrypto', () => {
      // Standard test vector: sha256("abc")
      expect(sha256Hex('abc')).toBe(
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
      );
      expect(sha256Hex('ajuda-kids-cross-device')).toBe(sha256Hex('ajuda-kids-cross-device'));
    });

    it('verifyPin deve validar hashes SHA-256 atuais E hashes legados com prefixo fb_', async () => {
      const salt = 'salt_12345678';
      const pin = '2468';

      const shaHash = await hashPin(pin, salt);
      expect(shaHash).toHaveLength(64);
      expect(await verifyPin(pin, salt, shaHash)).toBe(true);
      expect(await verifyPin('9999', salt, shaHash)).toBe(false);

      const legacyHash = computeLegacyBitwiseHash(pin, salt);
      expect(legacyHash.startsWith('fb_')).toBe(true);
      expect(await verifyPin(pin, salt, legacyHash)).toBe(true);
      expect(await verifyPin('0000', salt, legacyHash)).toBe(false);
    });
  });

  describe('2. Recuperação de Senha em 2 Etapas (Código Válido, Inválido e Expirado)', () => {
    it('deve validar código de verificação e rejeitar códigos incorretos ou expirados', async () => {
      await authService.registerParent({
        parentName: 'Carlos Responsável',
        username: 'carlos.ak6',
        email: 'carlos.ak6@exemplo.com',
        password: 'SenhaInicial@123',
        pin: '1357'
      });

      const req = await authService.requestPasswordReset('carlos.ak6@exemplo.com');
      expect(req.success).toBe(true);
      expect(req.localVerificationCode).toBeTruthy();

      const wrongCodeConfirm = await authService.confirmPasswordReset({
        identifier: 'carlos.ak6@exemplo.com',
        code: '000000',
        newPassword: 'NovaSenhaForte@999'
      });
      expect(wrongCodeConfirm.success).toBe(false);

      const validConfirm = await authService.confirmPasswordReset({
        identifier: 'carlos.ak6@exemplo.com',
        code: req.localVerificationCode || '',
        newPassword: 'NovaSenhaForte@999'
      });
      expect(validConfirm.success).toBe(true);

      // Reusing same code must fail after consumption
      const replayConfirm = await authService.confirmPasswordReset({
        identifier: 'carlos.ak6@exemplo.com',
        code: req.localVerificationCode || '',
        newPassword: 'OutraSenha@123'
      });
      expect(replayConfirm.success).toBe(false);
    });
  });

  describe('3. Reconhecimento Heurístico de Desenho (Sem Falso Positivo com Papel Vazio)', () => {
    it('deve detectar tela vazia antes dos traços e reconhecer geometria de Arco-Íris ou Sol', () => {
      const empty = analyzeDrawingCanvas(null, []);
      expect(empty.bestGuess.confidence).toBe(0);
      expect(empty.stats.strokeCount).toBe(0);

      // Arcos coloridos largos simulando arco-íris (3+ cores, curvatura e largura horizontal)
      const rainbowStrokes: DrawingStroke[] = ['#EF4444', '#FACC15', '#3B82F6', '#22C55E'].map(
        (color, idx) => ({
          color,
          width: 10,
          tool: 'crayon',
          points: [
            { x: 40, y: 200 - idx * 14 },
            { x: 100, y: 140 - idx * 14 },
            { x: 180, y: 110 - idx * 14 },
            { x: 260, y: 120 - idx * 14 },
            { x: 320, y: 150 - idx * 14 },
            { x: 360, y: 200 - idx * 14 }
          ]
        })
      );

      const recognized = analyzeDrawingCanvas(null, rainbowStrokes);
      expect(recognized.stats.strokeCount).toBe(4);
      expect(recognized.stats.dominantColors).toBe(4);
      expect(recognized.bestGuess.label.toLowerCase()).toContain('arco');
      expect(recognized.bestGuess.confidence).toBeGreaterThan(50);
    });
  });

  describe('4. Banco de Atividades Sem Dicas Óbvias + 7 Áreas + Multi-Tarefa + Trilha 6 Passos', () => {
    it('Ordem da Sementinha não deve conter números e Direções não deve conter emojis de seta', () => {
      const seqAct = ACTIVITIES_DATABASE.find((a) => a.id === 'rea_seq_all');
      expect(seqAct).toBeTruthy();
      expect(seqAct?.tasks && seqAct.tasks.length).toBeGreaterThanOrEqual(3);
      seqAct?.tasks?.forEach((t) => {
        t.sequence?.forEach((step) => {
          expect(step).not.toMatch(/^\s*\d+\./);
          expect(step).not.toMatch(/\b[1-4]\.\s/);
        });
      });

      const dirAct = ACTIVITIES_DATABASE.find((a) => a.id === 'mot_02_7-9');
      expect(dirAct).toBeTruthy();
      expect(dirAct?.tasks && dirAct.tasks.length).toBeGreaterThanOrEqual(3);
      dirAct?.tasks?.forEach((t) => {
        expect(t.prompt).not.toMatch(/[➡️⬅️⬆️⬇️]/);
        t.options?.forEach((opt) => {
          expect(opt.text).not.toMatch(/[➡️⬅️⬆️⬇️]/);
        });
      });
    });

    it('deve incluir todas as 7 áreas de habilidade no EvolutionService e gerar trilha diária de 6 passos', async () => {
      const storage = new StorageService();
      const child = createSampleChild();
      await storage.saveChild(child);

      const journeySvc = new JourneyService();
      const journey = await journeySvc.getOrCreateTodayJourney(child);
      expect(journey.steps).toHaveLength(6);

      const evolution = new EvolutionService();
      const report = await evolution.generateReport(child, 'week');
      expect(Object.keys(report.skills)).toEqual(
        expect.arrayContaining([
          'communication',
          'reasoning',
          'attention',
          'emotional',
          'motor',
          'creativity',
          'knowledge'
        ])
      );
    });

    it('StorageService deve salvar/listar/remover desenhos e persistir progresso parcial multi-tarefa', async () => {
      const storage = new StorageService();
      const child = createSampleChild();

      const drawing: SavedDrawing = {
        id: 'draw_test_1',
        childId: child.id,
        title: 'Sol no Jardim',
        dataUrl: 'data:image/png;base64,AAA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedList = await storage.saveDrawing(drawing);
      expect(savedList).toHaveLength(1);
      expect(storage.getSavedDrawings(child.id)[0].title).toBe('Sol no Jardim');

      await storage.deleteDrawing('draw_test_1', child.id);
      expect(storage.getSavedDrawings(child.id)).toHaveLength(0);

      storage.saveActivityPartialProgress(child.id, 'rea_seq_all', 2, 3, 185);
      const resumed = storage.getActivityPartialProgress(child.id, 'rea_seq_all');
      expect(resumed).toEqual({ taskIndex: 2, totalTasks: 3, score: 185 });

      storage.clearActivityPartialProgress(child.id, 'rea_seq_all');
      expect(storage.getActivityPartialProgress(child.id, 'rea_seq_all')).toBeNull();
    });
  });
});
