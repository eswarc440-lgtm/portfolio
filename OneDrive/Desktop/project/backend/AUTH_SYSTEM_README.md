# Sprint 2: Production-Ready Authentication & Authorization System

## Overview

Complete implementation of a production-ready authentication and authorization system for Infrastructure Digital Twin using FastAPI, PostgreSQL, JWT, and RBAC.

## Features

### ✅ Authentication
- **User Registration** with email verification
- **Email Verification** with time-limited tokens (24 hours)
- **Login** with JWT access and refresh tokens
- **Token Refresh** to maintain sessions
- **Logout** support
- **Password Reset** with secure email flow

### ✅ Password Security
- **bcrypt Hashing** with cost factor 12
- **Configurable Requirements**:
  - Minimum length (8 characters)
  - Uppercase letters required
  - Numbers required
  - Special characters required
- **Password Strength Validation**

### ✅ JWT Tokens
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- **Email Verification Token**: 24 hours expiration
- **Password Reset Token**: 1 hour expiration
- **Token Type Validation**
- **HS256 Algorithm**

### ✅ Role-Based Access Control (RBAC)
- **4 User Roles**:
  - `CITIZEN` - Basic user
  - `ENGINEER` - Infrastructure management
  - `OFFICER` - Project approval & oversight
  - `ADMIN` - Full system administration
- **Hierarchical Permissions**
- **Dynamic Role Requirements**
- **Role-Specific Dependencies**

### ✅ Email Service
- **HTML Email Templates**
- **Email Verification**
- **Password Reset**
- **SMTP Integration**
- **Jinja2 Template Rendering**

### ✅ API Documentation
- **Swagger UI** (/docs)
- **ReDoc** (/redoc)
- **Complete OpenAPI Schema**
- **Example Requests**

---

## Project Structure

```
app/auth/
├── __init__.py                 # Module exports
├── router.py                   # Authentication endpoints
├── protected_routes.py         # Protected route examples
├── service.py                  # Business logic layer
├── repository.py               # Data access layer
├── dependencies.py             # OAuth2 & RBAC dependencies
├── exceptions.py               # Custom exceptions
├── jwt.py                      # JWT utilities
├── password.py                 # Password hashing & validation
├── email.py                    # Email service
└── templates/
    ├── email_verification.html # Verification email template
    └── password_reset.html     # Password reset email template

app/schemas/
├── auth.py                     # Auth Pydantic schemas
└── user.py                     # User Pydantic schemas

app/models/
└── user.py                     # SQLAlchemy User model

app/core/
├── config.py                   # Configuration settings
├── database.py                 # Database setup
└── security.py                 # Security utilities

alembic/versions/
└── 001_add_auth_fields_to_user.py  # Database migration
```

---

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

**requirements.txt**:
```
fastapi==0.104.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic==2.5.0
pydantic-settings==2.1.0
jinja2==3.1.2
alembic==1.12.1
python-dotenv==1.0.0
```

### 2. Database Setup

```bash
# Initialize Alembic (if not already done)
alembic init alembic

# Generate migration from models
alembic revision --autogenerate -m "Add auth fields to user"

# Apply migration
alembic upgrade head
```

### 3. Configuration

Create `.env` file in project root:

```env
# Application
APP_NAME=Infrastructure Digital Twin
DEBUG=True
API_HOST=127.0.0.1
API_PORT=5000

# Database
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/auth_db

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@infrastructure-digital-twin.com
EMAIL_FROM_NAME=Infrastructure Digital Twin

# Security
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true

# Token Expiration
EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS=24
PASSWORD_RESET_TOKEN_EXPIRE_HOURS=1
```

### 4. Register Routers

In `app/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth import auth_router, protected_router

app = FastAPI(
    title="Infrastructure Digital Twin",
    description="Authentication & Infrastructure Management API",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(protected_router, prefix="/api/v1")

@app.get("/")
def home():
    return {
        "message": "Infrastructure Digital Twin API",
        "version": "2.0.0",
        "docs": "/docs"
    }
```

### 5. Run Application

```bash
# Development
uvicorn app.main:app --reload --host 127.0.0.1 --port 5000

# Production
gunicorn -w 4 -b 0.0.0.0:5000 app.main:app
```

Access Swagger UI: `http://localhost:5000/docs`

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| GET | `/auth/verify-email` | Verify email address |
| POST | `/auth/login` | Login user |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get user profile |
| PUT | `/auth/me` | Update user profile |
| GET | `/auth/password-requirements` | Get password requirements |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/users` | List all users |
| GET | `/auth/users/{user_id}` | Get specific user |
| PUT | `/auth/users/{user_id}/role` | Change user role |
| PUT | `/auth/users/{user_id}/status` | Update user status |
| DELETE | `/auth/users/{user_id}` | Delete user |

### Protected Route Examples

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| GET | `/api/users/me` | Any authenticated | Get user profile |
| GET | `/api/users/me/dashboard` | Any authenticated | User dashboard |
| POST | `/api/verified/create-project` | Verified email | Create project |
| POST | `/api/engineer/infrastructure/create` | Engineer+ | Create infrastructure |
| POST | `/api/officer/projects/approve` | Officer+ | Approve project |
| GET | `/api/admin/users` | Admin | List users |
| PUT | `/api/admin/users/{id}/role` | Admin | Change role |
| DELETE | `/api/admin/users/{id}` | Admin | Delete user |

---

## Usage Examples

### 1. User Registration

```python
from app.auth import AuthService
from sqlalchemy.orm import Session

async def register_user(db: Session, email_service):
    auth_service = AuthService(db, email_service)
    
    user, token = auth_service.register_user(
        register_data=UserRegisterRequest(
            username="john_doe",
            email="john@example.com",
            password="SecurePass123!@#"
        ),
        base_url="http://localhost:5000"
    )
    
    return user
