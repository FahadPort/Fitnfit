import { useState, useEffect, useMemo } from 'react';
import { articles as initialArticles } from './data/articles';
import { Article } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleCard from './components/ArticleCard';
import ArticleDetail from './components/ArticleDetail';
import Newsletter from './components/Newsletter';
import AIChatDrawer from './components/AIChatDrawer';
import AdminPanel from './components/AdminPanel';
import { Sparkles, Compass, BookOpen, Clock, Heart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Theme state: dark or light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('eloquence_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('eloquence_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Dynamic Full-Stack States
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [categories, setCategories] = useState<string[]>(['Wellness', 'Fashion', 'Travel', 'Culture', 'Lifestyle']);
  const [settings, setSettings] = useState({
    logoText: 'ÉLOQUENCE',
    logoSubtext: "Journal d'un esprit calme",
    siteTitle: "ÉLOQUENCE — Journal d'un esprit calme",
    logoUrl: ''
  });

  // Fetch articles from full-stack endpoint
  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Failed to load articles from API', err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  // Fetch site branding settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.siteTitle) {
          document.title = data.siteTitle;
        }
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  // Run initial full-stack sync
  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchSettings();
  }, []);

  // URL routing state and synchronization for /admin
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path === '/admin') {
        setIsAdminOpen(true);
        setActiveArticleId(null);
      } else {
        setIsAdminOpen(false);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    // Trigger on mount
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    if (path === '/admin') {
      setIsAdminOpen(true);
      setActiveArticleId(null);
    } else {
      setIsAdminOpen(false);
    }
  };

  // Initialize bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('eloquence_bookmarks');
      if (stored) {
        setSavedArticleIds(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to read bookmarks', err);
    }
  }, []);

  // Update bookmarks and sync with localStorage
  const handleToggleBookmark = (id: string) => {
    let updated: string[];
    if (savedArticleIds.includes(id)) {
      updated = savedArticleIds.filter(item => item !== id);
    } else {
      updated = [...savedArticleIds, id];
    }
    setSavedArticleIds(updated);
    try {
      localStorage.setItem('eloquence_bookmarks', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save bookmarks', err);
    }
  };

  // Resolve saved articles array
  const savedArticles = useMemo(() => {
    return articles.filter(a => savedArticleIds.includes(a.id));
  }, [savedArticleIds, articles]);

  // Handle viewing specific article
  const handleArticleClick = (id: string) => {
    setActiveArticleId(id);
    navigateTo('/');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find the current active article if reading
  const activeArticle = useMemo(() => {
    if (!activeArticleId) return null;
    return articles.find(a => a.id === activeArticleId) || null;
  }, [activeArticleId, articles]);

  // Resolve related articles for reader view
  const relatedArticles = useMemo(() => {
    if (!activeArticle) return [];
    return articles.filter(a => a.category === activeArticle.category && a.id !== activeArticle.id);
  }, [activeArticle, articles]);

  // Compute filtered articles for catalog grids
  const filteredArticles = useMemo(() => {
    let result = articles;
    
    // Filter by active category
    if (activeCategory !== 'All') {
      result = result.filter(a => a.category === activeCategory);
    }
    
    // Filter by text query if present
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.summary.toLowerCase().includes(query) || 
        a.category.toLowerCase().includes(query) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [activeCategory, searchQuery, articles]);

  // Layout components matching user's home page design dynamically and safely
  const featuredArticle = useMemo(() => {
    return articles.find((a) => a.featured) || articles[0];
  }, [articles]);

  const fashionArticle = useMemo(() => {
    return articles.find((a) => a.category === 'Fashion' && !a.featured) || articles[1];
  }, [articles]);

  const trendingArticles = useMemo(() => {
    const trending = articles.filter((a) => a.trending);
    return trending.length > 0 ? trending.slice(0, 4) : articles.slice(2, 6);
  }, [articles]);

  const culturalEditArticles = useMemo(() => {
    const edit = articles.filter((a) => a.category === 'Travel' || a.category === 'Fashion' || a.category === 'Culture');
    return edit.length > 0 ? edit.slice(0, 2) : articles.slice(6, 8);
  }, [articles]);

  const mustReadArticles = useMemo(() => {
    const must = articles.filter((a) => a.category === 'Lifestyle' || a.category === 'Wellness');
    return must.length > 0 ? must.slice(0, 3) : articles.slice(8, 11);
  }, [articles]);

  const visionaryArticles = useMemo(() => {
    const vis = articles.filter((a) => a.category === 'Culture' || a.category === 'Wellness');
    return vis.length > 0 ? vis : articles;
  }, [articles]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-accent/20 selection:text-accent relative overflow-x-hidden flex flex-col justify-between transition-colors duration-300">
      {/* Primary Top Header */}
      <Header
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        savedArticles={savedArticles}
        onArticleClick={handleArticleClick}
        onBackToHome={() => {
          setActiveArticleId(null);
          navigateTo('/');
        }}
        isReadingArticle={activeArticleId !== null}
        categories={categories}
        isAdminOpen={isAdminOpen}
        onToggleAdmin={() => {
          if (isAdminOpen) {
            navigateTo('/');
          } else {
            navigateTo('/admin');
          }
          setActiveCategory('All');
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        settings={settings}
      />

      {/* Main Container */}
      <div className="grow">
        <AnimatePresence mode="wait">
          {isAdminOpen ? (
            /* Immersive Admin Studio Panel */
            <motion.div
              key="admin-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AdminPanel
                onClose={() => navigateTo('/')}
                articles={articles}
                categories={categories}
                settings={settings}
                onRefreshArticles={fetchArticles}
                onRefreshCategories={fetchCategories}
                onRefreshSettings={fetchSettings}
              />
            </motion.div>
          ) : activeArticle ? (
            /* Immersive Reader Detail View */
            <motion.div
              key={`article-${activeArticle.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ArticleDetail
                article={activeArticle}
                relatedArticles={relatedArticles}
                onBack={() => setActiveArticleId(null)}
                onArticleClick={handleArticleClick}
                isBookmarked={savedArticleIds.includes(activeArticle.id)}
                onToggleBookmark={handleToggleBookmark}
                onOpenAssistant={() => setIsAssistantOpen(true)}
              />
            </motion.div>
          ) : activeCategory !== 'All' || searchQuery !== '' ? (
            /* Dynamic Category / Search Filter View */
            <motion.main
              key={`catalog-${activeCategory}-${searchQuery}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pt-[140px] pb-24 px-6 md:px-12 max-w-[1368px] mx-auto min-h-[60vh]"
            >
              <div className="border-b border-theme-border pb-8 mb-12 flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  {searchQuery ? 'Search results' : 'Department Catalog'}
                </span>
                <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-theme-text uppercase">
                  {searchQuery ? `Results for: "${searchQuery}"` : activeCategory}
                </h2>
                <p className="text-xs text-theme-text-sub font-mono tracking-wider mt-1">
                  Showing {filteredArticles.length} dynamic entries
                </p>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="py-20 text-center max-w-md mx-auto flex flex-col items-center gap-4">
                  <BookOpen className="w-8 h-8 text-white/20" />
                  <h4 className="font-serif text-lg text-white uppercase font-bold">No Entries Found</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    We could not locate any essays matching your parameters. Try browsing other departments or clearing your query.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('All');
                      setSearchQuery('');
                    }}
                    className="mt-2 text-xs font-mono uppercase tracking-widest bg-white text-black font-bold px-5 py-3 hover:bg-accent hover:text-white transition-all duration-300"
                  >
                    Reset Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="featured"
                      onClick={handleArticleClick}
                    />
                  ))}
                </div>
              )}
            </motion.main>
          ) : (
            /* Standard Premium Home Page matching custom code layout */
            <motion.main
              key="homepage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-[140px] pb-24 px-6 md:px-12 max-w-[1368px] mx-auto"
            >
              {/* Section 1: Featured Editorial Hero */}
              <section className="mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                  <div className="lg:col-span-8">
                    {featuredArticle && (
                      <ArticleCard
                        article={featuredArticle}
                        variant="hero"
                        onClick={handleArticleClick}
                      />
                    )}
                  </div>
                  <aside className="lg:col-span-4 flex flex-col gap-8 justify-between">
                    {fashionArticle && (
                      <ArticleCard
                        article={fashionArticle}
                        variant="compact"
                        onClick={handleArticleClick}
                      />
                    )}
                    <Newsletter variant="inline" />
                  </aside>
                </div>
              </section>

              {/* Section 2: Trending Now */}
              <section className="mb-24">
                <div className="flex justify-between items-end mb-8 border-b border-theme-border pb-5">
                  <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-theme-text uppercase">
                    Trending Now
                  </h2>
                  <button
                    onClick={() => {
                      setActiveCategory('Fashion');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="font-mono text-[9px] uppercase tracking-widest text-theme-text-muted border-b border-theme-border hover:text-accent hover:border-accent pb-0.5 transition-all"
                  >
                    Latest Updates
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {trendingArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="compact"
                      onClick={handleArticleClick}
                    />
                  ))}
                </div>
              </section>

              {/* Section 3: Imaginative Articles (High Impact Full-Width Backdrop) */}
              <section className="mb-24 -mx-6 md:-mx-12 bg-black py-20 px-6 md:px-12 overflow-hidden relative border-t border-b border-white/10">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent" />
                <div className="max-w-[1200px] mx-auto relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-5 pr-0 lg:pr-12">
                      <span className="font-mono text-[10px] text-accent tracking-[0.3em] mb-4 block uppercase font-medium">
                        Imaginative Series
                      </span>
                      <h2 className="font-sans text-5xl md:text-[76px] leading-[0.85] font-black uppercase tracking-tighter mb-8 text-white">
                        CHRONICLES<br/>OF THE<br/><span className="italic text-white/30">FUTURE SELF</span>
                      </h2>
                      <p className="font-sans text-white/60 text-sm md:text-base mb-10 leading-relaxed">
                        A deep dive into the fusion of biological elegance and digital precision. Explore how
                        we define humanity in the age of algorithmic refinement and mechanical grace.
                      </p>
                      <button
                        onClick={() => handleArticleClick('24')}
                        className="px-8 py-3 bg-white text-black text-[12px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all cursor-pointer rounded-none"
                      >
                        Read the Dossier
                      </button>
                    </div>
                    <div className="lg:col-span-7">
                      <div 
                        onClick={() => handleArticleClick('24')}
                        className="relative h-[320px] md:h-[500px] group overflow-hidden bg-neutral-950 cursor-pointer border border-white/10"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
                          alt="Futuristic vision"
                          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-[2000ms] group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Must Read */}
              <section className="mb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8">
                    <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-theme-text uppercase mb-8 pb-5 border-b border-theme-border">
                      The Cultural Edit
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {culturalEditArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          variant="featured"
                          onClick={handleArticleClick}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Must Read Panel */}
                  <div className="lg:col-span-4 bg-theme-card p-6 md:p-8 flex flex-col justify-between border border-theme-border">
                    <div>
                      <h2 className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent font-semibold mb-6 border-b border-theme-border pb-3">
                        Must Read
                      </h2>
                      <div className="flex flex-col gap-6">
                        {mustReadArticles.slice(0, 1).map((article) => (
                          <div 
                            key={article.id} 
                            onClick={() => handleArticleClick(article.id)}
                            className="group cursor-pointer"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden mb-4 bg-theme-card">
                              <img
                                src={article.image}
                                alt={article.title}
                                className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-700"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-4 left-4 bg-black text-white text-[8px] px-2.5 py-1 font-mono tracking-widest uppercase border border-white/10 z-10">
                                {article.category}
                              </div>
                            </div>
                            <h4 className="font-serif text-lg leading-snug text-theme-text group-hover:text-accent transition-colors line-clamp-2">
                              {article.title}
                            </h4>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 mt-6 border-t border-theme-border pt-6">
                      {mustReadArticles.slice(1).map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          variant="horizontal"
                          onClick={handleArticleClick}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5: Visionary Discourse (Bento Style) */}
              <section className="mb-24">
                <div className="mb-8">
                  <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-theme-text uppercase">
                    Visionary Discourse
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[220px] md:auto-rows-[340px]">
                  {/* Cover Story - Large */}
                  <div
                    onClick={() => handleArticleClick(visionaryArticles[2]?.id || '24')}
                    className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-neutral-950 cursor-pointer border border-white/10"
                  >
                    <img
                      src={visionaryArticles[2]?.image || articles[23].image}
                      alt={visionaryArticles[2]?.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-all duration-[1200ms] group-hover:scale-103"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white flex flex-col items-start gap-2 z-10">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-accent font-semibold">
                        Cover Story
                      </span>
                      <h3 className="font-serif text-2xl md:text-4xl leading-tight uppercase mb-2 tracking-tight">
                        Digital<br />Humanism
                      </h3>
                      <p className="text-neutral-300 text-xs max-w-xs mb-4 opacity-85 leading-relaxed font-light hidden sm:block">
                        Can we maintain our core identity in an increasingly algorithmic reality? Exploring somatic software.
                      </p>
                      <span className="font-mono text-[9px] uppercase tracking-widest border-b border-accent pb-0.5 text-accent group-hover:text-white group-hover:border-white transition-all">
                        Read Full Essay
                      </span>
                    </div>
                  </div>

                  {/* Gastronomy */}
                  <div
                    onClick={() => handleArticleClick('20')}
                    className="md:col-span-2 relative group overflow-hidden bg-neutral-950 cursor-pointer border border-white/10"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                      alt="Gastronomy"
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-all duration-[1000ms]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end text-white z-10">
                      <span className="font-mono text-[9px] uppercase text-accent tracking-widest mb-1">
                        Gastronomy
                      </span>
                      <h4 className="font-serif text-xl tracking-tight font-medium uppercase">The Ritual of One</h4>
                    </div>
                  </div>

                  {/* Video Card */}
                  <div
                    onClick={() => handleArticleClick('16')}
                    className="relative group overflow-hidden bg-neutral-900 cursor-pointer border border-white/10"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80"
                      alt="Watch"
                      className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-60 transition-all duration-[1000ms]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-40 group-hover:opacity-0 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-black shadow-lg transition-transform group-hover:scale-110">
                        <div className="w-0 h-0 border-l-[15px] border-l-black border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Editor's Choice */}
                  <div className="bg-white text-black p-6 md:p-8 flex flex-col justify-between border border-theme-border rounded-none shadow-xs">
                    <Sparkles className="w-8 h-8 text-accent animate-pulse fill-accent" />
                    <div>
                      <h4 className="font-sans text-sm font-black uppercase mb-2 tracking-tighter text-black">
                        Editor's Choice
                      </h4>
                      <p className="text-[10px] text-black/70 font-mono tracking-wider leading-relaxed">
                        A curation of our month's most profound insights and cognitive sanctuaries.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6: Newsletter full-width */}
              <section className="mb-20">
                <Newsletter variant="compact" />
              </section>
            </motion.main>
          )}
        </AnimatePresence>
      </div>

      {/* Floating global AURA AI Assistant button */}
      {activeArticle && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-accent text-white h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-colors cursor-pointer group"
          title="Talk to AURA AI"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </motion.button>
      )}

      {/* Floating Drawer: AURA AI Literary Companion */}
      <AIChatDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        article={activeArticle}
      />

      {/* Common Footer */}
      <Footer 
        setActiveCategory={setActiveCategory} 
        onBackToHome={() => setActiveArticleId(null)}
      />
    </div>
  );
}
