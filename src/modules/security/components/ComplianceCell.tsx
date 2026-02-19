import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { isValueCompliant } from '../utils/complianceCalculator';
import type { SecurityNode, AuditColumn, SecurityOverrides } from '../types/security.types';

interface ComplianceCellProps {
    node: SecurityNode;
    column: AuditColumn;
    onToggle: (nodeId: string, columnKey: string) => void;
    canManage: boolean;
    overrides: SecurityOverrides;
}

/**
 * ComplianceCell - Displays compliance status for a single attribute
 * Shows COMPLIANT/MISSING badge with detailed tooltip on hover
 */
export const ComplianceCell: React.FC<ComplianceCellProps> = ({
    node,
    column,
    onToggle,
    canManage,
    overrides
}) => {
    const compliance = node.compliance?.[column.key];
    const hasOverride = !!overrides[`${node.id}_${column.key}`];

    // Normalize compliance check: handle boolean, string "true"/"yes", or explicit .current property
    const isCompliant = React.useMemo(() => {
        if (!compliance) return false;
        if (isValueCompliant(compliance.value)) return true;
        return !!compliance.current;
    }, [compliance]);

    if (node.type === 'POP') {
        return <span className="text-gray-600">-</span>;
    }

    return (
        <div className="relative group/cell inline-block">
            <button
                onClick={() => canManage && onToggle(node.id, column.key)}
                disabled={!canManage}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black border transition-all active:scale-90 ${isCompliant
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                    } ${hasOverride ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : ''} ${!canManage && 'cursor-not-allowed opacity-80'}`}
                title={`Value: ${compliance?.value ?? 'N/A'} | Strategy: ${compliance?.matchStrategy ?? 'none'}`}
            >
                {isCompliant ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {isCompliant ? 'COMPLIANT' : (compliance?.value ? 'NON-COMPLIANT' : 'MISSING')}
                {hasOverride && <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse ml-0.5"></div>}
            </button>

            {/* Detailed Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-[#161b22] border border-gray-800 rounded-xl shadow-2xl min-w-[200px] invisible group-hover/cell:visible opacity-0 group-hover/cell:opacity-100 transition-all z-50 pointer-events-none">
                <p className="text-[9px] text-gray-500 mb-2 border-b border-gray-800 pb-1 font-black uppercase">Attribute Details</p>
                <div className="space-y-1.5 text-left">
                    <div className="flex justify-between text-[9px]">
                        <span className="text-gray-400 font-bold">Value:</span>
                        <span className="text-white font-black">{String(compliance?.value ?? 'N/A')}</span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                        <span className="text-gray-400 font-bold">Strategy:</span>
                        <span className="text-blue-400 font-black text-[8px]">{compliance?.matchStrategy ?? 'none'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
