import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
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
}

function readDb(): Database {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading db.json, using defaults:', err);
  }

  // Initial database state if not present
  const initialDb: Database = {
    articles: defaultArticles,
    categories: ['Wellness', 'Fashion', 'Travel', 'Culture', 'Lifestyle'],
    settings: {
      logoText: 'ÉLOQUENCE',
      logoSubtext: "Journal d'un esprit calme",
      siteTitle: "ÉLOQUENCE — Journal d'un esprit calme",
      logoUrl: ''
    }
  };
  
  writeDb(initialDb);
  return initialDb;
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
    const ai = new GoogleGenAI({ apiKey });
    
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
      model: 'gemini-2.5-flash',
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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
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
