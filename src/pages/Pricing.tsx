import React, { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PayPalModal from '../components/PayPalModal';
import ConfirmModal from '../components/ConfirmModal';
import SuccessModal from '../components/SuccessModal';
import { useAuth } from '../contexts/AuthContext';
import { createPayment, createSubscription, updatePaymentStatus } from '../services/firestoreService';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const plans = [
    {
      name: 'FREE',
      price: '$0',
      period: '/forever',
      description: 'Good for testing the waters.',
      features: [
        '3 Worksheets / day',
        'Standard Speed',
        'All Themes',
        'No Watermarks'
      ],
      notIncluded: [
        'Save History',
        'Unlimited Gen',
        'Weekly Pack',
        'Priority Support'
      ],
      buttonText: 'START CREATING',
      primary: false,
      color: 'bg-white'
    },
    {
      name: 'PRO PARENT',
      price: '$4.99',
      period: '/month',
      description: 'Unlock unlimited learning.',
      features: [
        'Unlimited Gen',
        'No Watermarks',
        'Save Favorites',
        'Weekly Pack',
        'Fast Generation'
      ],
      notIncluded: [],
      buttonText: 'GO PRO',
      primary: true,
      color: 'bg-duck-yellow'
    }
  ];

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string>('4.99');
  const { currentUser } = useAuth();

  const openCheckout = (amount: string) => {
    // Check if user is logged in
    if (!currentUser) {
      // Show login modal
      setShowLoginModal(true);
      return;
    }
    
    // User is logged in, open payment modal
    setSelectedAmount(amount);
    setCheckoutOpen(true);
  };

  return (
    <motion.div 
      className="py-20 px-4 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1 className="text-5xl md:text-6xl font-display font-bold text-black mb-6 uppercase">Pricing</h1>
        <p className="text-xl text-slate-600 font-mono">SIMPLE PLANS. NO HIDDEN FEES.</p>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-center gap-8 items-center">
        {plans.map((plan, index) => (
          <motion.div 
            key={plan.name} 
            className={`w-full border-2 border-black shadow-brutal hover:shadow-brutal-lg transition-all ${plan.color} relative ${
              plan.primary 
                ? 'max-w-lg p-10 scale-105 z-10' 
                : 'max-w-sm p-6 opacity-90'
            }`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: plan.primary ? 1.05 : 1 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.2 + index * 0.12,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{ y: -5, transition: { duration: 0.25, ease: "easeOut" } }}
          >
            {plan.primary && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black text-white border-2 border-white px-4 py-1 text-xs font-bold uppercase tracking-wide shadow-lg">
                    <Sparkles size={12} className="inline mr-1"/> Most Popular
                </div>
            )}
            <h3 className={`font-bold font-display mb-4 uppercase ${plan.primary ? 'text-4xl' : 'text-2xl'}`}>{plan.name}</h3>
            <div className="flex items-baseline mb-4 border-b-2 border-black pb-4">
              <span className={`font-bold tracking-tight ${plan.primary ? 'text-7xl' : 'text-5xl'}`}>{plan.price}</span>
              <span className={`ml-2 font-mono text-slate-600 ${plan.primary ? 'text-xl' : 'text-base'}`}>{plan.period}</span>
            </div>
            <p className={`mb-6 font-mono text-slate-700 ${plan.primary ? 'text-base' : 'text-sm'}`}>{plan.description}</p>
            
            <ul className={`mb-8 ${plan.primary ? 'space-y-4' : 'space-y-3'}`}>
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-center gap-3">
                  <div className="bg-black text-white p-0.5">
                    <Check size={plan.primary ? 16 : 12} strokeWidth={3} />
                  </div>
                  <span className={`font-bold uppercase ${plan.primary ? 'text-base' : 'text-xs'}`}>{feat}</span>
                </li>
              ))}
              {plan.notIncluded.map((feat) => (
                <li key={feat} className="flex items-center gap-3 opacity-40">
                  <div className="border-2 border-black p-0.5">
                    <X size={plan.primary ? 14 : 10} strokeWidth={3} />
                  </div>
                  <span className={`font-bold uppercase decoration-2 line-through ${plan.primary ? 'text-base' : 'text-xs'}`}>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full border-2 border-black font-bold transition-all shadow-brutal-sm active:shadow-none active:translate-y-[2px] uppercase ${
                plan.primary
                  ? 'py-5 text-xl bg-duck-blue text-black hover:bg-blue-300'
                  : 'py-3 text-sm bg-black text-white hover:bg-slate-800'
              }`}
              onClick={() => {
                if (plan.primary) {
                  openCheckout('4.99');
                } else {
                  // Free 计划 - 跳转到生成页面
                  navigate('/weekly-pack');
                }
              }}
            >
              {plan.buttonText}
            </button>
          </motion.div>
        ))}
      </div>
      <PayPalModal
        open={checkoutOpen}
        amount={selectedAmount}
        title="Go Pro"
        onClose={() => setCheckoutOpen(false)}
        onSuccess={async (details) => {
          console.log('Payment success', details);
          
          if (currentUser) {
            try {
              // 1. Create payment record
              const paymentId = await createPayment(
                currentUser.uid,
                parseFloat(selectedAmount),
                'USD',
                details.id,
                'pending'
              );
              
              // 2. Update payment status to completed
              await updatePaymentStatus(paymentId, 'completed');
              
              // 3. Create subscription record (30 days)
              await createSubscription(currentUser.uid, details.id, 30);
              
              // 4. Update local cache
              localStorage.setItem(`userPlan:${currentUser.uid}`, 'Pro');
              
              // 5. Close payment modal
              setCheckoutOpen(false);
              
              // 6. Show success modal
              setShowSuccessModal(true);
            } catch (error) {
              console.error('Payment processing failed:', error);
              alert('❌ Failed to save payment record. Please contact support.');
            }
          }
        }}
        onError={(error) => {
          console.error('Payment error:', error);
          alert('❌ Payment failed. Please try again.');
        }}
      />
      
      {/* Login Required Modal */}
      <ConfirmModal
        open={showLoginModal}
        title="Login Required"
        message="You need to create an account or log in before upgrading to Pro."
        confirmText="Go to Login"
        cancelText="Cancel"
        type="warning"
        onConfirm={() => {
          setShowLoginModal(false);
          navigate('/login');
        }}
        onCancel={() => setShowLoginModal(false)}
      />
      
      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        title="Upgrade Successful!"
        message="You are now a Pro user! Enjoy unlimited access to all features."
        features={[
          'Unlimited Generations',
          'No Watermarks',
          'Multi-page Worksheets',
          'Priority Support'
        ]}
        buttonText="Start Creating"
        onClose={() => {
          setShowSuccessModal(false);
          // 检查是否有待恢复的 pack
          const pendingPackId = sessionStorage.getItem('pendingPackId');
          if (pendingPackId) {
            // 跳转回预览页面
            navigate(`/weekly-pack/preview/${pendingPackId}`);
          } else {
            // 默认跳转到 weekly-pack 页面
            navigate('/weekly-pack');
          }
        }}
      />
    </motion.div>
  );
};

export default Pricing;