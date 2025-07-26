
import React, { useState, useMemo } from 'react';
import { Client, CombinedDocument } from '../types';

interface DocumentArchiveProps {
  documents: CombinedDocument[];
  clients: Client[];
}

const DocumentArchive: React.FC<DocumentArchiveProps> = ({ documents, clients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      return (
        (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.sourceName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (clientFilter === '' || doc.clientId === clientFilter) &&
        (typeFilter === '' || doc.type === typeFilter)
      );
    });
  }, [documents, searchTerm, clientFilter, typeFilter]);

  const docTypes = useMemo(() => [...new Set(documents.map(d => d.type))].sort(), [documents]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Document Archive</h3>
      
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <input
          type="text"
          placeholder="Search by filename or source..."
          className="col-span-1 md:col-span-2 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
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
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">All Document Types</option>
          {docTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Document Name</th>
              <th scope="col" className="px-6 py-3">Client</th>
              <th scope="col" className="px-6 py-3">Source</th>
              <th scope="col" className="px-6 py-3">Type</th>
              <th scope="col" className="px-6 py-3">Size</th>
              <th scope="col" className="px-6 py-3">Upload Date</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map(doc => (
              <tr key={doc.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{doc.name}</td>
                <td className="px-6 py-4">{clients.find(c => c.id === doc.clientId)?.name || 'N/A'}</td>
                <td className="px-6 py-4">{doc.sourceName}</td>
                <td className="px-6 py-4">{doc.type}</td>
                <td className="px-6 py-4">{formatBytes(doc.size)}</td>
                <td className="px-6 py-4">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDownload(doc.file)} className="font-medium text-brand-blue-600 hover:underline">Download</button>
                </td>
              </tr>
            ))}
             {filteredDocuments.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">No documents found matching your criteria.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentArchive;