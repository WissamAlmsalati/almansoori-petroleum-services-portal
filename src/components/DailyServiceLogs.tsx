
import React, { useState, useMemo } from 'react';
import { DailyServiceLog, Client, SubAgreement, CallOutJob } from '../types';
import dailyServiceLogService from '../services/dailyServiceLogService';
import Pagination from './Pagination';

interface DailyServiceLogsProps {
  logs: DailyServiceLog[];
  clients: Client[];
  jobs: (SubAgreement | CallOutJob)[];
  onAdd: () => void;
  onGenerate: (logId: string) => void;
  onEdit: (log: DailyServiceLog) => void;
  onView: (log: DailyServiceLog) => void;
}

const DailyServiceLogs: React.FC<DailyServiceLogsProps> = ({ logs, clients, jobs, onAdd, onGenerate, onEdit, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'N/A';
  
  const getJobName = (jobId?: string) => {
    if (!jobId) return null;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return null;
    return 'jobName' in job ? job.jobName : job.name;
  };

  const formatPersonnel = (items?: { name: string }[]) => {
    if (!items || items.length === 0) return 'N/A';
    return items.map(item => item.name).join(', ');
  }

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Safely parse the date
      let logDate = '';
      try {
        if (log.date) {
          const date = new Date(log.date);
          if (!isNaN(date.getTime())) {
            logDate = date.toISOString().split('T')[0];
          }
        }
      } catch (error) {
        console.warn('Invalid date format:', log.date);
      }

      const searchTermMatch = log.logNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const clientMatch = clientFilter === '' || log.clientId === clientFilter;
      const jobMatch = jobFilter === '' || log.linkedJobId === jobFilter;
      const dateMatch = dateFilter === '' || logDate === dateFilter;
      
      const isDetailed = (log.personnel && log.personnel.length > 0) || (log.equipmentUsed && log.equipmentUsed.length > 0);
      const logTypeMatch = logTypeFilter === '' ||
        (logTypeFilter === 'detailed' && isDetailed) ||
        (logTypeFilter === 'simple' && !isDetailed);

      return searchTermMatch && clientMatch && jobMatch && dateMatch && logTypeMatch;
    });
  }, [logs, searchTerm, clientFilter, jobFilter, dateFilter, logTypeFilter]);
  
  const jobsForFilter = useMemo(() => {
    return jobs.sort((a,b) => ('jobName' in a ? a.jobName : a.name).localeCompare('jobName' in b ? b.jobName : b.name));
  }, [jobs]);

  // Pagination logic
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, clientFilter, jobFilter, dateFilter, logTypeFilter]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">All Daily Service Logs ({logs.length})</h3>
        <div className="flex items-center gap-2">
            <button onClick={onAdd} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors">
                Add New Log
            </button>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <input
          type="text"
          placeholder="Search by Log #"
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
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
          value={jobFilter}
          onChange={e => setJobFilter(e.target.value)}
        >
          <option value="">All Jobs/Agreements</option>
          {jobsForFilter.map(j => <option key={j.id} value={j.id}>{'jobName' in j ? j.jobName : j.name}</option>)}
        </select>
        <select
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
          value={logTypeFilter}
          onChange={e => setLogTypeFilter(e.target.value)}
        >
          <option value="">All Log Types</option>
          <option value="detailed">Detailed (Generated)</option>
          <option value="simple">Simple (Uploaded)</option>
        </select>
        <input
          type="date"
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm text-slate-500"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="text-xs font-medium text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-2 tracking-wide">Log #</th>
              <th scope="col" className="px-4 py-2 tracking-wide">Client</th>
              <th scope="col" className="px-4 py-2 tracking-wide">Job / Agreement</th>
              <th scope="col" className="px-4 py-2 tracking-wide">Date</th>
              <th scope="col" className="px-4 py-2 tracking-wide">Personnel</th>
              <th scope="col" className="px-4 py-2 text-right tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedLogs.map((log, index) => {
              const linkedJobName = getJobName(log.linkedJobId);
              return (
              <tr key={`${log.id}-${index}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-900 text-xs">{log.logNumber}</span>
                    {log.excelFileName && log.excelFileName.trim() !== '' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Excel
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="font-medium text-slate-800 text-xs">{getClientName(log.clientId)}</span>
                </td>
                <td className="px-4 py-2 max-w-xs">
                  <span className="font-medium text-slate-800 text-xs truncate block" title={linkedJobName || log.jobNo}>
                    {linkedJobName || log.jobNo || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className="font-medium text-slate-800 text-xs">
                    {(() => {
                      try {
                        if (log.date) {
                          const date = new Date(log.date);
                          if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString();
                          }
                        }
                        return 'Invalid Date';
                      } catch (error) {
                        return 'Invalid Date';
                      }
                    })()}
                  </span>
                </td>
                <td className="px-4 py-2 max-w-xs">
                  <span className="text-slate-700 text-xs truncate block" title={formatPersonnel(log.personnel)}>
                    {formatPersonnel(log.personnel)}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => onView(log)} className="text-xs font-medium text-brand-blue-600 hover:text-brand-blue-800 hover:underline transition-colors">
                      View
                    </button>
                    <button onClick={() => onEdit(log)} className="text-xs font-medium text-brand-blue-600 hover:text-brand-blue-800 hover:underline transition-colors">
                      Edit
                    </button>
                    {log.excelFileName && log.excelFileName.trim() !== '' ? (
                      <button 
                        onClick={() => {
                          // Use the public download URL format
                          const publicDownloadUrl = `http://127.0.0.1:8001/download/${log.excelFileName}`;
                          window.open(publicDownloadUrl, '_blank');
                        }} 
                        className="text-xs font-medium text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                      >
                        Download
                      </button>
                    ) : (
                      <button onClick={() => onGenerate(log.id)} className="text-xs font-medium text-green-600 hover:text-green-800 hover:underline transition-colors">
                        Generate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )})}
             {paginatedLogs.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="text-lg font-medium">No service logs found</div>
                        <div className="text-sm">Try adjusting your search or filter criteria, or add a new log</div>
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

export default DailyServiceLogs;
