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
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[24px] p-6 hover:border-[var(--primary)]/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <Shield className="w-5 h-5 text-[var(--primary)]" />
                    <span className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">Total Assets</span>
                </div>
                <p className="text-3xl font-black text-[var(--text-bright)] mb-1">{stats.total}</p>
                <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase">Monitored Nodes</p>
            </div>

            {/* Protected Nodes */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[24px] p-6 hover:border-[var(--status-success)]/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <CheckCircle2 className="w-5 h-5 text-[var(--status-success)]" />
                    <span className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">Protected</span>
                </div>
                <p className="text-3xl font-black text-[var(--status-success)] mb-1">{stats.protected_nodes}</p>
                <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase">High Compliance</p>
            </div>

            {/* Critical Gaps */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[24px] p-6 hover:border-[var(--status-error)]/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="w-5 h-5 text-[var(--status-error)]" />
                    <span className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">Critical</span>
                </div>
                <p className="text-3xl font-black text-[var(--status-error)] mb-1">{stats.critical_gaps}</p>
                <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase">Needs Attention</p>
            </div>

            {/* Average Score */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[24px] p-6 hover:border-[var(--status-warn)]/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-5 h-5 text-[var(--status-warn)]" />
                    <span className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">Avg Score</span>
                </div>
                <p className={`text-3xl font-black mb-1 ${stats.avgScore > 80 ? 'text-[var(--status-success)]' : stats.avgScore > 50 ? 'text-[var(--status-warn)]' : 'text-[var(--status-error)]'}`}>
                    {stats.avgScore}%
                </p>
                <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase">Overall Compliance</p>
            </div>
        </div>
    );
};
