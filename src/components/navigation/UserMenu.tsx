'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Dropdown, DropdownItem } from '@/components/design-system';
import NavigationIcon from './NavigationIcon';
import { cn } from '@/lib/utils';
import { signOutAction } from '@/app/actions/auth';

export interface UserMenuProps {
  className?: string;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

export const UserMenu: React.FC<UserMenuProps> = ({
  className,
  placement = 'bottom-end',
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (session.user.name) {
      return session.user.name;
    }
    if (session.user.email) {
      return session.user.email.split('@')[0];
    }
    return 'User';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getUserDisplayName();
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOutAction();
  };

  const dropdownItems: DropdownItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <NavigationIcon name="user" size="sm" aria-hidden={true} />,
      onClick: () => router.push('/profile'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <NavigationIcon name="settings" size="sm" aria-hidden={true} />,
      onClick: () => router.push('/profile'), // For now, settings go to profile
    },
    {
      id: 'divider',
      label: '',
      divider: true,
    },
    {
      id: 'signout',
      label: 'Sign Out',
      icon: <NavigationIcon name="logout" size="sm" aria-hidden={true} />,
      onClick: handleSignOut,
    },
  ];

  // User avatar trigger
  const userTrigger = (
    <div className={cn(
      'flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      'transition-all duration-200',
      className
    )}>
      {/* User avatar */}
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full',
        'bg-primary-500 text-white text-sm font-medium',
        'dark:bg-primary-600'
      )}>
        {getUserInitials()}
      </div>
      
      {/* User name and chevron */}
      <div className="hidden sm:flex items-center space-x-1">
        <span className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-32">
          {getUserDisplayName()}
        </span>
        <NavigationIcon
          name="chevronDown"
          size="sm"
          aria-hidden={true}
          className="text-neutral-500 dark:text-neutral-400"
        />
      </div>
    </div>
  );

  return (
    <Dropdown
      trigger={userTrigger}
      items={dropdownItems}
      placement={placement}
      className="relative"
      menuClassName="min-w-48"
    />
  );
};

export default UserMenu;