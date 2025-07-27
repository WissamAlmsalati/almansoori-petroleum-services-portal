import React from 'react';
import { ServiceTicket, DailyServiceLog, Client, SubAgreement, CallOutJob, PersonnelLogItem, EquipmentLogItem } from '../types';
import { getStatusColor } from './ServiceTickets';

/**
 * Reusable UI components for modal details
 */

interface DetailItemProps {
  label: string;
  children: React.ReactNode;
}

export const DetailItem: React.FC<DetailItemProps> = ({ label, children }) => (
  <>
    <dt className="col-span-1 font-semibold text-slate-500">{label}</dt>
    <dd className="col-span-2 text-slate-900">{children}</dd>
  </>
);

interface DocumentLinkProps {
  doc: File;
  name?: string;
}

export const DocumentLink: React.FC<DocumentLinkProps> = ({ doc, name }) => (
  <a
    href={URL.createObjectURL(doc)}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-brand-blue-600 hover:text-brand-blue-800 hover:underline group"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-brand-blue-700" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
    <span>{name || doc.name}</span>
  </a>
);

interface ServiceTicketDetailsViewProps {
  ticket: ServiceTicket;
  clients: Client[];
  agreements: SubAgreement[];
  jobs: CallOutJob[];
}

export const ServiceTicketDetailsView: React.FC<ServiceTicketDetailsViewProps> = ({ 
  ticket, 
  clients, 
  agreements, 
  jobs 
}) => {
  const client = clients.find(c => c.id === ticket.clientId);
  const agreement = agreements.find(a => a.id === ticket.subAgreementId);
  const job = jobs.find(j => j.id === ticket.callOutJobId);

  return (
    <div className="space-y-4 text-sm">
      <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
        <DetailItem label="Ticket #"><span className="font-medium">{ticket.ticketNumber}</span></DetailItem>
        <DetailItem label="Status">
          <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </DetailItem>
        <DetailItem label="Client">{client?.name || 'N/A'}</DetailItem>
        <DetailItem label="Date">{new Date(ticket.date).toLocaleDateString()}</DetailItem>
        <DetailItem label="Amount">${ticket.amount.toLocaleString()}</DetailItem>
        <DetailItem label="Linked To">{agreement?.name || job?.jobName || 'N/A'}</DetailItem>
        <DetailItem label="Related Logs">{ticket.relatedLogIds.join(', ') || 'None'}</DetailItem>

        <dt className="col-span-3 font-semibold text-slate-500 pt-2 border-t mt-2">Documents</dt>
        <dd className="col-span-3 text-slate-900">
          {ticket.documents.length > 0 ? (
            <ul className="list-inside space-y-1">
              {ticket.documents.map((doc, index) => <li key={index}><DocumentLink doc={doc}/></li>)}
            </ul>
          ) : (
            <span className="text-sm text-slate-500">None</span>
          )}
        </dd>
      </dl>
    </div>
  );
};

interface DailyServiceLogDetailsViewProps {
  log: DailyServiceLog;
  clients: Client[];
  jobs: (SubAgreement | CallOutJob)[];
}

export const DailyServiceLogDetailsView: React.FC<DailyServiceLogDetailsViewProps> = ({ 
  log, 
  clients, 
  jobs 
}) => {
  const client = clients.find(c => c.id === log.clientId);
  const linkedJob = log.linkedJobId ? jobs.find(j => j.id === log.linkedJobId) : null;
  const linkedJobName = linkedJob ? ('jobName' in linkedJob ? linkedJob.jobName : linkedJob.name) : null;

  const renderItems = (items: (PersonnelLogItem | EquipmentLogItem)[]) => (
    <ul className="list-disc list-inside space-y-1">
      {items.map(item => {
        const totalDays = item.dailyStatus.filter(s => s).length;
        return (
          <li key={item.id}>
            {item.name}{' '}
            {'position' in item && <span className="text-slate-500">({item.position})</span>}
            {'quantity' in item && <span className="text-slate-500">(Qty: {item.quantity})</span>}
            <span className="text-slate-500"> - {totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="space-y-4 text-sm">
      <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
        <DetailItem label="Log #"><span className="font-medium">{log.logNumber}</span></DetailItem>
        <DetailItem label="Client">{client?.name || 'N/A'}</DetailItem>
        <DetailItem label="Date">{new Date(log.date + 'T00:00:00').toLocaleDateString()}</DetailItem>
        <DetailItem label="Field">{log.field}</DetailItem>
        <DetailItem label="Well">{log.well}</DetailItem>
        <DetailItem label="Job / Agreement">{linkedJobName || log.jobNo || 'N/A'}</DetailItem>

        {log.personnel && log.personnel.length > 0 && (
          <>
            <dt className="col-span-3 font-semibold text-slate-500 pt-2 border-t mt-2">Personnel</dt>
            <dd className="col-span-3 text-slate-900">{renderItems(log.personnel)}</dd>
          </>
        )}

        {log.equipmentUsed && log.equipmentUsed.length > 0 && (
          <>
            <dt className="col-span-3 font-semibold text-slate-500 pt-2 border-t mt-2">Equipment Used</dt>
            <dd className="col-span-3 text-slate-900">{renderItems(log.equipmentUsed)}</dd>
          </>
        )}
        
        {(log.almansooriRep?.name || log.mogApproval1?.name || log.mogApproval2?.name) && (
          <>
            <dt className="col-span-3 font-semibold text-slate-500 pt-2 border-t mt-2">Approvers</dt>
            <dd className="col-span-3 text-slate-900 space-y-1">
              {log.almansooriRep?.name && <p><b>Almansoori:</b> {`${log.almansooriRep.name} (${log.almansooriRep.position})`}</p>}
              {log.mogApproval1?.name && <p><b>{client?.name || 'Client'} Appr. 1:</b> {`${log.mogApproval1.name} (${log.mogApproval1.position})`}</p>}
              {log.mogApproval2?.name && <p><b>{client?.name || 'Client'} Appr. 2:</b> {`${log.mogApproval2.name} (${log.mogApproval2.position})`}</p>}
            </dd>
          </>
        )}

        {(log.excelFile || log.pdfFile) && (
          <>
            <dt className="col-span-3 font-semibold text-slate-500 pt-2 border-t mt-2">Attached Files</dt>
            <dd className="col-span-3 text-slate-900 space-y-1">
              {log.excelFile && <DocumentLink doc={log.excelFile} name={log.excelFileName} />}
              {log.pdfFile && <DocumentLink doc={log.pdfFile} name={log.pdfFileName} />}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
};
