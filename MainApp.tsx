import React, { useState } from 'react';

// Components
import Sidebar from './src/components/Sidebar';
import Header from './src/components/Header';
import Dashboard from './src/components/Dashboard';
import Clients from './src/components/Clients';
import SubAgreements from './src/components/SubAgreements';
import ServiceTickets from './src/components/ServiceTickets';
import UserManagement from './src/components/UserManagement';
import TicketIssues from './src/components/TicketIssues';
import DocumentArchive from './src/components/DocumentArchive';
import DailyServiceLogs from './src/components/DailyServiceLogs';
import CallOutJobs from './src/components/CallOutJobs';
import Modal from './src/components/Modal';
import { 
  AddClientForm, 
  AddSubAgreementForm, 
  AddServiceTicketForm, 
  AddUserForm, 
  AddCallOutJobForm, 
  AddFullDailyServiceLogForm, 
  AddSimpleDailyServiceLogForm, 
  AddTicketIssueForm, 
  GenerateServiceTicketForm 
} from './src/components/AddForms';

// Modal Detail Views
import { 
  ServiceTicketDetailsView, 
  DailyServiceLogDetailsView 
} from './src/components/ModalDetailViews';

// Types and Hooks
import { View, ServiceTicket, User, CallOutJob, DailyServiceLog, TicketIssue } from './src/types';
import { useAppData } from './src/hooks/useAppData';
import { useModalState, ModalType } from './src/hooks/useModalState';

