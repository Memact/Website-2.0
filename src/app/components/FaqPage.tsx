import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, BookOpen, Shield, Cpu, UserCheck } from 'lucide-react';
import textLogoLight from '../../imports/text_logo_nobg_light.png';
import textLogoDark  from '../../imports/text_logo_nobg_dark.png';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  steps?: string[];
}

interface FAQCategory {
  id: string;
  title: string;
  icon: typeof BookOpen;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    id: 'general',
    title: 'Getting Started',
    icon: BookOpen,
    items: [
      {
        id: 'what-is-memact',
        question: 'What is Memact?',
        answer: 'Memact gives you one clean place to store what you want AI assistants and people to know about you. Instead of retelling your background, preferences, or goals every time you start a new conversation or sign up for a new tool, they can reference your personal Memact link to understand you instantly.'
      },
      {
        id: 'what-is-address',
        question: 'What is a you.memact.me link?',
        answer: 'It is a secure, readable link representing your digital profile. Think of it like a smart business card or personal landing page that you control. You can customize what stays private, what is visible to friends, and what is open to anyone.'
      }
    ]
  },
  {
    id: 'usage',
    title: 'How to Use',
    icon: Cpu,
    items: [
      {
        id: 'how-to-use-link',
        question: 'How do I use my link?',
        answer: 'You can copy your link (like alex.memact.me) and paste it into any AI agent (like ChatGPT, Claude, or Cursor). Simply tell the agent: "Here is my background: alex.memact.me". The agent reads your approved profile entries and adapts its responses to you instantly.'
      },
      {
        id: 'how-to-share',
        question: 'How do I share it with others?',
        answer: 'You can send your link to friends, family, or collaborators. They can view your public entries or, if you authorize them as friends, see your "Friends Only" updates.'
      }
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy & Control',
    icon: Shield,
    items: [
      {
        id: 'who-sees-notes',
        question: 'Who can see my profile entries?',
        answer: 'You have full control over the visibility of every single entry in your notebook:',
        steps: [
          'Public: Visible to anyone who visits your link, and readable by public AI agents.',
          'Friends: Visible only to connections who sign in with their own Memact link.',
          'Private: Visible only to you when logged in. AI agents and other users can never read these.'
        ]
      },
      {
        id: 'how-to-edit',
        question: 'Can apps or AI agents change my profile without permission?',
        answer: 'Never. If an app or AI agent notices a new preference (e.g. you pushed open source code or listened to a specific song), it can only send a "Suggestion" to your inbox. It will not appear on your profile until you manually approve it.'
      },
      {
        id: 'delete-data',
        question: 'Can I edit or delete my data?',
        answer: 'Yes. You can edit the text, toggle visibility (e.g., from Public to Private), or delete any entry in your notebook at any time. When you delete an entry, it is permanently erased from our system.'
      }
    ]
  }
];

interface FaqPageProps {
  onBack: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function FaqPage({ onBack, isDark, onToggleDark }: FaqPageProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filter items based on category and search query
  const filteredCategories = FAQ_DATA.map(category => {
    if (activeCategory !== 'all' && category.id !== activeCategory) {
      return { ...category, items: [] };
    }

    const matchedItems = category.items.filter(item =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
    );

    return { ...category, items: matchedItems };
  }).filter(c => c.items.length > 0);

  const isEmpty = filteredCategories.length === 0;

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col justify-between"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-8 h-[60px] bg-background/90 backdrop-blur-sm border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[18px] w-auto" />
        <div className="w-[60px]" />
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">How can we help?</h1>
          <p className="text-sm text-muted-foreground">Clear documentation and answers on how Memact governs your digital memory.</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-10">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or topics..."
            className="w-full bg-secondary border border-border focus:border-foreground/45 transition-colors pl-11 pr-4 py-3 text-sm rounded-sm outline-none text-foreground placeholder:text-muted-foreground/35 font-medium"
          />
        </div>

        {/* Layout split */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="space-y-1 md:col-span-1 border-r border-border/50 pr-4">
            <button
              onClick={() => setActiveCategory('all')}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-sm transition-colors ${
                activeCategory === 'all' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Topics
            </button>
            {FAQ_DATA.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-sm transition-colors flex items-center gap-2 ${
                  activeCategory === c.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <c.icon size={12} className="shrink-0" />
                {c.title}
              </button>
            ))}
          </aside>

          {/* Right Content */}
          <section className="md:col-span-3 space-y-8">
            {isEmpty ? (
              <div className="py-12 text-center border border-dashed border-border rounded-sm">
                <p className="text-sm text-muted-foreground">No questions found matching your search.</p>
              </div>
            ) : (
              filteredCategories.map(category => (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                    <category.icon size={14} className="text-muted-foreground/60" />
                    <h2 className="text-xs font-semibold text-muted-foreground">{category.title}</h2>
                  </div>
                  
                  <div className="space-y-2">
                    {category.items.map(item => {
                      const isExpanded = expandedItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className="bg-card/30 border border-border/80 rounded-sm overflow-hidden transition-colors hover:bg-card/50"
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-full flex items-center justify-between p-4 text-left font-medium text-sm text-foreground select-none"
                          >
                            <span>{item.question}</span>
                            {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                          </button>

                          {isExpanded && (
                            <div className="p-4 pt-0 border-t border-border/40 text-xs text-muted-foreground leading-relaxed space-y-2.5">
                              <p>{item.answer}</p>
                              {item.steps && (
                                <ol className="list-decimal pl-4 space-y-1 font-medium">
                                  {item.steps.map((s, idx) => (
                                    <li key={idx} className="pl-0.5">{s}</li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border flex items-center justify-between shrink-0">
        <span className="text-[10px] text-muted-foreground/50">Need direct support? Contact dev@memact.me</span>
        <span className="text-[10px] text-muted-foreground/50">© {new Date().getFullYear()} Memact</span>
      </footer>
    </div>
  );
}
