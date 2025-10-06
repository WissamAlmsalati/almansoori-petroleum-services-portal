import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-brand-nav p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
                <p className="text-brand-light mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="py-2 px-4 rounded-md text-brand-light hover:bg-brand-dark transition-colors">{cancelText}</button>
                    <button onClick={onConfirm} className="py-2 px-6 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold transition-colors">{confirmText}</button>
                </div>
            </div>
        </div>
    );
};
