import React from 'react';
import { useMessages, Message, MessageType } from '../contexts/MessageContext';

const Toast: React.FC<{ message: Message }> = ({ message }) => {
  const { removeMessage } = useMessages();

  const getToastStyles = (type: MessageType): string => {
    const baseStyles = "mb-4 p-4 rounded-lg shadow-lg border-l-4 relative animate-slide-in";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-500 text-gray-800`;
    }
  };

  const getIcon = (type: MessageType): string => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <div className={getToastStyles(message.type)}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <span className="text-lg font-bold">{getIcon(message.type)}</span>
        </div>
        <div className="flex-1">
          {message.title && (
            <h4 className="font-semibold text-sm mb-1">{message.title}</h4>
          )}
          <p className="text-sm">{message.message}</p>
        </div>
        <button
          onClick={() => removeMessage(message.id)}
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="إغلاق الرسالة"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { messages } = useMessages();

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
      {messages.map((message) => (
        <Toast key={message.id} message={message} />
      ))}
    </div>
  );
};

export default ToastContainer;
