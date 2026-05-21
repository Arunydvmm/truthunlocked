const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/truth-unlocked';

// ===== MONGOOSE CONNECTION =====
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.warn('⚠️ MongoDB connection failed, using in-memory storage:', err.message);
    // Fall back to in-memory storage
  });

// ===== DATABASE SCHEMAS =====
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  cat: String,
  excerpt: String,
  body: String,
  image: String,
  read: String,
  featured: Boolean,
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  views: { type: Number, default: 0 },
  author: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const mediaSchema = new mongoose.Schema({
  name: String,
  url: String,
  size: Number,
  type: String,
  uploadedBy: mongoose.Schema.Types.ObjectId,
  uploadedAt: { type: Date, default: Date.now }
});

const auditSchema = new mongoose.Schema({
  type: String,
  details: String,
  userId: String,
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Article = mongoose.model('Article', articleSchema);
const Media = mongoose.model('Media', mediaSchema);
const Audit = mongoose.model('Audit', auditSchema);

// ===== IN-MEMORY FALLBACK =====
let memoryStore = {
  users: [
    { id: 1, email: 'admin@truthunlocked.com', password: bcrypt.hashSync('admin123'), name: 'Admin', role: 'admin' }
  ],
  articles: [],
  media: [],
  auditLog: []
};

// ===== FILE UPLOAD SETUP =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

// ===== HELPERS =====
async function addAudit(type, details, userId) {
  try {
    if (mongoose.connection.readyState === 1) {
      await Audit.create({ type, details, userId });
    } else {
      memoryStore.auditLog.push({ type, details, userId, timestamp: new Date() });
    }
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ===== ROUTES: HEALTH & STATUS =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ===== ROUTES: AUTHENTICATION =====
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    let user;
    
    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email });
    } else {
      user = memoryStore.users.find(u => u.email === email);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    addAudit('LOGIN', `User ${email} logged in`, email);
    
    res.json({
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.create({ email, password: hashedPassword, name });
    } else {
      user = { id: Date.now(), email, password: hashedPassword, name, role: 'editor' };
      memoryStore.users.push(user);
    }
    
    const token = jwt.sign(
      { id: user._id || user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    addAudit('REGISTER', `New user registered: ${email}`, email);
    
    res.json({ token, user: { email, name } });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

app.get('/api/auth/validate', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ===== ROUTES: ARTICLES =====
app.get('/api/articles', async (req, res) => {
  try {
    let articles;
    if (mongoose.connection.readyState === 1) {
      articles = await Article.find({ status: 'published' }).sort('-createdAt');
    } else {
      articles = memoryStore.articles.filter(a => a.status === 'published');
    }
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching articles' });
  }
});

app.get('/api/articles/admin', authMiddleware, async (req, res) => {
  try {
    let articles;
    if (mongoose.connection.readyState === 1) {
      articles = await Article.find({}).sort('-createdAt');
    } else {
      articles = memoryStore.articles;
    }
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching articles' });
  }
});

app.post('/api/articles', authMiddleware, async (req, res) => {
  try {
    const articleData = {
      ...req.body,
      author: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    let article;
    if (mongoose.connection.readyState === 1) {
      article = await Article.create(articleData);
    } else {
      article = { id: Date.now(), ...articleData };
      memoryStore.articles.push(article);
    }
    
    addAudit('CREATE', `Article created: ${req.body.title}`, req.user.email);
    
    res.json(article);
  } catch (err) {
    console.error('Create article error:', err);
    res.status(500).json({ message: 'Error creating article' });
  }
});

app.put('/api/articles/:id', authMiddleware, async (req, res) => {
  try {
    let article;
    if (mongoose.connection.readyState === 1) {
      article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else {
      const idx = memoryStore.articles.findIndex(a => a.id === parseInt(req.params.id));
      if (idx === -1) return res.status(404).json({ message: 'Not found' });
      memoryStore.articles[idx] = { ...memoryStore.articles[idx], ...req.body, updatedAt: new Date() };
      article = memoryStore.articles[idx];
    }
    
    addAudit('UPDATE', `Article updated: ${req.body.title}`, req.user.email);
    
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Error updating article' });
  }
});

app.delete('/api/articles/:id', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Article.findByIdAndDelete(req.params.id);
    } else {
      const idx = memoryStore.articles.findIndex(a => a.id === parseInt(req.params.id));
      if (idx === -1) return res.status(404).json({ message: 'Not found' });
      memoryStore.articles.splice(idx, 1);
    }
    
    addAudit('DELETE', `Article deleted: ID ${req.params.id}`, req.user.email);
    
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting article' });
  }
});

// ===== ROUTES: MEDIA =====
app.get('/api/media', authMiddleware, async (req, res) => {
  try {
    let media;
    if (mongoose.connection.readyState === 1) {
      media = await Media.find({}).sort('-uploadedAt');
    } else {
      media = memoryStore.media;
    }
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching media' });
  }
});

app.post('/api/media/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const mediaData = {
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      type: req.file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };
    
    let media;
    if (mongoose.connection.readyState === 1) {
      media = await Media.create(mediaData);
    } else {
      media = { id: Date.now(), ...mediaData };
      memoryStore.media.push(media);
    }
    
    addAudit('UPLOAD', `Media uploaded: ${req.file.originalname}`, req.user.email);
    
    res.json(media);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

app.delete('/api/media/:id', authMiddleware, async (req, res) => {
  try {
    let media;
    if (mongoose.connection.readyState === 1) {
      media = await Media.findByIdAndDelete(req.params.id);
    } else {
      const idx = memoryStore.media.findIndex(m => m.id === parseInt(req.params.id));
      if (idx === -1) return res.status(404).json({ message: 'Not found' });
      media = memoryStore.media[idx];
      
      // Delete file
      const filePath = path.join(__dirname, media.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      
      memoryStore.media.splice(idx, 1);
    }
    
    addAudit('DELETE', `Media deleted: ${media?.name}`, req.user.email);
    
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting media' });
  }
});

// ===== ROUTES: AUDIT LOG =====
app.get('/api/audit', authMiddleware, async (req, res) => {
  try {
    let logs;
    if (mongoose.connection.readyState === 1) {
      logs = await Audit.find({}).sort('-timestamp').limit(100);
    } else {
      logs = memoryStore.auditLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 100);
    }
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching audit log' });
  }
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`
  ╔═════════════════════════════════════╗
  ║  🔒 Truth Unlocked Backend Server   ║
  ╚═════════════════════════════════════╝
  
  📍 Server running on: http://localhost:${PORT}
  🔑 JWT Secret: ${JWT_SECRET === 'your-secret-key-change-this' ? '⚠️ DEFAULT (change in .env)' : '✅ Custom'}
  🗄️ Database: ${mongoose.connection.readyState === 1 ? '✅ MongoDB Connected' : '⚠️ Using Memory Storage (dev mode)'}
  
  📚 API Endpoints:
    • POST   /api/auth/login         - Admin login
    • POST   /api/auth/register      - Create new user
    • GET    /api/articles           - Get published articles
    • GET    /api/articles/admin     - Get all articles (auth required)
    • POST   /api/articles           - Create article (auth required)
    • PUT    /api/articles/:id       - Update article (auth required)
    • DELETE /api/articles/:id       - Delete article (auth required)
    • POST   /api/media/upload       - Upload media (auth required)
    • GET    /api/media              - List media (auth required)
    • DELETE /api/media/:id          - Delete media (auth required)
    • GET    /api/audit              - Audit log (auth required)
    • GET    /api/health             - Health check
  
  🔐 Test Login:
    Email:    admin@truthunlocked.com
    Password: admin123
  
  `);
});

module.exports = app;
