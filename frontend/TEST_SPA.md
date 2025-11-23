# SPA Navigation Test

## How to verify your app is working as a true SPA:

### Test 1: Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Navigate between pages (Dashboard → My Questions → Saved)
4. **Expected**: You should see XHR/Fetch requests for data, but NO full document requests
5. **If it's reloading**: You'll see `Type: document` requests for each navigation

### Test 2: Console State

1. Open DevTools Console
2. Type: `window.testSPA = "I am SPA"`
3. Navigate to different pages
4. Type: `window.testSPA` in console
5. **Expected**: Should still show "I am SPA"
6. **If it's reloading**: Will show `undefined`

### Test 3: Visual Test

1. Navigate between pages
2. **Expected**:
   - No white flash
   - No browser loading spinner
   - Instant transitions
   - Header stays in place
3. **If it's reloading**:
   - Brief white screen
   - Browser tab shows loading indicator
   - Page flickers

### Test 4: Check Logs

The server logs showing "GET /vi/dashboard 200 in 23ms" are **NORMAL** for Next.js App Router with SSR.
This is NOT a full page reload - it's:

- Prefetching for the next page
- Server-side rendering HTML for hydration
- Happens in background while client navigates

### What's the actual issue you're seeing?

Please check:

- [ ] White flash when clicking links?
- [ ] Browser shows loading spinner in tab?
- [ ] Scroll position resets to top?
- [ ] Console state gets cleared?
- [ ] Transitions feel slow/janky?

If you're seeing server logs, that's normal - Next.js App Router uses RSC (React Server Components).
