import React, { useState, useEffect } from 'react';
import { Article, Author } from '../types';
import { 
  Plus, Trash2, Edit3, Save, Upload, X, Check, Grid, 
  Image as ImageIcon, FileText, Settings, User, Globe, 
  ArrowLeft, ToggleLeft, ToggleRight, Loader2, Sparkles
} from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
  articles: Article[];
  categories: string[];
  settings: {
    logoText: string;
    logoSubtext: string;
    siteTitle: string;
    logoUrl: string;
  };
  onRefreshArticles: () => void;
  onRefreshCategories: () => void;
  onRefreshSettings: () => void;
  onLogout?: () => void;
}

export default function AdminPanel({
  onClose,
  articles,
  categories,
  settings,
  onRefreshArticles,
  onRefreshCategories,
  onRefreshSettings,
  onLogout,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'settings'>('articles');
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('eloquence_admin_auth') === 'true';
  });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;
    if (email === 'admin@eloquence.com' && (password === 'admin' || password === 'admin123')) {
      setIsAuthenticated(true);
      localStorage.setItem('eloquence_admin_auth', 'true');
    } else {
      setAuthError('Invalid credentials. Please double-check.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('eloquence_admin_auth');
    if (onLogout) onLogout();
  };
  
  // Article form state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [content, setContent] = useState<string[]>(['']);
  
  // UI States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Settings Form State
  const [logoText, setLogoText] = useState(settings.logoText || '');
  const [logoSubtext, setLogoSubtext] = useState(settings.logoSubtext || '');
  const [siteTitle, setSiteTitle] = useState(settings.siteTitle || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');

  // Keep settings form synced if changed externally
  useEffect(() => {
    setLogoText(settings.logoText || '');
    setLogoSubtext(settings.logoSubtext || '');
    setSiteTitle(settings.siteTitle || '');
    setLogoUrl(settings.logoUrl || '');
  }, [settings]);

  // Render Login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="pt-[140px] pb-24 px-6 md:px-12 max-w-md mx-auto min-h-[85vh] flex flex-col justify-center">
        <div className="bg-[#121212] border border-white/10 p-8 md:p-10 shadow-2xl relative">
          <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
          
          <div className="text-center mb-8">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent font-bold block mb-2">
              ADMINISTRATIVE HUB
            </span>
            <h2 className="font-serif text-2xl uppercase tracking-widest text-white font-medium">
              Studio Access
            </h2>
            <p className="text-white/40 text-[10px] mt-2 font-mono tracking-wider uppercase">
              Authenticated personnel only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-mono text-[9.5px] uppercase tracking-widest text-white/50 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@eloquence.com"
                className="w-full bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-4 py-3.5 text-sm focus:outline-none focus:ring-0 rounded-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[9.5px] uppercase tracking-widest text-white/50 mb-2">
                Secure Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-4 py-3.5 text-sm focus:outline-none focus:ring-0 rounded-none transition-colors"
              />
            </div>

            {authError && (
              <p className="text-red-400 font-mono text-[10px] text-center bg-red-950/25 border border-red-900/30 py-2.5 px-3">
                ⚠️ {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-white text-black hover:bg-accent hover:text-white transition-all font-mono text-[10px] font-bold uppercase tracking-[0.2em] py-3.5 cursor-pointer rounded-none"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="border-t border-white/5 mt-8 pt-6 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-white/40 hover:text-white font-mono text-[9px] uppercase tracking-widest transition-colors cursor-pointer"
            >
              ← Return to Magazine
            </button>
            
            <div className="mt-6 bg-[#171717] p-4 border border-white/5 rounded-none text-left">
              <span className="font-mono text-[8px] uppercase tracking-wider text-accent font-semibold block mb-1">
                DEMO CREDENTIALS:
              </span>
              <div className="font-mono text-[9px] text-white/50 space-y-0.5">
                <div>Email: <span className="text-white select-all">admin@eloquence.com</span></div>
                <div>Password: <span className="text-white select-all">admin123</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle opening form for creation
  const handleOpenCreate = () => {
    setEditingArticle(null);
    setIsCreating(true);
    
    // Reset fields
    setTitle('');
    setSubtitle('');
    setSummary('');
    setCategory(categories[0] || 'Wellness');
    setImage('https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80');
    setAuthorName('Editorial Team');
    setAuthorRole('ÉLOQUENCE Contributor');
    setAuthorAvatar('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80');
    setFeatured(false);
    setTrending(false);
    setContent(['']);
  };

  // Handle opening form for editing
  const handleOpenEdit = (art: Article) => {
    setEditingArticle(art);
    setIsCreating(false);
    
    setTitle(art.title);
    setSubtitle(art.subtitle || '');
    setSummary(art.summary);
    setCategory(art.category);
    setImage(art.image);
    setAuthorName(art.author.name);
    setAuthorRole(art.author.role);
    setAuthorAvatar(art.author.avatar);
    setFeatured(!!art.featured);
    setTrending(!!art.trending);
    setContent(art.content && art.content.length > 0 ? [...art.content] : ['']);
  };

  // Handle paragraph modifications
  const handleContentParagraphChange = (index: number, val: string) => {
    const updated = [...content];
    updated[index] = val;
    setContent(updated);
  };

  const handleAddParagraph = () => {
    setContent([...content, '']);
  };

  const handleRemoveParagraph = (index: number) => {
    if (content.length <= 1) return;
    const updated = content.filter((_, i) => i !== index);
    setContent(updated);
  };

  // Base64 file uploader helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'avatar' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'image') setUploadingImage(true);
    if (target === 'avatar') setUploadingAvatar(true);
    if (target === 'logo') setUploadingLogo(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            data: base64String
          })
        });

        const data = await response.json();
        if (response.ok && data.url) {
          if (target === 'image') setImage(data.url);
          if (target === 'avatar') setAuthorAvatar(data.url);
          if (target === 'logo') setLogoUrl(data.url);
        } else {
          alert('Upload failed: ' + (data.error || 'Unknown error'));
        }
        
        setUploadingImage(false);
        setUploadingAvatar(false);
        setUploadingLogo(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('File upload error', err);
      alert('Upload failed: ' + err.message);
      setUploadingImage(false);
      setUploadingAvatar(false);
      setUploadingLogo(false);
    }
  };

  // Handle Article Form Submission (Save/Create)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !category || !content[0]) {
      alert('Please fill out the Title, Summary, Category, and at least one Paragraph.');
      return;
    }

    setSaving(true);
    const cleanContent = content.filter(p => p.trim() !== '');

    const articlePayload = {
      title,
      subtitle,
      summary,
      category,
      image,
      featured,
      trending,
      content: cleanContent,
      readTime: `${Math.max(2, Math.ceil(cleanContent.join(' ').split(' ').length / 150))} min read`,
      author: {
        name: authorName,
        role: authorRole,
        avatar: authorAvatar
      }
    };

    try {
      let url = '/api/articles';
      let method = 'POST';

      if (!isCreating && editingArticle) {
        url = `/api/articles/${editingArticle.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articlePayload)
      });

      if (response.ok) {
        onRefreshArticles();
        setIsCreating(false);
        setEditingArticle(null);
      } else {
        const errData = await response.json();
        alert('Failed to save article: ' + (errData.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Network error saving article: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle Deleting Article
  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        onRefreshArticles();
        if (editingArticle?.id === id) {
          setEditingArticle(null);
        }
      } else {
        alert('Failed to delete article');
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    }
  };

  // Handle Category Creation
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategoryName.trim() })
      });

      if (response.ok) {
        onRefreshCategories();
        setNewCategoryName('');
      } else {
        alert('Failed to add category');
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    }
  };

  // Handle Category Deletion
  const handleDeleteCategory = async (catName: string) => {
    if (['Wellness', 'Fashion', 'Travel', 'Culture', 'Lifestyle'].includes(catName)) {
      if (!confirm('This is a core system category. Are you sure you want to delete it?')) return;
    } else {
      if (!confirm(`Delete category "${catName}"?`)) return;
    }

    try {
      const response = await fetch(`/api/categories/${encodeURIComponent(catName)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onRefreshCategories();
      } else {
        alert('Failed to delete category');
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    }
  };

  // Handle Settings Saving
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoText,
          logoSubtext,
          siteTitle,
          logoUrl
        })
      });

      if (response.ok) {
        onRefreshSettings();
        // Update document title dynamically
        if (siteTitle) {
          document.title = siteTitle;
        }
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-[140px] pb-24 px-6 md:px-12 max-w-[1368px] mx-auto min-h-[80vh]">
      {/* Header of Admin Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-10 gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent flex items-center gap-1.5 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            ÉLOQUENCE EDITORIAL ENGINE
          </span>
          <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-tight text-white font-medium">
            Admin Control Center
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-4 py-2 border border-red-500/25 hover:border-red-500 hover:text-red-400 transition-all cursor-pointer text-white/60"
          >
            Logout
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-4 py-2 border border-white/10 hover:border-white/40 hover:text-accent transition-all cursor-pointer text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Magazine
          </button>
        </div>
      </div>

      {/* Admin Tab Nav */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto gap-1">
        <button
          onClick={() => { setActiveTab('articles'); setIsCreating(false); setEditingArticle(null); }}
          className={`flex items-center gap-2 px-6 py-4 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
            activeTab === 'articles' && !isCreating && !editingArticle
              ? 'border-accent text-accent bg-white/5'
              : 'border-transparent text-white/40 hover:text-white hover:bg-white/2'
          }`}
        >
          <FileText className="w-4 h-4" />
          Manage Articles ({articles.length})
        </button>
        <button
          onClick={() => { setActiveTab('categories'); setIsCreating(false); setEditingArticle(null); }}
          className={`flex items-center gap-2 px-6 py-4 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
            activeTab === 'categories'
              ? 'border-accent text-accent bg-white/5'
              : 'border-transparent text-white/40 hover:text-white hover:bg-white/2'
          }`}
        >
          <Grid className="w-4 h-4" />
          Categories ({categories.length})
        </button>
        <button
          onClick={() => { setActiveTab('settings'); setIsCreating(false); setEditingArticle(null); }}
          className={`flex items-center gap-2 px-6 py-4 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
            activeTab === 'settings'
              ? 'border-accent text-accent bg-white/5'
              : 'border-transparent text-white/40 hover:text-white hover:bg-white/2'
          }`}
        >
          <Settings className="w-4 h-4" />
          Site Settings & Brand Logo
        </button>
      </div>

      {/* MAIN TAB PANELS */}
      <div className="grid grid-cols-1 gap-10">
        {/* TAB 1: ARTICLES */}
        {activeTab === 'articles' && (
          <div>
            {!isCreating && !editingArticle ? (
              /* Articles Listing */
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-lg uppercase text-white tracking-wider">
                    Published Essays
                  </h3>
                  <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-white text-black hover:bg-accent hover:text-white transition-all font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 cursor-pointer rounded-none"
                  >
                    <Plus className="w-4 h-4" />
                    Write New Article
                  </button>
                </div>

                <div className="border border-white/10 bg-[#121212] overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-white/10 font-mono text-[9px] uppercase tracking-widest text-white/40 bg-black/40">
                        <th className="py-4 px-6">Article</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Author</th>
                        <th className="py-4 px-6">Attributes</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {articles.map((art) => (
                        <tr key={art.id} className="hover:bg-white/2 transition-colors text-xs">
                          <td className="py-4 px-6 flex items-center gap-4 min-w-[280px]">
                            <img
                              src={art.image}
                              alt={art.title}
                              className="w-12 h-12 object-cover bg-neutral-900 border border-white/10 shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-serif font-bold text-white line-clamp-1 group-hover:text-accent">
                                {art.title}
                              </span>
                              <span className="text-white/40 font-mono text-[9px] mt-0.5">
                                {art.date || 'No Date'} · {art.readTime || '3 min'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 border border-white/15 bg-white/5 font-mono text-[9px] uppercase tracking-wider text-accent rounded-none">
                              {art.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <img
                                src={art.author.avatar}
                                alt={art.author.name}
                                className="w-6 h-6 rounded-full shrink-0 object-cover"
                              />
                              <div className="flex flex-col">
                                <span className="text-white font-medium">{art.author.name}</span>
                                <span className="text-[9px] text-white/40 line-clamp-1">{art.author.role}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 min-w-[150px]">
                            <div className="flex flex-wrap gap-1.5">
                              {art.featured && (
                                <span className="bg-accent/15 text-accent border border-accent/25 text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-widest">
                                  Featured
                                </span>
                              )}
                              {art.trending && (
                                <span className="bg-white/10 text-white/80 border border-white/20 text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-widest">
                                  Trending
                                </span>
                              )}
                              {!art.featured && !art.trending && (
                                <span className="text-white/30 italic text-[10px]">Standard</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2 min-w-[120px]">
                            <button
                              onClick={() => handleOpenEdit(art)}
                              className="p-1.5 border border-white/10 hover:border-white/40 hover:text-accent transition-all inline-block cursor-pointer"
                              title="Edit Article"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art.id)}
                              className="p-1.5 border border-white/10 hover:border-red-500/50 hover:text-red-400 transition-all inline-block cursor-pointer"
                              title="Delete Article"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Create/Edit Form */
              <div className="bg-[#121212] border border-white/10 p-6 md:p-10 max-w-4xl mx-auto">
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                  <h3 className="font-serif text-xl uppercase tracking-wider text-white">
                    {isCreating ? 'Write Elegant Essay' : `Edit: ${title}`}
                  </h3>
                  <button
                    onClick={() => { setIsCreating(false); setEditingArticle(null); }}
                    className="p-1 hover:text-accent transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveArticle} className="space-y-6 font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Core properties */}
                    <div className="space-y-4">
                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-white/50 mb-1.5">
                          Article Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. The Architecture of Stillness"
                          className="w-full bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-4 py-3 text-sm focus:outline-none focus:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-white/50 mb-1.5">
                          Subtitle (Optional)
                        </label>
                        <input
                          type="text"
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                          placeholder="e.g. How minimalist design shapes our cognitive peace."
                          className="w-full bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-4 py-3 text-sm focus:outline-none focus:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-white/50 mb-1.5">
                          Summary / Abstract *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          placeholder="Provide a sophisticated 2-3 sentence overview..."
                          className="w-full bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-4 py-3 text-sm focus:outline-none focus:ring-0 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-mono text-[9px] uppercase tracking-widest text-white/50 mb-1.5">
                            Category *
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-4 py-3 text-sm focus:outline-none focus:ring-0"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-4 pt-6">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={featured}
                              onChange={(e) => setFeatured(e.target.checked)}
                              className="accent-accent"
                            />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-white">Featured Hero</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={trending}
                              onChange={(e) => setTrending(e.target.checked)}
                              className="accent-accent"
                            />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-white">Trending</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Images and Authors */}
                    <div className="space-y-4">
                      {/* Cover Image Upload */}
                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-white/50 mb-1.5">
                          Cover Image URL or File Upload *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="grow bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-4 py-3 text-xs focus:outline-none focus:ring-0"
                          />
                          <label className="bg-white text-black hover:bg-accent hover:text-white px-4 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-widest font-bold cursor-pointer shrink-0">
                            {uploadingImage ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'image')}
                              disabled={uploadingImage}
                            />
                          </label>
                        </div>
                        {image && (
                          <div className="mt-2 relative h-20 w-full overflow-hidden border border-white/10 bg-neutral-900">
                            <img src={image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>

                      {/* Author Details Block */}
                      <div className="border border-white/5 bg-[#171717] p-4 space-y-3">
                        <span className="font-mono text-[9px] tracking-wider text-accent block border-b border-white/5 pb-2">
                          AUTHOR INFO
                        </span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-mono text-[8px] uppercase tracking-widest text-white/50 mb-1">
                              Author Name
                            </label>
                            <input
                              type="text"
                              value={authorName}
                              onChange={(e) => setAuthorName(e.target.value)}
                              className="w-full bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-[8px] uppercase tracking-widest text-white/50 mb-1">
                              Author Role
                            </label>
                            <input
                              type="text"
                              value={authorRole}
                              onChange={(e) => setAuthorRole(e.target.value)}
                              className="w-full bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-mono text-[8px] uppercase tracking-widest text-white/50 mb-1">
                            Author Avatar Image (URL or Upload)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={authorAvatar}
                              onChange={(e) => setAuthorAvatar(e.target.value)}
                              className="grow bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-3 py-2 text-xs focus:outline-none"
                            />
                            <label className="bg-white/10 hover:bg-white/20 text-white px-3 flex items-center justify-center gap-1 font-mono text-[8px] uppercase tracking-widest font-bold cursor-pointer shrink-0">
                              {uploadingAvatar ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Upload className="w-3 h-3" />
                              )}
                              File
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'avatar')}
                                disabled={uploadingAvatar}
                              />
                            </label>
                          </div>
                          {authorAvatar && (
                            <img src={authorAvatar} className="mt-1 w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Multi-paragraph Content Editor */}
                  <div className="border-t border-white/10 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 font-bold">
                        Essay Content / Paragraphs *
                      </span>
                      <button
                        type="button"
                        onClick={handleAddParagraph}
                        className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-accent hover:text-white border border-accent/30 hover:border-white px-3 py-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Paragraph
                      </button>
                    </div>

                    <div className="space-y-4">
                      {content.map((pText, idx) => (
                        <div key={idx} className="relative group">
                          <div className="flex items-center justify-between font-mono text-[8px] text-white/30 uppercase tracking-widest mb-1 pl-1">
                            <span>Paragraph #{idx + 1}</span>
                            {content.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveParagraph(idx)}
                                className="text-red-400 hover:text-red-300 font-bold cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <textarea
                            rows={4}
                            value={pText}
                            onChange={(e) => handleContentParagraphChange(idx, e.target.value)}
                            placeholder="Write paragraph content... Take your time, focus on unhurried phrasing."
                            className="w-full bg-[#161616] border border-white/10 focus:border-accent text-white px-4 py-3 text-sm focus:outline-none focus:ring-0 leading-relaxed font-light"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit bar */}
                  <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
                    <button
                      type="button"
                      onClick={() => { setIsCreating(false); setEditingArticle(null); }}
                      className="px-6 py-3 border border-white/10 hover:border-white/30 text-white font-mono text-[10px] uppercase tracking-widest cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 bg-white text-black hover:bg-accent hover:text-white transition-all font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer rounded-none disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" /> Save Essay
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="max-w-2xl mx-auto w-full bg-[#121212] border border-white/10 p-6 md:p-8">
            <h3 className="font-serif text-lg uppercase text-white tracking-wider border-b border-white/10 pb-4 mb-6">
              Manage Departments & Categories
            </h3>

            {/* Category creation form */}
            <form onSubmit={handleAddCategory} className="flex gap-3 mb-8">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Architecture, Poetry, Gastronomy"
                className="grow bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-4 py-3 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="bg-white text-black hover:bg-accent hover:text-white transition-all font-mono text-[10px] font-bold uppercase tracking-widest px-6 py-3 cursor-pointer shrink-0 rounded-none"
              >
                Create Category
              </button>
            </form>

            <span className="font-mono text-[9px] tracking-widest uppercase text-white/40 block mb-4">
              Active Magazine Categories
            </span>

            <div className="divide-y divide-white/5 border border-white/10 bg-black/25">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center justify-between py-4 px-6 hover:bg-white/1 transition-all">
                  <span className="font-serif text-base text-white tracking-wide uppercase font-medium">
                    {cat}
                  </span>
                  <div className="flex items-center gap-4">
                    {['Wellness', 'Fashion', 'Travel', 'Culture', 'Lifestyle'].includes(cat) && (
                      <span className="font-mono text-[8px] uppercase tracking-wider text-accent/50 border border-accent/20 px-2 py-0.5">
                        Core System
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SITE SETTINGS & BRAND LOGO */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto w-full bg-[#121212] border border-white/10 p-6 md:p-8">
            <h3 className="font-serif text-lg uppercase text-white tracking-wider border-b border-white/10 pb-4 mb-6">
              Branding & Global Settings
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-6 font-sans">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/50 mb-1.5">
                  Magazine Title *
                </label>
                <input
                  type="text"
                  required
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  placeholder="e.g. ÉLOQUENCE"
                  className="w-full bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/50 mb-1.5">
                  Subtext Slogan
                </label>
                <input
                  type="text"
                  value={logoSubtext}
                  onChange={(e) => setLogoSubtext(e.target.value)}
                  placeholder="e.g. Journal d'un esprit calme"
                  className="w-full bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/50 mb-1.5">
                  Browser Tab Title (metadata Title)
                </label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="e.g. ÉLOQUENCE — Journal d'un esprit calme"
                  className="w-full bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              {/* Dynamic Logo Image Upload */}
              <div className="border border-white/5 bg-[#171717] p-5">
                <span className="font-mono text-[9px] tracking-wider text-accent block border-b border-white/5 pb-2 mb-4">
                  IMAGE LOGO OVERRIDE (OPTIONAL)
                </span>
                
                <p className="text-white/40 text-[10px] leading-relaxed mb-4">
                  If you upload a logo image here, it will replace the typography text logo in the center of the navigation header. Use a light or transparent SVG/PNG logo for best results.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Enter image URL or upload directly..."
                    className="grow bg-[#1A1A1A] border border-white/10 focus:border-accent text-white px-3 py-2 text-xs focus:outline-none"
                  />
                  <label className="bg-white text-black hover:bg-accent hover:text-white px-4 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-widest font-bold cursor-pointer shrink-0">
                    {uploadingLogo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>

                {logoUrl && (
                  <div className="mt-4 flex items-center gap-4 bg-black/40 p-3 border border-white/5">
                    <div className="h-12 w-24 flex items-center justify-center bg-zinc-900 border border-white/10 p-1">
                      <img src={logoUrl} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col gap-1 grow">
                      <span className="text-[10px] font-mono text-white select-all overflow-hidden text-ellipsis line-clamp-1">{logoUrl}</span>
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="text-[9px] text-red-400 hover:text-red-300 self-start cursor-pointer"
                      >
                        Remove Logo Image Override
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-white/10 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-white text-black hover:bg-accent hover:text-white transition-all font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer rounded-none disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Save Site Branding
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
