import { useState, useEffect } from 'react';
import { Moon, Sun, X, Check, Plus, Globe, Eye, EyeOff, Trash2, Star, Sparkles, User, Settings, Lock, Users, Loader2 } from 'lucide-react';
import textLogoLight from '../../imports/text_logo_nobg_light.png';
import textLogoDark  from '../../imports/text_logo_nobg_dark.png';
import { Entry } from '../App';
import { supabase, toUiVisibility, toDbVisibility, formatTimeAgo } from '../../supabase';

interface IdentityViewProps {
  onBack: () => void;
  onPublicView: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  username: string;
  fullName: string;
  entries: Entry[];
  onUpdateEntries: (entries: Entry[]) => void;
  isClaimed: boolean;
  onUpgradeToManaged: () => void;
}

interface Suggestion {
  id: string;
  type: 'suggestion' | 'request';
  from: string;
  avatarColor: string;
  title: string;
  reason: string;
  visibility: 'Public' | 'Friends' | 'Private';
  value: string;
  time?: string;
}

interface PermittedApp {
  id: string;
  name: string;
  scope: string;
  time: string;
}

interface ShareLogItem {
  app: string;
  query: string;
  shared: string[];
  time: string;
}

type ViewMode = 'inbox' | 'junk' | 'you' | 'privacy' | 'settings';

