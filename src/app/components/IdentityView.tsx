import { useState } from 'react';
import { Moon, Sun, X, Check, Plus, Globe, Eye, EyeOff, Trash2, Star, Sparkles, User, Settings, Lock, Users, ChevronDown, CornerDownLeft } from 'lucide-react';
import textLogoLight from '../../imports/text_logo_nobg_light.png';
import textLogoDark  from '../../imports/text_logo_nobg_dark.png';
import { Entry, PendingEntry } from '../App';
import { supabase, toUiVisibility, formatTimeAgo } from '../../supabase';

interface IdentityViewProps {
  onBack: () => void;
  onPublicView: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  username: string;
  fullName: string;
  entries: Entry[];
  onUpdateEntries: (entries: Entry[]) => void;
  pendingEntries: PendingEntry[];
  onUpdatePendingEntries: (entries: PendingEntry[]) => void;
}

interface Suggestion {
  id: string;
  type: 'suggestion' | 'request';
  from: string;
  avatarColor: string;
  title: string;
  reason: string;
  visibility: 'Public' | 'Private';
  value: string;
}

interface PermittedApp {
  id: string;
  name: string;
  scope: string;
  time: string;
}

interface HistoryItem {
  id: string;
  action: string;
  time: string;
  status: 'approved' | 'rejected' | 'revoked';
}

type ViewMode = 'inbox' | 'record' | 'access' | 'settings';

