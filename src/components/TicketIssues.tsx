
import React, { useState, useMemo } from 'react';
import { TicketIssue, ServiceTicket } from '../types';
import Pagination from './Pagination';

interface TicketIssuesProps {
  issues: TicketIssue[];
  tickets: ServiceTicket[];
  onAdd: () => void;
  onDelete: (issue: TicketIssue) => void;
}

const getStatusColor = (status: 'Open' | 'In Progress' | 'Resolved' | 'Closed') => {
  switch (status) {
    case 'Open': return 'bg-red-100 text-red-800';
    case 'In Progress': return 'bg-yellow-100 text-yellow-800';
    case 'Resolved': return 'bg-green-100 text-green-800';
    case 'Closed': return 'bg-gray-100 text-gray-800';
  }
};

const TicketIssues: React.FC<TicketIssuesProps> = ({ issues, tickets, onAdd, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const getTicketNumber = (ticketId: string) => tickets.find(t => t.id === ticketId)?.ticketNumber || 'N/A';

  // Pagination logic
  const totalItems = issues.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIssues = issues.slice(startIndex, endIndex);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Ticket Issues ({issues.length})</h3>
        <button onClick={onAdd} className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">
          Report New Issue
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="text-xs font-medium text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-2">Ticket #</th>
              <th scope="col" className="px-4 py-2">Description</th>
              <th scope="col" className="px-4 py-2">Date Reported</th>
              <th scope="col" className="px-4 py-2">Status</th>
              <th scope="col" className="px-4 py-2"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {paginatedIssues.map((issue, index) => (
              <tr key={`${issue.id}-${index}`} className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-900 text-xs">{getTicketNumber(issue.ticketId)}</td>
                <td className="px-4 py-2 max-w-sm">
                    <p className="truncate text-xs">{issue.description}</p>
                    <p className="text-xs text-slate-400 truncate">Remarks: {issue.remarks}</p>
                </td>
                <td className="px-4 py-2 text-xs">{new Date(issue.dateReported).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex space-x-2 justify-end">
                    <button 
                      onClick={() => onDelete(issue)}
                      className="text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedIssues.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div className="text-lg font-medium">No ticket issues found</div>
                        <div className="text-sm">Great! All tickets are running smoothly</div>
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

export default TicketIssues;
