import { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, Lock, Sparkles, CheckCircle2, Users, Globe, Eye, Music, ChevronRight } from 'lucide-react';
import textLogoLight from '../../imports/text_logo_nobg_light.png';
import textLogoDark  from '../../imports/text_logo_nobg_dark.png';

interface LandingProps {
  onNavigate: (page: 'identity' | 'auth', tab?: 'login' | 'signup', email?: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

// Global immutable design tokens to maintain strict brand consistency
const DESIGN_TOKENS = {
  colors: {
    bg: 'bg-background',
    fg: 'text-foreground',
    card: 'bg-card border border-border',
    accent: 'text-accent border-accent/20 bg-accent/10',
    muted: 'text-muted-foreground',
    border: 'border-border',
  },
  styles: {
    cardWrapper: 'w-full max-w-[300px] bg-card border border-border p-4 rounded-sm shadow-xs transition-all duration-500',
    innerCard: 'bg-background border border-border p-3 rounded-sm transition-all duration-300',
    appBadge: 'px-1.5 py-0.5 text-[8px] font-bold rounded-sm border uppercase font-mono bg-secondary/80 border-border text-muted-foreground',
  }
};

export function Landing({ onNavigate, isDark, onToggleDark }: LandingProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [step5Approved, setStep5Approved] = useState<boolean | null>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sections = [
    {
      title: "Let your identity live in one place.",
      subtitle: ""
    },
    {
      title: "Apps learn things about you.",
      subtitle: "A fitness app learns you work out. A reading app learns you read essays. A friend knows you are funny."
    },
    {
      title: "None of it connects.",
      subtitle: "Everything stays in separate places. The apps do not talk to each other."
    },
    {
      title: "Bring it together.",
      subtitle: "Get your own address like john.memact.com. Everything flows to one place."
    },
    {
      title: "Apps suggest updates.",
      subtitle: "When apps learn something new, they send a suggestion to your address."
    },
    {
      title: "You decide on the spot.",
      subtitle: "Fitness App suggests: 'Works out regularly.' You approve or reject it."
    },
    {
      title: "It belongs to you.",
      subtitle: "Approved things are saved under your personal address."
    },
    {
      title: "Choose who sees what.",
      subtitle: "Make things public, or keep them strictly private."
    },
    {
      title: "A new app arrives.",
      subtitle: "A music app wants to know what music to play. It does not get access to your whole profile."
    },
    {
      title: "Memact shares only what is needed.",
      subtitle: "It sees 'Works out regularly' is approved. It hides your essays and jokes."
    },
    {
      title: "The app adapts.",
      subtitle: "The music app plays workout music instantly, without knowing anything else about you."
    },
    {
      title: "Your profile grows on its own.",
      subtitle: "Approved observations are added automatically over time as you use apps."
    }
  ];

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0.1,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          if (!isNaN(index)) {
            setActiveSection(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const elements = document.querySelectorAll('.scroll-section');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleRestart = useCallback(() => {
    const container = document.getElementById('main-scroll-container');
    const isMobilePortrait = window.innerWidth < 768 && window.innerHeight > window.innerWidth;
    if (container && isMobilePortrait) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const renderVisualFrame = (sectionIndex?: number) => {
    const active = sectionIndex !== undefined ? sectionIndex : activeSection;
    switch (active) {
      case 0: // Let your identity live in one place
        return (
          <div className="flex flex-col items-center justify-center h-full w-full space-y-4 animate-in fade-in duration-500">
            <div className="w-full max-w-[210px] md:max-w-[240px] bg-background border border-accent/25 p-5 rounded-sm flex flex-col justify-center items-center shadow-xs relative">
              <span className="text-[9px] font-bold text-accent uppercase tracking-wider mb-1">
                Active Address
              </span>
              <span className="text-base font-mono font-bold text-foreground">
                john.memact.com
              </span>
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-transparent pointer-events-none rounded-sm" />
            </div>
          </div>
        );

      case 1: // Apps learn things
        return (
          <div className="relative w-full h-full flex flex-col justify-around p-4 animate-in fade-in duration-500">
            <div className="transform translate-x-[-10px] md:translate-x-[-20px] translate-y-[-10px] md:translate-y-[-15px] landscape:translate-y-0 -rotate-3 bg-card border border-border p-2.5 md:p-3 rounded-sm shadow-xs w-full max-w-[150px] md:max-w-[200px] self-start">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={DESIGN_TOKENS.styles.appBadge}>FitLife</span>
              </div>
              <p className="text-xs font-bold text-foreground">"john works out regularly."</p>
            </div>

            <div className="transform translate-x-[25px] md:translate-x-[55px] rotate-3 bg-card border border-border p-2.5 md:p-3 rounded-sm shadow-xs w-full max-w-[150px] md:max-w-[200px] self-center">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={DESIGN_TOKENS.styles.appBadge}>Reader</span>
              </div>
              <p className="text-xs font-bold text-foreground">"Prefers short essays."</p>
            </div>

            <div className="transform translate-x-[-5px] md:translate-x-[-10px] translate-y-[10px] md:translate-y-[15px] landscape:translate-y-0 -rotate-3 bg-card border border-border p-2.5 md:p-3 rounded-sm shadow-xs w-full max-w-[130px] md:max-w-[180px] self-end">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={DESIGN_TOKENS.styles.appBadge}>Friend</span>
              </div>
              <p className="text-xs font-bold text-foreground">"Funny."</p>
            </div>
          </div>
        );

      case 2: // None of it connects
        return (
          <div className="relative w-full h-full flex flex-col justify-around p-4 animate-in fade-in duration-500 opacity-40">
            <div className="transform translate-x-[-10px] md:translate-x-[-20px] translate-y-[-10px] md:translate-y-[-15px] landscape:translate-y-0 -rotate-3 bg-card border border-border p-2.5 md:p-3 rounded-sm shadow-xs w-full max-w-[150px] md:max-w-[200px] self-start relative">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={DESIGN_TOKENS.styles.appBadge}>FitLife</span>
              </div>
              <p className="text-xs font-bold text-foreground">"john works out regularly."</p>
              <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-sm">
                <Lock size={12} className="text-muted-foreground/45" />
              </div>
            </div>

            <div className="transform translate-x-[25px] md:translate-x-[55px] rotate-3 bg-card border border-border p-2.5 md:p-3 rounded-sm shadow-xs w-full max-w-[150px] md:max-w-[200px] self-center relative">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={DESIGN_TOKENS.styles.appBadge}>Reader</span>
              </div>
              <p className="text-xs font-bold text-foreground">"Prefers short essays."</p>
              <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-sm">
                <Lock size={12} className="text-muted-foreground/45" />
              </div>
            </div>

            <div className="transform translate-x-[-5px] md:translate-x-[-10px] translate-y-[10px] md:translate-y-[15px] landscape:translate-y-0 -rotate-3 bg-card border border-border p-2.5 md:p-3 rounded-sm shadow-xs w-full max-w-[130px] md:max-w-[180px] self-end relative">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={DESIGN_TOKENS.styles.appBadge}>Friend</span>
              </div>
              <p className="text-xs font-bold text-foreground">"Funny."</p>
              <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-sm">
                <Lock size={12} className="text-muted-foreground/45" />
              </div>
            </div>
          </div>
        );

      case 3: // Keep it here instead
        return (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="w-full max-w-[220px] md:max-w-[280px] bg-background border border-border/80 p-4 md:p-5 rounded-sm flex flex-col justify-center items-center shadow-md relative">
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">
                Domain
              </span>
              <span className="text-base font-mono font-bold text-foreground">
                john.memact.com
              </span>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-2 py-0.5 text-[8px] font-bold bg-accent text-background rounded-full uppercase">
                  New
                </span>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2 animate-pulse">
              <span>FitLife</span> → <span>john.memact.com</span> ← <span>Reader</span>
            </div>
          </div>
        );

      case 4: // Apps propose suggestions
        return (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-[220px] md:max-w-[280px] bg-background border border-border/80 p-3 md:p-4 rounded-sm space-y-2.5 md:space-y-3">
              <div className="flex justify-between items-center border-b border-border/40 pb-2">
                <span className="text-xs font-mono font-bold text-foreground">john.memact.com</span>
                <span className="text-[8px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full uppercase">
                  Suggestions
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="border border-dashed border-border p-2 rounded-sm bg-background/50 flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-foreground">"Works out regularly."</span>
                  <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider">Pending</span>
                </div>
                <div className="border border-dashed border-border p-2 rounded-sm bg-background/50 flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-foreground">"Prefers short essays."</span>
                  <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider">Pending</span>
                </div>
                <div className="border border-dashed border-border p-2 rounded-sm bg-background/50 flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-foreground">"Funny."</span>
                  <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider">Pending</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // You approve on the spot
        return (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-[220px] md:max-w-[280px] bg-background border border-accent/20 bg-accent/5 p-3 md:p-4 rounded-sm space-y-2.5 md:space-y-3 shadow-sm relative">
              <div className="flex justify-between items-center border-b border-border/40 pb-2">
                <span className="text-[8px] font-bold bg-accent text-background px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                  Fitness App
                </span>
                <span className="text-[8px] font-bold text-muted-foreground font-mono">Suggested Update</span>
              </div>

              <div className="bg-background border border-border p-3 rounded-sm text-center space-y-1">
                <span className="text-xs font-bold text-foreground">"Works out regularly."</span>
              </div>

              {step5Approved === null ? (
                <div className="flex gap-2 pt-1.5">
                  <button
                    onClick={() => setStep5Approved(true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 text-[10px] rounded-sm transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setStep5Approved(false)}
                    className="flex-1 bg-destructive hover:bg-destructive/80 text-white font-semibold py-2 text-[10px] rounded-sm transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div className="flex justify-center items-center gap-1.5 py-2 animate-in zoom-in-95 duration-300">
                  {step5Approved ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Approved on the spot</span>
                    </>
                  ) : (
                    <>
                      <X size={14} className="text-destructive" />
                      <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">Rejected & Ignored</span>
                    </>
                  )}
                  <button 
                    onClick={() => setStep5Approved(null)} 
                    className="text-[9px] text-muted-foreground hover:text-foreground underline ml-2 cursor-pointer"
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 6: // Now it belongs to you
        return (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-[220px] md:max-w-[280px] bg-background border border-border/80 p-3 md:p-4 rounded-sm space-y-2.5 md:space-y-3">
              <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-foreground">john.memact.com</span>
              </div>

              <div className="space-y-2">
                <div className="border border-border p-2.5 rounded-sm bg-background flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
                  <span className="text-[10px] sm:text-xs font-bold text-foreground">Works out regularly.</span>
                </div>
                <div className="border border-border p-2.5 rounded-sm bg-background flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
                  <span className="text-[10px] sm:text-xs font-bold text-foreground">Prefers short essays.</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 7: // Choose who sees what
        return (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-[220px] md:max-w-[280px] bg-background border border-border/80 p-3 md:p-4 rounded-sm space-y-2.5 md:space-y-3">
              <div className="flex justify-between items-center border-b border-border/40 pb-2">
                <span className="text-xs font-mono font-bold text-foreground">john.memact.com</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase">Access Rules</span>
              </div>

              <div className="space-y-2">
                <div className="border border-border p-2.5 rounded-sm bg-background flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-foreground">Works out regularly.</span>
                  <span className="text-[8px] font-bold border border-border bg-secondary px-2 py-0.5 rounded-sm text-foreground flex items-center gap-1 select-none">
                    <Globe size={9} className="text-muted-foreground" /> Public
                  </span>
                </div>
                <div className="border border-border p-2.5 rounded-sm bg-background flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-foreground">Prefers short essays.</span>
                  <span className="text-[8px] font-bold border border-border bg-secondary px-2 py-0.5 rounded-sm text-foreground flex items-center gap-1 select-none">
                    <Lock size={9} className="text-muted-foreground" /> Only me
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 8: // Another app arrives
        return (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 space-y-3 animate-in fade-in duration-500">
            <div className="w-full max-w-[210px] md:max-w-[260px] bg-background border border-border/80 p-3 rounded-sm opacity-60">
              <div className="text-[9px] font-mono font-bold text-muted-foreground mb-0.5">john.memact.com</div>
              <div className="text-[11px] font-bold text-foreground">2 Approved Traits</div>
            </div>

            <div className="text-muted-foreground/30 font-bold text-sm">↓</div>

            <div className="w-full max-w-[210px] md:max-w-[260px] bg-background border border-accent/20 bg-accent/5 p-3 rounded-sm space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-bold bg-accent text-background px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                  Music App
                </span>
                <span className="text-[8px] font-bold text-muted-foreground font-mono">Query</span>
              </div>
              <div className="bg-background border border-border p-2 rounded-sm">
                <div className="text-[7px] font-bold text-muted-foreground uppercase mb-0.5">Query</div>
                <div className="text-[11px] font-bold text-foreground leading-snug">
                  "What should I play?"
                </div>
              </div>
            </div>
          </div>
        );

      case 9: // Memact checks approved stuff
        return (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 space-y-3 animate-in fade-in duration-500">
            <div className="w-full max-w-[210px] md:max-w-[260px] bg-background border border-border p-2.5 md:p-3 rounded-sm space-y-1.5 md:space-y-2">
              <div className="text-[8px] font-mono font-bold text-muted-foreground">john.memact.com</div>
              
              <div className="space-y-1">
                <div className="border border-emerald-500/20 bg-emerald-500/5 p-2 rounded-sm flex justify-between items-center text-[11px] font-bold text-foreground">
                  <span>Works out regularly.</span>
                  <span className="text-[8px] font-bold text-emerald-500 uppercase">Match ✓</span>
                </div>
                <div className="border border-border/40 p-2 rounded-sm flex justify-between items-center text-[11px] font-medium text-muted-foreground/30 opacity-30">
                  <span>Prefers short essays.</span>
                  <Lock size={9} />
                </div>
              </div>
            </div>

            <div className="text-accent animate-pulse font-mono text-[9px] font-bold">
              Filtering matching trait only
            </div>

            <div className="w-full max-w-[210px] md:max-w-[260px] bg-background border border-accent/20 p-2 rounded-sm flex justify-between items-center">
              <span className="text-[8px] font-bold bg-accent text-background px-1.5 py-0.5 rounded-sm uppercase">Music App</span>
              <span className="text-[10px] font-bold text-foreground font-mono">Received: Works out regularly</span>
            </div>
          </div>
        );

      case 10: // The music app adapts
        return (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 animate-in scale-in duration-500">
            <div className="w-full max-w-[210px] md:max-w-[260px] bg-background border border-border/80 p-3 md:p-4 rounded-sm space-y-2.5 md:space-y-3.5 shadow-md">
              <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                <span className="text-[8px] font-bold bg-accent text-background px-1.5 py-0.5 rounded-sm uppercase">
                  Music App
                </span>
                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">
                  Customized
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="space-y-0.5 flex items-center justify-between">
                  <div>
                    <div className="text-[7px] font-bold text-muted-foreground uppercase">Adaptive Playlist</div>
                    <div className="text-xs font-extrabold text-foreground">Workout Power Mix</div>
                  </div>
                  <Music size={14} className="text-accent" />
                </div>

                <div className="space-y-1 text-[9px] font-bold">
                  <div className="bg-background border border-border p-1.5 rounded-sm flex items-center justify-between text-foreground">
                    <span>1. High Tempo Beat</span>
                    <span className="text-muted-foreground/60 font-mono">135 BPM</span>
                  </div>
                  <div className="bg-background border border-border p-1.5 rounded-sm flex items-center justify-between text-foreground">
                    <span>2. Power Training Theme</span>
                    <span className="text-muted-foreground/60 font-mono">140 BPM</span>
                  </div>
                  <div className="bg-background border border-border/40 p-1.5 rounded-sm flex items-center justify-between text-foreground/30 opacity-30">
                    <span>3. Cool Down Chill</span>
                    <span className="text-muted-foreground/20 font-mono">90 BPM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 11: // Final Claim Address
      default:
        return (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-[210px] md:max-w-[260px] bg-background border border-accent p-4 md:p-5 rounded-sm shadow-[0_8px_32px_rgba(66,85,255,0.06)] flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-[9px] font-bold text-accent uppercase tracking-wider mb-2 select-none">
                Verified Address
              </span>
              <span className="text-base font-mono font-bold text-foreground mb-4">
                john.memact.com
              </span>
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase select-none">
                <CheckCircle2 size={10} /> Active Domain
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-[60px] bg-background/90 backdrop-blur-sm border-b border-border select-none">
        <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[42px] md:h-[50px] w-auto -ml-1 md:ml-0" />
        <div className="flex items-center gap-3.5 md:gap-6">
          <button onClick={onToggleDark} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" aria-label="Toggle dark mode">
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {/* Mobile Get Started button */}
          <button
            onClick={() => onNavigate('auth', 'signup')}
            className="block md:hidden bg-foreground text-background text-xs px-3.5 py-1.5 font-bold hover:opacity-85 transition-opacity rounded-sm cursor-pointer"
          >
            Get started
          </button>
          {/* Desktop Auth Buttons */}
          <button onClick={() => onNavigate('auth', 'login')} className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer">
            Sign in
          </button>
          <button onClick={() => onNavigate('auth', 'signup')} className="hidden md:block bg-foreground text-background text-sm px-4 py-2 font-semibold hover:opacity-85 transition-opacity rounded-sm cursor-pointer">
            Create account
          </button>
        </div>
      </nav>

      {/* Split screen scrolling container */}
      <main id="main-scroll-container" className="flex-1 flex flex-col md:flex-row relative pt-[60px] h-[calc(100vh-60px)] landscape:h-auto md:h-auto md:overflow-y-visible landscape:overflow-y-visible overflow-y-auto snap-y snap-mandatory landscape:snap-none scroll-smooth">
        
        {/* Left Visual Area (Sticky) - hidden on mobile */}
        <div className="hidden md:flex w-full md:w-1/2 h-[calc(100vh-60px)] sticky top-[60px] items-center justify-center p-12 border-r border-border/40 bg-background/50 backdrop-blur-sm z-30">
          <div className="w-full max-w-sm h-[380px] max-h-[calc(100vh-100px)] bg-card border border-border rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.01)] flex flex-col justify-center items-center relative overflow-hidden transition-all duration-300">
            {renderVisualFrame()}
          </div>
        </div>

        {/* Right Narrative Copy (Scrollable) */}
        <div className="w-full md:w-1/2 flex flex-col">
          {sections.map((section, index) => (
            <section
              key={index}
              data-index={index}
              className={`scroll-section h-[calc(100vh-60px)] landscape:h-auto landscape:min-h-[calc(100vh-60px)] landscape:py-6 md:min-h-[calc(100vh-60px)] md:h-auto flex flex-col justify-center items-center text-center md:text-left md:items-start px-6 md:px-16 py-0 transition-all duration-500 ease-out border-b border-border/10 last:border-b-0 snap-start snap-always landscape:snap-none ${
                activeSection === index ? 'opacity-100 scale-100 translate-y-0' : 'opacity-25 scale-95 translate-y-4 md:opacity-25 md:scale-100 md:translate-y-0'
              }`}
            >
              <div className="max-w-md landscape:max-w-2xl md:max-w-md space-y-3 landscape:space-y-0 w-full flex flex-col landscape:flex-row items-center md:items-start landscape:justify-between landscape:gap-6">
                <div className="flex-1 flex flex-col items-center landscape:items-start text-center landscape:text-left w-full">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-[1.15]">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-xs md:text-sm text-muted-foreground/80 leading-relaxed font-semibold mt-2">
                      {section.subtitle}
                    </p>
                  )}
                  
                  {/* CTA on the final step */}
                  {index === sections.length - 1 && (
                    <div className="pt-4 space-y-2 w-full max-w-[240px]">
                      <button
                        onClick={() => onNavigate('auth', 'signup')}
                        className="w-full bg-foreground text-background py-3 text-xs font-bold hover:opacity-85 transition-opacity rounded-sm cursor-pointer shadow-xs"
                      >
                        Claim your address
                      </button>
                      <button
                        onClick={handleRestart}
                        className="w-full bg-secondary border border-border text-muted-foreground hover:text-foreground py-2.5 text-xs font-bold hover:bg-secondary/70 transition-all rounded-sm cursor-pointer"
                      >
                        Scroll to top
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Inline Visual Frame for Mobile only */}
                <div className="flex md:hidden my-4 landscape:my-0 w-full max-w-[280px] sm:max-w-[320px] h-[235px] landscape:w-[230px] landscape:h-[185px] landscape:aspect-none bg-card border border-border rounded-sm shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex-col justify-center items-center p-4 landscape:p-1 relative overflow-hidden shrink-0">
                  <div className="w-full h-[235px] landscape:w-[306px] landscape:h-[246px] flex items-center justify-center scale-95 landscape:scale-75 origin-center landscape:origin-center min-h-0 min-w-0 shrink-0">
                    {renderVisualFrame(index)}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 text-xs select-none bg-background shrink-0">
        <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[36px] w-auto opacity-35" />
        <div className="flex gap-6 justify-center">
          {['Privacy', 'Terms', 'Contact'].map((item) => (
            <button key={item} className="text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer">{item}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}
