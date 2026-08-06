# Sprint 2: Authentication & Authorization System - API Guide

Complete guide to test all authentication and protected endpoints with sample requests and responses.

---

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Protected Routes](#protected-routes)
4. [Error Handling](#error-handling)
5. [Integration Examples](#integration-examples)

---

## Setup & Configuration

### Prerequisites

```bash
# Install dependencies
pip install fastapi
pip install sqlalchemy
pip install psycopg2-binary
pip install python-jose[cryptography]
pip install passlib[bcrypt]
pip install python-multipart
pip install pydantic
pip install pydantic-settings
pip install jinja2
pip install alembic
```

### Database Setup

```bash
# Run Alembic migrations to create tables
alembic upgrade head
```

### Environment Configuration

Create/update `.env` file:

```env
APP_NAME=Infrastructure Digital Twin
DEBUG=True
API_HOST=127.0.0.1
API_PORT=5000
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/auth_db
LOG_LEVEL=INFO

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@infrastructure-digital-twin.com
EMAIL_FROM_NAME=Infrastructure Digital Twin

# Security Configuration
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true

# Token Expiration
EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS=24
PASSWORD_RESET_TOKEN_EXPIRE_HOURS=1
```

### Register Routers in main.py

```python
from fastapi import FastAPI
from app.auth.router import router as auth_router
from app.auth.protected_routes import router as protected_router

app = FastAPI(title="Infrastructure Digital Twin")

# Include routers
app.include_router(auth_router)
app.include_router(protected_router)

@app.get("/")
def home():
    return {"message": "API Running"}
```

### Run Application

```bash
# Development
uvicorn app.main:app --reload --host 127.0.0.1 --port 5000

# Access Swagger UI
# http://localhost:5000/docs
```

---

## Authentication Endpoints

### 1. User Registration

**Endpoint**: `POST /auth/register`

**Description**: Create new user account and send email verification

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!@#",
  "phone_number": "+1234567890"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Registration successful. Verification email sent to john@example.com"
}
```

**Error Response - Email Already Exists** (409 Conflict):
```json
{
  "detail": "john@example.com is already registered"
}
```

**Error Response - Invalid Password** (400 Bad Request):
```json
{
  "detail": "Password must contain uppercase letter"
}
```

**Error Response - Username Already Exists** (409 Conflict):
```json
{
  "detail": "Username 'john_doe' is already taken"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!@#",
    "phone_number": "+1234567890"
  }'
```

---

### 2. Email Verification

**Endpoint**: `GET /auth/verify-email?token=<verification_token>`

**Description**: Verify user email address

**Query Parameters**:
- `token` (string): Email verification token from email

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Response - Invalid Token** (400 Bad Request):
```json
{
  "detail": "Invalid or expired verification token"
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/auth/verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. User Login

**Endpoint**: `POST /auth/login`

**Description**: Authenticate user and get JWT tokens

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!@#"
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6IkNJVElaRU4iLCJleHAiOjE2ODk5OTk5OTksInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE2ODk5OTk2OTl9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNjkwNjA0NDk5LCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTY4OTk5OTY5OX0...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "role": "CITIZEN",
    "is_active": true,
    "is_verified": true,
    "created_at": "2026-08-01T20:50:00",
    "updated_at": "2026-08-01T20:50:00"
  }
}
```

**Error Response - Invalid Credentials** (401 Unauthorized):
```json
{
  "detail": "Invalid email or password"
}
```

**Error Response - Email Not Verified** (403 Forbidden):
```json
{
  "detail": "Please verify your email before logging in"
}
```

**Error Response - Account Inactive** (403 Forbidden):
```json
{
  "detail": "Your account has been deactivated"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!@#"
  }'
```

---

### 4. Refresh Access Token

**Endpoint**: `POST /auth/refresh`

**Description**: Generate new access token using refresh token

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

**Error Response - Invalid Refresh Token** (401 Unauthorized):
```json
{
  "detail": "Invalid refresh token"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

### 5. Forgot Password

**Endpoint**: `POST /auth/forgot-password`

**Description**: Request password reset link

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "If email exists, password reset link will be sent"
}
```

**Note**: Always returns success for security (prevents email enumeration)

**cURL Example**:
```bash
curl -X POST http://localhost:5000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

---

### 6. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Description**: Reset password with token

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewSecurePass456!@#"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Response - Invalid Token** (400 Bad Request):
```json
{
  "detail": "Invalid or expired reset token"
}
```

**Error Response - Invalid Password** (400 Bad Request):
```json
{
  "detail": "INVALID_PASSWORD: Password must contain number"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "new_password": "NewSecurePass456!@#"
  }'
```

---

### 7. Logout

**Endpoint**: `POST /auth/logout`

**Description**: Logout user (client-side logout)

**Headers Required**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Response - Not Authenticated** (401 Unauthorized):
```json
{
  "detail": "Not authenticated"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 8. Get Password Requirements

**Endpoint**: `GET /auth/password-requirements`

**Description**: Get current password strength requirements

**Success Response** (200 OK):
```json
{
  "min_length": 8,
  "require_uppercase": true,
  "require_numbers": true,
  "require_special_chars": true,
  "special_chars_allowed": "!@#$%^&*(),.?\":{}|<>"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:5000/auth/password-requirements
```

---

### 9. Get Current User Profile

**Endpoint**: `GET /auth/me`

**Description**: Get authenticated user's profile

**Headers Required**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "role": "CITIZEN",
  "is_active": true,
  "is_verified": true,
  "created_at": "2026-08-01T20:50:00",
  "updated_at": "2026-08-01T20:50:00"
}
```

**Error Response - Not Authenticated** (401 Unauthorized):
```json
{
  "detail": "Not authenticated"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 10. Update User Profile

**Endpoint**: `PUT /auth/me`

**Description**: Update current user's profile

**Headers Required**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "username": "john_doe_updated",
  "phone_number": "+9876543210"
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "username": "john_doe_updated",
  "email": "john@example.com",
  "phone_number": "+9876543210",
  "role": "CITIZEN",
  "is_active": true,
  "is_verified": true,
  "created_at": "2026-08-01T20:50:00",
  "updated_at": "2026-08-01T20:51:00"
}
```

**Error Response - Username Already Taken** (409 Conflict):
```json
{
  "detail": "Username already taken"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:5000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe_updated",
    "phone_number": "+9876543210"
  }'
```

---

## Protected Routes

### 1. Get Public Info

**Endpoint**: `GET /api/public/info`

**Description**: Public endpoint (no authentication)

**Success Response** (200 OK):
```json
{
  "message": "This is public information",
  "status": "available to all users"
}
```

---

### 2. Get User Dashboard

**Endpoint**: `GET /api/users/me/dashboard`

**Description**: Get personalized user dashboard

**Headers Required**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "CITIZEN",
  "account_status": "active",
  "email_verified": true,
  "member_since": "2026-08-01T20:50:00"
}
```

---

### 3. Create Project (Verified Email Required)

**Endpoint**: `POST /api/verified/create-project`

**Description**: Create project (requires verified email)

**Headers Required**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "name": "Digital Twin Infrastructure"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Project created successfully",
  "project": {
    "id": 1,
    "name": "Digital Twin Infrastructure",
    "owner_id": 1,
    "created_by": "john_doe"
  }
}
```

**Error Response - Email Not Verified** (403 Forbidden):
```json
{
  "detail": "Email address not verified"
}
```

---

### 4. Create Infrastructure (Engineer+ Role)

**Endpoint**: `POST /api/engineer/infrastructure/create`

**Description**: Create infrastructure (requires engineer role or higher)

**Headers Required**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "name": "Water Distribution System"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Infrastructure created successfully",
  "infrastructure": {
    "id": 1,
    "name": "Water Distribution System",
    "created_by": "engineer_user",
    "role_created_by": "ENGINEER"
  }
}
```

**Error Response - Insufficient Role** (403 Forbidden):
```json
{
  "detail": "Engineer, Officer, or Admin access required"
}
```

---

### 5. Approve Project (Officer+ Role)

**Endpoint**: `POST /api/officer/projects/approve`

**Description**: Approve project (officer+ role)

**Headers Required**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "project_id": 1
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Project 1 approved",
  "approved_by": "officer_user",
  "role": "OFFICER",
  "approval_timestamp": "2026-08-01T20:50:00Z"
}
```

