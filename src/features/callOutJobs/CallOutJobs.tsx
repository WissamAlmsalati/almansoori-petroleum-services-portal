import React from 'react';
import { CallOutJob, Client } from '../../../types';

interface Props {
  jobs: CallOutJob[];
  clients: Client[];
  onAdd: () => void;
  onEdit: (job: CallOutJob) => void;
  onDelete?: (job: CallOutJob) => void;
}

const CallOutJobs: React.FC<Props> = ({ jobs, clients, onAdd, onEdit, onDelete }) => {
  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Unknown';
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Call-Out Jobs ({jobs.length})</h3>
        <button onClick={onAdd} className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">Add New Job</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Job Name</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Work Order</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Start</th>
              <th className="px-6 py-3">End</th>
              <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{j.jobName}</td>
                <td className="px-6 py-4">{getClientName(j.clientId)}</td>
                <td className="px-6 py-4">{j.workOrderNumber}</td>
                <td className="px-6 py-4 capitalize">{(j as any).priority || 'normal'}</td>
                <td className="px-6 py-4 capitalize">{(j as any).status || 'scheduled'}</td>
                <td className="px-6 py-4">{j.startDate}</td>
                <td className="px-6 py-4">{j.endDate}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => onEdit(j)} className="font-medium text-brand-blue-600 hover:underline">Edit</button>
                  {onDelete && <button onClick={() => onDelete(j)} className="font-medium text-red-600 hover:underline">Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallOutJobs;


