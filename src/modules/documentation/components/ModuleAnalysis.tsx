import React from 'react';
import { ErrorDiagram } from './ErrorDiagram';
import type { ModuleMetrics } from '../types/documentation.types';
import { Code, AlertCircle, TrendingUp, FileCode } from 'lucide-react';

interface ModuleAnalysisProps {
    modules: ModuleMetrics[];
}

/**
 * ModuleAnalysis - Displays analysis of all modules with metrics and diagrams
 */
export const ModuleAnalysis: React.FC<ModuleAnalysisProps> = ({ modules }) => {
    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'text-[var(--status-success)] bg-[var(--status-success)]/10 border-[var(--status-success)]/20';
            case 'good': return 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20';
            case 'fair': return 'text-[var(--status-warn)] bg-[var(--status-warn)]/10 border-[var(--status-warn)]/20';
            case 'poor': return 'text-[var(--status-error)] bg-[var(--status-error)]/10 border-[var(--status-error)]/20';
            default: return 'text-[var(--text-dim)] bg-[var(--bg-deep)] border-[var(--border-main)]';
        }
    };

    const getComplexityColor = (complexity: number) => {
        if (complexity <= 3) return 'text-[var(--status-success)]';
        if (complexity <= 6) return 'text-[var(--status-warn)]';
        return 'text-[var(--status-error)]';
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-[var(--text-bright)] uppercase tracking-tight mb-2">
                    Module Analysis
                </h1>
                <p className="text-sm text-[var(--text-main)] opacity-70">
                    Comprehensive analysis of all project modules with metrics, errors, and health status.
                </p>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 hover:border-[var(--primary)]/30 transition-all shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Code className="w-4 h-4 text-[var(--primary)]" />
                        <span className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest">Total Modules</span>
                    </div>
                    <p className="text-2xl font-black text-[var(--text-bright)]">{modules.length}</p>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 hover:border-[var(--status-error)]/30 transition-all shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-[var(--status-error)]" />
                        <span className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest">Total Errors</span>
                    </div>
                    <p className="text-2xl font-black text-[var(--status-error)]">
                        {modules.reduce((acc, m) => acc + m.errors.length, 0)}
                    </p>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 hover:border-[var(--status-warn)]/30 transition-all shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <FileCode className="w-4 h-4 text-[var(--status-warn)]" />
                        <span className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest">Total LOC</span>
                    </div>
                    <p className="text-2xl font-black text-[var(--text-bright)]">
                        {modules.reduce((acc, m) => acc + m.loc, 0).toLocaleString()}
                    </p>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-6 hover:border-[var(--status-success)]/30 transition-all shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-[var(--status-success)]" />
                        <span className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest">Avg Coverage</span>
                    </div>
                    <p className="text-2xl font-black text-[var(--status-success)]">
                        {Math.round(modules.reduce((acc, m) => acc + m.coverage, 0) / modules.length)}%
                    </p>
                </div>
            </div>

            {/* Module Cards */}
            {modules.map(module => (
                <div key={module.name} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] p-8 shadow-xl">
                    {/* Module Header */}
                    <div className="flex items-center justify-between mb-8 overflow-hidden">
                        <div className="min-w-0 flex-1 pr-4">
                            <h2 className="text-2xl font-black text-[var(--text-bright)] uppercase tracking-tighter mb-1 truncate">
                                {module.name}
                            </h2>
                            <p className="text-[10px] text-[var(--text-dim)] font-bold tracking-widest truncate">{module.path}</p>
                        </div>
                        <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase border shrink-0 shadow-sm ${getHealthColor(module.health)}`}>
                            {module.health}
                        </span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-[var(--bg-deep)] border border-[var(--border-main)]/50 rounded-2xl p-5 hover:bg-[var(--bg-sidebar)] transition-colors">
                            <p className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest mb-2">Lines of Code</p>
                            <p className="text-xl font-black text-[var(--text-bright)]">{module.loc.toLocaleString()}</p>
                        </div>

                        <div className="bg-[var(--bg-deep)] border border-[var(--border-main)]/50 rounded-2xl p-5 hover:bg-[var(--bg-sidebar)] transition-colors">
                            <p className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest mb-2">Complexity</p>
                            <p className={`text-xl font-black ${getComplexityColor(module.complexity)}`}>
                                {module.complexity}/10
                            </p>
                        </div>

                        <div className="bg-[var(--bg-deep)] border border-[var(--border-main)]/50 rounded-2xl p-5 hover:bg-[var(--bg-sidebar)] transition-colors">
                            <p className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest mb-2">Test Coverage</p>
                            <p className={`text-xl font-black ${module.coverage > 70 ? 'text-[var(--status-success)]' : module.coverage > 40 ? 'text-[var(--status-warn)]' : 'text-[var(--status-error)]'}`}>
                                {module.coverage}%
                            </p>
                        </div>

                        <div className="bg-[var(--bg-deep)] border border-[var(--border-main)]/50 rounded-2xl p-5 hover:bg-[var(--bg-sidebar)] transition-colors">
                            <p className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest mb-2">Dependencies</p>
                            <p className="text-xl font-black text-[var(--text-bright)]">{module.dependencies.length}</p>
                        </div>
                    </div>

                    {/* Error Diagram */}
                    <div className="rounded-[2rem] border border-[var(--border-main)]/60 bg-[var(--bg-deep)]/30 p-2">
                        <ErrorDiagram module={module} />
                    </div>

                    {/* Dependencies */}
                    {module.dependencies.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-[var(--border-main)]/60">
                            <h4 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] mb-4 ml-1">Dependency Protocol</h4>
                            <div className="flex flex-wrap gap-2">
                                {module.dependencies.map(dep => (
                                    <span key={dep} className="px-4 py-2 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-xl text-[10px] font-black text-[var(--text-main)] shadow-inner hover:border-[var(--primary)]/30 transition-all cursor-default">
                                        {dep}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
