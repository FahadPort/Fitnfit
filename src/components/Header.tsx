import { useState, useEffect } from 'react';
import { Search, Bookmark, Menu, X, ArrowLeft, Heart, User, LogOut, ShieldCheck } from 'lucide-react';
import { Article } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  savedArticles: Article[];
  onArticleClick: (id: string) => void;
  onBackToHome?: () => void;
  isReadingArticle: boolean;
  categories?: string[];
  isAdminOpen?: boolean;
  onToggleAdmin?: () => void;
  isAuthenticated: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onNavigateToStores?: () => void;
  currentPath?: string;
  settings?: {
    logoText: string;
    logoSubtext: string;
    siteTitle: string;
    logoUrl: string;
  };
}

export default function Header({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  savedArticles,
  onArticleClick,
  onBackToHome,
  isReadingArticle,
  categories: customCategories,
  isAdminOpen,
  onToggleAdmin,
  isAuthenticated,
  onOpenLogin,
  onLogout,
  onNavigateToStores,
  currentPath = '/',
  settings,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = customCategories || ['Wellness', 'Fashion', 'Travel', 'Culture', 'Lifestyle'];
  const displayCategories = categories.includes('All') ? categories : ['All', ...categories];

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setMobileMenuOpen(false);
    if (onBackToHome) onBackToHome();
  };

  return (
    <header 
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled 
          ? 'bg-theme-bg/95 backdrop-blur-md border-b border-theme-border shadow-xs py-3' 
          : 'bg-transparent py-5 md:py-8'
      }`}
    >
      <div className="max-w-[1368px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Left Section: Back button or Hamburger */}
        <div className="flex items-center gap-4 w-1/3">
          {isReadingArticle ? (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-theme-text hover:opacity-75 transition-all font-mono text-[10px] uppercase tracking-widest cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Magazine</span>
            </button>
          ) : (
            <>
              {/* Desktop Categories */}
              <nav className="hidden lg:flex items-center gap-5">
                {onNavigateToStores && (
                  <button
                    onClick={onNavigateToStores}
                    className={`font-mono text-[10px] uppercase tracking-widest transition-all relative py-1 cursor-pointer ${
                      currentPath === '/stores' || currentPath.startsWith('/store/')
                        ? 'text-accent font-bold' 
                        : 'text-theme-text hover:text-accent font-medium'
                    }`}
                  >
                    Stores & Coupons
                    {(currentPath === '/stores' || currentPath.startsWith('/store/')) && (
                      <motion.div 
                        layoutId="activeCategoryDot"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                )}

                {displayCategories.slice(0, 4).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`font-mono text-[10px] uppercase tracking-widest transition-all relative py-1 cursor-pointer ${
                      activeCategory === cat 
                        ? 'text-theme-text font-semibold' 
                        : 'text-theme-text-muted hover:text-theme-text'
                    }`}
                  >
                    {cat}
                    {activeCategory === cat && (
                      <motion.div 
                        layoutId="activeCategoryDot"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </nav>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1 text-theme-text hover:opacity-75 transition-opacity cursor-pointer"
                aria-label="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Center Section: App Branding Logo */}
        <div className="flex flex-col items-center justify-center w-1/3 text-center">
          <button 
            onClick={() => {
              handleCategorySelect('All');
              if (onBackToHome) onBackToHome();
            }}
            className="group outline-none flex flex-col items-center justify-center cursor-pointer"
          >
            {settings?.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings?.logoText || 'Éloquence'} 
                className="h-8 sm:h-10 md:h-12 object-contain select-none transition-all duration-300 group-hover:opacity-85"
                referrerPolicy="no-referrer"
              />
            ) : (
              <>
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-[34px] tracking-[0.25em] font-bold text-theme-text uppercase select-none transition-all duration-300 group-hover:text-accent">
                  {settings?.logoText || 'Éloquence'}
                </h1>
                <span className="hidden sm:block font-mono text-[8px] uppercase tracking-[0.4em] text-theme-text-muted mt-1.5 transition-colors group-hover:text-accent">
                  {settings?.logoSubtext || "Journal d'un esprit calme"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Section: Category remainder, search, bookmarks */}
        <div className="flex items-center justify-end gap-3 sm:gap-6 w-1/3">
          {/* Desktop rest of categories */}
          {!isReadingArticle && (
            <nav className="hidden lg:flex items-center gap-6 mr-4">
              {displayCategories.slice(4).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`font-mono text-[10px] uppercase tracking-widest transition-all relative py-1 cursor-pointer ${
                    activeCategory === cat 
                      ? 'text-theme-text font-semibold' 
                      : 'text-theme-text-muted hover:text-theme-text'
                  }`}
                >
                  {cat}
                  {activeCategory === cat && (
                    <motion.div 
                      layoutId="activeCategoryDot"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          )}

          {/* User Account / Admin Action */}
          <div className="relative">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setProfileMenuOpen(!profileMenuOpen);
                } else {
                  onOpenLogin();
                }
              }}
              className={`p-1.5 rounded-full transition-all hover:bg-theme-tertiary cursor-pointer flex items-center gap-1 ${
                isAuthenticated ? 'text-accent' : 'text-theme-text hover:text-accent'
              }`}
              title={isAuthenticated ? "Account Menu" : "Sign In / Join Studio"}
              aria-label="User Account"
            >
              <User className="w-[18px] h-[18px]" />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isAuthenticated && profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute right-0 mt-3 w-56 bg-theme-tertiary border border-theme-border shadow-xl p-4 z-50 rounded-none text-left"
                  >
                    <div className="border-b border-theme-border pb-3 mb-3">
                      <span className="font-mono text-[8px] uppercase tracking-wider text-accent block mb-0.5">
                        Authenticated
                      </span>
                      <span className="text-xs font-serif text-theme-text truncate block font-medium">
                        admin@eloquence.com
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {onToggleAdmin && (
                        <button
                          onClick={() => {
                            onToggleAdmin();
                            setProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-2 text-left text-xs font-mono uppercase tracking-widest text-theme-text hover:text-accent py-1.5 transition-colors cursor-pointer w-full"
                        >
                          <ShieldCheck className="w-4 h-4 text-accent" />
                          <span>{isAdminOpen ? 'Close Studio' : 'Admin Studio'}</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          onLogout();
                          setProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 text-left text-xs font-mono uppercase tracking-widest text-theme-text-muted hover:text-rose-500 py-1.5 transition-colors cursor-pointer w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Search trigger */}
          <div className="relative">
            <AnimatePresence>
              {searchOpen && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 180, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 origin-right flex items-center bg-theme-tertiary border border-theme-border pl-3 pr-8 py-1"
                >
                  <input
                    type="text"
                    placeholder="Search journal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs font-sans text-theme-text placeholder-theme-text-muted focus:outline-none bg-transparent"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-theme-text-muted hover:text-theme-text text-xs"
                    >
                      ×
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-1.5 rounded-full transition-all hover:bg-theme-tertiary cursor-pointer ${searchOpen ? 'text-accent' : 'text-theme-text'}`}
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Bookmarks Toggle with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setBookmarksOpen(!bookmarksOpen)}
              className={`p-1.5 rounded-full transition-all hover:bg-theme-tertiary cursor-pointer flex items-center gap-1 ${
                bookmarksOpen ? 'text-accent' : 'text-theme-text'
              }`}
              aria-label="Saved Articles"
            >
              <Bookmark className="w-4.5 h-4.5" />
              {savedArticles.length > 0 && (
                <span className="bg-theme-text text-theme-bg text-[8px] font-mono font-bold h-4 w-4 rounded-full flex items-center justify-center -mt-1 -ml-1.5">
                  {savedArticles.length}
                </span>
              )}
            </button>

            {/* Bookmarks Dropdown menu */}
            <AnimatePresence>
              {bookmarksOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div className="fixed inset-0 z-40" onClick={() => setBookmarksOpen(false)} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute right-0 mt-3 w-80 bg-theme-tertiary border border-theme-border shadow-xl p-4 z-50 rounded-none"
                  >
                    <div className="flex items-center justify-between border-b border-theme-border pb-3 mb-3">
                      <h4 className="font-serif text-sm font-semibold text-theme-text flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-accent fill-accent" />
                        Saved Readings ({savedArticles.length})
                      </h4>
                      <button 
                        onClick={() => setBookmarksOpen(false)}
                        className="text-xs font-mono uppercase tracking-widest text-theme-text-muted hover:text-theme-text cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    {savedArticles.length === 0 ? (
                      <div className="py-6 text-center text-xs text-theme-text-muted">
                        No articles saved. Click the bookmark icon in any article to save it for offline reading.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                        {savedArticles.map((article) => (
                          <div 
                            key={article.id}
                            onClick={() => {
                              onArticleClick(article.id);
                              setBookmarksOpen(false);
                            }}
                            className="flex gap-3 group cursor-pointer hover:bg-theme-card p-1.5 transition-all border border-transparent hover:border-theme-border"
                          >
                            <img 
                              src={article.image} 
                              alt={article.title} 
                              className="w-12 h-12 object-cover shrink-0 bg-theme-bg border border-theme-border"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[8px] font-mono uppercase tracking-wider text-accent">
                                {article.category}
                              </span>
                              <h5 className="text-xs font-serif font-medium text-theme-text group-hover:text-accent transition-colors line-clamp-2">
                                {article.title}
                              </h5>
                              <span className="text-[8px] font-mono text-theme-text-muted mt-0.5">
                                {article.readTime}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu Side-Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />
            
            {/* Side Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-theme-tertiary border-r border-theme-border shadow-2xl p-8 flex flex-col justify-between z-55"
            >
              <div>
                <div className="flex items-center justify-between border-b border-theme-border pb-5 mb-8">
                  <span className="font-serif text-lg tracking-widest uppercase font-bold text-theme-text">
                    Éloquence
                  </span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-theme-text-muted hover:text-theme-text transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  <span className="text-[9px] font-mono tracking-[0.3em] text-theme-text-muted uppercase mb-2">
                    Dossiers & Editions
                  </span>
                  
                  {onNavigateToStores && (
                    <button
                      onClick={() => {
                        onNavigateToStores();
                        setMobileMenuOpen(false);
                      }}
                      className={`text-left font-serif text-xl py-1 cursor-pointer transition-all flex items-center gap-2 ${
                        currentPath === '/stores' || currentPath.startsWith('/store/')
                          ? 'text-accent font-bold italic pl-2' 
                          : 'text-theme-text hover:text-accent font-medium'
                      }`}
                    >
                      🛍️ Stores & Coupons
                    </button>
                  )}

                  {displayCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`text-left font-serif text-xl py-1 cursor-pointer transition-all ${
                        activeCategory === cat 
                          ? 'text-accent italic pl-2 font-bold' 
                          : 'text-theme-text hover:text-accent'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  
                  {/* User Account actions in Mobile Menu */}
                  <div className="border-t border-theme-border-subtle pt-5 mt-4 flex flex-col gap-4 text-left">
                    {isAuthenticated ? (
                      <>
                        <div>
                          <span className="font-mono text-[8px] uppercase tracking-wider text-accent font-semibold block mb-0.5">
                            Signed In As
                          </span>
                          <span className="text-sm font-serif text-theme-text truncate block">
                            admin@eloquence.com
                          </span>
                        </div>
                        
                        {onToggleAdmin && (
                          <button
                            onClick={() => {
                              onToggleAdmin();
                              setMobileMenuOpen(false);
                            }}
                            className={`text-left font-serif text-lg py-1 cursor-pointer transition-all ${
                              isAdminOpen ? 'text-accent italic pl-2 font-bold' : 'text-theme-text hover:text-accent'
                            }`}
                          >
                            🛠️ {isAdminOpen ? 'Close Admin Studio' : 'Admin Studio'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            onLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="text-left font-serif text-lg py-1 cursor-pointer text-theme-text-muted hover:text-rose-500 transition-colors"
                        >
                          🚪 Sign Out
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          onOpenLogin();
                          setMobileMenuOpen(false);
                        }}
                        className="text-left font-serif text-xl py-1 cursor-pointer text-theme-text hover:text-accent transition-all flex items-center gap-2"
                      >
                        🔑 Sign In to Studio
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-theme-border pt-6 mt-8">
                <span className="font-mono text-[8px] uppercase tracking-widest text-theme-text-muted block mb-2">
                  Issue No. 04 — Summer 2026
                </span>
                <p className="text-xs text-theme-text-sub leading-relaxed">
                  A digital compilation of unhurried design and somatic mindfulness, crafted in our server-side workspace.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
