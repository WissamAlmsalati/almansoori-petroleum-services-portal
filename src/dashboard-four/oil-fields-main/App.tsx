import React, { useState, createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { type User, type PermissionSettings, type Feature } from './types';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import FieldStatus from './pages/FieldStatus';
import CrewManagement from './pages/CrewManagement';
import TimesheetAndShifts from './pages/TimesheetAndShifts';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import api from './data';
import Spinner from './components/Spinner';
import { ToastProvider } from './components/Toast';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = (newUser: User) => setUser(newUser);
  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

interface PermissionContextType {
    permissions: Feature[];
    isLoading: boolean;
    hasPermission: (feature: Feature) => boolean;
}

export const PermissionContext = createContext<PermissionContextType | null>(null);

export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) throw new Error('usePermissions must be used within a PermissionProvider');
    return context;
}

const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [permissionSettings, setPermissionSettings] = useState<PermissionSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getPermissions().then(data => {
            setPermissionSettings(data);
            setIsLoading(false);
        });
    }, []);

    const userPermissions = useMemo(() => {
        if (!user || !permissionSettings) return [];
        return permissionSettings[user.role] || [];
    }, [user, permissionSettings]);

    const hasPermission = useCallback((feature: Feature) => {
        return userPermissions.includes(feature);
    }, [userPermissions]);

    const value = useMemo(() => ({ permissions: userPermissions, isLoading, hasPermission }), [userPermissions, isLoading, hasPermission]);
    
    return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

const ProtectedRoute: React.FC<{ feature: Feature }> = ({ feature }) => {
  const { user } = useAuth();
  const { hasPermission, isLoading } = usePermissions();

  if (!user) return <Navigate to="/login" replace />;
  if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner text="Checking permissions..." /></div>;
  if (!hasPermission(feature)) return <Navigate to="/dashboard" replace />;
  
  return <Layout><Outlet /></Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PermissionProvider>
        <ToastProvider>
           <AppRoutes />
        </ToastProvider>
      </PermissionProvider>
    </AuthProvider>
  );
};

const AppRoutes: React.FC = () => {
    const { user } = useAuth();
    
    return (
        <HashRouter>
            <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

                <Route element={<ProtectedRoute feature="dashboard" />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>

                <Route element={<ProtectedRoute feature="employees" />}>
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/employees/:employeeId" element={<Employees />} />
                </Route>
                
                <Route element={<ProtectedRoute feature="crew-management" />}>
                    <Route path="/crew-management" element={<CrewManagement />} />
                </Route>

                <Route element={<ProtectedRoute feature="timesheet-and-shifts" />}>
                    <Route path="/timesheet-and-shifts" element={<TimesheetAndShifts />} />
                </Route>

                <Route element={<ProtectedRoute feature="field-status" />}>
                    <Route path="/field-status" element={<FieldStatus />} />
                </Route>

                <Route element={<ProtectedRoute feature="reports" />}>
                    <Route path="/reports" element={<Reports />} />
                </Route>
                
                <Route element={<ProtectedRoute feature="settings" />}>
                    <Route path="/settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
            </Routes>
        </HashRouter>
    );
};

export default App;