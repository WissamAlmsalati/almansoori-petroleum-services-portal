import React, { createContext, useContext, useState, useCallback } from 'react';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface Message {
  id: string;
  type: MessageType;
  title?: string;
  message: string;
  duration?: number;
}

interface MessageContextType {
  messages: Message[];
  showMessage: (type: MessageType, message: string, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  removeMessage: (id: string) => void;
  clearAllMessages: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const showMessage = useCallback((
    type: MessageType,
    message: string,
    title?: string,
    duration: number = 5000
  ) => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: Message = { id, type, message, title, duration };
    
    setMessages(prev => [...prev, newMessage]);

    // إزالة الرسالة تلقائياً بعد المدة المحددة
    if (duration > 0) {
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
      }, duration);
    }
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showMessage('success', message, title || 'نجح العملية');
  }, [showMessage]);

  const showError = useCallback((message: string, title?: string) => {
    showMessage('error', message, title || 'خطأ', 7000); // رسائل الخطأ تظهر لفترة أطول
  }, [showMessage]);

  const showWarning = useCallback((message: string, title?: string) => {
    showMessage('warning', message, title || 'تحذير');
  }, [showMessage]);

  const showInfo = useCallback((message: string, title?: string) => {
    showMessage('info', message, title || 'معلومات');
  }, [showMessage]);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: MessageContextType = {
    messages,
    showMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeMessage,
    clearAllMessages,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};
