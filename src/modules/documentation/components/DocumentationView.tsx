import React, { useState } from 'react';
import { Book, Plus, FileText, Search, Edit3, Trash2, Library, ChevronRight } from 'lucide-react';
import { DocEditor } from './DocEditor';
import { DocViewer } from './DocViewer';
import type { DocPage } from '../types/documentation.types';

interface DocumentationViewProps {
    pages: DocPage[];
    onSavePage: (page: DocPage) => void;
    onDeletePage: (id: string) => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({ pages, onSavePage, onDeletePage }) => {
    const [activePageId, setActivePageId] = useState<string>(pages[0]?.id || 'welcome');
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const activePage = pages.find(p => p.id === activePageId) || pages[0];

    const filteredPages = pages.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleCreatePage = () => {
        const newId = `doc_${Date.now()}`;
        const newPage: DocPage = {
            id: newId,
            title: 'New Protocol',
            content: '',
            lastModified: new Date().toISOString(),
            tags: [],
            relatedNodeIds: []
        };
        onSavePage(newPage);
        setActivePageId(newId);
        setIsEditing(true);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this intelligence protocol?')) {
            onDeletePage(id);
            if (activePageId === id) {
                setActivePageId(pages[0]?.id || '');
            }
        }
    };

    return (
        <div className="h-full w-full flex bg-[var(--bg-main)] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-96 border-r border-[var(--border-main)] flex flex-col bg-[var(--bg-sidebar)] shrink-0 shadow-2xl z-10">
                <div className="p-8 border-b border-[var(--border-main)] bg-[var(--bg-card)]/50 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-[var(--primary)]/10 rounded-2xl shadow-inner">
                            <Library className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div>
                            <h2 className="font-black text-[var(--text-bright)] text-sm uppercase tracking-[0.2em] leading-none">Knowledge Core</h2>
                            <p className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-widest mt-1.5 opacity-60">Sovereign Protocol Lib</p>
                        </div>
                    </div>

                    <div className="relative group mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] group-focus-within:text-[var(--primary)] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search protocols..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl py-3.5 pl-12 pr-5 text-xs text-[var(--text-bright)] focus:border-[var(--primary)]/50 focus:bg-[var(--bg-card)] outline-none transition-all placeholder:text-[var(--text-dim)]/30 font-bold shadow-inner"
                        />
                    </div>

                    <button
                        onClick={handleCreatePage}
                        className="w-full flex items-center justify-center gap-2.5 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary-glow)] transition-all active:scale-95 group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        Initialize Protocol
                    </button>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-2 bg-[var(--bg-sidebar)]/30">
                    {filteredPages.map(page => (
                        <div
                            key={page.id}
                            onClick={() => {
                                setActivePageId(page.id);
                                setIsEditing(false);
                            }}
                            className={`w-full group px-5 py-5 rounded-[2rem] flex items-center justify-between transition-all border cursor-pointer relative overflow-hidden ${activePageId === page.id
                                ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)] shadow-lg'
                                : 'text-[var(--text-dim)] border-transparent hover:bg-[var(--bg-card)] hover:border-[var(--border-main)]'
                                }`}
                        >
                            {activePageId === page.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--primary)] shadow-[0_0_15px_var(--primary)]"></div>
                            )}
                            <div className="flex items-center gap-4 overflow-hidden text-left pl-1">
                                <div className={`p-2 rounded-xl transition-colors ${activePageId === page.id ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-[var(--bg-main)] text-[var(--text-dim)] group-hover:text-[var(--text-main)]'}`}>
                                    <FileText className="w-4 h-4 shrink-0" />
                                </div>
                                <div className="min-w-0">
                                    <span className={`text-[12px] font-black truncate block uppercase tracking-tight leading-none ${activePageId === page.id ? 'text-[var(--text-bright)]' : ''}`}>
                                        {page.title}
                                    </span>
                                    <span className="text-[8px] font-bold opacity-50 block truncate uppercase tracking-widest mt-1.5">
                                        Last Sync: {new Date(page.lastModified).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                <button
                                    onClick={(e) => handleDelete(page.id, e)}
                                    className="p-2 hover:bg-[var(--status-error)]/10 hover:text-[var(--status-error)] rounded-xl transition-colors"
                                    title="Purge Protocol"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${activePageId === page.id ? 'text-[var(--primary)]' : 'text-[var(--text-dim)]'}`} />
                            </div>
                        </div>
                    ))}

                    {filteredPages.length === 0 && (
                        <div className="p-8 text-center opacity-30">
                            <Search className="w-8 h-8 mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Matches</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[var(--border-main)] bg-[var(--bg-main)]/50 backdrop-blur-md px-10">
                    <div className="flex items-center justify-between text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em]">
                        <span className="opacity-50">Silo Capacity</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[var(--primary)]">{pages.length}</span>
                            <span className="opacity-30">/</span>
                            <span className="opacity-30">∞</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative bg-[var(--bg-main)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary)_0%,transparent_25%)] opacity-5 pointer-events-none"></div>

                {activePage ? (
                    <div className="flex-1 flex flex-col p-10 relative overflow-hidden z-10">
                        <div className="flex justify-end mb-8 shrink-0 h-12">
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-3 px-8 py-2.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white text-[var(--primary)] border border-[var(--primary)]/30 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg group"
                                >
                                    <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                    Modify Protocol
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            {isEditing ? (
                                <div className="h-full rounded-[3.5rem] p-1 bg-[var(--primary)]/10">
                                    <DocEditor
                                        page={activePage}
                                        onSave={(updated) => {
                                            onSavePage(updated);
                                            setIsEditing(false);
                                        }}
                                        onCancel={() => setIsEditing(false)}
                                    />
                                </div>
                            ) : (
                                <DocViewer page={activePage} />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-24 opacity-20 select-none">
                        <div className="p-10 bg-[var(--bg-deep)] rounded-[4rem] border-2 border-dashed border-[var(--border-main)] mb-10">
                            <Book className="w-24 h-24 text-[var(--text-dim)]" />
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-bright)] uppercase tracking-tighter mb-4 leading-none">Knowledge Silo Offline</h2>
                        <p className="text-[11px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] max-w-sm text-center leading-relaxed">System standby. Select a sovereign intelligence protocol to begin signal transmission.</p>
                    </div>
                )}
            </main>
        </div>
    );
};
