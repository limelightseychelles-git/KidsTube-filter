# Setup Guide

## Quick Start

### 1. System Requirements
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server
```

### 2. Database Configuration
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE kidstube_filter;
CREATE USER kidstube_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE kidstube_filter TO kidstube_admin;
\q
EOF
```

### 3. Run Database Migrations

See the SQL schema in README.md or run:
```bash
sudo -u postgres psql -d kidstube_filter -f database/schema.sql
```

### 4. Redis Configuration
```bash
# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli ping
```

### 5. Environment Setup
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your settings

# Frontend (optional proxy configuration)
cd ../frontend
# package.json already has proxy: "http://localhost:5000"
```

### 6. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 7. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## Production Deployment

### Using PM2
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start src/server.js --name kidstube-backend

# Start frontend (build first)
cd ../frontend
npm run build
pm2 serve build 3000 --name kidstube-frontend --spa

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker (Optional)

Coming soon...

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if database exists
sudo -u postgres psql -l | grep kidstube_filter

# Reset database
sudo -u postgres psql -c "DROP DATABASE kidstube_filter;"
sudo -u postgres psql -c "CREATE DATABASE kidstube_filter;"
```

### Redis Connection Issues
```bash
# Check Redis status
sudo systemctl status redis-server

# Test connection
redis-cli ping

# View Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

### Port Already in Use
```bash
# Check what's using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>
```
