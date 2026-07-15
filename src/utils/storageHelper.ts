import { Article, Store, Coupon } from '../types';
import { articles as initialArticles } from '../data/articles';

// Helper function to dynamically migrate any stale local upload paths to Unsplash URLs on Vercel/production
function migrateUploads(data: any): any {
  if (!data) return data;
  let str = JSON.stringify(data);
  const urlMappings: { [key: string]: string } = {
    '/uploads/kinetic_resistance.jpg': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    'uploads/kinetic_resistance.jpg': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    '/uploads/fabric_resistance_bands.jpg': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    'uploads/fabric_resistance_bands.jpg': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    '/uploads/cork_yoga_mat.jpg': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80',
    'uploads/cork_yoga_mat.jpg': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80',
    '/uploads/smart_water_bottle.jpg': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    'uploads/smart_water_bottle.jpg': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    '/uploads/breath_pilates.jpg': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    'uploads/breath_pilates.jpg': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    '/uploads/somatic_running.jpg': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
    'uploads/somatic_running.jpg': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80'
  };

  let migrated = false;
  Object.keys(urlMappings).forEach(key => {
    if (str.includes(key)) {
      str = str.split(key).join(urlMappings[key]);
      migrated = true;
    }
  });

  return migrated ? JSON.parse(str) : data;
}

// Default Stores matching server.ts
const defaultStores: Store[] = [
  {
    id: 'store-1',
    name: 'Nordstrom',
    slug: 'nordstrom',
    logo: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=120&q=80',
    description: 'Premium designer apparel, luxury footwear, fine jewelry, beauty products, and homeware.',
    targetUrl: 'https://www.nordstrom.com',
    category: 'Fashion',
    featured: true
  },
  {
    id: 'store-2',
    name: 'Zara',
    slug: 'zara',
    logo: 'https://images.unsplash.com/photo-1520004430778-f8389bf0bc34?auto=format&fit=crop&w=120&q=80',
    description: 'Sleek, minimalist fast-fashion garments and timeless modern aesthetics.',
    targetUrl: 'https://www.zara.com',
    category: 'Fashion',
    featured: true
  },
  {
    id: 'store-3',
    name: 'Muji',
    slug: 'muji',
    logo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=120&q=80',
    description: 'Decelerated lifestyle designs, modular organizational items, and understated apparel.',
    targetUrl: 'https://www.muji.com',
    category: 'Wellness & Home',
    featured: true
  }
];

// Default Coupons matching server.ts
const defaultCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    storeId: 'store-1',
    title: 'Up to 60% Off Designer Sale & Clearance',
    discount: 'UP TO 60% OFF',
    type: 'deal',
    description: 'Save on premium designer apparel, luxury footwear, activewear, beauty, and homeware during the active markdowns event. No code needed.',
    targetUrl: 'https://www.nordstrom.com/sale',
    verified: true,
    usedCount: 6831
  },
  {
    id: 'coupon-2',
    storeId: 'store-1',
    title: 'Join The Nordy Club for a $10 Bonus Note',
    discount: '$10 BONUS',
    type: 'deal',
    description: 'Sign up for free to join The Nordy Club. Earn reward points on all purchases and unlock a $10 bonus promotional Note.',
    targetUrl: 'https://www.nordstrom.com/nordy-club',
    verified: true,
    usedCount: 4120
  },
  {
    id: 'coupon-3',
    storeId: 'store-2',
    title: 'Get free delivery on your first order',
    discount: 'FREE SHIP',
    type: 'code',
    code: 'ZARAFREE',
    description: 'Unlock free standard shipping on orders containing new season styles.',
    targetUrl: 'https://www.zara.com',
    verified: true,
    usedCount: 830
  },
  {
    id: 'coupon-4',
    storeId: 'store-3',
    title: '15% Off Your Entire Minimalist Homeware Purchase',
    discount: '15% OFF',
    type: 'code',
    code: 'MUJIMIN15',
    description: 'Discover quiet organization solutions. Enter code to save 15%.',
    targetUrl: 'https://www.muji.com',
    verified: true,
    usedCount: 3042
  }
];

const defaultSettings = {
  logoText: 'ÉLOQUENCE',
  logoSubtext: "Journal d'un esprit calme",
  siteTitle: "ÉLOQUENCE — Journal d'un esprit calme",
  logoUrl: ''
};

const defaultCategories = ['Wellness', 'Fashion', 'Travel', 'Culture', 'Lifestyle'];

