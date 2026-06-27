import { useState, useEffect } from 'react';
import { Landing }      from './components/Landing';
import { AddressPage }  from './components/AddressPage';
import { PublicProfile } from './components/PublicProfile';
import { Auth }          from './components/Auth';
import { Onboarding }    from './components/Onboarding';
import { supabase, toUiVisibility, toDbVisibility, formatTimeAgo } from '../supabase';

export interface Entry {
  id: string;
  content: string;
  contributor: string;
  visibility: 'Public' | 'Private';
  starred: boolean;
  time: string;
}

export interface PendingEntry {
  id: string;
  content: string;
  contributor_name: string;
  contributor_type: string;
  visibility: string;
  created_at: string;
}

type Page = 'landing' | 'address' | 'public' | 'auth' | 'onboarding';

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

  // Subdomain routing detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    let subdomain = '';
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
        subdomain = parts[0];
      }
    } else if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'memact') {
      subdomain = parts[0];
    }

    if (subdomain) {
      const fetchPublicSubdomain = async () => {
        try {
          if (!supabase) return;
          const { data: profile } = await supabase
            .from('memact_profiles')
            .select('*')
            .eq('username', subdomain)
            .maybeSingle();
            
          if (profile) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && session.user.id === profile.id) {
              // The user owns this subdomain, let loadUserData render the dashboard
              return;
            }

            setUsername(profile.username);
            setFullName(profile.full_name);
            
            const { data: contributions } = await supabase
              .from('memact_contributions')
              .select('*')
              .eq('user_id', profile.id)
              .eq('status', 'approved')
              .eq('visibility', 'public')
              .order('created_at', { ascending: false });
              
            if (contributions) {
              setEntries(
                contributions.map((c: any) => ({
                  id: c.id,
                  content: c.content,
                  contributor: c.contributor_name,
                  visibility: 'Public',
                  starred: c.is_starred,
                  time: formatTimeAgo(c.created_at)
                }))
              );
            }
            setPage('public');
          }
        } catch (err) {
          console.error("Error loading subdomain profile:", err);
        }
      };
      
      fetchPublicSubdomain();
    }
  }, []);

  // Global Record States
  const [username, setUsername] = useState('sujay');
  const [fullName, setFullName] = useState('Sujay Sudhir');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);

  // Auth session listener
  useEffect(() => {
    if (!supabase) return;

    const loadUserData = async (userId: string) => {
      try {
        if (!supabase) return;
        const { data: profile } = await supabase
          .from('memact_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profile) {
          if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            let currentSubdomain = '';
            
            if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
              if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') currentSubdomain = parts[0];
            } else if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'memact') {
              currentSubdomain = parts[0];
            }
            
            if (currentSubdomain && currentSubdomain !== profile.username) {
              // User is logged in but viewing a different subdomain
              return;
            }
            
            if (!currentSubdomain) {
              const protocol = window.location.protocol;
              const port = window.location.port ? `:${window.location.port}` : '';
              const baseDomain = hostname.includes('localhost') ? 'localhost' : 'memact.com';
              window.location.href = `${protocol}//${profile.username}.${baseDomain}${port}`;
              return;
            }
          }
          
          setUsername(profile.username);
          setFullName(profile.full_name);

          const { data: dbContributions } = await supabase
            .from('memact_contributions')
            .select('*')
            .eq('user_id', userId)
            .in('status', ['approved', 'pending'])
            .order('created_at', { ascending: false });

          if (dbContributions) {
            const approved = dbContributions.filter((c: any) => c.status === 'approved' && c.content?.trim());
            const pending  = dbContributions.filter((c: any) => c.status === 'pending'  && c.content?.trim());

            setEntries(
              approved.map((c: any) => ({
                id: c.id,
                content: c.content,
                contributor: c.contributor_name,
                visibility: toUiVisibility(c.visibility),
                starred: c.is_starred,
                time: formatTimeAgo(c.created_at)
              }))
            );

            setPendingEntries(
              pending.map((c: any) => ({
                id: c.id,
                content: c.content,
                contributor_name: c.contributor_name,
                contributor_type: c.contributor_type,
                visibility: c.visibility,
                created_at: c.created_at
              }))
            );
          }
          setPage('address');
        } else {
          setPage('onboarding');
        }
      } catch (err) {
        console.error("Error loading user data from Supabase:", err);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const provider = session.user.app_metadata.provider;
        if (provider === 'email') {
          localStorage.setItem('memact_last_auth', 'native');
        } else if (provider) {
          localStorage.setItem('memact_last_auth', provider);
        }
        loadUserData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const provider = session.user.app_metadata.provider;
        if (provider === 'email') {
          localStorage.setItem('memact_last_auth', 'native');
        } else if (provider) {
          localStorage.setItem('memact_last_auth', provider);
        }
        loadUserData(session.user.id);
      } else {
        setUsername('john');
        setFullName('John Doe');
        setEntries([]);
        setPendingEntries([]);
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
      {page === 'address' && (
        <AddressPage
          username={username}
          fullName={fullName}
          isDark={isDark}
          onToggleDark={toggleDark}
          onSignOut={async () => {
            if (supabase) await supabase.auth.signOut();
            setPage('landing');
          }}
        />
      )}
      {page === 'public'   && (
        <PublicProfile
          onBack={() => setPage('address')}
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
              setPage('address');
            } else {
              setIsClaimed(false);
              if (authMode === 'signup') {
                setPage('onboarding');
              } else {
                setPage('address');
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

                  const contributionsToInsert = [];
                  if (focus.trim()) {
                    contributionsToInsert.push({
                      user_id: authUser.id,
                      content: focus.trim(),
                      contributor_type: 'user',
                      contributor_name: name,
                      status: 'approved',
                      visibility: toDbVisibility(focusVis),
                      is_starred: true
                    });
                  }
                  if (prefs.trim()) {
                    contributionsToInsert.push({
                      user_id: authUser.id,
                      content: prefs.trim(),
                      contributor_type: 'user',
                      contributor_name: name,
                      status: 'approved',
                      visibility: toDbVisibility(prefsVis),
                      is_starred: false
                    });
                  }
                  if (contributionsToInsert.length > 0) {
                    await supabase.from('memact_contributions').insert(contributionsToInsert);
                  }
                }
              } catch (err) {
                console.error("Error completing onboarding in Supabase:", err);
              }
            }

            const initialEntries = [];
            if (focus.trim()) {
              initialEntries.push({ id: 'e1', content: focus.trim(), contributor: 'You', visibility: focusVis, starred: true, time: 'Just now' });
            }
            if (prefs.trim()) {
              initialEntries.push({ id: 'e2', content: prefs.trim(), contributor: 'You', visibility: prefsVis, starred: false, time: 'Just now' });
            }
            setEntries(initialEntries);
            setPage('address');
          }}
          isDark={isDark}
          onToggleDark={toggleDark}
          initialEmail={initialEmail}
        />
      )}

    </>
  );
}
