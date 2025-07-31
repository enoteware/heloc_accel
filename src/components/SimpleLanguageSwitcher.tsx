'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function SimpleLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchToEnglish = () => {
    const newPath = pathname.replace(/^\/es/, '/en');

    try {
      router.push(newPath);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[LanguageSwitcher] Error during navigation:', error);
      }
    }
  };

  const switchToSpanish = () => {
    const newPath = pathname.replace(/^\/en/, '/es');

    try {
      // Try Next.js router first
      router.push(newPath);

      // Fallback to window.location if router doesn't work
      setTimeout(() => {
        if (window.location.pathname === pathname) {
          window.location.href = newPath;
        }
      }, 100);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[LanguageSwitcher] Error during navigation:', error);
      }
      // Direct fallback
      window.location.href = newPath;
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={switchToEnglish}
        className={`px-2 py-1 rounded text-sm transition-colors ${
          locale === 'en' 
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' 
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
        aria-label="Switch to English"
      >
        🇺🇸 EN
      </button>
      <button
        onClick={switchToSpanish}
        className={`px-2 py-1 rounded text-sm transition-colors ${
          locale === 'es' 
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' 
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
        aria-label="Switch to Spanish"
      >
        🇪🇸 ES
      </button>
    </div>
  );
}