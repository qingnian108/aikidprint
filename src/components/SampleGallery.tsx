import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Palette, Hash, Star, Shapes, Award } from 'lucide-react';

const SampleGallery: React.FC = () => {
  const navigate = useNavigate();
  
  const samples = [
    {
      title: 'Match Letters',
      icon: Shapes,
      color: 'bg-duck-green',
      description: 'Connect uppercase and lowercase',
      previewImage: '/previews/match-letters.png',
      categoryId: 'literacy',
      pageTypeId: 'match-letters'
    },
    {
      title: 'CVC Words',
      icon: FileText,
      color: 'bg-duck-yellow',
      description: 'Build simple three-letter words',
      previewImage: '/previews/cvc-words.png',
      categoryId: 'literacy',
      pageTypeId: 'cvc-words'
    },
    {
      title: 'Number Tracing',
      icon: Hash,
      color: 'bg-duck-pink',
      description: 'Practice writing numbers 1-10',
      previewImage: '/previews/number-tracing.png',
      categoryId: 'math',
      pageTypeId: 'number-tracing'
    },
    {
      title: 'Picture Math',
      icon: Hash,
      color: 'bg-duck-orange',
      description: 'Count and add with illustrations',
      previewImage: '/previews/picture-math.png',
      categoryId: 'math',
      pageTypeId: 'picture-math'
    },
    {
      title: 'Symmetry Drawing',
      icon: Palette,
      color: 'bg-duck-blue',
      description: 'Complete the mirror image',
      previewImage: '/previews/symmetry.png',
      categoryId: 'art',
      pageTypeId: 'symmetry'
    }
  ];

  return (
    <section className="py-20 bg-white border-t-2 border-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-black text-white px-4 py-1 font-mono text-sm font-bold uppercase mb-4 rounded-full">
            Sample Pages
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-black mb-4 uppercase tracking-tight">
            Beautiful, Print-Ready
            <br />
            <span className="text-duck-orange">Worksheets</span>
          </h2>
          <p className="text-slate-600 font-mono text-lg max-w-2xl mx-auto">
            Every page is designed to spark joy and learning. No more boring worksheets!
          </p>
        </motion.div>

        {/* Sample Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {samples.map((sample, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => {
                navigate(`/generator/${sample.categoryId}/${sample.pageTypeId}`);
                window.scrollTo(0, 0);
              }}
              className="bg-white border-4 border-black rounded-2xl shadow-brutal overflow-hidden cursor-pointer group"
            >
              {/* Preview Image - Taller ratio like mobile screen */}
              <div className="relative h-96 bg-paper border-b-4 border-black overflow-hidden flex items-center justify-center p-4">
                <img 
                  src={sample.previewImage}
                  alt={sample.title}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect fill='%23fcfbf7' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%23000'%3E${sample.title}%3C/text%3E%3C/svg%3E`;
                  }}
                />
                
                {/* Icon Badge */}
                <div className={`absolute top-4 right-4 ${sample.color} border-2 border-black rounded-xl p-3 shadow-brutal-sm`}>
                  <sample.icon size={24} strokeWidth={2.5} />
                </div>
              </div>

              {/* Content - Title and Description in Green Box */}
              <div className={`p-6 ${sample.color} border-t-4 border-black text-center`}>
                <h3 className="text-2xl font-display font-bold text-black mb-2">
                  {sample.title}
                </h3>
                <p className="text-black font-mono text-sm">
                  {sample.description}
                </p>
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
          className="text-center mt-16"
        >
          <p className="text-xl font-mono text-slate-700 mb-6">
            Want to see more? Generate your first page now! 👇
          </p>
        </motion.div>
      </div>
    </section>
  );
};


export default SampleGallery;
