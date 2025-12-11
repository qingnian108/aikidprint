import React from 'react';
import { CheckCircle, X, Sparkles } from 'lucide-react';

interface SuccessModalProps {
  open: boolean;
  title: string;
  message: string;
  features?: string[];
  buttonText?: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  title,
  message,
  features = [],
  buttonText = 'Continue',
  onClose
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white border-4 border-black rounded-3xl shadow-brutal-lg max-w-md w-full p-8 animate-pop-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-black" />
        </button>

        {/* Success Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-duck-green border-4 border-black rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle size={40} className="text-black" strokeWidth={3} />
          </div>
          <Sparkles className="absolute -top-2 -right-2 text-duck-yellow animate-spin-slow" size={24} />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-display font-black text-black text-center mb-4 uppercase tracking-tight">
          {title}
        </h2>

        {/* Message */}
        <p className="text-lg text-slate-700 text-center mb-6 font-medium leading-relaxed">
          {message}
        </p>

        {/* Features List */}
        {features.length > 0 && (
          <div className="bg-duck-yellow/20 border-2 border-black rounded-xl p-4 mb-6">
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-duck-yellow" />
                  </div>
                  <span className="font-bold text-black uppercase text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full bg-duck-green border-2 border-black text-black px-6 py-4 font-bold rounded-xl shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase text-lg"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
