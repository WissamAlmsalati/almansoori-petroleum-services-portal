import React from 'react';
import { SubAgreement, Client, ServiceTicket } from '../../../types';

interface Props {
  agreements: SubAgreement[];
  clients: Client[];
  tickets: ServiceTicket[];
  onAdd: () => void;
  onEdit: (agreement: SubAgreement) => void;
  onDelete?: (agreement: SubAgreement) => void;
}

const SubAgreements: React.FC<Props> = ({ agreements, clients, tickets, onAdd, onEdit, onDelete }) => {
  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Unknown';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Sub-Agreements ({agreements.length})</h3>
        <button onClick={onAdd} className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">Add New Sub-Agreement</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Balance</th>
              <th className="px-6 py-3">Start</th>
              <th className="px-6 py-3">End</th>
              <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {agreements.map(a => (
              <tr key={a.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{a.name}</td>
                <td className="px-6 py-4">{getClientName(a.clientId)}</td>
                <td className="px-6 py-4">${a.amount.toLocaleString()}</td>
                <td className="px-6 py-4">${a.balance.toLocaleString()}</td>
                <td className="px-6 py-4">{a.startDate || '—'}</td>
                <td className="px-6 py-4">{a.endDate || '—'}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => onEdit(a)} className="font-medium text-brand-blue-600 hover:underline">Edit</button>
                  {onDelete && <button onClick={() => onDelete(a)} className="font-medium text-red-600 hover:underline">Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubAgreements;


