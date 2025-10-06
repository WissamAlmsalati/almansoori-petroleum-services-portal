import React, { useMemo } from 'react';
import type { View, User } from '../types';
import { ChevronRightIcon, ChartBarIcon, DocumentTextIcon, ScaleIcon, UsersIcon, Cog6ToothIcon } from './icons/Icons';

interface DashboardProps {
  supplierCount: number;
  entryCount: number;
  invoiceCount: number;
  setActiveView: (view: View) => void;
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ supplierCount, entryCount, invoiceCount, setActiveView, currentUser }) => {
  const stats = [
    { name: 'Total Suppliers', stat: supplierCount, icon: <UsersIcon className="h-8 w-8 text-white"/>, roles: ['coordinator'] },
    { name: 'Field Entries Logged', stat: entryCount, icon: <DocumentTextIcon className="h-8 w-8 text-white"/>, roles: ['coordinator', 'field_supervisor'] },
    { name: 'Invoices Reconciled', stat: invoiceCount, icon: <ScaleIcon className="h-8 w-8 text-white"/>, roles: ['coordinator'] },
  ];

  const allActions = [
    { name: 'Manage Suppliers', description: 'Add or edit suppliers and their services.', view: 'suppliers' as View, icon: <UsersIcon/>, roles: ['coordinator']},
    { name: 'Log Field Entry', description: 'Enter daily service records.', view: 'entries' as View, icon: <DocumentTextIcon/>, roles: ['coordinator', 'field_supervisor']},
    { name: 'View Reports', description: 'Generate monthly accrual reports.', view: 'reports' as View, icon: <ChartBarIcon />, roles: ['coordinator']},
    { name: 'Run Reconciliation', description: 'Compare with supplier invoices.', view: 'reconciliation' as View, icon: <ScaleIcon/>, roles: ['coordinator']},
    { name: 'Manage Users', description: 'Add or edit system users.', view: 'users' as View, icon: <Cog6ToothIcon />, roles: ['coordinator'] },
  ];

  const visibleStats = useMemo(() => stats.filter(s => s.roles.includes(currentUser.role)), [currentUser.role]);
  const visibleActions = useMemo(() => allActions.filter(a => a.roles.includes(currentUser.role)), [currentUser.role]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Dashboard</h2>
        <p className="mt-1 text-gray-600">Welcome, {currentUser.name}. Overview and quick actions.</p>
      </div>

      <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${visibleStats.length === 3 ? 'lg:grid-cols-3' : ''}`}>
        {visibleStats.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm sm:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-primary-600 p-3 shadow">
                {item.icon}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                <dd className="text-3xl font-semibold tracking-tight text-gray-900">{item.stat}</dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Actions</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleActions.map((action) => (
            <div key={action.name} className="relative flex items-center space-x-3 rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm hover:border-primary-400 hover:shadow-md transition-all duration-150 ease-in-out transform hover:scale-105 hover:bg-primary-50">
                <div className="flex-shrink-0 text-gray-600">{action.icon}</div>
                <div className="min-w-0 flex-1">
                    <button onClick={() => setActiveView(action.view)} className="focus:outline-none text-left">
                        <span className="absolute inset-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-gray-900">{action.name}</p>
                        <p className="text-sm text-gray-500 truncate">{action.description}</p>
                    </button>
                </div>
                <ChevronRightIcon className="text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;