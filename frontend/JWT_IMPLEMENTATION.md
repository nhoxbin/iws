# JWT Authentication Implementation

This document describes the JWT (JSON Web Token) authentication implementation in the frontend application.

## Overview

The application uses JWT tokens for secure authentication and authorization. All API requests are authenticated using Bearer tokens in the Authorization header.

## Architecture

### 1. JWT Utilities (`src/lib/jwt.ts`)

Core functions for JWT token management:

- **`decodeToken(token: string)`** - Decodes a JWT token and returns the payload
- **`isTokenExpired(token: string)`** - Checks if a token has expired
- **`getUserFromToken(token: string)`** - Extracts user information from token
- **`getTokenExpiry(token: string)`** - Gets the expiration date of a token

### 2. Authentication Store (`src/lib/auth-store.ts`)

Zustand store for managing authentication state:

- **State:**

  - `user` - Current user information (decoded from JWT)
  - `token` - JWT access token
  - `isAuthenticated` - Boolean authentication status

- **Actions:**
  - `setAuth(token)` - Authenticates user by decoding and storing JWT token
  - `updateUser(user)` - Updates user information in the store
  - `logout()` - Clears authentication state
  - `checkAuth()` - Validates token and authentication status

### 3. API Configuration (`src/lib/api.ts`)

Axios instance with JWT interceptors:

**Request Interceptor:**

- Automatically adds `Bearer {token}` to Authorization header
- Checks token expiration before each request
- Redirects to login if token is expired

**Response Interceptor:**

- Handles 401 errors automatically
- Attempts to refresh token on authentication failure
- Retries failed requests with new token
- Redirects to login if refresh fails

## API Endpoints

The backend should provide these endpoints:

### Authentication Endpoints

```
POST /api/register
Body: { name, email, password, password_confirmation }
Response: { token: string }

POST /api/login
Body: { email, password }
Response: { token: string }

POST /api/refresh
Response: { token: string }

POST /api/user/role
Headers: Authorization: Bearer {token}
Body: { role: string }
Response: { success: boolean }
```

## JWT Token Structure

The JWT token should contain the following payload:

```json
{
  "sub": "user-id", // Subject (user ID)
  "email": "user@example.com",
  "name": "User Name",
  "role": "junior", // Optional: user role
  "iat": 1234567890, // Issued at (timestamp)
  "exp": 1234567890 // Expiration (timestamp)
}
```

## Environment Configuration

The API base URL is automatically selected based on environment:

- **Development:** `http://iws.local`
- **Production:** `https://iws.com`

Set via `NODE_ENV` environment variable.

## Token Storage

- Tokens are stored in `localStorage` with key `token`
- Auth state is persisted using Zustand persist middleware
- Token is automatically checked on page load/refresh

## Security Features

1. **Token Expiration Checking**

   - Tokens are validated before each API request
   - Expired tokens trigger automatic logout

2. **Automatic Token Refresh**

   - On 401 errors, attempts to refresh token
   - Seamlessly retries failed requests with new token

3. **Secure Headers**

   - Uses Bearer token authentication
   - Enables `withCredentials` for cookie-based refresh tokens

4. **Client-Side Validation**
   - Tokens are decoded and validated on the client
   - User info is extracted directly from JWT

## Usage Examples

### Login Flow

```typescript
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const setAuth = useAuthStore((state) => state.setAuth);

const response = await api.post("/api/login", { email, password });
const { token } = response.data;

setAuth(token); // Automatically decodes and stores user info
router.push("/dashboard");
```

### Making Authenticated Requests

```typescript
import api from "@/lib/api";

// Token is automatically added to Authorization header
const response = await api.get("/api/user/profile");
```

### Checking Authentication

```typescript
import { useAuthStore } from "@/lib/auth-store";

const { isAuthenticated, user } = useAuthStore();

if (isAuthenticated) {
  console.log("User:", user.name, user.email, user.role);
}
```

### Logout

```typescript
import { useAuthStore } from "@/lib/auth-store";

const logout = useAuthStore((state) => state.logout);

logout(); // Clears token and user info
router.push("/");
```

## Protected Routes

Pages check authentication status and redirect if needed:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

export default function ProtectedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return null; // Or loading spinner
  }

  return <div>Protected Content</div>;
}
```

## Token Refresh Flow

1. User makes API request
2. Request fails with 401 error
3. Interceptor catches error
4. Attempts to refresh token via `/api/refresh`
5. If successful:
   - Stores new token
   - Retries original request with new token
6. If failed:
   - Clears authentication
   - Redirects to login

## Best Practices

1. **Never store sensitive data in JWT payload** - It's base64 encoded, not encrypted
2. **Use short-lived access tokens** - Recommended: 15-30 minutes
3. **Use HTTP-only cookies for refresh tokens** - More secure than localStorage
4. **Validate tokens on the backend** - Client-side validation is for UX only
5. **Use HTTPS in production** - Required for secure token transmission

## Troubleshooting

### Token Not Being Sent

Check that:

- Token exists in localStorage
- Token is not expired
- API base URL is correct

### 401 Errors

- Token may be expired
- Token may be invalid
- Refresh token may have expired
- Backend may not be accepting the token

### Redirect Loops

- Check that login/register endpoints don't require authentication
- Verify token is being stored correctly
- Check that protected routes allow access with valid token

## Backend Requirements

The backend should:

1. **Issue JWT tokens** on successful login/registration
2. **Validate JWT tokens** on protected endpoints
3. **Support token refresh** via `/api/refresh` endpoint
4. **Return 401** for invalid/expired tokens
5. **Include user info in JWT payload** (id, email, name, role)
6. **Set secure HTTP-only cookies** for refresh tokens (recommended)

## Dependencies

```json
{
  "axios": "^1.13.2",
  "jwt-decode": "^4.0.0",
  "zustand": "^5.0.8"
}
```

## Files Overview

```
frontend/src/lib/
├── api.ts           # Axios configuration with JWT interceptors
├── auth-store.ts    # Zustand authentication store
└── jwt.ts           # JWT utility functions

frontend/src/app/
├── page.tsx         # Landing page (redirects if authenticated)
├── login/page.tsx   # Login page with JWT auth
├── register/page.tsx # Registration with JWT auth
├── onboarding/page.tsx # Role selection after registration
├── dashboard/page.tsx  # Protected main dashboard
└── profile/page.tsx    # Protected user profile
```
