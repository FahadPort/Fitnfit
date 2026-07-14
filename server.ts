import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { articles as defaultArticles } from './src/data/articles';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body parser size limit to support base64 image uploads
app.use(express.json({ limit: '10mb' }));

const DB_FILE = path.join(process.cwd(), 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface Database {
  articles: any[];
  categories: string[];
  settings: {
    logoText: string;
    logoSubtext: string;
    siteTitle: string;
    logoUrl: string;
  };
  stores: any[];
  coupons: any[];
}

function readDb(): Database {
  let db: any;
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading db.json, using defaults:', err);
  }

  const defaultStores = [
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

  const defaultCoupons = [
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

  if (!db) {
    db = {
      articles: defaultArticles,
      categories: ['Wellness', 'Fashion', 'Travel', 'Culture', 'Lifestyle'],
      settings: {
        logoText: 'ÉLOQUENCE',
        logoSubtext: "Journal d'un esprit calme",
        siteTitle: "ÉLOQUENCE — Journal d'un esprit calme",
        logoUrl: ''
      },
      stores: defaultStores,
      coupons: defaultCoupons
    };
    writeDb(db);
    return db;
  }

  let changed = false;
  if (!db.stores) {
    db.stores = defaultStores;
    changed = true;
  }
  if (!db.coupons) {
    db.coupons = defaultCoupons;
    changed = true;
  }
  if (changed) {
    writeDb(db);
  }

  return db;
}

function writeDb(data: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Articles CRUD endpoints
app.get('/api/articles', (req, res) => {
  const db = readDb();
  res.json(db.articles);
});

app.post('/api/articles', (req, res) => {
  try {
    const db = readDb();
    const newArticle = {
      id: Date.now().toString(),
      ...req.body,
      date: req.body.date || new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
      })
    };
    db.articles.unshift(newArticle);
    writeDb(db);
    res.status(201).json(newArticle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/articles/:id', (req, res) => {
  try {
    const db = readDb();
    const { id } = req.params;
    const index = db.articles.findIndex(a => a.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    db.articles[index] = { ...db.articles[index], ...req.body, id };
    writeDb(db);
    res.json(db.articles[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/articles/:id', (req, res) => {
  try {
    const db = readDb();
    const { id } = req.params;
    const initialLength = db.articles.length;
    db.articles = db.articles.filter(a => a.id !== id);
    if (db.articles.length === initialLength) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    writeDb(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Categories API
app.get('/api/categories', (req, res) => {
  const db = readDb();
  res.json(db.categories);
});

app.post('/api/categories', (req, res) => {
  try {
    const db = readDb();
    const { category } = req.body;
    if (!category || typeof category !== 'string') {
      res.status(400).json({ error: 'category name is required' });
      return;
    }
    const trimmed = category.trim();
    if (!db.categories.includes(trimmed)) {
      db.categories.push(trimmed);
      writeDb(db);
    }
    res.status(201).json(db.categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:category', (req, res) => {
  try {
    const db = readDb();
    const { category } = req.params;
    db.categories = db.categories.filter(c => c !== category);
    writeDb(db);
    res.json(db.categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Settings API
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json(db.settings);
});

app.post('/api/settings', (req, res) => {
  try {
    const db = readDb();
    db.settings = { ...db.settings, ...req.body };
    writeDb(db);
    res.json(db.settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Stores API
app.get('/api/stores', (req, res) => {
  const db = readDb();
  res.json(db.stores || []);
});

app.post('/api/stores', (req, res) => {
  try {
    const db = readDb();
    const newStore = {
      id: 'store-' + Date.now().toString(),
      ...req.body,
      slug: req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };
    if (!db.stores) db.stores = [];
    db.stores.push(newStore);
    writeDb(db);
    res.status(201).json(newStore);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/stores/:id', (req, res) => {
  try {
    const db = readDb();
    const { id } = req.params;
    if (!db.stores) db.stores = [];
    const index = db.stores.findIndex(s => s.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }
    db.stores[index] = { 
      ...db.stores[index], 
      ...req.body, 
      id,
      slug: req.body.name ? req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : db.stores[index].slug
    };
    writeDb(db);
    res.json(db.stores[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/stores/:id', (req, res) => {
  try {
    const db = readDb();
    const { id } = req.params;
    if (!db.stores) db.stores = [];
    db.stores = db.stores.filter(s => s.id !== id);
    if (db.coupons) {
      db.coupons = db.coupons.filter(c => c.storeId !== id);
    }
    writeDb(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Coupons API
app.get('/api/coupons', (req, res) => {
  const db = readDb();
  res.json(db.coupons || []);
});

app.post('/api/coupons', (req, res) => {
  try {
    const db = readDb();
    const newCoupon = {
      id: 'coupon-' + Date.now().toString(),
      ...req.body,
      usedCount: req.body.usedCount || 0,
      verified: req.body.verified !== undefined ? req.body.verified : true
    };
    if (!db.coupons) db.coupons = [];
    db.coupons.push(newCoupon);
    writeDb(db);
    res.status(201).json(newCoupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/coupons/:id', (req, res) => {
  try {
    const db = readDb();
    const { id } = req.params;
    if (!db.coupons) db.coupons = [];
    const index = db.coupons.findIndex(c => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }
    db.coupons[index] = { ...db.coupons[index], ...req.body, id };
    writeDb(db);
    res.json(db.coupons[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/coupons/:id', (req, res) => {
  try {
    const db = readDb();
    const { id } = req.params;
    if (!db.coupons) db.coupons = [];
    db.coupons = db.coupons.filter(c => c.id !== id);
    writeDb(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons/:id/use', (req, res) => {
  try {
    const db = readDb();
    const { id } = req.params;
    if (!db.coupons) db.coupons = [];
    const index = db.coupons.findIndex(c => c.id === id);
    if (index !== -1) {
      db.coupons[index].usedCount = (db.coupons[index].usedCount || 0) + 1;
      writeDb(db);
      res.json(db.coupons[index]);
    } else {
      res.status(404).json({ error: 'Coupon not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Base64 file upload endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      res.status(400).json({ error: 'name and data (base64 string) are required' });
      return;
    }
    const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = path.extname(name) || '.png';
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    res.json({ url: `/uploads/${filename}` });
  } catch (err: any) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// API: AURA AI Editorial Assistant Proxy
app.post('/api/assistant', async (req, res) => {
  const { articleTitle, articleContent, userMessage, chatHistory } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!userMessage) {
    res.status(400).json({ error: 'userMessage is required' });
    return;
  }

  // Handle missing Gemini API Key gracefully as instructed
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('GEMINI_API_KEY environment variable is missing. Running in simulated fallback mode.');
    
    // Simulate a highly elegant editorial response based on the article context
    setTimeout(() => {
      let simulatedReply = '';
      const promptLower = userMessage.toLowerCase();

      if (promptLower.includes('summar') || promptLower.includes('short') || promptLower.includes('brief')) {
        simulatedReply = `### Abstract: *${articleTitle || 'Selected Dossier'}*\n\nThis article examines the intersections of material structure and human awareness. It advocates for deliberate deceleration and the cultivation of **physical and cognitive stillness** to counteract modern sensory saturation.\n\n*Key takeaways:*\n1. **Material Authenticity**: Surrounding ourselves with unvarnished, raw textures helps ground our cognitive processes.\n2. **Temporal Boundaries**: Intentionally defining screens-free pockets of our day lets the brain return to its natural default mode state.\n3. **Decelerated Awareness**: Deceleration of our sensory rhythms is the ultimate luxury in our hyper-connected decade.\n\n*(Note: This is an offline preview summary. Configure your \`GEMINI_API_KEY\` to enable dynamic, conversational interactions with AURA.)*`;
      } else if (promptLower.includes('poem') || promptLower.includes('haiku') || promptLower.includes('verse')) {
        simulatedReply = `### A Verse in Shadows\n\n*The stone remains, unvarnished, deep,*\ *A quiet watch the shadows keep.*\ *In corners where the blue light dies,*\ *The ancient, silent truths arise.*\ \n\n*A single cup, a breath, a lane,*\ *The healing wash of twilight rain.*\ *We fade into the quiet room,*\ *To trace the rhythm of the loom.*\n\n*(Note: This is an offline preview poetic rendering. Configure your \`GEMINI_API_KEY\` in the Secrets panel to unleash AURA's full creative capability.)*`;
      } else {
        simulatedReply = `### Greeting from AURA\n\nThank you for exploring *${articleTitle || 'ÉLOQUENCE Journal'}*. You asked: *"${userMessage}"*\n\nAs your literary companion, I am designed to dive deep into the cultural, architectural, and philosophical roots of this piece. \n\n**To unlock my fully dynamic, real-time Gemini AI capabilities, please add your \`GEMINI_API_KEY\` via the Secrets panel in the AI Studio UI.** Once configured, I will generate bespoke, contextual discourse on slow design, poetry, and mindfulness.\n\nMeanwhile, reflecting on this essay, consider how the **beauty of tactile imperfections** (such as hand-crafted stoneware or raw concrete) invites us to accept our own human vulnerability. In what ways can you introduce a "pause" in your immediate surroundings today?`;
      }
      
      res.json({ text: simulatedReply, simulated: true });
    }, 1000);
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    
    // Build context-rich prompt
    let systemInstruction = `You are AURA, the premium, highly sophisticated, and poetically minded AI Literary Assistant of ÉLOQUENCE Magazine.
Your personality is intellectual, thoughtful, serene, and warm. You speak with high-end editorial elegance, avoiding technical jargon, standard chatbot phrases, or marketing hype. You use precise design and philosophical terminology when relevant.
You are conversing with a reader about the article titled "${articleTitle || 'Éloquence Dossier'}".

Here is the full text of the article for your context:
"""
${Array.isArray(articleContent) ? articleContent.join('\n\n') : (articleContent || 'An elegant lifestyle dossier.')}
"""

Guidelines:
1. Always maintain your high-end literary persona.
2. Structure your responses beautifully with elegant Markdown formatting (headings, italics, bullet points).
3. Be brief yet profound—do not ramble.
4. If asked to summarize, provide a gorgeous, structured abstract.
5. You can write poetry, offer wellness tips, discuss architectural philosophy, and recommend slow travel itineraries inspired by the article.
6. Address the reader directly with quiet warmth.`;

    // Construct standard generative content
    const contents: any[] = [];
    
    // Add chat history if present to enable continuous conversations
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach(item => {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      });
    }
    
    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    const textResponse = aiResponse.text || "AURA is pausing to gather thoughts. Please try asking again.";
    res.json({ text: textResponse, simulated: false });

  } catch (err: any) {
    console.error('Error in Gemini Assistant proxy API:', err);
    res.status(500).json({ error: 'AURA assistant service experienced a minor interruption: ' + err.message });
  }
});

// Setup Vite Dev Server / Static Asset Serving
async function startServer() {
  if (process.env.VERCEL) {
    console.log('Running on Vercel - exporting app serverless handler.');
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted for development.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static build from dist folder.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ÉLOQUENCE server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
