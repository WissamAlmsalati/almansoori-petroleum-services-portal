
import React, { useState, useMemo } from 'react';
import { Client, DocumentArchive } from '../types';
import Pagination from './Pagination';

interface DocumentArchiveProps {
  documents: DocumentArchive[];
  clients: Client[];
  onUploadDocument: (data: {
    file: File;
    title: string;
    description?: string;
    category: string;
    tags?: string[];
    clientId: string;
    isPublic?: boolean;
    expiryDate?: string;
  }) => Promise<void>;
  onBulkUploadDocuments: (data: {
    files: File[];
    category: string;
    tags: string[];
    clientId: string;
    isPublic?: boolean;
  }) => Promise<void>;
  onUpdateDocument: (id: string, data: {
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
    clientId?: string;
    isPublic?: boolean;
    expiryDate?: string;
    file?: File;
  }) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  onBulkDeleteDocuments: (ids: string[]) => Promise<void>;
  onDownloadDocument: (id: string) => Promise<void>;
}

const DocumentArchive: React.FC<DocumentArchiveProps> = ({ 
  documents, 
  clients,
  onUploadDocument,
  onBulkUploadDocuments,
  onUpdateDocument,
  onDeleteDocument,
  onBulkDeleteDocuments,
  onDownloadDocument
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      return (
        (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (clientFilter === '' || doc.clientId === clientFilter) &&
        (categoryFilter === '' || doc.category === categoryFilter)
      );
    });
  }, [documents, searchTerm, clientFilter, categoryFilter]);

  const categories = useMemo(() => [...new Set(documents.map(d => d.category))].sort(), [documents]);

  // Pagination logic
  const totalItems = filteredDocuments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, clientFilter, categoryFilter]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleSelectDocument = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, id]);
    } else {
      setSelectedDocuments(prev => prev.filter(docId => docId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.length > 0) {
      await onBulkDeleteDocuments(selectedDocuments);
      setSelectedDocuments([]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Document Archive</h3>
        <div className="flex space-x-2">
          {selectedDocuments.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800"
            >
              Delete Selected ({selectedDocuments.length})
            </button>
          )}
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <input
          type="text"
          placeholder="Search documents..."
          className="col-span-1 md:col-span-2 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-xs"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-xs"
          value={clientFilter}
          onChange={e => setClientFilter(e.target.value)}
        >
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-xs"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => <option key={category} value={category}>{category}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-brand-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-blue-500"
                />
              </th>
              <th scope="col" className="px-4 py-2">Title</th>
              <th scope="col" className="px-4 py-2">Client</th>
              <th scope="col" className="px-4 py-2">Category</th>
              <th scope="col" className="px-4 py-2">File Name</th>
              <th scope="col" className="px-4 py-2">Size</th>
              <th scope="col" className="px-4 py-2">Type</th>
              <th scope="col" className="px-4 py-2">Public</th>
              <th scope="col" className="px-4 py-2">Downloads</th>
              <th scope="col" className="px-4 py-2">Created</th>
              <th scope="col" className="px-4 py-2"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {paginatedDocuments.map(doc => (
              <tr key={doc.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc.id)}
                    onChange={(e) => handleSelectDocument(doc.id, e.target.checked)}
                    className="w-4 h-4 text-brand-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-blue-500"
                  />
                </td>
                <td className="px-4 py-2 font-medium text-slate-900">{doc.title}</td>
                <td className="px-4 py-2">{clients.find(c => c.id === doc.clientId)?.name || 'N/A'}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {doc.category}
                  </span>
                </td>
                <td className="px-4 py-2">{doc.fileName}</td>
                <td className="px-4 py-2">{formatBytes(doc.fileSize)}</td>
                <td className="px-4 py-2">{doc.fileType}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    doc.isPublic 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.isPublic ? 'Public' : 'Private'}
                  </span>
                </td>
                <td className="px-4 py-2">{doc.downloadCount}</td>
                <td className="px-4 py-2">
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button 
                    onClick={() => onDownloadDocument(doc.id)} 
                    className="text-xs font-medium text-brand-blue-600 hover:underline"
                  >
                    Download
                  </button>
                  <button 
                    onClick={() => onDeleteDocument(doc.id)} 
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
             {paginatedDocuments.length === 0 && (
                <tr>
                    <td colSpan={11} className="text-center py-10 text-slate-500">No documents found matching your criteria.</td>
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

export default DocumentArchive;