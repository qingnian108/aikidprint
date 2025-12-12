import React, { useState } from 'react';
import { Package, Truck, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PODOptionProps {
  childName?: string;
  weekNumber?: number;
}

const PODOption: React.FC<PODOptionProps> = ({ childName = 'Your Child', weekNumber = 1 }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBinding, setSelectedBinding] = useState<'spiral' | 'stapled'>('spiral');
  const [quantity, setQuantity] = useState(1);

  const pricing = {
    spiral: 24.99,
    stapled: 19.99
  };

  const totalPrice = pricing[selectedBinding] * quantity;

  const handleOrder = () => {
    console.log('Ordering POD:', { childName, weekNumber, selectedBinding, quantity });
    alert('Order placed! (Demo only)');
    setShowModal(false);
  };

  return (
    <>
      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-duck-pink to-duck-orange border-4 border-black rounded-2xl shadow-brutal-lg p-8 text-center"
      >
        <div className="text-5xl mb-4">📦</div>
        <h3 className="text-3xl font-display font-black mb-3">
          Premium Printed Edition
        </h3>
        <p className="text-lg font-mono mb-6 max-w-2xl mx-auto">
          Don't have a printer? We'll print and ship a beautiful bound workbook directly to your door!
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6 text-left">
          {[
            { icon: '🎨', label: 'Full Color Printing', desc: 'Vibrant, professional quality' },
            { icon: '📚', label: 'Professionally Bound', desc: 'Spiral or stapled binding' },
            { icon: '🚚', label: 'Fast Shipping', desc: '3-5 business days' }
          ].map((feature, index) => (
            <div key={index} className="bg-white/90 border-2 border-black rounded-xl p-4">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="font-bold text-sm mb-1">{feature.label}</div>
              <div className="text-xs text-slate-600 font-mono">{feature.desc}</div>
            </div>
          ))}
        </div>

        <button
          disabled
          className="brutal-btn bg-slate-400 text-white border-3 border-slate-300 px-12 py-5 rounded-2xl font-bold text-xl cursor-not-allowed opacity-80"
        >
          🚧 Coming Soon
        </button>

        <p className="text-sm font-mono mt-4 text-slate-700">
          Print-on-demand service launching soon!
        </p>
      </motion.div>

      {/* Order Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-4 border-black rounded-2xl shadow-brutal-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-duck-pink to-duck-orange border-b-4 border-black p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-display font-black">Order Printed Workbook</h2>
                  <p className="font-mono text-sm">Week {weekNumber} - {childName}'s Pack</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-white border-2 border-black rounded-full p-2 hover:bg-slate-100"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Binding Options */}
                <div>
                  <label className="block text-lg font-bold mb-3">Binding Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedBinding('spiral')}
                      className={`p-6 border-3 border-black rounded-xl transition-all ${
                        selectedBinding === 'spiral'
                          ? 'bg-duck-blue shadow-brutal scale-105'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">🌀</div>
                      <div className="font-bold text-lg mb-1">Spiral Bound</div>
                      <div className="text-sm text-slate-600 font-mono mb-2">
                        Lays flat, easy to use
                      </div>
                      <div className="text-2xl font-display font-black text-duck-green">
                        ${pricing.spiral}
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedBinding('stapled')}
                      className={`p-6 border-3 border-black rounded-xl transition-all ${
                        selectedBinding === 'stapled'
                          ? 'bg-duck-blue shadow-brutal scale-105'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">📎</div>
                      <div className="font-bold text-lg mb-1">Stapled</div>
                      <div className="text-sm text-slate-600 font-mono mb-2">
                        Simple & affordable
                      </div>
                      <div className="text-2xl font-display font-black text-duck-green">
                        ${pricing.stapled}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-lg font-bold mb-3">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-white border-3 border-black rounded-xl px-6 py-3 font-bold text-2xl hover:bg-slate-50"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <div className="text-4xl font-display font-black">{quantity}</div>
                      <div className="text-sm font-mono text-slate-600">workbooks</div>
                    </div>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="bg-white border-3 border-black rounded-xl px-6 py-3 font-bold text-2xl hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* What's Included */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Package size={20} />
                    What's Included
                  </h3>
                  <ul className="space-y-2 text-sm font-mono">
                    {[
                      '15-20 full-color pages',
                      'Personalized cover with child\'s name',
                      'Professional binding',
                      'Premium 80lb paper',
                      'Protective clear cover',
                      'Shipped in protective packaging'
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check size={16} className="text-duck-green flex-shrink-0" strokeWidth={3} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Shipping Info */}
                <div className="bg-duck-yellow/20 border-2 border-duck-yellow rounded-xl p-4 flex items-start gap-3">
                  <Truck className="flex-shrink-0 mt-0.5" size={24} />
                  <div className="text-sm font-mono">
                    <strong>Free shipping on orders over $50!</strong>
                    <br />
                    Estimated delivery: 3-5 business days
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white border-3 border-black rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                  <div className="space-y-2 text-sm font-mono mb-4">
                    <div className="flex justify-between">
                      <span>Workbook ({selectedBinding}):</span>
                      <span>${pricing[selectedBinding].toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span>× {quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{totalPrice >= 50 ? 'FREE' : '$4.99'}</span>
                    </div>
                    <div className="border-t-2 border-slate-200 pt-2 mt-2"></div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-duck-green">
                        ${(totalPrice + (totalPrice >= 50 ? 0 : 4.99)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleOrder}
                    className="w-full brutal-btn bg-duck-green text-black border-3 border-black px-6 py-4 rounded-xl font-bold text-lg"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PODOption;
