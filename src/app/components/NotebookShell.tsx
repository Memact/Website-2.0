import { useState } from 'react';
import {
  BookOpen, Sparkles, Target, Zap, FileText, Link2, Sliders,
  Plus, Check, X, Globe, Lock, Copy, ArrowUpRight, Moon, Sun,
  Github, Figma, Cpu, User,
} from 'lucide-react';
import textLogoLight from '../../imports/text_logo_nobg_light.png';
import textLogoDark  from '../../imports/text_logo_nobg_dark.png';

// ─── Types ───────────────────────────────────────────────────────────────────

type View      = 'notebook' | 'suggestions' | 'connections' | 'share';
type SectionId = 'projects' | 'interests' | 'goals' | 'skills' | 'notes' | 'links' | 'preferences';

// ─── Data ────────────────────────────────────────────────────────────────────

const SECTIONS: { id: SectionId; label: string; icon: typeof BookOpen; count: number }[] = [
  { id: 'projects',    label: 'Projects',    icon: BookOpen,  count: 4  },
  { id: 'interests',   label: 'Interests',   icon: Sparkles,  count: 8  },
  { id: 'goals',       label: 'Goals',       icon: Target,    count: 3  },
  { id: 'skills',      label: 'Skills',      icon: Zap,       count: 12 },
  { id: 'notes',       label: 'Notes',       icon: FileText,  count: 7  },
  { id: 'links',       label: 'Links',       icon: Link2,     count: 15 },
  { id: 'preferences', label: 'Preferences', icon: Sliders,   count: 6  },
];

const VIEWS: { id: View; label: string }[] = [
  { id: 'notebook',    label: 'Notebook'     },
  { id: 'suggestions', label: 'Suggestions'  },
  { id: 'connections', label: 'Connections'  },
  { id: 'share',       label: 'Share'        },
];

const PROJECTS = [
  { id: 1, title: 'Rethinking async communication at work', desc: 'Research phase. Interviews, reading, pattern mapping.', status: 'active',    started: '3 months ago', tags: ['you', 'Linear', 'Claude'] },
  { id: 2, title: 'Home studio setup',                      desc: 'Spare room conversion. Acoustics, monitors, light.',  status: 'ongoing',   started: '1 year ago',   tags: ['you'] },
  { id: 3, title: 'Writing about cities',                   desc: 'Long-form. Tokyo first. No deadline.',                status: 'slow burn', started: '8 months ago', tags: ['you', 'Claude'] },
  { id: 4, title: 'Learning to sail',                       desc: 'Sunday course. Comfortable on a 30-footer by August.',status: 'seasonal',  started: '2 months ago', tags: ['you'] },
];

const INTERESTS = ['Typography', 'Specialty coffee', 'Architecture', 'Film photography', 'Trail running', 'Jazz', 'Japanese design', 'Urban planning'];

const GOALS = [
  { id: 1, text: 'Ship Memact beta to 500 users',    context: 'Professional · this quarter', tags: ['you', 'Linear'] },
  { id: 2, text: 'Run the Golden Gate trail',         context: 'Personal · July',             tags: ['you'] },
  { id: 3, text: 'Finish the essay about Tokyo',      context: 'Writing · ongoing',           tags: ['you', 'Claude'] },
];

const SKILLS = [
  { name: 'Product design', level: 'expert',     from: 'you'    },
  { name: 'Figma',          level: 'expert',     from: 'Figma'  },
  { name: 'React',          level: 'proficient', from: 'GitHub' },
  { name: 'TypeScript',     level: 'proficient', from: 'GitHub' },
  { name: 'Writing',        level: 'proficient', from: 'you'    },
  { name: 'Photography',    level: 'learning',   from: 'you'    },
  { name: 'User research',  level: 'proficient', from: 'you'    },
  { name: 'Prototyping',    level: 'expert',     from: 'you'    },
  { name: 'CSS',            level: 'proficient', from: 'GitHub' },
  { name: 'Copywriting',    level: 'learning',   from: 'you'    },
  { name: 'Portuguese',     level: 'learning',   from: 'you'    },
  { name: 'Coffee brewing', level: 'proficient', from: 'you'    },
];

