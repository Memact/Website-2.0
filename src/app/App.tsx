import { useState, useEffect } from 'react';
import { Landing }       from './components/Landing';
import { IdentityView }  from './components/IdentityView';
import { PublicProfile } from './components/PublicProfile';
import { Auth }          from './components/Auth';
import { Onboarding }    from './components/Onboarding';
import { supabase, toUiVisibility, toDbVisibility, formatTimeAgo } from '../supabase';

export interface Entry {
  id: string;
  content: string;
  contributor: string;
  visibility: 'Public' | 'Friends' | 'Private';
  starred: boolean;
  time: string;
}

type Page = 'landing' | 'identity' | 'public' | 'auth' | 'onboarding';

export default function App() {
  const [page,   setPage]   = useState<Page>('landing');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isLightPreferred = window.matchMedia('(prefers-color-scheme: light)').matches;
      return !isLightPreferred;
    }
    return true;
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [initialEmail, setInitialEmail] = useState('');
  const [isClaimed, setIsClaimed] = useState(false);

  // Dynamic Document Title based on current page
  useEffect(() => {
    if (page === 'landing') {
      document.title = 'Memact | Home';
    } else if (page === 'auth') {
      document.title = authMode === 'login' ? 'Memact | Sign in' : 'Memact | Create account';
    } else if (page === 'onboarding') {
      document.title = 'Memact | Set up';
    } else if (page === 'public') {
      document.title = 'Memact | Profile';
    }
  }, [page, authMode]);

  // Global Record States
  const [username, setUsername] = useState('alex');
  const [fullName, setFullName] = useState('Alex Chen');
  const [entries, setEntries] = useState<Entry[]>([
    { id: 'e1', content: 'Learning how memory agents connect.', contributor: 'You', visibility: 'Private', starred: false, time: 'Just now' },
    { id: 'e2', content: 'Building Memact address protocol beta.', contributor: 'You', visibility: 'Public', starred: true, time: '2h ago' },
    { id: 'e3', content: 'Tokyo subway architecture research & essay.', contributor: 'Claude', visibility: 'Private', starred: false, time: '3h ago' },
    { id: 'e4', content: 'Sofia says I am funny.', contributor: 'Sofia M.', visibility: 'Friends', starred: true, time: 'Yesterday' },
    { id: 'e5', content: 'Minimalist typography and industrial brutalism.', contributor: 'You', visibility: 'Public', starred: false, time: '3 days ago' },
    { id: 'e6', content: 'Run the Golden Gate trail.', contributor: 'You', visibility: 'Public', starred: false, time: '4 days ago' }
  ]);

  // Auth session listener
  useEffect(() => {
    if (!supabase) return;

    const loadUserData = async (userId: string) => {
      try {
        const { data: profile } = await supabase
          .from('memact_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profile) {
          setUsername(profile.username);
          setFullName(profile.full_name);

          const { data: dbContributions } = await supabase
            .from('memact_contributions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'approved');

          if (dbContributions) {
            setEntries(
              dbContributions.map((c: any) => ({
                id: c.id,
                content: c.content,
                contributor: c.contributor_name,
                visibility: toUiVisibility(c.visibility),
                starred: c.is_starred,
                time: formatTimeAgo(c.created_at)
              }))
            );
          }
          setPage('identity');
        } else {
          setPage('onboarding');
        }
      } catch (err) {
        console.error("Error loading user data from Supabase:", err);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        loadUserData(session.user.id);
      } else {
        setUsername('alex');
        setFullName('Alex Chen');
        // Reset to mock entries when logged out
        setEntries([
          { id: 'e1', content: 'Learning how memory agents connect.', contributor: 'You', visibility: 'Private', starred: false, time: 'Just now' },
          { id: 'e2', content: 'Building Memact address protocol beta.', contributor: 'You', visibility: 'Public', starred: true, time: '2h ago' },
          { id: 'e3', content: 'Tokyo subway architecture research & essay.', contributor: 'Claude', visibility: 'Private', starred: false, time: '3h ago' },
          { id: 'e4', content: 'Sofia says I am funny.', contributor: 'Sofia M.', visibility: 'Friends', starred: true, time: 'Yesterday' },
          { id: 'e5', content: 'Minimalist typography and industrial brutalism.', contributor: 'You', visibility: 'Public', starred: false, time: '3 days ago' },
          { id: 'e6', content: 'Run the Golden Gate trail.', contributor: 'You', visibility: 'Public', starred: false, time: '4 days ago' }
        ]);
        setPage('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
          onBack={() => {
            if (supabase) {
              supabase.auth.signOut();
            }
            setPage('landing');
          }}
          onPublicView={() => setPage('public')}
          isDark={isDark}
          onToggleDark={toggleDark}
          username={username}
          fullName={fullName}
          entries={entries}
          onUpdateEntries={setEntries}
          isClaimed={isClaimed}
          onUpgradeToManaged={() => setIsClaimed(false)}
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
          onSuccess={(isClaimedSignUp, email, userHandle) => {
            if (isClaimedSignUp) {
              setIsClaimed(true);
              setUsername(userHandle || 'alex');
              setFullName(email ? email.split('@')[0] : 'Alex Chen');
              setPage('identity');
            } else {
              setIsClaimed(false);
              if (authMode === 'signup') {
                setPage('onboarding');
              } else {
                setPage('identity');
              }
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
          onComplete={async (user, name, focus, focusVis, prefs, prefsVis) => {
            setUsername(user);
            setFullName(name);

            if (supabase) {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                const authUser = session?.user;
                if (authUser) {
                  await supabase.from('memact_profiles').insert({
                    id: authUser.id,
                    username: user,
                    full_name: name
                  });

                  await supabase.from('memact_contributions').insert([
                    {
                      user_id: authUser.id,
                      content: focus,
                      contributor_type: 'user',
                      contributor_name: name,
                      status: 'approved',
                      visibility: toDbVisibility(focusVis),
                      is_starred: true
                    },
                    {
                      user_id: authUser.id,
                      content: prefs,
                      contributor_type: 'user',
                      contributor_name: name,
                      status: 'approved',
                      visibility: toDbVisibility(prefsVis),
                      is_starred: false
                    }
                  ]);
                }
              } catch (err) {
                console.error("Error completing onboarding in Supabase:", err);
              }
            }

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

    </>
  );
}
