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
        setError('Incorrect email or password.');
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
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/50 z-50 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.1 }}
              className="w-full max-w-md bg-white border border-neutral-200 p-8 sm:p-10 shadow-2xl relative rounded-2xl overflow-hidden pointer-events-auto"
            >
              {/* Top Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-accent" />

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer rounded-full"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="text-center mb-8 mt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-neutral-200 rounded-full bg-neutral-50 text-accent mb-3.5">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span className="text-[9px] font-mono uppercase tracking-widest font-semibold">Studio Registry</span>
                </div>
                <h3 className="font-serif text-3xl uppercase tracking-wider text-neutral-900 font-semibold">
                  Studio Sign In
                </h3>
                <p className="text-neutral-500 text-[10px] mt-2 font-mono tracking-widest uppercase">
                  Log in to access your administrative workspace
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-600 mb-2 font-bold">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-4.5 h-4.5 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@eloquence.com"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-accent focus:bg-white text-neutral-900 pl-11 pr-4 py-3 text-xs focus:outline-none rounded-lg transition-all placeholder-neutral-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-600 mb-2 font-bold">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-4.5 h-4.5 text-neutral-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-accent focus:bg-white text-neutral-900 pl-11 pr-4 py-3 text-xs focus:outline-none rounded-lg transition-all placeholder-neutral-400"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[10px] flex items-start gap-2.5 leading-relaxed"
                  >
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-500" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-900 text-white hover:bg-accent hover:text-white transition-all font-mono text-[11px] font-bold uppercase tracking-[0.2em] py-3.5 cursor-pointer rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Access Workspace</span>
                  )}
                </button>
              </form>


            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
