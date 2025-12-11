import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'info' | 'success';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!open) return null;

  const iconColors = {
    warning: 'bg-duck-orange',
    info: 'bg-duck-blue',
    success: 'bg-duck-green'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 animate-fade-in" 
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white border-4 border-black rounded-3xl shadow-brutal-lg max-w-md w-full p-8 animate-pop-in">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-black" />
        </button>

        {/* Icon */}
        <div className={`w-16 h-16 ${iconColors[type]} border-4 border-black rounded-full flex items-center justify-center mb-6 mx-auto`}>
          <AlertTriangle size={32} className="text-black" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-display font-black text-black text-center mb-4 uppercase tracking-tight">
          {title}
        </h2>

        {/* Message */}
        <p className="text-lg text-slate-700 text-center mb-8 font-medium leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-white border-2 border-black text-black px-6 py-3 font-bold rounded-xl shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-duck-yellow border-2 border-black text-black px-6 py-3 font-bold rounded-xl shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
