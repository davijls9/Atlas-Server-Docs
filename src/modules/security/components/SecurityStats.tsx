import React from 'react';
import type { SecurityStats as SecurityStatsType } from '../types/security.types';
import { Shield, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface SecurityStatsProps {
    stats: SecurityStatsType;
}

/**
 * SecurityStats - Displays overview statistics for security audit
 */
export const SecurityStats: React.FC<SecurityStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Nodes */}
            <div className="bg-[#0d1117] border border-gray-800 rounded-[24px] p-6 hover:border-blue-500/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Total Assets</span>
                </div>
                <p className="text-3xl font-black text-white mb-1">{stats.total}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Monitored Nodes</p>
            </div>

            {/* Protected Nodes */}
            <div className="bg-[#0d1117] border border-gray-800 rounded-[24px] p-6 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Protected</span>
                </div>
                <p className="text-3xl font-black text-emerald-400 mb-1">{stats.protected_nodes}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">High Compliance</p>
            </div>

            {/* Critical Gaps */}
            <div className="bg-[#0d1117] border border-gray-800 rounded-[24px] p-6 hover:border-red-500/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Critical</span>
                </div>
                <p className="text-3xl font-black text-red-400 mb-1">{stats.critical_gaps}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Needs Attention</p>
            </div>

            {/* Average Score */}
            <div className="bg-[#0d1117] border border-gray-800 rounded-[24px] p-6 hover:border-yellow-500/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Avg Score</span>
                </div>
                <p className={`text-3xl font-black mb-1 ${stats.avgScore > 80 ? 'text-emerald-400' : stats.avgScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {stats.avgScore}%
                </p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Overall Compliance</p>
            </div>
        </div>
    );
};
