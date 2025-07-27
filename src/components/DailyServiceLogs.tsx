
import React, { useState, useMemo } from 'react';
import { DailyServiceLog, Client, SubAgreement, CallOutJob } from '../types';

interface DailyServiceLogsProps {
  logs: DailyServiceLog[];
  clients: Client[];
  jobs: (SubAgreement | CallOutJob)[];
  onAdd: () => void;
  onGenerate: () => void;
  onEdit: (log: DailyServiceLog) => void;
  onView: (log: DailyServiceLog) => void;
}

const DailyServiceLogs: React.FC<DailyServiceLogsProps> = ({ logs, clients, jobs, onAdd, onGenerate, onEdit, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('');

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
      const logDate = new Date(log.date).toISOString().split('T')[0];

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

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">All Daily Service Logs ({logs.length})</h3>
        <div className="flex items-center gap-2">
            <button onClick={onAdd} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors">
                Add New Log
            </button>
            <button onClick={onGenerate} className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">
                Generate DSL
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
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Log #</th>
              <th scope="col" className="px-6 py-3">Client</th>
              <th scope="col" className="px-6 py-3">Job / Agreement</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Personnel</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => {
              const linkedJobName = getJobName(log.linkedJobId);
              return (
              <tr key={log.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{log.logNumber}</td>
                <td className="px-6 py-4">{getClientName(log.clientId)}</td>
                <td className="px-6 py-4 truncate max-w-xs" title={linkedJobName || log.jobNo}>{linkedJobName || log.jobNo || 'N/A'}</td>
                <td className="px-6 py-4">{new Date(log.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 truncate max-w-xs">{formatPersonnel(log.personnel)}</td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button onClick={() => onView(log)} className="font-medium text-brand-blue-600 hover:underline">View</button>
                  <button onClick={() => onEdit(log)} className="font-medium text-brand-blue-600 hover:underline">Edit</button>
                </td>
              </tr>
            )})}
             {filteredLogs.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">No service logs found matching your criteria.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyServiceLogs;
