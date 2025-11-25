# JWT Token Refresh & Long Session Implementation

This document describes the automatic token refresh mechanism and session management improvements implemented in the application.

## Overview

The application now supports:

1. **Automatic token refresh** before expiration
2. **Longer session lifetimes** (configurable, default 8 hours)
3. **Seamless background refresh** without user interruption
4. **Fallback refresh** on 401 errors

## How It Works

### 1. Proactive Token Refresh

The frontend automatically checks token expiration every minute:

- If token expires within 5 minutes → automatically refresh
- Happens silently in the background
- No user interaction required

### 2. Reactive Token Refresh

If a token expires during an API request:

- API interceptor catches 401 error
- Automatically calls refresh endpoint
- Retries the original request with new token
- User doesn't notice any interruption

### 3. Token Refresh Flow

```
User makes request → Token expires soon?
  ├─ No  → Process normally
  └─ Yes → Background refresh
           ├─ Success → Continue with new token
           └─ Fail    → Redirect to login
```

## Configuration

### Backend (.env)

```env
# Token lifetime: 8 hours (480 minutes)
JWT_TTL=480

# Refresh window: 2 weeks (20160 minutes)
# Users can refresh within this period without re-login
JWT_REFRESH_TTL=20160

# Grace period for concurrent requests
JWT_BLACKLIST_GRACE_PERIOD=0
```

**Recommended Settings:**

- **Short sessions (high security):** `JWT_TTL=60` (1 hour)
- **Standard sessions:** `JWT_TTL=480` (8 hours)
- **Long sessions:** `JWT_TTL=1440` (24 hours)
- **Very long sessions:** `JWT_TTL=10080` (1 week)

### Frontend

Refresh threshold is configurable in `/frontend/src/lib/auth-store.ts`:

```typescript
// Refresh if token expires within 5 minutes
return isTokenExpiringSoon(token, 5);
```

Change `5` to adjust when refresh happens (in minutes).

## Implementation Details

### Frontend Components

1. **`/frontend/src/lib/api.ts`**

   - Response interceptor for 401 errors
   - Automatic token refresh and retry
   - Proper Authorization header handling

2. **`/frontend/src/lib/auth-store.ts`**

   - `refreshToken()` method
   - `shouldRefreshToken()` check
   - Event listener for token updates

3. **`/frontend/src/lib/jwt.ts`**

   - `isTokenExpiringSoon()` utility
   - Token expiration checking

4. **`/frontend/src/hooks/use-token-refresh.ts`**

   - React hook for automatic refresh
   - Runs every minute when authenticated
   - Cleans up on unmount

5. **`/frontend/src/components/layout-content.tsx`**
   - Integrates refresh hook globally
   - Active on all authenticated pages

### Backend Components

1. **`/backend/app/Http/Controllers/Api/AuthController.php`**

   - Improved `refresh()` method
   - Better error handling
   - Maintains custom JWT claims

2. **`/backend/config/jwt.php`**
   - Configurable TTL
   - Refresh TTL settings
   - Blacklist configuration

## API Endpoints

### Refresh Token

```bash
POST /api/auth/refresh
Headers: Authorization: Bearer {current_token}
```