// Utils
import { getDslExcelHtml, downloadExcel } from './src/utils/excelUtils';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Dashboard');
  
  // Use custom hooks for data and modal state management
  const {
    clients,
    agreements,
    users,
    tickets,
    jobs,
    logs,
    issues,
    combinedDocuments,
    loading,
    setUsers,
    setTickets,
    setJobs,
    setLogs,
    setIssues,
    setAgreements,
    handleSaveClient,
    handleDeleteClient,
    handleSaveAgreement,
    handleDeleteAgreement,
    handleSaveCallOutJob,
    handleDeleteCallOutJob,
    handleSaveDailyServiceLog,
    handleDeleteDailyServiceLog,
    handleGenerateExcel,
    handleSaveServiceTicket,
    handleDeleteServiceTicket,
    handleGenerateServiceTicket,
    openIssueCount,
    activeTicketCount,
  } = useAppData();

  const {
    modalType,
    setModalType,
    editingClient,
    editingAgreement,
    editingTicket,
    viewingTicket,
    editingJob,
    editingLog,
    viewingLog,
    handleOpenEditClientModal,
    handleOpenEditAgreementModal,
    handleOpenEditTicketModal,
    handleOpenViewTicketModal,
    handleOpenEditJobModal,
    handleOpenSimpleLogModal,
    handleOpenFullLogModal,
    handleOpenEditLogModal,
    handleOpenViewLogModal,
    handleCloseModal,
    getModalTitle,
  } = useModalState();

  // Service ticket handlers
  const handleSaveTicket = async (data: Partial<ServiceTicket> & { ticketNumber: string }) => {
    await handleSaveServiceTicket(data);
    handleCloseModal();
  };

  const handleSaveGeneratedTicket = async (data: any) => {
    await handleGenerateServiceTicket({
      clientId: data.clientId,
      logIds: data.relatedLogIds || [],
      subAgreementId: data.subAgreementId,
      callOutJobId: data.callOutJobId,
      date: data.date,
      status: data.status || 'In Field to Sign',
      amount: data.amount
    });
    handleCloseModal();
  };
  
  const handleSaveUser = (data: Omit<User, 'id' | 'avatarUrl'>) => {
    const newUser: User = { 
      ...data, 
      id: `user-${Date.now()}`, 
      avatarUrl: `https://picsum.photos/seed/user${Date.now()}/40/40`
    };
    setUsers(prev => [newUser, ...prev]);
    handleCloseModal();
  };

  const handleSaveJob = async (data: Partial<CallOutJob>) => {
    await handleSaveCallOutJob(data);
    handleCloseModal();
  };

  const handleDeleteJob = (job: CallOutJob) => {
    handleDeleteCallOutJob(job.id);
  };

  const handleSaveLog = async (data: Partial<DailyServiceLog>) => {
    await handleSaveDailyServiceLog(data);
    handleCloseModal();
  };

  const handleSaveIssue = (data: Omit<TicketIssue, 'id'>) => {
    const newIssue: TicketIssue = { ...data, id: `iss-${Date.now()}`};
    setIssues(prev => [newIssue, ...prev]);
    handleCloseModal();
  };

  const renderModalContent = () => {
    const allJobsAndAgreements = [...agreements, ...jobs];
    
    switch (modalType) {
      case 'addClient':
        return <AddClientForm onSave={handleSaveClient} onCancel={handleCloseModal} />;
      case 'editClient':
        return <AddClientForm onSave={handleSaveClient} onCancel={handleCloseModal} initialData={editingClient} />;
      case 'addAgreement':
        return <AddSubAgreementForm clients={clients} onSave={handleSaveAgreement} onCancel={handleCloseModal} />;
      case 'editAgreement':
        return <AddSubAgreementForm clients={clients} onSave={handleSaveAgreement} onCancel={handleCloseModal} initialData={editingAgreement} />;
      case 'addTicket':
        return <AddServiceTicketForm clients={clients} agreements={agreements} jobs={jobs} onSave={handleSaveTicket} onCancel={handleCloseModal} />;
      case 'editTicket':
        return <AddServiceTicketForm clients={clients} agreements={agreements} jobs={jobs} onSave={handleSaveTicket} onCancel={handleCloseModal} initialData={editingTicket}/>;
      case 'viewTicket':
        return viewingTicket && <ServiceTicketDetailsView ticket={viewingTicket} clients={clients} agreements={agreements} jobs={jobs} />;
      case 'generateTicket':
        const allUsedLogIds = new Set(tickets.flatMap(t => t.relatedLogIds));
        const availableLogs = logs.filter(log => 
          !allUsedLogIds.has(log.id) && 
          ((log.personnel && log.personnel.length > 0) || (log.equipmentUsed && log.equipmentUsed.length > 0))
        );
        return <GenerateServiceTicketForm 
          clients={clients} 
          agreements={agreements}
          jobs={jobs}
          availableLogs={availableLogs}
          onSave={handleSaveGeneratedTicket}
          onCancel={handleCloseModal}
        />;
      case 'addUser':
        return <AddUserForm onSave={handleSaveUser} onCancel={handleCloseModal} />;
      case 'addJob':
        return <AddCallOutJobForm clients={clients} onSave={handleSaveJob} onCancel={handleCloseModal} />;
      case 'editJob':
        return <AddCallOutJobForm clients={clients} onSave={handleSaveJob} onCancel={handleCloseModal} initialData={editingJob} />;
      case 'addSimpleLog':
        return <AddSimpleDailyServiceLogForm clients={clients} jobs={allJobsAndAgreements} onSave={handleSaveLog} onCancel={handleCloseModal} />;
      case 'addFullLog':
        return <AddFullDailyServiceLogForm clients={clients} jobs={allJobsAndAgreements} onSave={handleSaveLog} onCancel={handleCloseModal} isGenerating={true} initialData={null} />;
      case 'editLog':
        return <AddFullDailyServiceLogForm clients={clients} jobs={allJobsAndAgreements} onSave={handleSaveLog} onCancel={handleCloseModal} initialData={editingLog} isGenerating={true} />;
      case 'viewLog':
        return viewingLog && <DailyServiceLogDetailsView log={viewingLog} clients={clients} jobs={allJobsAndAgreements} />;
      case 'addIssue':
        return <AddTicketIssueForm tickets={tickets} onSave={handleSaveIssue} onCancel={handleCloseModal} />;
      default:
        return null;
    }
  };
  
  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard 
          clients={clients}
          tickets={tickets} 
          agreements={agreements} 
          openIssueCount={openIssueCount} 
          activeTicketCount={activeTicketCount}
          documentCount={combinedDocuments.length}
        />;
      case 'Clients':
        return <Clients 
          clients={clients} 
          onAdd={() => setModalType('addClient')} 
          onEdit={handleOpenEditClientModal} 
          onDelete={handleDeleteClient} 
          isLoading={loading} 
        />;
      case 'Sub-Agreements':
        return <SubAgreements 
          agreements={agreements} 
          clients={clients} 
          tickets={tickets} 
          onAdd={() => setModalType('addAgreement')} 
          onEdit={handleOpenEditAgreementModal} 
          onDelete={handleDeleteAgreement} 
          isLoading={loading} 
        />;
      case 'Service Tickets':
        return <ServiceTickets 
          tickets={tickets} 
          clients={clients} 
          onAdd={() => setModalType('addTicket')} 
          onGenerate={() => setModalType('generateTicket')} 
          onView={handleOpenViewTicketModal} 
          onEdit={handleOpenEditTicketModal} 
          onDelete={(ticket) => handleDeleteServiceTicket(ticket.id)}
        />;
      case 'User Management':
        return <UserManagement users={users} onAdd={() => setModalType('addUser')}/>;
      case 'Call-Out Jobs':
        return <CallOutJobs 
          jobs={jobs} 
          clients={clients} 
          onAdd={() => setModalType('addJob')} 
          onEdit={handleOpenEditJobModal} 
          onDelete={handleDeleteJob}
        />;
      case 'Daily Service Logs':
        return <DailyServiceLogs 
          logs={logs} 
          clients={clients} 
          jobs={[...agreements, ...jobs]} 
          onAdd={handleOpenSimpleLogModal} 
          onGenerate={handleGenerateExcel} 
          onEdit={handleOpenEditLogModal} 
          onView={handleOpenViewLogModal} 
        />;
      case 'Ticket Issues':
        return <TicketIssues issues={issues} tickets={tickets} onAdd={() => setModalType('addIssue')} />;
      case 'Document Archive':
        return <DocumentArchive documents={combinedDocuments} clients={clients} />;
      default:
        return <Dashboard 
          clients={clients}
          tickets={tickets} 
          agreements={agreements}
          openIssueCount={openIssueCount} 
          activeTicketCount={activeTicketCount}
          documentCount={combinedDocuments.length}
        />;
    }
  };
  
  const largeModals: (ModalType|null)[] = ['addClient', 'editClient', 'addFullLog', 'editLog', 'generateTicket'];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col ml-64">
        <Header activeView={activeView} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      <Modal 
        isOpen={modalType !== null} 
        onClose={handleCloseModal} 
        title={getModalTitle()} 
        size={largeModals.includes(modalType) ? 'xl' : 'md'}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default App;
