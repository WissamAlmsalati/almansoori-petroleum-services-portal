import React, { useState, createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { type User as OilFieldUser, type PermissionSettings, type Feature, UserRole } from '../dashboard-four/oil-fields-main/types';
import Layout from '../dashboard-four/oil-fields-main/components/Layout';
import Employees from '../dashboard-four/oil-fields-main/pages/Employees';
import FieldStatus from '../dashboard-four/oil-fields-main/pages/FieldStatus';
import CrewManagement from '../dashboard-four/oil-fields-main/pages/CrewManagement';
import TimesheetAndShifts from '../dashboard-four/oil-fields-main/pages/TimesheetAndShifts';
import Settings from '../dashboard-four/oil-fields-main/pages/Settings';
import Reports from '../dashboard-four/oil-fields-main/pages/Reports';
import api from '../dashboard-four/oil-fields-main/data';
import Spinner from '../dashboard-four/oil-fields-main/components/Spinner';
import { ToastProvider } from '../dashboard-four/oil-fields-main/components/Toast';

// Create contexts to replace React Router functionality
interface AuthContextType {
  user: OilFieldUser | null;
  login: (user: OilFieldUser) => void;
  logout: () => void;
}

const OilFieldAuthContext = createContext<AuthContextType | null>(null);

export const useOilFieldAuth = () => {
  const context = useContext(OilFieldAuthContext);
  if (!context) throw new Error('useOilFieldAuth must be used within an OilFieldAuthProvider');
  return context;
};

// Compatibility alias for oil-fields components
export const useAuth = useOilFieldAuth;

interface PermissionContextType {
    permissions: Feature[];
    isLoading: boolean;
    hasPermission: (feature: Feature) => boolean;
}

const OilFieldPermissionContext = createContext<PermissionContextType | null>(null);

export const useOilFieldPermissions = () => {
    const context = useContext(OilFieldPermissionContext);
    if (!context) throw new Error('useOilFieldPermissions must be used within an OilFieldPermissionProvider');
    return context;
}

// Compatibility alias for oil-fields components
export const usePermissions = useOilFieldPermissions;

// Create a router-free Dashboard component
const DashboardWithoutRouter: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [empData, locData] = await Promise.all([
          api.getEmployees(),
          api.getFieldLocations(),
        ]);
        setEmployees(empData);
        setLocations(locData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner text="Loading dashboard data..." />
      </div>
    );
  }

  // Return the same UI as the original Dashboard but without useNavigate
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Dashboard cards with same styling as original */}
        <div className="bg-brand-nav p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 uppercase">Total Employees</p>
            <p className="text-3xl font-bold text-white">{employees.filter(emp => emp.status === 'Active').length}</p>
          </div>
          <div className="p-3 rounded-full bg-blue-600">
            <div className="w-8 h-8 text-white">👥</div>
          </div>
        </div>
        
        <div className="bg-brand-nav p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 uppercase">Field Locations</p>
            <p className="text-3xl font-bold text-white">{locations.length}</p>
          </div>
          <div className="p-3 rounded-full bg-green-600">
            <div className="w-8 h-8 text-white">🏭</div>
          </div>
        </div>

        <div className="bg-brand-nav p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 uppercase">On-Site Staff</p>
            <p className="text-3xl font-bold text-white">{employees.filter(emp => {
              const currentShift = emp.shiftHistory?.find((shift: any) => !shift.endDate);
              return currentShift && currentShift.type !== 'Off';
            }).length}</p>
          </div>
          <div className="p-3 rounded-full bg-purple-600">
            <div className="w-8 h-8 text-white">⚡</div>
          </div>
        </div>

        <div className="bg-brand-nav p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 uppercase">Training Alerts</p>
            <p className="text-3xl font-bold text-white">{employees.reduce((count, emp) => {
              return count + (emp.courses?.filter((course: any) => {
                const expiryDate = new Date(course.expiryDate);
                const today = new Date();
                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                return daysUntilExpiry <= 30; // Expiring within 30 days or expired
              }).length || 0);
            }, 0)}</p>
          </div>
          <div className="p-3 rounded-full bg-red-600">
            <div className="w-8 h-8 text-white">⚠️</div>
          </div>
        </div>
      </div>

      {/* Additional dashboard content matching original styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-nav p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-brand-light text-sm">Employee management and field operations overview</div>
          </div>
        </div>

        <div className="bg-brand-nav p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-brand-light">Active Employees</span>
              <span className="text-brand-text font-semibold">{employees.filter(emp => emp.status === 'Active').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-light">Field Locations</span>
              <span className="text-brand-text font-semibold">{locations.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Sidebar Component for Dashboard Four
interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  currentUser: OilFieldUser;
  permissions: Feature[];
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeRoute, onNavigate, currentUser, permissions, onLogout }) => {
  const menuItems = [
    { route: 'dashboard', label: 'Dashboard', icon: '📊', feature: 'dashboard' as Feature },
    { route: 'employees', label: 'Employees', icon: '👥', feature: 'employees' as Feature },
    { route: 'crew-management', label: 'Crew Management', icon: '⚡', feature: 'crew-management' as Feature },
    { route: 'timesheet-and-shifts', label: 'Timesheet & Shifts', icon: '⏰', feature: 'timesheet-and-shifts' as Feature },
    { route: 'field-status', label: 'Field Status', icon: '🏭', feature: 'field-status' as Feature },
    { route: 'reports', label: 'Reports', icon: '📈', feature: 'reports' as Feature },
    { route: 'settings', label: 'Settings', icon: '⚙️', feature: 'settings' as Feature },
  ].filter(item => permissions.includes(item.feature));

  return (
    <aside className="w-64 bg-white text-brand-navy-900 flex flex-col border-r border-slate-200 fixed h-full">
      <div className="h-16 flex items-center justify-center border-b border-slate-200">
        <h1 className="text-xl font-bold text-brand-blue-600">Almansoori</h1>
      </div>
      <nav className="flex-1 px-4 py-4">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Oil Fields</p>
        <ul>
          {menuItems.map((item) => (
            <li key={item.route} className="mb-1">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.route);
                }}
                className={`flex items-center p-2 rounded-md transition-colors duration-200 ${
                  activeRoute === item.route
                    ? 'bg-brand-blue-50 text-brand-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 py-4 border-t border-slate-200">
         <button
            onClick={onLogout}
            className="w-full flex items-center p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-200"
          >
            <span className="mr-3 text-lg">🚪</span>
            Logout
          </button>
      </div>
    </aside>
  );
};

// Custom Header Component for Dashboard Four
interface HeaderProps {
  activeRoute: string;
  currentUser: OilFieldUser;
  authUser: any;
  onUserChange: (user: OilFieldUser) => void;
  availableUsers: OilFieldUser[];
}

const Header: React.FC<HeaderProps> = ({ activeRoute, currentUser, authUser, onUserChange, availableUsers }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const routeDescriptions: Record<string, string> = {
    'dashboard': 'Overview of oil field operations',
    'employees': 'Manage employee profiles and information',
    'crew-management': 'Organize and manage field crews',
    'timesheet-and-shifts': 'Track employee timesheets and shift schedules',
    'field-status': 'Monitor field locations and operations',
    'reports': 'Generate operational reports and analytics',
    'settings': 'Configure system settings and permissions',
  };

  const getRouteTitle = (route: string): string => {
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'employees': 'Employees',
      'crew-management': 'Crew Management',
      'timesheet-and-shifts': 'Timesheet & Shifts',
      'field-status': 'Field Status',
      'reports': 'Reports',
      'settings': 'Settings',
    };
    return titles[route] || 'Dashboard';
  };

  return (
    <header className="bg-white h-16 flex items-center justify-between px-8 border-b border-slate-200 flex-shrink-0">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{getRouteTitle(activeRoute)}</h2>
        <p className="text-sm text-slate-500">{routeDescriptions[activeRoute] || 'Welcome to the oil fields management system'}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-slate-500">Role:</span>
          <select 
            value={currentUser.id} 
            onChange={(e) => {
              const selectedUser = availableUsers.find(u => u.id === e.target.value);
              if (selectedUser) onUserChange(selectedUser);
            }}
            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
          >
            {availableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>
        
        {/* User Menu */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <img 
              className="h-10 w-10 rounded-full" 
              src={currentUser.avatarUrl || `https://picsum.photos/seed/${authUser?.name || 'admin'}/40/40`} 
              alt={authUser?.name || 'User'} 
            />
            <div>
              <p className="font-semibold text-slate-700 text-sm">{authUser?.name || 'User'}</p>
              <p className="text-xs text-slate-500">{currentUser.role}</p>
            </div>
            <button 
              className="text-slate-500 hover:text-slate-700"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-200">
              <div className="px-4 py-2 text-sm text-slate-700 border-b border-slate-100">
                <p className="font-medium">{authUser?.name}</p>
                <p className="text-slate-500">{authUser?.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

const DashboardFour: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<OilFieldUser | null>(null);
  const [availableUsers, setAvailableUsers] = useState<OilFieldUser[]>([]);
  const [permissions, setPermissions] = useState<Feature[]>([]);
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with oil field system data
    const initializeData = async () => {
      try {
        const users = await api.getUsers();
        const permissionSettings = await api.getPermissions();
        
        setAvailableUsers(users);
        
        // Set default user (Admin for full access)
        const defaultUser = users.find(u => u.role === UserRole.ADMIN) || users[0];
        if (defaultUser) {
          setCurrentUser(defaultUser);
          setPermissions(permissionSettings[defaultUser.role] || []);
        }
      } catch (error) {
        console.error('Failed to initialize oil field data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleUserChange = useCallback(async (user: OilFieldUser) => {
    setCurrentUser(user);
    const permissionSettings = await api.getPermissions();
    setPermissions(permissionSettings[user.role] || []);
  }, []);

  const renderContent = () => {
    if (!currentUser) return null;

    // Provide contexts for the original components
    const authContextValue = {
      user: currentUser,
      login: setCurrentUser,
      logout: () => logout()
    };

    const permissionContextValue = {
      permissions,
      isLoading: false,
      hasPermission: (feature: Feature) => permissions.includes(feature)
    };

    switch (activeRoute) {
      case 'dashboard':
        return <DashboardWithoutRouter />;
      case 'employees':
        return (
          <OilFieldAuthContext.Provider value={authContextValue}>
            <OilFieldPermissionContext.Provider value={permissionContextValue}>
              <Employees />
            </OilFieldPermissionContext.Provider>
          </OilFieldAuthContext.Provider>
        );
      case 'field-status':
        return (
          <OilFieldAuthContext.Provider value={authContextValue}>
            <OilFieldPermissionContext.Provider value={permissionContextValue}>
              <FieldStatus />
            </OilFieldPermissionContext.Provider>
          </OilFieldAuthContext.Provider>
        );
      case 'crew-management':
        return (
          <OilFieldAuthContext.Provider value={authContextValue}>
            <OilFieldPermissionContext.Provider value={permissionContextValue}>
              <CrewManagement />
            </OilFieldPermissionContext.Provider>
          </OilFieldAuthContext.Provider>
        );
      case 'timesheet-and-shifts':
        return (
          <OilFieldAuthContext.Provider value={authContextValue}>
            <OilFieldPermissionContext.Provider value={permissionContextValue}>
              <TimesheetAndShifts />
            </OilFieldPermissionContext.Provider>
          </OilFieldAuthContext.Provider>
        );
      case 'settings':
        return (
          <OilFieldAuthContext.Provider value={authContextValue}>
            <OilFieldPermissionContext.Provider value={permissionContextValue}>
              <Settings />
            </OilFieldPermissionContext.Provider>
          </OilFieldAuthContext.Provider>
        );
      case 'reports':
        return (
          <OilFieldAuthContext.Provider value={authContextValue}>
            <OilFieldPermissionContext.Provider value={permissionContextValue}>
              <Reports />
            </OilFieldPermissionContext.Provider>
          </OilFieldAuthContext.Provider>
        );
      default:
        return <DashboardWithoutRouter />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner text="Loading oil field management system..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Failed to load system</h2>
          <p className="text-gray-600">Unable to initialize oil field management system.</p>
        </div>
      </div>
    );
  }

  // Create contexts for the original oil-fields system
  const authContextValue = {
    user: currentUser,
    login: setCurrentUser,
    logout: () => logout()
  };

  const permissionContextValue = {
    permissions,
    isLoading: false,
    hasPermission: (feature: Feature) => permissions.includes(feature)
  };

  return (
    <HashRouter>
      <ToastProvider>
        <OilFieldAuthContext.Provider value={authContextValue}>
          <OilFieldPermissionContext.Provider value={permissionContextValue}>
            <div className="flex h-screen bg-slate-50 font-sans">
              <Sidebar 
                activeRoute={activeRoute}
                onNavigate={setActiveRoute}
                currentUser={currentUser}
                permissions={permissions}
                onLogout={logout}
              />
              <div className="flex-1 flex flex-col ml-64">
                <Header 
                  activeRoute={activeRoute}
                  currentUser={currentUser}
                  authUser={authUser}
                  onUserChange={handleUserChange}
                  availableUsers={availableUsers}
                />
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                  {renderContent()}
                </main>
              </div>
            </div>
          </OilFieldPermissionContext.Provider>
        </OilFieldAuthContext.Provider>
      </ToastProvider>
    </HashRouter>
  );
};

export default DashboardFour;
