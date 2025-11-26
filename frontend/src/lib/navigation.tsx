import { createNavigation } from 'next-intl/navigation';
import { locales } from './i18n';
import { addHtmlExtension } from './url-utils';
import { ComponentProps } from 'react';

// Create navigation with locale support
const navigation = createNavigation({ locales });

// Export pathname and original router
export const { usePathname } = navigation;

// Wrap Link component to automatically add .html extension
const OriginalLink = navigation.Link;
export function Link({ href, ...props }: ComponentProps<typeof OriginalLink>) {
  const processedHref = typeof href === 'string' ? addHtmlExtension(href) : href;
  return <OriginalLink href={processedHref} {...props} />;
}

// Wrap redirect to automatically add .html extension
const originalRedirect = navigation.redirect;
export function redirect(params: { href: string; locale: string }): never {
  return originalRedirect({
    ...params,
    href: addHtmlExtension(params.href)
  });
}

// Wrap useRouter to automatically add .html extension
const originalUseRouter = navigation.useRouter;
export function useRouter() {
  const router = originalUseRouter();

  return {
    ...router,
    push: (href: string, options?: Record<string, unknown>) => {
      return router.push(addHtmlExtension(href), options);
    },
    replace: (href: string, options?: Record<string, unknown>) => {
      return router.replace(addHtmlExtension(href), options);
    },
  };
}