// Check if response is valid JSON
async function safeJsonParse(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON response: ${text.substring(0, 50)}...`);
  }
}

export const storageService = {
  // --- ARTICLES ---
  async getArticles(): Promise<Article[]> {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await safeJsonParse(res);
        const migratedData = migrateUploads(data);
        localStorage.setItem('eloquence_articles', JSON.stringify(migratedData));
        return migratedData;
      }
    } catch (e) {
      console.warn('API error fetching articles, loading from localStorage:', e);
    }
    const local = localStorage.getItem('eloquence_articles');
    if (local) {
      return migrateUploads(JSON.parse(local));
    }
    const migratedInitial = migrateUploads(initialArticles);
    localStorage.setItem('eloquence_articles', JSON.stringify(migratedInitial));
    return migratedInitial;
  },

  async saveArticle(article: any, editingId?: string): Promise<Article> {
    const payload = {
      ...article,
      id: editingId || Date.now().toString(),
      date: article.date || new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
      })
    };

    try {
      const url = editingId ? `/api/articles/${editingId}` : '/api/articles';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
      });
      if (res.ok) {
        const data = await safeJsonParse(res);
        // Sync to local
        await this.getArticles();
        return data;
      }
    } catch (e) {
      console.warn('API error saving article, saving locally to localStorage:', e);
    }

    // Save locally
    const currentArticles = await this.getArticles();
    let updatedArticles: Article[];
    if (editingId) {
      updatedArticles = currentArticles.map(a => a.id === editingId ? { ...a, ...payload } : a);
    } else {
      updatedArticles = [payload, ...currentArticles];
    }
    localStorage.setItem('eloquence_articles', JSON.stringify(updatedArticles));
    return payload;
  },

  async deleteArticle(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await this.getArticles();
        return true;
      }
    } catch (e) {
      console.warn('API error deleting article, deleting locally:', e);
    }

    const currentArticles = await this.getArticles();
    const updatedArticles = currentArticles.filter(a => a.id !== id);
    localStorage.setItem('eloquence_articles', JSON.stringify(updatedArticles));
    return true;
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<string[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await safeJsonParse(res);
        localStorage.setItem('eloquence_categories', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('API error fetching categories, loading from localStorage:', e);
    }
    const local = localStorage.getItem('eloquence_categories');
    if (local) {
      return JSON.parse(local);
    }
    localStorage.setItem('eloquence_categories', JSON.stringify(defaultCategories));
    return defaultCategories;
  },

  async saveCategory(category: string): Promise<string[]> {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      if (res.ok) {
        const data = await safeJsonParse(res);
        localStorage.setItem('eloquence_categories', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('API error saving category, saving locally:', e);
    }

    const current = await this.getCategories();
    const trimmed = category.trim();
    if (!current.includes(trimmed)) {
      current.push(trimmed);
      localStorage.setItem('eloquence_categories', JSON.stringify(current));
    }
    return current;
  },

  async deleteCategory(category: string): Promise<string[]> {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(category)}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await safeJsonParse(res);
        localStorage.setItem('eloquence_categories', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('API error deleting category, deleting locally:', e);
    }

    const current = await this.getCategories();
    const updated = current.filter(c => c !== category);
    localStorage.setItem('eloquence_categories', JSON.stringify(updated));
    return updated;
  },

  // --- SITE SETTINGS ---
  async getSettings(): Promise<any> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await safeJsonParse(res);
        localStorage.setItem('eloquence_settings', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('API error fetching settings, loading from localStorage:', e);
    }
    const local = localStorage.getItem('eloquence_settings');
    if (local) {
      return JSON.parse(local);
    }
    localStorage.setItem('eloquence_settings', JSON.stringify(defaultSettings));
    return defaultSettings;
  },

  async saveSettings(settings: any): Promise<any> {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const data = await safeJsonParse(res);
        localStorage.setItem('eloquence_settings', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('API error saving settings, saving locally:', e);
    }

    localStorage.setItem('eloquence_settings', JSON.stringify(settings));
    return settings;
  },

  // --- STORES ---
  async getStores(): Promise<Store[]> {
    try {
      const res = await fetch('/api/stores');
      if (res.ok) {
        const data = await safeJsonParse(res);
        const migratedData = migrateUploads(data);
        localStorage.setItem('eloquence_stores', JSON.stringify(migratedData));
        return migratedData;
      }
    } catch (e) {
      console.warn('API error fetching stores, loading from localStorage:', e);
    }
    const local = localStorage.getItem('eloquence_stores');
    if (local) {
      return migrateUploads(JSON.parse(local));
    }
    const migratedStores = migrateUploads(defaultStores);
    localStorage.setItem('eloquence_stores', JSON.stringify(migratedStores));
    return migratedStores;
  },

  async saveStore(store: any, editingId?: string): Promise<Store> {
    const slug = store.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
    const payload = {
      ...store,
      id: editingId || 'store-' + Date.now().toString(),
      slug
    };

    try {
      const url = editingId ? `/api/stores/${editingId}` : '/api/stores';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store)
      });
      if (res.ok) {
        const data = await safeJsonParse(res);
        await this.getStores();
        return data;
      }
    } catch (e) {
      console.warn('API error saving store, saving locally to localStorage:', e);
    }

    const currentStores = await this.getStores();
    let updatedStores: Store[];
    if (editingId) {
      updatedStores = currentStores.map(s => s.id === editingId ? { ...s, ...payload } : s);
    } else {
      updatedStores = [...currentStores, payload];
    }
    localStorage.setItem('eloquence_stores', JSON.stringify(updatedStores));
    return payload;
  },

  async deleteStore(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/stores/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await this.getStores();
        // Trigger coupon sync if server-side handles cascaded delete
        await this.getCoupons();
        return true;
      }
    } catch (e) {
      console.warn('API error deleting store, deleting locally:', e);
    }

    const currentStores = await this.getStores();
    const updatedStores = currentStores.filter(s => s.id !== id);
    localStorage.setItem('eloquence_stores', JSON.stringify(updatedStores));

    // Client-side cascaded delete for coupons
    const currentCoupons = await this.getCoupons();
    const updatedCoupons = currentCoupons.filter(c => c.storeId !== id);
    localStorage.setItem('eloquence_coupons', JSON.stringify(updatedCoupons));

    return true;
  },

  // --- COUPONS ---
  async getCoupons(): Promise<Coupon[]> {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await safeJsonParse(res);
        const migratedData = migrateUploads(data);
        localStorage.setItem('eloquence_coupons', JSON.stringify(migratedData));
        return migratedData;
      }
    } catch (e) {
      console.warn('API error fetching coupons, loading from localStorage:', e);
    }
    const local = localStorage.getItem('eloquence_coupons');
    if (local) {
      return migrateUploads(JSON.parse(local));
    }
    const migratedCoupons = migrateUploads(defaultCoupons);
    localStorage.setItem('eloquence_coupons', JSON.stringify(migratedCoupons));
    return migratedCoupons;
  },

  async saveCoupon(coupon: any, editingId?: string): Promise<Coupon> {
    const payload = {
      ...coupon,
      id: editingId || 'coupon-' + Date.now().toString(),
      usedCount: coupon.usedCount || 0
    };

    try {
      const url = editingId ? `/api/coupons/${editingId}` : '/api/coupons';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon)
      });
      if (res.ok) {
        const data = await safeJsonParse(res);
        await this.getCoupons();
        return data;
      }
    } catch (e) {
      console.warn('API error saving coupon, saving locally to localStorage:', e);
    }

    const currentCoupons = await this.getCoupons();
    let updatedCoupons: Coupon[];
    if (editingId) {
      updatedCoupons = currentCoupons.map(c => c.id === editingId ? { ...c, ...payload } : c);
    } else {
      updatedCoupons = [...currentCoupons, payload];
    }
    localStorage.setItem('eloquence_coupons', JSON.stringify(updatedCoupons));
    return payload;
  },

  async deleteCoupon(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await this.getCoupons();
        return true;
      }
    } catch (e) {
      console.warn('API error deleting coupon, deleting locally:', e);
    }

    const currentCoupons = await this.getCoupons();
    const updatedCoupons = currentCoupons.filter(c => c.id !== id);
    localStorage.setItem('eloquence_coupons', JSON.stringify(updatedCoupons));
    return true;
  },

  async useCoupon(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/coupons/${id}/use`, { method: 'POST' });
      if (res.ok) {
        await this.getCoupons();
        return true;
      }
    } catch (e) {
      console.warn('API error recording coupon usage, updating locally:', e);
    }

    const currentCoupons = await this.getCoupons();
    const updatedCoupons = currentCoupons.map(c => {
      if (c.id === id) {
        return { ...c, usedCount: (c.usedCount || 0) + 1 };
      }
      return c;
    });
    localStorage.setItem('eloquence_coupons', JSON.stringify(updatedCoupons));
    return true;
  }
};
