
import React from 'react';
import { TicketIssue, ServiceTicket } from '../types';

interface TicketIssuesProps {
  issues: TicketIssue[];
  tickets: ServiceTicket[];
  onAdd: () => void;
}

const getStatusColor = (status: 'Open' | 'In Progress' | 'Resolved') => {
  switch (status) {
    case 'Open': return 'bg-red-100 text-red-800';
    case 'In Progress': return 'bg-yellow-100 text-yellow-800';
    case 'Resolved': return 'bg-green-100 text-green-800';
  }
};

const TicketIssues: React.FC<TicketIssuesProps> = ({ issues, tickets, onAdd }) => {
  const getTicketNumber = (ticketId: string) => tickets.find(t => t.id === ticketId)?.ticketNumber || 'N/A';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Ticket Issues ({issues.length})</h3>
        <button onClick={onAdd} className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">
          Report New Issue
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Ticket #</th>
              <th scope="col" className="px-6 py-3">Description</th>
              <th scope="col" className="px-6 py-3">Date Reported</th>
              <th scope="col" className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr key={issue.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{getTicketNumber(issue.ticketId)}</td>
                <td className="px-6 py-4 max-w-sm">
                    <p className="truncate">{issue.description}</p>
                    <p className="text-xs text-slate-400 truncate">Remarks: {issue.remarks}</p>
                </td>
                <td className="px-6 py-4">{new Date(issue.dateReported).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketIssues;
