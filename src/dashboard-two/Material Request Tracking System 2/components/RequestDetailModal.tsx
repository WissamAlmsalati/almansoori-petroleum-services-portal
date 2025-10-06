import React from 'react';
import { MaterialRequest, UserRole, POStatus, PRItemStatus, RequestStatus } from '../types';
import { XCircleIcon, PaperClipIcon } from './icons';

interface RequestDetailModalProps {
    request: MaterialRequest | null;
    onClose: () => void;
    onProcess: (request: MaterialRequest) => void;
    onAddFollowUp: (request: MaterialRequest) => void;
    onUpdatePOStatus: (request: MaterialRequest, poId: string) => void;
    onUpdatePRItemStatus: (request: MaterialRequest, prId: string, itemId: string) => void;
    userRole: UserRole;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">{title}</h3>
        <div className="space-y-4 text-sm">{children}</div>
    </div>
);

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 items-start">
        <span className="text-gray-500 dark:text-gray-400 font-medium">{label}:</span>
        <span className="col-span-2 font-medium text-gray-800 dark:text-gray-200 text-left">{value || 'N/A'}</span>
    </div>
);

const getPRItemStatusColor = (status: PRItemStatus) => {
    switch (status) {
        case PRItemStatus.APPROVED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case PRItemStatus.REJECTED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case PRItemStatus.PARTIALLY_APPROVED: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ request, onClose, onProcess, onAddFollowUp, onUpdatePOStatus, onUpdatePRItemStatus, userRole }) => {
    if (!request) return null;

    const canProcess = () => {
        if (!request) return false;

        if (userRole === UserRole.COORDINATOR && request.status === RequestStatus.NEW_REQUEST) {
            return true;
        }

        if (userRole === UserRole.SUPPLY_CHAIN && request.status === RequestStatus.CLASSIFIED) {
            return true;
        }

        return false;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-bold text-brand-600 dark:text-brand-400">Request Details: {request.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </header>

                <div className="p-6 overflow-y-auto">
                    <DetailSection title="Request Information">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3">
                            <DetailRow label="Item Description" value={request.itemDescription} />
                            <DetailRow label="Material Code" value={request.materialCode} />
                            <DetailRow label="Quantity" value={request.quantity} />
                            <DetailRow label="Urgency" value={request.urgency} />
                            <DetailRow label="Submission Date" value={new Date(request.submissionDate).toLocaleString()} />
                            <DetailRow label="Current Status" value={<span className="font-bold">{request.status}</span>} />
                            {request.photo && (
                                <div className="grid grid-cols-3 gap-4 items-center">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Attachment:</span>
                                    <a href={request.photo.url} target="_blank" rel="noopener noreferrer" className="col-span-2 font-medium text-brand-600 hover:underline flex items-center gap-1">
                                        <PaperClipIcon className="w-4 h-4"/> {request.photo.name}
                                    </a>
                                </div>
                            )}
                        </div>
                    </DetailSection>

                    {request.category && (
                        <DetailSection title="Classification">
                             <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3">
                                <DetailRow label="Category" value={request.category} />
                                <DetailRow label="PR Handler" value={request.prHandler} />
                                <DetailRow label="Coordinator Notes" value={<p className="whitespace-pre-wrap">{request.coordinatorNotes}</p>} />
                            </div>
                        </DetailSection>
                    )}

                    {request.purchaseRequests.length > 0 && (
                        <DetailSection title="Purchase Request(s)">
                            {request.purchaseRequests.map(pr => (
                                <div key={pr.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <DetailRow label="PR Number" value={<span className="font-bold text-lg">{pr.prNumber}</span>} />
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                    <h4 className="font-semibold text-gray-600 dark:text-gray-300">Items:</h4>
                                    {pr.items.map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-white dark:bg-gray-800 rounded-md">
                                            <span className="text-gray-600 dark:text-gray-300">{item.description}</span>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPRItemStatusColor(item.status)}`}>{item.status}</span>
                                                {userRole === UserRole.SUPPLY_CHAIN && request.status === RequestStatus.PO_ISSUED && (
                                                    <button 
                                                        onClick={() => onUpdatePRItemStatus(request, pr.id, item.id)} 
                                                        className="px-2 py-0.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 text-xs font-semibold"
                                                    >
                                                        Update
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            ))}
                        </DetailSection>
                    )}
                    
                    {request.purchaseOrders.length > 0 && (
                        <DetailSection title="Purchase Order(s)">
                            {request.purchaseOrders.map(po => (
                                <div key={po.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3">
                                    <DetailRow label="PO Number" value={<span className="font-bold text-lg">{po.poNumber}</span>} />
                                    <DetailRow label="Supplier" value={po.supplier} />
                                    <DetailRow label="Status" value={<span className="font-bold">{po.status}</span>} />
                                    <DetailRow label="Issue Date" value={new Date(po.issueDate).toLocaleDateString()} />
                                    <DetailRow label="Expected Delivery" value={new Date(po.expectedDeliveryDate).toLocaleDateString()} />
                                    {po.notes && <DetailRow label="Notes" value={<p className="whitespace-pre-wrap">{po.notes}</p>} />}
                                     {userRole === UserRole.SUPPLY_CHAIN && (po.status === POStatus.ORDERED || po.status === POStatus.DELAYED) && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-right">
                                            <button
                                                onClick={() => onUpdatePOStatus(request, po.id)}
                                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-semibold"
                                            >
                                                Update Status
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </DetailSection>
                    )}
                    
                     {request.followUps.length > 0 && (
                        <DetailSection title="Follow-ups">
                            {request.followUps.map(fu => (
                                <div key={fu.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3">
                                     <DetailRow label="Follow-up Date" value={new Date(fu.date).toLocaleDateString()} />
                                     <DetailRow label="By" value={fu.person} />
                                     {fu.notes && <DetailRow label="Notes" value={<p className="whitespace-pre-wrap">{fu.notes}</p>} />}
                                     {fu.reminderDate && <DetailRow label="Reminder Set" value={<span className="text-green-600 dark:text-green-400 font-semibold">{new Date(fu.reminderDate).toLocaleDateString()}</span>} />}
                                </div>
                            ))}
                        </DetailSection>
                    )}

                </div>

                <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto bg-gray-50 dark:bg-gray-800/50 sticky bottom-0">
                    <div className="flex justify-end gap-3">
                         <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Close</button>
                         <button onClick={() => onAddFollowUp(request)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Follow-up</button>
                        {canProcess() && (
                            <button onClick={() => onProcess(request)} className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 font-semibold">
                                {userRole === UserRole.COORDINATOR && 'Classify Request'}
                                {userRole === UserRole.SUPPLY_CHAIN && 'Process PR/PO'}
                            </button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default RequestDetailModal;