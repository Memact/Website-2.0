import { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Globe, Star, Users } from 'lucide-react';
import { Entry } from '../App';

interface PublicProfileProps {
  onBack: () => void;
  onClaim: () => void;
  isDark: boolean;
  username: string;
  fullName: string;
  entries: Entry[];
}

export function PublicProfile({
  onBack,
  onClaim,
  isDark,
  username,
  fullName,
  entries,
}: PublicProfileProps) {
  const [previewMode, setPreviewMode] = useState<'public' | 'friend'>('public');

  // Filter entries based on visibility settings
  const visibleEntries = entries.filter((e) => {
    if (previewMode === 'public') {
      return e.visibility === 'Public';
    }
    // 'friend' mode sees Public and Friends visibility
    return e.visibility === 'Public' || e.visibility === 'Friends';
  });

  // Initials for avatar
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col justify-between"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Top Navigation Strip */}
      <div className="flex items-center justify-between px-8 h-[65px] border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-50">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold border border-border px-3 py-1.5 rounded-sm hover:bg-secondary/40"
        >
          <ArrowLeft size={13} /> Back to You
        </button>
        
        {/* Preview Selector */}
        <div className="flex items-center bg-secondary border border-border p-0.5 rounded-sm select-none">
          <button
            onClick={() => setPreviewMode('public')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-xs transition-all ${
              previewMode === 'public'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Public View
          </button>
          <button
            onClick={() => setPreviewMode('friend')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-xs transition-all ${
              previewMode === 'friend'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Friend View
          </button>
        </div>
        
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground font-semibold">
          <Globe size={11} className="text-chart-2" /> {username}.memact.com
        </div>
      </div>

      {/* Address Profile Body */}
      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-12 space-y-8">
        
        {/* Address Profile Header */}
        <div className="text-center pb-8 border-b border-border/80">
          <div className="w-14 h-14 rounded-full border border-border bg-secondary flex items-center justify-center mx-auto mb-4 text-sm font-bold text-foreground select-none">
            {initials}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            {fullName}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-chart-2/10 text-chart-2 text-[10px] font-mono font-semibold rounded-full select-none">
            <span className="w-1.5 h-1.5 bg-chart-2 rounded-full animate-pulse" />
            {username}.memact.com
          </div>
        </div>

        {/* entries stream */}
        <div className="space-y-5">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
            {previewMode === 'public' ? 'Public Details' : 'Shared with Friends'}
          </div>

          <div className="space-y-4">
            {visibleEntries.length === 0 ? (
              <div className="p-8 border border-dashed border-border rounded-sm text-center bg-secondary/15 py-12 text-xs text-muted-foreground italic select-none">
                No entries available in this view.
              </div>
            ) : (
              visibleEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-card border border-border p-5 rounded-sm shadow-xs space-y-3 relative transition-all hover:shadow-sm"
                >
                  <p className="text-sm font-medium text-foreground leading-relaxed pr-8">
                    {entry.content}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 font-medium pt-2.5 border-t border-border/40 select-none">
                    <div className="flex items-center gap-3">
                      <span>By {entry.contributor === 'You' ? 'you' : entry.contributor}</span>
                      <span>•</span>
                      <span>{entry.time}</span>
                      
                      {entry.visibility === 'Friends' && (
                        <>
                          <span>•</span>
                          <span className="text-chart-3 font-semibold flex items-center gap-1">
                            <Users size={11} /> Friends Only
                          </span>
                        </>
                      )}
                    </div>

                    {entry.starred && (
                      <span className="text-chart-4 flex items-center gap-1">
                        <Star size={11} fill="currentColor" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Credentials details card */}
          <div className="bg-card border border-border p-5 rounded-sm shadow-xs space-y-2.5 mt-8">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 select-none">
              Verified Address Metadata
            </div>
            
            <div className="flex justify-between items-center text-xs py-1.5 border-b border-border/40">
              <span className="font-semibold text-muted-foreground">Owner</span>
              <span className="font-medium text-foreground">{fullName}</span>
            </div>

            <div className="flex justify-between items-center text-xs py-1.5 border-b border-border/40">
              <span className="font-semibold text-muted-foreground">Identity Protocol</span>
              <span className="font-mono text-muted-foreground/60 text-[10px]">sha256:memact_{username}_auth</span>
            </div>

            <div className="flex justify-between items-center text-xs py-1.5">
              <span className="font-semibold text-muted-foreground">Personal Link</span>
              <span className="font-medium text-foreground font-mono text-[11px]">{username}.memact.com</span>
            </div>
          </div>
        </div>

        {/* Trust badge & claim yours CTA */}
        <div className="py-8 border-t border-border/80 flex flex-col items-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50 select-none">
            <ShieldCheck size={14} className="text-accent" />
            <span>Secured and served via Memact protocol</span>
          </div>

          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground font-medium">Tired of reintroducing yourself to the world?</p>
            <button
              onClick={onClaim}
              className="flex items-center gap-2 text-xs bg-foreground text-background px-5 py-2.5 font-bold hover:opacity-85 transition-opacity rounded-sm shadow-xs animate-pulse"
            >
              Get your personal address <ArrowRight size={12} />
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border flex items-center justify-between shrink-0 select-none">
        <span className="text-[10px] text-muted-foreground/50">© {new Date().getFullYear()} Memact. All rights reserved.</span>
        <div className="flex gap-4">
          <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Privacy</button>
          <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Terms</button>
        </div>
      </footer>
    </div>
  );
}
