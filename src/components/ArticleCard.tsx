import React from 'react';
import { motion } from 'motion/react';
import { Clock, BookOpen } from 'lucide-react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  variant?: 'hero' | 'featured' | 'compact' | 'horizontal';
  onClick: (id: string) => void;
}

export default function ArticleCard({ article, variant = 'featured', onClick }: ArticleCardProps) {
  const handleCardClick = () => {
    onClick(article.id);
  };

  if (variant === 'hero') {
    return (
      <motion.div 
        id={`article-card-hero-${article.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="group cursor-pointer flex flex-col gap-6"
        onClick={handleCardClick}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-theme-card border border-theme-border">
          <img
            src={article.image}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
          <span className="absolute top-6 left-6 bg-black text-white text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 border border-white/10 z-10">
            {article.category}
          </span>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 text-xs font-mono text-theme-text-muted uppercase tracking-wider">
            <span>{article.date}</span>
            <span className="h-1 w-1 rounded-full bg-theme-border" />
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-5xl text-theme-text tracking-tight leading-tight group-hover:text-accent transition-colors">
            {article.title}
          </h2>
          <p className="font-sans text-theme-text-sub text-base md:text-lg leading-relaxed max-w-3xl">
            {article.summary}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <img 
              src={article.author.avatar} 
              alt={article.author.name} 
              className="w-8 h-8 rounded-full object-cover border border-theme-border"
            />
            <div>
              <p className="text-xs font-medium text-theme-text">{article.author.name}</p>
              <p className="text-[10px] text-theme-text-muted font-mono uppercase">{article.author.role}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div 
        id={`article-card-featured-${article.id}`}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        className="group cursor-pointer flex flex-col gap-4"
        onClick={handleCardClick}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-theme-card border border-theme-border">
          <img
            src={article.image}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <span className="absolute top-4 left-4 bg-black text-white text-[9px] font-mono tracking-widest uppercase px-2.5 py-1 border border-white/10 z-10">
            {article.category}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-[10px] font-mono text-theme-text-muted uppercase tracking-wider">
            <span>{article.date}</span>
            <span className="h-1 w-1 rounded-full bg-theme-border" />
            <span>{article.readTime}</span>
          </div>
          <h3 className="font-serif text-2xl text-theme-text tracking-tight leading-snug group-hover:text-accent transition-colors">
            {article.title}
          </h3>
          <p className="font-sans text-theme-text-sub text-sm leading-relaxed line-clamp-3">
            {article.summary}
          </p>
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div 
        id={`article-card-compact-${article.id}`}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        className="group cursor-pointer flex flex-col gap-3"
        onClick={handleCardClick}
      >
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-theme-card border border-theme-border">
          <img
            src={article.image}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <span className="absolute top-3 left-3 bg-black/90 text-white text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 border border-white/10 z-10">
            {article.category}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-[9px] font-mono text-theme-text-muted uppercase tracking-widest">
            {article.date}
          </div>
          <h4 className="font-serif text-lg text-theme-text tracking-tight leading-snug group-hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h4>
        </div>
      </motion.div>
    );
  }

  // Horizontal variant
  return (
    <motion.div 
      id={`article-card-horizontal-${article.id}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="group cursor-pointer flex items-center gap-4 py-3 border-b border-theme-border last:border-0"
      onClick={handleCardClick}
    >
      <div className="relative w-20 h-20 shrink-0 overflow-hidden bg-theme-card border border-theme-border">
        <img
          src={article.image}
          alt={article.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[8px] font-mono text-theme-text-muted uppercase tracking-widest">
          {article.category}
        </span>
        <h5 className="font-serif text-sm text-theme-text leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h5>
        <span className="text-[9px] text-theme-text-muted font-mono">{article.readTime}</span>
      </div>
    </motion.div>
  );
}
