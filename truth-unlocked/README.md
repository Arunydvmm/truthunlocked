# 🔓 Truth Unlocked v2.0

A **production-grade Content Management System** with secure admin login, backend database storage, and media management. Ready to deploy anywhere.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-14+-green)

---

## ✨ Features

### 🎯 Frontend
- **Beautiful, responsive design** - Works on desktop, tablet, mobile
- **Live article display** - Publish and view instantly
- **SEO-optimized** - Meta tags and structured data
- **Fast loading** - Optimized assets and caching
- **Accessibility** - WCAG 2.1 compliant

### 🔐 Authentication & Security
- **Secure JWT tokens** - Industry-standard authentication
- **Password hashing** - bcrypt with salt rounds
- **Session management** - Automatic token refresh
- **Audit logging** - Track all admin actions
- **CORS protected** - API security

### 📰 Content Management
- **Article editor** - Create, edit, publish, draft
- **Bulk operations** - Manage multiple articles
- **Categories** - Organize by topic
- **Featured articles** - Highlight important content
- **Auto-save drafts** - Never lose work
- **Search & filter** - Find content quickly

### 🖼️ Media Management
- **Image uploads** - JPG, PNG, WebP support
- **Automatic optimization** - Compress and resize
- **File organization** - Library view with previews
- **Batch operations** - Delete multiple files
- **Storage limits** - 10MB per file, configurable

### 📊 Analytics & Monitoring
- **View tracking** - Monitor article popularity
- **Audit log** - Complete activity history
- **Dashboard** - Key metrics at a glance
- **User management** - Admin controls

### 🗄️ Database
- **MongoDB integration** - Scalable NoSQL database
- **MongoDB Atlas** - Cloud-hosted option (free tier)
- **Automatic backups** - Preserve data
- **Full-text search** - Coming soon

### ☁️ Deployment Ready
- **Docker** - Containerized for any platform
- **Heroku** - One-click deployment
- **Railway, Render** - Modern cloud platforms
- **AWS, DigitalOcean** - Self-hosted options
- **Environment config** - Multiple deployment modes

---

## 🚀 Quick Start

### 1️⃣ **5-Minute Local Setup (Docker)**

```bash
# Download and extract project
cd truth-unlocked

# Start everything (backend + database)
docker-compose up -d

# Open frontend
# Navigate to truth_unlocked_upgraded.html in your browser

# Login with:
# Email: admin@truthunlocked.com
# Password: admin123

# Backend API: http://localhost:3000
```

### 2️⃣ **Without Docker (Node.js + MongoDB)**

```bash
# Install dependencies
npm install

# Create configuration
cp .env.example .env

# Start MongoDB (separate terminal)
mongod

# Start backend
npm start

# Backend API: http://localhost:3000
```

### 3️⃣ **Deploy to Cloud (Heroku Example)**

```bash
# 1. Create Heroku account and install CLI
heroku login

# 2. Create app and add MongoDB
heroku create your-app-name
heroku addons:create mongolab:sandbox

# 3. Deploy
git push heroku main

# 4. Your API: https://your-app-name.herokuapp.com
```

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides on 6 platforms.**

---

## 📁 Project Structure

```
truth-unlocked/
│
├── truth_unlocked_upgraded.html   # Frontend (open in browser)
├── server.js                      # Backend API
├── package.json                   # Node.js dependencies
│
├── .env                           # Configuration (keep secret!)
├── .env.example                   # Template
├── Dockerfile                     # Docker image
├── docker-compose.yml             # Full stack (backend + database)
│
├── DEPLOYMENT.md                  # Detailed deployment guides
├── README.md                      # This file
└── uploads/                       # Media storage
```

---

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Security (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-secret-key-here

# Database
MONGODB_URI=mongodb://localhost:27017/truth-unlocked
# OR Cloud: mongodb+srv://user:pass@cluster.mongodb.net/truth-unlocked

# Files
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=./uploads
```

---

## 📚 API Documentation

### Authentication

**POST** `/api/auth/login`
```json
{
  "email": "admin@truthunlocked.com",
  "password": "admin123"
}
// Returns: { token, user }
```

**POST** `/api/auth/register`
```json
{
  "email": "newuser@example.com",
  "password": "securepass",
  "name": "User Name"
}
```

**GET** `/api/auth/validate`
- Headers: `Authorization: Bearer {token}`
- Returns: `{ valid: true, user: {...} }`

### Articles

**GET** `/api/articles` - Get published articles
**GET** `/api/articles/admin` - Get all (auth required)
**POST** `/api/articles` - Create (auth required)
**PUT** `/api/articles/:id` - Update (auth required)
**DELETE** `/api/articles/:id` - Delete (auth required)

### Media

**GET** `/api/media` - List uploads (auth required)
**POST** `/api/media/upload` - Upload file (auth required)
**DELETE** `/api/media/:id` - Delete file (auth required)

### Admin

**GET** `/api/audit` - Audit log (auth required)
**GET** `/api/health` - Server status (public)

---

## 🔐 Security Features

✅ **Passwords** - Hashed with bcrypt (10 rounds)
✅ **Tokens** - JWT with 24h expiration
✅ **CORS** - Restricted origins
✅ **Validation** - Input sanitization
✅ **Audit log** - Track all changes
✅ **Rate limiting** - Coming in v2.1
✅ **HTTPS** - Enabled in production
✅ **Environment secrets** - .env not committed

---

## 📊 Database Schema

### Users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String,
  createdAt: Date
}
```

### Articles
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String (unique),
  cat: String,
  excerpt: String,
  body: String (HTML),
  image: String (URL),
  featured: Boolean,
  status: "published" | "draft",
  views: Number,
  author: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Media
```javascript
{
  _id: ObjectId,
  name: String,
  url: String,
  size: Number,
  type: String,
  uploadedBy: ObjectId,
  uploadedAt: Date
}
```

### Audit Log
```javascript
{
  _id: ObjectId,
  type: String,
  details: String,
  userId: String,
  timestamp: Date
}
```

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

```javascript
// Check API status
fetch('http://localhost:3000/api/health')

// Update API URL
localStorage.setItem('api_url', 'http://correct-url:3000');
```

### Login fails

- Verify `.env` has JWT_SECRET set
- Check MongoDB is running
- Look at server logs for errors

### File uploads fail

- Check `uploads/` directory exists and is writable
- Verify file size < 10MB
- Check disk space available

### Database connection error

- MongoDB must be running: `mongod`
- Verify `MONGODB_URI` in `.env`
- Check credentials if using authentication

### Port already in use

```bash
# Change PORT in .env, or:
sudo lsof -i :3000
sudo kill -9 <PID>
```

---

## 🚀 Deployment Checklist

- [ ] Change default admin password
- [ ] Generate new JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Configure MONGODB_URI (cloud database)
- [ ] Enable HTTPS/SSL
- [ ] Set up domain name
- [ ] Configure email notifications (optional)
- [ ] Set up backups
- [ ] Monitor error logs
- [ ] Update dependencies regularly

---

## 📈 Performance Optimization

**Frontend:**
- Lazy load images
- Minify assets
- Cache static files
- CDN for media

**Backend:**
- Database indexes
- Query caching
- Pagination for articles
- Compress responses

**Database:**
```javascript
// Create indexes
db.articles.createIndex({ status: 1, createdAt: -1 });
db.articles.createIndex({ slug: 1 });
db.users.createIndex({ email: 1 });
```

---

## 🛠️ Development

### Add new features

```javascript
// 1. Add API route in server.js
app.get('/api/custom', authMiddleware, (req, res) => {
  // Your code
});

// 2. Call from frontend
fetch('http://localhost:3000/api/custom', {
  headers: { 'Authorization': `Bearer ${authToken}` }
});
```

### Database models

Add to `server.js`:
```javascript
const customSchema = new mongoose.Schema({
  field1: String,
  field2: Number
});
const CustomModel = mongoose.model('Custom', customSchema);
```

---

## 🤝 Contributing

Contributions welcome! Please:
1. Test locally with Docker
2. Update documentation
3. Follow existing code style
4. Submit pull requests

---

## 📝 License

MIT License - Free to use and modify

```
Copyright (c) 2024 Truth Unlocked

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 📞 Support

**Need help?**

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific guides
2. Review API documentation above
3. Check browser console for errors
4. Check server logs: `docker logs truth-unlocked-backend`
5. Review `.env` configuration

**API Status:** http://localhost:3000/api/health

---

## 🎯 Roadmap

- [x] Secure authentication
- [x] Database storage
- [x] Media uploads
- [x] Audit logging
- [ ] Full-text search
- [ ] Email notifications
- [ ] Comment system
- [ ] Multi-user roles
- [ ] API rate limiting
- [ ] Advanced analytics
- [ ] Mobile app

---

## 🌟 Features That Make This Special

✨ **Production-Ready** - Not a tutorial, but actual deployable software
✨ **Database-Backed** - Real data persistence, not localStorage
✨ **Secure** - JWT tokens, password hashing, audit logs
✨ **Media-Rich** - Full image upload and management
✨ **Cloud-Ready** - Deploy to 6+ platforms with one command
✨ **Fully Open Source** - MIT license, modify as needed
✨ **Well Documented** - Every feature explained

---

**Ready to publish? Let's go! 🚀**

```bash
docker-compose up -d
# Open truth_unlocked_upgraded.html
# Login and start creating
```

---

Made with ❤️ for content creators
