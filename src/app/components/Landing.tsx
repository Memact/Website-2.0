import { useState, useEffect } from 'react';
import { ArrowRight, Moon, Sun, Check, Terminal, Calendar, Sliders, Shield, ArrowUpRight, CheckCircle2, Globe, Users, Lock, X, Sparkles } from 'lucide-react';
import textLogoLight from '../../imports/text_logo_nobg_light.png';
import textLogoDark  from '../../imports/text_logo_nobg_dark.png';

// ─── Interactive Query Simulator ─────────────────────────────────────────────

function QuerySimulator() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'myself' | 'access'>('inbox');
  const [personalizationState, setPersonalizationState] = useState<'none' | 'cursor-success' | 'claude-proposed' | 'linear-proposed' | 'linear-approved'>('none');
  
  const [inboxItems, setInboxItems] = useState<Array<{
    id: string;
    type: 'suggestion' | 'request';
    from: string;
    avatarColor: string;
    title: string;
    reason: string;
    visibility: 'Public' | 'Private' | 'Friends';
    value: string;
  }>>([
    {
      id: 'github-1',
      type: 'suggestion',
      from: 'GitHub',
      avatarColor: 'bg-muted text-muted-foreground border-muted',
      title: 'Open Source Contributor',
      reason: 'Pushed 4 commits to cargo-lipo today.',
      visibility: 'Public',
      value: 'Open Source Contributor'
    },
    {
      id: 'sofia-1',
      type: 'suggestion',
      from: 'Sofia M.',
      avatarColor: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      title: "Sofia says I'm funny.",
      reason: 'Mentioned in text conversation yesterday.',
      visibility: 'Friends',
      value: "Sofia says I'm funny."
    },
    {
      id: 'claude-init',
      type: 'suggestion',
      from: 'Claude',
      avatarColor: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
      title: 'Systems thinking',
      reason: 'Extracted from Tokyo design outline edits.',
      visibility: 'Private',
      value: 'Systems thinking'
    },
    {
      id: 'spotify-1',
      type: 'suggestion',
      from: 'Spotify',
      avatarColor: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
      title: 'Lofi & Ambient listener',
      reason: 'Listened to 3 hours of focus music today.',
      visibility: 'Public',
      value: 'Lofi & Ambient listener'
    },
    {
      id: 'calendly-1',
      type: 'suggestion',
      from: 'Calendly',
      avatarColor: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      title: 'Prefer afternoon meetings',
      reason: '80% of booked events occur after 2 PM.',
      visibility: 'Friends',
      value: 'Prefer afternoon meetings'
    }
  ]);

  const [approvedItems, setApprovedItems] = useState<Array<{
    id: string;
    text: string;
    source: string;
    visibility: 'Public' | 'Private' | 'Friends';
    isNew?: boolean;
  }>>([
    { id: 'init-1', text: 'Building Memact address protocol beta.', source: 'You', visibility: 'Public' },
    { id: 'init-2', text: 'Available for booking on afternoons only.', source: 'You', visibility: 'Public' }
  ]);

  const [permittedApps, setPermittedApps] = useState<Array<{
    id: string;
    name: string;
    scope: string;
    time: string;
  }>>([
    { id: 'cursor', name: 'Cursor IDE', scope: 'Public entries', time: 'Active 5m ago' },
    { id: 'cal', name: 'Cal.com', scope: 'Public entries', time: 'Active yesterday' }
  ]);

  const handleApprove = (item: typeof inboxItems[0]) => {
    if (item.type === 'request') {
      setPermittedApps(prev => [
        { id: item.from.toLowerCase(), name: item.from, scope: 'Public & Friends entries', time: 'Granted just now' },
        ...prev
      ]);
      setPersonalizationState('linear-approved');
      setActiveTab('access');
    } else {
      if (!approvedItems.some(x => x.text === item.value)) {
        setApprovedItems(prev => [
          {
            id: item.id,
            text: item.value,
            source: item.from,
            visibility: item.visibility,
            isNew: true
          },
          ...prev
        ]);
      }
      setActiveTab('myself');
    }
    setInboxItems(prev => prev.filter(x => x.id !== item.id));
  };

  const handleReject = (item: typeof inboxItems[0]) => {
    setInboxItems(prev => prev.filter(x => x.id !== item.id));
  };

  const triggerClaudeProposal = () => {
    if (!inboxItems.some(x => x.id === 'claude-1') && !approvedItems.some(x => x.text === 'Researching Tokyo subway architecture.')) {
      setInboxItems(prev => [
        {
          id: 'claude-1',
          type: 'suggestion',
          from: 'Claude',
          avatarColor: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
          title: 'Researching Tokyo subway architecture.',
          reason: 'Extracted from Tokyo design outline edits.',
          visibility: 'Private',
          value: 'Researching Tokyo subway architecture.'
        },
        ...prev
      ]);
    }
    setPersonalizationState('claude-proposed');
    setActiveTab('inbox');
  };

  const triggerLinearRequest = () => {
    if (!inboxItems.some(x => x.id === 'linear-1') && !permittedApps.some(x => x.id === 'linear')) {
      setInboxItems(prev => [
        {
          id: 'linear-1',
          type: 'request',
          from: 'Linear',
          avatarColor: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
          title: 'Linear requests access to read what you are working on',
          reason: 'Wants to match ticket priority to your focus stream.',
          visibility: 'Private',
          value: 'Linear'
        },
        ...prev
      ]);
    }
    setPersonalizationState('linear-proposed');
    setActiveTab('inbox');
  };

  const triggerCursorPersonalization = () => {
    setPersonalizationState('cursor-success');
  };

  const resetSimulator = () => {
    setInboxItems([
      {
        id: 'github-1',
        type: 'suggestion',
        from: 'GitHub',
        avatarColor: 'bg-muted text-muted-foreground border-muted',
        title: 'Open Source Contributor',
        reason: 'Pushed 4 commits to cargo-lipo today.',
        visibility: 'Public',
        value: 'Open Source Contributor'
      },
      {
        id: 'sofia-1',
        type: 'suggestion',
        from: 'Sofia M.',
        avatarColor: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
        title: "Sofia says I'm funny.",
        reason: 'Mentioned in text conversation yesterday.',
        visibility: 'Friends',
        value: "Sofia says I'm funny."
      },
      {
        id: 'claude-init',
        type: 'suggestion',
        from: 'Claude',
        avatarColor: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
        title: 'Systems thinking',
        reason: 'Extracted from Tokyo design outline edits.',
        visibility: 'Private',
        value: 'Systems thinking'
      },
      {
        id: 'spotify-1',
        type: 'suggestion',
        from: 'Spotify',
        avatarColor: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
        title: 'Lofi & Ambient listener',
        reason: 'Listened to 3 hours of focus music today.',
        visibility: 'Public',
        value: 'Lofi & Ambient listener'
      },
      {
        id: 'calendly-1',
        type: 'suggestion',
        from: 'Calendly',
        avatarColor: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
        title: 'Prefer afternoon meetings',
        reason: '80% of booked events occur after 2 PM.',
        visibility: 'Friends',
        value: 'Prefer afternoon meetings'
      }
    ]);
    setApprovedItems([
      { id: 'init-1', text: 'Building Memact address protocol beta.', source: 'You', visibility: 'Public' },
      { id: 'init-2', text: 'Available for booking on afternoons only.', source: 'You', visibility: 'Public' }
    ]);
    setPermittedApps([
      { id: 'cursor', name: 'Cursor IDE', scope: 'Public entries', time: 'Active 5m ago' },
      { id: 'cal', name: 'Cal.com', scope: 'Public entries', time: 'Active yesterday' }
    ]);
    setPersonalizationState('none');
    setActiveTab('inbox');
  };

  return (
    <div
      className="w-full rounded-sm overflow-hidden border border-border bg-card/65 shadow-[0_20px_50px_rgba(0,1,27,0.08)] flex flex-col h-[520px]"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Browser Bar / Address header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40 select-none">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
        </div>
        <div className="flex-1 flex justify-center mr-10">
          <div className="bg-background border border-border rounded-sm px-4 py-0.5 text-[11px] text-muted-foreground font-semibold tracking-tight flex items-center gap-1 font-mono">
            alex.memact.me
          </div>
        </div>
      </div>

      {/* Simulator Body */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left Column: Memact Portal Mockup */}
        <div className="md:col-span-6 border-r border-border bg-background/40 flex flex-col overflow-hidden">
          {/* Mini Nav tabs */}
          <div className="flex items-center border-b border-border bg-secondary/25 px-2 select-none">
            {[
              { id: 'inbox', label: 'Inbox', badge: inboxItems.length },
              { id: 'myself', label: 'Myself' },
              { id: 'access', label: 'Access' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-[10px] font-bold py-2.5 px-3 relative transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-foreground border-b border-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="ml-1 bg-accent/15 border border-accent/25 text-accent text-[8px] font-bold px-1.5 py-0.25 rounded-full shrink-0">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-3">
              {activeTab === 'inbox' && (
                <div className="space-y-3">
                  {inboxItems.length === 0 ? (
                    <div className="p-6 border border-dashed border-border rounded-sm bg-secondary/15 text-center py-10 select-none">
                      <Check className="mx-auto text-chart-2 mb-2 bg-chart-2/10 p-1 rounded-full border border-chart-2/25" size={20} />
                      <div className="text-[10px] font-bold text-foreground">Inbox is clear</div>
                    </div>
                  ) : (
                    inboxItems.map(item => (
                      <div key={item.id} className="bg-card border border-border p-3.5 rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-3">
                        <div className="flex items-center justify-between select-none">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.25 text-[8px] font-bold border rounded-full ${item.avatarColor}`}>
                              {item.from}
                            </span>
                            <span className="text-[8px] text-muted-foreground font-semibold">
                              {item.type === 'request' ? 'Permission requested' : 'Suggested update'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-foreground leading-snug">
                            {item.type === 'request' ? item.title : `"${item.title}"`}
                          </h4>
                          <p className="text-[9px] text-muted-foreground/80 leading-relaxed flex items-start gap-1 font-medium mt-1 select-none">
                            <Sparkles size={9} className="shrink-0 mt-0.5 text-muted-foreground/40" />
                            <span>{item.reason}</span>
                          </p>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-border/40 select-none">
                          <button
                            onClick={() => handleApprove(item)}
                            className="flex-1 py-1 bg-foreground text-background text-[9px] font-bold hover:opacity-85 transition-opacity rounded-xs cursor-pointer"
                          >
                            {item.type === 'request' ? 'Grant Access' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            className="px-2 py-1 bg-secondary text-muted-foreground hover:text-foreground text-[9px] font-bold rounded-xs border border-border transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'myself' && (
                <div className="space-y-2 max-h-[340px] overflow-y-auto">
                  {approvedItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-3 bg-card rounded-sm border transition-all duration-500 space-y-2 ${
                        item.isNew 
                          ? 'border-green-500/50 shadow-[0_0_12px_rgba(34,197,94,0.12)]' 
                          : 'border-border/80'
                      }`}
                    >
                      <p className="text-xs font-medium text-foreground leading-relaxed">
                        {item.text}
                      </p>
                      <div className="flex items-center justify-between pt-1.5 border-t border-border/30 text-[8px] text-muted-foreground font-semibold select-none">
                        <span>By {item.source}</span>
                        <span className="flex items-center gap-1">
                          {item.visibility === 'Public' && <Globe size={8} className="text-chart-2" />}
                          {item.visibility === 'Friends' && <Users size={8} className="text-chart-3" />}
                          {item.visibility === 'Private' && <Lock size={8} className="text-muted-foreground/60" />}
                          <span>{item.visibility}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'access' && (
                <div className="space-y-2">
                  <div className="text-[9px] text-muted-foreground font-semibold pb-1 border-b border-border/30 select-none">Apps reading your address</div>
                  {permittedApps.map(app => (
                    <div key={app.id} className="bg-card border border-border p-2.5 rounded-sm flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.005)]">
                      <div>
                        <div className="text-xs font-bold text-foreground">{app.name}</div>
                        <div className="text-[8px] text-muted-foreground/80 font-medium mt-0.5">{app.scope} • {app.time}</div>
                      </div>
                      <span className="text-[8px] font-bold text-muted-foreground/65 border border-border px-1.5 py-0.5 rounded-xs select-none">
                        Revoke
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-[8px] text-muted-foreground/65 italic pt-2 select-none border-t border-border/20 mt-4">
              {activeTab === 'inbox' && 'Approve suggestions to save them to your profile.'}
              {activeTab === 'myself' && 'This is your living notebook profile. Apps read only what you allow.'}
              {activeTab === 'access' && 'Manage which apps can read your notebook context.'}
            </div>
          </div>
        </div>

        {/* Right Column: Simulate Actions & App Response */}
        <div className="md:col-span-6 p-4 flex flex-col justify-between bg-card/10 overflow-y-auto">
          {/* Action trigger panels */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">Simulate App Actions</div>
            
            <div className="grid grid-cols-1 gap-2">
              {/* Claude proposes fact */}
              <button
                onClick={triggerClaudeProposal}
                className="w-full text-left p-2.5 rounded-sm border bg-card hover:bg-secondary/65 border-border transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-full bg-chart-5/10 text-chart-5 border border-chart-5/20 shrink-0">
                    <Sliders size={12} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-foreground leading-none">Claude AI</div>
                    <div className="text-[9px] text-muted-foreground/80 font-medium mt-1 truncate">Propose 'Tokyo Subway' research fact</div>
                  </div>
                </div>
                <ArrowRight size={10} className="text-muted-foreground" />
              </button>

              {/* Linear requests access */}
              <button
                onClick={triggerLinearRequest}
                className="w-full text-left p-2.5 rounded-sm border bg-card hover:bg-secondary/65 border-border transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-full bg-chart-4/10 text-chart-4 border border-chart-4/20 shrink-0">
                    <Users size={12} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-foreground leading-none">Linear</div>
                    <div className="text-[9px] text-muted-foreground/80 font-medium mt-1 truncate">Request permission to read focus stream</div>
                  </div>
                </div>
                <ArrowRight size={10} className="text-muted-foreground" />
              </button>

              {/* Cursor IDE queries */}
              <button
                onClick={triggerCursorPersonalization}
                className="w-full text-left p-2.5 rounded-sm border bg-card hover:bg-secondary/65 border-border transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-full bg-muted text-muted-foreground border border-border shrink-0">
                    <Terminal size={12} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-foreground leading-none">Cursor IDE</div>
                    <div className="text-[9px] text-muted-foreground/80 font-medium mt-1 truncate">Personalize developer workspace</div>
                  </div>
                </div>
                <ArrowRight size={10} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Outcome Visual Mockups */}
          <div className="flex-1 flex flex-col justify-center my-3.5 min-h-[160px]">
            {personalizationState === 'none' && (
              <div className="text-center py-5 px-4 border border-dashed border-border rounded-sm bg-secondary/15 flex-1 flex flex-col justify-center items-center select-none">
                <Shield className="text-muted-foreground/45 mb-2 bg-muted/10 p-1.5 rounded-full border border-border" size={24} />
                <div className="text-xs font-bold text-foreground mb-0.5">App Outcome Sandbox</div>
                <div className="text-[9px] text-muted-foreground max-w-[200px] leading-relaxed">
                  Trigger an action above to see how apps interact with Memact.
                </div>
              </div>
            )}

            {personalizationState === 'claude-proposed' && (
              <div className="bg-card border border-border p-4 rounded-sm flex-1 flex flex-col justify-center items-center text-center space-y-2 animate-in fade-in duration-300">
                <div className="w-7 h-7 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center border border-yellow-500/20">
                  <Sparkles size={13} className="animate-pulse" />
                </div>
                <div className="text-xs font-bold text-foreground">Suggested Fact Sent</div>
                <div className="text-[10px] text-muted-foreground max-w-[190px] leading-relaxed">
                  Claude sent a proposal to your Inbox. Approve it in the left <span className="font-semibold text-foreground">Inbox tab</span> to add it to your notebook profile.
                </div>
              </div>
            )}

            {personalizationState === 'linear-proposed' && (
              <div className="bg-card border border-border p-4 rounded-sm flex-1 flex flex-col justify-center items-center text-center space-y-2 animate-in fade-in duration-300">
                <div className="w-7 h-7 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center border border-yellow-500/20">
                  <Users size={13} className="animate-pulse" />
                </div>
                <div className="text-xs font-bold text-foreground">Access Request Sent</div>
                <div className="text-[10px] text-muted-foreground max-w-[190px] leading-relaxed">
                  Linear requested read access. Review it in the left <span className="font-semibold text-foreground">Inbox tab</span>.
                </div>
              </div>
            )}

            {personalizationState === 'linear-approved' && (
              <div className="bg-background border border-border rounded-sm flex-1 flex flex-col overflow-hidden text-left shadow-md animate-in fade-in duration-300">
                <div className="bg-secondary/40 border-b border-border px-3 py-1.5 flex items-center justify-between select-none">
                  <span className="text-[10px] font-bold text-foreground">Linear Workspace</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between bg-card/50">
                  <div className="space-y-2.5">
                    <div className="bg-green-500/10 text-green-600 dark:text-green-400 p-2 rounded-xs border border-green-500/20 text-[9px] leading-tight font-semibold">
                      Connected to alex.memact.me
                    </div>
                    <p className="text-[11px] font-medium text-foreground leading-relaxed">
                      Linear successfully matched your backlog tickets to your active notebook focus!
                    </p>
                  </div>
                  <div className="text-[8px] text-muted-foreground/60 select-none border-t border-border/20 pt-2 font-medium">
                    Permissions: Granted
                  </div>
                </div>
              </div>
            )}

            {personalizationState === 'cursor-success' && (
              <div className="bg-background border border-border rounded-sm flex-1 flex flex-col overflow-hidden text-left shadow-md animate-in fade-in duration-300">
                <div className="bg-secondary/40 border-b border-border px-3 py-1.5 flex items-center justify-between select-none">
                  <div className="flex items-center gap-1">
                    <Terminal size={10} className="text-muted-foreground" />
                    <span className="text-[10px] font-bold text-foreground">Cursor AI Chat</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between bg-card/50">
                  <div className="space-y-2.5">
                    <div className="bg-secondary/35 p-2 rounded-sm border border-border/40 text-[9px] leading-relaxed text-muted-foreground font-mono">
                      &gt; Read alex.memact.me focus stream... <span className="text-green-500 font-semibold">Success</span>
                    </div>
                    <p className="text-[10px] font-medium text-foreground leading-relaxed">
                      "I initialized your workspace environment for: <span className="font-bold text-accent">"{approvedItems[0]?.text || 'Active focus'}"</span> based on approved profile data. Setup form skipped!"
                    </p>
                  </div>
                  <div className="text-[8px] text-muted-foreground/60 select-none border-t border-border/20 pt-2 flex justify-between items-center font-medium">
                    <span>Context matching: 100%</span>
                    <span className="text-green-500 font-bold">Personalized</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset button */}
          {personalizationState !== 'none' && (
            <button
              onClick={resetSimulator}
              className="text-[9px] font-bold text-muted-foreground hover:text-foreground transition-colors self-start underline underline-offset-2 select-none cursor-pointer"
            >
              Reset simulator
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Suggestion cards preview ─────────────────────────────────────────────────

function SuggestionPreview() {
  const cards = [
    { from: 'Claude',   color: '#7C6FAE', text: 'Suggested update: Systems thinking' },
    { from: 'GitHub',   color: '#4A7C94', text: 'Suggested update: Open source contributor' },
    { from: 'Sofia M.', color: '#4255FF', text: 'Suggested update: Rock climbing' },
  ];
  return (
    <div className="space-y-3">
      {cards.map((c) => (
        <div key={c.from} className="flex items-start gap-3 p-4 bg-card rounded-sm border-l-2" style={{ borderLeftColor: c.color + '80' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white" style={{ background: c.color }}>
            {c.from[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold mb-0.5" style={{ color: c.color }}>{c.from}</div>
            <div className="text-sm text-foreground font-medium leading-snug">{c.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────

interface LandingProps {
  onNavigate: (page: 'identity' | 'auth' | 'faq', tab?: 'login' | 'signup', email?: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function Landing({ onNavigate, isDark, onToggleDark }: LandingProps) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-[60px] bg-background/90 backdrop-blur-sm border-b border-border">
        <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[18px] w-auto" />
        <div className="flex items-center gap-5">
          <button onClick={onToggleDark} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle dark mode">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={() => onNavigate('faq')} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            FAQ
          </button>
          <button onClick={() => onNavigate('auth', 'login')} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            Sign in
          </button>
          <button onClick={() => onNavigate('auth', 'signup')} className="bg-foreground text-background text-sm px-4 py-2 font-semibold hover:opacity-80 transition-opacity">
            Create account
          </button>
        </div>
      </nav>

      {/* Hero — two columns */}
      <section className="pt-[60px] min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left */}
        <div className="flex flex-col justify-center px-12 py-16 lg:pl-16 lg:pr-8">
          <div className="max-w-lg">
            <h1 className="reveal text-[clamp(36px,5.5vw,56px)] font-bold leading-[1.06] tracking-tight text-foreground mb-5">
              Stop reintroducing<br />yourself to the world.
            </h1>
            <p className="reveal reveal-delay-100 text-base text-muted-foreground leading-relaxed mb-8 max-w-md">
              Claim <span className="text-foreground font-semibold">username.memact.me</span>: a personal address where apps, agents, and users read and write about you.
            </p>
            <div className="reveal reveal-delay-200 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('auth', 'signup')}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                Claim your address <ArrowRight size={14} />
              </button>
              <button
                onClick={() => onNavigate('identity')}
                className="text-sm text-muted-foreground border border-border px-6 py-3 hover:bg-card transition-colors font-medium"
              >
                See it live
              </button>
            </div>
          </div>
        </div>

        {/* Right — query simulator */}
        <div className="reveal reveal-delay-300 relative flex items-center justify-center px-8 py-16 lg:pl-4 lg:pr-12 bg-card/40">
          <div className="w-full max-w-xl relative">
            <QuerySimulator />
          </div>
        </div>
      </section>

      {/* Three points — tight, no gap */}
      <section className="border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {[
            { title: 'Claim your address.', body: 'Create your username.memact.me link. It belongs entirely to you.' },
            { title: 'Own your data.', body: 'Store your bio, active projects, and preferences in one place, not scattered across different profiles.' },
            { title: 'Paste to AI agents.', body: 'Give your link to ChatGPT, Claude, or Cursor. They read it and instantly adapt to you. No more retyping who you are.' },
          ].map((item, i) => (
            <div key={item.title} className={`reveal reveal-delay-${i * 100} px-10 py-12 ${i < 2 ? 'border-b md:border-b-0 md:border-r border-border' : ''}`}>
              <div className="text-sm font-semibold text-foreground mb-2">{item.title}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Suggestions section */}
      <section className="border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="reveal px-10 py-14 lg:border-r border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4 leading-snug tracking-tight">
              Let apps update you.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              When a connected tool or collaborator notices a change in your stack or focus, they can suggest an update. You approve, edit, or reject it.
            </p>
            <ul className="space-y-2">
              {['You own every profile card', 'Nothing changes without your permission', 'All edits are transparent'].map((t, idx) => (
                <li key={t} className={`reveal reveal-delay-${(idx + 1) * 100} flex items-center gap-2.5 text-sm text-muted-foreground`}>
                  <Check size={13} className="text-accent shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal reveal-delay-200 px-10 py-14">
            <SuggestionPreview />
          </div>
        </div>
      </section>

      {/* The URL section */}
      <section className="border-t border-border px-10 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <div className="reveal text-[clamp(22px,4vw,48px)] font-bold tracking-tight text-foreground mb-4">
            <span className="text-muted-foreground">username.</span>memact.me
          </div>
          <p className="reveal reveal-delay-100 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto mb-10">
            A secure, readable link for your digital self. Share it, connect it to apps, or keep it private.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left max-w-4xl mx-auto">
            <div className="reveal reveal-delay-200 p-5 bg-card/60 border border-border/80 rounded-sm">
              <div className="text-xs font-bold text-foreground mb-2">Paste it to AI agents</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tell ChatGPT, Claude, or Cursor: <span className="font-mono text-[10px] bg-secondary/80 px-1.5 py-0.5 rounded-xs text-foreground font-semibold">"Here is my info: alex.memact.me"</span>. They read it and instantly adapt to you.
              </p>
            </div>
            
            <div className="reveal reveal-delay-300 p-5 bg-card/60 border border-border/80 rounded-sm">
              <div className="text-xs font-bold text-foreground mb-2">Skip setup forms</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Instead of copying your bio or filling out your goals on every new website, just share your link. Services read it and configure your workspace instantly.
              </p>
            </div>

            <div className="reveal reveal-delay-400 p-5 bg-card/60 border border-border/80 rounded-sm">
              <div className="text-xs font-bold text-foreground mb-2">Share with connections</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Send your link to friends or collaborators. They can view your public notebook stream or authenticate to see "Friends Only" updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — adaptive theme */}
      <section className="reveal px-10 py-20 border-t border-border bg-card">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[clamp(26px,4vw,40px)] font-bold mb-3 tracking-tight leading-tight text-foreground">
            Stop starting from scratch.
          </h2>
          <p className="text-sm mb-10 text-muted-foreground">Get your personal address today.</p>
          <form
            className="flex flex-col sm:flex-row gap-2 justify-center"
            onSubmit={(e) => { e.preventDefault(); onNavigate('auth', 'signup', email); }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 max-w-xs bg-secondary border border-border focus:border-foreground/45 transition-colors px-4 py-3 text-sm outline-none rounded-sm text-foreground placeholder:text-muted-foreground/30 font-medium"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 text-sm font-semibold hover:opacity-85 transition-opacity whitespace-nowrap rounded-sm"
            >
              Claim your address <ArrowRight size={13} />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border flex items-center justify-between">
        <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[14px] w-auto opacity-40" />
        <div className="flex gap-6">
          <button onClick={() => onNavigate('faq')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</button>
          {['Privacy', 'Terms', 'Contact'].map((item) => (
            <button key={item} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}
