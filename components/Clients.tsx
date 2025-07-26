
import React from 'react';
import { Client } from '../types';

interface ClientsProps {
  clients: Client[];
  onAdd: () => void;
  onEdit: (client: Client) => void;
}

const Clients: React.FC<ClientsProps> = ({ clients, onAdd, onEdit }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">All Clients ({clients.length})</h3>
        <button onClick={onAdd} className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">
          Add New Client
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Client Name</th>
              <th scope="col" className="px-6 py-3">Primary Contact</th>
              <th scope="col" className="px-6 py-3">Contact Email</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => {
              const primaryContact = client.contacts && client.contacts[0];
              return (
              <tr key={client.id} className="bg-white border-b hover:bg-slate-50">
                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap flex items-center gap-3">
                  <img src={client.logoUrl} alt={client.name} className="w-8 h-8 rounded-full" />
                  {client.name}
                </th>
                <td className="px-6 py-4">{primaryContact ? primaryContact.name : 'N/A'}</td>
                <td className="px-6 py-4">{primaryContact ? primaryContact.email : 'N/A'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onEdit(client)} className="font-medium text-brand-blue-600 hover:underline">Edit</button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;