const NOTES = [
  { id: 1, text: 'The notebook is the interface.',                                                    date: 'Today',      from: 'you'    },
  { id: 2, text: 'Cafe on 5th. Perfect light, quiet until 11am, excellent espresso.',                 date: 'Today',      from: 'you'    },
  { id: 3, text: 'Spatial audio changes how people focus. Worth exploring for the async essay.',       date: 'Yesterday',  from: 'Claude' },
  { id: 4, text: 'The best interfaces disappear.',                                                    date: '3 days ago', from: 'you'    },
  { id: 5, text: 'Re-read The Design of Everyday Things. Hits differently now.',                      date: '3 days ago', from: 'you'    },
  { id: 6, text: 'Async meetings reduce interruptions by ~40%. Deep Work, chapter 4.',                date: '1 week ago', from: 'Claude' },
  { id: 7, text: 'Sleep 8 hours for 2 weeks. Note the difference.',                                   date: '2 weeks ago',from: 'you'    },
];

const LINKS = [
  { id: 1, title: 'Figma portfolio',           url: 'figma.com/@alexchen',        tags: ['work', 'design']    },
  { id: 2, title: 'GitHub profile',            url: 'github.com/alexchen',        tags: ['work', 'code']      },
  { id: 3, title: 'Personal website',          url: 'alexchen.me',                tags: ['personal']          },
  { id: 4, title: 'Newsletter',                url: 'alexchen.substack.com',      tags: ['writing']           },
  { id: 5, title: 'Are.na — Quiet UX',         url: 'are.na/alex/quiet-ux',       tags: ['design', 'research']},
];

const PREFERENCES = [
  { id: 1, text: 'Best before 10am.',                                   from: 'you'    },
  { id: 2, text: 'Written communication over calls.',                   from: 'you'    },
  { id: 3, text: 'Context before solutions.',                           from: 'Claude' },
  { id: 4, text: 'Visual thinker. Show, don\'t tell.',                  from: 'you'    },
  { id: 5, text: 'Learn by doing.',                                     from: 'Claude' },
  { id: 6, text: 'Coffee, not tea.',                                    from: 'you'    },
];

const SUGGESTIONS_DATA = [
  { id: 1, from: 'Claude',   color: '#7C6FAE', text: 'Add "Systems thinking" to Skills',            reason: 'Based on how you frame and discuss problems.',        to: 'Skills'      },
  { id: 2, from: 'GitHub',   color: '#4A7C94', text: 'Add "Open source contributor" to Projects',   reason: 'You have contributed to 12 open source repos this year.', to: 'Projects' },
  { id: 3, from: 'Sofia M.', color: '#4255FF', text: 'Add "Rock climbing" to Interests',            reason: 'You mentioned it three times this week.',             to: 'Interests'   },
  { id: 4, from: 'Linear',   color: '#4B8B6F', text: 'Add project: Q3 roadmap planning',            reason: 'You have 14 issues assigned to this milestone.',       to: 'Projects'    },
  { id: 5, from: 'Claude',   color: '#7C6FAE', text: 'Add "I write to think" to Preferences',      reason: 'You reach clarity through writing, not before it.',    to: 'Preferences' },
];

const CONNECTIONS_DATA = [
  { icon: Github, name: 'GitHub',       type: 'app',      count: 8,  sections: 'Skills, Projects',         connected: '4 months ago', active: true  },
  { icon: Figma,  name: 'Figma',        type: 'app',      count: 3,  sections: 'Projects',                 connected: '4 months ago', active: true  },
  { icon: Cpu,    name: 'Claude',       type: 'AI agent', count: 14, sections: 'Notes, Preferences, Skills',connected: '2 months ago', active: true  },
  { icon: User,   name: 'Sofia M.',     type: 'friend',   count: 4,  sections: 'Interests, Notes',         connected: '1 month ago',  active: false },
];

