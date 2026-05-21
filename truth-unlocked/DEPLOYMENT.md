# Truth Unlocked v2.0 - Setup & Deployment Guide

## 🚀 Quick Start (Local Development)

### Option 1: Docker (Recommended - All dependencies included)

```bash
# Clone/extract project
cd truth-unlocked

# Start backend + MongoDB automatically
docker-compose up -d

# Backend runs at http://localhost:3000
# MongoDB runs at localhost:27017
```

### Option 2: Manual Setup (Linux/Mac)

**Prerequisites:**
- Node.js 14+ (https://nodejs.org)
- MongoDB 4.4+ (https://www.mongodb.com/try/download/community)

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (copy from .env.example)
cp .env.example .env

# 3. Edit .env and set:
#    - JWT_SECRET (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
#    - MONGODB_URI (local: mongodb://localhost:27017/truth-unlocked)

# 4. Start MongoDB (separate terminal)
mongod

# 5. Start server
npm start
# or with hot reload:
npm run dev
```

### Option 3: Windows

```bash
# Install MongoDB Community from: https://www.mongodb.com/try/download/community
# Run MongoDB as service

# Then:
npm install
npm start
```

---

## 🔐 Default Credentials

**Email:** admin@truthunlocked.com
**Password:** admin123

⚠️ **Change immediately in production!**

---

## 📦 Files Structure

```
truth-unlocked/
├── server.js                 # Backend application
├── package.json              # Dependencies
├── .env                       # Configuration (⚠️ keep secret)
├── .env.example               # Template
├── Dockerfile                # Container image
├── docker-compose.yml        # Full stack setup
├── truth_unlocked_upgraded.html  # Frontend (open in browser)
└── uploads/                  # Media storage
```

---

## 🌐 Frontend Usage

1. **Open frontend:**
   - Simply open `truth_unlocked_upgraded.html` in your browser

2. **Set API URL:**
   - Default: `http://localhost:3000`
   - For remote server: Change in browser console:
     ```javascript
     localStorage.setItem('api_url', 'https://your-api.com');
     ```

3. **Admin Login:**
   - Click "Admin" button
   - Login with credentials above
   - Manage articles, upload media, view audit log

---

## 🚀 Deployment Options

### Option 1: Heroku (Free tier available)

```bash
# 1. Create account at https://www.heroku.com

# 2. Install Heroku CLI
npm install -g heroku

# 3. Login
heroku login

# 4. Create app
heroku create your-app-name

# 5. Add MongoDB Add-on
heroku addons:create mongolab:sandbox

# 6. Deploy
git push heroku main

# 7. Set JWT secret
heroku config:set JWT_SECRET="your-super-secret-key"

# View logs
heroku logs --tail
```

### Option 2: Railway (Modern, free tier)

```bash
# 1. Sign up at https://railway.app

# 2. Connect GitHub repo or drag-drop files

# 3. Railway auto-detects and deploys with:
#    - Node.js runtime
#    - MongoDB plugin
#    - Environment variables via dashboard

# 4. Get API URL from deployment
```

### Option 3: Render (Easy, free tier)

```bash
# 1. Sign up at https://render.com

# 2. New Web Service → Connect GitHub

# 3. Settings:
#    Runtime: Node
#    Build: npm install
#    Start: npm start

# 4. Add environment variables in dashboard:
#    - MONGODB_URI
#    - JWT_SECRET

# 5. Deploy

# Free PostgreSQL also available (optional)
```

### Option 4: DigitalOcean App Platform (Paid, $5/month)

```bash
# 1. Create DigitalOcean account

# 2. Create MongoDB using:
#    - DigitalOcean Managed Database
#    - Or MongoDB Atlas cloud

# 3. App Platform → New App → GitHub repo

# 4. Configure:
#    - Runtime: Node.js
#    - Environment variables
#    - Port: 3000

# 5. Deploy

# Cost: ~$5-7/month for app + database
```

### Option 5: AWS (EC2 + RDS/DocumentDB)

```bash
# 1. Create EC2 instance (Ubuntu 22.04, t2.micro eligible for free tier)

# 2. SSH into instance and:
sudo apt update && sudo apt upgrade
sudo apt install nodejs npm mongodb

# 3. Clone repo
git clone <your-repo>
cd truth-unlocked

# 4. Install & run
npm install
npm start

# 5. Set up nginx reverse proxy
sudo apt install nginx
# Configure as reverse proxy to :3000

# 6. Use MongoDB Atlas for database (cloud hosted)
```

### Option 6: Self-Hosted Server (VPS)

**Recommended providers:** Linode, Vultr, DigitalOcean, OVH

```bash
# 1. SSH into VPS (Ubuntu/Debian)
ssh root@your-server-ip

# 2. Update system
apt update && apt upgrade

# 3. Install Node.js 18
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install nodejs

# 4. Install PM2 (process manager)
npm install -g pm2

# 5. Clone project
git clone <repo>
cd truth-unlocked

# 6. Install dependencies
npm install

# 7. Create .env with production values

# 8. Start with PM2
pm2 start server.js --name "truth-unlocked"
pm2 startup
pm2 save

# 9. Set up nginx reverse proxy
# Create /etc/nginx/sites-available/default:
```

**Nginx Proxy Config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /home/ubuntu/truth-unlocked/uploads;
        expires 30d;
    }
}
```

```bash
# 10. Enable and restart nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

