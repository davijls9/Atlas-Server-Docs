import { useState, useEffect } from 'react';
import { SecurityMiddleware } from '../utils/securityMiddleware';
import { Book, Edit3, Eye, Share2, Save, FileText, Plus, Trash2, ChevronRight } from 'lucide-react';

interface ManualSection {
    id: string;
    title: string;
    content: string;
}

interface DocumentationViewProps {
    externalSectionId?: string | null;
    onSectionChange?: () => void;
    showToast?: (m: string) => void;
}

export const DocumentationView = ({ externalSectionId, onSectionChange, showToast }: DocumentationViewProps) => {
    const [sections, setSections] = useState<ManualSection[]>([]);
    const [activeSectionId, setActiveSectionId] = useState<string>('');
    const [viewMode, setViewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (externalSectionId && sections.some(s => s.id === externalSectionId)) {
            setActiveSectionId(externalSectionId);
            onSectionChange?.();
        }
    }, [externalSectionId, sections]);

    useEffect(() => {
        const saved = localStorage.getItem('antigravity_docs');
        if (saved) {
            const parsed = JSON.parse(saved);
            setSections(parsed);
            if (parsed.length > 0) setActiveSectionId(parsed[0].id);
        } else {
            const initial = [
                { id: '1', title: 'Introduction', content: '# ANTIGRAVITY INFRASTRUCTURE\n\nWelcome to the sovereign infrastructure manager. This manual describes the operational standards for local and global clusters.' },
                { id: '2', title: 'Network Layer', content: '## Network Architecture\n\nAll traffic is encapsulated via Layer 2 VXLAN tunnels...' },
                { id: '3', title: 'Compute Nodes', content: '## Hardware Standards\n\nNodes must be provisioned with Tier-1 CPU architecture...' }
            ];
            setSections(initial);
            setActiveSectionId('1');
            SecurityMiddleware.secureWrite('antigravity_docs', JSON.stringify(initial));
        }
    }, []);

    const activeSection = sections.find(s => s.id === activeSectionId);

    const updateContent = (content: string) => {
        const updated = sections.map(s => s.id === activeSectionId ? { ...s, content } : s);
        setSections(updated);
        // Explicit save or debounced? Let's do a "Save" button and a session state
    };

    const handleSave = () => {
        setIsSaving(true);
        SecurityMiddleware.secureWrite('antigravity_docs', JSON.stringify(sections));
        setTimeout(() => {
            setIsSaving(false);
            showToast?.("Operational manual archived successfully");
        }, 800);
    };

    const addSection = () => {
        const id = Date.now().toString();
        const next = { id, title: 'New Runbook', content: '# New Operational Standard\n\nDefine the protocol here.' };
        const updated = [...sections, next];
        setSections(updated);
        setActiveSectionId(id);
        SecurityMiddleware.secureWrite('antigravity_docs', JSON.stringify(updated));
    };

    const deleteSection = (id: string) => {
        if (sections.length <= 1) return;
        if (confirm("Permanently delete this operational manual?")) {
            const updated = sections.filter(s => s.id !== id);
            setSections(updated);
            if (activeSectionId === id) setActiveSectionId(updated[0].id);
            SecurityMiddleware.secureWrite('antigravity_docs', JSON.stringify(updated));
        }
    };

    const renameSection = (id: string, title: string) => {
        const updated = sections.map(s => s.id === id ? { ...s, title } : s);
        setSections(updated);
    };

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-main)] overflow-hidden p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Control Bar */}
            <div className="flex justify-between items-center bg-[var(--bg-card)] px-6 py-4 rounded-[24px] border border-[var(--border-main)] shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)]/20">
                        <Book className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-[var(--text-bright)] uppercase tracking-widest">Infrastructure Encyclopedia</h3>
                        <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-tighter italic">Operational Manuals &amp; Runbooks</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-[var(--bg-deep)] p-1.5 rounded-xl border border-[var(--border-main)]">
                    <button
                        onClick={() => setViewMode('EDIT')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 transition-all ${viewMode === 'EDIT' ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
                    >
                        <Edit3 className="w-3.5 h-3.5" /> Architect Editor
                    </button>
                    <button
                        onClick={() => setViewMode('PREVIEW')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 transition-all ${viewMode === 'PREVIEW' ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
                    >
                        <Eye className="w-3.5 h-3.5" /> Reader Mode
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 rounded-xl font-black text-[10px] uppercase text-white shadow-xl shadow-[var(--accent)]/10 transition-all active:scale-95"
                    >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Save className="w-4 h-4" /> Save Manual</>}
                    </button>
                    <button className="p-2.5 bg-[var(--bg-deep)] hover:bg-[var(--border-subtle)] border border-[var(--border-main)] rounded-xl text-[var(--text-dim)] transition-all active:scale-95"><Share2 className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Navigation Sidebar */}
                <div className="w-72 bg-[var(--bg-card)] rounded-[32px] border border-[var(--border-main)] p-6 space-y-8 flex flex-col overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-center px-2">
                        <h4 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Active Runbooks</h4>
                        <button onClick={addSection} className="p-1 px-2 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-md text-[9px] font-black hover:bg-[var(--accent)] hover:text-white transition-all">
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar space-y-1">
                        {sections.map((section) => (
                            <div key={section.id} className="relative group">
                                <div
                                    onClick={() => setActiveSectionId(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[11px] font-bold transition-all text-left cursor-pointer ${activeSectionId === section.id ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 shadow-lg' : 'text-[var(--text-dim)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]'}`}
                                >
                                    <FileText className={`w-4 h-4 ${activeSectionId === section.id ? 'text-[var(--accent)]' : 'text-[var(--text-dim)] opacity-50'}`} />
                                    <input
                                        className="bg-transparent outline-none flex-1 min-w-0 pointer-events-none group-hover:pointer-events-auto selection:bg-[var(--accent)]/30 font-bold"
                                        value={section.title}
                                        onChange={(e) => renameSection(section.id, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                    />
                                    {activeSectionId === section.id && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 bg-[var(--status-error)]/10 text-[var(--status-error)] rounded-lg hover:bg-[var(--status-error)] hover:text-white transition-all z-10"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-[var(--bg-deep)] rounded-2xl border border-[var(--border-main)] space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]"></div>
                            <span className="text-[9px] font-black uppercase text-[var(--text-dim)] tracking-widest">Interface Status</span>
                        </div>
                        <p className="text-[9px] text-[var(--text-dim)] font-bold uppercase leading-relaxed tracking-tighter italic">Encyclopedia is synchronized with cluster heartbeat.</p>
                    </div>
                </div>

                {/* Main Content Pane */}
                <div className="flex-1 bg-[var(--bg-card)] rounded-[40px] border border-[var(--border-main)] shadow-2xl overflow-hidden flex flex-col relative group">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--accent)] via-[var(--primary)] to-[var(--accent)] opacity-60"></div>

                    {activeSection ? (
                        viewMode === 'EDIT' ? (
                            <textarea
                                className="flex-1 bg-transparent p-12 text-[var(--text-main)] font-mono text-sm leading-relaxed outline-none resize-none custom-scrollbar selection:bg-[var(--accent)]/20"
                                value={activeSection.content}
                                onChange={(e) => updateContent(e.target.value)}
                                spellCheck={false}
                                placeholder="Commence documentation synthesis..."
                            />
                        ) : (
                            <div className="flex-1 overflow-auto p-12 custom-scrollbar documentation-preview selection:bg-[var(--accent)]/30">
                                <div className="max-w-4xl mx-auto prose prose-invert">
                                    {activeSection.content.split('\n').map((line, i) => {
                                        if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-black text-[var(--text-bright)] mb-8 border-b border-[var(--border-main)] pb-6 tracking-tight uppercase">{line.substring(2)}</h1>;
                                        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-black text-[var(--accent)] mt-12 mb-6 uppercase tracking-tight flex items-center gap-4"><div className="w-2 h-8 bg-[var(--accent)]/40 rounded-full"></div>{line.substring(3)}</h2>;
                                        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-[var(--text-main)] mt-8 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-[var(--accent)]" /> {line.substring(4)}</h3>;
                                        if (line.startsWith('- ')) return <li key={i} className="text-[var(--text-dim)] ml-4 mb-2 list-none flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/50 mt-1.5 shrink-0"></div> {line.substring(2)}</li>;
                                        if (line.trim() === '') return <div key={i} className="h-4" />;
                                        return <p key={i} className="text-[var(--text-dim)] leading-relaxed mb-6 text-sm font-medium border-l-2 border-transparent hover:border-[var(--accent)]/20 pl-4 transition-all">{line}</p>;
                                    })}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[var(--text-dim)] uppercase font-black text-xs tracking-[0.2em] italic">Select a manual to begin synthesis</div>
                    )}
                </div>
            </div>
        </div>
    );
};
