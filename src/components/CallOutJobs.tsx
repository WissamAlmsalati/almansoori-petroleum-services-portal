
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
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Job Name</th>
              <th scope="col" className="px-6 py-3">Client</th>
              <th scope="col" className="px-6 py-3">Work Order #</th>
              <th scope="col" className="px-6 py-3">Priority</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Start Date</th>
              <th scope="col" className="px-6 py-3">End Date</th>
              <th scope="col" className="px-6 py-3">Docs</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
                        {jobs.map((job, index) => (
              <tr key={`${job.id}-${index}`} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{job.jobName}</td>
                <td className="px-6 py-4">{getClientName(job.clientId)}</td>
                <td className="px-6 py-4">{job.workOrderNumber}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    job.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    job.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {job.priority ? job.priority.charAt(0).toUpperCase() + job.priority.slice(1) : 'Medium'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status ? job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.replace('_', ' ').slice(1) : 'Scheduled'}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(job.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{new Date(job.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{job.documents.length}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => onEdit(job)} className="font-medium text-brand-blue-600 hover:underline">Edit</button>
                    <button onClick={() => onDelete(job)} className="font-medium text-red-600 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
                <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-500">No call-out jobs found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallOutJobs;
