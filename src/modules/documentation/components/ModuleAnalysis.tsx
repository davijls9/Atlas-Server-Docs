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
            case 'excellent': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'good': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'fair': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'poor': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getComplexityColor = (complexity: number) => {
        if (complexity <= 3) return 'text-emerald-500';
        if (complexity <= 6) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                    Module Analysis
                </h1>
                <p className="text-sm text-gray-400">
                    Comprehensive analysis of all project modules with metrics, errors, and health status.
                </p>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Code className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] text-gray-500 font-black uppercase">Total Modules</span>
                    </div>
                    <p className="text-2xl font-black text-white">{modules.length}</p>
                </div>

                <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-[10px] text-gray-500 font-black uppercase">Total Errors</span>
                    </div>
                    <p className="text-2xl font-black text-red-400">
                        {modules.reduce((acc, m) => acc + m.errors.length, 0)}
                    </p>
                </div>

                <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <FileCode className="w-4 h-4 text-yellow-500" />
                        <span className="text-[10px] text-gray-500 font-black uppercase">Total LOC</span>
                    </div>
                    <p className="text-2xl font-black text-white">
                        {modules.reduce((acc, m) => acc + m.loc, 0).toLocaleString()}
                    </p>
                </div>

                <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] text-gray-500 font-black uppercase">Avg Coverage</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-400">
                        {Math.round(modules.reduce((acc, m) => acc + m.coverage, 0) / modules.length)}%
                    </p>
                </div>
            </div>

            {/* Module Cards */}
            {modules.map(module => (
                <div key={module.name} className="bg-[#0d1117] border border-gray-800 rounded-3xl p-8">
                    {/* Module Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">
                                {module.name}
                            </h2>
                            <p className="text-[10px] text-gray-500 font-bold">{module.path}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase border ${getHealthColor(module.health)}`}>
                            {module.health}
                        </span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[#161b22] rounded-xl p-4">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Lines of Code</p>
                            <p className="text-lg font-black text-white">{module.loc.toLocaleString()}</p>
                        </div>

                        <div className="bg-[#161b22] rounded-xl p-4">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Complexity</p>
                            <p className={`text-lg font-black ${getComplexityColor(module.complexity)}`}>
                                {module.complexity}/10
                            </p>
                        </div>

                        <div className="bg-[#161b22] rounded-xl p-4">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Test Coverage</p>
                            <p className={`text-lg font-black ${module.coverage > 70 ? 'text-emerald-400' : module.coverage > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {module.coverage}%
                            </p>
                        </div>

                        <div className="bg-[#161b22] rounded-xl p-4">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Dependencies</p>
                            <p className="text-lg font-black text-white">{module.dependencies.length}</p>
                        </div>
                    </div>

                    {/* Error Diagram */}
                    <ErrorDiagram module={module} />

                    {/* Dependencies */}
                    {module.dependencies.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-xs font-black text-gray-500 uppercase mb-3">Dependencies</h4>
                            <div className="flex flex-wrap gap-2">
                                {module.dependencies.map(dep => (
                                    <span key={dep} className="px-3 py-1 bg-[#161b22] border border-gray-800 rounded-full text-xs font-bold text-gray-400">
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
