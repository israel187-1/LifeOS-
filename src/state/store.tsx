import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createRepository, requestPersistentStorage, type StateRepository } from '../data/storage';
import { emptyState } from '../domain/progress';
import type { AppState } from '../domain/types';

export type Updater = (fn: (s: AppState) => AppState) => void;

interface Store {
  state: AppState;
  update: Updater;
  replace: (s: AppState) => void;
  saveError: string | null;
}

const StoreContext = createContext<Store | null>(null);

const SAVE_DELAY_MS = 300;

export function StoreProvider({ repository, children }: { repository?: StateRepository; children: ReactNode }) {
  const repo = useRef(repository ?? createRepository());
  const [state, setState] = useState<AppState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const latest = useRef<AppState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo.current
      .load()
      .then((s) => {
        if (!cancelled) setState(s ?? emptyState());
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLoadError(String(e));
          setState(emptyState());
        }
      });
    void requestPersistentStorage();
    return () => {
      cancelled = true;
    };
  }, []);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (latest.current)
      repo.current.save({ ...latest.current, savedAt: new Date().toISOString() }).then(
        () => setSaveError(null),
        (e: unknown) => setSaveError(String(e)),
      );
  }, []);

  useEffect(() => {
    if (!state) return;
    const prev = latest.current;
    latest.current = state;
    // Starting/finishing a session or logging results is saved at once; ticks and drafts are debounced.
    const important =
      prev !== null &&
      (prev.activeSession?.id !== state.activeSession?.id ||
        prev.activeSession?.stepIndex !== state.activeSession?.stepIndex ||
        prev.sessions.length !== state.sessions.length ||
        prev.lessons !== state.lessons);
    if (important) return flush();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DELAY_MS);
  }, [state, flush]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [flush]);

  const update = useCallback<Updater>((fn) => setState((s) => (s ? fn(s) : s)), []);
  const replace = useCallback((s: AppState) => setState(s), []);

  if (!state) return <div className="loading">Cargando LifeOS…</div>;
  return (
    <StoreContext.Provider value={{ state, update, replace, saveError: saveError ?? loadError }}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore fuera de StoreProvider');
  return s;
}
