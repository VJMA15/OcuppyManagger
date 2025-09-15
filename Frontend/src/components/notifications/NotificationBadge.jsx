import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/utils/cn';

const NotificationBadge = ({ className }) => {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span 
      className={cn(
        "absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
        "animate-pulse",
        className
      )}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

export default NotificationBadge;