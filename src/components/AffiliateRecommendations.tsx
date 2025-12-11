import React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  rating: number;
  image: string;
  affiliateLink: string;
  badge?: string;
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'HP Instant Ink Subscription',
    description: 'Never run out of ink! Save up to 50% on printing costs.',
    price: '$0.99/mo',
    rating: 4.5,
    image: '🖨️',
    affiliateLink: '#',
    badge: 'Best Seller'
  },
  {
    id: '2',
    name: 'Dry Erase Sleeves (10 Pack)',
    description: 'Reusable worksheet protectors. Write, wipe, repeat!',
    price: '$14.99',
    rating: 5,
    image: '📝',
    affiliateLink: '#',
    badge: 'Recommended'
  },
  {
    id: '3',
    name: 'Triangular Grip Pencils',
    description: 'Ergonomic pencils perfect for little hands learning to write.',
    price: '$9.99',
    rating: 4.8,
    image: '✏️',
    affiliateLink: '#'
  },
  {
    id: '4',
    name: 'Premium Cardstock Paper',
    description: 'Thick, durable paper for coloring and crafts. 100 sheets.',
    price: '$19.99',
    rating: 4.7,
    image: '📄',
    affiliateLink: '#'
  },
  {
    id: '5',
    name: 'Reward Sticker Book',
    description: '1000+ motivational stickers to celebrate achievements.',
    price: '$12.99',
    rating: 4.9,
    image: '⭐',
    affiliateLink: '#'
  },
  {
    id: '6',
    name: 'Washable Markers Set',
    description: '24 vibrant colors, non-toxic and easy to clean.',
    price: '$16.99',
    rating: 4.6,
    image: '🖍️',
    affiliateLink: '#'
  }
];

const AffiliateRecommendations: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-duck-blue/10 to-duck-yellow/10 border-t-4 border-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-duck-yellow border-2 border-black px-4 py-2 rounded-full font-bold mb-4">
            🎁 Recommended for You
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-black mb-4">
            Complete Your
            <br />
            <span className="text-duck-orange">Learning Setup</span>
          </h2>
          <p className="text-xl text-slate-600 font-mono max-w-2xl mx-auto">
            Parents love these products to make the most of their worksheets
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border-4 border-black rounded-2xl shadow-brutal hover:shadow-brutal-lg hover:-translate-y-2 transition-all overflow-hidden group"
            >
              {/* Product Image/Icon */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-12 border-b-4 border-black relative">
                <div className="text-7xl text-center group-hover:scale-110 transition-transform">
                  {product.image}
                </div>
                {product.badge && (
                  <div className="absolute top-4 right-4 bg-duck-orange text-white border-2 border-black px-3 py-1 rounded-full text-xs font-bold">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-xl font-display font-bold mb-2">{product.name}</h3>
                <p className="text-sm text-slate-600 font-mono mb-4">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(product.rating) ? '#ff9f1c' : 'none'}
                        stroke={i < Math.floor(product.rating) ? '#ff9f1c' : '#cbd5e1'}
                        strokeWidth={2}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{product.rating}</span>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-display font-black text-duck-green">
                    {product.price}
                  </div>
                  <a
                    href={product.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brutal-btn bg-duck-blue text-black border-2 border-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm"
                  >
                    View Deal
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-500 font-mono">
            * As an Amazon Associate, we earn from qualifying purchases at no extra cost to you.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AffiliateRecommendations;
