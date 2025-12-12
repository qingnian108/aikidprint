import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Palette, Hash, Star, Shapes, Award } from 'lucide-react';

const SampleGallery: React.FC = () => {
  const navigate = useNavigate();
  
  const samples = [
    {
      title: 'Uppercase Letter Tracing',
      icon: FileText,
      color: 'bg-duck-yellow',
      description: 'Practice writing uppercase letters',
      previewImage: '/previews/uppercase-tracing.png',
      categoryId: 'literacy',
      pageTypeId: 'uppercase-tracing'
    },
    {
      title: 'Number Tracing',
      icon: Hash,
      color: 'bg-duck-green',
      description: 'Trace numbers 0-9 to build skills',
      previewImage: '/previews/number-tracing.png',
      categoryId: 'math',
      pageTypeId: 'number-tracing'
    },
    {
      title: 'Number Path',
      icon: Hash,
      color: 'bg-purple-300',
      description: 'Connect numbers in order',
      previewImage: '/previews/number-path.png',
      categoryId: 'math',
      pageTypeId: 'number-path'
    },
    {
      title: 'Maze',
      icon: Shapes,
      color: 'bg-duck-blue',
      description: 'Find the path through the maze',
      previewImage: '/previews/maze.png',
      categoryId: 'logic',
      pageTypeId: 'maze'
    },
    {
      title: 'Pattern Compare',
      icon: Shapes,
      color: 'bg-duck-orange',
      description: 'Spot and compare patterns',
      previewImage: '/previews/pattern-compare.png',
      categoryId: 'logic',
      pageTypeId: 'pattern-compare'
    },
    {
      title: 'Coloring Page',
      icon: Palette,
      color: 'bg-rose-300',
      description: 'Fun themed coloring pages',
      previewImage: '/previews/coloring-page.png',
      categoryId: 'creativity',
      pageTypeId: 'coloring-page'
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

        {/* Sample Grid - 6 items in 2 rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden cursor-pointer group transition-shadow duration-300"
            >
              {/* Preview Image - Paper style with shadow */}
              <div className={`relative h-96 ${sample.color} bg-opacity-30 overflow-hidden flex items-center justify-center p-6`}>
                {/* Paper container with shadow */}
                <div className="relative bg-white rounded-lg shadow-[4px_4px_12px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden group-hover:shadow-[6px_6px_16px_rgba(0,0,0,0.2)] transition-shadow duration-300">
                  <img 
                    src={sample.previewImage}
                    alt={sample.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    style={{ maxHeight: '340px' }}
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect fill='%23fcfbf7' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%23000'%3E${sample.title}%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                </div>
                
                {/* Icon Badge */}
                <div className={`absolute top-4 right-4 ${sample.color} border-2 border-black rounded-xl p-3 shadow-brutal-sm`}>
                  <sample.icon size={24} strokeWidth={2.5} />
                </div>
              </div>

              {/* Content - Title and Description */}
              <div className={`p-5 ${sample.color} text-center`}>
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
