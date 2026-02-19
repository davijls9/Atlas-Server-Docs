import React from 'react';
import { FileText, Clock, Tag, Library } from 'lucide-react';
import type { DocPage } from '../types/documentation.types';

interface DocViewerProps {
    page: DocPage;
}

export const DocViewer: React.FC<DocViewerProps> = ({ page }) => {
    return (
        <div className="flex flex-col h-full bg-[#0d1117] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
            {/* Page Header */}
            <div className="px-8 py-6 border-b border-gray-800 bg-[#161b22]/50 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">{page.title}</h1>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        Last Modified: {new Date(page.lastModified).toLocaleDateString()}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    {page.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-black uppercase">
                            <Tag className="w-3 h-3" />
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
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
                            <span key={pageId} className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[9px] font-black uppercase">
                                <Library className="w-3 h-3" />
                                View: {label}
                            </span>
                        );
                    })}

                    {/* Node ID Badges (kept as fallback) */}
                    {page.relatedNodeIds && page.relatedNodeIds.length > 0 && page.relatedNodeIds.map(nodeId => (
                        <span key={nodeId} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_4px_currentColor]"></div>
                            Node: {nodeId}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-10 overflow-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    {/* Basic Markdown Rendering (Simplified) */}
                    <div className="prose prose-invert prose-blue max-w-none text-gray-300 leading-relaxed space-y-6">
                        {page.content.split('\n').map((line, i) => {
                            if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-white mt-8 mb-4 uppercase tracking-tight">{line.substring(2)}</h1>;
                            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-white mt-6 mb-3 uppercase tracking-tight border-b border-gray-800 pb-2">{line.substring(3)}</h2>;
                            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-blue-400 mt-4 mb-2 uppercase tracking-wide">{line.substring(4)}</h3>;
                            if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{line.substring(2)}</li>;
                            if (line.trim() === '') return <br key={i} />;
                            return <p key={i} className="text-sm">{line}</p>;
                        })}
                    </div>
                </div>
            </div>

            {/* Empty State Footer */}
            {!page.content && (
                <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-50">
                    <FileText className="w-16 h-16 text-gray-700 mb-6" />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">This document is currently silent...</p>
                </div>
            )}
        </div>
    );
};
