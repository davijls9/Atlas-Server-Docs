import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { ModuleMetrics, ModuleError } from '../types/documentation.types';

interface ErrorAnalysisProps {
    modules: ModuleMetrics[];
}

export const ErrorAnalysis: React.FC<ErrorAnalysisProps> = ({ modules }) => {
    const modulesWithErrors = modules.filter(m => m.errors.length > 0);
    const totalErrors = modules.reduce((acc, m) => acc + m.errors.length, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--bg-card)] border border-[var(--status-error)]/20 p-6 rounded-2xl relative overflow-hidden group hover:border-[var(--status-error)]/40 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><AlertCircle className="w-24 h-24 text-[var(--status-error)]" /></div>
                    <h3 className="text-xs font-black text-[var(--status-error)] uppercase tracking-widest mb-2 opacity-80">Active Errors</h3>
                    <p className="text-4xl font-black text-[var(--text-bright)]">{totalErrors}</p>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-6 rounded-2xl hover:border-[var(--primary)]/30 transition-all">
                    <h3 className="text-xs font-black text-[var(--text-dim)] uppercase tracking-widest mb-2">Impacted Modules</h3>
                    <p className="text-4xl font-black text-[var(--text-bright)]">{modulesWithErrors.length}</p>
                    <p className="text-xs text-[var(--text-dim)] mt-2 font-bold uppercase tracking-tighter">{((modulesWithErrors.length / modules.length) * 100).toFixed(0)}% of system</p>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-6 rounded-2xl hover:border-[var(--status-success)]/30 transition-all">
                    <h3 className="text-xs font-black text-[var(--text-dim)] uppercase tracking-widest mb-2">System Health</h3>
                    <p className="text-4xl font-black text-[var(--status-success)]">{(100 - (modulesWithErrors.length / modules.length) * 100).toFixed(0)}%</p>
                    <p className="text-xs text-[var(--text-dim)] mt-2 font-bold uppercase tracking-tighter">Operational</p>
                </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-[var(--border-main)] bg-[var(--bg-card)]/50">
                    <h3 className="text-sm font-black text-[var(--text-bright)] uppercase tracking-widest">Error Log Analysis</h3>
                </div>
                <div className="p-6 space-y-4">
                    {modulesWithErrors.length > 0 ? (
                        modulesWithErrors.map(module => (
                            <div key={module.path} className="border border-[var(--status-error)]/20 bg-[var(--status-error)]/5 rounded-xl p-4 hover:border-[var(--status-error)]/30 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-[var(--text-bright)] text-sm">{module.name}</h4>
                                    <span className="px-2 py-1 bg-[var(--status-error)]/10 text-[var(--status-error)] text-[10px] font-black uppercase rounded border border-[var(--status-error)]/20">{module.errors.length} Issues</span>
                                </div>
                                <div className="space-y-2">
                                    {module.errors.map((err: ModuleError, idx: number) => (
                                        <div key={idx} className="flex items-start gap-3 text-xs text-[var(--text-main)] bg-[var(--bg-deep)] p-2 rounded border border-[var(--border-main)]">
                                            <XCircle className="w-4 h-4 text-[var(--status-error)] shrink-0 mt-0.5" />
                                            <span className="opacity-80 font-medium">{err.message} <span className="text-[var(--text-dim)] font-black text-[9px] uppercase ml-1">({err.line}:{err.column})</span></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-[var(--status-success)] mx-auto mb-4 opacity-20" />
                            <p className="text-[var(--text-dim)] font-black uppercase tracking-widest">No Active Errors Detected</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
