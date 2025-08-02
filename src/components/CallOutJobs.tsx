
import React, { useState, useMemo } from 'react';
import { CallOutJob, Client } from '../types';
import Pagination from './Pagination';

interface CallOutJobsProps {
  jobs: CallOutJob[];
  clients: Client[];
  onAdd: () => void;
  onEdit: (job: CallOutJob) => void;
  onDelete: (job: CallOutJob) => void;
}

const CallOutJobs: React.FC<CallOutJobsProps> = ({ jobs, clients, onAdd, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'N/A';

  // Pagination logic
  const totalItems = jobs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobs = jobs.slice(startIndex, endIndex);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">All Call-Out Jobs ({jobs.length})</h3>
        <button onClick={onAdd} className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">
          Add New Job
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="text-xs font-medium text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-2 tracking-wide">Job Name</th>
              <th scope="col" className="px-4 py-2 tracking-wide">Client</th>
              <th scope="col" className="px-4 py-2 tracking-wide">Work Order #</th>
              <th scope="col" className="px-4 py-2 tracking-wide">Priority</th>
              <th scope="col" className="px-4 py-2 tracking-wide">Status</th>
              <th scope="col" className="px-4 py-2 tracking-wide">Start Date</th>
              <th scope="col" className="px-4 py-2 tracking-wide">End Date</th>
              <th scope="col" className="px-4 py-2 tracking-wide">Docs</th>
              <th scope="col" className="px-4 py-2 text-right tracking-wide"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedJobs.map((job, index) => (
              <tr key={`${job.id}-${index}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2">
                  <span className="font-medium text-slate-900 text-xs">{job.jobName}</span>
                </td>
                <td className="px-4 py-2">
                  <span className="font-medium text-slate-800 text-xs">{getClientName(job.clientId)}</span>
                </td>
                <td className="px-4 py-2">
                  <span className="font-medium text-slate-800 text-xs">{job.workOrderNumber}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    job.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    job.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {job.priority ? job.priority.charAt(0).toUpperCase() + job.priority.slice(1) : 'Medium'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status ? job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.replace('_', ' ').slice(1) : 'Scheduled'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className="font-medium text-slate-800 text-xs">{new Date(job.startDate).toLocaleDateString()}</span>
                </td>
                <td className="px-4 py-2">
                  <span className="font-medium text-slate-800 text-xs">{new Date(job.endDate).toLocaleDateString()}</span>
                </td>
                <td className="px-4 py-2">
                  <span className="font-medium text-slate-800 text-xs">{job.documents.length}</span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => onEdit(job)} className="text-xs font-medium text-brand-blue-600 hover:text-brand-blue-800 hover:underline transition-colors">
                      Edit
                    </button>
                    <button onClick={() => onDelete(job)} className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedJobs.length === 0 && (
                <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        <div className="text-lg font-medium">No call-out jobs found</div>
                        <div className="text-sm">Get started by adding your first call-out job</div>
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
    </div>
  );
};

export default CallOutJobs;
