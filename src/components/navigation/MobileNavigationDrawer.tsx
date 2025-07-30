'use client';

import React, { useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import NavigationLink from './NavigationLink';
import NavigationIcon from './NavigationIcon';
import { signOutAction } from '@/app/actions/auth';

export interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const user = useUser();
  const session = user ? { user } : null;
  const router = useRouter();

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap management
  useEffect(() => {
    if (isOpen) {
      const drawer = document.getElementById('mobile-navigation-menu');
      const focusableElements = drawer?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    onClose();
    await signOutAction();
  };

  const handleLinkClick = () => {
    onClose();
  };

  // Get user display info
  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.primaryEmail) return user.primaryEmail.split('@')[0];
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        id="mobile-navigation-menu"
        className={cn(
          'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-neutral-900',
          'shadow-xl border-l border-neutral-200 dark:border-neutral-800',
          'z-50 transform transition-transform duration-300 ease-in-out',
          'flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-h6 font-semibold text-neutral-900 dark:text-neutral-100">
            Navigation
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100',
              'dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'transition-colors duration-200'
            )}
            aria-label="Close navigation menu"
          >
            <NavigationIcon name="close" size="md" aria-hidden={true} />
          </button>
        </div>

        {/* User info (if authenticated) */}
        {session?.user && (
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full',
                'bg-primary-500 text-white text-sm font-medium',
                'dark:bg-primary-600'
              )}>
                {getUserInitials()}
              </div>
              <div>
                <p className="text-body font-medium text-neutral-900 dark:text-neutral-100">
                  {getUserDisplayName()}
                </p>
                {user?.primaryEmail && (
                  <p className="text-body-sm text-neutral-600 dark:text-neutral-400">
                    {user.primaryEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavigationLink
            href="/"
            label="Home"
            icon="home"
            className="w-full justify-start"
            onClick={handleLinkClick}
          />
          
          {session?.user && (
            <>
              <NavigationLink
                href="/calculator"
                label="Calculator"
                icon="calculator"
                className="w-full justify-start"
                onClick={handleLinkClick}
              />
              <NavigationLink
                href="/dashboard"
                label="Dashboard"
                icon="dashboard"
                className="w-full justify-start"
                onClick={handleLinkClick}
              />
              <NavigationLink
                href="/compare"
                label="Compare"
                icon="compare"
                className="w-full justify-start"
                onClick={handleLinkClick}
              />
              <NavigationLink
                href="/profile"
                label="Profile"
                icon="user"
                className="w-full justify-start"
                onClick={handleLinkClick}
              />
            </>
          )}

          <NavigationLink
            href="/formulas"
            label="Formulas"
            icon="formulas"
            className="w-full justify-start"
            onClick={handleLinkClick}
          />

          {process.env.NODE_ENV === 'development' && (
            <NavigationLink
              href="/style-guide"
              label="Style Guide"
              icon="styleGuide"
              className="w-full justify-start"
              onClick={handleLinkClick}
            />
          )}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          {session?.user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className={cn(
                'flex items-center space-x-2 w-full px-3 py-2 rounded-lg',
                'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
                'focus:outline-none focus:ring-2 focus:ring-red-500',
                'transition-colors duration-200'
              )}
            >
              <NavigationIcon name="logout" size="md" aria-hidden={true} />
              <span className="text-body font-medium">Sign Out</span>
            </button>
          ) : (
            <NavigationLink
              href="/login"
              label="Sign In"
              icon="user"
              className="w-full justify-start bg-primary-500 text-white hover:bg-primary-600"
              onClick={handleLinkClick}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MobileNavigationDrawer;