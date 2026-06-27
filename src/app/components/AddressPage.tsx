import { useState, useEffect, useRef } from "react";
import { X, MoreHorizontal, Plus, Moon, Sun } from "lucide-react";
import textLogoLight from "../../imports/text_logo_nobg_light.png";
import textLogoDark  from "../../imports/text_logo_nobg_dark.png";
import { supabase, formatTimeAgo } from "../../supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClaimStatus = "approved" | "pending" | "rejected" | "archived";

interface Claim {
  id: string;
  content: string;
  contributor_name: string;
  contributor_type: string;
  status: ClaimStatus;
  visibility: string;
  is_starred: boolean;
  created_at: string;
}

type FilterTab = "approved" | "pending" | "rejected" | "self" | "archived";

export interface AddressPageProps {
  username: string;
  isDark: boolean;
  onToggleDark: () => void;
  onSignOut: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeLabel(c: Claim): string {
  if (c.contributor_type === "user") return "Added by you \u00b7 " + formatTimeAgo(c.created_at);
  return formatTimeAgo(c.created_at);
}

function sourceLabel(c: Claim): string {
  return c.contributor_name?.trim() || "App";
}

// ─── Cards ───────────────────────────────────────────────────────────────────

function ApprovedCard({ claim, onClick }: { claim: Claim; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-card border border-border rounded-xl p-4 hover:border-foreground/20 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground leading-snug">{claim.content}</p>
        <MoreHorizontal size={14} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{timeLabel(claim)}</p>
    </button>
  );
}

function PendingCard({ claim, onApprove, onReject }: {
  claim: Claim;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  const go = async (action: "approve" | "reject") => {
    setBusy(action);
    if (action === "approve") await onApprove(); else await onReject();
    setBusy(null);
  };

  return (
    <div className="w-full bg-card border border-border rounded-xl p-4">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{sourceLabel(claim)}</p>
      <p className="text-sm font-medium text-foreground leading-snug mb-4">{claim.content}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => go("approve")}
          disabled={busy !== null}
          className="flex-1 text-xs font-semibold bg-foreground text-background rounded-lg py-2 hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {busy === "approve" ? "\u2026" : "Save"}
        </button>
        <button
          onClick={() => go("reject")}
          disabled={busy !== null}
          className="flex-1 text-xs font-semibold bg-muted text-muted-foreground rounded-lg py-2 hover:text-foreground disabled:opacity-40 transition-colors"
        >
          {busy === "reject" ? "\u2026" : "Dismiss"}
        </button>
      </div>
    </div>
  );
}

function RejectedCard({ claim, onClick }: { claim: Claim; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-card border border-border rounded-xl p-4 opacity-60 hover:opacity-80 transition-opacity focus:outline-none"
    >
      <p className="text-sm font-medium text-foreground leading-snug line-through">{claim.content}</p>
      <p className="mt-3 text-xs text-muted-foreground">{sourceLabel(claim)} \u00b7 {formatTimeAgo(claim.created_at)}</p>
    </button>
  );
}

function ArchivedCard({ claim, onRestore, onClick }: {
  claim: Claim;
  onRestore: () => Promise<void>;
  onClick: () => void;
}) {
  const [restoring, setRestoring] = useState(false);
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-card border border-border rounded-xl p-4 hover:border-foreground/20 transition-all focus:outline-none"
    >
      <p className="text-sm font-medium text-foreground/50 leading-snug">{claim.content}</p>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{formatTimeAgo(claim.created_at)}</p>
        <button
          onClick={async (e) => { e.stopPropagation(); setRestoring(true); await onRestore(); setRestoring(false); }}
          disabled={restoring}
          className="text-xs text-accent hover:underline disabled:opacity-40"
        >
          {restoring ? "\u2026" : "Restore"}
        </button>
      </div>
    </button>
  );
}

// ─── Claim Sheet ──────────────────────────────────────────────────────────────

