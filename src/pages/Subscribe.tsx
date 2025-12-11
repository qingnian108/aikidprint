import React, { useState } from 'react';
import { Check, X, Sparkles, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const Subscribe: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const features = {
    free: [
      { text: 'Download Page 1 only', included: true },
      { text: 'No weekly delivery', included: false },
      { text: 'Limited themes', included: true },
      { text: 'Basic worksheets', included: true },
      { text: 'Email support', included: false }
    ],
    pro: [
      { text: 'Full 10-20 page Weekly Pack', included: true },
      { text: 'Automatic delivery every Sunday', included: true },
      { text: 'Unlimited worksheets', included: true },
      { text: 'All themes unlocked', included: true },
      { text: 'Custom cover with child name', included: true },
      { text: 'Printable stickers + creative pages', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Cancel anytime', included: true }
    ]
  };

  const pricing = {
    monthly: { price: 9.9, save: 0 },
    yearly: { price: 99, save: 20, monthlyEquivalent: 8.25 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-duck-yellow/10 via-duck-blue/10 to-duck-pink/10 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full font-bold mb-4">
            <Sparkles size={20} />
            Choose Your Plan
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-black mb-4">
            Unlock the Full
            <br />
            <span className="text-duck-orange">Learning Experience</span>
          </h1>
          <p className="text-xl text-slate-600 font-mono max-w-2xl mx-auto">
            Start with a 7-day free trial. Cancel anytime, no questions asked.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-white border-4 border-black rounded-2xl p-2 shadow-brutal">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-duck-blue border-2 border-black shadow-brutal-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-xl font-bold transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-duck-blue border-2 border-black shadow-brutal-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-duck-orange text-white text-xs px-2 py-1 rounded-full border-2 border-black">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-4 border-black rounded-2xl shadow-brutal p-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-3xl font-display font-bold mb-2">Free</h3>
              <div className="text-5xl font-black mb-2">$0</div>
              <p className="text-slate-600 font-mono text-sm">Try it out</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-6 h-6 text-duck-green flex-shrink-0 mt-0.5" strokeWidth={3} />
                  ) : (
                    <X className="w-6 h-6 text-slate-300 flex-shrink-0 mt-0.5" strokeWidth={3} />
                  )}
                  <span className={`font-mono text-sm ${feature.included ? 'text-black' : 'text-slate-400 line-through'}`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <button className="w-full px-6 py-4 border-3 border-black rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors">
              Current Plan
            </button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-duck-yellow to-duck-blue border-4 border-black rounded-2xl shadow-brutal-lg p-8 relative"
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-duck-orange border-3 border-black px-6 py-2 rounded-full font-bold text-white shadow-brutal-sm flex items-center gap-2">
                <Crown size={20} />
                MOST POPULAR
              </div>
            </div>

            <div className="text-center mb-6 mt-4">
              <h3 className="text-3xl font-display font-bold mb-2">Pro</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-black">
                  ${billingCycle === 'monthly' ? pricing.monthly.price : pricing.yearly.monthlyEquivalent}
                </span>
                <span className="text-xl text-slate-700">/month</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm font-mono text-slate-700">
                  Billed ${pricing.yearly.price}/year
                </p>
              )}
              <div className="inline-block bg-white/90 border-2 border-black px-3 py-1 rounded-full text-sm font-bold mt-2">
                🎁 7-day free trial
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {features.pro.map((feature, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-6 h-6 text-black flex-shrink-0 mt-0.5 bg-white rounded-full p-0.5" strokeWidth={3} />
                  <span className="font-mono text-sm font-medium text-black">
                    {feature.text}
                  </span>
                </motion.li>
              ))}
            </ul>

            <button className="w-full brutal-btn bg-black text-white border-3 border-black px-6 py-4 rounded-xl font-bold text-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
              Start Free Trial →
            </button>

            <p className="text-center text-xs font-mono text-slate-700 mt-4">
              Cancel anytime. No credit card required for trial.
            </p>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-600 font-mono text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-duck-green border-2 border-black rounded-full flex items-center justify-center">
                ✓
              </div>
              <span>No credit card for trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-duck-yellow border-2 border-black rounded-full flex items-center justify-center">
                ✓
              </div>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-duck-blue border-2 border-black rounded-full flex items-center justify-center">
                ✓
              </div>
              <span>10,000+ happy families</span>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-display font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! Cancel anytime from your dashboard. No questions asked, no hidden fees.'
              },
              {
                q: 'What happens after the free trial?',
                a: 'After 7 days, you\'ll be charged the monthly or yearly rate you selected. You can cancel before then at no cost.'
              },
              {
                q: 'How many children can I add?',
                a: 'You can create profiles for unlimited children with a Pro subscription.'
              },
              {
                q: 'Do I need special paper or printer?',
                a: 'Nope! Any standard home printer and regular paper work great. We also offer eco-mode for ink savings.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white border-3 border-black rounded-xl p-6 shadow-brutal-sm">
                <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                <p className="text-slate-600 font-mono text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Subscribe;
