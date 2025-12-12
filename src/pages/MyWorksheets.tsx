import React, { useState, useEffect } from 'react';
import { Download, Printer, Trash2, RefreshCw, Trash } from 'lucide-react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { recordDownload } from '../services/firestoreService';
import { API_BASE_URL } from '../config/api';

interface WorksheetHistory {
    id: string;
    userId: string;
    categoryId: string;
    categoryName: string;
    pageTypeId: string;
    pageTypeName: string;
    imageUrl: string;
    config: any;
    createdAt: string;
}

const MyWorksheets: React.FC = () => {
    const { currentUser } = useAuth();
    const [history, setHistory] = useState<WorksheetHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<WorksheetHistory | null>(null);
    const [clearing, setClearing] = useState(false);

    // Load history
    const loadHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/worksheets/history?userId=guest`);
            const result = await response.json();
            if (result.success) {
                setHistory(result.data);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    // 下载图片
    const handleDownloadImage = async (item: WorksheetHistory) => {
        setDownloading(item.id);
        try {
            const response = await fetch(item.imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${item.pageTypeName}-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // 记录下载
            if (currentUser) {
                try {
                    await recordDownload(currentUser.uid, item.pageTypeName, item.categoryId, 1);
                    window.dispatchEvent(new Event('downloadComplete'));
                } catch (e) {
                    console.error('Failed to record download:', e);
                }
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed');
        } finally {
            setDownloading(null);
        }
    };

    // 下载PDF
    const handleDownloadPDF = async (item: WorksheetHistory) => {
        setDownloading(item.id);
        try {
            const { jsPDF } = await import('jspdf');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = item.imageUrl;
            });

            const pageWidth = 210;
            const imgWidth = pageWidth;
            const imgHeight = (img.height * pageWidth) / img.width;

            pdf.addImage(img, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${item.pageTypeName}-${Date.now()}.pdf`);
            
            // 记录下载
            if (currentUser) {
                try {
                    await recordDownload(currentUser.uid, item.pageTypeName, item.categoryId, 1);
                    window.dispatchEvent(new Event('downloadComplete'));
                } catch (e) {
                    console.error('Failed to record download:', e);
                }
            }
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('PDF generation failed');
        } finally {
            setDownloading(null);
        }
    };

    // 打开删除确认弹窗
    const handleDeleteClick = (item: WorksheetHistory) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    // Confirm delete
    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/worksheets/history/${itemToDelete.id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                setHistory(history.filter(item => item.id !== itemToDelete.id));
                setDeleteModalOpen(false);
                setItemToDelete(null);
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Delete failed');
        }
    };

    // 取消删除
    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setItemToDelete(null);
    };

    // 一键清空所有历史
    const handleClearAll = async () => {
        if (history.length === 0 || clearing) return;
        setItemToDelete({ id: 'bulk', userId: '', categoryId: '', categoryName: '', pageTypeId: '', pageTypeName: 'all worksheets', imageUrl: '', config: {}, createdAt: '' });
        setDeleteModalOpen(true);
    };

    // 分类颜色
    const getCategoryColor = (categoryId: string) => {
        const colors: Record<string, string> = {
            'literacy': 'bg-duck-green',
            'math': 'bg-duck-blue',
            'art': 'bg-duck-orange'
        };
        return colors[categoryId] || 'bg-slate-200';
    };

    // 格式化时间
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-paper py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-black mb-2">
                            My Worksheets
                        </h1>
                        <p className="text-slate-600 font-mono text-sm">
                            Your recently generated worksheets (max 20)
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadHistory}
                            disabled={loading}
                            className="brutal-btn bg-white border-2 border-black px-4 py-2 rounded-lg font-bold hover:shadow-brutal hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={handleClearAll}
                            disabled={history.length === 0 || clearing}
                            className="brutal-btn bg-white border-2 border-black px-4 py-2 rounded-lg font-bold hover:shadow-brutal hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            title="Clear All"
                        >
                            <Trash size={20} className={clearing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-black border-t-duck-yellow rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-mono font-bold text-slate-500">Loading...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && history.length === 0 && (
                    <div className="text-center py-12 bg-white border-2 border-black rounded-xl shadow-brutal">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-2xl font-bold mb-2">No worksheets yet</h3>
                        <p className="text-slate-600 mb-6">Start creating your first worksheet!</p>
                        <a
                            href="/#/generator"
                            className="brutal-btn bg-duck-yellow border-2 border-black px-6 py-3 rounded-lg font-bold inline-block hover:shadow-brutal hover:-translate-y-0.5 transition-all"
                        >
                            Create Worksheet
                        </a>
                    </div>
                )}

                {/* Grid */}
                {!loading && history.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white border-2 border-black rounded-xl shadow-brutal overflow-hidden hover:shadow-brutal-lg hover:-translate-y-1 transition-all"
                            >
                                {/* Preview Image */}
                                <div className="relative aspect-[3/4] bg-slate-100">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.pageTypeName}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Category Badge */}
                                    <div className={`absolute top-2 left-2 ${getCategoryColor(item.categoryId)} border-2 border-black px-3 py-1 rounded-lg font-bold text-xs`}>
                                        {item.categoryName}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1 truncate">
                                        {item.pageTypeName}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono mb-3">
                                        {formatDate(item.createdAt)}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDownloadImage(item)}
                                            disabled={downloading === item.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-duck-blue border-2 border-black rounded-lg font-bold text-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                            title="Download PNG"
                                        >
                                            <Download size={16} />
                                            PNG
                                        </button>
                                        <button
                                            onClick={() => handleDownloadPDF(item)}
                                            disabled={downloading === item.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-duck-pink border-2 border-black rounded-lg font-bold text-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                            title="Download PDF"
                                        >
                                            <Printer size={16} />
                                            PDF
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(item)}
                                            className="px-3 py-2 bg-white border-2 border-black rounded-lg font-bold hover:bg-red-50 hover:shadow-brutal hover:-translate-y-0.5 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <DeleteConfirmModal
                    isOpen={deleteModalOpen}
                    onConfirm={() => {
                        if (itemToDelete?.id === 'bulk') {
                            (async () => {
                                if (history.length === 0 || clearing) return;
                                setClearing(true);
                                try {
                                    const ids = history.map(h => h.id);
                                    await Promise.all(
                                        ids.map(id =>
                                            fetch(`${API_BASE_URL}/api/worksheets/history/${id}`, { method: 'DELETE' })
                                        )
                                    );
                                    setHistory([]);
                                } catch (error) {
                                    console.error('Clear all failed:', error);
                                    alert('Clear all failed. Please try again.');
                                } finally {
                                    setClearing(false);
                                    setDeleteModalOpen(false);
                                    setItemToDelete(null);
                                }
                            })();
                        } else {
                            handleDeleteConfirm();
                        }
                    }}
                    onCancel={handleDeleteCancel}
                    title={itemToDelete?.id === 'bulk' ? 'Clear All Worksheets?' : 'Delete Worksheet?'}
                    message={
                        itemToDelete
                            ? itemToDelete.id === 'bulk'
                                ? 'Are you sure you want to delete ALL worksheets? This action cannot be undone.'
                                : `Are you sure you want to delete "${itemToDelete.pageTypeName}"? This action cannot be undone.`
                            : ''
                    }
                    confirmLabel={itemToDelete?.id === 'bulk' ? 'Clear All' : 'Delete'}
                />
            </div>
        </div>
    );
};

export default MyWorksheets;
