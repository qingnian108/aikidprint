import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCategory } from '../../constants/pageTypes';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';

const CategoryPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const category = getCategory(categoryId || '');

    if (!category) {
        return <div className="p-8 text-center font-mono">Category not found</div>;
    }

    return (
        <div className="min-h-screen bg-paper py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Navigation Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/generator"
                        className="flex items-center gap-2 font-bold text-black hover:underline"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </Link>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <span className="font-mono text-slate-500 uppercase tracking-wider text-sm">
                        {category.title}
                    </span>
                </div>

                {/* Header */}
                <div className="mb-12 animate-fade-scale">
                    <h1 className="text-4xl md:text-5xl font-display font-black text-black mb-4">
                        Select a Template
                    </h1>
                    <p className="text-lg text-slate-600 font-mono">
                        Choose a worksheet type to customize and generate.
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.pageTypes.map((pageType, index) => {
                        // Define soft gradients for card backgrounds based on category
                        const bgGradients: Record<string, string> = {
                            literacy: 'from-amber-50 to-orange-100 border-amber-200',
                            math: 'from-emerald-50 to-teal-100 border-emerald-200',
                            logic: 'from-cyan-50 to-blue-100 border-cyan-200',
                            'fine-motor': 'from-purple-50 to-fuchsia-100 border-purple-200',
                            creativity: 'from-rose-50 to-pink-100 border-rose-200'
                        };
                        const cardStyle = bgGradients[category.id] || 'from-gray-50 to-gray-100 border-gray-200';

                        return (
                            <div
                                key={pageType.id}
                                className={`group bg-gradient-to-br ${cardStyle} border-2 rounded-3xl overflow-hidden shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all duration-300 animate-pop-in flex flex-col relative`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Preview Image Area - 竖版比例 */}
                                <div className="aspect-[3/4] relative overflow-hidden flex items-center justify-center p-4">
                                    {/* Decorative Pattern Background */}
                                    <div className="absolute inset-0 opacity-10"
                                        style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '12px 12px' }}>
                                    </div>

                                    {/* Image Container (Paper Look) */}
                                    <div className="relative w-full h-full shadow-sm group-hover:shadow-xl group-hover:scale-105 transition-all duration-500 rounded-xl overflow-hidden bg-white border-2 border-gray-200 transform rotate-1 group-hover:rotate-0">
                                        <img
                                            src={pageType.previewImage}
                                            alt={pageType.title}
                                            className="w-full h-full object-contain bg-white"
                                        />
                                    </div>

                                    {/* Floating Badge */}
                                    <div className="absolute top-4 right-4 bg-white border-2 border-black px-2 py-1 rounded-lg shadow-sm transform rotate-3 group-hover:rotate-0 transition-transform z-10">
                                        <Star size={14} className="text-duck-yellow fill-duck-yellow" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 pt-2 flex-1 flex flex-col relative z-10">
                                    <h3 className="text-2xl font-display font-black text-black mb-2 leading-tight">
                                        {pageType.title}
                                    </h3>
                                    <p className="text-black/70 font-mono text-sm mb-6 flex-1 leading-relaxed font-medium">
                                        {pageType.description}
                                    </p>

                                    <button
                                        onClick={() => navigate(`/generator/${category.id}/${pageType.id}`)}
                                        className={`w-full bg-white text-black border-2 border-black py-4 px-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-${category.color} hover:border-black active:translate-y-0.5 transition-all shadow-sm hover:shadow-brutal-sm uppercase tracking-wide text-sm group-hover:bg-${category.color}`}
                                    >
                                        Create Now
                                        <ArrowRight size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
