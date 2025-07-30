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
    <div className="flex space-x-2 bg-white rounded-md shadow-sm p-2">
      <button
        onClick={switchToEnglish}
        className={`px-3 py-1 rounded text-sm ${
          locale === 'en' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        🇺🇸 EN
      </button>
      <button
        onClick={switchToSpanish}
        className={`px-3 py-1 rounded text-sm ${
          locale === 'es' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        🇪🇸 ES
      </button>
    </div>
  );
}