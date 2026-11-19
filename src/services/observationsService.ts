import { getTodayDateString } from '@/utils/dateUtils';

export type PedagogicalPillarId =
  | 'linguagem'
  | 'raciocinio'
  | 'atencao'
  | 'coordenacao'
  | 'socioemocional';

export interface ParentObservation {
  id: string;
  childId: string;
  pillarId: PedagogicalPillarId;
  note: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

const STORAGE_KEY = 'ajuda_kids_parent_observations_v1';

class ObservationsService {
  private loadAll(): ParentObservation[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveAll(items: ParentObservation[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota error
    }
  }

  public getObservations(childId?: string): ParentObservation[] {
    const all = this.loadAll();
    const filtered = childId ? all.filter(item => item.childId === childId) : all;
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addObservation(input: {
    childId: string;
    pillarId: PedagogicalPillarId;
    note: string;
    date?: string;
  }): ParentObservation {
    const trimmed = input.note.trim();
    const record: ParentObservation = {
      id: `obs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      childId: input.childId,
      pillarId: input.pillarId,
      note: trimmed,
      date: input.date || getTodayDateString(),
      createdAt: new Date().toISOString()
    };
    const next = [record, ...this.loadAll()];
    this.saveAll(next);
    return record;
  }

  public deleteObservation(id: string): void {
    const next = this.loadAll().filter(item => item.id !== id);
    this.saveAll(next);
  }
}

export const observationsService = new ObservationsService();
