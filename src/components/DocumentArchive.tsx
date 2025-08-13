
import React from 'react';
import { useDocumentArchiveStore, useUIStore } from '../stores';
import Pagination from './Pagination';

const DocumentArchive: React.FC = () => {
  const {
    // State
    clients,
    selectedDocuments,
    filters,
    pagination,
    isLoading,
    error,
    
    // Actions
    setSearchTerm,
    setClientFilter,
    setCategoryFilter,
    setCurrentPage,
    setItemsPerPage,
    selectDocument,
    deselectDocument,
    selectAllDocuments,
    deselectAllDocuments,
    deleteDocument,
    deleteMultipleDocuments,
    
    // Computed values
    getFilteredDocuments,
    getCategories,
    getTotalItems,
    getTotalPages,
    getPaginatedDocuments,
  } = useDocumentArchiveStore();

  const { addToast } = useUIStore();

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAllDocuments();
    } else {
      deselectAllDocuments();
    }
  };

  const handleSelectDocument = (id: string, checked: boolean) => {
    if (checked) {
      selectDocument(id);
    } else {
      deselectDocument(id);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.length > 0) {
      try {
        deleteMultipleDocuments(selectedDocuments);
        addToast({
          type: 'success',
          message: `${selectedDocuments.length} document(s) deleted successfully`,
        });
      } catch (error) {
        addToast({
          type: 'error',
          message: 'Failed to delete documents',
        });
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      deleteDocument(id);
      addToast({
        type: 'success',
        message: 'Document deleted successfully',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to delete document',
      });
    }
  };

  const handleDownloadDocument = async (_id: string) => {
    try {
      // TODO: Implement actual download logic
      addToast({
        type: 'success',
        message: 'Download started',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to download document',
      });
    }
  };

  const paginatedDocuments = getPaginatedDocuments();
  const categories = getCategories();
  const totalItems = getTotalItems();
  const totalPages = getTotalPages();

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

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
          value={filters.searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-xs"
          value={filters.clientFilter}
          onChange={e => setClientFilter(e.target.value)}
        >
          <option value="">All Clients</option>
          {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-xs"
          value={filters.categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category: string) => <option key={category} value={category}>{category}</option>)}
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
                  checked={selectedDocuments.length === getFilteredDocuments().length && getFilteredDocuments().length > 0}
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
            {paginatedDocuments.map((doc: any) => (
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
                <td className="px-4 py-2">{clients.find((c: any) => c.id === doc.clientId)?.name || 'N/A'}</td>
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
                    onClick={() => handleDownloadDocument(doc.id)} 
                    className="text-xs font-medium text-brand-blue-600 hover:underline"
                  >
                    Download
                  </button>
                  <button 
                    onClick={() => handleDeleteDocument(doc.id)} 
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
             {paginatedDocuments.length === 0 && (
                <tr>
                    <td colSpan={11} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="text-lg font-medium">No documents found</div>
                        <div className="text-sm">Try adjusting your search or filter criteria, or upload a new document</div>
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
          currentPage={pagination.currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
};

export default DocumentArchive;