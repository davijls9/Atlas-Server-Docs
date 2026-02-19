import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import type { ModuleMetrics, ErrorDiagram } from '../types/documentation.types';
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
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            themeVariables: {
                primaryColor: '#3b82f6',
                primaryTextColor: '#fff',
                primaryBorderColor: '#1e40af',
                lineColor: '#6b7280',
                secondaryColor: '#10b981',
                tertiaryColor: '#ef4444'
            }
        });
    }, []);

    useEffect(() => {
        if (diagramRef.current) {
            const diagram = generateErrorDiagram(module);
            diagramRef.current.innerHTML = `<div class="mermaid">${diagram.mermaidCode}</div>`;
            mermaid.contentLoaded();
        }
    }, [module]);

    const generateErrorDiagram = (mod: ModuleMetrics): ErrorDiagram => {
        const hasErrors = mod.errors.length > 0;
        const hasWarnings = mod.warnings.length > 0;

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
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                    Error Flow Diagram
                </h3>
                <div className="flex items-center gap-2">
                    {module.errors.length === 0 && module.warnings.length === 0 ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            No Issues
                        </span>
                    ) : (
                        <>
                            {module.errors.length > 0 && (
                                <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                                    <XCircle className="w-3 h-3" />
                                    {module.errors.length} Errors
                                </span>
                            )}
                            {module.warnings.length > 0 && (
                                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {module.warnings.length} Warnings
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Mermaid Diagram */}
            <div ref={diagramRef} className="bg-[#161b22] rounded-xl p-6 overflow-auto"></div>

            {/* Error List */}
            {module.errors.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase mb-3">Detected Errors</h4>
                    <div className="space-y-2">
                        {module.errors.map(error => (
                            <div key={error.id} className="bg-[#161b22] border border-red-500/20 rounded-xl p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="w-4 h-4 text-red-500" />
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${error.severity === 'error' ? 'bg-red-500/20 text-red-400' :
                                                error.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {error.severity}
                                        </span>
                                        <span className="px-2 py-0.5 bg-gray-800 rounded text-[8px] font-black uppercase text-gray-400">
                                            {error.type}
                                        </span>
                                    </div>
                                    {error.fixable && (
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] font-black uppercase flex items-center gap-1">
                                            <Wrench className="w-3 h-3" />
                                            Fixable
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-white font-bold mb-2">{error.message}</p>
                                <p className="text-[10px] text-gray-500 mb-2">
                                    {error.file}:{error.line}:{error.column}
                                </p>
                                {error.suggestion && (
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mt-2">
                                        <p className="text-[9px] text-blue-400 font-bold">💡 Suggestion: {error.suggestion}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Warning List */}
            {module.warnings.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase mb-3">Warnings</h4>
                    <div className="space-y-2">
                        {module.warnings.map(warning => (
                            <div key={warning.id} className="bg-[#161b22] border border-yellow-500/20 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${warning.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                            warning.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {warning.severity}
                                    </span>
                                </div>
                                <p className="text-sm text-white font-bold mb-2">{warning.message}</p>
                                <p className="text-[10px] text-gray-500">
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
