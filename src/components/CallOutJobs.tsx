
import React from 'react';
import { CallOutJob, Client } from '../types';

interface CallOutJobsProps {
  jobs: CallOutJob[];
  clients: Client[];
  onAdd: () => void;
  onEdit: (job: CallOutJob) => void;
  onDelete: (job: CallOutJob) => void;
}

const CallOutJobs: React.FC<CallOutJobsProps> = ({ jobs, clients, onAdd, onEdit, onDelete }) => {
  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'N/A';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">All Call-Out Jobs ({jobs.length})</h3>
        <button onClick={onAdd} className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">
          Add New Job
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-base text-left text-slate-600">
          <thead className="text-sm font-semibold text-slate-800 uppercase bg-slate-100 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-4 tracking-wide">Job Name</th>
              <th scope="col" className="px-6 py-4 tracking-wide">Client</th>
              <th scope="col" className="px-6 py-4 tracking-wide">Work Order #</th>
              <th scope="col" className="px-6 py-4 tracking-wide">Priority</th>
              <th scope="col" className="px-6 py-4 tracking-wide">Status</th>
              <th scope="col" className="px-6 py-4 tracking-wide">Start Date</th>
              <th scope="col" className="px-6 py-4 tracking-wide">End Date</th>
              <th scope="col" className="px-6 py-4 tracking-wide">Docs</th>
              <th scope="col" className="px-6 py-4 text-right tracking-wide"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {jobs.map((job, index) => (
              <tr key={`${job.id}-${index}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-900 text-base">{job.jobName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-800 text-base">{getClientName(job.clientId)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-800 text-base">{job.workOrderNumber}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${
                    job.priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' :
                    job.priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                    job.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    'bg-green-100 text-green-800 border-green-200'
                  }`}>
                    {job.priority ? job.priority.charAt(0).toUpperCase() + job.priority.slice(1) : 'Medium'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    job.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {job.status ? job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.replace('_', ' ').slice(1) : 'Scheduled'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-800 text-base">{new Date(job.startDate).toLocaleDateString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-800 text-base">{new Date(job.endDate).toLocaleDateString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-800 text-base">{job.documents.length}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-3">
                    <button onClick={() => onEdit(job)} className="text-sm font-semibold text-brand-blue-600 hover:text-brand-blue-800 hover:underline transition-colors">
                      Edit
                    </button>
                    <button onClick={() => onDelete(job)} className="text-sm font-semibold text-red-600 hover:text-red-800 hover:underline transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
                <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500 text-base">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        <span className="font-medium">No call-out jobs found.</span>
                      </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallOutJobs;
