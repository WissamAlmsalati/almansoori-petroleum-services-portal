import React from 'react';
import { MessageProvider } from './src/contexts/MessageContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import ToastContainer from './src/components/ToastContainer';
import Login from './src/components/Login';
import DashboardOne from './src/components/DashboardOne';
import DashboardTwo from './src/components/DashboardTwo';
import DashboardThree from './src/components/DashboardThree';
import DashboardFour from './src/components/DashboardFour';

// App wrapper with authentication
const AppContent: React.FC = () => {
    const { user, selectedDashboard, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    // Render the selected dashboard
    if (selectedDashboard === 'dashboard-two') {
        return <DashboardTwo />;
    }
    
    if (selectedDashboard === 'dashboard-three') {
        return <DashboardThree />;
    }
    
    if (selectedDashboard === 'dashboard-four') {
        return <DashboardFour />;
    }

    return <DashboardOne />;
};

// Main App with providers
const App: React.FC = () => {
    return (
        <MessageProvider>
            <AuthProvider>
                <AppContent />
                <ToastContainer />
            </AuthProvider>
        </MessageProvider>
    );
};

export default App;
