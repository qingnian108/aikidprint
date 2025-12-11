import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalModalProps {
  open: boolean;
  amount: string;
  currency?: string;
  title?: string;
  onClose: () => void;
  onSuccess: (details: any) => void;
  onError?: (error: any) => void;
}

const loadPayPalScript = (clientId: string, currency: string) => {
  return new Promise<void>((resolve, reject) => {
    // Check if PayPal is already loaded
    if (window.paypal) {
      resolve();
      return;
    }
    
    // Check if script is already being loaded (preloaded or by another instance)
    const existing = document.getElementById('paypal-sdk') || document.getElementById('paypal-sdk-preload');
    if (existing) {
      // Wait for existing script to load
      if (window.paypal) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(e));
      }
      return;
    }
    
    // Load script if not already loading
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    // Force English locale for international users
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&locale=en_US`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.body.appendChild(script);
  });
};

const PayPalModal: React.FC<PayPalModalProps> = ({
  open,
  amount,
  currency = (process.env.PAYPAL_CURRENCY as string) || 'USD',
  title = 'Checkout',
  onClose,
  onSuccess,
  onError,
}) => {
  const buttonsRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const clientId = process.env.PAYPAL_CLIENT_ID as string | undefined;
    if (!clientId) {
      setError('Missing PAYPAL_CLIENT_ID');
      return;
    }
    setLoading(true);
    loadPayPalScript(clientId, currency)
      .then(() => {
        setLoading(false);
        if (!buttonsRef.current || !window.paypal) return;
        window.paypal
          .Buttons({
            style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
            createOrder: (_data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: { value: amount, currency_code: currency },
                  },
                ],
              });
            },
            onApprove: async (_data: any, actions: any) => {
              try {
                const details = await actions.order.capture();
                onSuccess(details);
                onClose();
              } catch (e) {
                setError('Payment capture failed');
                onError?.(e);
              }
            },
            onCancel: () => {
              onClose();
            },
            onError: (e: any) => {
              setError('PayPal error');
              onError?.(e);
            },
          })
          .render(buttonsRef.current);
      })
      .catch((e) => {
        setLoading(false);
        setError('Failed to load PayPal');
        onError?.(e);
      });
  }, [open, amount, currency, onClose, onSuccess, onError]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white border-2 border-black rounded-3xl shadow-brutal-lg max-w-lg w-[92%] mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-display font-black text-black uppercase tracking-tight">{title}</h3>
          <button className="border-2 border-black px-3 py-1 bg-white text-black font-bold rounded-lg hover:bg-black hover:text-white transition-colors" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between bg-slate-50 border-2 border-black rounded-xl p-4">
            <span className="font-mono text-sm text-slate-700 uppercase">Total</span>
            <span className="font-display text-3xl font-bold">{amount} {currency}</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs font-mono uppercase bg-black text-white inline-block px-2 py-1">Pay securely with PayPal</div>
        </div>
        {error && (
          <div className="mb-3 border-2 border-black bg-duck-orange/20 text-black font-mono text-sm px-3 py-2 rounded-xl">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-24 gap-3">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono text-slate-600">Loading PayPal...</p>
          </div>
        ) : (
          <div ref={buttonsRef} className="mt-2" />
        )}
        <div className="mt-6 text-center text-slate-500 font-mono text-xs">By proceeding you agree to our terms.</div>
      </div>
    </div>
  );
};

export default PayPalModal;