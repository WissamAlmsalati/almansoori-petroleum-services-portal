import React from 'react';
import { MaterialRequest, RequestStatus, Urgency } from '../types';

interface RequestCardProps {
    request: MaterialRequest;
    onViewDetails: (request: MaterialRequest) => void;
}

const getStatusColor = (status: RequestStatus) => {
    switch (status) {
        case RequestStatus.NEW_REQUEST: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case RequestStatus.CLASSIFIED: return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
        case RequestStatus.PO_ISSUED: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case RequestStatus.DELIVERED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case RequestStatus.DELAYED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case RequestStatus.PARTIALLY_DELIVERED: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
}

const getUrgencyColor = (urgency: Urgency) => {
    switch (urgency) {
        case Urgency.CRITICAL: return 'border-red-500';
        case Urgency.URGENT: return 'border-yellow-500';
        default: return 'border-transparent';
    }
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onViewDetails }) => {
    return (
        <div
            onClick={() => onViewDetails(request)}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-l-4 ${getUrgencyColor(request.urgency)}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-brand-600 dark:text-brand-400">{request.id}</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-1">{request.itemDescription}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                </span>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                    <span>Quantity: <span className="font-medium text-gray-700 dark:text-gray-300">{request.quantity}</span></span>
                    <span>Urgency: <span className="font-medium text-gray-700 dark:text-gray-300">{request.urgency}</span></span>
                </div>
                <div className="mt-2">
                    Date Submitted: <span className="font-medium text-gray-700 dark:text-gray-300">{new Date(request.submissionDate).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default RequestCard;