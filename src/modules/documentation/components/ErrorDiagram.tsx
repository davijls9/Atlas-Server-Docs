import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import type { ModuleMetrics, ErrorDiagramType } from '../types/documentation.types';
import { AlertTriangle, CheckCircle, XCircle, Wrench } from 'lucide-react';

interface ErrorDiagramProps {
    module: ModuleMetrics;
}

/**
 * ErrorDiagram - Displays error flow diagram using Mermaid
 * Shows visual representation of errors and their flow through the module
 */
export const ErrorDiagram: React.FC<ErrorDiagramProps> = ({ module }) => {
    const diagramRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark') ||
            getComputedStyle(document.documentElement).getPropertyValue('--bg-main').includes('0d1117');

        mermaid.initialize({
            startOnLoad: true,
            theme: isDark ? 'dark' : 'neutral',
            themeVariables: {
                primaryColor: 'var(--primary)',
                primaryTextColor: 'var(--text-bright)',
                primaryBorderColor: 'var(--primary-hover)',
                lineColor: 'var(--text-dim)',
                secondaryColor: 'var(--status-success)',
                tertiaryColor: 'var(--status-error)',
                mainBkg: 'var(--bg-main)',
                nodeBorder: 'var(--border-main)'
            }
        });
    }, []);

    useEffect(() => {
        if (diagramRef.current) {
            const diagramData = generateErrorDiagram(module);
            diagramRef.current.innerHTML = `<div class="mermaid">${diagramData.mermaidCode}</div>`;
            mermaid.contentLoaded();
        }
    }, [module]);

    const generateErrorDiagram = (mod: ModuleMetrics): ErrorDiagramType => {
        // Build mermaid code

        let mermaidCode = `
graph TD
    A[${mod.name} Module] --> B{Has Issues?}
    B -->|Yes| C[Issue Type]
    B -->|No| D[✓ Healthy]
    
    C --> E[Errors: ${mod.errors.length}]
    C --> F[Warnings: ${mod.warnings.length}]
    
    E --> G{Severity}
    G -->|Critical| H[🔴 Immediate Fix Required]
    G -->|Warning| I[🟡 Should Fix]
    G -->|Info| J[ℹ️ Optional Fix]
    
    F --> K[Review & Improve]
    
    H --> L[Apply Fix]
    I --> L
    J --> M[Document]
    K --> M
    L --> N[Test]
    M --> N
    N --> O[✓ Resolved]
    
    style A fill:#1e40af,stroke:#3b82f6,color:#fff
    style D fill:#10b981,stroke:#059669,color:#fff
    style H fill:#ef4444,stroke:#dc2626,color:#fff
    style I fill:#f59e0b,stroke:#d97706,color:#fff
    style O fill:#10b981,stroke:#059669,color:#fff
        `.trim();

        return {
            nodes: [],
            edges: [],
            mermaidCode
        };
    };

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-[var(--text-bright)] uppercase tracking-[0.2em]">
                    Error Flow Diagram
                </h3>
                <div className="flex items-center gap-2">
                    {module.errors.length === 0 && module.warnings.length === 0 ? (
                        <span className="px-4 py-1.5 bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/20 rounded-full text-[9px] font-black uppercase flex items-center gap-2 tracking-widest shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Secure State
                        </span>
                    ) : (
                        <>
                            {module.errors.length > 0 && (
                                <span className="px-4 py-1.5 bg-[var(--status-error)]/10 text-[var(--status-error)] border border-[var(--status-error)]/20 rounded-full text-[9px] font-black uppercase flex items-center gap-2 tracking-widest shadow-sm">
                                    <XCircle className="w-3.5 h-3.5" />
                                    {module.errors.length} Critical
                                </span>
                            )}
                            {module.warnings.length > 0 && (
                                <span className="px-4 py-1.5 bg-[var(--status-warn)]/10 text-[var(--status-warn)] border border-[var(--status-warn)]/20 rounded-full text-[9px] font-black uppercase flex items-center gap-2 tracking-widest shadow-sm">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {module.warnings.length} Warnings
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Mermaid Diagram */}
            <div ref={diagramRef} className="bg-[var(--bg-main)] border border-[var(--border-main)]/50 rounded-xl p-8 overflow-auto shadow-inner mb-8"></div>

            {/* Error List */}
            {module.errors.length > 0 && (
                <div className="mt-8">
                    <h4 className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] mb-4 ml-1">Critical Exceptions</h4>
                    <div className="space-y-4">
                        {module.errors.map(error => (
                            <div key={error.id} className="bg-[var(--bg-main)] border border-[var(--status-error)]/20 rounded-2xl p-5 hover:border-[var(--status-error)]/40 transition-all shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[var(--status-error)]/10 rounded-xl">
                                            <XCircle className="w-5 h-5 text-[var(--status-error)]" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${error.severity === 'error' ? 'bg-[var(--status-error)] text-white' :
                                                    error.severity === 'warning' ? 'bg-[var(--status-warn)] text-white' :
                                                        'bg-[var(--primary)] text-white'
                                                    }`}>
                                                    {error.severity}
                                                </span>
                                                <span className="px-2 py-0.5 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-lg text-[8px] font-black uppercase text-[var(--text-dim)] tracking-wider">
                                                    {error.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {error.fixable && (
                                        <span className="px-3 py-1 bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/20 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                            <Wrench className="w-3.5 h-3.5" />
                                            PROTOCOL FIXABLE
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-[var(--text-bright)] font-bold mb-3 tracking-tight">{error.message}</p>
                                <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-tighter bg-[var(--bg-deep)] px-3 py-1.5 rounded-lg border border-[var(--border-main)]/50 inline-block">
                                    {error.file}:{error.line}:{error.column}
                                </p>
                                {error.suggestion && (
                                    <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl p-3 mt-4 flex items-start gap-3">
                                        <div className="p-1.5 bg-[var(--primary)]/10 rounded-lg">
                                            <CheckCircle className="w-3.5 h-3.5 text-[var(--primary)]" />
                                        </div>
                                        <p className="text-[10px] text-[var(--primary)] font-bold leading-relaxed">Intelligence Suggestion: {error.suggestion}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Warning List */}
            {module.warnings.length > 0 && (
                <div className="mt-8 border-t border-[var(--border-main)]/60 pt-8">
                    <h4 className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] mb-4 ml-1">Linter Warnings</h4>
                    <div className="space-y-4">
                        {module.warnings.map(warning => (
                            <div key={warning.id} className="bg-[var(--bg-main)] border border-[var(--status-warn)]/20 rounded-[2rem] p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-[var(--status-warn)]/10 rounded-xl">
                                        <AlertTriangle className="w-5 h-5 text-[var(--status-warn)]" />
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${warning.severity === 'high' ? 'bg-[var(--status-error)] text-white' :
                                        warning.severity === 'medium' ? 'bg-[var(--status-warn)] text-white' :
                                            'bg-[var(--primary)] text-white'
                                        }`}>
                                        {warning.severity}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--text-bright)] font-bold mb-3 tracking-tight">{warning.message}</p>
                                <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-tighter bg-[var(--bg-deep)] px-3 py-1.5 rounded-lg border border-[var(--border-main)]/50 inline-block">
                                    {warning.file}:{warning.line}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
