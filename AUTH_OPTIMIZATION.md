# Authentication Optimization - User Profile Caching

## Summary
Optimized authentication flow to reduce unnecessary `/auth/me` API calls by implementing global user profile caching in the auth store.

## Changes Made

### 1. Enhanced Auth Store (`frontend/src/lib/auth-store.ts`)

#### New Features:
- **`userFetched` state**: Tracks whether user profile has been fetched from API
- **`fetchUser()` method**: Fetches full user profile from `/auth/me` API once and caches it
- **Auto-fetch on login**: Automatically fetches user profile after successful authentication

#### How It Works:
```typescript
// When user logs in, token is set and user profile is fetched automatically
setAuth(token) // → Fetches user profile once

// Components can now access user from store without API calls
const { user, isAuthenticated } = useAuthStore();
```

#### Benefits:
- ✅ User profile fetched only once per session
- ✅ No API calls when user is not logged in
- ✅ Profile data cached in localStorage
- ✅ Auto-refetch on token refresh

### 2. Updated API Interceptor (`frontend/src/lib/api.ts`)

#### Changes:
- **Removed `/auth/me` from protected endpoints list** that trigger login redirects
- `/auth/me` calls now fail silently when token is invalid (no redirect to login)
- Only truly protected endpoints (`/notifications`, `/saved-posts`) trigger login redirects

#### Behavior:
```typescript
// Before: /auth/me call with expired token → redirect to login ❌
// After: /auth/me call with expired token → fail silently ✅

// Public endpoints (questions, categories, tags) never trigger redirects
// Protected endpoints still trigger login when accessed without auth
```

### 3. Updated Components

#### `use-question-detail.ts`
- **Before**: Called `/auth/me` on every component mount
- **After**: Gets user directly from auth store
```typescript
// Before
useEffect(() => {
  const response = await api.get('/auth/me');
  setCurrentUser(response.data);
}, []);

// After
const { user: currentUser } = useAuthStore();
```

#### `my-questions/page.tsx`
- **Before**: Called `/auth/me` to get user ID before fetching questions
- **After**: Gets user from auth store
```typescript
// Before
const userResponse = await api.get('/auth/me');
const userId = userResponse.data.id;

// After
const { user } = useAuthStore();
// Use user.id directly
```

#### `profile/page.tsx`
- **Before**: Called `/auth/me` to get user data
- **After**: Gets user from auth store
```typescript
// Before
const userResponse = await api.get('/auth/me');
const currentUserId = userResponse.data.id;

// After
const { user } = useAuthStore();
const currentUserId = Number(user.id);
```

### 4. Deprecated Hook (`use-cached-data.ts`)

#### `useUserProfile()` Hook:
- **Status**: Deprecated
- **Reason**: Direct store access is more efficient
- **Migration**: Use `useAuthStore()` directly

```typescript
// Before (deprecated)
const { user } = useUserProfile();

// After (recommended)
const { user, isAuthenticated } = useAuthStore();
```

## Usage Guide

### For Protected Pages:
```typescript
'use client';
import { useAuthStore } from '@/lib/auth-store';

function MyProtectedComponent() {
  const { user, isAuthenticated, userFetched } = useAuthStore();
  
  // Check if loading
  if (isAuthenticated && !userFetched) {
    return <div>Loading user...</div>;
  }
  
  // Check if authenticated
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  // Use user data
  return <div>Welcome, {user?.name}</div>;
}
```

### For Public Pages That May Show User Info:
```typescript
function MyPublicComponent() {
  const { user, isAuthenticated } = useAuthStore();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Logged in as {user?.name}</p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
```

### For Components That Need Fresh User Data:
```typescript
function MyComponent() {
  const { user, fetchUser } = useAuthStore();
  
  const handleRefresh = async () => {
    await fetchUser(); // Manually refetch if needed
  };
  
  return <button onClick={handleRefresh}>Refresh Profile</button>;
}
```

## Performance Impact

### Before:
- Questions page visit → 1 API call to `/auth/me` ❌
- Question detail page → 1 API call to `/auth/me` ❌
- My questions page → 1 API call to `/auth/me` ❌
- Profile page → 1 API call to `/auth/me` ❌
- **Total: 4 unnecessary API calls** 🔴

### After:
- Login → 1 API call to `/auth/me` (cached) ✅
- Questions page visit → 0 API calls ✅
- Question detail page → 0 API calls (uses cached data) ✅
- My questions page → 0 API calls (uses cached data) ✅
- Profile page → 0 API calls (uses cached data) ✅
- **Total: 1 API call per session** 🟢

## Key Improvements

1. **Reduced API Calls**: 75-90% reduction in `/auth/me` calls
2. **No Unauthorized Calls**: `/auth/me` never called when user is not logged in
3. **Better UX**: Instant user data access from store (no loading states)
4. **Persistent Cache**: User data persists across page refreshes
5. **Auto-refresh**: Token refresh automatically updates user data

## Testing Checklist

- [ ] Login → User profile fetched and cached
- [ ] Visit questions page (not logged in) → No `/auth/me` call
- [ ] Visit questions page (logged in) → No additional `/auth/me` call
- [ ] Visit question detail → User data available from store
- [ ] Visit my questions page → User data available from store
- [ ] Visit profile page → User data available from store
- [ ] Token refresh → User data updated automatically
- [ ] Logout → User data cleared from store
- [ ] Page refresh (logged in) → User data loaded from cache

## Migration Notes

### If you have other components calling `/auth/me`:
1. Import `useAuthStore`
2. Replace API call with store access
3. Remove loading state if not needed

### Example Migration:
```typescript
// Before
const [user, setUser] = useState(null);
useEffect(() => {
  const fetchUser = async () => {
    const response = await api.get('/auth/me');
    setUser(response.data);
  };
  fetchUser();
}, []);

// After
const { user, isAuthenticated } = useAuthStore();
```
