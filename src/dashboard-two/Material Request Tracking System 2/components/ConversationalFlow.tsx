import React, { useState, useRef } from 'react';
import { Urgency, Category, PRItemStatus, POStatus } from '../types';
import { CalendarIcon, PaperClipIcon, UploadIcon, XCircleIcon } from './icons';

type InputType = 'text' | 'number' | 'textarea' | 'buttons' | 'date' | 'file';

interface Step {
    key: string;
    prompt: string | React.ReactNode;
    type: InputType;
    options?: (string | Urgency | Category | PRItemStatus | POStatus)[];
    optional?: boolean;
    validation?: (value: any) => string | null;
}

interface ConversationalFlowProps {
    title: string;
    steps: Step[];
    onComplete: (data: Record<string, any>) => void;
    onCancel: () => void;
}

const ConversationalFlow: React.FC<ConversationalFlowProps> = ({ title, steps, onComplete, onCancel }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentStep = steps[currentStepIndex];
    const titleId = `conv-flow-title-${React.useId()}`;

    const handleNext = (value: any) => {
        if (currentStep.validation) {
            const validationError = currentStep.validation(value);
            if (validationError) {
                setError(validationError);
                return;
            }
        }
        
        setError(null);
        const newData = { ...formData, [currentStep.key]: value };
        setFormData(newData);

        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            onComplete(newData);
        }
    };

    const handleSkip = () => {
        handleNext(currentStep.key === 'materialCode' ? 'N/A' : null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileData = {
                name: file.name,
                url: URL.createObjectURL(file)
            };
            handleNext(fileData);
        }
    };

    const renderInput = () => {
        const inputContainerClass = `mt-2 ${error ? 'mb-1' : ''}`;
        const inputErrorClass = "text-red-500 text-sm mt-1";

        switch (currentStep.type) {
            case 'text':
            case 'number':
            case 'textarea':
                return (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('inputValue') as HTMLInputElement;
                        handleNext(input.value);
                    }}>
                        <div className={inputContainerClass}>
                            {currentStep.type === 'textarea' ? (
                                <textarea
                                    id="inputValue"
                                    name="inputValue"
                                    rows={3}
                                    className={`w-full bg-white dark:bg-gray-700 border rounded-md p-2 focus:ring-2 focus:ring-brand-500 focus:outline-none ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    autoFocus
                                />
                            ) : (
                                <input
                                    id="inputValue"
                                    name="inputValue"
                                    type={currentStep.type}
                                    className={`w-full bg-white dark:bg-gray-700 border rounded-md p-2 focus:ring-2 focus:ring-brand-500 focus:outline-none ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    autoFocus
                                />
                            )}
                            {error && <p className={inputErrorClass}>{error}</p>}
                        </div>

                        <div className="flex justify-end items-center mt-4 space-x-2">
                             {currentStep.optional && <button type="button" onClick={handleSkip} className="text-sm text-gray-500 hover:text-brand-500">Skip</button>}
                            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700">Continue</button>
                        </div>
                    </form>
                );
            case 'date':
                 return (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('inputValue') as HTMLInputElement;
                        handleNext(input.value);
                    }}>
                        <div className={`relative ${inputContainerClass}`}>
                            <input
                                id="inputValue"
                                name="inputValue"
                                type="date"
                                className={`w-full bg-white dark:bg-gray-700 border rounded-md p-2 pr-10 focus:ring-2 focus:ring-brand-500 focus:outline-none ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                autoFocus
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                         {error && <p className={inputErrorClass}>{error}</p>}
                        <div className="flex justify-end mt-4">
                            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700">Set Date</button>
                        </div>
                    </form>
                );
            case 'buttons':
                return (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {currentStep.options?.map((option, index) => (
                            <button key={index} onClick={() => handleNext(option)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-brand-500 hover:text-white transition-colors">
                                {option}
                            </button>
                        ))}
                    </div>
                );
            case 'file':
                 return (
                    <div>
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-brand-500 hover:text-white transition-colors">
                            <UploadIcon className="w-5 h-5"/>
                            Upload Photo
                        </button>
                        {currentStep.optional && <button onClick={handleSkip} className="w-full mt-2 text-sm text-gray-500 hover:text-brand-500">Skip for now</button>}
                    </div>
                 )
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div 
                className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 id={titleId} className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                     <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close dialog">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </div>
                
                <div className="mb-6 min-h-[60px]">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                         <p className="text-gray-800 dark:text-gray-200">{currentStep.prompt}</p>
                    </div>
                </div>

                <div>
                    {renderInput()}
                </div>
                
                 <div className="mt-6 text-center text-sm text-gray-500">
                    Step {currentStepIndex + 1} of {steps.length}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                    <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}></div>
                </div>

                {Object.keys(formData).length > 0 && (
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="font-semibold mb-2 text-gray-600 dark:text-gray-300">Summary:</h3>
                        <ul className="text-sm space-y-1">
                            {Object.entries(formData).map(([key, value]) => (
                                <li key={key} className="flex justify-between">
                                    <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {typeof value === 'object' && value?.name ? (
                                            <span className="flex items-center gap-1">
                                                <PaperClipIcon className="w-4 h-4" /> {value.name}
                                            </span>
                                        ) : String(value)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationalFlow;