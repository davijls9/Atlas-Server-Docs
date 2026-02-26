import React from 'react';
import { FileText, Clock, Tag, Library } from 'lucide-react';
import type { DocPage } from '../types/documentation.types';

interface DocViewerProps {
    page: DocPage;
}

export const DocViewer: React.FC<DocViewerProps> = ({ page }) => {
    return (
        <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-main)] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
            {/* Page Header */}
            <div className="px-10 py-8 border-b border-[var(--border-main)] bg-[var(--bg-card)]/50 relative shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-black text-[var(--text-bright)] uppercase tracking-tighter leading-none">{page.title}</h1>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-dim)] font-black uppercase tracking-[0.2em] opacity-70">
                        <Clock className="w-4 h-4" />
                        Sync: {new Date(page.lastModified).toLocaleDateString()}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2.5 mt-6">
                    {page.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-2 px-4 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                            <Tag className="w-3.5 h-3.5" />
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2.5 mt-3">
                    {/* App Page Badges */}
                    {page.relatedPageIds?.map(pageId => {
                        const label = {
                            'editor': 'Visual Editor',
                            'map': 'Infra Map',
                            'data': 'Correlated Data',
                            'security': 'Security',
                            'workspace': 'Workspace',
                            'docs': 'Documentation',
                            'logs': 'System Logs'
                        }[pageId] || pageId;

                        return (
                            <span key={pageId} className="flex items-center gap-2 px-4 py-1.5 bg-[var(--status-warn)]/10 text-[var(--status-warn)] border border-[var(--status-warn)]/20 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                                <Library className="w-3.5 h-3.5" />
                                REF: {label}
                            </span>
                        );
                    })}

                    {/* Node ID Badges */}
                    {page.relatedNodeIds && page.relatedNodeIds.length > 0 && page.relatedNodeIds.map(nodeId => (
                        <span key={nodeId} className="flex items-center gap-2 px-4 py-1.5 bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/20 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-[var(--status-success)] shadow-[0_0_6px_currentColor]"></div>
                            NODE: {nodeId}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-12 overflow-auto custom-scrollbar bg-[var(--bg-main)]/20">
                <div className="max-w-4xl mx-auto">
                    {/* Basic Markdown Rendering */}
                    <div className="prose prose-invert max-w-none text-[var(--text-main)] leading-relaxed space-y-8 font-sans">
                        {page.content.split('\n').map((line, i) => {
                            if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-black text-[var(--text-bright)] mt-12 mb-6 uppercase tracking-tighter leading-none border-l-4 border-[var(--primary)] pl-6">{line.substring(2)}</h1>;
                            if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-black text-[var(--text-bright)] mt-10 mb-5 uppercase tracking-tight border-b border-[var(--border-main)] pb-3">{line.substring(3)}</h2>;
                            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-black text-[var(--primary)] mt-8 mb-4 uppercase tracking-widest">{line.substring(4)}</h3>;
                            if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-6 py-1 list-none font-bold text-sm border-l-2 border-[var(--border-main)] pl-4 hover:border-[var(--primary)] transition-colors">{line.substring(2)}</li>;
                            if (line.trim() === '') return <div key={i} className="h-4" />;
                            return <p key={i} className="text-base font-medium opacity-90 leading-[1.8]">{line}</p>;
                        })}
                    </div>
                </div>
            </div>

            {/* Empty State Footer */}
            {!page.content && (
                <div className="flex-1 flex flex-col items-center justify-center p-24 opacity-30 select-none">
                    <div className="p-8 bg-[var(--bg-deep)] rounded-[3rem] border border-[var(--border-main)] mb-8 shadow-inner">
                        <FileText className="w-20 h-20 text-[var(--text-dim)]" />
                    </div>
                    <p className="text-sm font-black text-[var(--text-dim)] uppercase tracking-[0.4em] text-center">Protocol Stream Empty</p>
                    <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-widest mt-2">Awaiting knowledge injection...</p>
                </div>
            )}
        </div>
    );
};
