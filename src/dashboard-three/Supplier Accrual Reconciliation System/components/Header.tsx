import React from 'react';
import type { View, User, Role } from '../types';
import { BriefcaseIcon, DocumentTextIcon, HomeIcon, ScaleIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon, UserCircleIcon, ChevronDownIcon } from './icons/Icons';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  currentUser: User;
  users: User[];
  onSetCurrentUser: (user: User) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, currentUser, users, onSetCurrentUser }) => {
  const baseNavItems: ReadonlyArray<{
    id: View;
    label: string;
    icon: JSX.Element;
    roles: readonly Role[];
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon />, roles: ['coordinator', 'field_supervisor'] },
    { id: 'suppliers', label: 'Suppliers & Services', icon: <UsersIcon />, roles: ['coordinator'] },
    { id: 'entries', label: 'Field Entries', icon: <DocumentTextIcon />, roles: ['coordinator', 'field_supervisor'] },
    { id: 'reports', label: 'Reports', icon: <ChartBarIcon />, roles: ['coordinator'] },
    { id: 'reconciliation', label: 'Reconciliation', icon: <ScaleIcon />, roles: ['coordinator'] },
    { id: 'users', label: 'User Management', icon: <Cog6ToothIcon />, roles: ['coordinator'] },
  ];

  const navItems = baseNavItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <BriefcaseIcon className="h-8 w-8 text-primary-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-800 hidden sm:block">Accrual System</h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex md:space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    activeView === item.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="relative group">
              <div className="flex items-center bg-gray-100 group-hover:bg-gray-200/70 rounded-full pl-3 pr-2 py-1.5 transition-colors">
                <UserCircleIcon className="h-6 w-6 text-gray-500"/>
                <select 
                  value={currentUser.id} 
                  onChange={(e) => {
                    const selectedUser = users.find(u => u.id === e.target.value);
                    if (selectedUser) onSetCurrentUser(selectedUser);
                  }}
                  className="appearance-none bg-transparent border-none text-gray-700 font-medium py-1 pl-2 pr-6 focus:outline-none focus:ring-0 text-sm cursor-pointer"
                  aria-label="Switch user"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Nav */}
      <nav className="md:hidden border-t border-gray-200 bg-white">
         <div className="flex justify-around p-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center w-full py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === item.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1 text-center font-semibold">{item.label}</span>
              </button>
            ))}
         </div>
      </nav>
    </header>
  );
};

export default Header;