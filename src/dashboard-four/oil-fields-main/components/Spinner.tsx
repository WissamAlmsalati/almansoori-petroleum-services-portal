
import React from 'react';
import { SpinnerIcon } from './Icons';

interface SpinnerProps {
    text?: string;
    size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ text = "Loading...", size = 'md'}) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };
    
    return (
        <div className="flex flex-col justify-center items-center h-full p-8 text-brand-light">
            <SpinnerIcon className={sizeClasses[size]} />
            {text && <p className="mt-4 text-lg">{text}</p>}
        </div>
    );
};

export default Spinner;