const SHARE_SECTIONS: { id: SectionId; label: string; pub: boolean }[] = [
  { id: 'projects',    label: 'Projects',    pub: true  },
  { id: 'interests',   label: 'Interests',   pub: true  },
  { id: 'goals',       label: 'Goals',       pub: false },
  { id: 'skills',      label: 'Skills',      pub: true  },
  { id: 'notes',       label: 'Notes',       pub: false },
  { id: 'links',       label: 'Links',       pub: true  },
  { id: 'preferences', label: 'Preferences', pub: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
  you: '#6B6C8A', Linear: '#4B8B6F', Claude: '#7C6FAE',
  GitHub: '#4A7C94', Figma: '#4A7C94', 'Sofia M.': '#4255FF',
};

function Chip({ name }: { name: string }) {
  const c = TAG_COLORS[name] || '#6B6C8A';
  return (
    <span
      className="inline-flex text-[10px] px-1.5 py-0.5 rounded-sm font-semibold"
      style={{ backgroundColor: c + '1A', color: c }}
    >
      {name}
    </span>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-sm bg-secondary text-muted-foreground font-medium tabular-nums">
      {label}
    </span>
  );
}

// ─── Section views ────────────────────────────────────────────────────────────

function ProjectsView() {
  return (
    <div className="space-y-6">
      {PROJECTS.map((p) => (
        <div key={p.id} className="pb-6 border-b border-border">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground mb-1.5">{p.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{p.desc}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {p.tags.map((t) => <Chip key={t} name={t} />)}
                <span className="text-[10px] text-muted-foreground/40 ml-1">{p.started}</span>
              </div>
            </div>
            <StatusBadge label={p.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

function InterestsView() {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-7">Things that draw your attention right now.</p>
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((i) => (
          <span key={i} className="px-4 py-2 bg-secondary text-foreground text-sm rounded-sm hover:bg-muted transition-colors cursor-default font-medium">
            {i}
          </span>
        ))}
        <button className="px-4 py-2 border border-dashed border-border text-muted-foreground text-sm rounded-sm hover:border-foreground/30 transition-colors flex items-center gap-1.5">
          <Plus size={11} /> Add
        </button>
      </div>
    </div>
  );
}

function GoalsView() {
  const [done, setDone] = useState<number[]>([]);
  return (
    <div className="space-y-4">
      {GOALS.map((g) => (
        <div key={g.id} className="flex items-start gap-4 pb-4 border-b border-border">
          <button
            onClick={() => setDone((d) => d.includes(g.id) ? d.filter((x) => x !== g.id) : [...d, g.id])}
            className={`mt-0.5 w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
              done.includes(g.id) ? 'bg-foreground border-foreground' : 'border-border hover:border-foreground/40'
            }`}
          >
            {done.includes(g.id) && <Check size={11} className="text-background" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className={`text-sm mb-1 ${done.includes(g.id) ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
              {g.text}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">{g.context}</div>
          </div>
          <div className="flex gap-1 shrink-0">{g.tags.map((t) => <Chip key={t} name={t} />)}</div>
        </div>
      ))}
    </div>
  );
}

function SkillsView() {
  const levels = ['expert', 'proficient', 'learning'] as const;
  const opacity = { expert: 'text-foreground', proficient: 'text-foreground/70', learning: 'text-muted-foreground' };
  return (
    <div>
      {levels.map((lvl) => (
        <div key={lvl} className="mb-8">
          <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-4 font-medium">{lvl}</div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-0">
            {SKILLS.filter((s) => s.level === lvl).map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2.5 border-b border-border/50">
                <span className={`text-sm ${opacity[lvl]}`}>{s.name}</span>
                <Chip name={s.from} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NotesView() {
  return (
    <div className="space-y-px">
      {NOTES.map((n) => (
        <div key={n.id} className="group flex gap-5 py-4 border-b border-border hover:bg-card/60 px-2 -mx-2 transition-colors rounded-sm">
          <div className="shrink-0 pt-0.5"><Chip name={n.from} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-relaxed">{n.text}</p>
          </div>
          <div className="shrink-0 text-[10px] text-muted-foreground/40 pt-0.5 whitespace-nowrap tabular-nums">{n.date}</div>
        </div>
      ))}
    </div>
  );
}

function LinksView() {
  return (
    <div className="space-y-px">
      {LINKS.map((l) => (
        <div key={l.id} className="group flex items-center gap-4 py-3.5 border-b border-border hover:bg-card/60 px-2 -mx-2 transition-colors rounded-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-medium text-foreground">{l.title}</span>
              <ArrowUpRight size={11} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">{l.url}</div>
          </div>
          <div className="flex gap-1">
            {l.tags.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 bg-secondary rounded-sm text-muted-foreground font-medium">{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PreferencesView() {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-7">How you work and think best.</p>
      <div className="space-y-px">
        {PREFERENCES.map((p) => (
          <div key={p.id} className="flex items-start gap-4 py-4 border-b border-border">
            <Chip name={p.from} />
            <p className="text-sm text-foreground">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionContent({ section }: { section: SectionId }) {
  const map: Record<SectionId, React.ReactNode> = {
    projects:    <ProjectsView />,
    interests:   <InterestsView />,
    goals:       <GoalsView />,
    skills:      <SkillsView />,
    notes:       <NotesView />,
    links:       <LinksView />,
    preferences: <PreferencesView />,
  };
  return <>{map[section]}</>;
}

// ─── Suggestions view ─────────────────────────────────────────────────────────

function SuggestionsView() {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [accepted,  setAccepted]  = useState<number[]>([]);
  const visible = SUGGESTIONS_DATA.filter((s) => !dismissed.includes(s.id));

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold text-foreground mb-1">Suggestions</h2>
      <p className="text-xs text-muted-foreground mb-8">{visible.length} waiting for review</p>

      {visible.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">All caught up.</p>
        </div>
      )}

      <div className="space-y-3">
        {visible.map((s) => (
          <div
            key={s.id}
            className={`p-5 bg-card rounded-sm border-l-2 transition-opacity ${accepted.includes(s.id) ? 'opacity-50' : ''}`}
            style={{ borderLeftColor: s.color + '70' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] text-white font-bold"
                style={{ backgroundColor: s.color }}
              >
                {s.from.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold mb-1" style={{ color: s.color }}>{s.from}</div>
                <p className="text-sm font-medium text-foreground">{s.text}</p>
              </div>
              <StatusBadge label={s.to} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4 pl-9">{s.reason}</p>
            <div className="flex gap-2 pl-9">
              {accepted.includes(s.id) ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Check size={11} /> Added
                </span>
              ) : (
                <>
                  <button
                    onClick={() => setAccepted((a) => [...a, s.id])}
                    className="flex items-center gap-1.5 text-xs bg-foreground text-background px-4 py-2 hover:opacity-80 transition-opacity font-medium"
                  >
                    <Check size={11} /> Add
                  </button>
                  <button
                    onClick={() => setDismissed((d) => [...d, s.id])}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-4 py-2 hover:bg-secondary transition-colors"
                  >
                    <X size={11} /> Skip
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Connections view ─────────────────────────────────────────────────────────

function ConnectionsView() {
  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold text-foreground mb-1">Connections</h2>
      <p className="text-xs text-muted-foreground mb-8">Apps, friends, and agents who contribute to your notebook</p>

      <div className="space-y-px bg-border">
        {CONNECTIONS_DATA.map(({ icon: Icon, name, type, count, sections, connected, active }) => (
          <div key={name} className="bg-background flex items-center gap-5 px-5 py-4">
            <div className="w-9 h-9 bg-secondary rounded-sm flex items-center justify-center shrink-0">
              <Icon size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-foreground">{name}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />}
              </div>
              <div className="text-[10px] text-muted-foreground capitalize tabular-nums">
                {type} · connected {connected}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-foreground">{count}</div>
              <div className="text-[10px] text-muted-foreground">contributions</div>
              <div className="text-[10px] text-muted-foreground/50 mt-0.5">{sections}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-5 flex items-center gap-2 text-sm text-muted-foreground border border-dashed border-border px-5 py-3 hover:border-foreground/30 transition-colors w-full justify-center">
        <Plus size={13} /> Add a connection
      </button>
    </div>
  );
}

// ─── Share view ───────────────────────────────────────────────────────────────

function ShareView() {
  const [sections, setSections] = useState(SHARE_SECTIONS);
  const [copied,   setCopied]   = useState(false);

  const toggle = (id: SectionId) =>
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, pub: !s.pub } : s));

  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-semibold text-foreground mb-1">Share</h2>
      <p className="text-xs text-muted-foreground mb-8">Your notebook address</p>

      <div className="p-6 bg-card rounded-sm border border-border mb-7">
        <div className="text-[clamp(18px,3vw,26px)] font-semibold text-foreground mb-4 leading-none tracking-tight">
          <span className="text-muted-foreground">alex.</span>memact.me
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-xs bg-foreground text-background px-4 py-2 hover:opacity-80 transition-opacity font-medium"
          >
            <Copy size={11} />{copied ? 'Copied!' : 'Copy link'}
          </button>
          <button className="flex items-center gap-2 text-xs border border-border text-muted-foreground px-4 py-2 hover:bg-secondary transition-colors">
            <ArrowUpRight size={11} /> Open
          </button>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-4 font-medium">
        Visibility
      </div>
      <div className="space-y-px bg-border">
        {sections.map((s) => (
          <div key={s.id} className="bg-background px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-foreground font-medium">{s.label}</span>
            <button
              onClick={() => toggle(s.id)}
              className={`flex items-center gap-2 text-xs transition-colors ${s.pub ? 'text-accent' : 'text-muted-foreground'}`}
            >
              {s.pub
                ? <><Globe size={12} /><span className="font-medium">public</span></>
                : <><Lock  size={12} /><span>private</span></>
              }
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface NotebookShellProps {
  onBack: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function NotebookShell({ onBack, isDark, onToggleDark }: NotebookShellProps) {
  const [view,    setView]    = useState<View>('notebook');
  const [section, setSection] = useState<SectionId>('projects');

  const activeSection = SECTIONS.find((s) => s.id === section)!;
  const sectionIndex  = SECTIONS.findIndex((s) => s.id === section);

  return (
    <div
      className="flex h-screen bg-background text-foreground overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Sidebar */}
      <aside className="w-52 bg-card border-r border-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 pb-4 border-b border-border flex items-center gap-3">
          <button onClick={onBack} className="hover:opacity-70 transition-opacity">
            <img
              src={isDark ? textLogoDark : textLogoLight}
              alt="memact"
              className="h-[18px] w-auto"
            />
          </button>
        </div>

        {/* Section nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="text-[9px] text-muted-foreground tracking-widest uppercase px-2 mb-2 mt-1 font-semibold">
            Sections
          </div>
          {SECTIONS.map((s, i) => {
            const isActive = section === s.id && view === 'notebook';
            return (
              <button
                key={s.id}
                onClick={() => { setSection(s.id); setView('notebook'); }}
                className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-sm text-[13px] transition-colors mb-px ${
                  isActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <span className={`text-[10px] tabular-nums shrink-0 w-5 font-medium ${isActive ? 'opacity-50' : 'opacity-30'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-medium">{s.label}</span>
                <span className={`ml-auto text-[10px] tabular-nums font-medium ${isActive ? 'opacity-50' : 'opacity-25'}`}>
                  {s.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
            <span className="text-[11px] text-accent font-bold">AC</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">Alex Chen</div>
            <div className="text-[10px] text-muted-foreground truncate font-medium">alex.memact.me</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="border-b border-border px-7 flex items-center justify-between shrink-0 h-14">
          <div className="flex gap-1">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`px-3.5 py-2 text-[13px] rounded-sm transition-colors font-medium relative ${
                  view === v.id
                    ? 'text-foreground bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {v.label}
                {v.id === 'suggestions' && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-accent text-accent-foreground text-[9px] font-bold">
                    {SUGGESTIONS_DATA.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDark}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            {view === 'notebook' && (
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-sm hover:bg-secondary transition-colors font-medium">
                <Plus size={11} /> Add
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {view === 'notebook' && (
            <div className="px-9 py-8 max-w-2xl">
              <div className="flex items-start justify-between mb-7 pb-6 border-b border-border">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-0.5">{activeSection.label}</h1>
                  <p className="text-xs text-muted-foreground">{activeSection.count} entries</p>
                </div>
                <span className="text-[10px] text-muted-foreground/30 tabular-nums font-medium mt-1">
                  {String(sectionIndex + 1).padStart(2, '0')} / 07
                </span>
              </div>
              <SectionContent section={section} />
            </div>
          )}

          {view === 'suggestions' && <div className="px-9 py-8"><SuggestionsView /></div>}
          {view === 'connections' && <div className="px-9 py-8"><ConnectionsView /></div>}
          {view === 'share'       && <div className="px-9 py-8"><ShareView /></div>}
        </main>
      </div>
    </div>
  );
}
