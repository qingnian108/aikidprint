import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPageType, ConfigOption } from '../../constants/pageTypes';
import { generateWorksheet } from '../../services/api';
import { ArrowLeft, Sparkles, Download, RefreshCw, Printer } from 'lucide-react';
import ErrorModal from '../../components/ErrorModal';
import { useAuth } from '../../contexts/AuthContext';
import { recordDownload, getPrintSettings, getDefaultPrintSettings } from '../../services/firestoreService';

const GeneratorDetail: React.FC = () => {
    const { categoryId, typeId } = useParams<{ categoryId: string; typeId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const pageType = getPageType(categoryId || '', typeId || '');

    // State for form values
    const [config, setConfig] = useState<Record<string, any>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    // Initialize default values
    useEffect(() => {
        if (pageType) {
            const defaults: Record<string, any> = {};
            pageType.options.forEach(opt => {
                defaults[opt.id] = opt.defaultValue;
            });
            setConfig(defaults);
        }
    }, [pageType]);

    if (!pageType) {
        return <div className="p-8 text-center font-mono">Template not found</div>;
    }

    const handleInputChange = (id: string, value: any) => {
        setConfig(prev => ({ ...prev, [id]: value }));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateWorksheet({
                category: categoryId!,
                type: typeId!,
                config
            });

            console.log('Full result:', result);
            console.log('result.data:', result.data);
            console.log('result.imageUrls:', result.imageUrls);
            console.log('result.imageUrl:', result.imageUrl);

            if (result.success) {
                const images = result.imageUrls || (result.imageUrl ? [result.imageUrl] : []);
                console.log('Setting images:', images);
                setGeneratedImages(images);
            } else {
                setErrorModal({
                    open: true,
                    message: ''
                });
            }
        } catch (error) {
            console.error('Generation failed', error);
            setErrorModal({
                open: true,
                message: ''
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // 涓嬭浇PDF锛堝椤靛悎骞讹級
    const handleDownloadPDF = async () => {
        if (generatedImages.length === 0) return;

        try {
            // 获取用户的打印设置
            let printSettings = getDefaultPrintSettings();
            if (currentUser) {
                const userSettings = await getPrintSettings(currentUser.uid);
                if (userSettings) {
                    printSettings = userSettings;
                }
            }

            // 根据纸张大小设置尺寸
            const isLetter = printSettings.paperSize === 'letter';
            const pageWidth = isLetter ? 215.9 : 210;
            const pageHeight = isLetter ? 279.4 : 297;
            
            // Binder Ready: 左侧留出 25mm 用于打孔
            const binderMargin = printSettings.binderReady ? 25 : 0;
            const contentWidth = pageWidth - binderMargin;

            const { jsPDF } = await import('jspdf');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: printSettings.paperSize === 'letter' ? 'letter' : 'a4'
            });

            for (let i = 0; i < generatedImages.length; i++) {
                if (i > 0) {
                    pdf.addPage();
                }

                const img = new Image();
                img.crossOrigin = 'anonymous';

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = generatedImages[i];
                });

                // Letter 图片适配不同纸张：
                // - Letter 纸：以宽度为准，完美适配
                // - A4 纸：以高度为准，左右均匀裁剪
                const imgRatio = img.width / img.height;
                const isA4 = !isLetter;
                let imgWidth: number, imgHeight: number, x: number, y: number;
                
                if (isA4) {
                  imgHeight = pageHeight;
                  imgWidth = pageHeight * imgRatio;
                  x = binderMargin + (contentWidth - imgWidth) / 2;
                  y = 0;
                } else {
                  imgWidth = contentWidth;
                  imgHeight = contentWidth / imgRatio;
                  x = binderMargin;
                  y = 0;
                }

                pdf.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
            }

            pdf.save(`worksheet-${Date.now()}.pdf`);
            
            // 记录下载
            if (currentUser) {
                try {
                    console.log('📝 Recording PDF download for user:', currentUser.uid);
                    await recordDownload(
                        currentUser.uid, 
                        pageType?.title || 'worksheet', 
                        config.theme || config.letter || 'default', 
                        generatedImages.length,
                        undefined,
                        { category: categoryId!, type: typeId!, config }
                    );
                    console.log('✅ PDF download recorded successfully');
                    window.dispatchEvent(new Event('downloadComplete'));
                } catch (e) {
                    console.error('❌ Failed to record PDF download:', e);
                }
            } else {
                console.log('⚠️ No user logged in, skipping download record');
            }
        } catch (error) {
            console.error('PDF generation failed:', error);
            setErrorModal({ open: true, message: 'PDF generation failed. Please try again.' });
        }
    };

    // 涓嬭浇鍥剧墖锛堝崟寮犳垨ZIP锛?
    const handleDownloadImages = async () => {
        if (generatedImages.length === 0) return;

        try {
            if (generatedImages.length === 1) {
                // 鍗曞紶鍥剧墖鐩存帴涓嬭浇
                const response = await fetch(generatedImages[0]);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `worksheet-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                // 记录下载
                if (currentUser) {
                    try {
                        console.log('📝 Recording PNG download for user:', currentUser.uid);
                        await recordDownload(
                            currentUser.uid, 
                            pageType?.title || 'worksheet', 
                            config.theme || config.letter || 'default', 
                            1,
                            undefined,
                            { category: categoryId!, type: typeId!, config }
                        );
                        console.log('✅ PNG download recorded successfully');
                        window.dispatchEvent(new Event('downloadComplete'));
                    } catch (e) {
                        console.error('❌ Failed to record PNG download:', e);
                    }
                } else {
                    console.log('⚠️ No user logged in, skipping download record');
                }
            } else {
                // 多张图片打包成ZIP
                const JSZip = (await import('jszip')).default;
                const zip = new JSZip();

                for (let i = 0; i < generatedImages.length; i++) {
                    const response = await fetch(generatedImages[i]);
                    const blob = await response.blob();
                    zip.file(`worksheet-${i + 1}.png`, blob);
                }

                const content = await zip.generateAsync({ type: 'blob' });
                const url = window.URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = `worksheets-${Date.now()}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                // 记录下载
                if (currentUser) {
                    try {
                        console.log('📝 Recording ZIP download for user:', currentUser.uid);
                        await recordDownload(
                            currentUser.uid, 
                            pageType?.title || 'worksheet', 
                            config.theme || config.letter || 'default', 
                            generatedImages.length,
                            undefined,
                            { category: categoryId!, type: typeId!, config }
                        );
                        console.log('✅ ZIP download recorded successfully');
                        window.dispatchEvent(new Event('downloadComplete'));
                    } catch (e) {
                        console.error('❌ Failed to record ZIP download:', e);
                    }
                } else {
                    console.log('⚠️ No user logged in, skipping download record');
                }
            }
        } catch (error) {
            console.error('Download failed:', error);
            setErrorModal({ open: true, message: 'Download failed. Please try again.' });
        }
    };

    // Dynamic Form Renderer
    const renderInput = (option: ConfigOption) => {
        switch (option.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={config[option.id] || ''}
                        onChange={(e) => handleInputChange(option.id, e.target.value)}
                        placeholder={option.placeholder}
                        className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-duck-yellow transition-all"
                    />
                );
            case 'select':
                return (
                    <div className="relative">
                        <select
                            value={config[option.id] || ''}
                            onChange={(e) => handleInputChange(option.id, e.target.value)}
                            className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold text-black bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-duck-yellow transition-all cursor-pointer"
                        >
                            {option.options?.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={config[option.id] ?? option.defaultValue ?? 1}
                        onChange={(e) => handleInputChange(option.id, parseInt(e.target.value) || option.min || 1)}
                        min={option.min ?? 1}
                        max={option.max ?? 10}
                        step={option.step ?? 1}
                        className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-duck-yellow transition-all"
                    />
                );
            case 'multiselect':
                const selectedValues = config[option.id] || [];
                const toggleValue = (value: string) => {
                    const newValues = selectedValues.includes(value)
                        ? selectedValues.filter((v: string) => v !== value)
                        : [...selectedValues, value];
                    handleInputChange(option.id, newValues);
                };

                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-6 gap-2">
                            {option.options?.map(opt => {
                                const isSelected = selectedValues.includes(opt.value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => toggleValue(opt.value as string)}
                                        className={`
                                            h-12 border-2 border-black rounded-lg font-bold text-lg
                                            transition-all hover:-translate-y-0.5 hover:shadow-brutal
                                            ${isSelected
                                                ? 'bg-duck-green text-white'
                                                : 'bg-white text-black hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="text-sm font-mono text-slate-600">
                            {selectedValues.length > 0
                                ? `Selected: ${selectedValues.join(', ')}`
                                : 'Click letters to select'}
                        </div>
                    </div>
                );
            case 'toggle':
                return (
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={config[option.id] || false}
                                onChange={(e) => handleInputChange(option.id, e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-14 h-8 border-2 border-black rounded-full transition-colors ${config[option.id] ? 'bg-duck-green' : 'bg-slate-200'}`}></div>
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white border-2 border-black rounded-full transition-transform ${config[option.id] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="font-bold text-black group-hover:text-slate-700 select-none">
                            {config[option.id] ? 'Yes' : 'No'}
                        </span>
                    </label>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="min-h-screen bg-paper py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                {/* Navigation */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to={`/generator/${categoryId}`}
                        className="flex items-center gap-2 font-bold text-black hover:underline"
                    >
                        <ArrowLeft size={20} />
                        Back to Templates
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Column: Configuration */}
                    <div className="lg:col-span-4 space-y-8 animate-slide-in-left">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-black text-black mb-2">
                                {pageType.title}
                            </h1>
                            <p className="text-slate-600 font-mono text-sm">
                                {pageType.description}
                            </p>
                        </div>

                        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-brutal">
                            <h2 className="font-display font-bold text-xl text-black mb-6">
                                Settings
                            </h2>
                            <div className="space-y-6">
                                {pageType.options.map(option => (
                                    <div key={option.id}>
                                        <label className="block font-bold text-sm text-slate-700 mb-2 uppercase tracking-wide">
                                            {option.label}
                                        </label>
                                        {renderInput(option)}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || (config.letters && config.letters.length === 0)}
                                className="w-full mt-8 brutal-btn bg-black text-white border-2 border-transparent px-8 py-4 rounded-xl font-display font-bold text-xl shadow-lg hover:bg-slate-800 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isGenerating ? (
                                    <>
                                        <Sparkles className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        {config.letters && config.letters.length > 0
                                            ? `Generate ${config.letters.length} Worksheet${config.letters.length > 1 ? 's' : ''}`
                                            : (config.pageCount && Number(config.pageCount) > 1)
                                                ? `Generate ${config.pageCount} Worksheets`
                                                : 'Generate Worksheet'
                                        }
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="lg:col-span-8 animate-slide-in-right">
                        <div className="bg-white border-2 border-black rounded-xl p-2 shadow-brutal-lg min-h-[600px] flex flex-col">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between p-4 border-b-2 border-slate-100 mb-2">
                                <div className="font-mono text-xs font-bold text-slate-400 uppercase">
                                    Preview Mode {generatedImages.length > 0 && `(${generatedImages.length} images)`}
                                </div>
                                {generatedImages.length > 0 && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDownloadPDF}
                                            className="flex items-center gap-2 px-4 py-2 bg-duck-pink border-2 border-black rounded-lg font-bold text-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all"
                                            title="Download as PDF"
                                        >
                                            <Printer size={18} />
                                            <span>PDF</span>
                                        </button>
                                        <button
                                            onClick={handleDownloadImages}
                                            className="flex items-center gap-2 px-4 py-2 bg-duck-blue border-2 border-black rounded-lg font-bold text-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all"
                                            title={generatedImages.length > 1 ? "Download as ZIP" : "Download Image"}
                                        >
                                            <Download size={18} />
                                            <span>{generatedImages.length > 1 ? 'ZIP' : 'PNG'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Image Area */}
                            <div className="flex-1 bg-slate-50 rounded-lg overflow-hidden relative flex items-center justify-center p-4">
                                {isGenerating ? (
                                    <div className="text-center">
                                        <div className="w-16 h-16 border-4 border-black border-t-duck-yellow rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="font-mono font-bold text-slate-500 animate-pulse">Creating Magic...</p>
                                    </div>
                                ) : generatedImages.length > 0 ? (
                                    <div className="w-full space-y-4">
                                        {generatedImages.map((img, idx) => (
                                            <div key={idx} className="border-2 border-black rounded-lg overflow-hidden bg-white">
                                                <img
                                                    src={img}
                                                    alt={`Worksheet ${idx + 1}`}
                                                    className="w-full object-contain"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <img
                                        src={pageType.previewImage}
                                        alt="Worksheet Preview"
                                        className="max-w-full max-h-full object-contain shadow-sm"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
            <ErrorModal
                isOpen={errorModal.open}
                title="Generation failed"
                message={errorModal.message}
                onClose={() => setErrorModal({ open: false, message: '' })}
            />
        </>
    );
};

export default GeneratorDetail;











