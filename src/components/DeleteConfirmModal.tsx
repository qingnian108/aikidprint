import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    title = 'Delete Worksheet?',
    message = 'Are you sure you want to delete this worksheet? This action cannot be undone.',
    confirmLabel = 'Delete'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white border-4 border-black rounded-2xl shadow-brutal-lg max-w-md w-full animate-slide-up">
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500 translate-x-2 translate-y-2 rounded-full"></div>
                            <div className="relative bg-red-100 border-4 border-black rounded-full p-4">
                                <AlertTriangle size={48} className="text-red-500" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-display font-black text-center mb-3">
                        {title}
                    </h2>

                    {/* Message */}
                    <p className="text-center text-slate-600 font-medium mb-8">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 brutal-btn bg-white border-2 border-black px-6 py-3 rounded-xl font-bold hover:shadow-brutal hover:-translate-y-1 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 brutal-btn bg-red-500 text-white border-2 border-black px-6 py-3 rounded-xl font-bold hover:bg-red-600 hover:shadow-brutal hover:-translate-y-1 transition-all"
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
