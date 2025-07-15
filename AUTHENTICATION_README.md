# Authentication & User Management System

## Overview

This document describes the comprehensive authentication and user management system implemented for the Retell AI Lead Management application. The system provides secure JWT-based authentication with refresh tokens, role-based access control, and complete user management capabilities.

## Features Implemented

### ✅ Authentication Features
- [x] JWT-based authentication with access and refresh tokens
- [x] User registration and login
- [x] Password hashing and validation with bcrypt
- [x] Token refresh mechanism
- [x] Session management
- [x] Logout functionality
- [x] Password reset functionality

### ✅ User Management Features
- [x] User CRUD operations
- [x] Role-based access control (Admin, Manager, User)
- [x] User profile management
- [x] Account activation/deactivation
- [x] User activity tracking (last login)

### ✅ Security Features
- [x] Password strength validation
- [x] Rate limiting for auth endpoints
- [x] Input validation and sanitization
- [x] Secure headers (Helmet)
- [x] CORS protection
- [x] Audit logging

## Technical Architecture

### Backend Structure

```
backend/
├── src/
│   ├── models/User.ts              # User model and interfaces
│   ├── services/authService.ts     # Authentication business logic
│   ├── controllers/authController.ts # HTTP request handlers
│   ├── middleware/
│   │   ├── auth.ts                 # JWT authentication middleware
│   │   └── validation.ts           # Input validation rules
│   ├── routes/auth.ts              # Authentication routes
│   └── config/environment.ts       # Configuration management
```

### Frontend Structure

```
frontend/
├── src/
│   ├── types/auth.ts               # TypeScript interfaces
│   ├── services/authService.ts     # API service layer
│   ├── context/AuthContext.tsx     # React context for auth state
│   ├── components/
│   │   └── common/ProtectedRoute.tsx # Route protection component
│   └── pages/
│       ├── Login.tsx               # Login page
│       └── Users.tsx               # User management page
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/refresh-token` | Refresh access token | Public |
| POST | `/api/auth/logout` | User logout | Protected |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| GET | `/api/auth/me` | Get current user profile | Protected |
| PUT | `/api/auth/profile` | Update current user profile | Protected |
| PUT | `/api/auth/password` | Change password | Protected |

### User Management Endpoints (Admin Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/auth/users` | Get all users | Admin |
| GET | `/api/auth/users/:id` | Get user by ID | Admin |
| PUT | `/api/auth/users/:id` | Update user | Admin |
| DELETE | `/api/auth/users/:id` | Delete user | Admin |

## User Roles

### Role Hierarchy
1. **Admin** - Full system access, user management
2. **Manager** - Lead and client management
3. **User** - Basic access to assigned leads

### Role Permissions

| Feature | Admin | Manager | User |
|---------|-------|---------|------|
| Dashboard | ✅ | ✅ | ✅ |
| Clients | ✅ | ✅ | ✅ |
| Leads | ✅ | ✅ | ✅ |
| Calls | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ |
| Analytics | ✅ | ✅ | ❌ |

## Security Implementation

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### JWT Configuration
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- **Secret Keys**: Separate secrets for access and refresh tokens

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 requests per 15 minutes

## Environment Variables

### Required Variables
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Other required variables...
```

## Usage Examples

### Backend Usage

#### Creating a Protected Route
```typescript
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

// Basic protection
router.get('/protected', authenticateToken, controller.handler);

// Role-based protection
router.get('/admin-only', 
  authenticateToken, 
  requireRole([UserRole.ADMIN]), 
  controller.handler
);
```

#### User Registration
```typescript
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'SecurePass123!',
  role: UserRole.USER
};

const authResponse = await authService.register(userData);
// Returns: { user, token, refreshToken }
```

### Frontend Usage

#### Protected Route Component
```typescript
import ProtectedRoute from '../components/common/ProtectedRoute';
import { UserRole } from '../types/auth';

// Basic protection
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Role-based protection
<ProtectedRoute requiredRole={[UserRole.ADMIN]}>
  <UserManagement />
</ProtectedRoute>
```

#### Authentication Context
```typescript
import { useAuth } from '../context/AuthContext';

const { user, login, logout, isAuthenticated } = useAuth();

// Login
await login({ email: 'user@example.com', password: 'password' });

// Check authentication
if (isAuthenticated) {
  // User is logged in
}

// Logout
logout();
```

## Token Management

### Automatic Token Refresh
The frontend automatically handles token refresh when:
1. An API request returns a 401 error
2. A valid refresh token exists
3. The refresh token hasn't expired

### Token Storage
- **Access Token**: Stored in localStorage (15min expiry)
- **Refresh Token**: Stored in localStorage (7 days expiry)
- **Automatic Cleanup**: Tokens are removed on logout or refresh failure

## Error Handling

### Common Error Responses
```typescript
// Authentication Error
{
  success: false,
  error: "Invalid credentials",
  statusCode: 401
}

// Validation Error
{
  success: false,
  error: "Email is required, Password must be at least 8 characters",
  statusCode: 400
}

// Authorization Error
{
  success: false,
  error: "User role user is not authorized to access this route",
  statusCode: 403
}
```

## Testing

### Backend Testing
```bash
# Run tests
npm test

# Test coverage
npm run test:coverage
```

### Frontend Testing
```bash
# Run tests
npm test

# Test specific file
npm test -- --testPathPattern=Login.test.tsx
```

## Security Best Practices

### Implemented
- ✅ Password hashing with bcrypt
- ✅ JWT token expiration
- ✅ Rate limiting
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Secure headers
- ✅ Role-based access control

### Recommended for Production
- [ ] HTTPS enforcement
- [ ] Database connection encryption
- [ ] Audit logging to external service
- [ ] Email verification for new accounts
- [ ] Two-factor authentication
- [ ] Session management with Redis
- [ ] API key rotation
- [ ] Security headers (HSTS, CSP)

## Deployment Considerations

### Environment Setup
1. Set strong JWT secrets
2. Configure rate limiting
3. Set up proper CORS origins
4. Enable HTTPS
5. Configure logging

### Database Migration
If migrating from existing user data:
1. Update user table structure
2. Hash existing passwords
3. Set default roles
4. Update existing tokens

## Troubleshooting

### Common Issues

#### Token Expired
- **Symptom**: 401 errors after 15 minutes
- **Solution**: Automatic refresh should handle this
- **Manual Fix**: Logout and login again

#### Refresh Token Invalid
- **Symptom**: Redirected to login unexpectedly
- **Solution**: Clear localStorage and login again
- **Prevention**: Check token expiration logic

#### Rate Limited
- **Symptom**: "Too many requests" error
- **Solution**: Wait 15 minutes or contact admin
- **Prevention**: Implement exponential backoff

## Future Enhancements

### Planned Features
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)
- [ ] User activity dashboard
- [ ] Advanced role permissions
- [ ] Audit trail
- [ ] Bulk user operations

### Performance Optimizations
- [ ] Redis session storage
- [ ] Token blacklisting
- [ ] Database connection pooling
- [ ] API response caching

## Support

For issues or questions about the authentication system:
1. Check the troubleshooting section
2. Review the API documentation
3. Check server logs for errors
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0