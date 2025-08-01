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

  // Local data handlers (for dummy data not yet connected to API)
  const handleSaveTicket = (data: Partial<ServiceTicket> & { ticketNumber: string }) => {
    if (data.id) {
      const originalTicket = tickets.find(t => t.id === data.id);
      if (!originalTicket) {
        handleCloseModal();
        return;
      }

      const updatedTicket = { ...originalTicket, ...data } as ServiceTicket;
      setTickets(prevTickets => prevTickets.map(t => t.id === data.id ? updatedTicket : t));

      // Update agreement balances intelligently
      setAgreements(prev => {
        let newAgreements = [...prev];
        // 1. Revert old balance deduction if there was an old agreement
        if (originalTicket.subAgreementId) {
          newAgreements = newAgreements.map(agg => 
            agg.id === originalTicket.subAgreementId 
              ? { ...agg, balance: agg.balance + originalTicket.amount } 
              : agg
          );
        }
        // 2. Apply new balance deduction if there is a new agreement
        if (updatedTicket.subAgreementId) {
          newAgreements = newAgreements.map(agg =>
            agg.id === updatedTicket.subAgreementId
              ? { ...agg, balance: agg.balance - updatedTicket.amount }
              : agg
          );
        }
        return newAgreements;
      });
    } else {
      const newTicket: ServiceTicket = { 
        ...(data as Omit<ServiceTicket, 'id'>), 
        id: `st-${Date.now()}` 
      };
      setTickets(prev => [newTicket, ...prev]);
      
      if(newTicket.subAgreementId) {
        setAgreements(prev => prev.map(agg => 
          agg.id === newTicket.subAgreementId 
            ? {...agg, balance: agg.balance - newTicket.amount} 
            : agg
        ));
      }
    }
    handleCloseModal();
  };

  const handleSaveGeneratedTicket = (data: any) => {
    const newTicket: ServiceTicket = { 
      id: `st-${Date.now()}`,
      ticketNumber: data.ticketNumber,
      clientId: data.clientId,
      subAgreementId: data.subAgreementId,
      callOutJobId: data.callOutJobId,
      date: data.date,
      status: 'Delivered',
      amount: data.amount,
      relatedLogIds: data.relatedLogIds,
      documents: data.documents,
    };
    setTickets(prev => [newTicket, ...prev]);
    
    if(newTicket.subAgreementId) {
      setAgreements(prev => prev.map(agg => 
        agg.id === newTicket.subAgreementId 
          ? {...agg, balance: agg.balance - newTicket.amount} 
          : agg
      ));
    }
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