function ClaimSheet({ claim, onClose, onUpdate, onDelete }: {
  claim: Claim;
  onClose: () => void;
  onUpdate: (p: Partial<Claim>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(claim.content);
  const [saving, setSaving] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const saveEdit = async () => {
    const t = editText.trim();
    if (!t || t === claim.content) { setEditing(false); return; }
    setSaving(true);
    if (supabase) {
      try {
        await supabase.rpc("memact_edit_contribution", { contribution_id_input: claim.id, text_input: t });
        onUpdate({ content: t });
      } catch (e) { console.error(e); }
    }
    setSaving(false);
    setEditing(false);
  };

  const deleteClaim = async () => {
    if (!confirm("Delete this claim permanently?")) return;
    if (supabase) {
      try {
        await supabase.rpc("memact_delete_contribution", { contribution_id_input: claim.id });
        onDelete();
      } catch (e) { console.error(e); }
    }
    onClose();
  };

  const archiveClaim = async () => {
    if (supabase) {
      try {
        await (supabase as any).from("memact_contributions").update({ status: "archived" }).eq("id", claim.id);
        onUpdate({ status: "archived" });
      } catch (e) { console.error(e); }
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm" />
      <div
        ref={sheetRef}
        className="fixed z-50 bg-card border border-border overflow-y-auto
          bottom-0 left-0 right-0 rounded-t-2xl p-6 max-h-[85vh]
          md:bottom-auto md:top-0 md:left-auto md:right-0 md:w-80 md:h-full md:rounded-none md:rounded-l-2xl"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5 md:hidden" />

        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0 pr-2">
            {editing ? (
              <textarea
                autoFocus
                value={editText}
                onChange={e => setEditText(e.target.value)}
                rows={3}
                className="w-full text-sm font-medium text-foreground bg-input-background rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent"
              />
            ) : (
              <p className="text-sm font-semibold text-foreground leading-snug">{claim.content}</p>
            )}
          </div>
          <button onClick={onClose} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {[
            { label: "Suggested by", value: sourceLabel(claim) },
            { label: "Added",        value: formatTimeAgo(claim.created_at) },
            { label: "Status",       value: claim.status.charAt(0).toUpperCase() + claim.status.slice(1) },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="text-foreground font-medium">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-5 space-y-2">
          {editing ? (
            <>
              <button onClick={saveEdit} disabled={saving} className="w-full text-xs font-semibold bg-foreground text-background rounded-lg py-2.5 hover:opacity-80 disabled:opacity-40 transition-opacity">
                {saving ? "Saving\u2026" : "Save changes"}
              </button>
              <button onClick={() => { setEditing(false); setEditText(claim.content); }} className="w-full text-xs font-semibold text-muted-foreground rounded-lg py-2.5 hover:text-foreground transition-colors">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="w-full text-xs font-semibold bg-muted text-foreground rounded-lg py-2.5 hover:bg-secondary transition-colors">
                Edit
              </button>
              {claim.status !== "archived" && (
                <button onClick={archiveClaim} className="w-full text-xs font-semibold bg-muted text-muted-foreground rounded-lg py-2.5 hover:text-foreground transition-colors">
                  Archive
                </button>
              )}
              <button onClick={deleteClaim} className="w-full text-xs font-semibold text-destructive rounded-lg py-2.5 hover:bg-destructive/10 transition-colors">
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Add Claim ────────────────────────────────────────────────────────────────

function AddClaimInput({ onAdd }: { onAdd: (c: string) => Promise<void> }) {
  const [open, setOpen]   = useState(false);
  const [text, setText]   = useState("");
  const [busy, setBusy]   = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open && ref.current) ref.current.focus(); }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    await onAdd(text.trim());
    setText(""); setBusy(false); setOpen(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-0.5 py-1">
      <Plus size={13} /> Add
    </button>
  );

  return (
    <form onSubmit={submit} className="flex items-center gap-2 max-w-sm">
      <input
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="e.g. Vegetarian"
        className="flex-1 text-xs bg-input-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-muted-foreground"
      />
      <button type="submit" disabled={!text.trim() || busy} className="text-xs font-semibold bg-foreground text-background rounded-lg px-3 py-2 hover:opacity-80 disabled:opacity-40 transition-opacity">
        {busy ? "\u2026" : "Save"}
      </button>
      <button type="button" onClick={() => { setOpen(false); setText(""); }} className="text-muted-foreground hover:text-foreground">
        <X size={13} />
      </button>
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS: { id: FilterTab; label: string }[] = [
  { id: "approved", label: "Approved"    },
  { id: "pending",  label: "Pending"     },
  { id: "rejected", label: "Rejected"    },
  { id: "self",     label: "Added by you"},
  { id: "archived", label: "Archived"   },
];

export function AddressPage({ username, isDark, onToggleDark, onSignOut }: AddressPageProps) {
  const [claims, setClaims]     = useState<Claim[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [tab, setTab]           = useState<FilterTab>("approved");
  const [selected, setSelected] = useState<Claim | null>(null);

  useEffect(() => {
    (async () => {
      if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }
      const { data, error: err } = await (supabase as any)
        .from("memact_contributions")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) { setError(err.message); } else { setClaims(data as Claim[]); }
      setLoading(false);
    })();
  }, []);

  const visible = claims.filter(c => {
    if (tab === "approved") return c.status === "approved";
    if (tab === "pending")  return c.status === "pending";
    if (tab === "rejected") return c.status === "rejected";
    if (tab === "self")     return c.contributor_type === "user" && c.status === "approved";
    if (tab === "archived") return c.status === "archived";
    return false;
  });

  const pendingCount = claims.filter(c => c.status === "pending").length;

  const approve = async (id: string) => {
    if (!supabase) return;
    await supabase.rpc("memact_approve_contribution", { contribution_id_input: id });
    setClaims(p => p.map(c => c.id === id ? { ...c, status: "approved" } : c));
  };

  const reject = async (id: string) => {
    if (!supabase) return;
    await supabase.rpc("memact_reject_contribution", { contribution_id_input: id });
    setClaims(p => p.map(c => c.id === id ? { ...c, status: "rejected" } : c));
  };

  const restore = async (id: string) => {
    if (!supabase) return;
    await (supabase as any).from("memact_contributions").update({ status: "approved" }).eq("id", id);
    setClaims(p => p.map(c => c.id === id ? { ...c, status: "approved" } : c));
  };

  const addSelf = async (content: string) => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await (supabase as any)
      .from("memact_contributions")
      .insert({ user_id: session.user.id, content, contributor_type: "user", contributor_name: "You", status: "approved", visibility: "private", is_starred: false })
      .select().single();
    if (data) setClaims(p => [data as Claim, ...p]);
  };

  const patch = (id: string, p: Partial<Claim>) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, ...p } : c));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...p } : prev);
  };

  const remove = (id: string) => {
    setClaims(p => p.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const EMPTY: Record<FilterTab, string> = {
    approved: "Nothing here yet. Add something.",
    pending:  "No pending suggestions.",
    rejected: "Nothing dismissed.",
    self:     "Nothing added by you yet.",
    archived: "Nothing archived.",
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-[60px] flex items-center justify-between gap-4">
          <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[42px] md:h-[50px] w-auto -ml-1 md:ml-0" />
          <div className="flex items-center gap-3">
            <button onClick={onToggleDark} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle theme">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={onSignOut} className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Address heading */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8 pb-4">
        <p className="text-2xl font-semibold tracking-tight">
          {username}<span className="text-muted-foreground">.memact.com</span>
        </p>
      </div>

      {/* Filter tabs */}
      <div className="sticky top-[60px] z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="flex items-center overflow-x-auto scrollbar-none h-11">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 text-xs font-semibold px-3 h-full border-b-2 whitespace-nowrap transition-all ${
                  tab === t.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {t.id === "pending" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-accent/15 border border-accent/25 text-accent text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">

        {(tab === "approved" || tab === "self") && !loading && !error && (
          <div className="mb-5"><AddClaimInput onAdd={addSelf} /></div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                <div className="h-3.5 bg-muted rounded w-2/3 mb-3" />
                <div className="h-2.5 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-sm text-muted-foreground">
            <p className="mb-3">{error}</p>
            <button onClick={() => window.location.reload()} className="text-xs font-semibold text-foreground underline">Retry</button>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <p className="text-center py-20 text-sm text-muted-foreground">{EMPTY[tab]}</p>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className={`grid gap-3 ${tab === "pending" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {visible.map(c => {
              if (tab === "pending")  return <PendingCard  key={c.id} claim={c} onApprove={() => approve(c.id)} onReject={() => reject(c.id)} />;
              if (tab === "archived") return <ArchivedCard key={c.id} claim={c} onRestore={() => restore(c.id)} onClick={() => setSelected(c)} />;
              if (tab === "rejected") return <RejectedCard key={c.id} claim={c} onClick={() => setSelected(c)} />;
              return <ApprovedCard key={c.id} claim={c} onClick={() => setSelected(c)} />;
            })}
          </div>
        )}
      </main>

      {selected && (
        <ClaimSheet
          claim={selected}
          onClose={() => setSelected(null)}
          onUpdate={p => patch(selected.id, p)}
          onDelete={() => remove(selected.id)}
        />
      )}
    </div>
  );
}
