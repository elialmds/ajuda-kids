import { describe, it, expect } from 'vitest';
import {
  FORM_STATE_TOKENS,
  TYPOGRAPHY_SCALE_8,
  SURFACE_ELEVATION_8
} from '@/design-system/tokens';
import { resolveFormFieldState } from '@/design-system/EliteForms';
import { filterAndSortCompletions } from '@/design-system/EliteDataViews';
import { ActivityCompletionRecord } from '@/types';

describe('Ajuda KIDS 8.0 — Design System, Forms & Data Views', () => {
  it('defines all 7 form visual states with accessible styling tokens', () => {
    const expectedStates = [
      'normal',
      'hover',
      'focus',
      'filled',
      'invalid',
      'disabled',
      'loading'
    ] as const;

    for (const state of expectedStates) {
      const token = FORM_STATE_TOKENS[state];
      expect(token).toBeDefined();
      expect(token.borderColor.length).toBeGreaterThan(0);
      expect(token.backgroundColor.length).toBeGreaterThan(0);
      expect(token.textColor.length).toBeGreaterThan(0);
    }

    expect(resolveFormFieldState({ disabled: true, hasValue: true })).toBe('disabled');
    expect(resolveFormFieldState({ isLoading: true })).toBe('loading');
    expect(resolveFormFieldState({ hasError: true, isFocused: true })).toBe('invalid');
    expect(resolveFormFieldState({ isFocused: true })).toBe('focus');
    expect(resolveFormFieldState({ isHovered: true })).toBe('hover');
    expect(resolveFormFieldState({ hasValue: true })).toBe('filled');
    expect(resolveFormFieldState({})).toBe('normal');
  });

  it('exposes typography and surface elevation tokens for adult and child UI', () => {
    expect(TYPOGRAPHY_SCALE_8.adultTitle).toContain('font-executive');
    expect(TYPOGRAPHY_SCALE_8.metricValue).toContain('tabular-nums');
    expect(SURFACE_ELEVATION_8.adultShell).toContain('shadow');
  });

  it('filters, searches and sorts activity completions accurately for data tables', () => {
    const sample: ActivityCompletionRecord[] = [
      {
        id: '1',
        childId: 'c1',
        activityId: 'a1',
        activityTitle: 'Fábrica das Letras',
        area: 'communication',
        durationMinutes: 5,
        score: 90,
        completedAt: '2026-11-10T10:00:00Z'
      },
      {
        id: '2',
        childId: 'c2',
        activityId: 'a2',
        activityTitle: 'Ordem da Sementinha',
        area: 'reasoning',
        durationMinutes: 8,
        score: 100,
        completedAt: '2026-11-12T12:00:00Z'
      },
      {
        id: '3',
        childId: 'c1',
        activityId: 'a3',
        activityTitle: 'Pintura com Flora',
        area: 'creativity',
        durationMinutes: 6,
        score: 95,
        completedAt: '2026-11-11T15:00:00Z'
      }
    ];

    const byChild = filterAndSortCompletions(sample, {
      childFilter: 'c1',
      sortField: 'score',
      sortDirection: 'desc'
    });
    expect(byChild.map((r) => r.id)).toEqual(['3', '1']);

    const bySearch = filterAndSortCompletions(sample, {
      searchQuery: 'sementinha'
    });
    expect(bySearch).toHaveLength(1);
    expect(bySearch[0].area).toBe('reasoning');

    const byAreaAsc = filterAndSortCompletions(sample, {
      areaFilter: 'all',
      sortField: 'duration',
      sortDirection: 'asc'
    });
    expect(byAreaAsc.map((r) => r.durationMinutes)).toEqual([5, 6, 8]);
  });
});
