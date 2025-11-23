import { createNavigation } from 'next-intl/navigation';
import { locales } from './i18n';

// Create navigation with locale support
const navigation = createNavigation({ locales });

// Export everything from next-intl navigation
export const { Link, redirect, usePathname, useRouter } = navigation;
