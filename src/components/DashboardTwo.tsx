import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, MaterialRequest, Notification, RequestStatus } from '../dashboard-two/Material Request Tracking System 2/types';
import { USER_ROLES, MOCK_REQUESTS } from '../dashboard-two/Material Request Tracking System 2/constants';
import Dashboard from '../dashboard-two/Material Request Tracking System 2/components/Dashboard';
import NotificationBell from '../dashboard-two/Material Request Tracking System 2/components/NotificationBell';
import { ChevronDownIcon } from '../dashboard-two/Material Request Tracking System 2/components/icons';

/**
 * Compares an old and new request to generate contextual notification messages.
 */
const generateUpdateNotifications = (oldRequest: MaterialRequest, updatedRequest: MaterialRequest): string[] => {
    const messages: string[] = [];

    // Check for overall status change
    if (oldRequest.status !== updatedRequest.status) {
        let statusMessage = `Request ${updatedRequest.id} status is now "${updatedRequest.status}".`;
        // Add more context for specific status changes
        if (updatedRequest.status === RequestStatus.PO_ISSUED) {
            const newPR = updatedRequest.purchaseRequests[updatedRequest.purchaseRequests.length - 1];
            if (newPR) {
                statusMessage = `PR ${newPR.prNumber} created and PO issued for request ${updatedRequest.id}.`;
            }
        }
        messages.push(statusMessage);
    }

    // Check for new follow-ups
    if (oldRequest.followUps.length < updatedRequest.followUps.length) {
        const newFollowUp = updatedRequest.followUps[updatedRequest.followUps.length - 1];
        messages.push(`Follow-up added to ${updatedRequest.id} by ${newFollowUp.person}.`);
        if (newFollowUp.reminderDate) {
            messages.push(`Reminder set for ${updatedRequest.id} on ${new Date(newFollowUp.reminderDate).toLocaleDateString()}.`);
        }
    }
    
    // Check for PR item status changes
    const oldPRItems = new Map(oldRequest.purchaseRequests.flatMap(pr => pr.items.map(item => [item.id, { ...item, prNumber: pr.prNumber }])));
    const newPRItems = updatedRequest.purchaseRequests.flatMap(pr => pr.items.map(item => ({ ...item, prNumber: pr.prNumber })));

    for (const newItem of newPRItems) {
        const oldItem = oldPRItems.get(newItem.id);
        if (oldItem && oldItem.status !== newItem.status) {
            messages.push(`Item "${newItem.description}" in PR ${newItem.prNumber} is now "${newItem.status}".`);
        }
    }

    return messages;
}

const DashboardTwo: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.FIELD_STAFF);
  const [requests, setRequests] = useState<MaterialRequest[]>(MOCK_REQUESTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, requestId: string) => {
      const newNotification: Notification = {
          id: `notif-${Date.now()}-${Math.random()}`,
          message,
          requestId,
          read: false,
          timestamp: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const addRequest = useCallback((requestData: Omit<MaterialRequest, 'id' | 'submissionDate' | 'status' | 'purchaseRequests' | 'purchaseOrders' | 'followUps'>) => {
      const newRequest: MaterialRequest = {
          ...requestData,
          id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
          submissionDate: new Date().toISOString(),
          status: RequestStatus.NEW_REQUEST,
          purchaseRequests: [],
          purchaseOrders: [],
          followUps: [],
      };
      setRequests(prev => [newRequest, ...prev]);
      addNotification(`New request ${newRequest.id} for "${newRequest.itemDescription}" submitted.`, newRequest.id);
  }, [requests.length, addNotification]);

  const updateRequest = useCallback((updatedRequest: MaterialRequest) => {
      const oldRequest = requests.find(r => r.id === updatedRequest.id);
      
      setRequests(prev => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
      
      if (oldRequest) {
          const messages = generateUpdateNotifications(oldRequest, updatedRequest);
          messages.forEach(msg => addNotification(msg, updatedRequest.id));
      }
  }, [addNotification, requests]);
  
  const handleNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-gray-800 dark:bg-black/50 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white">MaterialFlow - Almansoori Petroleum</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Welcome, {user?.name || user?.email}</span>
              <div className="relative">
                <select 
                  value={currentUserRole} 
                  onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
                  className="appearance-none bg-gray-700 text-white pl-3 pr-8 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-label="Select user role"
                >
                  {USER_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <ChevronDownIcon className="w-5 h-5 text-gray-300 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/>
              </div>
              <NotificationBell notifications={notifications} onNotificationRead={handleNotificationRead} />
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <Dashboard 
          userRole={currentUserRole}
          requests={requests}
          addRequest={addRequest}
          updateRequest={updateRequest}
        />
      </main>
    </div>
  );
};

export default DashboardTwo;