**Success Response (200):**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 28800
}
```

**Error Response (401):**

```json
{
  "message": "Token refresh failed",
  "error": "Token has expired and can no longer be refreshed"
}
```

## User Experience

### Before Implementation

- User session expires after 1 hour
- API calls fail with 401 errors
- User must manually log in again
- Work/data may be lost

### After Implementation

- User session lasts 8 hours (or configured time)
- Token automatically refreshes every ~55 minutes
- Seamless experience, no interruptions
- If inactive for 2 weeks, must re-login (security)

## Security Considerations

1. **Token Blacklisting**

   - Old tokens are invalidated after refresh
   - Prevents token reuse attacks

2. **Refresh Window**

   - `JWT_REFRESH_TTL` limits how long refresh works
   - Forces re-authentication after prolonged inactivity
   - Default: 2 weeks

3. **Secure Storage**

   - Tokens stored in localStorage
   - HTTPS required in production
   - No sensitive data in JWT payload

4. **Grace Period**
   - Handles concurrent requests gracefully
   - Prevents race conditions during refresh

## Testing

### Manual Testing

1. **Test Proactive Refresh:**

   ```bash
   # Set JWT_TTL=2 (2 minutes)
   # Log in and wait 1-2 minutes
   # Check network tab for refresh calls
   ```

2. **Test Reactive Refresh:**

   ```bash
   # Make API call with expired token
   # Should auto-refresh and retry
   # Original request should succeed
   ```

3. **Test Session Expiration:**
   ```bash
   # Set JWT_REFRESH_TTL=5 (5 minutes)
   # Wait 6 minutes
   # Try to refresh → should fail
   # User redirected to login
   ```

### Automated Testing

```typescript
// Test token refresh in auth store
const { refreshToken, shouldRefreshToken } = useAuthStore.getState();

// Should return true if token expires soon
expect(shouldRefreshToken()).toBe(true);

// Should update token
await refreshToken();
const newToken = useAuthStore.getState().token;
expect(newToken).not.toBe(oldToken);
```

## Troubleshooting

### Token Not Refreshing

**Check:**

1. `JWT_TTL` is set in backend `.env`
2. `JWT_REFRESH_TTL` is greater than `JWT_TTL`
3. Token hasn't exceeded refresh window
4. Browser console for refresh errors

**Debug:**

```javascript
// In browser console
const store = localStorage.getItem("auth-storage");
const auth = JSON.parse(store);
console.log("Token:", auth.state.token);

// Manually decode token at jwt.io
```

### Refresh Endpoint Returning 401

**Causes:**

- Token already expired beyond refresh window
- Token is blacklisted
- JWT_SECRET mismatch
- Token format invalid

**Solution:**

- Log out and log back in
- Clear localStorage
- Check backend logs
- Verify JWT_SECRET in `.env`

### Refresh Loop

**Causes:**

- Refresh endpoint itself requires fresh token
- TTL too short
- System clock skew

**Solution:**

- Ensure refresh endpoint accepts expiring tokens
- Increase `JWT_TTL`
- Check server time synchronization

## Migration Guide

### For Existing Users

No action required! The system automatically:

1. Uses existing tokens until they expire
2. Refreshes tokens automatically
3. Maintains user sessions seamlessly

### For Developers

1. **Update `.env`:**

   ```bash
   cp .env.example .env
   # Add JWT_TTL and JWT_REFRESH_TTL
   ```

2. **Clear config cache:**

   ```bash
   cd backend
   php artisan config:clear
   php artisan config:cache
   ```

3. **Test refresh:**

   ```bash
   # Get token by logging in
   curl -X POST http://127.0.0.1:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"Password123"}'

   # Refresh token
   curl -X POST http://127.0.0.1:8000/api/auth/refresh \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Frontend update:**
   ```bash
   cd frontend
   npm install  # No new dependencies needed
   npm run dev
   ```

## Best Practices

1. **Production Settings:**

   - Use HTTPS only
   - Set `JWT_TTL=480` (8 hours)
   - Set `JWT_REFRESH_TTL=20160` (2 weeks)
   - Monitor refresh rates

2. **Development Settings:**

   - Can use shorter TTL for testing
   - Example: `JWT_TTL=5` to test refresh every 5 min

3. **Monitoring:**

   - Log token refresh attempts
   - Track failed refreshes
   - Alert on unusual patterns

4. **User Communication:**
   - No message needed for automatic refresh
   - Notify only on session expiration
   - Provide "Keep me logged in" option

## Related Documentation

- [JWT Implementation](/frontend/JWT_IMPLEMENTATION.md)
- [Backend JWT Documentation](/backend/JWT_API_DOCUMENTATION.md)
- [Authentication Guide](/docs/authentication.md)

## Support

For issues or questions:

1. Check browser console for errors
2. Review backend logs
3. Verify JWT configuration
4. Test with curl/Postman
5. Open GitHub issue if problem persists
