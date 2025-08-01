
import React, { useState, useMemo } from 'react';
import { ServiceTicket, Client, TicketStatus } from '../types';

interface ServiceTicketsProps {
  tickets: ServiceTicket[];
  clients: Client[];
  onAdd: () => void;
  onGenerate: () => void;
  onView: (ticket: ServiceTicket) => void;
  onEdit: (ticket: ServiceTicket) => void;
  onDelete: (ticket: ServiceTicket) => void;
}

export const getStatusColor = (status: TicketStatus) => {
  switch (status) {
    case 'Delivered':
      return 'bg-blue-100 text-blue-800';
    case 'Invoiced':
      return 'bg-green-100 text-green-800';
    case 'Issue':
      return 'bg-red-100 text-red-800';
    case 'In Field to Sign':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const ServiceTickets: React.FC<ServiceTicketsProps> = ({ tickets, clients, onAdd, onGenerate, onView, onEdit, onDelete }) => {
  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Unknown Client';

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [docsFilter, setDocsFilter] = useState('');
  const [ticketTypeFilter, setTicketTypeFilter] = useState(''); // manual vs generated

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.date).toISOString().split('T')[0];

      const searchTermMatch = ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const clientMatch = clientFilter === '' || ticket.clientId === clientFilter;
      const statusMatch = statusFilter === '' || ticket.status === statusFilter;
      const dateMatch = dateFilter === '' || ticketDate === dateFilter;
      const docsMatch = docsFilter === '' ||
        (docsFilter === 'with_docs' && ticket.documents.length > 0) ||
        (docsFilter === 'no_docs' && ticket.documents.length === 0);
      
      const ticketTypeMatch = ticketTypeFilter === '' ||
        (ticketTypeFilter === 'generated' && ticket.relatedLogIds.length > 0) ||
        (ticketTypeFilter === 'manual' && ticket.relatedLogIds.length === 0);

      return searchTermMatch && clientMatch && statusMatch && dateMatch && docsMatch && ticketTypeMatch;
    });
  }, [tickets, searchTerm, clientFilter, statusFilter, dateFilter, docsFilter, ticketTypeFilter]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">All Service Tickets ({tickets.length})</h3>
        <div className="flex items-center gap-2">
             <button onClick={onAdd} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors">
                Add New Ticket
            </button>
            <button onClick={onGenerate} className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">
                Generate Service Ticket
            </button>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <input
          type="text"
          placeholder="Search by Ticket #"
          className="lg:col-span-2 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
          value={clientFilter}
          onChange={e => setClientFilter(e.target.value)}
        >
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {(['In Field to Sign', 'Issue', 'Delivered', 'Invoiced'] as TicketStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
         <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
          value={docsFilter}
          onChange={e => setDocsFilter(e.target.value)}
        >
          <option value="">All Documents</option>
          <option value="with_docs">With Docs</option>
          <option value="no_docs">No Docs</option>
        </select>
         <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
          value={ticketTypeFilter}
          onChange={e => setTicketTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="manual">Manual</option>
          <option value="generated">Generated (from DSL)</option>
        </select>
        <input
          type="date"
          className="lg:col-start-6 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm text-slate-500"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Ticket #</th>
              <th scope="col" className="px-6 py-3">Client</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Amount</th>
              <th scope="col" className="px-6 py-3">Documents</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{ticket.ticketNumber}</td>
                <td className="px-6 py-4">{getClientName(ticket.clientId)}</td>
                <td className="px-6 py-4">{new Date(ticket.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">${ticket.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">{ticket.documents.length}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button onClick={() => onView(ticket)} className="font-medium text-brand-blue-600 hover:underline">View</button>
                  <button onClick={() => onEdit(ticket)} className="font-medium text-brand-blue-600 hover:underline">Edit</button>
                  <button onClick={() => onDelete(ticket)} className="font-medium text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">No tickets found matching your criteria.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceTickets;