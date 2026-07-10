import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, AlertCircle, Feather } from 'lucide-react';
import { Article } from '../types';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function AIChatDrawer({ isOpen, onClose, article }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [simulatedWarning, setSimulatedWarning] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat and add greeting on article change
  useEffect(() => {
    if (isOpen && article) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: `Welcome, reader. I am **AURA**, your AI Literary Companion. \n\nI have read *"${article.title}"* and stand ready to dissect its deeper philosophies with you. \n\n*Choose a query below or write your own thought:*\n`,
          timestamp: new Date()
        }
      ]);
      setError('');
      setSimulatedWarning(false);
    }
  }, [article?.id, isOpen]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !article) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      // Build chat history for conversational context
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: article.title,
          articleContent: article.content,
          userMessage: textToSend,
          chatHistory: chatHistory
        })
      });

      if (!res.ok) {
        throw new Error(`Service returned status ${res.status}`);
      }

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        text: data.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (data.simulated) {
        setSimulatedWarning(true);
      }
    } catch (err: any) {
      console.error('Chat error', err);
      setError('AURA was momentarily lost in thought. Please try sending your message again.');
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Summarize Article', text: 'Please summarize the main concepts of this article.' },
    { label: 'Write inspired Poem', text: 'Write an elegant, short poem reflecting the mood of this article.' },
    { label: 'Somatic Meditation', text: 'Suggest a physical mindfulness or contemplation exercise inspired by this theme.' },
    { label: 'Philosophical roots', text: 'What historic or cultural philosophies underpin this piece?' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent click-to-close backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-45"
          />

          {/* Chat Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 right-0 w-full sm:w-[460px] bg-theme-bg border-l border-theme-border shadow-2xl z-50 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-theme-border bg-theme-tertiary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold tracking-wider text-theme-text uppercase">
                    AURA COMPANION
                  </h3>
                  <p className="text-[9px] font-mono text-theme-text-muted uppercase tracking-widest">
                    L'Éloquence AI Assistant
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-theme-tertiary text-theme-text-muted hover:text-theme-text transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Article context reminder */}
            {article && (
              <div className="bg-theme-bg/80 backdrop-blur-xs px-6 py-2.5 border-b border-theme-border flex items-center justify-between">
                <span className="text-[10px] font-mono text-theme-text-muted uppercase tracking-wider truncate max-w-xs">
                  Active Context: {article.title}
                </span>
                <span className="text-[8px] font-mono uppercase bg-accent/20 text-accent px-1.5 py-0.5 rounded-none shrink-0 font-semibold">
                  {article.category}
                </span>
              </div>
            )}

            {/* Messages Body */}
            <div className="grow overflow-y-auto p-6 flex flex-col gap-5 bg-theme-bg">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <span className="text-[8px] font-mono text-theme-text-muted uppercase tracking-widest mb-1 px-1">
                    {msg.role === 'user' ? 'Reader' : 'AURA'}
                  </span>
                  
                  <div
                    className={`p-4 text-xs leading-relaxed rounded-none ${
                      msg.role === 'user'
                        ? 'bg-theme-text text-theme-bg font-semibold font-sans shadow-xs'
                        : 'bg-theme-tertiary border border-theme-border text-theme-text-sub font-sans shadow-xs'
                    }`}
                  >
                    {/* Render message paragraphs cleanly with standard splits */}
                    {msg.text.split('\n\n').map((para, i) => {
                      // Basic parsing for bold styling in text
                      const renderedPara = para.split('**').map((part, index) => {
                        return index % 2 === 1 ? <strong key={index} className="font-semibold text-accent">{part}</strong> : part;
                      });

                      return (
                        <p key={i} className={i > 0 ? 'mt-2.5' : ''}>
                          {renderedPara}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Loader */}
              {loading && (
                <div className="self-start flex flex-col items-start max-w-[80%]">
                  <span className="text-[8px] font-mono text-theme-text-muted uppercase tracking-widest mb-1 px-1">
                    AURA
                  </span>
                  <div className="bg-theme-tertiary border border-theme-border p-4 rounded-none shadow-xs flex items-center gap-3">
                    <Feather className="w-4 h-4 text-accent animate-bounce" />
                    <span className="text-xs text-theme-text-muted font-mono tracking-widest uppercase">Gathering thoughts...</span>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs rounded-none flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Simulated Warnings */}
              {simulatedWarning && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-600 text-[11px] rounded-none flex flex-col gap-1 leading-normal">
                  <div className="flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Running in Preview Mode</span>
                  </div>
                  <p className="text-[10px] opacity-90">
                    AURA is responding using simulated semantic models because your <code className="bg-amber-500/20 px-1 py-0.5 font-mono text-[9px] text-amber-700">GEMINI_API_KEY</code> is not set in secrets. Add your key to enable live AI.
                  </p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick action buttons & input section */}
            <div className="p-6 border-t border-theme-border bg-theme-tertiary">
              {/* Quick actions panel */}
              {messages.length === 1 && !loading && (
                <div className="flex flex-col gap-2 mb-4">
                  <span className="text-[8px] font-mono text-theme-text-muted uppercase tracking-widest">
                    Quick Inquiries
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt.label}
                        onClick={() => handleSendMessage(prompt.text)}
                        className="text-left text-[10px] font-mono p-2.5 border border-theme-border hover:border-accent hover:bg-theme-bg transition-all text-theme-text-sub hover:text-theme-text rounded-none leading-tight cursor-pointer"
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(input);
                }}
                className="flex items-center gap-2 border border-theme-border focus-within:border-accent p-1 bg-theme-bg rounded-none"
              >
                <input
                  type="text"
                  placeholder="Ask AURA about design, stillness..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading || !article}
                  className="grow text-xs px-3 py-2.5 bg-transparent focus:outline-none disabled:opacity-50 text-theme-text placeholder-theme-text-muted"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim() || !article}
                  className="bg-accent hover:bg-theme-text hover:text-theme-bg text-white font-bold p-2.5 transition-colors disabled:opacity-40 shrink-0 rounded-none cursor-pointer"
                  aria-label="Send Message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
