import React, { useState, useMemo } from 'react';
import { UserRole, MaterialRequest, Urgency, Category, PRItemStatus, POStatus, FollowUp, PurchaseRequest, PurchaseOrder, RequestStatus } from '../types';
import { MOCK_REQUESTS, URGENCY_LEVELS, CATEGORIES, PR_ITEM_STATUSES, PO_STATUSES, REQUEST_STATUSES } from '../constants';
import { PlusIcon, SearchIcon, DownloadIcon } from './icons';
import RequestCard from './RequestCard';
import RequestDetailModal from './RequestDetailModal';
import ConversationalFlow from './ConversationalFlow';

declare const XLSX: any;

interface DashboardProps {
  userRole: UserRole;
  requests: MaterialRequest[];
  addRequest: (request: Omit<MaterialRequest, 'id' | 'submissionDate' | 'status' | 'purchaseRequests' | 'purchaseOrders' | 'followUps'>) => void;
  updateRequest: (request: MaterialRequest) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, requests, addRequest, updateRequest }) => {
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  
  // Consolidate state related to the active conversational flow
  const [flowContext, setFlowContext] = useState<{
    request?: MaterialRequest;
    poId?: string;
    prId?: string;
    itemId?: string;
    tempState?: Record<string, any>;
  }>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const lowerSearch = searchTerm.toLowerCase();
      const textMatch = searchTerm === '' ||
        req.id.toLowerCase().includes(lowerSearch) ||
        req.itemDescription.toLowerCase().includes(lowerSearch) ||
        (req.purchaseRequests.some(pr => pr.prNumber.toLowerCase().includes(lowerSearch))) ||
        (req.purchaseOrders.some(po => po.poNumber.toLowerCase().includes(lowerSearch)));

      const statusMatch = statusFilter === 'All' || req.status === statusFilter;
      const urgencyMatch = urgencyFilter === 'All' || req.urgency === urgencyFilter;
      
      const submissionDate = new Date(req.submissionDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start) start.setUTCHours(0, 0, 0, 0);
      if (end) end.setUTCHours(23, 59, 59, 999);
      const dateMatch = (!start || submissionDate >= start) && (!end || submissionDate <= end);

      return textMatch && statusMatch && urgencyMatch && dateMatch;
    }).sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [requests, searchTerm, statusFilter, urgencyFilter, startDate, endDate]);

  const clearFlowContext = () => {
    setActiveFlow(null);
    setFlowContext({});
  };
  
  const handleViewDetails = (request: MaterialRequest) => setSelectedRequest(request);
  const handleStartRequest = () => setActiveFlow('newRequest');
  
  const handleProcessRequest = (request: MaterialRequest) => {
    setSelectedRequest(null);
    setFlowContext({ request });
    if (userRole === UserRole.COORDINATOR) setActiveFlow('classifyRequest');
    if (userRole === UserRole.SUPPLY_CHAIN) setActiveFlow('processPO');
  };

  const handleAddFollowUp = (request: MaterialRequest) => {
    setSelectedRequest(null);
    setFlowContext({ request });
    setActiveFlow('addFollowUp');
  };

  const handleUpdatePOStatus = (request: MaterialRequest, poId: string) => {
    setSelectedRequest(null);
    setFlowContext({ request, poId });
    setActiveFlow('updatePOStatus');
  };

  const handleUpdatePRItemStatus = (request: MaterialRequest, prId: string, itemId: string) => {
    setSelectedRequest(null);
    setFlowContext({ request, prId, itemId });
    setActiveFlow('updatePRItemStatus');
  };

  // --- Flow Completion Handlers ---
  const handleNewRequestComplete = (data: Record<string, any>) => {
    addRequest({
      requesterRole: userRole,
      itemDescription: data.itemDescription,
      materialCode: data.materialCode,
      quantity: parseInt(data.quantity, 10),
      urgency: data.urgency,
      photo: data.photo,
    });
  };

  const handleClassifyRequestComplete = (data: Record<string, any>) => {
    if (flowContext.request) {
      const updatedReq: MaterialRequest = {
        ...flowContext.request,
        category: data.category,
        prHandler: data.prHandler,
        coordinatorNotes: data.coordinatorNotes,
        status: RequestStatus.CLASSIFIED,
      };
      updateRequest(updatedReq);
    }
  };

  const handleProcessPOComplete = (data: Record<string, any>) => {
    if (flowContext.request) {
      const newPR: PurchaseRequest = { id: `PR-${Date.now()}`, prNumber: data.prNumber, items: [{ id: `item-${Date.now()}`, description: flowContext.request.itemDescription, status: data.prItemStatus }] };
      const newPO: PurchaseOrder = { id: `PO-${Date.now()}`, prId: newPR.id, poNumber: data.poNumber, supplier: data.supplier, issueDate: data.issueDate, expectedDeliveryDate: data.expectedDeliveryDate, status: POStatus.ORDERED };

      const updatedReq: MaterialRequest = {
        ...flowContext.request,
        purchaseRequests: [...flowContext.request.purchaseRequests, newPR],
        purchaseOrders: [...flowContext.request.purchaseOrders, newPO],
        status: RequestStatus.PO_ISSUED,
      };
      updateRequest(updatedReq);
    }
  };

  const handleAddFollowUpComplete = (data: Record<string, any>) => {
    if (flowContext.request) {
      const newFollowUp: FollowUp = {
        id: `FU-${Date.now()}`,
        date: data.followUpDate,
        person: data.person,
        notes: data.notes,
        reminderDate: data.reminderDate,
      };
      const updatedReq = {
        ...flowContext.request,
        followUps: [...flowContext.request.followUps, newFollowUp],
      };
      updateRequest(updatedReq);
    }
  };

  const handleUpdatePOStatusComplete = (data: Record<string, any>) => {
    const { request, poId, tempState } = flowContext;
    if (!request || !poId) return;

    if (activeFlow === 'updatePOStatus') {
      const { poStatus } = data;
      if (poStatus === POStatus.DELAYED || poStatus === POStatus.PARTIALLY_DELIVERED) {
        setFlowContext({ ...flowContext, tempState: { poStatus } });
        setActiveFlow('updatePOStatus_notes');
        return; // Continue to next step in flow
      } else {
         const updatedReq: MaterialRequest = {
          ...request,
          purchaseOrders: request.purchaseOrders.map(po =>
            po.id === poId ? { ...po, status: poStatus, notes: po.notes } : po
          ),
          status: poStatus as RequestStatus,
        };
        updateRequest(updatedReq);
      }
    } else if (activeFlow === 'updatePOStatus_notes') {
      const finalData = { ...tempState, ...data };
      const updatedReq: MaterialRequest = {
        ...request,
        purchaseOrders: request.purchaseOrders.map(po =>
          po.id === poId ? { ...po, status: finalData.poStatus, notes: finalData.poNotes || po.notes } : po
        ),
        status: finalData.poStatus as RequestStatus,
      };
      updateRequest(updatedReq);
    }
    // Final step, so clear context
    return true; 
  };
  
  const handleUpdatePRItemStatusComplete = (data: Record<string, any>) => {
    const { request, prId, itemId } = flowContext;
    if (request && prId && itemId) {
      const updatedReq = {
        ...request,
        purchaseRequests: request.purchaseRequests.map(pr =>
          pr.id === prId
            ? { ...pr, items: pr.items.map(item => item.id === itemId ? { ...item, status: data.prItemStatus } : item) }
            : pr
        ),
      };
      updateRequest(updatedReq);
    }
  };
  
  const handleFlowComplete = (data: Record<string, any>) => {
    let shouldClearContext = true;
    switch (activeFlow) {
      case 'newRequest': handleNewRequestComplete(data); break;
      case 'classifyRequest': handleClassifyRequestComplete(data); break;
      case 'processPO': handleProcessPOComplete(data); break;
      case 'addFollowUp': handleAddFollowUpComplete(data); break;
      case 'updatePOStatus':
      case 'updatePOStatus_notes':
        const flowFinished = handleUpdatePOStatusComplete(data);
        shouldClearContext = !!flowFinished;
        break;
      case 'updatePRItemStatus': handleUpdatePRItemStatusComplete(data); break;
      default: break;
    }
    if (shouldClearContext) {
      clearFlowContext();
    }
  };

  const getFlowSteps = () => {
    const request = flowContext.request;
    switch(activeFlow) {
        case 'newRequest':
            return [
                { key: 'itemDescription', prompt: "Hello! Let's start a new material request. What is the item description?", type: 'text' as const, validation: (v:string) => v ? null : 'Description cannot be empty.' },
                { key: 'materialCode', prompt: 'What is the material code? (You can type "N/A" if you don\'t know)', type: 'text' as const, optional: true },
                { key: 'quantity', prompt: 'How many do you need?', type: 'number' as const, validation: (v:string) => (parseInt(v) > 0) ? null : 'Quantity must be greater than 0.' },
                { key: 'urgency', prompt: 'Please select the urgency level.', type: 'buttons' as const, options: URGENCY_LEVELS },
                { key: 'photo', prompt: 'Would you like to upload a photo of the item?', type: 'file' as const, optional: true },
            ];
        case 'classifyRequest':
            return [
                { key: 'category', prompt: `Classifying request ${request?.id}. Please assign a category.`, type: 'buttons' as const, options: CATEGORIES },
                { key: 'prHandler', prompt: 'Who will issue the Purchase Request (PR)?', type: 'buttons' as const, options: ['I will issue PR', 'Request Supply Chain'] },
                { key: 'coordinatorNotes', prompt: 'Add any optional notes for this classification.', type: 'textarea' as const, optional: true },
            ];
        case 'processPO':
             return [
                { key: 'prNumber', prompt: `Processing request ${request?.id}. What is the PR Number?`, type: 'text' as const, validation: (v:string) => v ? null : 'PR Number is required.' },
                { key: 'prItemStatus', prompt: 'What is the status of the item in this PR?', type: 'buttons' as const, options: PR_ITEM_STATUSES },
                { key: 'poNumber', prompt: 'Great. Now, what is the Purchase Order (PO) number?', type: 'text' as const, validation: (v:string) => v ? null : 'PO Number is required.' },
                { key: 'supplier', prompt: 'Who is the supplier?', type: 'text' as const },
                { key: 'issueDate', prompt: 'What is the PO issue date?', type: 'date' as const },
                { key: 'expectedDeliveryDate', prompt: 'What is the expected delivery date?', type: 'date' as const },
             ];
        case 'addFollowUp':
            return [
                { key: 'followUpDate', prompt: `Adding a follow-up for ${request?.id}. When did the follow-up occur?`, type: 'date' as const, validation: (v:string) => v ? null : 'Date is required.' },
                { key: 'person', prompt: 'Who performed the follow-up?', type: 'text' as const, validation: (v:string) => v ? null : 'Person\'s name is required.' },
                { key: 'notes', prompt: 'Please add any relevant notes.', type: 'textarea' as const, optional: true },
                { key: 'reminderDate', prompt: 'Optional: set a date for a reminder notification.', type: 'date' as const, optional: true },
            ];
        case 'updatePOStatus': {
            const po = request?.purchaseOrders.find(p => p.id === flowContext.poId);
            return [ { key: 'poStatus', prompt: `Select the new status for PO #${po?.poNumber}.`, type: 'buttons' as const, options: [POStatus.DELIVERED, POStatus.DELAYED, POStatus.PARTIALLY_DELIVERED] } ];
        }
        case 'updatePOStatus_notes': {
            const { poStatus } = flowContext.tempState || {};
            let promptText = 'Please add any relevant notes for this status update (optional).';
            if (poStatus === POStatus.DELAYED) promptText = 'Please provide a reason for the delay and any updated timeline information.';
            else if (poStatus === POStatus.PARTIALLY_DELIVERED) promptText = 'Please provide details about the partial delivery (e.g., what was received, what is pending).';
            return [ { key: 'poNotes', prompt: promptText, type: 'textarea' as const, optional: true } ];
        }
        case 'updatePRItemStatus': {
            const prItem = request?.purchaseRequests.find(pr => pr.id === flowContext.prId)?.items.find(item => item.id === flowContext.itemId);
            return [ { key: 'prItemStatus', prompt: `Select the new status for item: "${prItem?.description}".`, type: 'buttons' as const, options: PR_ITEM_STATUSES } ];
        }
        default: return [];
    }
  }
  
  const getFlowTitle = () => {
      switch(activeFlow) {
          case 'newRequest': return 'New Material Request';
          case 'classifyRequest': return 'Classify Request';
          case 'processPO': return 'Process Purchase Order';
          case 'addFollowUp': return 'Add Follow-up';
          case 'updatePOStatus': case 'updatePOStatus_notes': return 'Update PO Status';
          case 'updatePRItemStatus': return 'Update PR Item Status';
          default: return '';
      }
  }

  const handleClearFilters = () => {
    setSearchTerm(''); setStatusFilter('All'); setUrgencyFilter('All'); setStartDate(''); setEndDate('');
  };

  const handleDownloadReport = () => {
    const flattenedData = requests.flatMap(req => {
        const lastFollowUp = req.followUps.length > 0 ? req.followUps[req.followUps.length - 1] : {} as FollowUp;
        const baseRow = {
            'Request ID': req.id, 'Submission Date': new Date(req.submissionDate).toLocaleString(), 'Requester Role': req.requesterRole,
            'Item Description': req.itemDescription, 'Material Code': req.materialCode, 'Quantity': req.quantity, 'Urgency': req.urgency,
            'Status': req.status, 'Category': req.category || 'N/A', 'PR Handler': req.prHandler || 'N/A', 'Coordinator Notes': req.coordinatorNotes || '',
            'Last Follow-up Date': lastFollowUp.date ? new Date(lastFollowUp.date).toLocaleDateString() : 'N/A',
            'Last Follow-up By': lastFollowUp.person || 'N/A', 'Last Follow-up Notes': lastFollowUp.notes || ''
        };
        if (req.purchaseRequests.length === 0) return [{ ...baseRow, 'PR Number': 'N/A', 'PR Item Description': 'N/A', 'PR Item Status': 'N/A', 'PO Number': 'N/A', 'Supplier': 'N/A', 'PO Issue Date': 'N/A', 'Expected Delivery Date': 'N/A', 'PO Status': 'N/A', 'PO Notes': '' }];
        return req.purchaseRequests.flatMap(pr => {
            const po = req.purchaseOrders.find(p => p.prId === pr.id);
            return pr.items.map(item => ({ ...baseRow, 'PR Number': pr.prNumber, 'PR Item Description': item.description, 'PR Item Status': item.status, 'PO Number': po?.poNumber || 'N/A', 'Supplier': po?.supplier || 'N/A', 'PO Issue Date': po ? new Date(po.issueDate).toLocaleDateString() : 'N/A', 'Expected Delivery Date': po ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A', 'PO Status': po?.status || 'N/A', 'PO Notes': po?.notes || '' }));
        });
    });
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Material Requests');
    XLSX.writeFile(workbook, 'MaterialRequestReport.xlsx');
  };

  const commonInputClass = "block w-full text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-brand-500 focus:border-brand-500 rounded-md";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Material Requests</h1>
            <p className="text-gray-500 dark:text-gray-400">Dashboard for {userRole}</p>
        </div>
        <div className="flex items-center gap-4">
            {userRole === UserRole.FIELD_STAFF && (
              <button onClick={handleStartRequest} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                <PlusIcon className="w-5 h-5" /> New Request
              </button>
            )}
            {userRole === UserRole.COORDINATOR && (
                <button onClick={handleDownloadReport} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <DownloadIcon className="w-5 h-5" /> Download Report
                </button>
            )}
        </div>
      </div>

      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="relative mb-4">
          <input type="text" placeholder="Search by ID, description, PR, or PO number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={commonInputClass}>
                    <option>All</option>
                    {REQUEST_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
            </div>
            <div>
                 <label htmlFor="urgency-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgency</label>
                <select id="urgency-filter" value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)} className={commonInputClass}>
                    <option>All</option>
                    {URGENCY_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                </select>
            </div>
            <div>
                 <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className={commonInputClass}/>
            </div>
            <div>
                 <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className={commonInputClass}/>
            </div>
            <div className="flex justify-end">
                <button onClick={handleClearFilters} className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-semibold">Clear Filters</button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map(request => (
          <RequestCard key={request.id} request={request} onViewDetails={handleViewDetails} />
        ))}
        {filteredRequests.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                <p className="text-lg">No requests found.</p>
                <p className="text-sm">Try adjusting your search or filter criteria.</p>
            </div>
        )}
      </div>

      {selectedRequest && (
        <RequestDetailModal 
            request={selectedRequest} 
            onClose={() => setSelectedRequest(null)}
            onProcess={handleProcessRequest}
            onAddFollowUp={handleAddFollowUp}
            onUpdatePOStatus={handleUpdatePOStatus}
            onUpdatePRItemStatus={handleUpdatePRItemStatus}
            userRole={userRole}
        />
      )}

      {activeFlow && (
          <ConversationalFlow 
            key={activeFlow + (flowContext.request?.id || '')} // Reset component state when flow changes
            title={getFlowTitle()}
            steps={getFlowSteps()}
            onComplete={handleFlowComplete}
            onCancel={clearFlowContext}
          />
      )}
    </div>
  );
};

export default Dashboard;