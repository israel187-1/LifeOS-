import { useState } from 'react';
import { StoreProvider, useStore } from './state/store';
import type { StateRepository } from './data/storage';
import Home from './ui/Home';
import Session from './ui/Session';
import PathView from './ui/PathView';
import ProgressView from './ui/ProgressView';
import MoreView from './ui/MoreView';
import { beginSession, type SessionRequest } from './ui/startSession';
import { getRunner } from './python/runner';

type View = 'home' | 'path' | 'progress' | 'more';

const NAV: { id: View; label: string; icon: string }[] = [
  { id: 'home', label: 'Inicio', icon: '⌂' },
  { id: 'path', label: 'Ruta', icon: '☰' },
  { id: 'progress', label: 'Progreso', icon: '▲' },
  { id: 'more', label: 'Más', icon: '…' },
];

function Shell() {
  const { state, update } = useStore();
  const [view, setView] = useState<View>('home');
  const [inSession, setInSession] = useState(false);

  const start = (req: SessionRequest) => {
    if (req.kind !== 'next' && state.activeSession && !confirm('Tienes una sesión en curso. Se guardará como interrumpida y empezarás la nueva. ¿Continuar?')) return;
    getRunner().preload();
    update((s) => beginSession(s, req));
    setInSession(true);
  };

  if (inSession && state.activeSession) {
    return (
      <div className="app session-mode">
        <Session onExit={() => { setInSession(false); setView('home'); }} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">LifeOS</span>
        <nav className="nav">
          {NAV.map((n) => (
            <button key={n.id} className={view === n.id ? 'on' : ''} onClick={() => setView(n.id)} aria-current={view === n.id ? 'page' : undefined}>
              <span className="icon" aria-hidden>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
      </header>
      <div className="content">
        {view === 'home' && <Home onStart={start} onNavigate={setView} />}
        {view === 'path' && <PathView onStart={start} />}
        {view === 'progress' && <ProgressView />}
        {view === 'more' && (
          <MoreView
            onStart={(mode) => {
              update((s) => ({ ...s, settings: { ...s.settings, mode } }));
              start({ kind: 'next', mode });
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function App({ repository }: { repository?: StateRepository }) {
  return (
    <StoreProvider repository={repository}>
      <Shell />
    </StoreProvider>
  );
}
