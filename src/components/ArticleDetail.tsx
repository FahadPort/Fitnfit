import { useEffect } from 'react';
import { Article } from '../types';
import { ArrowLeft, Bookmark, Clock, Sparkles, MessageSquare, Heart } from 'lucide-react';
import { motion, useScroll, useSpring } from 'motion/react';
import ArticleCard from './ArticleCard';

interface ArticleDetailProps {
  article: Article;
  relatedArticles: Article[];
  onBack: () => void;
  onArticleClick: (id: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onOpenAssistant: () => void;
}

export default function ArticleDetail({
  article,
  relatedArticles,
  onBack,
  onArticleClick,
  isBookmarked,
  onToggleBookmark,
  onOpenAssistant,
}: ArticleDetailProps) {
  // Scroll progress indicator setup
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Scroll to top on load or article change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article.id]);

  return (
    <main 
      id={`article-detail-${article.id}`}
      className="pt-[110px] pb-24 px-6 md:px-12 max-w-[1368px] mx-auto"
    >
      {/* Top thin reading progress bar */}
      <motion.div 
        id="reading-progress-bar"
        className="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-50" 
        style={{ scaleX }} 
      />

      {/* Back button & Action bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-theme-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-theme-text hover:text-accent transition-all font-mono text-[10px] uppercase tracking-widest group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Magazine</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onToggleBookmark(article.id)}
            className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest transition-all px-3 py-1.5 border rounded-none cursor-pointer ${
              isBookmarked 
                ? 'bg-accent/20 border-accent text-accent font-semibold' 
                : 'border-theme-border hover:border-accent text-theme-text-muted hover:text-theme-text'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-accent' : ''}`} />
            <span>{isBookmarked ? 'Saved to Reading List' : 'Save reading'}</span>
          </button>
        </div>
      </div>

      {/* Article Header (Title, Subtitle, Author, Date, Reading Time) */}
      <article className="max-w-4xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-4 text-center items-center py-6">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent font-semibold">
            {article.category}
          </span>
          
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] text-theme-text font-normal tracking-tight leading-[1.1] max-w-3xl">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="font-sans text-theme-text-sub text-lg md:text-xl max-w-2xl leading-relaxed font-light italic mt-2">
              {article.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-theme-text-muted uppercase tracking-widest mt-6 pb-2">
            <span className="text-theme-text font-bold">{article.date}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent/50" />
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
          </div>

          <div className="flex items-center gap-3 border-t border-b border-theme-border py-4 w-full justify-center max-w-xs mt-2">
            <img 
              src={article.author.avatar} 
              alt={article.author.name} 
              className="w-10 h-10 rounded-full object-cover border border-theme-border shadow-xs"
            />
            <div className="text-left">
              <p className="text-xs font-semibold text-theme-text leading-tight">{article.author.name}</p>
              <p className="text-[9px] text-theme-text-muted font-mono uppercase tracking-wider">{article.author.role}</p>
            </div>
          </div>
        </header>

        {/* Large Immersive Banner Image */}
        <div className="w-full aspect-[21/9] overflow-hidden bg-theme-card relative border border-theme-border">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Floating Call to Action for AI Companion */}
        <div className="bg-theme-tertiary border border-theme-border p-6 md:p-8 mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden rounded-none">
          <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4">
            <Sparkles className="w-24 h-24 text-accent animate-pulse" />
          </div>
          
          <div className="flex flex-col gap-1 z-10">
            <span className="flex items-center gap-1.5 text-accent font-mono text-[9px] uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              AURA Editorial Intelligence
            </span>
            <h4 className="font-serif text-lg text-theme-text uppercase font-bold">
              Discuss this dossier with our literary AI companion
            </h4>
            <p className="text-xs text-theme-text-sub max-w-lg leading-relaxed">
              Ask AURA to summarize paragraphs, compose inspired poetry, provide mindfulness exercises, or dive deep into the cultural roots of this piece.
            </p>
          </div>

          <button
            onClick={onOpenAssistant}
            className="shrink-0 bg-theme-text text-theme-bg hover:bg-accent hover:text-white text-xs font-mono font-bold tracking-widest uppercase py-3.5 px-6 transition-all duration-300 flex items-center gap-2 group z-10 rounded-none cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
            Ask AURA
          </button>
        </div>

        {/* Article Body Content */}
        <div className="max-w-2xl mx-auto flex flex-col gap-6 mt-6 leading-relaxed">
          {article.content.map((para, index) => (
            <div key={index}>
              {index === 0 ? (
                // Drop cap for the first paragraph to feel like a luxurious physical magazine
                <p className="font-sans text-theme-text text-lg md:text-xl leading-relaxed first-letter:text-6xl first-letter:font-serif first-letter:font-semibold first-letter:text-accent first-letter:float-left first-letter:mr-3.5 first-letter:mt-1.5 first-letter:leading-[0.85em]">
                  {para}
                </p>
              ) : (
                <p className="font-sans text-theme-text-sub text-base md:text-lg leading-relaxed">
                  {para}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Article Footer & Final Call to Action */}
        <footer className="max-w-2xl mx-auto w-full border-t border-theme-border mt-12 pt-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-accent fill-accent animate-pulse" />
            <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-widest">
              Thank you for reading Issue No. 04
            </span>
          </div>

          <button
            onClick={() => onToggleBookmark(article.id)}
            className="font-mono text-[10px] text-accent uppercase tracking-widest hover:text-theme-text transition-all hover:underline cursor-pointer"
          >
            {isBookmarked ? 'Unsave Dossier' : 'Save for Later'}
          </button>
        </footer>
      </article>

      {/* Related/Next Readings Section */}
      <section className="mt-24 pt-16 border-t border-theme-border">
        <div className="flex justify-between items-end mb-12">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold">Related Chapters</span>
            <h2 className="font-serif text-3xl text-theme-text tracking-tight uppercase">Continue Reading</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedArticles.slice(0, 3).map((related) => (
            <ArticleCard
              key={related.id}
              article={related}
              variant="compact"
              onClick={onArticleClick}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
