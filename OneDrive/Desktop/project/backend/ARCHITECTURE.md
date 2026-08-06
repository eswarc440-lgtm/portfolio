# Authentication System Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FastAPI Application                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes (Router)                   │  │
│  │  ├─ POST /auth/register                                 │  │
│  │  ├─ GET  /auth/verify-email                             │  │
│  │  ├─ POST /auth/login                                    │  │
│  │  ├─ POST /auth/refresh                                  │  │
│  │  ├─ POST /auth/forgot-password                          │  │
│  │  ├─ POST /auth/reset-password                           │  │
│  │  ├─ GET  /auth/me (Protected)                           │  │
│  │  └─ Admin endpoints                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Dependencies (Authorization)                │  │
│  │  ├─ get_current_user()                                  │  │
│  │  ├─ get_current_active_user()                           │  │
│  │  ├─ get_current_verified_user()                         │  │
│  │  ├─ require_role()                                      │  │
│  │  ├─ require_admin()                                     │  │
│  │  ├─ require_officer()                                   │  │
│  │  └─ require_engineer()                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Business Logic Layer (Service)                │  │
│  │  ├─ register_user()                                     │  │
│  │  ├─ verify_email()                                      │  │
│  │  ├─ login_user()                                        │  │
│  │  ├─ refresh_access_token()                              │  │
│  │  ├─ request_password_reset()                            │  │
│  │  ├─ reset_password()                                    │  │
│  │  ├─ get_user_profile()                                  │  │
│  │  └─ update_user_profile()                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│         │                          │                            │
│         ▼                          ▼                            │
│  ┌─────────────────────┐  ┌──────────────────────┐            │
│  │   Repository        │  │  Security Utilities   │            │
│  │   (Data Access)     │  │                      │            │
│  │                     │  │  ├─ JWT Utils        │            │
│  │ ├─ get_user_by_id  │  │  ├─ Password Hashing  │            │
│  │ ├─ create_user     │  │  └─ Email Service     │            │
│  │ ├─ verify_email    │  │                      │            │
│  │ ├─ update_password │  │                      │            │
│  │ └─ ...             │  └──────────────────────┘            │
│  └─────────────────────┘                                      │
│         │                          │                            │
│         └──────────────┬───────────┘                            │
│                        ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         External Services                               │  │
│  │  ├─ Email Service (SMTP)                               │  │
│  │  ├─ JWT Token Management                               │  │
│  │  └─ Password Hashing (bcrypt)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                        │                                        │
│                        ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Database (PostgreSQL)                       │  │
│  │  ├─ Users Table                                         │  │
│  │  │  ├─ id (PK)                                          │  │
│  │  │  ├─ username (UNIQUE, INDEX)                         │  │
│  │  │  ├─ email (UNIQUE, INDEX)                            │  │
│  │  │  ├─ hashed_password                                  │  │
│  │  │  ├─ role (ENUM)                                      │  │
│  │  │  ├─ is_active                                        │  │
│  │  │  ├─ is_verified                                      │  │
│  │  │  ├─ created_at                                       │  │
│  │  │  └─ updated_at                                       │  │
│  │  └─ Indexes: username, email                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### 1. User Registration Flow

```
User
  │
  ├─ POST /auth/register
  │  {username, email, password}
  │
  ▼
Route Handler
  │
  ├─ Validate input (Pydantic)
  │
  ▼
AuthService.register_user()
  │
  ├─ Check email uniqueness (Repository)
  ├─ Check username uniqueness (Repository)
  ├─ Validate password strength
  │
  ▼
Password.hash_password()
  │
  ├─ Hash with bcrypt (cost=12)
  │
  ▼
AuthRepository.create_user()
  │
  ├─ Insert into database
  │
  ▼
JWT.create_email_verification_token()
  │
  ├─ Generate 24-hour token
  │
  ▼
EmailService.send_verification_email()
  │
  ├─ SMTP send with HTML template
  │
  ▼
Response: Success (201)
```

