import { Article } from '../types';

interface FooterProps {
  setActiveCategory: (category: string) => void;
  onBackToHome?: () => void;
  onNavigateToStores?: () => void;
}

export default function Footer({ setActiveCategory, onBackToHome, onNavigateToStores }: FooterProps) {
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (onBackToHome) onBackToHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      id="main-footer"
      className="bg-white border-t border-theme-border/60 py-16 px-6 md:px-12 mt-12 text-theme-text animate-fade-in"
    >
      <div className="max-w-[1368px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Column 1: Branding and Quote */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h3 className="font-serif text-xl tracking-[0.2em] uppercase font-bold text-theme-text">
              ÉLOQUENCE
            </h3>
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-theme-text-muted -mt-2">
              Journal d'un esprit calme
            </p>
            <p className="text-xs text-theme-text-sub leading-relaxed max-w-sm mt-2">
              Our journal explores the beauty of subtraction, quiet design, and physical mindfulness. We examine space not as a void, but as a potential—a sanctuary for self-reflection and genuine creative focus.
            </p>
          </div>

          {/* Column 2: Editorial Departments */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-theme-text-muted">
              Departments
            </span>
            <div className="flex flex-col gap-2.5 text-xs">
              {['Wellness', 'Fashion', 'Travel', 'Culture', 'Lifestyle'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="text-left text-theme-text-sub hover:text-accent transition-all w-fit cursor-pointer"
                >
                  {cat}
                </button>
              ))}
              {onNavigateToStores && (
                <button
                  onClick={() => {
                    onNavigateToStores();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left text-accent font-semibold hover:opacity-85 transition-all w-fit cursor-pointer font-mono text-[9.5px] uppercase tracking-widest mt-1.5"
                >
                  Stores & Coupons
                </button>
              )}
            </div>
          </div>

          {/* Column 3: Print Edition */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-theme-text-muted">
              Print Registry
            </span>
            <p className="text-xs text-theme-text-sub leading-relaxed">
              Our quarterly hardback book contains exclusive photo essays, luxury tactile textures, and long-form prose. Distributed worldwide to selective bookshops and design studios.
            </p>
            <button 
              onClick={() => {
                const el = document.getElementById('newsletter-compact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-mono uppercase tracking-widest text-accent hover:opacity-80 transition-opacity border-b border-accent w-fit pb-0.5 cursor-pointer"
            >
              Order Issue No. 04
            </button>
          </div>

          {/* Column 4: Studio Metadata */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-theme-text-muted">
              Location
            </span>
            <p className="text-xs text-theme-text-sub leading-relaxed">
              Paris & Tokyo Studios<br />
              <span className="font-mono text-[10px] text-theme-text-muted">contact@eloquence.com</span>
            </p>
            <p className="text-xs text-theme-text-muted font-mono mt-2">
              Local Time: 2026-07-10
            </p>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-theme-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-theme-text-muted font-mono">
            &copy; 2026 ÉLOQUENCE JOURNAL. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[10px] text-theme-text-muted font-mono">
            <a href="#terms" className="hover:text-theme-text transition-colors">TERMS OF SERVICE</a>
            <a href="#privacy" className="hover:text-theme-text transition-colors">PRIVACY REGISTERS</a>
            <a href="#rss" className="hover:text-theme-text transition-colors">RSS FEED</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
