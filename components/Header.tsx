
import React from 'react';
import { View } from '../types';

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
            <img className="h-10 w-10 rounded-full" src="https://picsum.photos/seed/admin/40/40" alt="Admin User" />
            <div>
                <p className="font-semibold text-slate-700 text-sm">Admin User</p>
                <p className="text-xs text-slate-500">Administrator</p>
            </div>
             <button className="text-slate-500 hover:text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
