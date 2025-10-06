
import React, { useState } from 'react';
import { useAuth } from '../../../components/DashboardFour';
import api from '../data';
import { HardHatIcon, EmployeesIcon, TrainingIcon, LocationIcon, ReportsIcon } from '../components/Icons';
import { useToast } from '../components/Toast';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-brand-nav bg-opacity-50 backdrop-blur-sm p-6 rounded-lg shadow-lg text-left transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center mb-3">
            <div className="bg-brand-primary/20 text-brand-primary p-2 rounded-md mr-4">{icon}</div>
            <h3 className="text-xl font-bold text-brand-text">{title}</h3>
        </div>
        <p className="text-brand-light leading-relaxed">{description}</p>
    </div>
);

const Login: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !password) {
        addToast("Please enter Employee ID and Password.", 'warning');
        return;
    };
    setIsLoading(true);
    try {
        const user = await api.login(employeeId, password);
        if (user) {
          login(user);
        } else {
          addToast('Invalid credentials. Please try again.', 'error');
          setIsLoading(false);
        }
    } catch (error) {
        addToast('An unexpected error occurred.', 'error');
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4" style={{
      backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(26, 35, 58, 0.9)), url(https://picsum.photos/1920/1080?blur=5&grayscale)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="text-center mb-12">
        <HardHatIcon className="w-16 h-16 mx-auto mb-4 text-brand-primary" />
        <h1 className="text-5xl font-bold text-white tracking-tight">Oil Field Employee Management</h1>
        <p className="mt-4 text-lg text-brand-light max-w-3xl mx-auto">
          Comprehensive employee management system for oil field operations with role-based access, course tracking, and shift assignment capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 max-w-7xl w-full">
          <FeatureCard icon={<EmployeesIcon className="w-8 h-8"/>} title="Employee Management" description="Manage employee profiles, documents, and personal information with secure access control." />
          <FeatureCard icon={<TrainingIcon className="w-8 h-8"/>} title="Training & Safety" description="Track certifications, HSE training, and safety courses with automatic expiry alerts." />
          <FeatureCard icon={<LocationIcon className="w-8 h-8"/>} title="Field Operations" description="Manage field locations, shift assignments, and real-time employee status tracking." />
          <FeatureCard icon={<ReportsIcon className="w-8 h-8"/>} title="Role-Based Access" description="Admin, Coordinator, Supervisor, and Employee roles with appropriate permissions." />
      </div>

      <div className="w-full max-w-sm bg-brand-nav p-8 rounded-xl shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-brand-light mb-2">Employee ID</label>
            <input
              id="employeeId"
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g., E-0001"
              className="w-full bg-brand-bg border border-brand-dark text-white p-3 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none"
            />
          </div>
           <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-light mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-brand-bg border border-brand-dark text-white p-3 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-primary hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
