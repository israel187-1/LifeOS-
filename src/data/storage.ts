import { openDB, type IDBPDatabase } from 'idb';
import { emptyState } from '../domain/progress';
import type { AppState } from '../domain/types';

/** Persistence boundary: swap for an API-backed implementation to sync across devices. */
export interface StateRepository {
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<void>;
}

const DB_NAME = 'lifeos';
const STORE = 'kv';
const KEY = 'state';

export class IndexedDbRepository implements StateRepository {
  private db: Promise<IDBPDatabase>;
  constructor(name = DB_NAME) {
    this.db = openDB(name, 1, {
      upgrade(db) {
        db.createObjectStore(STORE);
      },
    });
  }
  async load() {
    const raw = await (await this.db).get(STORE, KEY);
    return raw ? normalizeState(raw) : null;
  }
  async save(state: AppState) {
    await (await this.db).put(STORE, structuredClone(state), KEY);
  }
}

export class LocalStorageRepository implements StateRepository {
  private key: string;
  constructor(key = 'lifeos-state') {
    this.key = key;
  }
  async load() {
    const raw = localStorage.getItem(this.key);
    return raw ? normalizeState(JSON.parse(raw)) : null;
  }
  async save(state: AppState) {
    localStorage.setItem(this.key, JSON.stringify(state));
  }
}

/**
 * IndexedDB is the main store; a synchronous localStorage mirror guarantees the last
 * change survives even if the tab is closed while an async IndexedDB write is pending.
 */
export class MirroredRepository implements StateRepository {
  private primary: StateRepository;
  private mirror: LocalStorageRepository;
  constructor(primary: StateRepository, mirror = new LocalStorageRepository('lifeos-mirror')) {
    this.primary = primary;
    this.mirror = mirror;
  }
  async load() {
    const [a, b] = await Promise.all([this.primary.load().catch(() => null), this.mirror.load().catch(() => null)]);
    if (!a || !b) return a ?? b;
    return (b.savedAt ?? '') > (a.savedAt ?? '') ? b : a;
  }
  async save(state: AppState) {
    try {
      await this.mirror.save(state);
    } catch {
      // Quota exceeded: IndexedDB still holds the data.
    }
    await this.primary.save(state);
  }
}

export function createRepository(): StateRepository {
  if (typeof indexedDB !== 'undefined') return new MirroredRepository(new IndexedDbRepository());
  return new LocalStorageRepository();
}

/** Asks the browser not to evict our data under storage pressure (best effort). */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

/** Validates and fills defaults so older or partial data never breaks the app. */
export function normalizeState(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') throw new Error('Datos no válidos');
  const r = raw as Partial<AppState>;
  if (r.version !== 1) throw new Error('Versión de datos no compatible');
  const base = emptyState();
  const obj = <T,>(v: T | undefined, d: T): T => (v && typeof v === 'object' && !Array.isArray(v) ? v : d);
  const arr = <T,>(v: T[] | undefined): T[] => (Array.isArray(v) ? v : []);
  return {
    version: 1,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : base.createdAt,
    lessons: obj(r.lessons, {}),
    exercises: obj(r.exercises, {}),
    review: obj(r.review, {}),
    sessions: arr(r.sessions),
    activeSession: r.activeSession && Array.isArray(r.activeSession.steps) ? r.activeSession : null,
    obligations: arr(r.obligations),
    ideas: arr(r.ideas),
    englishDays: arr(r.englishDays),
    settings: { ...base.settings, ...obj(r.settings, base.settings) },
    ...(typeof r.savedAt === 'string' ? { savedAt: r.savedAt } : {}),
  };
}

export interface ExportFile {
  app: 'lifeos';
  exportedAt: string;
  state: AppState;
}

export function exportState(state: AppState, now = new Date()): string {
  const file: ExportFile = { app: 'lifeos', exportedAt: now.toISOString(), state };
  return JSON.stringify(file, null, 2);
}

export function importState(json: string): AppState {
  const parsed = JSON.parse(json) as Partial<ExportFile>;
  if (parsed.app !== 'lifeos' || !parsed.state) throw new Error('El archivo no es una copia de LifeOS');
  return normalizeState(parsed.state);
}