### 2. Login Flow

```
User
  │
  ├─ POST /auth/login
  │  {email, password}
  │
  ▼
Route Handler
  │
  ├─ Validate input
  │
  ▼
AuthService.login_user()
  │
  ├─ Get user by email (Repository)
  │
  ▼
Validations:
  ├─ Account active?
  ├─ Email verified?
  └─ Password matches? (Password.verify_password)
  │
  ▼
JWT.create_access_token()
  │
  ├─ Create 15-min token
  │
  ▼
JWT.create_refresh_token()
  │
  ├─ Create 7-day token
  │
  ▼
Response: AuthResponse
  {
    access_token,
    refresh_token,
    token_type: "bearer",
    expires_in: 900,
    user: {...}
  }
```

### 3. Protected Route Access Flow

```
Client with JWT
  │
  ├─ GET /auth/me
  │  Authorization: Bearer <access_token>
  │
  ▼
Route Handler
  │
  ├─ Call Depends(get_current_active_user)
  │
  ▼
get_current_active_user()
  │
  ├─ Call get_current_user() dependency
  │
  ▼
get_current_user()
  │
  ├─ Extract token from header
  │
  ▼
JWT.decode_access_token()
  │
  ├─ Validate signature
  ├─ Check expiration
  ├─ Verify token type
  │
  ▼
Extract user_id from payload
  │
  ▼
AuthRepository.get_user_by_id()
  │
  ├─ Query database
  │
  ▼
Validate user status
  │
  ├─ Is active? (get_current_active_user)
  ├─ Is verified? (get_current_verified_user)
  │
  ▼
Return User object
  │
  ▼
Route Handler processes request
  │
  ▼
Response
```

### 4. RBAC Flow (Role-Based Access Control)

```
Protected Admin Route
  │
  ├─ Depends(require_admin)
  │
  ▼
require_admin()
  │
  ├─ Get current_user (get_current_active_user)
  │
  ▼
Check: user.role == UserRole.ADMIN
  │
  ├─ If YES → Continue to route handler
  │
  ├─ If NO → Raise HTTPException(403)
  │
  ▼
Route Handler / Error Response
```

### 5. Password Reset Flow

```
User
  │
  ├─ POST /auth/forgot-password
  │  {email}
  │
  ▼
AuthService.request_password_reset()
  │
  ├─ Get user by email
  │ (Return success even if not found)
  │
  ▼
JWT.create_password_reset_token()
  │
  ├─ Create 1-hour token
  │
  ▼
EmailService.send_password_reset_email()
  │
  ├─ SMTP send with reset link
  │
  ▼
User clicks reset link
  │
  ├─ POST /auth/reset-password
  │  {token, new_password}
  │
  ▼
JWT.decode_password_reset_token()
  │
  ├─ Validate token & expiration
  │
  ▼
Password.validate_password_strength()
  │
  ├─ Check requirements
  │
  ▼
Password.hash_password()
  │
  ├─ Hash new password
  │
  ▼
AuthRepository.update_password()
  │
  ├─ Update database
  │
  ▼
Response: Success
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Schemas (Pydantic)                      │
│  UserRegisterRequest, UserLoginRequest, TokenResponse, etc.     │
└─────────────────────────────────────────────────────────────────┘
         △                                                    △
         │                                                    │
         │                                                    │
┌────────┴────────────────────────────────────────────────────┴──┐
│                     Router (FastAPI)                            │
│  Validates requests → Calls Services → Returns responses        │
└───────────────────────────────────────────────────────────────┬─┘
         △                                                    │
         │                                                    ▼
         │                                        ┌──────────────────────┐
         │                                        │  Dependencies        │
         │                                        │  (Authorization)     │
         │                                        └──────────────────────┘
         │                                                    │
         │                                                    ▼
         │                                        JWT.decode_access_token()
         │                                                    │
         │                                                    ▼
         │                                        Repository.get_user_by_id()
         │                                                    │
         │                                                    ▼
         │                                        Validate user status
         │                                                    │
         └────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │    Service Layer (Business)      │
        │  - register_user                 │
        │  - login_user                    │
        │  - verify_email                  │
        │  - reset_password                │
        │  - etc.                          │
        └──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    Repository    Security Utils      Email Service
    (Data)        (JWT, Password)      (SMTP)
         │                 │                 │
         │                 ▼                 │
         │          JWT Utils         Email Templates
         │          Password Utils           │
         │          Validators              │
         │                                   │
         └─────────────────┬─────────────────┘
                           │
                           ▼
                   PostgreSQL Database
```