```

### 2. Login & Get Tokens

```python
async def login_user(db: Session, email_service):
    auth_service = AuthService(db, email_service)
    
    success, auth_response, error = auth_service.login_user(
        login_data=UserLoginRequest(
            email="john@example.com",
            password="SecurePass123!@#"
        )
    )
    
    if success:
        return auth_response.access_token
    else:
        raise Exception(error)
```

### 3. Protected Route

```python
from fastapi import APIRouter, Depends
from app.auth import get_current_active_user

router = APIRouter()

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_active_user)):
    return current_user
```

### 4. Role-Based Access

```python
from app.auth import require_admin

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin)
):
    # Only admins can delete users
    pass
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    hashed_password VARCHAR(255) NOT NULL,
    role userrole DEFAULT 'CITIZEN',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ix_users_username ON users(username);
CREATE INDEX ix_users_email ON users(email);
```

---

## Error Handling

### HTTP Status Codes

| Code | Error | Example |
|------|-------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User doesn't exist |
| 409 | Conflict | Email already exists |
| 422 | Validation Error | Invalid data type |

### Exception Handling

All exceptions inherit from `HTTPException` and include proper HTTP status codes:

```python
# Authentication Exceptions
InvalidCredentialsException(401)
InvalidTokenException(401)
TokenExpiredException(401)

# Authorization Exceptions
InsufficientPermissionsException(403)
InsufficientRoleException(403)
AccountInactiveException(403)

# Registration Exceptions
EmailAlreadyExistsException(409)
UsernameAlreadyExistsException(409)
InvalidPasswordException(400)

# User Exceptions
UserNotFoundException(404)
```

---

## Security Features

### Password Security
- ✅ bcrypt hashing with cost factor 12
- ✅ Configurable strength requirements
- ✅ No plaintext storage
- ✅ Secure comparison

### Token Security
- ✅ JWT with HS256 algorithm
- ✅ Token expiration
- ✅ Token type validation
- ✅ Refresh token rotation

### Email Security
- ✅ Time-limited verification tokens
- ✅ One-time password reset tokens
- ✅ Email enumeration prevention
- ✅ HTML email templates

### Authorization
- ✅ OAuth2PasswordBearer scheme
- ✅ Role-based access control
- ✅ Hierarchical permissions
- ✅ Active user validation

---

## Testing

### Using Swagger UI

1. Navigate to http://localhost:5000/docs
2. Click "Try it out" on any endpoint
3. Fill in request body
4. Click "Execute"

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"Pass123!@#"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"Pass123!@#"}'

# Protected route
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Using Postman

1. Create collection "Auth System"
2. Set variables: `baseUrl`, `access_token`, `refresh_token`
3. Create requests for each endpoint
4. Use pre-request scripts to add authorization

---

## Production Deployment

### Checklist

- [ ] Change `DEBUG=False`
- [ ] Update `SECRET_KEY` to strong random string
- [ ] Use environment-specific `.env`
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for specific origins
- [ ] Implement rate limiting
- [ ] Setup email service (Gmail, SendGrid, etc.)
- [ ] Configure database backups
- [ ] Implement audit logging
- [ ] Setup monitoring & alerts
- [ ] Security headers configured
- [ ] Secrets management (AWS Secrets Manager, etc.)

### Recommended Settings

```env
DEBUG=False
SECRET_KEY=<generate-strong-random-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
DATABASE_URL=postgresql://user:pass@host/db
CORS_ORIGINS=["https://yourdomain.com"]
```

---

## Troubleshooting

### Email Not Sending

**Problem**: Verification/reset emails not being sent

**Solution**:
1. Check SMTP credentials in `.env`
2. Verify SMTP host and port are correct
3. For Gmail: Use "App Password" (not regular password)
4. Enable "Less secure app access" if needed
5. Check application logs for errors

### Token Validation Fails

**Problem**: "Could not validate credentials" error

**Solution**:
1. Verify `SECRET_KEY` matches between tokens and validation
2. Check token hasn't expired
3. Ensure `ALGORITHM` is HS256
4. Verify Bearer token format in Authorization header

### Cannot Login After Registration

**Problem**: Email verification required

**Solution**:
1. Check email for verification link
2. Click verification link or use token
3. Ensure `is_verified` field is True in database
4. Token expiration is 24 hours

### Permission Denied on Protected Routes

**Problem**: 403 Forbidden error

**Solution**:
1. Check user role in database
2. Verify role meets endpoint requirements
3. Ensure account is active (`is_active=True`)
4. Verify email is verified (`is_verified=True`)

---

## Performance Optimization

### Database
- Indexed on `username`, `email`
- Connection pooling configured
- Query optimization for listing users

### Caching
- Token validation cached in memory
- User objects cached during request

### Async Support
- Async email sending recommended for production
- Use Celery for background tasks

---

## Next Steps

1. **Customize**: Adapt roles and permissions to your needs
2. **Extend**: Add additional user fields or verification methods
3. **Integrate**: Use in your FastAPI endpoints
4. **Deploy**: Follow production deployment checklist
5. **Monitor**: Setup logging and monitoring

---

## Support & Documentation

- **API Documentation**: http://localhost:5000/docs
- **Authentication Guide**: `AUTHENTICATION_API_GUIDE.md`
- **Code Examples**: `app/auth/protected_routes.py`
- **Database Migrations**: `alembic/versions/`

---

## License

Infrastructure Digital Twin - Authentication System (Sprint 2)

---

**Created**: August 1, 2026  
**Version**: 2.0.0  
**Status**: Production-Ready
