import { useState, useEffect } from 'react';
import { Landing }      from './components/Landing';
import { AddressPage }  from './components/AddressPage';
import { PublicProfile } from './components/PublicProfile';
import { Auth }          from './components/Auth';
import { Onboarding }    from './components/Onboarding';
import { supabase, toUiVisibility, toDbVisibility, formatTimeAgo } from '../supabase';
import { Sun, Moon } from 'lucide-react';
import textLogoLight from '../imports/text_logo_nobg_light.png';
import textLogoDark  from '../imports/text_logo_nobg_dark.png';

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

type Page = 'loading' | 'landing' | 'address' | 'public' | 'auth' | 'onboarding' | 'not-found';

export default function App() {
  const [page,   setPage]   = useState<Page>('loading');
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    } else if (page === 'loading') {
      document.title = 'Memact | Loading';
    }
  }, [page, authMode]);

  // Global Record States
  const [detectedSubdomain, setDetectedSubdomain] = useState('');
  const [username, setUsername] = useState('john');
  const [fullName, setFullName] = useState('John Doe');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);

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
            // Logged in user is viewing a different subdomain
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
      setPage('landing');
    }
  };

  // Subdomain & Auth initialization
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Detect subdomain
      let subdomain = '';
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
          if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
            subdomain = parts[0];
          }
        } else if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'memact') {
          subdomain = parts[0];
        }
      }

      if (subdomain) {
        setDetectedSubdomain(subdomain);
      }

      if (!supabase) {
        setPage('landing');
        return;
      }

      // 2. Fetch session
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (subdomain) {
        // Subdomain flow
        try {
          const { data: profile } = await supabase
            .from('memact_profiles')
            .select('*')
            .eq('username', subdomain)
            .maybeSingle();

          if (profile) {
            // Is the logged in user the owner of this subdomain?
            if (session && session.user.id === profile.id) {
              await loadUserData(session.user.id);
            } else {
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
          } else {
            setPage('not-found');
          }
        } catch (err) {
          console.error("Error loading subdomain profile:", err);
          setPage('not-found');
        }
      } else {
        // Main domain flow
        if (session) {
          await loadUserData(session.user.id);
        } else {
          setPage('landing');
        }
      }
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
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
        setPage(prev => (prev === 'public' || prev === 'not-found') ? prev : 'landing');
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
      {page === 'loading' && (
        <div className="min-h-screen bg-[#00011B] flex flex-col items-center justify-center select-none" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border border-accent/30 animate-ping opacity-75" />
              {/* Inner loading ring */}
              <div className="absolute inset-1 rounded-full border-t-2 border-r-2 border-accent animate-spin" />
              {/* Central brand mark */}
              <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center font-bold text-accent text-xs">
                m
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 tracking-wider font-semibold animate-pulse uppercase">
              serving address
            </div>
          </div>
        </div>
      )}
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
          onBack={async () => {
            if (isLoggedIn) {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                setPage('loading');
                await loadUserData(session.user.id);
              } else {
                setPage('landing');
              }
            } else {
              setPage('landing');
            }
          }}
          onClaim={() => {
            setPage('auth');
            setAuthMode('signup');
            setInitialEmail('');
          }}
          isDark={isDark}
          onToggleDark={toggleDark}
          username={username}
          fullName={fullName}
          entries={entries}
          isLoggedIn={isLoggedIn}
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
                  const { error: profileErr } = await supabase.from('memact_profiles').upsert({
                    id: authUser.id,
                    username: user,
                    full_name: name
                  });

                  if (profileErr) {
                    console.error("Error saving profile:", profileErr);
                  }

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
                    const { error: contribErr } = await supabase.from('memact_contributions').insert(contributionsToInsert);
                    if (contribErr) {
                      console.error("Error saving contributions:", contribErr);
                    }
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
      {page === 'not-found' && (
        <div
          className="min-h-screen bg-background text-foreground flex flex-col justify-between"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="max-w-4xl mx-auto px-4 md:px-6 h-[60px] flex items-center justify-between gap-4">
              <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[42px] md:h-[50px] w-auto" />
              <button onClick={toggleDark} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle theme">
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/15 border border-accent/25 px-2.5 py-1 rounded-full">
                404 Not Found
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-3">Address not claimed</h1>
              <p className="font-mono text-sm text-muted-foreground font-semibold mt-1">
                {detectedSubdomain}.memact.com
              </p>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs font-medium text-muted-foreground/80">
              This personal address is currently unclaimed. You can claim it now and start controlling what apps know about you.
            </p>

            <div className="pt-2 w-full space-y-2">
              <button
                onClick={() => {
                  setPage('auth');
                  setAuthMode('signup');
                  setInitialEmail('');
                }}
                className="w-full bg-foreground text-background py-3 text-xs font-bold hover:opacity-85 transition-opacity rounded-lg shadow-sm"
              >
                Claim {detectedSubdomain}.memact.com
              </button>
              <a
                href="https://memact.com"
                className="block text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors pt-2 underline"
                onClick={(e) => {
                  e.preventDefault();
                  // Reset back to landing page
                  setDetectedSubdomain('');
                  setPage('landing');
                }}
              >
                Go to Memact home
              </a>
            </div>
          </main>

          <footer className="max-w-4xl w-full mx-auto px-4 md:px-6 py-6 border-t border-border flex items-center justify-between shrink-0 select-none">
            <span className="text-[10px] text-muted-foreground/50">© {new Date().getFullYear()} Memact. All rights reserved.</span>
            <span className="text-[10px] text-muted-foreground/50 font-medium">Secured via Memact protocol</span>
          </footer>
        </div>
      )}

    </>
  );
}
