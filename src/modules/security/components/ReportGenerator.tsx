import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { buildAuditReport, downloadReport } from '../utils/reportBuilder';
import type { SecurityNode, AuditColumn, SecurityOverrides, SecurityStats } from '../types/security.types';

interface ReportGeneratorProps {
    auditNodes: SecurityNode[];
    auditCols: AuditColumn[];
    overrides: SecurityOverrides;
    stats: SecurityStats;
    currentUser: any;
    onClose: () => void;
    showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
    logEvent: (level: string, message: string, category: string, metadata?: any) => void;
}

/**
 * ReportGenerator - Modal for generating and downloading audit reports
 */
export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
    auditNodes,
    auditCols,
    overrides,
    stats,
    currentUser,
    onClose,
    showToast,
    logEvent
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);

        try {
            const report = buildAuditReport(auditNodes, auditCols, overrides, stats, currentUser);
            downloadReport(report);

            showToast?.("Comprehensive security audit report generated and downloaded", "success");
            logEvent('INFO', `Security audit report generated: ${report.metadata.timestamp}`, 'SECURITY_EXPORT', {
                complianceScore: report.metadata.complianceScore,
                nodes: stats.total,
                attributes: auditCols.length,
                overrides: Object.keys(overrides).length
            });

            onClose();
        } catch (error) {
            showToast?.("Failed to generate report", "error");
            logEvent('ERROR', `Report generation failed: ${error}`, 'SECURITY_EXPORT');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[var(--bg-deep)]/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[var(--primary)]" />
                        <h3 className="text-sm font-black text-[var(--text-bright)] uppercase tracking-widest">
                            Generate Audit Report
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <p className="text-sm text-[var(--text-dim)]">
                        Generate a comprehensive security audit report in JSON format.
                    </p>

                    <div className="bg-[var(--bg-sidebar)] rounded-xl p-4 border border-[var(--border-main)]">
                        <h4 className="text-[10px] font-black text-[var(--text-dim)] uppercase mb-3">Report Contents</h4>
                        <ul className="space-y-2 text-xs text-[var(--text-dim)]">
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[var(--primary)]"></div>
                                Metadata (timestamp, user, compliance score)
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[var(--primary)]"></div>
                                Summary statistics
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[var(--primary)]"></div>
                                Attribute breakdown with compliance rates
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[var(--primary)]"></div>
                                Detailed asset information ({auditNodes.length} nodes)
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[var(--primary)]"></div>
                                Manual override tracking ({Object.keys(overrides).length} overrides)
                            </li>
                        </ul>
                    </div>

                    <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl p-4">
                        <p className="text-xs text-[var(--primary)] font-bold">
                            Average Compliance Score: <span className="text-[var(--text-bright)] font-black">{stats.avgScore}%</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-[var(--bg-deep)] hover:bg-[var(--border-subtle)] border border-[var(--border-main)] rounded-2xl text-sm font-black uppercase text-[var(--text-main)] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 px-6 py-3 bg-[var(--primary)] hover:opacity-90 rounded-2xl text-sm font-black uppercase text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};
