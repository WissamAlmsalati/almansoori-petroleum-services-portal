
import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';
import Pagination from './Pagination';

interface UserManagementProps {
  users: User[];
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onBulkDelete: (userIds: string[]) => void;
  onResetPassword: (userId: string, newPassword: string) => void;
  onApproveUser?: (userId: string) => void;
  isLoading?: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  onAdd, 
  onEdit, 
  onDelete, 
  onBulkDelete,
  onResetPassword,
  onViewActivity,
  onApproveUser,
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      return (
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (roleFilter === '' || user.role === roleFilter) &&
        (statusFilter === '' || user.status === statusFilter)
      );
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Pagination logic
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const roles = useMemo(() => [...new Set(users.map(u => u.role))].sort(), [users]);
  const statuses = useMemo(() => [...new Set(users.map(u => u.status))].sort(), [users]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, id]);
    } else {
      setSelectedUsers(prev => prev.filter(userId => userId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length > 0) {
      onBulkDelete(selectedUsers);
      setSelectedUsers([]);
    }
  };

  const handleResetPassword = (user: User) => {
    setSelectedUserForReset(user);
    setShowResetPasswordModal(true);
  };

  const handleConfirmResetPassword = () => {
    if (selectedUserForReset && newPassword.trim()) {
      onResetPassword(selectedUserForReset.id, newPassword);
      setShowResetPasswordModal(false);
      setSelectedUserForReset(null);
      setNewPassword('');
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      onDelete(userToDelete);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'User':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">User Management</h3>
          <p className="text-sm text-slate-600 mt-1">Manage system users and permissions</p>
        </div>
        <div className="flex space-x-3">
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete Selected ({selectedUsers.length})
            </button>
          )}
          <button
            onClick={onAdd}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-blue-600 rounded-lg hover:bg-brand-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add User</span>
          </button>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border">
        <input
          type="text"
          placeholder="Search users..."
          className="col-span-1 md:col-span-2 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map(role => <option key={role} value={role}>{role}</option>)}
        </select>
        <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {statuses.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
            <tr>
              <th scope="col" className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-brand-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-blue-500"
                />
              </th>
              <th scope="col" className="px-4 py-3">User</th>
              <th scope="col" className="px-4 py-3">Email</th>
              <th scope="col" className="px-4 py-3">Role</th>
              <th scope="col" className="px-4 py-3">Email Status</th>
              <th scope="col" className="px-4 py-3">Account Status</th>
              <th scope="col" className="px-4 py-3">Created</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => (
              <tr key={user.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    className="w-4 h-4 text-brand-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <img
                      className="w-10 h-10 rounded-full border-2 border-slate-200"
                      src={user.avatarUrl || `https://picsum.photos/seed/${user.name}/40/40`}
                      alt={user.name}
                    />
                    <div>
                      <div className="font-medium text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-900">{user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                    user.emailVerifiedAt 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {user.emailVerifiedAt ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(user.status || 'pending')}`}>
                    {user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-900">{formatDate(user.createdAt)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {user.status === 'pending' && onApproveUser && (
                      <button 
                        onClick={() => onApproveUser(user.id)} 
                        className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200 transition-colors flex items-center space-x-1"
                        title="Approve User"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Approve</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleResetPassword(user)} 
                      className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 border border-orange-200 rounded-md hover:bg-orange-200 transition-colors"
                      title="Reset Password"
                    >
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Reset
                    </button>
                    <button 
                      onClick={() => onEdit(user)} 
                      className="px-3 py-1 text-xs font-medium text-brand-blue-700 bg-brand-blue-100 border border-brand-blue-200 rounded-md hover:bg-brand-blue-200 transition-colors"
                      title="Edit User"
                    >
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)} 
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 transition-colors"
                      title="Delete User"
                    >
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
             {paginatedUsers.length === 0 && (
                <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <div className="text-lg font-medium">No users found</div>
                        <div className="text-sm">Try adjusting your search or filter criteria</div>
                      </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUserForReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Reset Password</h3>
                <p className="text-sm text-slate-600">for {selectedUserForReset.name}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500"
                placeholder="Enter new password"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedUserForReset(null);
                  setNewPassword('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResetPassword}
                disabled={!newPassword.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Delete User</h3>
                <p className="text-sm text-slate-600">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                Are you sure you want to delete <strong>{userToDelete.name}</strong> ({userToDelete.email})?
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