export function IdentityView({
  onBack,
  onPublicView,
  isDark,
  onToggleDark,
  username,
  fullName,
  entries,
  onUpdateEntries,
  isClaimed,
  onUpgradeToManaged,
}: IdentityViewProps) {
  // Navigation / Views State
  const [view, setView] = useState<ViewMode>('inbox');

  // Dynamic Document Title based on current tab
  useEffect(() => {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    document.title = `Memact | ${capitalize(view)}`;
  }, [view]);

  // Input for adding new notes directly
  const [newEntryText, setNewEntryText] = useState('');

  // Link copy states
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // Active visibility dropdown ID
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Inline editing state for Inbox suggestions
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Claimed identity upgrade modal states
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradePassword, setUpgradePassword] = useState('');
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError('');
    if (upgradePassword.length < 6) {
      setUpgradeError('Password must be at least 6 characters.');
      return;
    }
    setUpgrading(true);
    try {
      if (supabase) {
        const { error: updateErr } = await supabase.auth.updateUser({
          password: upgradePassword
        });
        if (updateErr) throw updateErr;
      }
      onUpgradeToManaged();
      setIsUpgradeModalOpen(false);
      setUpgradePassword('');
    } catch (err: any) {
      setUpgradeError(err?.message || 'Failed to set password');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${username}.memact.com`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [inbox, setInbox] = useState<Suggestion[]>([]);
  const [junk, setJunk] = useState<Suggestion[]>([
    {
      id: 'j1',
      type: 'suggestion',
      from: 'Spotify',
      avatarColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      title: 'Likes music.',
      reason: 'Low information',
      visibility: 'Private',
      value: 'Likes music.',
      time: '1h ago'
    },
    {
      id: 'j2',
      type: 'suggestion',
      from: 'Chrome',
      avatarColor: 'bg-accent/10 text-accent border-accent/20',
      title: 'Uses the internet.',
      reason: 'Generic',
      visibility: 'Private',
      value: 'Uses the internet.',
      time: '4h ago'
    },
    {
      id: 'j3',
      type: 'suggestion',
      from: 'AI Agent',
      avatarColor: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
      title: 'Human.',
      reason: 'Spam / generic',
      visibility: 'Private',
      value: 'Human.',
      time: 'Yesterday'
    }
  ]);
  const [permittedApps, setPermittedApps] = useState<PermittedApp[]>([]);

  // Shared History Log data matching final design constitution requirements
  const [shareHistory, setShareHistory] = useState<ShareLogItem[]>([
    {
      app: 'Spotify',
      query: 'Music recommendations',
      shared: ['Likes Jazz', 'Workout Music'],
      time: '2h ago'
    },
    {
      app: 'Claude',
      query: 'Conversation details',
      shared: ['Building Memact', 'Interested in AI Agents'],
      time: 'Yesterday'
    },
    {
      app: 'Cursor IDE',
      query: 'Developer details',
      shared: ['Learning how memory agents connect'],
      time: '3 days ago'
    }
  ]);

  const getAvatarColorForContributor = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('claude')) return 'bg-chart-5/10 text-chart-5 border-chart-5/20';
    if (lower.includes('github')) return 'bg-muted text-muted-foreground border-muted';
    if (lower.includes('sofia')) return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
    if (lower.includes('linear')) return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
    return 'bg-accent/10 text-accent border-accent/20';
  };

  const refreshData = async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const { data: dbContribs, error: contribsErr } = await supabase
        .from('memact_contributions')
        .select('*')
        .eq('user_id', userId);

      if (contribsErr) throw contribsErr;

      if (dbContribs) {
        // Starred entries first, then sorted by created_at descending
        const sortedContribs = [...dbContribs].sort((a, b) => {
          if (a.is_starred !== b.is_starred) return a.is_starred ? -1 : 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const approved = sortedContribs
          .filter((c: any) => c.status === 'approved')
          .map((c: any) => ({
            id: c.id,
            content: c.content,
            contributor: c.contributor_name,
            visibility: toUiVisibility(c.visibility),
            starred: c.is_starred,
            time: formatTimeAgo(c.created_at)
          }));
        onUpdateEntries(approved);

        const pending = sortedContribs
          .filter((c: any) => c.status === 'pending')
          .map((c: any) => ({
            id: c.id,
            type: 'suggestion' as const,
            from: c.contributor_name,
            avatarColor: getAvatarColorForContributor(c.contributor_name),
            title: c.content,
            reason: `Proposed because of recent activity`,
            visibility: toUiVisibility(c.visibility),
            value: c.content,
            time: formatTimeAgo(c.created_at)
          }));
        setInbox(pending);

        const junkSuggestions = sortedContribs
          .filter((c: any) => c.status === 'junk')
          .map((c: any) => ({
            id: c.id,
            type: 'suggestion' as const,
            from: c.contributor_name,
            avatarColor: getAvatarColorForContributor(c.contributor_name),
            title: c.content,
            reason: c.junk_reason || 'Low quality / duplicate',
            visibility: toUiVisibility(c.visibility),
            value: c.content,
            time: formatTimeAgo(c.created_at)
          }));
        setJunk(junkSuggestions);
      }

      const { data: dbConns, error: connsErr } = await supabase
        .from('memact_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true);

      if (connsErr) throw connsErr;

      if (dbConns) {
        setPermittedApps(dbConns.map((c: any) => ({
          id: c.id,
          name: c.name,
          scope: `${c.type === 'friend' ? 'Friends' : 'Public'} entries`,
          time: `Active ${formatTimeAgo(c.created_at)}`
        })));
      }
    } catch (err) {
      console.error("Error refreshing data from Supabase:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleApprove = async (item: Suggestion) => {
    if (item.type === 'request') {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session?.user?.id;
          if (userId) {
            await supabase.from('memact_connections').insert({
              user_id: userId,
              name: item.from,
              type: 'app',
              active: true
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        if (supabase) {
          await supabase
            .from('memact_contributions')
            .update({ status: 'approved', visibility: toDbVisibility(item.visibility) })
            .eq('id', item.id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    await refreshData();
  };

  const handleSaveAndApprove = async (item: Suggestion, newValue: string) => {
    try {
      if (supabase) {
        await supabase
          .from('memact_contributions')
          .update({
            content: newValue,
            status: 'approved',
            visibility: toDbVisibility(item.visibility)
          })
          .eq('id', item.id);
      }
    } catch (err) {
      console.error(err);
    }
    setEditingId(null);
    await refreshData();
  };

  const handleReject = async (item: Suggestion) => {
    try {
      if (supabase) {
        await supabase
          .from('memact_contributions')
          .update({ status: 'rejected' })
          .eq('id', item.id);
      }
    } catch (err) {
      console.error(err);
    }
    await refreshData();
  };

  const handleAddCustomEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newEntryText.trim();
    if (!text) return;

    try {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (userId) {
          await supabase.from('memact_contributions').insert({
            user_id: userId,
            content: text,
            contributor_type: 'user',
            contributor_name: fullName || 'You',
            status: 'approved',
            visibility: 'private', // Defaults to private, user can toggle on card
            is_starred: false
          });
        }
      }
    } catch (err) {
      console.error(err);
    }

    setNewEntryText('');
    await refreshData();
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      if (supabase) {
        await supabase
          .from('memact_contributions')
          .delete()
          .eq('id', id);
      }
    } catch (err) {
      console.error(err);
    }
    await refreshData();
  };

  const handleToggleStar = async (id: string) => {
    const target = entries.find(e => e.id === id);
    if (!target) return;

    try {
      if (supabase) {
        await supabase
          .from('memact_contributions')
          .update({ is_starred: !target.starred })
          .eq('id', id);
      }
    } catch (err) {
      console.error(err);
    }
    await refreshData();
  };

  const updateVisibility = async (id: string, visibility: 'Private' | 'Friends' | 'Public') => {
    try {
      if (supabase) {
        await supabase
          .from('memact_contributions')
          .update({ visibility: toDbVisibility(visibility) })
          .eq('id', id);
      }
    } catch (err) {
      console.error(err);
    }
    await refreshData();
  };

  const handleRevokeApp = async (app: PermittedApp) => {
    try {
      if (supabase) {
        await supabase
          .from('memact_connections')
          .update({ active: false })
          .eq('id', app.id);
      }
    } catch (err) {
      console.error(err);
    }
    await refreshData();
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col justify-between"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Top Header & Navigation */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl w-full mx-auto px-6 h-[65px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={onBack} className="hover:opacity-75 transition-opacity shrink-0">
              <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[46px] w-auto" />
            </button>

            {/* Core User Intent Tabs */}
            <div className="flex items-center gap-5 select-none h-[65px]">
              {[
                { id: 'inbox', label: 'Inbox', badge: inbox.length },
                { id: 'junk', label: 'Junk', badge: junk.length },
                { id: 'you', label: 'You' },
                { id: 'privacy', label: 'Privacy' },
                { id: 'settings', label: 'Settings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as ViewMode)}
                  className={`text-xs font-semibold tracking-tight transition-all relative h-full flex items-center px-1.5 ${
                    view === tab.id
                      ? 'text-foreground border-b-2 border-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {tab.badge && tab.badge > 0 ? (
                    <span className="ml-1.5 bg-accent/15 border border-accent/25 text-accent text-[9px] font-bold px-1.5 py-0.25 rounded-full">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleCopy}
              className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-sm hover:bg-secondary/40 font-semibold"
            >
              {copied ? 'Copied link' : `${username}.memact.com`}
            </button>

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
        {isClaimed && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/25 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-[slideIn_0.3s_ease-out] select-none">
            <div>
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Claimed Identity</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                You are using a Claimed Identity without a password. Secure your address handle <strong>{username}.memact.com</strong> to manage it from any device.
              </p>
            </div>
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-2 rounded-sm shrink-0 uppercase tracking-wider transition-colors cursor-pointer"
            >
              Secure account
            </button>
          </div>
        )}
        
        {/* VIEW 1: Inbox (Review Contributions) */}
        {view === 'inbox' && (
          <section className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="pb-2 border-b border-border">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Inbox</h1>
            </div>

            <div className="space-y-4">
              {inbox.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-sm text-center bg-secondary/15 py-16 select-none">
                  <Check className="mx-auto text-chart-2 mb-3 bg-chart-2/10 p-2 rounded-full border border-chart-2/25" size={36} />
                  <h3 className="text-sm font-bold text-foreground mb-1">Your inbox is clear</h3>
                </div>
              ) : (
                inbox.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border p-6 rounded-sm shadow-[0_4px_16px_rgba(0,0,0,0.01)] space-y-4 relative overflow-hidden transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
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
                      {item.time && (
                        <span className="text-[9px] text-muted-foreground/60 font-medium select-none">{item.time}</span>
                      )}
                    </div>

                    {editingId === item.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="w-full bg-secondary border border-border px-3.5 py-2.5 text-xs outline-none rounded-sm text-foreground placeholder:text-muted-foreground/35 font-medium"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveAndApprove(item, editingValue)}
                            className="flex-1 py-2 bg-foreground text-background text-xs font-bold rounded-sm hover:opacity-85 transition-opacity"
                          >
                            Save & Approve
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 bg-secondary text-muted-foreground text-xs font-bold rounded-sm border border-border hover:bg-secondary/80 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-base font-bold text-foreground mb-1 leading-snug">"{item.title}"</h3>
                          <p className="text-xs text-muted-foreground/85 leading-normal flex items-start gap-1.5 font-medium mt-1 mb-3">
                            <Sparkles size={12} className="shrink-0 mt-0.5 text-muted-foreground/50" />
                            <span>{item.reason}</span>
                          </p>

                          {item.type === 'suggestion' && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20">
                              <span className="text-[10px] text-muted-foreground font-semibold">Proposed visibility:</span>
                              <div className="relative inline-block">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownId(activeDropdownId === item.id ? null : item.id);
                                  }}
                                  className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border border-border rounded-full hover:bg-secondary transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                  {item.visibility === 'Public' && <Globe size={10} className="text-chart-2" />}
                                  {item.visibility === 'Friends' && <Users size={10} className="text-chart-3" />}
                                  {item.visibility === 'Private' && <Lock size={10} className="text-muted-foreground/60" />}
                                  <span>{item.visibility}</span>
                                </button>

                                {activeDropdownId === item.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-40" 
                                      onClick={() => setActiveDropdownId(null)}
                                    />
                                    <div className="absolute left-0 mt-1 w-44 bg-popover text-popover-foreground border border-border rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.05)] py-1 z-50 select-none">
                                      {[
                                        { value: 'Public', label: 'Public (Everyone)', icon: <Globe size={11} className="text-chart-2" /> },
                                        { value: 'Friends', label: 'Friends (Connections)', icon: <Users size={11} className="text-chart-3" /> },
                                        { value: 'Private', label: 'Private (Just me)', icon: <Lock size={11} className="text-muted-foreground/60" /> }
                                      ].map((opt) => (
                                        <button
                                          key={opt.value}
                                          type="button"
                                          onClick={() => {
                                            setInbox(prev => prev.map(x => x.id === item.id ? { ...x, visibility: opt.value as any } : x));
                                            setActiveDropdownId(null);
                                          }}
                                          className={`w-full text-left px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-2 hover:bg-secondary transition-colors ${
                                            item.visibility === opt.value ? 'bg-secondary text-foreground font-extrabold' : 'text-muted-foreground font-medium'
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
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-border/40">
                          <button
                            onClick={() => handleApprove(item)}
                            className="flex-1 py-2 bg-foreground text-background text-xs font-bold hover:opacity-85 transition-opacity rounded-sm shadow-xs"
                          >
                            {item.type === 'request' ? 'Grant Access' : 'Approve'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditingValue(item.title);
                            }}
                            className="px-4 bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold rounded-sm border border-border transition-all flex items-center justify-center"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            className="px-4 bg-secondary hover:bg-chart-3/10 text-muted-foreground hover:text-chart-3 text-xs font-bold rounded-sm border border-border transition-all flex items-center justify-center"
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* VIEW 1.5: Junk Tab */}
        {view === 'junk' && (
          <section className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="pb-2 border-b border-border flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">Junk</h1>
                <p className="text-xs text-muted-foreground/80 mt-0.5">Memact filters duplicates and low-quality suggestions to keep your identity clear.</p>
              </div>
              {junk.length > 0 && (
                <button
                  onClick={() => setJunk([])}
                  className="text-[10px] font-bold text-destructive hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              {junk.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-sm text-center bg-secondary/15 py-16 select-none">
                  <Check className="mx-auto text-chart-2 mb-3 bg-chart-2/10 p-2 rounded-full border border-chart-2/25" size={36} />
                  <h3 className="text-sm font-bold text-foreground mb-1">Your junk folder is empty</h3>
                </div>
              ) : (
                junk.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border p-5 rounded-sm shadow-xs space-y-4 relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${item.avatarColor}`}>
                          {item.from}
                        </span>
                        <span className="text-[9px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full uppercase select-none">
                          {item.reason}
                        </span>
                      </div>
                      {item.time && (
                        <span className="text-[9px] text-muted-foreground/60 font-medium select-none">{item.time}</span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-foreground">
                      "{item.title}"
                    </p>

                    <div className="flex gap-2 pt-1 border-t border-border/40 justify-end">
                      <button
                        onClick={() => {
                          setJunk(prev => prev.filter(x => x.id !== item.id));
                        }}
                        className="text-[10px] font-bold text-muted-foreground hover:text-foreground border border-border px-3 py-1 rounded-sm cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setJunk(prev => prev.filter(x => x.id !== item.id));
                          alert(`Blocked ${item.from} from sending future suggestions.`);
                        }}
                        className="text-[10px] font-bold text-destructive border border-destructive/25 hover:bg-destructive/10 px-3 py-1 rounded-sm cursor-pointer"
                      >
                        Block Contributor
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* VIEW 2: You (Approved Stream) */}
        {view === 'you' && (
          <section className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="pb-3 border-b border-border">
              <h1 className="text-xl font-bold tracking-tight text-foreground">You</h1>
              <span className="text-xs text-muted-foreground font-semibold font-mono">{username}.memact.com</span>
            </div>

            {/* Universal Add button & Input */}
            <form onSubmit={handleAddCustomEntry} className="flex gap-2 bg-card border border-border p-2.5 rounded-sm shadow-sm items-center">
              <input
                type="text"
                value={newEntryText}
                onChange={(e) => setNewEntryText(e.target.value)}
                placeholder="Write anything..."
                className="flex-1 bg-secondary border border-border px-3.5 py-2.5 text-xs outline-none rounded-sm text-foreground placeholder:text-muted-foreground/35 font-medium"
              />
              <button
                type="submit"
                className="bg-foreground text-background text-xs font-bold px-4 py-2.5 rounded-sm hover:opacity-85 transition-opacity flex items-center gap-1 shrink-0"
              >
                <Plus size={12} /> Add
              </button>
            </form>

            {/* The Stream */}
            <div className="space-y-4">
              {entries.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-sm text-center bg-secondary/15 py-12 text-xs text-muted-foreground italic select-none">
                  Your stream is empty. Add something above.
                </div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-card border border-border p-5 rounded-sm shadow-xs space-y-3.5 relative group transition-all hover:shadow-sm"
                  >
                    <p className="text-sm font-medium text-foreground leading-relaxed pr-8">
                      {entry.content}
                    </p>

                    {/* Metadata bar */}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 font-medium pt-2.5 border-t border-border/40 select-none">
                      <div className="flex items-center gap-3">
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
                            {entry.visibility === 'Friends' && <Users size={11} className="text-chart-3" />}
                            {entry.visibility === 'Private' && <Lock size={11} className="text-muted-foreground/60" />}
                            <span>{entry.visibility}</span>
                          </button>

                          {activeDropdownId === entry.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setActiveDropdownId(null)}
                              />
                              <div className="absolute left-0 mt-1.5 w-44 bg-popover text-popover-foreground border border-border rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.05)] py-1 z-50 select-none">
                                {[
                                  { value: 'Public', label: 'Public (Everyone)', icon: <Globe size={11} className="text-chart-2" /> },
                                  { value: 'Friends', label: 'Friends (Connections)', icon: <Users size={11} className="text-chart-3" /> },
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

        {/* VIEW 3: Privacy (Permissions & Shared History Log) */}
        {view === 'privacy' && (
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
                <span>{isPublic ? 'Public link is active' : 'Address link is hidden'}</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Coherent Visibility System Card */}
              <div className="bg-card border border-border p-5 rounded-sm space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Visibility Levels</h3>
                
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
                        Anyone visiting <span className="font-mono text-foreground font-semibold">{username}.memact.com</span> can read these.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/10 border border-border/40 rounded-sm">
                    <Users size={14} className="text-chart-3 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground flex items-center gap-2">
                        Friends 
                        <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.25 rounded-full font-mono text-muted-foreground">
                          {entries.filter(e => e.visibility === 'Friends').length} entries
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        Only verified connections can view these when they authenticate.
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

              {/* Shared History Log */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Shared History Log</h3>
                <div className="space-y-4">
                  {shareHistory.map((item, idx) => (
                    <div key={idx} className="p-4 bg-secondary/15 border border-border/50 rounded-sm space-y-2.5 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-foreground">{item.app} asked:</span>
                        <span className="text-muted-foreground/60 text-[10px] select-none">{item.time}</span>
                      </div>
                      <div className="font-mono text-muted-foreground bg-background/50 border border-border/30 p-2 rounded-xs select-all text-[11px] leading-tight">
                        "{item.query}"
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider">Memact Shared:</div>
                        {item.shared.map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5 font-semibold text-foreground">
                            <span className="w-1 h-1 rounded-full bg-chart-2" />
                            {s}
                          </div>
                        ))}
                        <div className="text-[10px] text-muted-foreground/50 italic pt-1 border-t border-border/20 font-medium">
                          Nothing else shared.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permitted Apps Connections */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Permitted Connections</h3>
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
              </div>
            </div>
          </section>
        )}

        {/* VIEW 4: Settings (Strict Account Controls Only) */}
        {view === 'settings' && (
          <section className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="pb-2 border-b border-border">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
            </div>

            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-card border border-border p-5 rounded-sm space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Details</h3>
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Full Name</label>
                    <div className="text-xs font-medium text-foreground bg-secondary px-3 py-2.5 border border-border rounded-sm font-semibold">
                      {fullName}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Personal Address</label>
                    <div className="text-xs font-mono text-foreground bg-secondary px-3 py-2.5 border border-border rounded-sm">
                      {username}.memact.com
                    </div>
                  </div>
                </div>
              </div>

              {/* Log Out CTA */}
              <div className="pt-4">
                <button
                  onClick={onBack}
                  className="text-xs border border-red-500/20 text-red-500 hover:bg-red-500/10 px-5 py-2.5 font-bold transition-all rounded-sm cursor-pointer"
                >
                  Log out of account
                </button>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border flex items-center justify-between shrink-0 select-none">
        <span className="text-[10px] text-muted-foreground/50">© {new Date().getFullYear()} Memact. All rights reserved.</span>
        <div className="flex gap-4">
          <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Privacy</button>
          <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Terms</button>
        </div>
      </footer>

      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6 rounded-sm shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Secure your handle</h2>
              <button 
                onClick={() => {
                  setIsUpgradeModalOpen(false);
                  setUpgradePassword('');
                  setUpgradeError('');
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              Create a password for <strong>{username}.memact.com</strong> to secure this address. All existing approvals and visibility rules are already waiting.
            </p>

            <form onSubmit={handleUpgradeSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-foreground block mb-1 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={upgradePassword}
                  onChange={(e) => setUpgradePassword(e.target.value)}
                  className="w-full bg-secondary border border-border focus:border-foreground/45 transition-colors px-3 py-2 text-xs outline-none rounded-sm text-foreground font-semibold"
                />
              </div>

              {upgradeError && (
                <div className="text-[10px] text-destructive font-medium">{upgradeError}</div>
              )}

              <button
                type="submit"
                disabled={upgrading || upgradePassword.length < 6}
                className="w-full bg-foreground text-background py-2 text-xs font-bold hover:opacity-85 transition-opacity disabled:opacity-40 cursor-pointer"
              >
                {upgrading ? 'Securing address...' : 'Set password & secure'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
