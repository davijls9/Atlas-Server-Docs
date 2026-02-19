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
        <div className="flex flex-col h-full bg-[#0d1117] rounded-3xl border border-blue-500/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Editor Header */}
            <div className="px-8 py-6 border-b border-gray-800 bg-[#161b22] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                        <AlignLeft className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Editing Protocol</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Updating sovereign knowledge base</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-500 hover:text-white text-[10px] font-black uppercase transition-colors"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Save className="w-3.5 h-3.5" />
                        Finalize & Save
                    </button>
                </div>
            </div>

            {/* Editor Inputs */}
            <div className="flex-1 flex flex-col p-8 space-y-6 overflow-hidden">
                <div className="grid grid-cols-2 gap-6 shrink-0">
                    {/* Left Column: Title & Logic */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                <Type className="w-3 h-3" /> Page Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Project Infrastructure Overview..."
                                className="w-full bg-[#161b22] border border-gray-800 rounded-2xl px-6 py-4 text-white text-lg font-black placeholder:text-gray-700 outline-none focus:border-blue-500/50 transition-all font-sans"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                <Library className="w-3.5 h-3.5" /> Correlated Application Views
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {APP_PAGES.map(appPage => (
                                    <button
                                        key={appPage.id}
                                        onClick={() => togglePage(appPage.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[9px] font-black uppercase transition-all ${selectedPages.includes(appPage.id)
                                            ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                                            : 'bg-transparent border-gray-800 text-gray-600 hover:border-gray-700'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${selectedPages.includes(appPage.id) ? 'bg-blue-400 shadow-[0_0_8px_currentColor]' : 'bg-gray-800'}`}></div>
                                        {appPage.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Tags Input */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                <Tag className="w-3 h-3" /> Classifications (Comma separated)
                            </label>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Network, Topology, Core, Critical..."
                                className="w-full bg-[#161b22] border border-gray-800 rounded-2xl px-6 py-2.5 text-[10px] text-blue-400 font-black placeholder:text-gray-700 outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>

                        {/* Node IDs Correlation (Kept as secondary for now, but hidden if preferred) */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                <AlignLeft className="w-3 h-3 rotate-90" /> Technical Node IDs (Optional)
                            </label>
                            <input
                                type="text"
                                value={nodeIdsInput}
                                onChange={(e) => setNodeIdsInput(e.target.value)}
                                placeholder="node-1, switch-prd-01..."
                                className="w-full bg-[#161b22] border border-gray-800 rounded-2xl px-6 py-2.5 text-[10px] text-gray-500 font-black placeholder:text-gray-700 outline-none focus:border-blue-500/50 transition-all bg-transparent/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Input - MAXIMIZED */}
                <div className="flex-1 flex flex-col space-y-3 min-h-0">
                    <label className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        <div className="flex items-center gap-2">
                            <AlignLeft className="w-3 h-3" /> Documentation Content (Markdown Supported)
                        </div>
                        <span className="text-[9px] opacity-70">Supports rich markdown formatting</span>
                    </label>
                    <div className="flex-1 w-full bg-[#161b22] border border-gray-800 rounded-[48px] overflow-hidden focus-within:border-blue-500/50 transition-all shadow-inner">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="# Heading&#10;Type your technical documentation here...&#10;- Bullet points are supported&#10;- ## Sub-sections work too"
                            className="w-full h-full bg-transparent p-12 text-base text-gray-300 font-medium placeholder:text-gray-700 outline-none resize-none custom-scrollbar leading-relaxed"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
