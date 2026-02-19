import React, { useState } from 'react';
import { X, Search, FileText, Library, ChevronRight, BookOpen } from 'lucide-react';
import { DocViewer } from './DocViewer';
import type { DocPage } from '../types/documentation.types';

interface DocQuickModalProps {
    isOpen: boolean;
    onClose: () => void;
    pages: DocPage[];
    onFullDocumentation: () => void;
    currentTab?: string;
}

export const DocQuickModal: React.FC<DocQuickModalProps> = ({ isOpen, onClose, pages, onFullDocumentation, currentTab }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activePageId, setActivePageId] = useState<string | null>(pages[0]?.id || null);

    if (!isOpen) return null;

    const filteredPages = pages.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activePage = pages.find(p => p.id === activePageId || (p.relatedPageIds?.includes(currentTab || '') && !activePageId)) || pages[0];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0b0e14] border border-gray-800 rounded-[40px] w-full max-w-6xl h-full max-h-[85vh] flex flex-col shadow-[0_0_100px_rgba(37,99,235,0.2)] overflow-hidden">
                {/* Modal Header */}
                <div className="px-10 py-6 border-b border-gray-800 bg-[#161b22] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/10 rounded-2xl">
                            <Library className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Sovereign Knowledge Base</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Infrastructure Intelligence</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onFullDocumentation}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-700 transition-all group"
                        >
                            <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Open Full Portal
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-white transition-colors hover:bg-white/5 rounded-full"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-80 border-r border-gray-800 flex flex-col bg-[#0d1117] shrink-0">
                        <div className="p-6 border-b border-gray-800">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Scan knowledge..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#06080a] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-blue-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-1">
                            {filteredPages.map(page => (
                                <button
                                    key={page.id}
                                    onClick={() => setActivePageId(page.id)}
                                    className={`w-full group px-4 py-4 rounded-2xl flex items-center justify-between transition-all ${activePageId === page.id
                                        ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400'
                                        : 'text-gray-500 hover:bg-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden text-left">
                                        <FileText className={`w-4 h-4 shrink-0 ${activePageId === page.id ? 'text-blue-400' : 'text-gray-700 group-hover:text-gray-500'}`} />
                                        <span className={`text-[11px] font-bold truncate uppercase tracking-tight ${activePageId === page.id ? 'text-white' : ''}`}>
                                            {page.title}
                                        </span>
                                    </div>
                                    <ChevronRight className={`w-3 h-3 transition-transform ${activePageId === page.id ? 'opacity-100' : 'opacity-0'}`} />
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="flex-1 bg-[#06080a] p-10 overflow-hidden relative">
                        {activePage ? (
                            <DocViewer page={activePage} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <Search className="w-16 h-16 mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest">No Intelligence Discovered</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};
