# 🚀 SIMRAS Project - Complete Setup Instructions

## Overview
This guide will help you install all dependencies and run both the frontend and backend locally.

**Project Structure:**
```
project/
├── frontend/    (React + Vite + Tailwind CSS)
├── backend/     (FastAPI + PostgreSQL)
└── docs/        (Documentation)
```

---

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** - Included with Node.js
- **Python 3.10+** - [Download](https://www.python.org/)
- **pip** - Included with Python
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/)

### Verify Installation
```bash
node --version        # Should be 18+
npm --version         # Should be 9+
python --version      # Should be 3.10+
pip --version         # Should exist
```

---

## 🎨 Frontend Setup (React + Vite)

### Step 1: Navigate to Frontend Directory
```bash
cd c:\Users\eswar\OneDrive\Desktop\project\frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

**What this does:**
- Downloads and installs all npm packages listed in package.json
- Creates node_modules directory (~500MB)
- Generates package-lock.json for consistency
- Typical duration: 3-10 minutes (depending on internet speed)

**Expected packages (20+):**
- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- Recharts
- And more...

### Step 3: Create Environment File
Create `.env.local` in the frontend directory:

```bash
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:5000/api/v1
EOF
```

Or manually create the file with this content:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Step 4: Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 5: Access the Frontend
- Open browser and go to: **http://localhost:5173**
- You should see the SIMRAS landing page
- Login with demo credentials:
  - Email: `admin@simras.local`
  - Password: `password123`

---

## 🔧 Backend Setup (FastAPI + PostgreSQL)

### Step 1: Navigate to Backend Directory
```bash
cd c:\Users\eswar\OneDrive\Desktop\project\backend
```

### Step 2: Create Python Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

You should see `(venv)` prefix in your terminal.

### Step 3: Install Python Dependencies
```bash
pip install -r requirements.txt
```

**Expected packages (15+):**
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- PyJWT
- Alembic
- psycopg2
- And more...

### Step 4: Setup Database

#### Option A: Using Local PostgreSQL (Recommended)

**Install PostgreSQL:**
- Download from https://www.postgresql.org/download/windows/
- Run installer and follow steps
- Remember the password you set

**Create Database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql terminal:
CREATE DATABASE simras;
CREATE USER simras_user WITH PASSWORD 'simras_password';
ALTER ROLE simras_user SET client_encoding TO 'utf8';
ALTER ROLE simras_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE simras_user SET default_transaction_deferrable TO on;
ALTER ROLE simras_user SET default_transaction_read_uncommitted TO off;
GRANT ALL PRIVILEGES ON DATABASE simras TO simras_user;
\q
```

#### Option B: Using SQLite (For Testing Only)
```bash
# Modify .env file - change DATABASE_URL to:
DATABASE_URL=sqlite:///./simras.db
```

### Step 5: Configure Environment Variables

Create `.env` file in backend directory:

```bash
cat > .env << EOF
# Database
DATABASE_URL=postgresql://simras_user:simras_password@localhost/simras

# FastAPI
API_TITLE=SIMRAS API
API_VERSION=1.0.0
DEBUG=True

# JWT
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (for sending verification emails)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SENDER_EMAIL=your-email@gmail.com
SENDER_NAME=SIMRAS

# CORS
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]

# Logging
LOG_LEVEL=INFO
EOF
```

### Step 6: Run Database Migrations

```bash
# Create tables using Alembic
alembic upgrade head
```

### Step 7: Create Initial Admin User (Optional)

```python
python -c "
from app.db.database import SessionLocal
from app.crud.user import UserCRUD
from app.auth.password import hash_password

db = SessionLocal()
crud = UserCRUD(db)

# Create admin user
admin = crud.create(
    email='admin@simras.local',
    password=hash_password('password123'),
    name='Admin User',
    role='ADMIN'
)
print(f'Admin user created: {admin.email}')
"
```

### Step 8: Start Backend Server

```bash
# Make sure (venv) is activated
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:5000
INFO:     Application startup complete
```

### Step 9: Access the Backend API

- **API Base URL**: http://localhost:5000
- **API Docs (Swagger)**: http://localhost:5000/docs
- **API ReDoc**: http://localhost:5000/redoc

---

## 🚀 Running Both Frontend & Backend

