import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../constants/pageTypes';
import { ArrowRight, Sparkles } from 'lucide-react';

const GeneratorHome: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-scale">
                    <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1 font-mono text-sm font-bold uppercase mb-4 rounded-full">
                        <Sparkles size={14} />
                        <span>AI Worksheet Generator</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-black text-black mb-6 uppercase tracking-tight">
                        Choose Your Subject
                    </h1>
                    <p className="text-xl text-slate-600 font-mono max-w-2xl mx-auto">
                        Select a category below to browse available worksheet templates.
                    </p>
                </div>

                {/* Categories Grid - 2x2 layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {CATEGORIES.map((category, index) => {
                        const Icon = category.icon;
                        // Define rich, vibrant gradients for each category
                        const gradients: Record<string, string> = {
                            literacy: 'from-amber-300 via-orange-300 to-yellow-400',
                            math: 'from-emerald-300 via-teal-300 to-green-400',
                            logic: 'from-cyan-300 via-blue-300 to-indigo-400',
                            creativity: 'from-rose-300 via-pink-300 to-fuchsia-300'
                        };
                        const gradient = gradients[category.id] || 'from-gray-200 to-gray-300';

                        return (
                            <div
                                key={category.id}
                                onClick={() => navigate(`/generator/${category.id}`)}
                                className="group cursor-pointer animate-pop-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`relative bg-gradient-to-br ${gradient} border-2 border-black rounded-3xl p-8 shadow-brutal hover:shadow-brutal-lg hover:-translate-y-2 transition-all duration-300 h-full flex flex-col overflow-hidden`}>

                                    {/* Decorative Background Elements */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-8 -mb-8 blur-xl"></div>

                                    <div className="absolute top-6 right-6 w-20 h-20 bg-white/30 rounded-full border-2 border-white/20"></div>
                                    <div className="absolute top-16 right-20 w-10 h-10 bg-white/40 rounded-full border border-white/30"></div>

                                    {/* Icon */}
                                    <div className="relative w-24 h-24 bg-white border-2 border-black rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 group-hover:scale-110 transition-transform shadow-brutal-sm">
                                        <Icon size={48} className="text-black" strokeWidth={2} />
                                    </div>

                                    {/* Content */}
                                    <div className="relative flex-1 flex flex-col z-10">
                                        <h2 className="text-4xl font-display font-black text-black mb-4 leading-tight tracking-tight">
                                            {category.title}
                                        </h2>
                                        <p className="text-black/80 font-mono text-base font-medium mb-8 flex-1 leading-relaxed">
                                            {category.description}
                                        </p>

                                        {/* Footer / CTA */}
                                        <div className="flex items-center justify-between pt-6 border-t-2 border-black/10 mt-auto">
                                            <div className="bg-white/50 px-3 py-1 rounded-lg border border-black/10">
                                                <span className="font-bold text-black text-sm uppercase tracking-wider">
                                                    {category.pageTypes.length} Templates
                                                </span>
                                            </div>
                                            <div className="w-12 h-12 bg-black text-white border-2 border-transparent rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black group-hover:border-black transition-all shadow-sm">
                                                <ArrowRight size={24} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GeneratorHome;
