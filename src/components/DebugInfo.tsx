'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebugFlag } from '@/hooks/useDebugFlag';

export default function DebugInfo() {
  const locale = useLocale();
  const pathname = usePathname();
  const [windowPath, setWindowPath] = useState('');
  const isDebugMode = useDebugFlag();

  useEffect(() => {
    setWindowPath(window.location.pathname);
    
    // Update on URL changes
    const handlePopState = () => {
      setWindowPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Only render if debug flag is present in URL
  if (!isDebugMode) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-3 rounded text-xs font-mono z-50">
      <div><strong>Debug Info:</strong></div>
      <div>Locale: {locale}</div>
      <div>Pathname: {pathname}</div>
      <div>Window Path: {windowPath}</div>
      <div>URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</div>
    </div>
  );
}