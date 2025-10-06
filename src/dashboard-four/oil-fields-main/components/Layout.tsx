import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, usePermissions } from '../../../components/DashboardFour';
import { type Feature, CourseStatus } from '../types';
import { getCourseStatus } from '../utils';
import api from '../data';
import {
  DashboardIcon, EmployeesIcon, LocationIcon, ReportsIcon,
  SettingsIcon, BellIcon, ChevronDownIcon, OilRigIcon, TimesheetIcon, UserGroupIcon
} from './Icons';

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  feature: Feature;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, feature: 'dashboard' },
  { to: '/employees', label: 'Employees & Courses', icon: EmployeesIcon, feature: 'employees' },
  { to: '/field-status', label: 'Field Status', icon: LocationIcon, feature: 'field-status' },
  { to: '/crew-management', label: 'Crew Management', icon: UserGroupIcon, feature: 'crew-management' },
  { to: '/timesheet-and-shifts', label: 'Timesheet & Shifts', icon: TimesheetIcon, feature: 'timesheet-and-shifts' },
  { to: '/reports', label: 'Reports', icon: ReportsIcon, feature: 'reports' },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, feature: 'settings' },
];

const Sidebar: React.FC = () => {
  const { hasPermission } = usePermissions();

  return (
    <aside className="w-64 bg-brand-nav flex flex-col fixed h-full">
      <div className="flex items-center justify-center h-20 border-b border-brand-dark">
        <OilRigIcon className="w-8 h-8 mr-2 text-brand-primary" />
        <h1 className="text-xl font-bold text-white">OilField Manager</h1>
      </div>
      <nav className="flex-grow p-4">
        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Main Menu</p>
        <ul>
          {navItems.filter(item => hasPermission(item.feature)).map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center p-3 my-1 rounded-md text-brand-light hover:bg-brand-primary/20 hover:text-white transition-colors ${
                    isActive ? 'bg-brand-primary/20 text-white' : ''
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  
  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const getPageTitle = () => {
      const path = location.pathname.split('/')[1];
      const navItem = navItems.find(item => item.to.includes(path));
      if (path === 'employees' && location.pathname.split('/').length > 2) return "Employee Profile";
      return navItem ? navItem.label : 'Dashboard';
  }
  
    useEffect(() => {
        api.getEmployees().then(employees => {
            const urgentAlerts = employees
                .flatMap(e => e.courses.map(c => ({ ...c, status: getCourseStatus(c.expiryDate), employeeName: e.name })))
                .filter(c => c.status.status !== CourseStatus.VALID)
                .sort((a,b) => a.status.daysLeft - b.status.daysLeft)
                .slice(0, 5);
            setAlerts(urgentAlerts);
        });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
                setIsAlertsOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [alertsRef, profileRef]);

    const handleProfileClick = () => {
        navigate(`/employees/${user?.employeeProfileId}`);
        setIsProfileOpen(false);
    }

  return (
    <header className="h-20 bg-brand-bg flex items-center justify-between px-8 border-b border-brand-dark">
      <div>
          <h2 className="text-2xl font-bold">{getPageTitle()}</h2>
          <p className="text-sm text-gray-400">{user?.role} Dashboard</p>
      </div>
      <div className="flex items-center">
        <div className="relative" ref={alertsRef}>
            <button onClick={() => setIsAlertsOpen(!isAlertsOpen)} className="relative mr-6 text-gray-400 hover:text-white">
                <BellIcon className="w-6 h-6" />
                {alerts.length > 0 && (
                <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                )}
            </button>
            {isAlertsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-brand-nav rounded-lg shadow-xl z-20 p-4 border border-brand-dark">
                    <h4 className="font-bold text-white mb-2">Notifications</h4>
                    {alerts.length > 0 ? (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {alerts.map(alert => (
                                <div key={alert.id} className="text-sm border-b border-brand-dark/50 pb-2 last:border-b-0">
                                    <p className="font-semibold text-brand-text">{alert.name} {alert.status.status === CourseStatus.EXPIRED ? 'Expired' : 'Expiring'}</p>
                                    <p className="text-xs text-brand-light">{alert.employeeName}</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-gray-400">No new notifications.</p>}
                </div>
            )}
        </div>
        
        {user && (
          <div className="relative" ref={profileRef}>
             <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center cursor-pointer">
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-4 border-2 border-brand-primary"/>
                <div>
                  <p className="font-semibold text-white text-left">{user.name}</p>
                  <p className="text-xs text-gray-400 text-left">{user.role}</p>
                </div>
                <ChevronDownIcon className={`w-5 h-5 ml-2 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
             </button>
             {isProfileOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-brand-nav rounded-lg shadow-xl z-20 border border-brand-dark overflow-hidden">
                    <ul>
                        <li><button onClick={handleProfileClick} className="w-full text-left px-4 py-2 text-sm text-brand-light hover:bg-brand-primary/20 hover:text-white">My Profile</button></li>
                        <li><button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-brand-light hover:bg-brand-primary/20 hover:text-white">Logout</button></li>
                    </ul>
                 </div>
             )}
          </div>
        )}
      </div>
    </header>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-brand-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col ml-64">
        <Header />
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;