import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';

const SocialProof: React.FC = () => {
  const testimonials = [
    {
      image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=400&h=300&fit=crop',
      name: 'Emma & Lily',
      quote: 'My daughter loves seeing her name on every page!',
      rating: 5
    },
    {
      image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop',
      name: 'Marcus & Noah',
      quote: 'Finally, worksheets that keep him engaged for more than 5 minutes.',
      rating: 5
    },
    {
      image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&h=300&fit=crop',
      name: 'Sarah & twins',
      quote: 'The weekly packs save me hours of prep time!',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-duck-yellow/10 border-t-2 border-black relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-duck-pink rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-duck-blue rounded-full opacity-20 blur-2xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 font-mono text-sm font-bold uppercase mb-4 rounded-full">
            <Heart size={16} fill="currentColor" />
            Loved by Parents
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-black mb-4 uppercase tracking-tight">
            10,000+ Families Now Learn
            <br />
            <span className="text-duck-orange">With Personalized Weekly Packs</span>
          </h2>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, rotate: index % 2 === 0 ? -2 : 2 }}
              className="bg-white border-4 border-black rounded-2xl shadow-brutal-lg overflow-hidden cursor-default group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden border-b-4 border-black">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to placeholder
                    e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ffd60a' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%23000'%3E${testimonial.name}%3C/text%3E%3C/svg%3E`;
                  }}
                />
                <div className="absolute top-3 right-3 bg-white border-2 border-black rounded-full px-3 py-1 flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="#ff9f1c" stroke="#000" strokeWidth={1.5} />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-lg font-mono italic text-slate-700 mb-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t-2 border-slate-100">
                  <div className="w-10 h-10 bg-duck-green border-2 border-black rounded-full flex items-center justify-center text-xl">
                    👨‍👩‍👧
                  </div>
                  <div>
                    <div className="font-bold text-black">{testimonial.name}</div>
                    <div className="text-sm text-slate-500 font-mono">Verified Parent</div>
                  </div>
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
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-xl font-mono text-slate-600">
            Join thousands of happy families today! 🎉
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
