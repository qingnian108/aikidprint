import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ErrorModalProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
    isOpen,
    title = 'Something went wrong',
    message = '',
    onClose
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white border-4 border-black rounded-2xl shadow-brutal-lg max-w-md w-full animate-slide-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-duck-yellow translate-x-2 translate-y-2 rounded-full"></div>
                            <div className="relative bg-white border-4 border-black rounded-full p-4">
                                <AlertCircle size={48} className="text-red-500" />
                            </div>
                        </div>
                    </div>
                    <h2 className="text-3xl font-display font-black text-center mb-3">
                        {title}
                    </h2>
                    {message && (
                        <p className="text-center text-slate-600 font-medium mb-8">
                            {message}
                        </p>
                    )}
                    <div className="flex justify-center">
                        <button
                            onClick={onClose}
                            className="brutal-btn bg-black text-white border-2 border-black px-6 py-3 rounded-xl font-bold hover:-translate-y-1 hover:shadow-brutal transition-all"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorModal;