**Error Response - Insufficient Role** (403 Forbidden):
```json
{
  "detail": "Officer or Admin access required"
}
```

---

### 6. Admin - List All Users

**Endpoint**: `GET /api/admin/users?skip=0&limit=10`

**Description**: List all users (admin only)

**Headers Required**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `skip` (int): Offset for pagination
- `limit` (int): Number of items to return

**Success Response** (200 OK):
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "username": "user1",
      "email": "user1@example.com",
      "role": "CITIZEN",
      "is_active": true,
      "is_verified": true
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 10
}
```

**Error Response - Not Admin** (403 Forbidden):
```json
{
  "detail": "Admin access required"
}
```

---

### 7. Admin - Change User Role

**Endpoint**: `PUT /api/admin/users/{user_id}/role`

**Description**: Change user role (admin only)

**Headers Required**:
```
Authorization: Bearer <access_token>
```

**Path Parameters**:
- `user_id` (int): User ID

**Request Body**:
```json
{
  "role": "ENGINEER"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User 1 role changed to ENGINEER",
  "changed_by": "admin_user",
  "new_role": "ENGINEER"
}
```

**Error Response - Invalid Role** (400 Bad Request):
```json
{
  "detail": "Invalid role. Allowed: CITIZEN, ENGINEER, OFFICER, ADMIN"
}
```

---

### 8. Admin - Deactivate User

**Endpoint**: `PUT /api/admin/users/{user_id}/deactivate`

**Description**: Deactivate user (admin only)

**Headers Required**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "reason": "Suspicious activity"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User 1 deactivated",
  "deactivated_by": "admin_user",
  "reason": "Suspicious activity"
}
```

