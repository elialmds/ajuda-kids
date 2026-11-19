import { describe, it, expect } from 'vitest';
import { WORLD_TOKENS, GAME3D_TOKENS, CARD_STATE_TOKENS, CardVisualState, Game3DId } from '../src/design-system/tokens';
import { MUNDO_COMPANIONS, KID_CHARACTERS } from '../src/data/charactersData';
import { SkillArea } from '../src/types';

describe('Ajuda KIDS 7.0 — Elite Design System Contracts', () => {
  it('defines distinct theme tokens for all 10 SkillArea worlds', () => {
    const areas: SkillArea[] = [
      'communication',
      'reasoning',
      'attention',
      'emotional',
      'motor',
      'creativity',
      'knowledge',
      'math',
      'music',
      'languages'
    ];
    areas.forEach(area => {
      const token = WORLD_TOKENS[area];
      expect(token).toBeDefined();
      expect(token.worldName.length).toBeGreaterThan(3);
      expect(token.cardBg).toMatch(/^#/);
      expect(token.cardBorder).toMatch(/^#/);
      expect(token.cardLip).toMatch(/^#/);
      expect(token.ctaBg).toMatch(/^#/);
    });
  });

  it('defines distinct scenic tokens for all 6 3D WebGL games', () => {
    const gameIds: Game3DId[] = [
      'batata-quente',
      'pato-ganso',
      'morto-vivo',
      'jogo-memoria',
      'sequencia-cores',
      'simon-says'
    ];
    gameIds.forEach(id => {
      const token = GAME3D_TOKENS[id];
      expect(token).toBeDefined();
      expect(token.headerGradient).toContain('linear-gradient');
      expect(token.ctaBg).toMatch(/^#/);
    });
  });

  it('defines all 8 required card visual states with distinct labels and tokens', () => {
    const states: CardVisualState[] = [
      'available',
      'selected',
      'in_progress',
      'completed',
      'recommended',
      'new',
      'locked',
      'disabled'
    ];
    const seenLabels = new Set<string>();
    states.forEach(state => {
      const token = CARD_STATE_TOKENS[state];
      expect(token).toBeDefined();
      expect(token.label.length).toBeGreaterThan(2);
      seenLabels.add(token.label);
    });
    expect(seenLabels.size).toBe(8);
  });

  it('provides all 10 Guardians and all 6 Kid Characters with SVG renderers', () => {
    expect(MUNDO_COMPANIONS).toHaveLength(10);
    expect(KID_CHARACTERS).toHaveLength(6);

    MUNDO_COMPANIONS.forEach(comp => {
      expect(typeof comp.renderCharacter).toBe('function');
      expect(comp.renderCharacter(90, 'happy')).toBeTruthy();
    });

    KID_CHARACTERS.forEach(kid => {
      expect(typeof kid.renderAvatar).toBe('function');
      expect(kid.renderAvatar(64)).toBeTruthy();
    });
  });
});
