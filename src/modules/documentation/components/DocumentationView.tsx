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
        <div className="h-full w-full flex bg-[#06080a] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-80 border-r border-gray-800 flex flex-col bg-[#0d1117] shrink-0">
                <div className="p-6 border-b border-gray-800 bg-[#161b22]/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Library className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="font-black text-white text-xs uppercase tracking-widest">Library</h2>
                    </div>

                    <div className="relative group mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search protocols..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#06080a] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                        />
                    </div>

                    <button
                        onClick={handleCreatePage}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Init New Protocol
                    </button>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-1">
                    {filteredPages.map(page => (
                        <div
                            key={page.id}
                            onClick={() => {
                                setActivePageId(page.id);
                                setIsEditing(false);
                            }}
                            className={`w-full group px-4 py-4 rounded-2xl flex items-center justify-between transition-all border cursor-pointer ${activePageId === page.id
                                ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                                : 'text-gray-500 border-transparent hover:bg-gray-800/50'
                                }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden text-left">
                                <FileText className={`w-4 h-4 shrink-0 ${activePageId === page.id ? 'text-blue-400' : 'text-gray-700 group-hover:text-gray-500'}`} />
                                <div className="min-w-0">
                                    <span className={`text-[11px] font-black truncate block uppercase tracking-tight ${activePageId === page.id ? 'text-white' : ''}`}>
                                        {page.title}
                                    </span>
                                    <span className="text-[8px] font-bold opacity-40 block truncate uppercase">
                                        Last Sync: {new Date(page.lastModified).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleDelete(page.id, e)}
                                    className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                <ChevronRight className="w-3 h-3" />
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

                <div className="p-4 border-t border-gray-800 bg-[#0a0c10]">
                    <div className="flex items-center justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest px-2">
                        <span>Total Protocols</span>
                        <span className="text-blue-500">{pages.length}</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {activePage ? (
                    <div className="flex-1 flex flex-col p-8 bg-[#06080a] relative overflow-hidden">
                        <div className="flex justify-end mb-6 shrink-0 h-10">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Edit Protocol
                                </button>
                            ) : null}
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            {isEditing ? (
                                <DocEditor
                                    page={activePage}
                                    onSave={(updated) => {
                                        onSavePage(updated);
                                        setIsEditing(false);
                                    }}
                                    onCancel={() => setIsEditing(false)}
                                />
                            ) : (
                                <DocViewer page={activePage} />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-30">
                        <Book className="w-20 h-20 mb-6 text-gray-700" />
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Knowledge Silo Offline</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Select a protocol to begin transmission</p>
                    </div>
                )}
            </main>
        </div>
    );
};
