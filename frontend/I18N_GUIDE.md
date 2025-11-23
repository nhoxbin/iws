# Internationalization (i18n) Setup

This project uses `next-intl` for internationalization support.

## Supported Languages

- English (en) - Default
- Vietnamese (vi)

## How to Use Translations

### In Client Components

```tsx
"use client";

import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("common");

  return (
    <div>
      <h1>{t("menu.home")}</h1>
      <button>{t("actions.save")}</button>
    </div>
  );
}
```

### In Server Components

```tsx
import { useTranslations } from "next-intl";

export default function MyPage() {
  const t = useTranslations("questions");

  return (
    <div>
      <h1>{t("questionsList.title")}</h1>
      <p>{t("questionsList.subtitle")}</p>
    </div>
  );
}
```

### With Parameters

```tsx
const t = useTranslations('dashboard');

// {{name}} in translation file
<h1>{t('welcome', { name: user.name })}</h1>

// {{count}} in translation file
<span>{t('questionsList.views', { count: 42 })}</span>
```

## Translation Files Structure

```
/public/locales/
  /en/
    common.json        - Common UI text, menu, auth
    questions.json     - Question-related text
    profile.json       - Profile and user-related text
    leaderboard.json   - Leaderboard text
    dashboard.json     - Dashboard text
  /vi/
    (same structure)
```

## Adding a New Language

1. Create new folder in `/public/locales/` (e.g., `/public/locales/ja/`)
2. Copy all JSON files from `/en/` and translate
3. Add locale to `/src/lib/i18n.ts`:
   ```ts
   export const locales = ["en", "vi", "ja"] as const;
   ```
4. Add language to `/src/components/language-switcher.tsx`:
   ```ts
   const languages = [
     { code: "en", name: "English", flag: "🇺🇸" },
     { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
     { code: "ja", name: "日本語", flag: "🇯🇵" },
   ];
   ```

## Adding New Translation Keys

1. Add key to English translation file: `/public/locales/en/[namespace].json`
2. Add same key to all other language files
3. Use in component: `t('your.new.key')`

Example:

```json
// /public/locales/en/common.json
{
  "settings": {
    "title": "Settings",
    "save": "Save Settings"
  }
}
```

```tsx
const t = useTranslations("common");
<h1>{t("settings.title")}</h1>;
```

## Language Switcher Component

The `<LanguageSwitcher />` component is already integrated in the app header. It allows users to switch between languages.

Usage:

```tsx
import { LanguageSwitcher } from "@/components/language-switcher";

<LanguageSwitcher locale={locale} />;
```

## URL Structure

- Default locale (en): `/dashboard`, `/questions`
- Other locales: `/vi/dashboard`, `/vi/questions`

The middleware automatically handles locale detection and routing.

## Best Practices

1. **Keep keys organized** - Use nested objects for related text
2. **Be consistent** - Use same key structure across all languages
3. **Provide context** - Use descriptive key names like `loginButton` not `btn1`
4. **Test all languages** - Make sure all keys exist in all language files
5. **Use parameters** - For dynamic content like names, counts, etc.
6. **Avoid hardcoded text** - Always use translation keys, never hardcode strings

## Common Namespaces

- `common` - App name, menu, auth, actions, time, roles
- `questions` - All question-related text
- `profile` - Profile and edit profile text
- `leaderboard` - Leaderboard text
- `dashboard` - Dashboard text

## Example: Converting a Page to Use Translations

Before:

```tsx
export default function MyPage() {
  return (
    <div>
      <h1>My Questions</h1>
      <button>Ask Question</button>
    </div>
  );
}
```

After:

```tsx
import { useTranslations } from "next-intl";

export default function MyPage() {
  const t = useTranslations("questions");

  return (
    <div>
      <h1>{t("myQuestions.title")}</h1>
      <button>{t("myQuestions.askButton")}</button>
    </div>
  );
}
```