---

## Data Flow: User Registration Example

```
Request Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!@#"
}
       │
       ▼
Pydantic Validation
  ├─ Email format
  ├─ Username format
  ├─ Password strength
       │
       ▼
Service Layer
  ├─ Check email uniqueness (→ Repository → DB)
  ├─ Check username uniqueness (→ Repository → DB)
  ├─ Validate password strength
       │
       ▼
Hash Password
  bcrypt.hash(password, rounds=12) → hashed_password
       │
       ▼
Create User
  INSERT INTO users (username, email, hashed_password, ...)
       │
       ▼
Generate Token
  JWT.encode(
    {"sub": user_id},
    SECRET_KEY,
    algorithm="HS256",
    expires=24_hours
  ) → verification_token
       │
       ▼
Send Email
  EmailService.send_verification_email(
    to_email="john@example.com",
    verification_url=f"...?token={verification_token}"
  ) → SMTP
       │
       ▼
Response
{
  "success": true,
  "message": "Registration successful. Verification email sent."
}
```

---

## Token Structure

### Access Token Payload

```python
{
    "sub": "1",              # User ID
    "role": "CITIZEN",       # User role
    "exp": 1689999999,       # Expiration (15 minutes)
    "type": "access",        # Token type
    "iat": 1689999699        # Issued at
}
```

### Refresh Token Payload

```python
{
    "sub": "1",              # User ID
    "exp": 1690604499,       # Expiration (7 days)
    "type": "refresh",       # Token type
    "iat": 1689999699        # Issued at
}
```

### Email Verification Token Payload

```python
{
    "sub": "1",              # User ID
    "exp": 1690086299,       # Expiration (24 hours)
    "type": "email_verification",  # Token type
    "iat": 1689999699        # Issued at
}
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Security Layers                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Input Validation                                     │
│  ├─ Pydantic schemas validate all inputs                       │
│  ├─ Email format validation                                    │
│  ├─ Password strength validation                               │
│  └─ Type checking                                              │
│                                                                 │
│  Layer 2: Authentication                                       │
│  ├─ JWT token validation                                       │
│  ├─ Token signature verification                               │
│  ├─ Token expiration checking                                  │
│  └─ Token type validation                                      │
│                                                                 │
│  Layer 3: Password Security                                    │
│  ├─ bcrypt hashing (cost=12)                                   │
│  ├─ Secure comparison                                          │
│  ├─ Never store plaintext                                      │
│  └─ Configurable requirements                                  │
│                                                                 │
│  Layer 4: Authorization                                        │
│  ├─ User status validation                                     │
│  ├─ Email verification check                                   │
│  ├─ Account active check                                       │
│  └─ Role-based access control                                  │
│                                                                 │
│  Layer 5: Data Access                                          │
│  ├─ User existence checks                                      │
│  ├─ Indexed queries (email, username)                          │
│  ├─ Proper error handling                                      │
│  └─ No sensitive data in responses                             │
│                                                                 │
│  Layer 6: Error Handling                                       │
│  ├─ Consistent error codes                                     │
│  ├─ No information leakage                                     │
│  ├─ Generic messages for sensitive errors                      │
│  └─ Proper HTTP status codes                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- User roles enumeration
CREATE TYPE userrole AS ENUM ('ADMIN', 'OFFICER', 'ENGINEER', 'CITIZEN');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    
    -- User information
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    
    -- Security
    hashed_password VARCHAR(255) NOT NULL,
    
    -- Role & Status
    role userrole DEFAULT 'CITIZEN' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX ix_users_username ON users(username);
CREATE INDEX ix_users_email ON users(email);
```

