import React, { useState } from 'react';
import { Save, Type, Tag, AlignLeft, Library } from 'lucide-react';
import type { DocPage } from '../types/documentation.types';

interface DocEditorProps {
    page: DocPage;
    onSave: (updatedPage: DocPage) => void;
    onCancel: () => void;
}

export const DocEditor: React.FC<DocEditorProps> = ({ page, onSave, onCancel }) => {
    const [title, setTitle] = useState(page.title);
    const [content, setContent] = useState(page.content);
    const [tagInput, setTagInput] = useState(page.tags.join(', '));
    const [nodeIdsInput, setNodeIdsInput] = useState(page.relatedNodeIds?.join(', ') || '');
    const [selectedPages, setSelectedPages] = useState<string[]>(page.relatedPageIds || []);

    const APP_PAGES = [
        { id: 'editor', label: 'Visual Editor' },
        { id: 'map', label: 'Infra Map' },
        { id: 'data', label: 'Correlated Data' },
        { id: 'security', label: 'Security' },
        { id: 'workspace', label: 'Workspace' },
        { id: 'docs', label: 'Documentation' },
        { id: 'logs', label: 'System Logs' },
    ];

    const togglePage = (id: string) => {
        setSelectedPages(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        onSave({
            ...page,
            title: title || 'Untitled Page',
            content,
            tags: tagInput.split(',').map(t => t.trim()).filter(t => t !== ''),
            relatedNodeIds: nodeIdsInput.split(',').map(t => t.trim()).filter(t => t !== ''),
            relatedPageIds: selectedPages,
            lastModified: new Date().toISOString()
        });
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-main)] rounded-[3rem] border border-[var(--border-main)] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Editor Header */}
            <div className="px-8 py-6 border-b border-[var(--border-main)] bg-[var(--bg-card)]/50 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--primary)]/10 rounded-xl">
                        <AlignLeft className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-[var(--text-bright)] uppercase tracking-widest leading-none">Editing Protocol</h2>
                        <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-tighter mt-1">Updating sovereign knowledge base</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 text-[var(--text-dim)] hover:text-[var(--text-main)] text-[10px] font-black uppercase transition-colors tracking-widest"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-7 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[var(--primary-glow)] transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Finalize & Save
                    </button>
                </div>
            </div>

            {/* Editor Inputs */}
            <div className="flex-1 flex flex-col p-8 space-y-6 overflow-hidden">
                <div className="grid grid-cols-2 gap-6 shrink-0">
                    {/* Left Column: Title & Logic */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest ml-1 opacity-70">
                                <Type className="w-3.5 h-3.5" /> Page Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Project Infrastructure Overview..."
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl px-6 py-5 text-[var(--text-bright)] text-xl font-black placeholder:text-[var(--text-dim)]/30 outline-none focus:border-[var(--primary)]/50 focus:bg-[var(--bg-card)]/50 transition-all font-sans shadow-inner"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest ml-1 opacity-70">
                                <Library className="w-4 h-4" /> Correlated Views
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {APP_PAGES.map(appPage => (
                                    <button
                                        key={appPage.id}
                                        onClick={() => togglePage(appPage.id)}
                                        className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-[9px] font-black uppercase transition-all shadow-sm ${selectedPages.includes(appPage.id)
                                            ? 'bg-[var(--primary)]/10 border-[var(--primary)]/40 text-[var(--primary)]'
                                            : 'bg-[var(--bg-deep)] border-[var(--border-main)] text-[var(--text-dim)] hover:border-[var(--text-main)]/30 hover:bg-[var(--bg-main)]'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${selectedPages.includes(appPage.id) ? 'bg-[var(--primary)] shadow-[0_0_8px_currentColor]' : 'bg-[var(--border-main)]'}`}></div>
                                        {appPage.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Tags Input */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest ml-1 opacity-70">
                                <Tag className="w-4 h-4" /> Classifications (Comma separated)
                            </label>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Network, Topology, Core, Critical..."
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl px-6 py-3.5 text-[10px] text-[var(--primary)] font-black placeholder:text-[var(--text-dim)]/30 outline-none focus:border-[var(--primary)]/50 focus:bg-[var(--bg-card)]/50 transition-all shadow-inner uppercase tracking-wider"
                            />
                        </div>

                        {/* Node IDs Correlation */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest ml-1 opacity-70">
                                <AlignLeft className="w-4 h-4 rotate-90" /> Technical Node IDs (Optional)
                            </label>
                            <input
                                type="text"
                                value={nodeIdsInput}
                                onChange={(e) => setNodeIdsInput(e.target.value)}
                                placeholder="node-1, switch-prd-01..."
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl px-6 py-3.5 text-[10px] text-[var(--text-dim)] font-black placeholder:text-[var(--text-dim)]/30 outline-none focus:border-[var(--primary)]/50 focus:bg-[var(--bg-card)]/50 transition-all shadow-inner opacity-80"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Input - MAXIMIZED */}
                <div className="flex-1 flex flex-col space-y-4 min-h-0">
                    <label className="flex items-center justify-between text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest ml-1 opacity-70">
                        <div className="flex items-center gap-2">
                            <AlignLeft className="w-4 h-4" /> Documentation Content (Markdown Supported)
                        </div>
                        <span className="text-[9px] opacity-50 tracking-widest">PRO-VERSION EDITOR</span>
                    </label>
                    <div className="flex-1 w-full bg-[var(--bg-deep)] border border-[var(--border-main)] rounded-[3rem] overflow-hidden focus-within:border-[var(--primary)]/50 transition-all shadow-inner group">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="# Heading&#10;Type your technical documentation here...&#10;- Bullet points are supported&#10;- ## Sub-sections work too"
                            className="w-full h-full bg-transparent p-12 text-base text-[var(--text-main)] font-medium placeholder:text-[var(--text-dim)]/30 outline-none resize-none custom-scrollbar leading-relaxed group-focus-within:bg-[var(--bg-main)]/30 transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
