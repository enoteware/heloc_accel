'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useUser } from '@stackframe/stack';
import NavigationIcon from './navigation/NavigationIcon';

export const Footer: React.FC = () => {
  const user = useUser();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              HELOC Accelerator
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Calculate potential savings using HELOC acceleration strategy to pay off your mortgage faster.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/formulas"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center space-x-2"
                >
                  <NavigationIcon name="formulas" size="sm" />
                  <span>Formulas</span>
                </Link>
              </li>
              {/* Admin link for demo mode or admin users */}
              {(isDemoMode || user?.primaryEmail === 'admin@helocaccelerator.com') && (
                <li>
                  <Link
                    href="/admin"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center space-x-2"
                  >
                    <NavigationIcon name="settings" size="sm" />
                    <span>Admin</span>
                  </Link>
                </li>
              )}
              {/* Development only */}
              {process.env.NODE_ENV === 'development' && (
                <li>
                  <Link
                    href="/style-guide"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center space-x-2"
                  >
                    <NavigationIcon name="styleGuide" size="sm" />
                    <span>Style Guide</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            © {currentYear} HELOC Accelerator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;