---

### 9. Admin - Delete User

**Endpoint**: `DELETE /api/admin/users/{user_id}`

**Description**: Delete user permanently (admin only)

**Headers Required**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User 1 deleted permanently",
  "deleted_by": "admin_user",
  "action": "permanent_deletion"
}
```

---

## Error Handling

### Common HTTP Status Codes

| Status | Description | Example |
|--------|-------------|---------|
| 200 | OK | Successful operation |
| 201 | Created | User registered |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User doesn't exist |
| 409 | Conflict | Email already registered |
| 422 | Validation Error | Invalid data type |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Errors

**1. Missing Authorization Header**
```json
{
  "detail": "Not authenticated"
}
```

**2. Invalid Token**
```json
{
  "detail": "Could not validate credentials"
}
```

**3. Expired Token**
```json
{
  "detail": "Could not validate credentials"
}
```

**4. Insufficient Permissions**
```json
{
  "detail": "This action requires [role] role or higher"
}
```

---

## Integration Examples

### Example 1: Complete Authentication Flow

```bash
# 1. Register user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!@#"
  }'

# Response: Verification email sent to john@example.com

# 2. Verify email (use token from email)
curl -X GET "http://localhost:5000/auth/verify-email?token=VERIFICATION_TOKEN"

# Response: Email verified successfully

# 3. Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!@#"
  }'

# Response: access_token and refresh_token

# 4. Access protected route
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer ACCESS_TOKEN"

# Response: User profile
```

### Example 2: Token Refresh Flow

```bash
# When access token expires, use refresh token
curl -X POST http://localhost:5000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "REFRESH_TOKEN"
  }'

# Response: New access token
```

### Example 3: Password Reset Flow

```bash
# 1. Request password reset
curl -X POST http://localhost:5000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'

# Response: Reset email sent if email exists

# 2. Reset password (use token from email)
curl -X POST http://localhost:5000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN",
    "new_password": "NewSecurePass456!@#"
  }'

# Response: Password reset successful
```

### Example 4: Admin Operations

```bash
# Get all users (admin only)
curl -X GET "http://localhost:5000/api/admin/users?skip=0&limit=10" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"

# Change user role (admin only)
curl -X PUT http://localhost:5000/api/admin/users/1/role \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ENGINEER"
  }'

# Deactivate user (admin only)
curl -X PUT http://localhost:5000/api/admin/users/1/deactivate \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Suspicious activity"
  }'

# Delete user (admin only)
curl -X DELETE http://localhost:5000/api/admin/users/1 \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

---

## Testing with Postman

1. **Create Collection**: "Infrastructure Digital Twin Auth"

2. **Set Variables**:
   - `baseUrl`: http://localhost:5000
   - `access_token`: (will be filled after login)
   - `refresh_token`: (will be filled after login)

3. **Create Requests**:
   - POST /auth/register
   - GET /auth/verify-email
   - POST /auth/login (save tokens to variables)
   - POST /auth/refresh
   - GET /auth/me
   - POST /auth/logout
   - GET /api/admin/users (admin only)

4. **Use Pre-request Scripts**:
   ```javascript
   // Add authorization header automatically
   pm.request.headers.add({
     key: "Authorization",
     value: "Bearer " + pm.variables.get("access_token")
   });
   ```

---

## Troubleshooting

### Issue: Email not being sent

**Solution**: Check SMTP settings in `.env`
- Verify SMTP host and port
- Check credentials (use app password for Gmail)
- Enable "Less secure app access" if using Gmail

### Issue: Token validation fails

**Solution**: Verify token configuration
- Check `SECRET_KEY` is set in `.env`
- Verify `ALGORITHM` is HS256
- Ensure token hasn't expired

### Issue: Cannot log in after registration

**Solution**: Email must be verified first
- Check email for verification link
- Verify token expiration (24 hours)
- Check database: `is_verified` field must be true

### Issue: Permission denied errors

**Solution**: Verify user role
- Check user role in database
- Verify role-based access requirements
- Ensure user is active (`is_active = true`)

---

## Performance Considerations

1. **Token Expiration**: Access token (15 min), Refresh token (7 days)
2. **Password Hashing**: bcrypt with cost factor 12
3. **Database Queries**: Indexed on email and username
4. **Email Delivery**: Async recommended for production
5. **Rate Limiting**: Implement per production requirements

---

## Security Best Practices

1. **Never expose tokens in logs**
2. **Use HTTPS in production**
3. **Rotate SECRET_KEY regularly**
4. **Implement rate limiting on auth endpoints**
5. **Use environment variables for secrets**
6. **Enable CORS only for trusted origins**
7. **Validate all input data**
8. **Use strong passwords (enforce requirements)**
9. **Implement audit logging**
10. **Regular security updates**

---

## Production Deployment Checklist

- [ ] Change `DEBUG=False`
- [ ] Update `SECRET_KEY` with strong random value
- [ ] Use environment-specific `.env`
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Configure email service properly
- [ ] Set up monitoring and alerts
- [ ] Regular backups of database
- [ ] Implement audit logging
- [ ] Security headers configured
- [ ] Secrets management in place

---

## Next Steps

1. Run migrations: `alembic upgrade head`
2. Start server: `uvicorn app.main:app --reload`
3. Open Swagger UI: http://localhost:5000/docs
4. Test endpoints as shown in examples above
5. Implement in your application using auth dependencies
6. Deploy to production with security hardening

---

**End of Authentication API Guide**
