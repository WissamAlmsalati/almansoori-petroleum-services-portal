
import React from 'react';
import { View } from '../types';
import { useAuthStore } from '@/features/auth/store';

interface HeaderProps {
  activeView: View;
}

const viewDescriptions: Record<View, string> = {
    'Dashboard': 'An overview of your operations',
    'Clients': 'Manage your company clients',
    'Sub-Agreements': 'Track all client sub-agreements',
    'Call-Out Jobs': 'Manage all ad-hoc call-out jobs',
    'Daily Service Logs': 'Review daily logs from the field',
    'Service Tickets': 'Create and manage service tickets',
    'Ticket Issues': 'Track and resolve ticket issues',
    'Document Archive': 'Search and filter all uploaded documents',
    'User Management': 'Manage users and roles',
};


const Header: React.FC<HeaderProps> = ({ activeView }) => {
  const { user, logout } = useAuthStore();
  return (
    <header className="bg-white h-16 flex items-center justify-between px-8 border-b border-slate-200 flex-shrink-0">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{activeView}</h2>
        <p className="text-sm text-slate-500">{viewDescriptions[activeView] || 'Welcome to the portal'}</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-slate-500 hover:text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
        </button>
        <div className="flex items-center gap-2">
            <img className="h-10 w-10 rounded-full" src="https://picsum.photos/seed/admin/40/40" alt="User" />
            <div>
                <p className="font-semibold text-slate-700 text-sm">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500">{Array.isArray(user?.roles) && user?.roles?.length ? user?.roles[0] : 'Authenticated'}</p>
            </div>
            <button
              className="ml-2 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 border rounded-md border-slate-200"
              onClick={() => { logout(); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4.5A1.5 1.5 0 014.5 3h6A1.5 1.5 0 0112 4.5V7a.5.5 0 01-1 0V4.5a.5.5 0 00-.5-.5h-6a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h6a.5.5 0 00.5-.5V13a.5.5 0 011 0v2.5A1.5 1.5 0 0110.5 17h-6A1.5 1.5 0 013 15.5v-11z" clipRule="evenodd"/><path d="M12.146 10.354a.5.5 0 010-.708l2-2a.5.5 0 11.708.708L13.707 10l1.147 1.146a.5.5 0 11-.708.708l-2-2z"/><path d="M7 10a.5.5 0 01.5-.5h6.793l-.147-.146a.5.5 0 11.708-.708l1.5 1.5a.5.5 0 010 .708l-1.5 1.5a.5.5 0 11-.708-.708l.147-.146H7.5A.5.5 0 017 10z"/></svg>
              Logout
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
