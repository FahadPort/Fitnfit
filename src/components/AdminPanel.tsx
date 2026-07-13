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
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'settings' | 'stores' | 'coupons'>('articles');
  
  // Stores and Coupons DB states
  const [stores, setStores] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Store form state
  const [editingStore, setEditingStore] = useState<any | null>(null);
  const [isCreatingStore, setIsCreatingStore] = useState<boolean>(false);
  const [storeName, setStoreName] = useState('');
  const [storeLogo, setStoreLogo] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeTargetUrl, setStoreTargetUrl] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const [storeFeatured, setStoreFeatured] = useState(false);
  const [uploadingStoreLogo, setUploadingStoreLogo] = useState(false);

  // Coupon form state
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState<boolean>(false);
  const [couponStoreId, setCouponStoreId] = useState('');
  const [couponTitle, setCouponTitle] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponType, setCouponType] = useState<'code' | 'deal'>('code');
  const [couponCode, setCouponCode] = useState('');
  const [couponDescription, setCouponDescription] = useState('');
  const [couponTargetUrl, setCouponTargetUrl] = useState('');
  const [couponVerified, setCouponVerified] = useState(true);

  // Load stores and coupons
  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores');
      if (res.ok) setStores(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) setCoupons(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchCoupons();
  }, []);

  // Handle Store Form Submission
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeDescription || !storeTargetUrl || !storeCategory) {
      alert('Please fill out Name, Description, Target URL, and Category.');
      return;
    }

    setSaving(true);
    const storePayload = {
      name: storeName,
      logo: storeLogo,
      description: storeDescription,
      targetUrl: storeTargetUrl,
      category: storeCategory,
      featured: storeFeatured
    };

    try {
      let url = '/api/stores';
      let method = 'POST';

      if (!isCreatingStore && editingStore) {
        url = `/api/stores/${editingStore.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storePayload)
      });

      if (response.ok) {
        await fetchStores();
        setIsCreatingStore(false);
        setEditingStore(null);
        resetStoreForm();
      } else {
        const errData = await response.json();
        alert('Failed to save store: ' + (errData.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Network error saving store: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetStoreForm = () => {
    setStoreName('');
    setStoreLogo('');
    setStoreDescription('');
    setStoreTargetUrl('');
    setStoreCategory('');
    setStoreFeatured(false);
  };

  const handleOpenEditStore = (store: any) => {
    setEditingStore(store);
    setIsCreatingStore(false);
    setStoreName(store.name);
    setStoreLogo(store.logo || '');
    setStoreDescription(store.description);
    setStoreTargetUrl(store.targetUrl);
    setStoreCategory(store.category);
    setStoreFeatured(!!store.featured);
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store? All associated coupons will be deleted.')) return;
    try {
      const response = await fetch(`/api/stores/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchStores();
        fetchCoupons(); // Cascaded delete check
      } else {
        alert('Failed to delete store');
      }
    } catch (err: any) {
      alert('Error deleting store: ' + err.message);
    }
  };

  // Handle Coupon Form Submission
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponStoreId || !couponTitle || !couponDiscount || !couponDescription) {
      alert('Please fill out Store, Title, Discount, and Description.');
      return;
    }
    if (couponType === 'code' && !couponCode) {
      alert('Please specify a promo code.');
      return;
    }

    setSaving(true);
    const couponPayload = {
      storeId: couponStoreId,
      title: couponTitle,
      discount: couponDiscount,
      type: couponType,
      code: couponType === 'code' ? couponCode : '',
      description: couponDescription,
      targetUrl: couponTargetUrl,
      verified: couponVerified
    };

    try {
      let url = '/api/coupons';
      let method = 'POST';

      if (!isCreatingCoupon && editingCoupon) {
        url = `/api/coupons/${editingCoupon.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponPayload)
      });

      if (response.ok) {
        await fetchCoupons();
        setIsCreatingCoupon(false);
        setEditingCoupon(null);
        resetCouponForm();
      } else {
        const errData = await response.json();
        alert('Failed to save coupon: ' + (errData.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Network error saving coupon: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetCouponForm = () => {
    setCouponStoreId('');
    setCouponTitle('');
    setCouponDiscount('');
    setCouponType('code');
    setCouponCode('');
    setCouponDescription('');
    setCouponTargetUrl('');
    setCouponVerified(true);
  };

  const handleOpenEditCoupon = (coupon: any) => {
    setEditingCoupon(coupon);
    setIsCreatingCoupon(false);
    setCouponStoreId(coupon.storeId);
    setCouponTitle(coupon.title);
    setCouponDiscount(coupon.discount);
    setCouponType(coupon.type);
    setCouponCode(coupon.code || '');
    setCouponDescription(coupon.description);
    setCouponTargetUrl(coupon.targetUrl || '');
    setCouponVerified(!!coupon.verified);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const response = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchCoupons();
      } else {
        alert('Failed to delete coupon');
      }
    } catch (err: any) {
      alert('Error deleting coupon: ' + err.message);
    }
  };
  
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
        <div className="bg-white border border-neutral-200 p-8 md:p-10 shadow-lg relative rounded-none">
          <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
          
          <div className="text-center mb-8">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent font-bold block mb-2">
              ADMINISTRATIVE HUB
            </span>
            <h2 className="font-serif text-2xl uppercase tracking-widest text-neutral-900 font-medium">
              Studio Access
            </h2>
            <p className="text-neutral-500 text-[10px] mt-2 font-mono tracking-wider uppercase">
              Authenticated personnel only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-mono text-[9.5px] uppercase tracking-widest text-neutral-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@eloquence.com"
                className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3.5 text-sm focus:outline-none focus:ring-0 rounded-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[9.5px] uppercase tracking-widest text-neutral-500 mb-2">
                Secure Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3.5 text-sm focus:outline-none focus:ring-0 rounded-none transition-colors"
              />
            </div>

            {authError && (
              <p className="text-red-600 font-mono text-[10px] text-center bg-red-50 border border-red-200 py-2.5 px-3">
                ⚠️ {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#121110] text-white hover:bg-accent transition-all font-mono text-[10px] font-bold uppercase tracking-[0.2em] py-3.5 cursor-pointer rounded-none"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="border-t border-neutral-200 mt-8 pt-6 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-900 font-mono text-[9px] uppercase tracking-widest transition-colors cursor-pointer"
            >
              ← Return to Magazine
            </button>
            
            <div className="mt-6 bg-neutral-50 p-4 border border-neutral-200 rounded-none text-left">
              <span className="font-mono text-[8px] uppercase tracking-wider text-accent font-semibold block mb-1">
                DEMO CREDENTIALS:
              </span>
              <div className="font-mono text-[9px] text-neutral-600 space-y-0.5">
                <div>Email: <span className="text-neutral-900 select-all font-semibold">admin@eloquence.com</span></div>
                <div>Password: <span className="text-neutral-900 select-all font-semibold">admin123</span></div>
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
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'avatar' | 'logo' | 'storeLogo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'image') setUploadingImage(true);
    if (target === 'avatar') setUploadingAvatar(true);
    if (target === 'logo') setUploadingLogo(true);
    if (target === 'storeLogo') setUploadingStoreLogo(true);

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
          if (target === 'storeLogo') setStoreLogo(data.url);
        } else {
          alert('Upload failed: ' + (data.error || 'Unknown error'));
        }
        
        setUploadingImage(false);
        setUploadingAvatar(false);
        setUploadingLogo(false);
        setUploadingStoreLogo(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('File upload error', err);
      alert('Upload failed: ' + err.message);
      setUploadingImage(false);
      setUploadingAvatar(false);
      setUploadingLogo(false);
      setUploadingStoreLogo(false);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-200 pb-6 mb-10 gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent flex items-center gap-1.5 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            ÉLOQUENCE EDITORIAL ENGINE
          </span>
          <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-tight text-neutral-900 font-medium">
            Admin Control Center
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-4 py-2 border border-red-200 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer text-red-600 font-bold"
          >
            Logout
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-4 py-2 border border-neutral-200 hover:border-neutral-400 hover:text-accent hover:bg-neutral-50 transition-all cursor-pointer text-neutral-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Magazine
          </button>
        </div>
      </div>

      {/* Admin Tab Nav */}
      <div className="flex border-b border-neutral-200 mb-8 overflow-x-auto gap-1">
        <button
          onClick={() => { setActiveTab('articles'); setIsCreating(false); setEditingArticle(null); }}
          className={`flex items-center gap-2 px-6 py-4 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
            activeTab === 'articles' && !isCreating && !editingArticle
              ? 'border-accent text-accent bg-neutral-100'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Manage Articles ({articles.length})
        </button>
        <button
          onClick={() => { setActiveTab('categories'); setIsCreating(false); setEditingArticle(null); }}
          className={`flex items-center gap-2 px-6 py-4 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
            activeTab === 'categories'
              ? 'border-accent text-accent bg-neutral-100'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Grid className="w-4 h-4" />
          Categories ({categories.length})
        </button>
        <button
          onClick={() => { setActiveTab('stores'); setIsCreatingStore(false); setEditingStore(null); resetStoreForm(); }}
          className={`flex items-center gap-2 px-6 py-4 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
            activeTab === 'stores'
              ? 'border-accent text-accent bg-neutral-100'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Grid className="w-4 h-4 text-[#a855f7]" />
          Stores Studio ({stores.length})
        </button>
        <button
          onClick={() => { setActiveTab('coupons'); setIsCreatingCoupon(false); setEditingCoupon(null); resetCouponForm(); }}
          className={`flex items-center gap-2 px-6 py-4 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
            activeTab === 'coupons'
              ? 'border-accent text-accent bg-neutral-100'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#a855f7]" />
          Coupons Studio ({coupons.length})
        </button>
        <button
          onClick={() => { setActiveTab('settings'); setIsCreating(false); setEditingArticle(null); }}
          className={`flex items-center gap-2 px-6 py-4 font-mono text-[10px] uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
            activeTab === 'settings'
              ? 'border-accent text-accent bg-neutral-100'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
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
                  <h3 className="font-serif text-lg uppercase text-neutral-900 tracking-wider font-semibold">
                    Published Essays
                  </h3>
                  <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-[#121110] text-white hover:bg-accent transition-all font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 cursor-pointer rounded-none"
                  >
                    <Plus className="w-4 h-4" />
                    Write New Article
                  </button>
                </div>

                <div className="border border-neutral-200 bg-white overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-neutral-200 font-mono text-[9px] uppercase tracking-widest text-neutral-500 bg-neutral-50">
                        <th className="py-4 px-6">Article</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Author</th>
                        <th className="py-4 px-6">Attributes</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {articles.map((art) => (
                        <tr key={art.id} className="hover:bg-neutral-50/80 transition-colors text-xs text-neutral-700">
                          <td className="py-4 px-6 flex items-center gap-4 min-w-[280px]">
                            <img
                              src={art.image}
                              alt={art.title}
                              className="w-12 h-12 object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-serif font-bold text-neutral-900 line-clamp-1 hover:text-accent">
                                {art.title}
                              </span>
                              <span className="text-neutral-500 font-mono text-[9px] mt-0.5">
                                {art.date || 'No Date'} · {art.readTime || '3 min'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 border border-neutral-200 bg-neutral-50 font-mono text-[9px] uppercase tracking-wider text-accent rounded-none">
                              {art.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <img
                                src={art.author.avatar}
                                alt={art.author.name}
                                className="w-6 h-6 rounded-full shrink-0 object-cover border border-neutral-200"
                              />
                              <div className="flex flex-col">
                                <span className="text-neutral-800 font-medium">{art.author.name}</span>
                                <span className="text-[9px] text-neutral-500 line-clamp-1">{art.author.role}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 min-w-[150px]">
                            <div className="flex flex-wrap gap-1.5">
                              {art.featured && (
                                <span className="bg-accent/10 text-accent border border-accent/20 text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-widest">
                                  Featured
                                </span>
                              )}
                              {art.trending && (
                                <span className="bg-neutral-100 text-neutral-700 border border-neutral-300 text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-widest">
                                  Trending
                                </span>
                              )}
                              {!art.featured && !art.trending && (
                                <span className="text-neutral-400 italic text-[10px]">Standard</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2 min-w-[120px]">
                            <button
                              onClick={() => handleOpenEdit(art)}
                              className="p-1.5 border border-neutral-200 hover:border-neutral-400 hover:text-accent text-neutral-700 transition-all inline-block cursor-pointer"
                              title="Edit Article"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art.id)}
                              className="p-1.5 border border-neutral-200 hover:border-red-500 hover:text-red-500 text-neutral-700 transition-all inline-block cursor-pointer"
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
              <div className="bg-white border border-neutral-200 p-6 md:p-10 max-w-4xl mx-auto shadow-sm">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-4 mb-6">
                  <h3 className="font-serif text-xl uppercase tracking-wider text-neutral-900 font-semibold">
                    {isCreating ? 'Write Elegant Essay' : `Edit: ${title}`}
                  </h3>
                  <button
                    onClick={() => { setIsCreating(false); setEditingArticle(null); }}
                    className="p-1 text-neutral-500 hover:text-accent transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveArticle} className="space-y-6 font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Core properties */}
                    <div className="space-y-4">
                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-1.5">
                          Article Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. The Architecture of Stillness"
                          className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-sm focus:outline-none focus:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-1.5">
                          Subtitle (Optional)
                        </label>
                        <input
                          type="text"
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                          placeholder="e.g. How minimalist design shapes our cognitive peace."
                          className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-sm focus:outline-none focus:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-1.5">
                          Summary / Abstract *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          placeholder="Provide a sophisticated 2-3 sentence overview..."
                          className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-sm focus:outline-none focus:ring-0 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-1.5">
                            Category *
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-sm focus:outline-none focus:ring-0"
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
                            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-700">Featured Hero</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={trending}
                              onChange={(e) => setTrending(e.target.checked)}
                              className="accent-accent"
                            />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-700">Trending</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Images and Authors */}
                    <div className="space-y-4">
                      {/* Cover Image Upload */}
                      <div>
                        <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-1.5">
                          Cover Image URL or File Upload *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="grow bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-xs focus:outline-none focus:ring-0"
                          />
                          <label className="bg-[#121110] text-white hover:bg-accent px-4 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-widest font-bold cursor-pointer shrink-0">
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
                          <div className="mt-2 relative h-20 w-full overflow-hidden border border-neutral-200 bg-neutral-100">
                            <img src={image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>

                      {/* Author Details Block */}
                      <div className="border border-neutral-200 bg-neutral-50 p-4 space-y-3">
                        <span className="font-mono text-[9px] tracking-wider text-accent block border-b border-neutral-200 pb-2 font-semibold">
                          AUTHOR INFO
                        </span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-mono text-[8px] uppercase tracking-widest text-neutral-500 mb-1">
                              Author Name
                            </label>
                            <input
                              type="text"
                              value={authorName}
                              onChange={(e) => setAuthorName(e.target.value)}
                              className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-[8px] uppercase tracking-widest text-neutral-500 mb-1">
                              Author Role
                            </label>
                            <input
                              type="text"
                              value={authorRole}
                              onChange={(e) => setAuthorRole(e.target.value)}
                              className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-mono text-[8px] uppercase tracking-widest text-neutral-500 mb-1">
                            Author Avatar Image (URL or Upload)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={authorAvatar}
                              onChange={(e) => setAuthorAvatar(e.target.value)}
                              className="grow bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-3 py-2 text-xs focus:outline-none"
                            />
                            <label className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-3 flex items-center justify-center gap-1 font-mono text-[8px] uppercase tracking-widest font-bold cursor-pointer shrink-0">
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
                            <img src={authorAvatar} className="mt-1 w-6 h-6 rounded-full object-cover border border-neutral-200" referrerPolicy="no-referrer" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Multi-paragraph Content Editor */}
                  <div className="border-t border-neutral-200 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                        Essay Content / Paragraphs *
                      </span>
                      <button
                        type="button"
                        onClick={handleAddParagraph}
                        className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-accent hover:text-white bg-transparent border border-accent/30 hover:bg-accent px-3 py-1.5 transition-all cursor-pointer font-bold"
                      >
                        <Plus className="w-3 h-3" /> Add Paragraph
                      </button>
                    </div>

                    <div className="space-y-4">
                      {content.map((pText, idx) => (
                        <div key={idx} className="relative group">
                          <div className="flex items-center justify-between font-mono text-[8px] text-neutral-400 uppercase tracking-widest mb-1 pl-1">
                            <span>Paragraph #{idx + 1}</span>
                            {content.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveParagraph(idx)}
                                className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
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
                            className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-sm focus:outline-none focus:ring-0 leading-relaxed font-light"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit bar */}
                  <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6">
                    <button
                      type="button"
                      onClick={() => { setIsCreating(false); setEditingArticle(null); }}
                      className="px-6 py-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-mono text-[10px] uppercase tracking-widest cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 bg-[#121110] text-white hover:bg-accent transition-all font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer rounded-none disabled:opacity-50"
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
          <div className="max-w-2xl mx-auto w-full bg-white border border-neutral-200 p-6 md:p-8 shadow-sm">
            <h3 className="font-serif text-lg uppercase text-neutral-900 tracking-wider border-b border-neutral-200 pb-4 mb-6 font-semibold">
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
                className="grow bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#121110] text-white hover:bg-accent transition-all font-mono text-[10px] font-bold uppercase tracking-widest px-6 py-3 cursor-pointer shrink-0 rounded-none"
              >
                Create Category
              </button>
            </form>

            <span className="font-mono text-[9px] tracking-widest uppercase text-neutral-400 block mb-4">
              Active Magazine Categories
            </span>

            <div className="divide-y divide-neutral-100 border border-neutral-200 bg-white">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center justify-between py-4 px-6 hover:bg-neutral-50/50 transition-all">
                  <span className="font-serif text-base text-neutral-900 tracking-wide uppercase font-medium">
                    {cat}
                  </span>
                  <div className="flex items-center gap-4">
                    {['Wellness', 'Fashion', 'Travel', 'Culture', 'Lifestyle'].includes(cat) && (
                      <span className="font-mono text-[8px] uppercase tracking-wider text-accent/80 border border-accent/20 bg-accent/5 px-2 py-0.5">
                        Core System
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
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
          <div className="max-w-2xl mx-auto w-full bg-white border border-neutral-200 p-6 md:p-8 shadow-sm">
            <h3 className="font-serif text-lg uppercase text-neutral-900 tracking-wider border-b border-neutral-200 pb-4 mb-6 font-semibold">
              Branding & Global Settings
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-6 font-sans">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-1.5">
                  Magazine Title *
                </label>
                <input
                  type="text"
                  required
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  placeholder="e.g. ÉLOQUENCE"
                  className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-1.5">
                  Subtext Slogan
                </label>
                <input
                  type="text"
                  value={logoSubtext}
                  onChange={(e) => setLogoSubtext(e.target.value)}
                  placeholder="e.g. Journal d'un esprit calme"
                  className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-1.5">
                  Browser Tab Title (metadata Title)
                </label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="e.g. ÉLOQUENCE — Journal d'un esprit calme"
                  className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              {/* Dynamic Logo Image Upload */}
              <div className="border border-neutral-200 bg-neutral-50 p-5">
                <span className="font-mono text-[9px] tracking-wider text-accent block border-b border-neutral-200 pb-2 mb-4 font-semibold">
                  IMAGE LOGO OVERRIDE (OPTIONAL)
                </span>
                
                <p className="text-neutral-500 text-[10px] leading-relaxed mb-4">
                  If you upload a logo image here, it will replace the typography text logo in the center of the navigation header. Use a light or transparent SVG/PNG logo for best results.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Enter image URL or upload directly..."
                    className="grow bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-3 py-2 text-xs focus:outline-none"
                  />
                  <label className="bg-[#121110] text-white hover:bg-accent px-4 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-widest font-bold cursor-pointer shrink-0">
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
                  <div className="mt-4 flex items-center gap-4 bg-white p-3 border border-neutral-200">
                    <div className="h-12 w-24 flex items-center justify-center bg-neutral-100 border border-neutral-200 p-1">
                      <img src={logoUrl} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col gap-1 grow">
                      <span className="text-[10px] font-mono text-neutral-800 select-all overflow-hidden text-ellipsis line-clamp-1">{logoUrl}</span>
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="text-[9px] text-red-500 hover:text-red-700 self-start cursor-pointer font-bold"
                      >
                        Remove Logo Image Override
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-neutral-200 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-[#121110] text-white hover:bg-accent transition-all font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer rounded-none disabled:opacity-50"
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

        {/* TAB 4: STORES STUDIO */}
        {activeTab === 'stores' && (
          <div>
            {!isCreatingStore && !editingStore ? (
              /* Stores List View */
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-lg uppercase text-neutral-900 tracking-wider font-semibold">
                    Affiliated Store Registries
                  </h3>
                  <button
                    onClick={() => { setIsCreatingStore(true); resetStoreForm(); }}
                    className="flex items-center gap-2 bg-[#a855f7] hover:bg-[#9333ea] text-white transition-all font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 cursor-pointer rounded-none"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Store
                  </button>
                </div>

                <div className="border border-neutral-200 bg-white overflow-x-auto shadow-sm">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-neutral-200 font-mono text-[9px] uppercase tracking-widest text-neutral-500 bg-neutral-50">
                        <th className="py-4 px-6">Logo</th>
                        <th className="py-4 px-6">Store Name</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Target URL</th>
                        <th className="py-4 px-6">Promo Count</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {stores.map((store) => {
                        const storeCoupons = coupons.filter(c => c.storeId === store.id);
                        return (
                          <tr key={store.id} className="hover:bg-neutral-50/80 transition-colors text-xs text-neutral-700">
                            <td className="py-4 px-6">
                              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 p-1 flex items-center justify-center">
                                {store.logo ? (
                                  <img src={store.logo} className="max-h-full max-w-full object-contain filter grayscale" referrerPolicy="no-referrer" />
                                ) : (
                                  <span className="font-serif text-sm font-bold text-neutral-400">{store.name.substring(0,2).toUpperCase()}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 font-semibold text-neutral-900">{store.name}</td>
                            <td className="py-4 px-6">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-accent border border-accent/20 px-2 py-0.5 bg-accent/5">
                                {store.category}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-neutral-500 font-mono text-[11px] truncate max-w-[200px]">{store.targetUrl}</td>
                            <td className="py-4 px-6 text-[#a855f7] font-mono font-semibold">{storeCoupons.length} Vouchers</td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex justify-end gap-2.5">
                                <button
                                  onClick={() => handleOpenEditStore(store)}
                                  className="p-1.5 text-neutral-400 hover:text-accent transition-colors cursor-pointer"
                                  title="Edit Store"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStore(store.id)}
                                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                                  title="Delete Store"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {stores.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                            No store registries created yet. Create a store first!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Create/Edit Store Form */
              <div className="bg-white border border-neutral-200 p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-4 mb-6">
                  <h3 className="font-serif text-lg text-neutral-900 uppercase tracking-wider font-semibold">
                    {isCreatingStore ? 'Create Curated Registry' : `Edit Registry: ${storeName}`}
                  </h3>
                  <button
                    onClick={() => { setIsCreatingStore(false); setEditingStore(null); resetStoreForm(); }}
                    className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveStore} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                        Store Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Nordstrom"
                        className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                        Registry Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeCategory}
                        onChange={(e) => setStoreCategory(e.target.value)}
                        placeholder="e.g. Fashion, Wellness, Home"
                        className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                        Affiliate/Target Store URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={storeTargetUrl}
                        onChange={(e) => setStoreTargetUrl(e.target.value)}
                        placeholder="https://www.nordstrom.com"
                        className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-xs focus:outline-none font-mono"
                      />
                    </div>
                    
                    {/* Store Logo Image Upload */}
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                        Store Logo URL or Upload
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={storeLogo}
                          onChange={(e) => setStoreLogo(e.target.value)}
                          placeholder="Image URL or upload..."
                          className="grow bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-3 py-2 text-xs focus:outline-none"
                        />
                        <label className="bg-[#121110] text-white hover:bg-accent px-4 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-widest font-bold cursor-pointer shrink-0">
                          {uploadingStoreLogo ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'storeLogo')}
                            disabled={uploadingStoreLogo}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {storeLogo && (
                    <div className="flex items-center gap-4 bg-white p-3 border border-neutral-200 max-w-sm shadow-xs">
                      <div className="h-12 w-12 flex items-center justify-center bg-neutral-100 border border-neutral-200 p-1">
                        <img src={storeLogo} className="max-h-full max-w-full object-contain filter grayscale" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 truncate grow">{storeLogo}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                      Store Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      placeholder="Enter a brief, premium description of what they sell..."
                      className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Featured Checkbox */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStoreFeatured(!storeFeatured)}
                      className="text-[#666] hover:text-neutral-900 cursor-pointer transition-colors"
                    >
                      {storeFeatured ? (
                        <ToggleRight className="w-8 h-8 text-[#a855f7]" />
                      ) : (
                        <ToggleLeft className="w-8 h-8" />
                      )}
                    </button>
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-neutral-800 font-semibold">
                        Feature this Store
                      </span>
                      <span className="text-neutral-500 text-[9px] block">
                        Will prioritize this registry on front catalog lists
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6">
                    <button
                      type="button"
                      onClick={() => { setIsCreatingStore(false); setEditingStore(null); resetStoreForm(); }}
                      className="px-6 py-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-600 transition-all font-mono text-[9px] uppercase tracking-widest cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white transition-all font-mono text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer rounded-none disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Save Store Registry
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        {/* TAB 5: COUPONS STUDIO */}
        {activeTab === 'coupons' && (
          <div>
            {!isCreatingCoupon && !editingCoupon ? (
              /* Coupons List View */
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-lg uppercase text-neutral-900 tracking-wider font-semibold">
                    Vouchers and Promo Codes List
                  </h3>
                  <button
                    onClick={() => {
                      if (stores.length === 0) {
                        alert('Please create at least one Store before creating a Coupon!');
                        return;
                      }
                      setIsCreatingCoupon(true);
                      resetCouponForm();
                      setCouponStoreId(stores[0].id); // default select first store
                    }}
                    className="flex items-center gap-2 bg-[#a855f7] hover:bg-[#9333ea] text-white transition-all font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 cursor-pointer rounded-none"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Coupon
                  </button>
                </div>

                <div className="border border-neutral-200 bg-white overflow-x-auto shadow-sm">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-neutral-200 font-mono text-[9px] uppercase tracking-widest text-neutral-500 bg-neutral-50">
                        <th className="py-4 px-6">Assigned Store</th>
                        <th className="py-4 px-6">Discount</th>
                        <th className="py-4 px-6">Promo Title</th>
                        <th className="py-4 px-6">Type</th>
                        <th className="py-4 px-6">Promo Code</th>
                        <th className="py-4 px-6">Uses Count</th>
                        <th className="py-4 px-6">Verified</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {coupons.map((coupon) => {
                        const store = stores.find(s => s.id === coupon.storeId);
                        return (
                          <tr key={coupon.id} className="hover:bg-neutral-50/80 transition-colors text-xs text-neutral-700">
                            <td className="py-4 px-6 font-semibold text-neutral-900">
                              {store ? store.name : <span className="text-red-500 italic font-semibold">Unknown Store</span>}
                            </td>
                            <td className="py-4 px-6 font-mono text-emerald-600 font-bold">{coupon.discount}</td>
                            <td className="py-4 px-6 text-neutral-800 truncate max-w-[200px]">{coupon.title}</td>
                            <td className="py-4 px-6">
                              <span className={`font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                                coupon.type === 'code' ? 'bg-[#7c3aed]/10 text-[#7c3aed] border border-[#a855f7]/30 font-semibold' : 'bg-neutral-100 text-neutral-600'
                              }`}>
                                {coupon.type}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-mono text-purple-600 select-all font-bold">
                              {coupon.code || <span className="text-neutral-300">-</span>}
                            </td>
                            <td className="py-4 px-6 font-mono text-neutral-500">{coupon.usedCount || 0} clicks</td>
                            <td className="py-4 px-6 font-mono">
                              {coupon.verified ? (
                                <span className="text-emerald-600 font-bold">Verified</span>
                              ) : (
                                <span className="text-neutral-400">Standard</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex justify-end gap-2.5">
                                <button
                                  onClick={() => handleOpenEditCoupon(coupon)}
                                  className="p-1.5 text-neutral-400 hover:text-accent transition-colors cursor-pointer"
                                  title="Edit Coupon"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                                  title="Delete Coupon"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {coupons.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-10 text-center font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                            No coupons listed yet. Create a coupon and map it to a store registry!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Create/Edit Coupon Form */
              <div className="bg-white border border-neutral-200 p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-4 mb-6">
                  <h3 className="font-serif text-lg text-neutral-900 uppercase tracking-wider font-semibold">
                    {isCreatingCoupon ? 'Deploy Promotional Coupon' : 'Edit Coupon Listing'}
                  </h3>
                  <button
                    onClick={() => { setIsCreatingCoupon(false); setEditingCoupon(null); resetCouponForm(); }}
                    className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCoupon} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Store Selection Dropdown: REQUIRED BY USER SCENARIO */}
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                        Select Target Store Registry *
                      </label>
                      <select
                        required
                        value={couponStoreId}
                        onChange={(e) => setCouponStoreId(e.target.value)}
                        className="w-full bg-[#fcfbf9] border border-neutral-300 text-neutral-900 px-4 py-3 text-xs focus:outline-none cursor-pointer"
                      >
                        {stores.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                        ))}
                      </select>
                      <span className="text-[8.5px] font-mono text-purple-600 mt-1 block font-semibold">
                        Stores must be created first before you can associate coupons.
                      </span>
                    </div>

                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                        Discount Text * (e.g. 50% OFF, $20 OFF, FREE SHIP)
                      </label>
                      <input
                        type="text"
                        required
                        value={couponDiscount}
                        onChange={(e) => setCouponDiscount(e.target.value)}
                        placeholder="e.g. 50% OFF"
                        className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-xs focus:outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                        Coupon Type *
                      </label>
                      <select
                        required
                        value={couponType}
                        onChange={(e) => setCouponType(e.target.value as 'code' | 'deal')}
                        className="w-full bg-[#fcfbf9] border border-neutral-300 text-neutral-900 px-4 py-3 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="code">Code (Requires a promo code to copy)</option>
                        <option value="deal">Deal (Applied automatically, no code needed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                        Promo Code {couponType === 'code' ? '*' : '(Optional)'}
                      </label>
                      <input
                        type="text"
                        required={couponType === 'code'}
                        disabled={couponType === 'deal'}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. NORDST50"
                        className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-xs focus:outline-none font-mono uppercase disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                        Promo Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={couponTitle}
                        onChange={(e) => setCouponTitle(e.target.value)}
                        placeholder="e.g. 50% Off Independence Day Sale"
                        className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                        Target Link Override (Optional, defaults to Store link)
                      </label>
                      <input
                        type="url"
                        value={couponTargetUrl}
                        onChange={(e) => setCouponTargetUrl(e.target.value)}
                        placeholder="https://www.nordstrom.com/sale"
                        className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-xs focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500 mb-2">
                      Coupon Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={couponDescription}
                      onChange={(e) => setCouponDescription(e.target.value)}
                      placeholder="e.g. Save up to half-off on select summer styles, activewear, and luxury designer lines..."
                      className="w-full bg-[#fcfbf9] border border-neutral-300 focus:border-accent text-neutral-900 px-4 py-3 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Verified Checkbox */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCouponVerified(!couponVerified)}
                      className="text-[#666] hover:text-neutral-900 cursor-pointer transition-colors"
                    >
                      {couponVerified ? (
                        <ToggleRight className="w-8 h-8 text-[#a855f7]" />
                      ) : (
                        <ToggleLeft className="w-8 h-8" />
                      )}
                    </button>
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-neutral-800 font-semibold">
                        Tested & Verified
                      </span>
                      <span className="text-neutral-500 text-[9px] block">
                        Shows a "Verified" badge next to this deal
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6">
                    <button
                      type="button"
                      onClick={() => { setIsCreatingCoupon(false); setEditingCoupon(null); resetCouponForm(); }}
                      className="px-6 py-3 border border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400 transition-all font-mono text-[9px] uppercase tracking-widest cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white transition-all font-mono text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer rounded-none disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Deploy Coupon
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
