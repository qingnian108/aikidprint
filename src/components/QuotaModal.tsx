import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  title: string;
  message: string;
  actionText?: string;
  onClose: () => void;
  onAction?: () => void;
}

const QuotaModal: React.FC<Props> = ({ open, title, message, actionText, onClose, onAction }) => {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white border-2 border-black rounded-3xl shadow-brutal-lg max-w-lg w-[92%] mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-display font-black text-black uppercase tracking-tight">{title}</h3>
          <button className="border-2 border-black px-3 py-1 bg-white text-black font-bold rounded-lg hover:bg-black hover:text-white transition-colors" onClick={onClose}>Close</button>
        </div>
        <div className="mb-4">
          <div className="bg-slate-50 border-2 border-black rounded-xl p-4 font-mono text-sm text-slate-700">{message}</div>
        </div>
        {actionText && (
          <button
            className="w-full py-3 bg-duck-yellow border-2 border-black text-black font-bold uppercase rounded-xl shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all"
            onClick={() => {
              if (onAction) onAction();
              navigate('/pricing');
              onClose();
            }}
          >
            {actionText}
          </button>
        )}
        {!actionText && (
          <div className="text-center mt-2 text-slate-500 font-mono text-xs">Please try again tomorrow.</div>
        )}
      </div>
    </div>
  );
};

export default QuotaModal;