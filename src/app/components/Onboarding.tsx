import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Shield, Terminal, Settings, Globe, CheckCircle2, User, Lock, Users } from 'lucide-react';
import textLogoLight from '../../imports/text_logo_nobg_light.png';
import textLogoDark  from '../../imports/text_logo_nobg_dark.png';

interface OnboardingProps {
  onBack: () => void;
  onComplete: (
    username: string,
    fullName: string,
    nowFocus: string,
    focusVisibility: 'Public' | 'Friends' | 'Private',
    preferences: string,
    prefsVisibility: 'Public' | 'Friends' | 'Private'
  ) => void;
  isDark: boolean;
  onToggleDark: () => void;
  initialEmail?: string;
}

export function Onboarding({ onBack, onComplete, isDark, onToggleDark, initialEmail = '' }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [nowFocus, setNowFocus] = useState('Learning Model Context Protocol (MCP).');
  const [preferences, setPreferences] = useState('Building Memact address protocol beta.');
  
  // Simulation states for Step 3
  const [simState, setSimState] = useState<'idle' | 'connecting' | 'success'>('idle');

  const [focusVisibility, setFocusVisibility] = useState<'Public' | 'Friends' | 'Private'>('Public');
  const [prefsVisibility, setPrefsVisibility] = useState<'Public' | 'Friends' | 'Private'>('Public');
  const [openDropdown, setOpenDropdown] = useState<'focus-vis' | 'prefs-vis' | null>(null);

  useEffect(() => {
    if (step === 3) {
      setSimState('connecting');
      const timer = setTimeout(() => {
        setSimState('success');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNext = () => {
    if (step === 1 && (!username || !fullName)) return;
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      onComplete(username, fullName, nowFocus, focusVisibility, preferences, prefsVisibility);
    } else {
      setStep((step + 1) as any);
    }
  };

  const handlePrev = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep((step - 1) as any);
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col justify-between"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-8 h-[60px] border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-50">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[18px] w-auto" />
        <div className="w-[60px]" /> {/* Spacer to align logo */}
      </nav>

      {/* Main Flow Panel */}
      <main className="flex-1 flex items-center justify-center p-6 bg-card/10">
        <div className="w-full max-w-lg bg-card border border-border p-8 rounded-sm shadow-[0_15px_40px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[480px]">
          
          {/* Progressive Bar */}
          <div className="w-full mb-8 select-none">
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground mb-2">
              <span>Step {step} of 3</span>
              <span>{step === 1 ? 'Claim Handle' : step === 2 ? 'Seed Notebook' : 'Sync Simulator'}</span>
            </div>
            <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Stepped Content */}
          <div className="flex-1 flex flex-col justify-between">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">Claim your personal address</h2>
                  <p className="text-xs text-muted-foreground leading-normal">
                    This is your permanent address. Apps, agents, and users will query this link to learn about you.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Personal address
                    </label>
                    <div className="flex items-center bg-secondary border border-border focus-within:border-foreground/45 transition-colors px-3 py-2.5 rounded-sm">
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                        placeholder="username"
                        className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/30 font-medium font-mono"
                      />
                      <span className="text-sm text-muted-foreground/50 font-mono select-none">.memact.me</span>
                    </div>
                    {username && (
                      <span className="text-[10px] text-accent font-semibold mt-1 flex items-center gap-1 select-none">
                        <CheckCircle2 size={10} /> {username}.memact.me is available
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Chen"
                      className="w-full bg-secondary border border-border focus:border-foreground/45 transition-colors px-3 py-2.5 text-sm outline-none rounded-sm text-foreground placeholder:text-muted-foreground/30 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">Seed your notebook</h2>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Write down a couple of statements about yourself to get started. Memact clusters, links, and understands it behind the scenes.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      First notebook entry
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={nowFocus}
                      onChange={(e) => setNowFocus(e.target.value)}
                      placeholder="e.g., Learning Model Context Protocol (MCP)."
                      className="w-full bg-secondary border border-border focus:border-foreground/45 transition-colors px-3 py-2.5 text-xs outline-none rounded-sm text-foreground placeholder:text-muted-foreground/30 font-medium resize-none leading-relaxed"
                    />
                    
                    {/* Visibility switcher */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground font-semibold">Visibility:</span>
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === 'focus-vis' ? null : 'focus-vis');
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border border-border rounded-full hover:bg-secondary transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          {focusVisibility === 'Public' && <Globe size={10} className="text-chart-2" />}
                          {focusVisibility === 'Friends' && <Users size={10} className="text-chart-3" />}
                          {focusVisibility === 'Private' && <Lock size={10} className="text-muted-foreground/60" />}
                          <span>{focusVisibility}</span>
                        </button>
                        
                        {openDropdown === 'focus-vis' && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                            <div className="absolute left-0 mt-1 w-44 bg-popover text-popover-foreground border border-border rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.05)] py-1 z-50 animate-[fadeIn_0.15s_ease-out] select-none">
                              {[
                                { value: 'Public', label: 'Public (Everyone)', icon: <Globe size={11} className="text-chart-2" /> },
                                { value: 'Friends', label: 'Friends (Connections)', icon: <Users size={11} className="text-chart-3" /> },
                                { value: 'Private', label: 'Private (Just me)', icon: <Lock size={11} className="text-muted-foreground/60" /> }
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    setFocusVisibility(opt.value as any);
                                    setOpenDropdown(null);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-2 hover:bg-secondary transition-colors ${
                                    focusVisibility === opt.value ? 'bg-secondary text-foreground font-extrabold' : 'text-muted-foreground font-medium'
                                  }`}
                                >
                                  {opt.icon}
                                  <span>{opt.label}</span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Second notebook entry
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={preferences}
                      onChange={(e) => setPreferences(e.target.value)}
                      placeholder="e.g., Sofia says I'm funny."
                      className="w-full bg-secondary border border-border focus:border-foreground/45 transition-colors px-3 py-2.5 text-xs outline-none rounded-sm text-foreground placeholder:text-muted-foreground/30 font-medium resize-none leading-relaxed"
                    />
                    
                    {/* Visibility switcher */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground font-semibold">Visibility:</span>
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === 'prefs-vis' ? null : 'prefs-vis');
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border border-border rounded-full hover:bg-secondary transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          {prefsVisibility === 'Public' && <Globe size={10} className="text-chart-2" />}
                          {prefsVisibility === 'Friends' && <Users size={10} className="text-chart-3" />}
                          {prefsVisibility === 'Private' && <Lock size={10} className="text-muted-foreground/60" />}
                          <span>{prefsVisibility}</span>
                        </button>
                        
                        {openDropdown === 'prefs-vis' && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                            <div className="absolute left-0 mt-1 w-44 bg-popover text-popover-foreground border border-border rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.05)] py-1 z-50 animate-[fadeIn_0.15s_ease-out] select-none">
                              {[
                                { value: 'Public', label: 'Public (Everyone)', icon: <Globe size={11} className="text-chart-2" /> },
                                { value: 'Friends', label: 'Friends (Connections)', icon: <Users size={11} className="text-chart-3" /> },
                                { value: 'Private', label: 'Private (Just me)', icon: <Lock size={11} className="text-muted-foreground/60" /> }
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    setPrefsVisibility(opt.value as any);
                                    setOpenDropdown(null);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-2 hover:bg-secondary transition-colors ${
                                    prefsVisibility === opt.value ? 'bg-secondary text-foreground font-extrabold' : 'text-muted-foreground font-medium'
                                  }`}
                                >
                                  {opt.icon}
                                  <span>{opt.label}</span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">Simulate your first connection</h2>
                  <p className="text-xs text-muted-foreground leading-normal font-medium">
                    We've initialized <span className="font-semibold text-foreground font-mono">{username}.memact.me</span>. Here is what an app reads when it queries your notebook link.
                  </p>
                </div>

                <div className="bg-background border border-border p-4 rounded-sm font-mono text-[11px] leading-relaxed shadow-[inset_0_2px_4px_rgba(0,0,0,0.015)] min-h-[160px] flex flex-col justify-between">
                  {simState === 'connecting' ? (
                    <div className="space-y-2 text-muted-foreground py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-chart-4 rounded-full animate-ping" />
                        <span>Cursor IDE handshaking with {username}.memact.me...</span>
                      </div>
                      <div>[Query] Fetching notebook stream...</div>
                      <div className="text-[10px] text-muted-foreground/60 italic font-semibold">Validating authorization tokens...</div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-1">
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                        <CheckCircle2 size={12} /> Sync Success ({username}.memact.me)
                      </div>
                      <div className="text-muted-foreground text-[10px] space-y-1">
                        <div>&gt; Name loaded: <span className="text-foreground font-semibold">{fullName}</span></div>
                        <div>
                          &gt; Entry 1 ({focusVisibility.toLowerCase()}):{' '}
                          {focusVisibility === 'Public' ? (
                            <span className="text-foreground font-semibold">"{nowFocus}"</span>
                          ) : (
                            <span className="text-muted-foreground/60 italic">[Hidden - {focusVisibility}]</span>
                          )}
                        </div>
                        <div>
                          &gt; Entry 2 ({prefsVisibility.toLowerCase()}):{' '}
                          {prefsVisibility === 'Public' ? (
                            <span className="text-foreground font-semibold">"{preferences}"</span>
                          ) : (
                            <span className="text-muted-foreground/60 italic">[Hidden - {prefsVisibility}]</span>
                          )}
                        </div>
                      </div>
                      <div className="text-foreground font-bold mt-2 pt-2 border-t border-border/40 text-[10px] leading-relaxed">
                        {focusVisibility !== 'Public' || prefsVisibility !== 'Public' ? (
                          <span>Cursor connected. It only synced your Public details; private details remain secure.</span>
                        ) : (
                          <span>Cursor connected. It synced all details since you allowed Public access.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stepped controls button */}
            <button
              onClick={handleNext}
              disabled={(step === 1 && (!username || !fullName)) || (step === 3 && simState !== 'success')}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-foreground text-background py-3 text-sm font-semibold hover:opacity-85 transition-opacity disabled:opacity-40"
            >
              {step === 3 ? (
                <>Finish &amp; enter Hub <Check size={14} /></>
              ) : (
                <>Next <ArrowRight size={14} /></>
              )}
            </button>
          </div>
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