# 11. Set up SSL (free with Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Done! Your API is at https://your-domain.com
```

---

## 🔑 Environment Variables (Production)

⚠️ **Critical for security:**

```env
# Generate strong secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Set in .env or platform dashboard:
PORT=3000
NODE_ENV=production
JWT_SECRET=<generated-secret>
MONGODB_URI=<your-cloud-database>
MAX_FILE_SIZE=10485760
```

---

## 📊 Database Setup

### Option A: MongoDB Atlas (Recommended - Free Tier)

```
1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0 - 512MB storage)
3. Create database user (admin@truthunlocked.com / password)
4. Get connection string:
   mongodb+srv://admin:password@cluster.mongodb.net/truth-unlocked?retryWrites=true&w=majority
5. Update .env: MONGODB_URI=<connection-string>
```

### Option B: Local MongoDB

```bash
# Install
sudo apt-get install mongodb

# Start service
sudo service mongod start

# Check status
sudo service mongod status

# URI for .env
MONGODB_URI=mongodb://localhost:27017/truth-unlocked
```

### Option C: Docker MongoDB (Part of docker-compose.yml)

Already configured in `docker-compose.yml`

---

## 🛡️ Security Checklist (Pre-Production)

- [ ] Change default admin credentials
- [ ] Generate strong JWT_SECRET (32+ chars)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL certificate
- [ ] Set up database authentication
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting (coming soon)
- [ ] Regular database backups
- [ ] Monitor error logs
- [ ] Update dependencies regularly

---

## 📈 Scaling & Performance

**For high traffic:**

1. **Database Indexing** (MongoDB):
```javascript
db.articles.createIndex({ status: 1, createdAt: -1 });
db.articles.createIndex({ slug: 1 });
```

2. **Caching** (add Redis):
```
- Cache published articles
- Cache media library
- Cache user sessions
```

3. **CDN** (Cloudflare/AWS CloudFront):
- Serve static files globally
- Cache API responses

4. **Load Balancing**:
- Run multiple backend instances
- Use nginx or cloud load balancer

---

## 🐛 Troubleshooting

**Frontend can't connect to API:**
```javascript
// Check API status
fetch('http://localhost:3000/api/health').then(r => r.json())

// Update API URL in localStorage
localStorage.setItem('api_url', 'http://correct-url:3000');
```

**Login fails:**
- Check JWT_SECRET is set
- Verify MongoDB is running
- Check credentials in browser console

**Database connection errors:**
- Verify MONGODB_URI format
- Check database credentials
- Ensure MongoDB is accessible

**File upload fails:**
- Check uploads directory permissions
- Verify disk space available
- Check file size limit

**Port already in use:**
```bash
# Change PORT in .env
# Or kill process:
sudo lsof -i :3000
sudo kill -9 <PID>
```

---

## 📞 Support & Documentation

**API Documentation:**
- GET `/api/health` - Server status
- POST `/api/auth/login` - Login
- GET/POST/PUT/DELETE `/api/articles` - Article CRUD
- POST `/api/media/upload` - File uploads
- GET `/api/audit` - Audit log

**Contact:**
- Adjust API_URL in frontend for your deployment
- Check server logs for errors

---

## 📝 License

MIT - Feel free to deploy and modify

---

## ✨ Next Steps

1. ✅ Frontend + Backend running
2. 📝 Create first article in admin panel
3. 🖼️ Upload media/images
4. 🚀 Deploy to production
5. 📊 Monitor analytics
6. 🔐 Set up SSL certificate
7. 🎯 Custom domain name

Happy publishing! 🎉
