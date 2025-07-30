'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function HomePageContent() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {t('pages.homeTitle')}
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            {t('pages.homeSubtitle')}
          </p>
          <div className="space-x-4">
            <Link
              href="/calculator"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('calculator.getStarted')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}