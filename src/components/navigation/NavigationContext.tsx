'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@stackframe/stack';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
  showInMobile?: boolean;
  showInDesktop?: boolean;
  external?: boolean;
  devOnly?: boolean;
}

export interface NavigationContextType {
  currentPath: string;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  navigationItems: NavigationItem[];
  activeItem: NavigationItem | null;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  getNavigationItems: (context: 'desktop' | 'mobile') => NavigationItem[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Define all navigation items
const allNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: 'home',
    showInMobile: true,
    showInDesktop: true,
  },
  {
    id: 'calculator',
    label: 'Calculator',
    href: '/calculator',
    icon: 'calculator',
    requiresAuth: true,
    showInMobile: true,
    showInDesktop: true,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    requiresAuth: true,
    showInMobile: true,
    showInDesktop: true,
  },
  {
    id: 'compare',
    label: 'Compare',
    href: '/compare',
    icon: 'compare',
    requiresAuth: true,
    showInMobile: true,
    showInDesktop: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: 'user',
    requiresAuth: true,
    showInMobile: true,
    showInDesktop: false, // Handled by user menu on desktop
  },
  {
    id: 'formulas',
    label: 'Formulas',
    href: '/formulas',
    icon: 'formulas',
    showInMobile: true,
    showInDesktop: true,
  },
  {
    id: 'style-guide',
    label: 'Style Guide',
    href: '/style-guide',
    icon: 'styleGuide',
    showInMobile: true,
    showInDesktop: true,
    devOnly: true,
  },
];

export interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const user = useUser();
  const session = user ? { user } : null;
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const isAuthenticated = Boolean(session?.user) || isDemoMode;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Get filtered navigation items based on context
  const getNavigationItems = (context: 'desktop' | 'mobile'): NavigationItem[] => {
    return allNavigationItems.filter(item => {
      // Filter by authentication requirement
      if (item.requiresAuth && !isAuthenticated) {
        return false;
      }

      // Filter by development only
      if (item.devOnly && !isDevelopment) {
        return false;
      }

      // Filter by context (desktop/mobile)
      if (context === 'desktop' && !item.showInDesktop) {
        return false;
      }
      if (context === 'mobile' && !item.showInMobile) {
        return false;
      }

      return true;
    });
  };

  // Find active navigation item
  const activeItem = allNavigationItems.find(item => {
    if (item.href === '/' && pathname === '/') {
      return true;
    }
    if (item.href !== '/' && pathname.startsWith(item.href)) {
      return true;
    }
    return false;
  }) || null;

  const setMobileMenuOpen = (open: boolean) => {
    setIsMobileMenuOpen(open);
  };

  const value: NavigationContextType = {
    currentPath: pathname,
    isAuthenticated,
    isDemoMode,
    navigationItems: allNavigationItems,
    activeItem,
    isMobileMenuOpen,
    setMobileMenuOpen,
    getNavigationItems,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;