export function IdentityView({
  onBack,
  onPublicView,
  isDark,
  onToggleDark,
  username,
  fullName,
  entries,
  onUpdateEntries,
  pendingEntries,
  onUpdatePendingEntries,
}: IdentityViewProps) {
  // Navigation / Views State
  const [view, setView] = useState<ViewMode>('inbox');

  // Input for adding new notes directly
  const [newEntryText, setNewEntryText] = useState('');

  // Link copy states
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // Active visibility dropdown ID
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const [contributorsExpanded, setContributorsExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${username}.memact.com`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Derive inbox from real pending contributions (no mock data)
  const inbox: Suggestion[] = pendingEntries.map(p => ({
    id: p.id,
    type: 'suggestion' as const,
    from: p.contributor_name || 'App',
    avatarColor: 'bg-muted text-muted-foreground border-muted',
    title: p.content,
    reason: formatTimeAgo(p.created_at),
    visibility: toUiVisibility(p.visibility) as 'Public' | 'Private',
    value: p.content
  }));

  // Permitted Apps — loaded from consents when available
  const [permittedApps, setPermittedApps] = useState<PermittedApp[]>([]);

  // History timeline — derived from approve/reject actions this session
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Moderation Logic — calls real Supabase RPCs
  const handleApprove = async (item: Suggestion) => {
    if (item.type === 'request') {
      setPermittedApps(prev => [
        { id: Math.random().toString(), name: item.from, scope: 'Public entries', time: 'Granted just now' },
        ...prev
      ]);
      setHistory(prev => [
        { id: Math.random().toString(), action: `Granted read access to ${item.from}`, time: 'Just now', status: 'approved' },
        ...prev
      ]);
    } else {
      // Optimistically update UI
      const newEntry: Entry = {
        id: item.id,
        content: item.value,
        contributor: item.from,
        visibility: 'Private',
        starred: false,
        time: 'Just now'
      };
      onUpdateEntries([newEntry, ...entries]);
      onUpdatePendingEntries(pendingEntries.filter(p => p.id !== item.id));
      setHistory(prev => [
        { id: Math.random().toString(), action: `Approved: "${item.value}" (${item.from})`, time: 'Just now', status: 'approved' },
        ...prev
      ]);

      // Persist to Supabase
      if (supabase) {
        try {
          await supabase.rpc('memact_approve_contribution', {
            contribution_id_input: item.id
          });
        } catch (err) {
          console.error('Failed to approve contribution:', err);
        }
      }
    }
  };

  const handleReject = async (item: Suggestion) => {
    onUpdatePendingEntries(pendingEntries.filter(p => p.id !== item.id));
    setHistory(prev => [
      { id: Math.random().toString(), action: `Rejected suggestion from ${item.from}: "${item.value}"`, time: 'Just now', status: 'rejected' },
      ...prev
    ]);

    // Persist to Supabase
    if (supabase) {
      try {
        await supabase.rpc('memact_reject_contribution', {
          contribution_id_input: item.id
        });
      } catch (err) {
        console.error('Failed to reject contribution:', err);
      }
    }
  };

  // Notebook Streams Manipulation
  const handleAddCustomEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newEntryText.trim();
    if (!text) return;

    const newEntry: Entry = {
      id: Math.random().toString(),
      content: text,
      contributor: 'You',
      visibility: 'Private',
      starred: false,
      time: 'Just now'
    };

    onUpdateEntries([newEntry, ...entries]);
    setHistory(prev => [
      { id: Math.random().toString(), action: `Added: "${text}"`, time: 'Just now', status: 'approved' },
      ...prev
    ]);
    setNewEntryText('');
  };

  const handleDeleteEntry = (id: string) => {
    const target = entries.find(e => e.id === id);
    if (!target) return;

    onUpdateEntries(entries.filter(e => e.id !== id));
    setHistory(prev => [
      { id: Math.random().toString(), action: `Removed: "${target.content}"`, time: 'Just now', status: 'revoked' },
      ...prev
    ]);
  };

  const handleToggleStar = (id: string) => {
    onUpdateEntries(entries.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  };

  const updateVisibility = (id: string, visibility: 'Private' | 'Public') => {
    onUpdateEntries(entries.map(e => e.id === id ? { ...e, visibility } : e));
  };

  const handleRevokeApp = (app: PermittedApp) => {
    setPermittedApps(prev => prev.filter(x => x.id !== app.id));
    setHistory(prev => [
      { id: Math.random().toString(), action: `Revoked access for ${app.name}`, time: 'Just now', status: 'revoked' },
      ...prev
    ]);
  };

  // Group contributors stats
  const contributorStats = entries.reduce((acc: { [key: string]: number }, cur) => {
    acc[cur.contributor] = (acc[cur.contributor] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col justify-between"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Top Header & Navigation */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border select-none">
        <div className="max-w-6xl w-full mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-8 min-h-[65px] py-2.5 md:py-0">
          
          {/* Left section: Logo + Tabs */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 w-full md:w-auto">
            {/* Logo Row */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <button onClick={onBack} className="-ml-1 md:-ml-1.5 hover:opacity-75 transition-opacity shrink-0">
                <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[38px] md:h-[46px] w-auto" />
              </button>
              
              {/* Mobile top-right actions */}
              <div className="flex items-center gap-3 md:hidden">
                <button onClick={onToggleDark} className="text-muted-foreground hover:text-foreground p-1 transition-colors" aria-label="Toggle theme">
                  {isDark ? <Sun size={13} /> : <Moon size={13} />}
                </button>
                <button
                  onClick={onPublicView}
                  className="text-[10px] bg-foreground text-background px-2.5 py-1 font-bold hover:opacity-85 rounded-sm"
                >
                  View
                </button>
              </div>
            </div>

            {/* Core User Intent Tabs */}
            <div className="flex items-center gap-4 select-none overflow-x-auto whitespace-nowrap scrollbar-none h-[40px] md:h-[65px] border-t border-border/30 md:border-t-0 pt-1.5 md:pt-0">
              {[
                { id: 'inbox', label: 'Suggestions', badge: inbox.length },
                { id: 'record', label: 'You' },
                { id: 'access', label: 'Privacy' },
                { id: 'settings', label: 'Settings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as ViewMode)}
                  className={`text-xs font-semibold tracking-tight transition-all relative h-full flex items-center px-1 md:px-1.5 pb-1 md:pb-0 ${
                    view === tab.id
                      ? 'text-foreground border-b-2 border-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {tab.badge && tab.badge > 0 ? (
                    <span className="ml-1 bg-accent/15 border border-accent/25 text-accent text-[9px] font-bold px-1.5 py-0.25 rounded-full">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop-only right actions */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={onToggleDark} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle theme">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <button
              onClick={onPublicView}
              className="text-xs bg-foreground text-background px-3.5 py-1.5 font-bold hover:opacity-85 transition-opacity rounded-sm"
            >
              View You
            </button>
          </div>
        </div>
      </nav>

      {/* Main Single-Intent Workspace */}
      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-12">
        
        {/* VIEW 1: Inbox (The Review Queue - Primary Action) */}
        {view === 'inbox' && (
          <section className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="pb-2 border-b border-border flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Suggestions</h1>
            </div>

            <div className="space-y-4">
              {inbox.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-sm text-center bg-secondary/15 py-16 select-none animate-[fadeIn_0.4s_ease-out]">
                  <Check className="mx-auto text-chart-2 mb-3 bg-chart-2/10 p-2 rounded-full border border-chart-2/25 animate-[pulse_2s_infinite]" size={36} />
                  <h3 className="text-sm font-bold text-foreground mb-1">Your suggestions are clear</h3>
                </div>
              ) : (
                inbox.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border p-6 rounded-sm shadow-[0_4px_16px_rgba(0,0,0,0.01)] space-y-4 relative overflow-hidden transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.02)] animate-[fadeIn_0.3s_ease-out]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${item.avatarColor}`}>
                          {item.from}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {item.type === 'request' ? 'Permission requested' : 'Suggested update'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground mb-1 leading-snug">"{item.title}"</h3>
                      <p className="text-xs text-muted-foreground/85 leading-normal flex items-start gap-1.5 font-medium mt-1 mb-3">
                        <Sparkles size={12} className="shrink-0 mt-0.5 text-muted-foreground/50" />
                        <span>{item.reason}</span>
                      </p>


                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border/40">
                      <button
                        onClick={() => handleApprove(item)}
                        className="flex-1 py-2 bg-foreground text-background text-xs font-bold hover:opacity-85 transition-opacity rounded-sm shadow-xs"
                      >
                        {item.type === 'request' ? 'Grant Access' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        className="px-4 bg-secondary hover:bg-chart-3/10 text-muted-foreground hover:text-chart-3 text-xs font-bold rounded-sm border border-border transition-all flex items-center justify-center"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* VIEW 2: Myself (The Stream of Approved Entries) */}
        {view === 'record' && (
          <section className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="pb-3 border-b border-border">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Myself</h1>
              <a
                href={`https://${username}.memact.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground font-semibold font-mono hover:underline transition-colors"
              >
                {username}.memact.com
              </a>
            </div>

            {/* Input to add entries directly */}
            <form onSubmit={handleAddCustomEntry} className="flex gap-2.5 bg-card border border-border p-2 rounded-sm shadow-[0_4px_16px_rgba(0,0,0,0.01)] items-center w-full">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={newEntryText}
                  onChange={(e) => setNewEntryText(e.target.value)}
                  placeholder="Write something..."
                  className="w-full bg-secondary border border-border pl-3.5 pr-9 py-2.5 text-xs outline-none rounded-sm text-foreground placeholder:text-muted-foreground/35 font-medium transition-all"
                />
                {newEntryText.trim().length > 0 && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-foreground/5 text-muted-foreground hover:text-foreground rounded-sm transition-all animate-[fadeIn_0.15s_ease-out]"
                    aria-label="Submit entry"
                  >
                    <CornerDownLeft size={11} className="stroke-[2.5]" />
                  </button>
                )}
              </div>
              {/* Hidden submit button to allow submitting by hitting Enter key */}
              <button type="submit" className="hidden" />
            </form>

            {/* The Notebook Stream */}
            <div className="space-y-4">
              {entries.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-sm text-center bg-secondary/15 py-12 text-xs text-muted-foreground italic select-none">
                  Your memory registry is empty. Add something above.
                </div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-card border border-border p-5 rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.005)] space-y-3.5 relative group transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.015)] animate-[fadeIn_0.2s_ease-out]"
                  >
                    <p className="text-sm font-medium text-foreground leading-relaxed pr-8">
                      {entry.content}
                    </p>

                    {/* Metadata bar */}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 font-medium pt-2.5 border-t border-border/40 select-none">
                      <div className="flex items-center gap-3">
                        {/* Contributor */}
                        <span>
                          By {entry.contributor === 'You' ? 'you' : entry.contributor}
                        </span>
                        
                        <span>•</span>

                        {/* Visibility switcher */}
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(activeDropdownId === entry.id ? null : entry.id);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border border-border rounded-full hover:bg-secondary transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                          >
                            {entry.visibility === 'Public' && <Globe size={11} className="text-chart-2" />}
                            {entry.visibility === 'Private' && <Lock size={11} className="text-muted-foreground/60" />}
                            <span>{entry.visibility}</span>
                          </button>

                          {activeDropdownId === entry.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setActiveDropdownId(null)}
                              />
                              <div className="absolute left-0 mt-1.5 w-44 bg-popover text-popover-foreground border border-border rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.05)] py-1 z-50 animate-[fadeIn_0.15s_ease-out] select-none">
                                {[
                                  { value: 'Public', label: 'Public (Everyone)', icon: <Globe size={11} className="text-chart-2" /> },
                                  { value: 'Private', label: 'Private (Just me)', icon: <Lock size={11} className="text-muted-foreground/60" /> }
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      updateVisibility(entry.id, opt.value as any);
                                      setActiveDropdownId(null);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-2 hover:bg-secondary transition-colors ${
                                      entry.visibility === opt.value ? 'bg-secondary text-foreground font-extrabold' : 'text-muted-foreground font-medium'
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

                      <div className="flex items-center gap-4">
                        {/* Star / highlight toggle */}
                        <button
                          onClick={() => handleToggleStar(entry.id)}
                          className={`transition-colors flex items-center justify-center cursor-pointer ${
                            entry.starred ? 'text-chart-4' : 'text-muted-foreground/35 hover:text-chart-4'
                          }`}
                        >
                          <Star size={16} fill={entry.starred ? 'currentColor' : 'none'} />
                        </button>

                        {/* Delete entry */}
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-muted-foreground/35 hover:text-chart-3 transition-all flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* VIEW 3: Access (Permissions & Governance) */}
        {view === 'access' && (
          <section className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="pb-2 border-b border-border flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Privacy</h1>
              
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[11px] font-bold border transition-colors ${
                  isPublic 
                    ? 'bg-background hover:bg-secondary/60 text-foreground border-border'
                    : 'bg-chart-4/10 border-chart-4/30 text-chart-4'
                }`}
              >
                {isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{isPublic ? 'Public link is active' : 'Memory registry is hidden'}</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Coherent Visibility System Card */}
              <div className="bg-card border border-border p-5 rounded-sm space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Who can see my memory registry?</h3>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start gap-3 p-3 bg-secondary/10 border border-border/40 rounded-sm">
                    <Globe size={14} className="text-chart-2 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground flex items-center gap-2">
                        Public 
                        <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.25 rounded-full font-mono text-muted-foreground">
                          {entries.filter(e => e.visibility === 'Public').length} entries
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        Anyone visiting{' '}
                        <a
                          href={`https://${username}.memact.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-foreground font-semibold hover:underline"
                        >
                          {username}.memact.com
                        </a>{' '}
                        can read these.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/10 border border-border/40 rounded-sm">
                    <Lock size={14} className="text-muted-foreground/60 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground flex items-center gap-2">
                        Private 
                        <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.25 rounded-full font-mono text-muted-foreground">
                          {entries.filter(e => e.visibility === 'Private').length} entries
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        Strictly confidential. Invisible to all apps, agents, and other users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permitted Apps Connections */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Permitted apps</h3>
                <div className="space-y-3">
                  {permittedApps.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground italic border border-dashed border-border rounded-sm bg-secondary/15">
                      No active external connections.
                    </div>
                  ) : (
                    permittedApps.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3.5 bg-secondary/15 rounded-sm border border-border/55 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-accent/10 border border-accent/20 text-accent font-bold text-[10px] rounded-sm flex items-center justify-center uppercase shrink-0">
                            {app.name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{app.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{app.scope}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground/60 tabular-nums">{app.time}</span>
                          <button
                            onClick={() => handleRevokeApp(app)}
                            className="text-[10px] text-chart-3 hover:opacity-80 font-bold hover:underline transition-colors shrink-0"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              {/* Contributor List summary */}
              <div className="space-y-3 pt-6 border-t border-border/40">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Contributors</h3>
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    {(() => {
                      const contributorList = Object.entries(contributorStats);
                      const displayed = (!contributorsExpanded && contributorList.length > 5)
                        ? contributorList.slice(0, 5)
                        : contributorList;
                      return displayed.map(([name, count]) => (
                        <div key={name} className="p-3 bg-secondary/15 border border-border/45 rounded-sm flex justify-between items-center text-xs">
                          <span className="font-semibold text-foreground">{name === 'You' ? 'you' : name}</span>
                          <span className="text-muted-foreground font-mono text-[10px]">{count} entries</span>
                        </div>
                      ));
                    })()}
                  </div>
                  {Object.keys(contributorStats).length > 5 && (
                    <button
                      type="button"
                      onClick={() => setContributorsExpanded(!contributorsExpanded)}
                      className="mt-3 text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors select-none"
                    >
                      <span>{contributorsExpanded ? 'Show less' : `Show all (${Object.keys(contributorStats).length})`}</span>
                      <ChevronDown size={12} className={`transition-transform duration-200 ${contributorsExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Contributions Timeline */}
              <div className="space-y-3 pt-6 border-t border-border/40">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-semibold">Activity History</h3>
                <div className="space-y-2.5">
                  {(() => {
                    const displayed = (!historyExpanded && history.length > 5)
                      ? history.slice(0, 5)
                      : history;
                    return displayed.map((h) => (
                      <div key={h.id} className="p-3 bg-secondary/10 border border-border/30 rounded-sm text-[11px] flex justify-between items-start gap-4">
                        <span className={`leading-relaxed font-semibold ${
                          h.status === 'rejected' ? 'text-muted-foreground/80 line-through' : h.status === 'revoked' ? 'text-chart-3/80' : 'text-foreground/90'
                        }`}>
                          {h.action}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5 tabular-nums">{h.time}</span>
                      </div>
                    ));
                  })()}
                  {history.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setHistoryExpanded(!historyExpanded)}
                      className="mt-2 text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors select-none"
                    >
                      <span>{historyExpanded ? 'Show less' : `Show all (${history.length})`}</span>
                      <ChevronDown size={12} className={`transition-transform duration-200 ${historyExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              </div>
            </div>
          </section>
        )}

        {/* VIEW 4: Settings */}
        {view === 'settings' && (
          <section className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="pb-2 border-b border-border">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
            </div>

            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-card border border-border p-5 rounded-sm space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Identity Details</h3>
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Full Name</label>
                    <div className="text-xs font-medium text-foreground bg-secondary px-3 py-2.5 border border-border rounded-sm font-semibold">
                      {fullName}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Personal Address</label>
                    <div className="text-xs font-mono bg-secondary px-3 py-2.5 border border-border rounded-sm">
                      <a
                        href={`https://${username}.memact.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                      >
                        {username}.memact.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

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
