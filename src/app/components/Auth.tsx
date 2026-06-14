import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import textLogoLight from '../../imports/text_logo_nobg_light.png';
import textLogoDark  from '../../imports/text_logo_nobg_dark.png';

interface AuthProps {
  onBack: () => void;
  onSuccess: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  initialTab?: 'login' | 'signup';
  initialEmail?: string;
}

export function Auth({
  onBack,
  onSuccess,
  isDark,
  onToggleDark,
  initialTab = 'login',
  initialEmail = '',
}: AuthProps) {
  const [isLogin, setIsLogin] = useState(initialTab === 'login');
  const [email, setEmail] = useState(initialEmail);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  // Sync state if props change
  useEffect(() => {
    setIsLogin(initialTab === 'login');
  }, [initialTab]);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin || (email && username && password && agree)) {
      onSuccess();
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col justify-between"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Top Header */}
      <nav className="flex items-center justify-between px-8 h-[60px] border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[18px] w-auto" />
        <div className="w-[60px]" /> {/* Spacer to center the logo */}
      </nav>

      {/* Auth Panel */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-card/40 border border-border p-8 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-3 text-sm font-semibold tracking-tight transition-colors border-b-2 ${
                isLogin ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-3 text-sm font-semibold tracking-tight transition-colors border-b-2 ${
                !isLogin ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Social Logins */}
          <div className="space-y-2 mb-5">
            <button
              type="button"
              onClick={onSuccess}
              className="w-full flex items-center justify-center gap-2.5 bg-secondary hover:bg-muted/70 border border-border text-foreground py-2.5 text-sm font-semibold rounded-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={onSuccess}
              className="w-full flex items-center justify-center gap-2.5 bg-secondary hover:bg-muted/70 border border-border text-foreground py-2.5 text-sm font-semibold rounded-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="shrink-0 text-foreground">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5 select-none">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs font-medium text-muted-foreground/60">or</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Choose your address
                </label>
                <div className="flex items-center bg-secondary border border-border focus-within:border-foreground/45 transition-colors px-3 py-2.5 rounded-sm">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                    placeholder="alex"
                    className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/30 font-medium"
                  />
                  <span className="text-sm text-muted-foreground/50 select-none">.memact.me</span>
                </div>
                {username && (
                  <span className="text-[10px] text-accent font-medium mt-1 flex items-center gap-1">
                    <Check size={10} /> {username}.memact.me is available
                  </span>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-secondary border border-border focus:border-foreground/45 transition-colors px-3 py-2.5 text-sm outline-none rounded-sm text-foreground placeholder:text-muted-foreground/30 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Password
              </label>
              <div className="relative flex items-center bg-secondary border border-border focus-within:border-foreground/45 transition-colors px-3 py-2.5 rounded-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/30 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-2"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="flex items-start gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAgree(!agree)}
                  className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                    agree ? 'bg-foreground border-foreground' : 'border-border hover:border-foreground/45'
                  }`}
                >
                  {agree && <Check size={10} className="text-background" />}
                </button>
                <span className="text-xs text-muted-foreground leading-normal select-none">
                  I agree to the terms of service and privacy guidelines.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isLogin && !agree}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-foreground text-background py-3 text-sm font-semibold hover:opacity-85 transition-opacity disabled:opacity-40"
            >
              {isLogin ? 'Sign in' : 'Create account'} <ArrowRight size={13} />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border flex items-center justify-between shrink-0">
        <span className="text-[10px] text-muted-foreground/50">© {new Date().getFullYear()} Memact. All rights reserved.</span>
        <div className="flex gap-4">
          <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Privacy</button>
          <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Terms</button>
        </div>
      </footer>
    </div>
  );
}
