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
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-red-500/20 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle className="w-24 h-24 text-red-500" /></div>
                    <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">Active Errors</h3>
                    <p className="text-4xl font-black text-white">{totalErrors}</p>
                </div>
                <div className="bg-[#161b22] border border-gray-800 p-6 rounded-2xl">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Impacted Modules</h3>
                    <p className="text-4xl font-black text-white">{modulesWithErrors.length}</p>
                    <p className="text-xs text-gray-500 mt-2">{((modulesWithErrors.length / modules.length) * 100).toFixed(0)}% of system</p>
                </div>
                <div className="bg-[#161b22] border border-gray-800 p-6 rounded-2xl">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">System Health</h3>
                    <p className="text-4xl font-black text-emerald-400">{(100 - (modulesWithErrors.length / modules.length) * 100).toFixed(0)}%</p>
                    <p className="text-xs text-gray-500 mt-2">Operational</p>
                </div>
            </div>

            <div className="bg-[#0d1117] border border-gray-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 bg-[#161b22]">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Error Log Analysis</h3>
                </div>
                <div className="p-6 space-y-4">
                    {modulesWithErrors.length > 0 ? (
                        modulesWithErrors.map(module => (
                            <div key={module.path} className="border border-red-500/20 bg-red-500/5 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-white text-sm">{module.name}</h4>
                                    <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-black uppercase rounded border border-red-500/20">{module.errors.length} Issues</span>
                                </div>
                                <div className="space-y-2">
                                    {module.errors.map((err: ModuleError, idx: number) => (
                                        <div key={idx} className="flex items-start gap-3 text-xs text-gray-400 bg-[#0d1117] p-2 rounded border border-gray-800">
                                            <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                            <span>{err.message} ({err.line}:{err.column})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-20" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest">No Active Errors Detected</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
