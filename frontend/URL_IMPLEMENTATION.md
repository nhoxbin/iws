# HTML Extension Implementation

This document describes the implementation of `.html` extensions for all URLs in the application.

## Overview

All URLs in the application now automatically include a `.html` extension. This is achieved through:

1. **URL Utility Functions** (`src/lib/url-utils.ts`)
2. **Navigation Wrapper** (`src/lib/navigation.ts`)
3. **Next.js Configuration** (`next.config.ts`)
4. **Middleware** (`src/proxy.ts`)

## How It Works

### 1. URL Utility Functions

The `addHtmlExtension()` function automatically adds `.html` to any path that doesn't already have a file extension:

```typescript
// Examples:
addHtmlExtension('/dashboard') → '/dashboard.html'
addHtmlExtension('/questions/123') → '/questions/123.html'
addHtmlExtension('/questions?search=test') → '/questions.html?search=test'
addHtmlExtension('/profile#about') → '/profile.html#about'
addHtmlExtension('/style.css') → '/style.css' (no change)
```

### 2. Navigation Wrapper

All navigation components and functions are wrapped to automatically apply `.html` extensions:

- **`<Link>` component**: Automatically adds `.html` to all `href` props
- **`router.push()`**: Automatically adds `.html` to all paths
- **`router.replace()`**: Automatically adds `.html` to all paths
- **`redirect()`**: Automatically adds `.html` to all paths

### 3. Next.js Configuration

The `next.config.ts` includes rewrites to handle incoming `.html` URLs:

```typescript
async rewrites() {
  return [
    {
      source: '/:locale/:path*.html',
      destination: '/:locale/:path*',
    },
    {
      source: '/:path*.html',
      destination: '/:path*',
    },
  ];
}
```

This ensures that requests to `/dashboard.html` are internally routed to `/dashboard`.

### 4. Middleware

The middleware (`src/proxy.ts`) strips `.html` extensions from incoming requests before processing them with the internationalization middleware.

## Usage Examples

### Link Component

```tsx
import { Link } from '@/lib/navigation';

// Old: <Link href="/dashboard">Dashboard</Link>
// Now generates: <a href="/en/dashboard.html">Dashboard</a>

<Link href="/questions">Questions</Link>
// Generates: <a href="/en/questions.html">Questions</a>

<Link href="/profile/123">View Profile</Link>
// Generates: <a href="/en/profile/123.html">View Profile</a>
```

### Router Navigation

```tsx
import { useRouter } from "@/lib/navigation";

const router = useRouter();

// Old: router.push('/dashboard')
// Now navigates to: /en/dashboard.html
router.push("/dashboard");

// Old: router.push('/questions?search=test')
// Now navigates to: /en/questions.html?search=test
router.push("/questions?search=test");
```

### Redirect Function

```tsx
import { redirect } from "@/lib/navigation";

// Old: redirect('/login')
// Now redirects to: /en/login.html
redirect("/login");
```

## URL Structure

All URLs follow this pattern:

```
/{locale}/{path}.html[?query][#hash]
```

Examples:

- `/en/dashboard.html`
- `/vi/questions.html`
- `/en/questions/my-question.html`
- `/en/profile/123.html`
- `/en/questions.html?search=test`
- `/en/profile.html#about`

## Benefits

1. **SEO Friendly**: `.html` extensions can improve SEO in some cases
2. **Automatic**: Developers don't need to manually add `.html` to every URL
3. **Consistent**: All URLs follow the same pattern
4. **Backward Compatible**: The middleware handles both `.html` and non-`.html` URLs

## Implementation Details

### Files Modified

1. **Created**: `src/lib/url-utils.ts` - URL utility functions
2. **Modified**: `src/lib/navigation.ts` - Wrapped navigation components
3. **Modified**: `next.config.ts` - Added rewrites for `.html` URLs
4. **Modified**: `src/proxy.ts` - Added `.html` handling to middleware

### No Changes Required

- Existing components continue to work without modification
- All `<Link>` components automatically use `.html` extensions
- All `router.push()` calls automatically use `.html` extensions
- No manual URL construction needed

## Testing

To test the implementation:

1. Start the development server: `npm run dev`
2. Navigate to any page
3. Check the browser address bar - URLs should end with `.html`
4. Check network requests in DevTools - all navigation should use `.html` URLs
5. Test direct URL access: `http://localhost:3000/en/dashboard.html`

## Notes

- Static files (CSS, JS, images) are not affected
- API routes are not affected
- Next.js internal routes (`_next`, `_vercel`) are not affected
- The middleware correctly handles internationalization with `.html` extensions
