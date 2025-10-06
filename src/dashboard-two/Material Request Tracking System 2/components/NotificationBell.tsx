
import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from './icons';
import { Notification } from '../types';

interface NotificationBellProps {
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onNotificationRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  const handleRead = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onNotificationRead(id);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleToggle} className="relative text-gray-400 hover:text-white focus:outline-none">
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform -translate-y-1/2 translate-x-1/2">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2">
            <div className="px-4 py-2 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">Notifications</div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">No new notifications.</p>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${notif.read ? 'opacity-60' : ''}`}
                    onClick={(e) => handleRead(e, notif.id)}
                  >
                    <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
