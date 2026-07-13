import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail === 'admin@eloquence.com' && (password === 'admin' || password === 'admin123')) {
        localStorage.setItem('eloquence_admin_auth', 'true');
        onLoginSuccess();
        onClose();
        setEmail('');
        setPassword('');
      } else {
        setError('Incorrect email or password. Please use the demo credentials below.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.1 }}
              className="w-full max-w-md bg-theme-secondary border border-theme-border p-8 shadow-2xl relative pointer-events-auto rounded-none overflow-hidden"
            >
              {/* Subtle top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-1 text-theme-text-muted hover:text-theme-text transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-theme-border rounded-full bg-theme-tertiary text-accent mb-4">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span className="text-[8px] font-mono uppercase tracking-widest font-semibold">Studio Registry</span>
                </div>
                <h3 className="font-serif text-2xl uppercase tracking-wider text-theme-text font-normal">
                  Account Sign In
                </h3>
                <p className="text-theme-text-muted text-[10px] mt-1.5 font-mono tracking-widest uppercase">
                  Log in to access your administrative workspace
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-theme-text-muted mb-2 font-medium">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-4 h-4 text-theme-text-muted" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@eloquence.com"
                      className="w-full bg-theme-tertiary border border-theme-border focus:border-accent text-theme-text pl-11 pr-4 py-3 text-xs focus:outline-none rounded-none transition-all placeholder-theme-text-muted/55"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-theme-text-muted mb-2 font-medium">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-4 h-4 text-theme-text-muted" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-theme-tertiary border border-theme-border focus:border-accent text-theme-text pl-11 pr-4 py-3 text-xs focus:outline-none rounded-none transition-all placeholder-theme-text-muted/55"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-mono text-[10px] flex items-start gap-2 leading-relaxed">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-theme-text text-theme-bg hover:bg-accent hover:text-white transition-all font-mono text-[10px] font-bold uppercase tracking-[0.2em] py-3.5 cursor-pointer rounded-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Access Workspace</span>
                  )}
                </button>
              </form>

              {/* Demo Credentials Box */}
              <div className="mt-8 pt-6 border-t border-theme-border-subtle bg-theme-tertiary/60 p-4 border rounded-none">
                <span className="font-mono text-[8.5px] uppercase tracking-wider text-accent font-semibold block mb-1.5">
                  DEMO WORKSPACE CREDENTIALS:
                </span>
                <div className="font-mono text-[9.5px] text-theme-text-sub space-y-1">
                  <div className="flex justify-between">
                    <span className="opacity-75">Email:</span>
                    <span className="text-theme-text font-medium select-all">admin@eloquence.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Password:</span>
                    <span className="text-theme-text font-medium select-all">admin123</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
