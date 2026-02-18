# KidsTube Filter 🎬

A comprehensive YouTube content filtering system for children with parental controls. Built with React, Node.js, PostgreSQL, and Redis.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 🌟 Features

- **🔐 PIN-Based Authentication** - Secure parent dashboard with bcrypt-hashed PIN
- **📺 Channel Management** - Approve specific YouTube channels for kids
- **🚫 Keyword Blocking** - Filter videos containing inappropriate keywords
- **📊 Watch History** - Track videos watched with duration statistics
- **📝 Video Requests** - Kids request videos, parents approve/reject
- **👀 My Requests** - Kids see request status with visual feedback
- **🔑 API Management** - Manage multiple YouTube API keys with rotation
- **⏱️ Watch Time Tracking** - Monitor total, daily, and weekly viewing time
- **💾 Redis Caching** - 12-hour cache for improved performance

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                      │
│         PIN-based (4-6 digits) - No user accounts           │
│         - Stored as bcrypt hash in PostgreSQL               │
│         - Kids view: No auth needed                         │
│         - Parent dashboard: Requires PIN                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   API QUOTA MANAGEMENT                       │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │ Redis Cache     │  │ Database API Keys│                 │
│  │ - 12hr TTL      │  │ - Multiple keys  │                 │
│  │ - Search results│  │ - Auto rotation  │                 │
│  │ - Video metadata│  │ - Fallback to ENV│                 │
│  └─────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
              ┌───────────────┴──────────────┐
              │                              │
    ┌─────────▼────────┐          ┌─────────▼──────────┐
    │  Kids Interface  │          │  Parent Dashboard  │
    │  (No Auth)       │          │  (PIN Required)    │
    │                  │          │                    │
    │ - Search videos  │          │ - Approve channels │
    │ - Watch videos   │          │ - Manage keywords  │
    │ - Request videos │          │ - View history     │
    │ - View requests  │          │ - Manage requests  │
    └──────────────────┘          │ - Configure API    │
                                  │ - Change PIN       │
                                  └────────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **bcrypt** - Password hashing
- **JWT** - Authentication tokens
- **YouTube Data API v3** - Video data

### Frontend
- **React 18** - UI framework
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Player** - Video playback

## 📋 Prerequisites

- Node.js >= 20.0.0
- PostgreSQL >= 14
- Redis >= 6.0
- YouTube Data API Key ([Get one here](https://console.cloud.google.com))

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/kidstube-filter.git
cd kidstube-filter
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Database Setup
```bash
# Create PostgreSQL database
sudo -u postgres psql << 'EOF'
CREATE DATABASE kidstube_filter;
CREATE USER kidstube_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kidstube_filter TO kidstube_admin;
\q
EOF

# Create tables
sudo -u postgres psql -d kidstube_filter << 'EOF'
CREATE TABLE app_config (
    id SERIAL PRIMARY KEY,
    pin_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    key_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approved_channels (
    id SERIAL PRIMARY KEY,
    channel_id VARCHAR(255) UNIQUE NOT NULL,
    channel_name VARCHAR(255),
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blocked_keywords (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE video_history (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    channel_id VARCHAR(255),
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0
);

CREATE TABLE video_requests (
    id SERIAL PRIMARY KEY,
    video_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kidstube_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kidstube_admin;
EOF
```

### 4. Redis Setup
```bash
# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 5. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

### 6. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **YouTube Data API v3**
4. Create credentials → API Key
5. Add the key to `backend/.env` file

## 🎮 Running the Application

### Development Mode

You need **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### First Time Setup

1. Open http://localhost:3000
2. Create a parent PIN (4-6 digits)
3. Go to Parent Dashboard → API Settings
4. Add your YouTube API key
5. (Optional) Approve some channels for kids

## 📖 Usage Guide

### For Parents

1. **Initial Setup**
   - Set up a 4-6 digit PIN
   - Add YouTube API keys in API Settings

2. **Channel Management**
   - Search for channels to approve
   - Only approved channels will show in kids' search

3. **Keyword Blocking**
   - Add keywords to block (e.g., "scary", "violence")
   - Videos with these keywords won't appear

4. **Monitor Usage**
   - View watch history with timestamps
   - See total hours watched (today/week/total)

5. **Handle Requests**
   - Approve or reject video requests from kids
   - Kids will see the status in "My Requests"

### For Kids

1. **Search Videos**
   - Search for videos (filtered by approved channels)
   - Click to watch

2. **Request Videos**
   - Found a video you want? Request it!
   - Check "My Requests" to see status

3. **My Requests**
   - ⏳ Waiting - Pending parent approval
   - ✓ Approved - Click to watch!
   - ✗ Not Allowed - Rejected by parent

## 🔧 Configuration

### Environment Variables

See `.env.example` files for all configuration options.

**Key configurations:**
- `PORT` - Backend server port (default: 5000)
- `DB_*` - PostgreSQL connection settings
- `REDIS_*` - Redis connection settings
- `YOUTUBE_API_KEYS` - Comma-separated API keys
- `JWT_SECRET` - Secret for JWT tokens
- `PIN_SALT_ROUNDS` - bcrypt salt rounds (default: 10)

## 📊 Database Schema
```sql
app_config         # PIN storage
api_keys          # YouTube API keys
approved_channels # Allowed channels
blocked_keywords  # Filtered keywords
video_history     # Watch history with duration
video_requests    # Kids' video requests
```

## 🎨 Screenshots

*(Add screenshots here)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- YouTube Data API v3
- Material-UI for beautiful components
- React Player for video playback
- The open-source community

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🔐 Security

- Never commit `.env` files
- Keep your YouTube API keys private
- Use strong PINs for parent access
- Regularly update dependencies

## 🚧 Roadmap

- [ ] Multi-user support
- [ ] Mobile app (React Native)
- [ ] Screen time limits
- [ ] Email notifications for parents
- [ ] Export watch history reports
- [ ] Support for multiple video platforms

---

Made with ❤️ for safer internet for kids
