import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Check, Sparkles } from 'lucide-react';

interface NewsletterProps {
  variant: 'inline' | 'compact';
}

export default function Newsletter({ variant }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide your email address.');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    // Simulate real network request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      
      // Save to localStorage
      try {
        const existing = localStorage.getItem('eloquence_newsletter_subscribers');
        const list = existing ? JSON.parse(existing) : [];
        if (!list.includes(email)) {
          list.push(email);
          localStorage.setItem('eloquence_newsletter_subscribers', JSON.stringify(list));
        }
      } catch (err) {
        console.error('Storage error', err);
      }
      setEmail('');
    }, 1200);
  };

  if (variant === 'inline') {
    return (
      <div 
        id="newsletter-inline"
        className="bg-theme-tertiary p-6 md:p-8 flex flex-col justify-between border border-theme-border rounded-none"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-accent">
            <Mail className="w-4 h-4" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-semibold">The Dispatch</span>
          </div>
          
          <h4 className="font-serif text-xl text-theme-text leading-snug">
            Weekly perspectives on quiet design and mindful living.
          </h4>
          <p className="text-xs text-theme-text-sub leading-relaxed">
            Join 45,000+ subscribers who receive our Sunday morning column on slowing down and refining our lives.
          </p>
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-theme-bg p-4 border border-emerald-500/20 text-center rounded-none flex flex-col items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/25">
                  <Check className="w-4 h-4" />
                </div>
                <h5 className="text-sm font-serif uppercase tracking-wider text-theme-text">Successfully Subscribed</h5>
                <p className="text-[11px] text-theme-text-sub">Welcome to a calmer inbox. Next dispatch arrives Sunday.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full bg-theme-bg border border-theme-border py-3.5 px-4 text-xs font-sans text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-accent disabled:opacity-60 transition-colors rounded-none"
                  />
                  {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {error && <p className="text-[10px] text-rose-400 mt-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-theme-text text-theme-bg font-bold py-3.5 text-xs font-mono tracking-widest uppercase hover:bg-accent hover:text-white disabled:opacity-60 transition-all flex items-center justify-center gap-2 rounded-none"
                >
                  Subscribe
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Large compact banner
  return (
    <div 
      id="newsletter-compact"
      className="bg-theme-card text-theme-text py-16 px-6 md:px-16 text-center overflow-hidden relative border border-theme-border rounded-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-theme-border rounded-full bg-theme-tertiary text-accent">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[9px] font-mono uppercase tracking-widest font-semibold">A Journal of Unhurried Thought</span>
        </div>
        
        <h3 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight uppercase italic text-theme-text">
          Subscribe to L'Éloquence
        </h3>
        
        <p className="font-sans text-theme-text-sub text-sm md:text-base max-w-lg leading-relaxed">
          Sign up to receive our beautifully printed dossiers quarterly, alongside our digital Sunday journals on slow travel, art, and high design.
        </p>
        
        <div className="w-full max-w-md mt-4">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-theme-tertiary p-6 border border-theme-border text-center flex flex-col items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/25">
                  <Check className="w-5 h-5" />
                </div>
                <h5 className="text-base font-serif uppercase tracking-wider text-theme-text">Dossier Reserved</h5>
                <p className="text-xs text-theme-text-sub max-w-xs">We have added your address to our registry. Check your email for confirmation and a preview digital edition.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="grow bg-theme-tertiary border border-theme-border py-3.5 px-4 text-xs font-sans text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-accent disabled:opacity-60 transition-all rounded-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-accent text-white px-8 py-3.5 text-xs font-mono font-bold tracking-widest uppercase hover:bg-theme-text hover:text-theme-bg disabled:opacity-60 transition-all whitespace-nowrap rounded-none"
                >
                  {loading ? 'Subscribing...' : 'Join the Registry'}
                </button>
              </form>
            )}
          </AnimatePresence>
          {error && <p className="text-xs text-rose-400 mt-2 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
