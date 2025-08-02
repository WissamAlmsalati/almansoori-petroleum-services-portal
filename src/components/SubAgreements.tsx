import React, { useState, useMemo } from 'react';
import { SubAgreement, Client, ServiceTicket } from '../types';
import Pagination from './Pagination';

interface SubAgreementsProps {
  agreements: SubAgreement[];
  clients: Client[];
  tickets: ServiceTicket[];
  onAdd: () => void;
  onEdit: (agreement: SubAgreement) => void;
  onDelete?: (agreementId: string) => void;
  isLoading?: boolean;
}

const SubAgreements: React.FC<SubAgreementsProps> = ({ agreements, clients, tickets, onAdd, onEdit, onDelete, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  
  const isNearExpiry = (dateStr: string) => {
    const expiryDate = new Date(dateStr);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return expiryDate < thirtyDaysFromNow && expiryDate >= today;
  };

  const isLowBalance = (balance: number, amount: number) => amount > 0 && (balance / amount) < 0.1;

  const filteredAgreements = useMemo(() => {
    return agreements.filter(agreement => {
      const nameMatch = agreement.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const nearExpiry = isNearExpiry(agreement.endDate);
      const lowBalance = isLowBalance(agreement.balance, agreement.amount);
      const isActive = !nearExpiry && !lowBalance;

      let statusMatch = true;
      if (statusFilter === 'nearExpiry') statusMatch = nearExpiry;
      else if (statusFilter === 'lowBalance') statusMatch = lowBalance;
      else if (statusFilter === 'active') statusMatch = isActive;
      
      return nameMatch && statusMatch;
    });
  }, [agreements, searchTerm, statusFilter]);

  // Pagination logic
  const totalItems = filteredAgreements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgreements = filteredAgreements.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">All Sub-Agreements ({agreements.length})</h3>
        <button 
          onClick={onAdd} 
          disabled={isLoading}
          className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Add New Agreement'}
        </button>
      </div>

      {/* Filter and Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <input
          type="text"
          placeholder="Search by agreement name..."
          className="col-span-1 md:col-span-2 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="nearExpiry">Near Expiry</option>
          <option value="lowBalance">Low Balance</option>
        </select>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Agreement Name</th>
              <th scope="col" className="px-6 py-3">Client</th>
              <th scope="col" className="px-6 py-3">Amount</th>
              <th scope="col" className="px-6 py-3">Balance</th>
              <th scope="col" className="px-6 py-3">Tickets Issued</th>
              <th scope="col" className="px-6 py-3">Start Date</th>
              <th scope="col" className="px-6 py-3">End Date</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {paginatedAgreements.map(agreement => {
               const nearExpiry = isNearExpiry(agreement.endDate);
               const lowBalance = isLowBalance(agreement.balance, agreement.amount);
               const ticketCount = tickets.filter(t => t.subAgreementId === agreement.id).length;
              return (
              <tr key={agreement.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{agreement.name}</td>
                <td className="px-6 py-4">{getClientName(agreement.clientId)}</td>
                <td className="px-6 py-4">${agreement.amount.toLocaleString()}</td>
                <td className="px-6 py-4">${agreement.balance.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">{ticketCount}</td>
                <td className="px-6 py-4">{new Date(agreement.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{new Date(agreement.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {nearExpiry && <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-yellow-100 text-yellow-800">Near Expiry</span>}
                  {lowBalance && <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-red-100 text-red-800">Low Balance</span>}
                  {!nearExpiry && !lowBalance && <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-green-100 text-green-800">Active</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => onEdit(agreement)} 
                      className="font-medium text-brand-blue-600 hover:underline"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(agreement.id)} 
                        className="font-medium text-red-600 hover:underline"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )})}
            {paginatedAgreements.length === 0 && (
                <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="text-lg font-medium">No agreements found</div>
                        <div className="text-sm">Try adjusting your search or filter criteria, or add a new agreement</div>
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

export default SubAgreements;