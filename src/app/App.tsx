import { useState, useEffect } from 'react';
import { Landing }       from './components/Landing';
import { IdentityView }  from './components/IdentityView';
import { PublicProfile } from './components/PublicProfile';
import { Auth }          from './components/Auth';
import { FaqPage }       from './components/FaqPage';
import { Onboarding }    from './components/Onboarding';

export interface Entry {
  id: string;
  content: string;
  contributor: string;
  visibility: 'Public' | 'Friends' | 'Private';
  starred: boolean;
  time: string;
}

type Page = 'landing' | 'identity' | 'public' | 'auth' | 'faq' | 'onboarding';

export default function App() {
  const [page,   setPage]   = useState<Page>('landing');
  const [isDark, setIsDark] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [initialEmail, setInitialEmail] = useState('');

  // Global Record States
  const [username, setUsername] = useState('alex');
  const [fullName, setFullName] = useState('Alex Chen');
  const [entries, setEntries] = useState<Entry[]>([
    { id: 'e1', content: 'Learning Model Context Protocol (MCP).', contributor: 'You', visibility: 'Private', starred: false, time: 'Just now' },
    { id: 'e2', content: 'Building Memact address protocol beta.', contributor: 'You', visibility: 'Public', starred: true, time: '2h ago' },
    { id: 'e3', content: 'Tokyo subway architecture research & essay.', contributor: 'Claude', visibility: 'Private', starred: false, time: '3h ago' },
    { id: 'e4', content: 'Sofia says I am funny.', contributor: 'Sofia M.', visibility: 'Friends', starred: true, time: 'Yesterday' },
    { id: 'e5', content: 'Minimalist typography and industrial brutalism.', contributor: 'You', visibility: 'Public', starred: false, time: '3 days ago' },
    { id: 'e6', content: 'Run the Golden Gate trail.', contributor: 'You', visibility: 'Public', starred: false, time: '4 days ago' }
  ]);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) html.classList.add('dark');
    else        html.classList.remove('dark');
  }, [isDark]);

  const toggleDark = () => setIsDark((d) => !d);

  return (
    <>
      {page === 'landing'  && (
        <Landing
          onNavigate={(target, tab, email) => {
            setPage(target);
            if (tab) setAuthMode(tab);
            if (email) setInitialEmail(email);
          }}
          isDark={isDark}
          onToggleDark={toggleDark}
        />
      )}
      {page === 'identity' && (
        <IdentityView
          onBack={() => setPage('landing')}
          onPublicView={() => setPage('public')}
          isDark={isDark}
          onToggleDark={toggleDark}
          username={username}
          fullName={fullName}
          entries={entries}
          onUpdateEntries={setEntries}
        />
      )}
      {page === 'public'   && (
        <PublicProfile
          onBack={() => setPage('identity')}
          onClaim={() => {
            setPage('auth');
            setAuthMode('signup');
            setInitialEmail('');
          }}
          isDark={isDark}
          username={username}
          fullName={fullName}
          entries={entries}
        />
      )}
      {page === 'auth'     && (
        <Auth
          onBack={() => setPage('landing')}
          onSuccess={() => {
            if (authMode === 'signup') {
              setPage('onboarding');
            } else {
              setPage('identity');
            }
          }}
          isDark={isDark}
          onToggleDark={toggleDark}
          initialTab={authMode}
          initialEmail={initialEmail}
        />
      )}
      {page === 'onboarding' && (
        <Onboarding
          onBack={() => setPage('auth')}
          onComplete={(user, name, focus, focusVis, prefs, prefsVis) => {
            setUsername(user);
            setFullName(name);
            setEntries([
              { id: 'e1', content: focus, contributor: 'You', visibility: focusVis, starred: true, time: 'Just now' },
              { id: 'e2', content: prefs, contributor: 'You', visibility: prefsVis, starred: false, time: 'Just now' }
            ]);
            setPage('identity');
          }}
          isDark={isDark}
          onToggleDark={toggleDark}
          initialEmail={initialEmail}
        />
      )}
      {page === 'faq'      && (
        <FaqPage
          onBack={() => setPage('landing')}
          isDark={isDark}
          onToggleDark={toggleDark}
        />
      )}
    </>
  );
}
