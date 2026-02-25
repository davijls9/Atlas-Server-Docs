import React, { useMemo, useState, useEffect } from 'react';
import { SecurityMiddleware } from '../utils/securityMiddleware';
import { Lock, FileText, Shield, Eye, EyeOff } from 'lucide-react';
import { SecurityStats } from '../modules/security/components/SecurityStats';
import { SSDLCView } from '../modules/security/components/SSDLCView';
import { useSecurityData } from '../modules/security/hooks/useSecurityData';
import { AuditMatrix } from '../modules/security/components/AuditMatrix';
import { ReportGenerator } from '../modules/security/components/ReportGenerator';
import { SecurityIntel } from './SecurityIntel';


interface SecurityViewProps {
    jsonData: string;
    showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
    currentUser: any;
    logEvent: any;
    permissions?: any;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ jsonData, showToast, currentUser, logEvent, permissions }) => {
    // Local State
    const [overrides, setOverrides] = useState<Record<string, any>>({});
    const [filterType, setFilterType] = useState<'ALL' | 'SERVER' | 'SWITCH' | 'VM'>('ALL');
    const [auditCols, setAuditCols] = useState<{ id: string, label: string, key: string }[]>([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState<'audit' | 'ssdlc' | 'intel'>('audit');
    const [showStats, setShowStats] = useState(true);

    // Auto-collapse stats when entering Intel mode
    useEffect(() => {
        if (activeSubTab === 'intel') setShowStats(false);
        else setShowStats(true);
    }, [activeSubTab]);

    // Parse Data & Schema
    const { nodes, schema } = useMemo(() => {
        try {
            const parsed = JSON.parse(jsonData);
            return {
                nodes: parsed.pops || [],
                schema: parsed.schema || []
            };
        } catch (e) {
            return { nodes: [], schema: [] };
        }
    }, [jsonData]);

    // Initialize Columns from Schema
    useEffect(() => {
        const savedOverrides = localStorage.getItem('atlas_security_overrides');
        if (savedOverrides) setOverrides(JSON.parse(savedOverrides));

        // Generate columns from schema attributes marked for security
        if (schema && Array.isArray(schema)) {
            const securityAttributes = schema.filter((attr: any) => attr.showInSecurity);
            const generatedCols = securityAttributes.map((attr: any) => ({
                id: attr.id,
                label: attr.label,
                key: attr.id
            }));

            // Fallback to default if no schema attributes found (or legacy data)
            if (generatedCols.length > 0) {
                setAuditCols(generatedCols);
            } else {
                const defaultCols = [
                    { id: 'attr-tanium', label: 'Tanium Hub', key: 'attr-tanium' },
                    { id: 'attr-av', label: 'Anti-Virus', key: 'attr-av' },
                    { id: 'attr-backup', label: 'Backup Redundancy', key: 'attr-backup' }
                ];
                setAuditCols(defaultCols);
            }
        }
    }, [schema]);

    // UI State for AuditMatrix
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [editingCol, setEditingCol] = useState<string | null>(null);

    // Use the new hook for global data processing
    const { processedNodes, stats, globalScore } = useSecurityData(nodes, auditCols, overrides, filterType);

    // Handlers
    const handleToggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    // Handlers
    const saveOverrides = (newOverrides: any) => {
        setOverrides(newOverrides);
        SecurityMiddleware.secureWrite('atlas_security_overrides', JSON.stringify(newOverrides));
    };

    const handleToggleOverride = (nodeId: string, colKey: string) => {
        // Special handling for Risk Level overrides
        if (colKey.startsWith('risk_override_')) {
            const level = colKey.replace('risk_override_', '');
            const key = `${nodeId}_risk_override`;
            const newOverrides = { ...overrides };

            // If clicking the same level that is already set, clear it (toggle off)
            if (newOverrides[key] === level) {
                delete newOverrides[key];
                logEvent('INFO', `Risk override cleared for node ${nodeId}`, 'SECURITY_AUDIT');
            } else {
                newOverrides[key] = level;
                logEvent('WARN', `Risk override set to ${level} for node ${nodeId}`, 'SECURITY_AUDIT');
            }

            saveOverrides(newOverrides);
            if (showToast) showToast('Risk Level updated manually', 'success');
            return;
        }

        // Standard Column Override
        const key = `${nodeId}_${colKey}`;
        const newOverrides = { ...overrides };
        const isAdding = !newOverrides[key];

        if (newOverrides[key]) delete newOverrides[key];
        else newOverrides[key] = true;

        saveOverrides(newOverrides);
        logEvent(isAdding ? 'WARN' : 'INFO', `${isAdding ? 'Manual override applied' : 'Manual override removed'} for node ${nodeId} in column ${colKey}`, 'SECURITY_AUDIT');
        if (showToast) showToast(`Override ${isAdding ? 'applied' : 'removed'} successfully`, 'success');
    };

    // Column management functions removed as they are now driven by schema

    return (
        <div className="h-full w-full flex flex-col bg-[#06080a] text-white overflow-hidden relative">
            {/* Header */}
            <div className={`border-b border-gray-800 bg-[#0d1117] shrink-0 relative z-20 shadow-xl transition-all duration-500 p-8`}>
                <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-6 ${showStats ? 'mb-6' : 'mb-0'}`}>
                    {/* Left Column: Title Block */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] shrink-0">
                            <Lock className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1 truncate">Security Audit</h1>
                            <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${globalScore === 100 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : globalScore >= 80 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate">
                                    Risk: <span className={`${globalScore === 100 ? 'text-emerald-400' : globalScore >= 80 ? 'text-amber-400' : 'text-red-400'}`}>{globalScore}%</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Sub-tab Navigator (Strict Centering) */}
                    <div className="flex justify-center">
                        <div className="flex bg-[#161b22] px-1 py-1 rounded-2xl border border-gray-800 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setActiveSubTab('audit')}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'audit' ? 'bg-red-500 text-black shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                Audit Matrix
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSubTab('ssdlc')}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'ssdlc' ? 'bg-red-500 text-black shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                SSDLC
                            </button>
                            {permissions?.view_security_intel && (
                                <button
                                    type="button"
                                    onClick={() => setActiveSubTab('intel')}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'intel' ? 'bg-red-500 text-black shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Tactical Intel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Dynamic Actions Block */}
                    <div className="flex items-center justify-end gap-3 min-w-0">
                        {activeSubTab === 'audit' && (
                            <div className="flex items-center bg-[#161b22] p-1 rounded-xl border border-gray-800 animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
                                {['SERVER', 'SWITCH', 'VM'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterType(t as any)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${filterType === t ? 'bg-red-500/10 text-red-400' : 'text-gray-600 hover:text-gray-300'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowStats(!showStats)}
                            className={`p-2 rounded-xl border transition-all shrink-0 ${showStats ? 'bg-gray-800/50 border-gray-700 text-blue-400' : 'bg-blue-500/10 border-blue-500/20 text-gray-400 hover:text-blue-400'}`}
                            title={showStats ? "Hide Stats" : "Show Stats"}
                        >
                            {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={() => setShowReportModal(true)}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 border border-blue-500/50 flex items-center gap-2 shrink-0"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Full Report</span>
                        </button>
                    </div>
                </div>

                {/* Security Stats Module (Collapsible) */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showStats ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className={`transition-all duration-500 ${activeSubTab === 'intel' ? 'scale-[0.85] origin-top opacity-80' : 'scale-100 origin-top opacity-100'}`}>
                        <SecurityStats stats={stats} />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto custom-scrollbar p-8">
                {activeSubTab === 'audit' ? (
                    processedNodes.length > 0 ? (
                        <AuditMatrix
                            hierarchy={processedNodes}
                            columns={auditCols}
                            overrides={overrides}
                            onToggleOverride={handleToggleOverride}
                            canManageCols={false}
                            expandedIds={expandedIds}
                            onToggleExpand={handleToggleExpand}
                            editingCol={editingCol}
                            onEditColumn={(id) => setEditingCol(id)}
                            onDeleteColumn={() => { }}
                            onRenameColumn={() => { }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 opacity-50">
                            <Shield className="w-16 h-16 mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest">No Security Data Available</p>
                        </div>
                    )
                ) : activeSubTab === 'ssdlc' ? (
                    <SSDLCView />
                ) : (
                    <SecurityIntel />
                )}
            </div>

            {showReportModal && (
                <ReportGenerator
                    auditNodes={processedNodes}
                    auditCols={auditCols}
                    overrides={overrides}
                    stats={stats}
                    currentUser={currentUser}
                    onClose={() => setShowReportModal(false)}
                    showToast={showToast}
                    logEvent={logEvent}
                />
            )}
        </div>
    );
};
