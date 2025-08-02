import { useState } from 'react';
import { Client, SubAgreement, ServiceTicket, CallOutJob, DailyServiceLog, User } from '../types';

export type ModalType = 
  | 'addClient' 
  | 'editClient' 
  | 'addAgreement' 
  | 'editAgreement' 
  | 'addTicket' 
  | 'editTicket' 
  | 'viewTicket' 
  | 'addUser' 
  | 'editUser'
  | 'addJob' 
  | 'editJob' 
  | 'addSimpleLog' 
  | 'addFullLog' 
  | 'editLog' 
  | 'viewLog' 
  | 'addIssue' 
  | 'generateTicket' 
  | null;

/**
 * Custom hook for managing modal state
 */
export const useModalState = () => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingAgreement, setEditingAgreement] = useState<SubAgreement | null>(null);
  const [editingTicket, setEditingTicket] = useState<ServiceTicket | null>(null);
  const [viewingTicket, setViewingTicket] = useState<ServiceTicket | null>(null);
  const [editingJob, setEditingJob] = useState<CallOutJob | null>(null);
  const [editingLog, setEditingLog] = useState<DailyServiceLog | null>(null);
  const [viewingLog, setViewingLog] = useState<DailyServiceLog | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleOpenEditClientModal = (client: Client) => {
    setEditingClient(client);
    setModalType('editClient');
  };

  const handleOpenEditAgreementModal = (agreement: SubAgreement) => {
    setEditingAgreement(agreement);
    setModalType('editAgreement');
  };
  
  const handleOpenEditTicketModal = (ticket: ServiceTicket) => {
    setEditingTicket(ticket);
    setModalType('editTicket');
  };
  
  const handleOpenViewTicketModal = (ticket: ServiceTicket) => {
    setViewingTicket(ticket);
    setModalType('viewTicket');
  };

  const handleOpenEditJobModal = (job: CallOutJob) => {
    setEditingJob(job);
    setModalType('editJob');
  };

  const handleOpenSimpleLogModal = () => {
    setModalType('addSimpleLog');
  };

  const handleOpenFullLogModal = () => {
    setModalType('addFullLog');
  };

  const handleOpenEditLogModal = (log: DailyServiceLog) => {
    setEditingLog(log);
    setModalType('editLog');
  };

  const handleOpenViewLogModal = (log: DailyServiceLog) => {
    setViewingLog(log);
    setModalType('viewLog');
  };

  const handleOpenEditUserModal = (user: User) => {
    setEditingUser(user);
    setModalType('editUser');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setEditingClient(null);
    setEditingAgreement(null);
    setEditingTicket(null);
    setViewingTicket(null);
    setEditingJob(null);
    setEditingLog(null);
    setViewingLog(null);
    setEditingUser(null);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'addClient': return 'Add New Client';
      case 'editClient': return 'Edit Client';
      case 'addAgreement': return 'Add New Sub-Agreement';
      case 'editAgreement': return 'Edit Sub-Agreement';
      case 'addTicket': return 'Add New Service Ticket';
      case 'editTicket': return 'Edit Service Ticket';
      case 'viewTicket': return `Details for Ticket #${viewingTicket?.ticketNumber}`;
      case 'generateTicket': return 'Generate Service Ticket from Logs';
      case 'addUser': return 'Add New User';
      case 'addJob': return 'Add New Call-Out Job';
      case 'editJob': return 'Edit Call-Out Job';
      case 'addSimpleLog': return 'Add New Daily Service Log';
      case 'addFullLog': return 'Generate Daily Service Log';
      case 'editLog': return `Edit Daily Service Log #${editingLog?.logNumber}`;
      case 'viewLog': return `Details for Log #${viewingLog?.logNumber}`;
      case 'addIssue': return 'Report New Ticket Issue';
      case 'editUser': return `Edit User: ${editingUser?.name}`;
      default: return '';
    }
  };

  return {
    modalType,
    setModalType,
    editingClient,
    editingAgreement,
    editingTicket,
    viewingTicket,
    editingJob,
    editingLog,
    viewingLog,
    editingUser,
    handleOpenEditClientModal,
    handleOpenEditAgreementModal,
    handleOpenEditTicketModal,
    handleOpenViewTicketModal,
    handleOpenEditJobModal,
    handleOpenSimpleLogModal,
    handleOpenFullLogModal,
    handleOpenEditLogModal,
    handleOpenViewLogModal,
    handleOpenEditUserModal,
    handleCloseModal,
    getModalTitle,
  };
};