---

## Configuration Hierarchy

```
Environment Variables (.env)
    │
    ▼
Settings Class (Pydantic)
    ├─ Database: DATABASE_URL
    ├─ JWT: SECRET_KEY, ALGORITHM, token expiration
    ├─ Email: SMTP credentials, sender info
    ├─ Security: Password requirements
    └─ Logging: LOG_LEVEL
    │
    ▼
Application Configuration
    ├─ Router setup
    ├─ Middleware setup
    ├─ Exception handlers
    └─ CORS configuration
    │
    ▼
Runtime Application
```

---

## Error Handling Flow

```
Error Occurs in Route/Service
    │
    ▼
Identify Error Type
    │
    ├─ Validation Error (422)
    ├─ Authentication Error (401)
    ├─ Authorization Error (403)
    ├─ Not Found Error (404)
    ├─ Conflict Error (409)
    └─ Server Error (500)
    │
    ▼
Raise Appropriate Exception
    │
    ├─ Custom exception class
    ├─ Proper HTTP status code
    ├─ Descriptive message
    └─ No sensitive information
    │
    ▼
FastAPI Exception Handler
    │
    ▼
HTTP Response
    │
    ├─ Status code
    ├─ Error message
    └─ Error details (if applicable)
    │
    ▼
Logging
    │
    └─ Log level appropriate to error
```

---

## Deployment Architecture

```
┌────────────────────────────────────────┐
│       Production Environment            │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Load Balancer (nginx/HAProxy)  │ │
│  └──────────────────────────────────┘ │
│                  │                     │
│        ┌─────────┼─────────┐           │
│        │         │         │           │
│        ▼         ▼         ▼           │
│  ┌──────────┬──────────┬──────────┐   │
│  │ Instance │ Instance │ Instance │   │
│  │   #1     │   #2     │   #3     │   │
│  └──────────┴──────────┴──────────┘   │
│        │         │         │           │
│        └─────────┼─────────┘           │
│                  │                     │
│                  ▼                     │
│  ┌──────────────────────────────────┐ │
│  │  PostgreSQL Database (Replicated)│ │
│  │  - Master (Read/Write)           │ │
│  │  - Replicas (Read-only)          │ │
│  └──────────────────────────────────┘ │
│                  │                     │
│        ┌─────────┼─────────┐           │
│        │         │         │           │
│        ▼         ▼         ▼           │
│  ┌──────────┬──────────┬──────────┐   │
│  │  Redis   │  Redis   │  Redis   │   │
│  │  Cache 1 │  Cache 2 │  Cache 3 │   │
│  │ (Cluster)            │           │
│  └──────────┴──────────┴──────────┘   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Email Service (SendGrid/SES)    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Monitoring & Logging (ELK)      │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

---

## Performance Considerations

| Component | Operation | Time | Notes |
|-----------|-----------|------|-------|
| Password Hash | bcrypt cost 12 | ~100ms | Intentionally slow |
| JWT Validation | Token decode | <1ms | In-memory validation |
| DB Query | get_user_by_email | <10ms | Indexed lookup |
| Email Send | SMTP | 100-500ms | External service |
| Full Auth Flow | Register→Verify→Login | ~200-300ms | Total time |

---

## Conclusion

This architecture provides:

✅ **Security**: Multiple layers of validation and protection  
✅ **Scalability**: Stateless design, horizontal scaling  
✅ **Maintainability**: Clean separation of concerns  
✅ **Performance**: Optimized queries with indexes  
✅ **Reliability**: Proper error handling and logging  

The system is production-ready and designed for enterprise-scale applications.