### Terminal 1: Backend
```bash
cd backend
venv\Scripts\activate        # Activate virtual environment
python -m uvicorn app.main:app --reload --port 5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Swagger Docs**: http://localhost:5000/docs

---

## 🧪 Testing the Setup

### Frontend Test
```bash
cd frontend
npm run type-check  # Type checking
npm run lint        # Linting
```

### Backend Test
```bash
cd backend
pytest               # Run tests
```

---

## 📦 Available Commands

### Frontend

```bash
cd frontend

npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Check TypeScript types
npm run lint         # Run ESLint
```

### Backend

```bash
cd backend
source venv/bin/activate  # Activate venv

python -m uvicorn app.main:app --reload              # Run dev server
alembic upgrade head                                  # Run migrations
alembic downgrade -1                                  # Revert migration
pytest                                                # Run tests
black .                                               # Format code
```

---

## 🐛 Troubleshooting

### Frontend Issues

#### "vite: command not found"
- Dependencies not installed: Run `npm install`
- Check node_modules exists

#### "Port 5173 already in use"
```bash
# Find and kill process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

#### TypeScript errors
```bash
npm run type-check
```

### Backend Issues

#### "ModuleNotFoundError: No module named 'fastapi'"
- Virtual environment not activated
- Dependencies not installed: Run `pip install -r requirements.txt`

#### Database connection error
- PostgreSQL not running
- Wrong credentials in .env
- Database doesn't exist

#### "Port 5000 already in use"
```bash
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### General Issues

#### npm install stuck
- Cancel (Ctrl+C) and try again
- Clear cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules package-lock.json`
- Then: `npm install`

#### Python virtual environment issues
- Delete venv folder: `rm -rf venv`
- Recreate: `python -m venv venv`
- Reactivate: `venv\Scripts\activate`

---

## 📱 Demo Credentials

### Admin Account
- **Email**: admin@simras.local
- **Password**: password123
- **Role**: Administrator

### Create Additional Users (Via API)
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

---

## 🔐 Security Notes

⚠️ **For Development Only:**
- Change `SECRET_KEY` in .env to a random string
- Change database credentials
- Change email SMTP credentials
- Don't commit .env file to git

---

## 📊 Architecture

```
Frontend (React)
    ↓
    ↓ HTTP/REST
    ↓
Backend (FastAPI)
    ↓
    ↓ SQL
    ↓
Database (PostgreSQL)
```

### Data Flow:
1. User interacts with React UI
2. Frontend calls REST API
3. Backend processes request
4. Database stores/retrieves data
5. Response sent back to frontend

---

## 🎯 Next Steps

1. ✅ Install all dependencies
2. ✅ Run backend on :5000
3. ✅ Run frontend on :5173
4. ✅ Test authentication
5. ✅ Explore API docs
6. ✅ Build additional features

---

## 📞 Common Commands Cheatsheet

```bash
# Frontend
npm install              # Install deps
npm run dev             # Start dev server
npm run build           # Build for prod
npm run type-check      # Check types

# Backend
pip install -r requirements.txt    # Install deps
python -m uvicorn app.main:app --reload    # Start server
alembic upgrade head    # Run migrations

# Database
psql -U simras_user    # Connect to DB
\dt                    # List tables
\q                     # Quit psql

# Port Management
netstat -ano | findstr :PORT    # Find process
taskkill /PID <ID> /F           # Kill process
```

---

## ✅ Verification Checklist

- [ ] Node.js installed (v18+)
- [ ] Python installed (v3.10+)
- [ ] PostgreSQL installed and running
- [ ] Frontend dependencies installed
- [ ] Backend dependencies installed
- [ ] Database created and migrations ran
- [ ] .env files configured
- [ ] Backend running on :5000
- [ ] Frontend running on :5173
- [ ] Can access http://localhost:5173
- [ ] Can access http://localhost:5000/docs
- [ ] Can login with demo credentials

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [REST API Best Practices](https://restfulapi.net)

---

**Status**: Ready for setup
**Last Updated**: August 1, 2026
**Version**: 1.0.0

---

## 🆘 Getting Help

1. Check the troubleshooting section above
2. Read error messages carefully
3. Check logs: `npm run dev` or `python -m uvicorn ...`
4. Verify prerequisites are installed
5. Clear cache and reinstall if needed

---

**Good luck! 🚀**
