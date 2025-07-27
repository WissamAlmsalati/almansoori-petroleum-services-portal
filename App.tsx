import React from 'react';
import { MessageProvider } from './contexts/MessageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ToastContainer from './components/ToastContainer';
import Login from './components/Login';
import MainApp from './MainApp';

// App wrapper with authentication
const AppContent: React.FC = () => {
    const { user, isLoading } = useAuth();

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

    return <MainApp />;
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
