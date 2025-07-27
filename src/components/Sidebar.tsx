
import React from 'react';
import { View } from '../types';
import { 
    DashboardIcon, ClientsIcon, SubAgreementsIcon, CallOutJobsIcon, DailyServiceLogsIcon, 
    ServiceTicketsIcon, TicketIssuesIcon, DocumentArchiveIcon, UserManagementIcon, LogoutIcon 
} from './icons/IconComponents';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const menuItems: { name: View; icon: React.ReactNode }[] = [
  { name: 'Dashboard', icon: <DashboardIcon /> },
  { name: 'Clients', icon: <ClientsIcon /> },
  { name: 'Sub-Agreements', icon: <SubAgreementsIcon /> },
  { name: 'Call-Out Jobs', icon: <CallOutJobsIcon /> },
  { name: 'Daily Service Logs', icon: <DailyServiceLogsIcon /> },
  { name: 'Service Tickets', icon: <ServiceTicketsIcon /> },
  { name: 'Ticket Issues', icon: <TicketIssuesIcon /> },
  { name: 'Document Archive', icon: <DocumentArchiveIcon /> },
  { name: 'User Management', icon: <UserManagementIcon /> },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-64 bg-white text-brand-navy-900 flex flex-col border-r border-slate-200 fixed h-full">
      <div className="h-16 flex items-center justify-center border-b border-slate-200">
        <h1 className="text-xl font-bold text-brand-blue-600">Almansoori</h1>
      </div>
      <nav className="flex-1 px-4 py-4">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-1">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView(item.name);
                }}
                className={`flex items-center p-2 rounded-md transition-colors duration-200 ${
                  activeView === item.name
                    ? 'bg-brand-blue-50 text-brand-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 py-4 border-t border-slate-200">
         <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="flex items-center p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-200"
          >
            <span className="mr-3"><LogoutIcon /></span>
            Logout
          </a>
      </div>
    </aside>
  );
};

export default Sidebar;
