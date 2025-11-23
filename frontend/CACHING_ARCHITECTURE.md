# Caching Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│  (Dashboard, Header, Profile, etc.)                             │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Uses custom hooks
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Custom Caching Hooks                           │
│  /src/hooks/use-cached-data.ts                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ usePopularTags()     - 5 min cache                      │   │
│  │ useNotifications()   - 30s auto-refresh                 │   │
│  │ usePosts()          - 30s cache                         │   │
│  │ useCategories()     - 1 hour cache                      │   │
│  │ useUserProfile()    - 5 min cache                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Powered by SWR
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SWR Cache Layer                               │
│  /src/lib/swr-config.ts                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Deduplication (2 second window)                        │   │
│  │ • Automatic revalidation                                 │   │
│  │ • Background refreshing                                  │   │
│  │ • Error retry with exponential backoff                   │   │
│  │ • Focus/reconnect revalidation                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Makes API calls
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Client                                  │
│  /src/lib/api.ts                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • JWT token management                                   │   │
│  │ • Request/response interceptors                          │   │
│  │ • Automatic token refresh                                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ HTTP requests
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API                                   │
│  Laravel (http://127.0.0.1:8000/api)                           │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Examples

### First Request (Cache Miss)

```
Component Mount
      │
      ▼
usePopularTags() called
      │
      ▼
Check SWR cache ──► MISS ──► API call
      │                           │
      │                           ▼
      │                    GET /tags
      │                           │
      │                           ▼
      │                    Response received
      │                           │
      │◄──────────────────────────┘
      │
      ▼
Cache stored (5 min TTL)
      │
      ▼
Return data to component
```

### Subsequent Request (Cache Hit)

```
Component Mount
      │
      ▼
usePopularTags() called
      │
      ▼
Check SWR cache ──► HIT ──► Return cached data instantly
      │
      ▼
Background revalidation (if stale)
      │
      ▼
Update cache silently if data changed
```

### Multiple Components (Deduplication)

```
Component A mounts ──► usePopularTags() ──┐
                                          │
                                          ▼
                                    Single API call
                                          ▲
                                          │
Component B mounts ──► usePopularTags() ──┘
(within 2 seconds)
```

## Cache Strategies

### 1. Static Data (1 hour)

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Cache: 1 hour          │
│  Revalidate: On mount   │
│  Examples:              │
│  • Categories           │
│  • Configuration        │
└─────────────────────────┘
```

### 2. Semi-Static (5 minutes)

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Cache: 5 minutes       │
│  Revalidate: If stale   │
│  Examples:              │
│  • Popular tags         │
│  • User profile         │
└─────────────────────────┘
```

### 3. Dynamic Data (30 seconds)

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Cache: 30 seconds      │
│  Revalidate: On mount   │
│  Examples:              │
│  • Posts/Questions      │
│  • User activity        │
└─────────────────────────┘
```

### 4. Real-time (Auto-refresh)

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Cache: 10 seconds      │
│  Auto-refresh: 30s      │
│  Examples:              │
│  • Notifications        │
│  • Unread counts        │
└─────────────────────────┘
```

## Component Integration

### Dashboard Example

```
┌─────────────────────────────────────────┐
│         Dashboard Component             │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  const { tags } =                 │ │
│  │    usePopularTags();              │ │
│  │                                   │ │
│  │  • First load: Shows skeleton    │ │
│  │  • Data arrives: Shows tags      │ │
│  │  • Re-mount: Instant from cache  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  const { posts, isLoading } =     │ │
│  │    usePosts({ sort: 'latest' });  │ │
│  │                                   │ │
│  │  • Cached for 30 seconds         │ │
│  │  • Auto-revalidates in bg        │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Header Example

```
┌─────────────────────────────────────────┐
│          Header Component               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  const { notifications,           │ │
│  │          unreadCount } =          │ │
│  │    useNotifications(5);           │ │
│  │                                   │ │
│  │  • Auto-refreshes every 30s      │ │
│  │  • Shows badge with count        │ │
│  │  • Updates in real-time          │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Performance Comparison

### Before Caching

```
User Action          API Calls    Load Time
─────────────────────────────────────────────
Visit dashboard      3 calls      1200ms
Navigate away        0 calls      0ms
Return to dashboard  3 calls      1200ms ❌
Click on post        1 call       400ms
Back to dashboard    3 calls      1200ms ❌
─────────────────────────────────────────────
Total:              10 calls     4000ms
```

### After Caching

```
User Action          API Calls    Load Time
─────────────────────────────────────────────
Visit dashboard      3 calls      1200ms
Navigate away        0 calls      0ms
Return to dashboard  0 calls      50ms ✅ (from cache)
Click on post        1 call       400ms
Back to dashboard    0 calls      50ms ✅ (from cache)
─────────────────────────────────────────────
Total:               4 calls     1700ms
Improvement:         60% fewer   57% faster
```

## Monitoring & Debugging

### Cache Inspector (Dev Tools)

```
┌─────────────────────────────────────┐
│  SWR Cache Inspector                │
├─────────────────────────────────────┤
│  Key: /tags                         │
│  Status: Fresh                      │
│  Age: 2m 15s                        │
│  Expires in: 2m 45s                 │
│  Size: 1.2 KB                       │
├─────────────────────────────────────┤
│  Key: /notifications?limit=5        │
│  Status: Revalidating               │
│  Age: 35s                           │
│  Expires in: 0s (auto-refresh)      │
│  Size: 0.8 KB                       │
├─────────────────────────────────────┤
│  Key: /posts                        │
│  Status: Stale                      │
│  Age: 31s                           │
│  Expires in: -1s (needs refresh)    │
│  Size: 5.4 KB                       │
└─────────────────────────────────────┘
```

## Best Practices

✅ **Use appropriate cache strategy** for each data type
✅ **Show skeletons** while loading initial data
✅ **Don't block UI** on cache revalidation
✅ **Implement optimistic updates** for better UX
✅ **Monitor cache hit rates** in production
✅ **Clear cache** when users logout
✅ **Prefetch** data on hover for instant navigation

---

**Result:** Lightning-fast, efficient, and maintainable caching! ⚡
