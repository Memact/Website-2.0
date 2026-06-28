import { ArrowLeft, ArrowRight, Globe, Sun, Moon } from 'lucide-react';
import { Entry } from '../App';
import textLogoLight from "../../imports/text_logo_nobg_light.png";
import textLogoDark  from "../../imports/text_logo_nobg_dark.png";

interface PublicProfileProps {
  onBack: () => void;
  onClaim: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  username: string;
  fullName: string;
  entries: Entry[];
  isLoggedIn: boolean;
}

export function PublicProfile({
  onBack,
  onClaim,
  isDark,
  onToggleDark,
  username,
  fullName,
  entries,
  isLoggedIn,
}: PublicProfileProps) {
  // Filter entries based on visibility settings (only public)
  const visibleEntries = entries.filter((e) => e.visibility === 'Public');

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col justify-between"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-[60px] flex items-center justify-between gap-4">
          <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[42px] md:h-[50px] w-auto" />
          <div className="flex items-center gap-3">
            <button onClick={onToggleDark} className="text-muted-foreground hover:text-foreground transition-colors mr-1" aria-label="Toggle theme">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={onBack}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5 rounded-lg hover:bg-secondary/40 flex items-center gap-1.5"
            >
              <ArrowLeft size={12} /> {isLoggedIn ? 'Back' : 'Home'}
            </button>
          </div>
        </div>
      </header>

      {/* Address heading */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8 pb-4 w-full">
        <p className="text-2xl font-semibold tracking-tight">
          {username}<span className="text-muted-foreground">.memact.com</span>
        </p>
      </div>

      {/* Main Public Profile Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-6 space-y-8">
        
        {/* entries stream (Grid matching ApprovedCard) */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
            Public Details
          </div>

          {visibleEntries.length === 0 ? (
            <div className="p-8 border border-dashed border-border rounded-xl text-center bg-secondary/15 py-16 text-sm text-muted-foreground italic select-none">
              No public entries available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="w-full text-left bg-card border border-border rounded-xl p-4 transition-all hover:border-foreground/10"
                >
                  <p className="text-sm font-medium text-foreground leading-snug min-h-[40px]">
                    {entry.content}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground truncate">
                      By {entry.contributor === 'You' ? fullName : (entry.contributor || 'App')} • {entry.time}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 select-none shrink-0 border border-border/40 px-1.5 py-0.5 rounded-full bg-secondary/30">
                      <Globe size={10} className="text-chart-2" />
                      <span className="capitalize text-[8px] font-bold tracking-tight">Public</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Credentials / Metadata details card */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-xs space-y-2.5 max-w-sm">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 select-none">
            Verified Profile
          </div>
          
          <div className="flex justify-between items-center text-xs py-1.5 border-b border-border/40">
            <span className="font-semibold text-muted-foreground">Owner</span>
            <span className="font-medium text-foreground">{fullName}</span>
          </div>

          <div className="flex justify-between items-center text-xs py-1.5">
            <span className="font-semibold text-muted-foreground">Address</span>
            <a
              href={`https://${username}.memact.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-chart-2 hover:underline font-semibold"
            >
              {username}.memact.com
            </a>
          </div>
        </div>

        {/* Claim yours CTA */}
        <div className="py-8 border-t border-border/80 flex flex-col items-start gap-4">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-semibold">Tired of reintroducing yourself to the world?</p>
            <button
              onClick={onClaim}
              className="flex items-center gap-2 text-xs bg-foreground text-background px-5 py-2.5 font-bold hover:opacity-85 transition-opacity rounded-lg shadow-xs"
            >
              Get your personal address <ArrowRight size={12} />
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto px-4 md:px-6 py-6 border-t border-border flex items-center justify-between shrink-0 select-none">
        <span className="text-[10px] text-muted-foreground/50">© {new Date().getFullYear()} Memact. All rights reserved.</span>
        <div className="flex gap-4">
          <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Privacy</button>
          <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Terms</button>
        </div>
      </footer>
    </div>
  );
}
