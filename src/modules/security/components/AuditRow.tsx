import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ComplianceCell } from './ComplianceCell';
import type { SecurityNode, AuditColumn, SecurityOverrides } from '../types/security.types';

interface AuditRowProps {
    node: SecurityNode;
    columns: AuditColumn[];
    onToggleOverride: (nodeId: string, columnKey: string) => void;
    canManageCols: boolean;
    overrides: SecurityOverrides;
    depth?: number;
    expandedIds: Set<string>;
    onToggleExpand: (id: string, e: React.MouseEvent) => void;
}

/**
 * AuditRow - Renders a single row in the audit matrix table
 * Handles expansion/collapse of child nodes
 */
export const AuditRow: React.FC<AuditRowProps> = ({
    node,
    columns,
    onToggleOverride,
    canManageCols,
    overrides,
    depth = 0,
    expandedIds,
    onToggleExpand
}) => {
    const children = node.processedChildren || [];
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = children.length > 0;

    // Check if there's a manual risk override
    const riskOverrideKey = `${node.id}_risk_override`;
    const hasRiskOverride = overrides[riskOverrideKey];

    // Determine effective risk level
    const riskLevel = (hasRiskOverride as any) || node.riskLevel;

    const handleRiskClick = () => {
        if (!canManageCols) return;

        const levels = ['LOW', 'MEDIUM', 'HIGH'];
        const currentIndex = levels.indexOf(riskLevel);
        const nextLevel = levels[(currentIndex + 1) % levels.length];

        // Use the same override mechanism but with a special key suffix
        onToggleOverride(node.id, `risk_override_${nextLevel}`);
    };

    return (
        <>
            <tr className={`hover:bg-white/[0.015] transition-colors group ${node.type === 'POP' ? 'bg-blue-500/[0.02]' : ''}`}>
                <td className="px-8 py-4" style={{ paddingLeft: `${depth * 2 + 2}rem` }}>
                    <div className="flex items-center gap-4">
                        {hasChildren ? (
                            <button
                                onClick={(e) => onToggleExpand(node.id, e)}
                                className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400"
                            >
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </button>
                        ) : <div className="w-5" />}

                        {/* Visual Entity Indicator */}
                        <div className={`w-1.5 h-10 rounded-full transition-all duration-300 ${riskLevel === 'LOW'
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : riskLevel === 'MEDIUM'
                                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                            }`}></div>

                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-tight mb-0.5">{node.name}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{(node.type || 'POP').toUpperCase()}</span>
                                {node.ip && (
                                    <>
                                        <div className="w-1 h-1 rounded-full bg-gray-800"></div>
                                        <span className="text-[9px] text-gray-600 font-bold uppercase italic">{node.ip}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </td>

                {columns.map(col => (
                    <td key={col.id} className="px-8 py-4 text-center">
                        <ComplianceCell
                            node={node}
                            column={col}
                            onToggle={onToggleOverride}
                            canManage={canManageCols}
                            overrides={overrides}
                        />
                    </td>
                ))}

                <td className="px-8 py-4 text-center">
                    <div className="inline-flex flex-col items-center">
                        <p className={`text-base font-black ${node.score > 80 ? 'text-emerald-400' : node.score > 40 ? 'text-amber-400' : 'text-red-400 shadow-red-500/20 drop-shadow-xl'
                            }`}>{node.score}%</p>
                        <div className="w-12 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                            <div
                                className={`h-full ${node.score > 80 ? 'bg-emerald-500' : node.score > 40 ? 'bg-amber-500' : 'bg-red-500'} transition-all duration-700`}
                                style={{ width: `${node.score}%` }}
                            ></div>
                        </div>
                    </div>
                </td>

                <td className="px-8 py-4 text-right">
                    {node.type === 'POP' ? (
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">POP Area</span>
                    ) : (
                        <button
                            onClick={handleRiskClick}
                            disabled={!canManageCols}
                            className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${riskLevel === 'LOW'
                                ? 'text-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10'
                                : riskLevel === 'MEDIUM'
                                    ? 'text-amber-500 bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10'
                                    : 'text-red-500 bg-red-500/5 border border-red-500/10 shadow-lg shadow-red-500/5 animate-pulse hover:bg-red-500/10'
                                } ${canManageCols ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
                            title={canManageCols ? "Click to toggle Risk Level override" : "Risk Level"}
                        >
                            {riskLevel === 'LOW' ? 'SECURE' : riskLevel === 'MEDIUM' ? 'WARNING' : 'CRITICAL'}
                            {hasRiskOverride && <span className="ml-1 text-[8px] opacity-70">*</span>}
                        </button>
                    )}
                </td>
            </tr>

            {isExpanded && children.map((child: SecurityNode) => (
                <AuditRow
                    key={child.id}
                    node={child}
                    columns={columns}
                    onToggleOverride={onToggleOverride}
                    canManageCols={canManageCols}
                    overrides={overrides}
                    depth={depth + 1}
                    expandedIds={expandedIds}
                    onToggleExpand={onToggleExpand}
                />
            ))}
        </>
    );
};
