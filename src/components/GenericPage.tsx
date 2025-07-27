import React from 'react';

interface GenericPageProps {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  children?: React.ReactNode;
}

const GenericPage: React.FC<GenericPageProps> = ({ title, onAdd, addLabel = "Add New Item", children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        {onAdd && (
            <button onClick={onAdd} className="bg-brand-blue-600 text-white px-4 py-2 rounded-md hover:bg-brand-blue-700 transition-colors">
                {addLabel}
            </button>
        )}
      </div>
      {children ? (
        children
      ) : (
        <div className="text-center py-20">
          <h4 className="text-xl text-slate-600">Feature Coming Soon</h4>
          <p className="text-slate-400 mt-2">This section is under construction. Check back later!</p>
        </div>
      )}
    </div>
  );
};

export default GenericPage;