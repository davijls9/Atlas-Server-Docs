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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg-deep)]/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[40px] w-full max-w-6xl h-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="px-10 py-6 border-b border-[var(--border-main)] bg-[var(--bg-sidebar)] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--primary)]/10 rounded-2xl border border-[var(--primary)]/20">
                            <Library className="w-6 h-6 text-[var(--primary)]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-bright)] uppercase tracking-tight">Sovereign Knowledge Base</h2>
                            <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-widest">Global Infrastructure Intelligence</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onFullDocumentation}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--bg-deep)] hover:bg-[var(--border-subtle)] text-[var(--primary)] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--border-main)] transition-all group"
                        >
                            <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Open Full Portal
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors hover:bg-[var(--border-subtle)] rounded-full"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-80 border-r border-[var(--border-main)] flex flex-col bg-[var(--bg-main)] shrink-0">
                        <div className="p-6 border-b border-[var(--border-main)]">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] group-focus-within:text-[var(--primary)] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Scan knowledge..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[var(--bg-deep)] border border-[var(--border-main)] rounded-xl py-2 pl-10 pr-4 text-xs text-[var(--text-main)] focus:border-[var(--primary)]/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-1">
                            {filteredPages.map(page => (
                                <button
                                    key={page.id}
                                    onClick={() => setActivePageId(page.id)}
                                    className={`w-full group px-4 py-4 rounded-2xl flex items-center justify-between transition-all ${activePageId === page.id
                                        ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)]'
                                        : 'text-[var(--text-dim)] hover:bg-[var(--border-subtle)]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden text-left">
                                        <FileText className={`w-4 h-4 shrink-0 ${activePageId === page.id ? 'text-[var(--primary)]' : 'text-[var(--text-dim)] opacity-50 group-hover:opacity-100'}`} />
                                        <span className={`text-[11px] font-bold truncate uppercase tracking-tight ${activePageId === page.id ? 'text-[var(--text-bright)]' : ''}`}>
                                            {page.title}
                                        </span>
                                    </div>
                                    <ChevronRight className={`w-3 h-3 transition-transform ${activePageId === page.id ? 'opacity-100' : 'opacity-0'}`} />
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="flex-1 bg-[var(--bg-deep)] p-10 overflow-hidden relative">
                        {activePage ? (
                            <DocViewer page={activePage} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <Search className="w-16 h-16 mb-4 text-[var(--text-dim)]" />
                                <p className="text-sm font-black uppercase tracking-widest text-[var(--text-dim)]">No Intelligence Discovered</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};
