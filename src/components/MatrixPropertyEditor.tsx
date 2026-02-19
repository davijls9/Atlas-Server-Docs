import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus, Search, Download,
    Settings2, Info, BarChart2
} from 'lucide-react';
import { saveAs } from 'file-saver';
import type { BlueprintAttribute } from '../modules/blueprint/types/blueprint.types';

interface MatrixPropertyEditorProps {
    pops: any[];
    schema: BlueprintAttribute[];
    onUpdateAttribute: (nodeId: string, attrId: string, value: any) => void;
    onAddAttribute: (label: string, type: any) => void;
    permissions: any;
}

export const MatrixPropertyEditor = ({ pops, schema, onUpdateAttribute, onAddAttribute, permissions }: MatrixPropertyEditorProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('ALL');
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set()); // "nodeId:attrId"
    const [focusedCell, setFocusedCell] = useState<{ nodeId: string, attrId: string } | null>(null);
    const [editingCell, setEditingCell] = useState<{ nodeId: string, attrId: string } | null>(null);
    const [copiedCell, setCopiedCell] = useState<{ nodeId: string, attrId: string, value: any } | null>(null);
    const [feedback, setFeedback] = useState<{ nodeId: string, attrId: string, status: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (focusedCell && !editingCell) {
            const cellKey = `${focusedCell.nodeId}:${focusedCell.attrId}`;
            const el = document.querySelector(`[data-cell="${cellKey}"]`) as HTMLElement;
            if (el && document.activeElement !== el) {
                el.focus();
            }
        }
    }, [focusedCell, editingCell]);


    const categories = [
        { id: 'ALL', label: 'All Fields' },
        { id: 'IDENTITY', label: 'Core Identity', matches: ['Company', 'System Type', 'Operating System', 'USER', 'SENHA'] },
        { id: 'HARDWARE', label: 'Hardware', matches: ['Modelo', 'Processador', 'Memoria', 'DDR'] },
        { id: 'STORAGE', label: 'Storage', matches: ['Disco', 'Raid'] },
        { id: 'NETWORK', label: 'Network', matches: ['IP IDRAC', 'ETH', 'VLAN'] },
        { id: 'SECURITY', label: 'Management/Sec', matches: ['Veeam', 'Zabbix', 'Tanium', 'AV'] }
    ];

    const flattenedNodes = useMemo(() => {
        const nodes: any[] = [];
        const process = (item: any, popName: string) => {
            nodes.push({ ...item, popName });
            const children = item.children || item.connected_devices || item.connected_servers || item.virtual_machines || item.systems || [];
            if (children) children.forEach((c: any) => process(c, popName));
        };
        pops.forEach(p => (p.nodes || []).forEach((n: any) => process(n, p.name)));
        return nodes;
    }, [pops]);

    const filteredNodes = useMemo(() => {
        return flattenedNodes.filter(n =>
            n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.ip?.includes(searchTerm)
        );
    }, [flattenedNodes, searchTerm]);

    const intelligentFilteredSchema = useMemo(() => {
        const baseFiltered = schema.filter(attr => {
            // Filter by enabled property
            if (attr.enabled === false) return false;

            // Filter by category
            if (activeCategory === 'ALL') return true;
            const cat = categories.find(c => c.id === activeCategory);
            return cat?.matches?.some(m => attr.label.includes(m));
        });

        const visibleTypes = new Set(filteredNodes.map(n => n.type));
        return baseFiltered.filter(attr => {
            if (!attr.appliesTo) return true;
            return attr.appliesTo.some(type => visibleTypes.has(type));
        });
    }, [schema, activeCategory, filteredNodes]);

    // Derived indices for keyboard navigation (Moved here to avoid TDZ)
    const nodeIndexMap = useMemo(() => {
        const map = new Map();
        filteredNodes.forEach((n, i) => map.set(n.id, i));
        return map;
    }, [filteredNodes]);

    const attrIndexMap = useMemo(() => {
        const map = new Map();
        intelligentFilteredSchema.forEach((a, i) => map.set(a.id, i));
        return map;
    }, [intelligentFilteredSchema]);

    const getColumnSummary = (attrId: string) => {
        const counts: Record<string, number> = {};
        const typeBreakdown: Record<string, number> = {};

        filteredNodes.forEach(n => {
            const val = n.attributes.find((a: any) => a.attributeId === attrId)?.value ?? 'Default';
            counts[val] = (counts[val] || 0) + 1;
            typeBreakdown[n.type] = (typeBreakdown[n.type] || 0) + 1;
        });
        return { counts, typeBreakdown };
    };

    const handleDownloadCSV = () => {
        const headers = ['POP', 'Node ID', 'Node Name', 'IP Address', ...intelligentFilteredSchema.map(s => s.label)];
        const rows = filteredNodes.map((node: any) => {
            const attrs = node.attributes || [];
            return [
                node.popName,
                node.id,
                node.name,
                node.ip,
                ...intelligentFilteredSchema.map(s => {
                    const attr = attrs.find((a: any) => a.attributeId === s.id);
                    return attr ? attr.value : s.defaultValue;
                })
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, 'infrastructure-matrix.csv');
    };

    const validateAndPaste = (nodeId: string, attrId: string, rawValue: string) => {
        const attrSchema = schema.find(s => s.id === attrId);
        if (!attrSchema) return;

        let processedValue: any = rawValue;
        let isValid = true;

        if (attrSchema.type === 'NUMBER') {
            const num = Number(rawValue);
            if (isNaN(num)) isValid = false;
            else processedValue = num;
        } else if (attrSchema.type === 'BOOLEAN') {
            if (rawValue.toLowerCase() === 'true' || rawValue === '1') processedValue = true;
            else if (rawValue.toLowerCase() === 'false' || rawValue === '0') processedValue = false;
            else isValid = false;
        }

        if (isValid) {
            onUpdateAttribute(nodeId, attrId, processedValue);
            triggerFeedback(nodeId, attrId, 'success');
        } else {
            triggerFeedback(nodeId, attrId, 'error');
        }
    };

    const triggerFeedback = (nodeId: string, attrId: string, status: 'success' | 'error') => {
        setFeedback({ nodeId, attrId, status });
        setTimeout(() => setFeedback(null), 1000);
    };

    const handleCellSelect = (nodeId: string, attrId: string, isCtrl: boolean = false, isShift: boolean = false) => {
        const key = `${nodeId}:${attrId}`;

        if (isShift && focusedCell) {
            // Range Selection
            const startNodeIdx = nodeIndexMap.get(focusedCell.nodeId);
            const startAttrIdx = attrIndexMap.get(focusedCell.attrId);
            const endNodeIdx = nodeIndexMap.get(nodeId);
            const endAttrIdx = attrIndexMap.get(attrId);

            const minNode = Math.min(startNodeIdx, endNodeIdx);
            const maxNode = Math.max(startNodeIdx, endNodeIdx);
            const minAttr = Math.min(startAttrIdx, endAttrIdx);
            const maxAttr = Math.max(startAttrIdx, endAttrIdx);

            const newSelection = new Set<string>();
            for (let i = minNode; i <= maxNode; i++) {
                for (let j = minAttr; j <= maxAttr; j++) {
                    const n = filteredNodes[i];
                    const a = intelligentFilteredSchema[j];
                    if (n && a) newSelection.add(`${n.id}:${a.id}`);
                }
            }
            setSelectedCells(newSelection);
        } else if (isCtrl) {
            // Multi-selection (Toggle)
            const newSelection = new Set(selectedCells);
            if (newSelection.has(key)) newSelection.delete(key);
            else newSelection.add(key);
            setSelectedCells(newSelection);
        } else {
            // Single Selection
            setSelectedCells(new Set([key]));
        }

        setFocusedCell({ nodeId, attrId });
        setEditingCell(null);
    };

    const handleCopy = (nodeId: string, attrId: string) => {
        const node = filteredNodes.find(n => n.id === nodeId);
        const attr = schema.find(s => s.id === attrId);
        if (!node || !attr) return;

        const attrValue = node.attributes?.find((a: any) => a.attributeId === attrId);
        // Fallback to defaultValue just like the renderer
        const value = attrValue?.value ?? attr.defaultValue ?? '';

        setCopiedCell({ nodeId, attrId, value });

        // Write to clipboard as well
        navigator.clipboard.writeText(String(value)).then(() => {
            triggerFeedback(nodeId, attrId, 'success');
        }).catch(err => {
            console.error('Copy failed:', err);
            triggerFeedback(nodeId, attrId, 'error');
        });
    };

    const handlePaste = async (targetNodeId: string, targetAttrId: string) => {
        if (permissions.edit_node === false) return;

        try {
            // Priority: Internal Copied Cell -> Browser Clipboard
            let valueToPaste = '';
            if (copiedCell) {
                valueToPaste = String(copiedCell.value);
            } else {
                valueToPaste = await navigator.clipboard.readText();
            }

            if (!valueToPaste && valueToPaste !== '') return;

            // If we have selected cells, and the target is part of the selection, paste to all
            if (selectedCells.size > 1 && selectedCells.has(`${targetNodeId}:${targetAttrId}`)) {
                selectedCells.forEach(cellKey => {
                    const [nid, aid] = cellKey.split(':');
                    validateAndPaste(nid, aid, valueToPaste);
                });
            } else {
                validateAndPaste(targetNodeId, targetAttrId, valueToPaste);
            }
        } catch (err) {
            console.error('Paste failed:', err);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, nodeId: string, attrId: string) => {
        // If we're editing, only Esc and Enter (sometimes) matter for the grid logic
        if (editingCell?.nodeId === nodeId && editingCell?.attrId === attrId) {
            if (e.key === 'Escape') {
                e.preventDefault();
                setEditingCell(null);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                setEditingCell(null);
                // Move down after enter?
                const nodeIdx = nodeIndexMap.get(nodeId);
                const nextNode = filteredNodes[nodeIdx + 1];
                if (nextNode) handleCellSelect(nextNode.id, attrId);
            }
            return;
        }

        const nodeIdx = nodeIndexMap.get(nodeId);
        const attrIdx = attrIndexMap.get(attrId);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextNode = filteredNodes[nodeIdx + 1];
            if (nextNode) handleCellSelect(nextNode.id, attrId);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevNode = filteredNodes[nodeIdx - 1];
            if (prevNode) handleCellSelect(prevNode.id, attrId);
        } else if (e.key === 'ArrowRight') {
            const nextAttr = intelligentFilteredSchema[attrIdx + 1];
            if (nextAttr) {
                e.preventDefault();
                handleCellSelect(nodeId, nextAttr.id);
            }
        } else if (e.key === 'ArrowLeft') {
            const prevAttr = intelligentFilteredSchema[attrIdx - 1];
            if (prevAttr) {
                e.preventDefault();
                handleCellSelect(nodeId, prevAttr.id);
            }
        } else if (e.key === ' ' && !editingCell) {
            e.preventDefault();
            const node = filteredNodes.find(n => n.id === nodeId);
            const attr = intelligentFilteredSchema.find(a => a.id === attrId);
            if (attr?.type === 'BOOLEAN' && permissions.edit_node !== false) {
                const value = node?.attributes?.find((a: any) => a.attributeId === attrId)?.value;
                onUpdateAttribute(nodeId, attrId, !value);
                triggerFeedback(nodeId, attrId, 'success');
            }
        } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleCopy(nodeId, attrId);
        } else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handlePaste(nodeId, attrId);
        } else if (e.key === 'Escape') {
            setCopiedCell(null);
            setSelectedCells(new Set());
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            if (permissions.edit_node !== false) {
                onUpdateAttribute(nodeId, attrId, '');
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d1117]">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 12px; height: 12px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #0d1117; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 6px; border: 3px solid #0d1117; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #718096; }
                
                .matrix-cell-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    min-height: 48px;
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                }
                .marching-ants {
                    position: absolute;
                    inset: 0;
                    border: 2px dashed #3b82f6 !important;
                    z-index: 30;
                    pointer-events: none;
                    animation: marching-ants 0.5s linear infinite;
                }
                .cell-highlight {
                    position: absolute;
                    inset: 0;
                    border: 2px solid #3b82f6;
                    z-index: 20;
                    pointer-events: none;
                    background: rgba(59, 130, 246, 0.08);
                }
                .cell-selected-multi {
                    background: rgba(59, 130, 246, 0.12) !important;
                }
            `}</style>

            {/* Matrix Toolbar */}
            <div className="px-8 py-4 bg-[#161b22] border-b border-gray-800 flex flex-col gap-4 shadow-2xl z-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                placeholder="Search nodes or attributes..."
                                className="bg-[#0d1117] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none w-80 text-gray-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onAddAttribute('New Field', 'TEXT')}
                            disabled={permissions.edit_node === false}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${permissions.edit_node !== false ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10' : 'bg-gray-800 text-gray-600 cursor-not-allowed grayscale'}`}
                        >
                            <Plus className="w-3.5 h-3.5" /> Manage Fields
                        </button>
                        <button
                            onClick={handleDownloadCSV}
                            className="p-2 hover:bg-gray-800 rounded-lg border border-gray-800 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Export Matrix CSV"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-[#0d1117] text-gray-500 hover:text-gray-300 border border-gray-800'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Matrix Grid */}
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative bg-[#0a0c10] min-w-0">
                <table className="border-collapse text-left min-w-max">
                    <thead className="sticky top-0 z-30">
                        <tr className="bg-[#0a0c10] border-b border-gray-800 shadow-xl">
                            <th className="px-6 py-4 w-12 sticky left-0 bg-[#0a0c10] z-50 border-r border-gray-800/30">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-700 bg-transparent"
                                    checked={selectedNodeIds.size === filteredNodes.length && filteredNodes.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedNodeIds(new Set(filteredNodes.map(n => n.id)));
                                        else setSelectedNodeIds(new Set());
                                    }}
                                />
                            </th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600 w-[240px] sticky left-12 bg-[#0a0c10] z-40 border-r border-gray-800/30">Node Identity</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600 w-[140px]">POP Area</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600 w-[150px]">Management IP</th>
                            {intelligentFilteredSchema.map(attr => {
                                const summary = getColumnSummary(attr.id);
                                return (
                                    <th key={attr.id} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 w-[200px] border-l border-gray-800/20 group relative">
                                        <div className="flex justify-between items-center">
                                            <span>{attr.label}</span>
                                            <div className="flex items-center gap-1.5">
                                                <div className="relative group/tooltip">
                                                    <Info className="w-3 h-3 text-gray-600 hover:text-blue-400 cursor-help transition-colors" />
                                                    <div className="absolute top-full right-0 mt-2 p-3 bg-[#161b22] border border-gray-800 rounded-xl shadow-2xl min-w-[160px] invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all z-50">
                                                        <p className="text-[9px] text-gray-500 mb-2 border-b border-gray-800 pb-1">COLUMN ANALYTICS</p>
                                                        <div className="space-y-1.5">
                                                            {Object.entries(summary.typeBreakdown).map(([type, count]) => (
                                                                <div key={type} className="flex justify-between text-[9px] font-bold">
                                                                    <span className="text-gray-400">{type.replace('_', ' ')}:</span>
                                                                    <span className="text-white">{count}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                {permissions.edit_node !== false && (
                                                    <Settings2 className="w-3 h-3 opacity-0 group-hover:opacity-100 cursor-pointer text-gray-600 hover:text-white transition-all" onClick={() => onAddAttribute(attr.label, attr.type)} />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                        {filteredNodes.map((node) => (
                            <tr key={node.id} className={`group transition-all duration-300 hover:z-10 relative ${node.type === 'PHYSICAL_SERVER' ? 'bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05]' :
                                node.type === 'VIRTUAL_MACHINE' ? 'bg-orange-500/[0.02] hover:bg-orange-500/[0.05]' :
                                    node.type === 'SYSTEM' ? 'bg-purple-500/[0.02] hover:bg-purple-500/[0.05]' :
                                        'hover:bg-blue-600/[0.03]'
                                }`}>
                                <td className="px-6 py-4 w-12 sticky left-0 bg-[#0d1117] z-30 group-hover:bg-[#161b22] border-r border-gray-800/30">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-700 bg-transparent"
                                        checked={selectedNodeIds.has(node.id)}
                                        onChange={(e) => {
                                            const next = new Set(selectedNodeIds);
                                            if (e.target.checked) next.add(node.id);
                                            else next.delete(node.id);
                                            setSelectedNodeIds(next);
                                        }}
                                    />
                                </td>
                                <td className="px-6 py-4 sticky left-12 bg-[#0d1117] z-20 group-hover:bg-[#161b22] transition-colors border-r border-gray-800/30">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-6 rounded-full ${node.type === 'PHYSICAL_SERVER' ? 'bg-emerald-500 shadow-[0_0_8px_#10b98144]' :
                                            node.type === 'VIRTUAL_MACHINE' ? 'bg-orange-500 shadow-[0_0_8px_#f59e0b44]' :
                                                node.type === 'SYSTEM' ? 'bg-purple-500 shadow-[0_0_8px_#a855f744]' :
                                                    'bg-blue-500 shadow-[0_0_8px_#3b82f644]'
                                            }`}></div>
                                        <div>
                                            <input
                                                readOnly={permissions.edit_node === false}
                                                className={`text-[10px] font-black block tracking-tight uppercase bg-transparent border-none outline-none p-0 w-full ${permissions.edit_node === false ? 'text-gray-400 cursor-default' : 'text-gray-100 group-hover:text-white cursor-text'}`}
                                                value={node.name}
                                                onChange={(e) => onUpdateAttribute(node.id, 'name', e.target.value)}
                                            />
                                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.2em]">{node.type.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{node.popName}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <input
                                        readOnly={permissions.edit_node === false}
                                        className={`font-mono text-[10px] text-blue-400/80 font-bold px-2 py-1 rounded border border-blue-500/10 w-full outline-none focus:ring-1 focus:ring-blue-500/30 ${permissions.edit_node === false ? 'bg-transparent cursor-default' : 'bg-blue-500/5 cursor-text'}`}
                                        value={node.ip}
                                        onChange={(e) => onUpdateAttribute(node.id, 'ip', e.target.value)}
                                    />
                                </td>
                                {intelligentFilteredSchema.map(attr => {
                                    const appliesTo = !attr.appliesTo || attr.appliesTo.includes(node.type);
                                    const value = node.attributes.find((a: any) => a.attributeId === attr.id)?.value ?? attr.defaultValue;

                                    if (!appliesTo) {
                                        return (
                                            <td key={attr.id} className="px-4 py-4 border-l border-gray-800/10 opacity-10 bg-gray-900/40">
                                                <div className="w-full text-center text-[9px] font-black uppercase tracking-tighter text-gray-700 italic">N/A</div>
                                            </td>
                                        );
                                    }

                                    const isFocused = focusedCell?.nodeId === node.id && focusedCell?.attrId === attr.id;
                                    const isEditing = editingCell?.nodeId === node.id && editingCell?.attrId === attr.id;
                                    const isSelected = selectedCells.has(`${node.id}:${attr.id}`);
                                    const isCopied = copiedCell?.nodeId === node.id && copiedCell?.attrId === attr.id;
                                    const hasFeedback = feedback?.nodeId === node.id && feedback?.attrId === attr.id;

                                    return (
                                        <td
                                            key={attr.id}
                                            data-cell={`${node.id}:${attr.id}`}
                                            tabIndex={0}
                                            onKeyDown={(e) => handleKeyDown(e, node.id, attr.id)}
                                            onDoubleClick={() => permissions.edit_node !== false && setEditingCell({ nodeId: node.id, attrId: attr.id })}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleCellSelect(node.id, attr.id, e.ctrlKey || e.metaKey, e.shiftKey);
                                            }}
                                            className={`border-l border-gray-800/10 transition-all duration-200 outline-none p-0 relative ${isSelected && !isFocused ? 'cell-selected-multi' : ''
                                                }`}
                                        >
                                            <div className="matrix-cell-wrapper">
                                                {isFocused && !isEditing && <div className="cell-highlight" />}
                                                {isCopied && <div className="marching-ants" />}
                                                {hasFeedback && (
                                                    <div className={`absolute inset-0 z-40 rounded pointer-events-none transition-all duration-500 ${feedback.status === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`} />
                                                )}

                                                {attr.type === 'BOOLEAN' ? (
                                                    <div
                                                        className={`w-9 h-4.5 rounded-full p-0.5 transition-all outline-none ${value ? 'bg-emerald-600/40 border border-emerald-500/50' : 'bg-gray-800 border border-gray-700'} ${permissions.edit_node !== false ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (permissions.edit_node !== false) onUpdateAttribute(node.id, attr.id, !value);
                                                        }}
                                                    >
                                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-4.5' : 'translate-x-0'}`} />
                                                    </div>
                                                ) : (
                                                    <div className="w-full relative">
                                                        {isEditing ? (
                                                            <input
                                                                autoFocus
                                                                readOnly={permissions.edit_node === false}
                                                                type={attr.type === 'NUMBER' ? 'number' : 'text'}
                                                                className={`w-full bg-blue-600/20 text-[10px] outline-none rounded transition-all px-2 py-1 font-bold text-white ring-2 ring-blue-500/50`}
                                                                value={value}
                                                                onBlur={() => setEditingCell(null)}
                                                                onChange={(e) => onUpdateAttribute(node.id, attr.id, e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' || e.key === 'Escape') {
                                                                        e.stopPropagation();
                                                                        handleKeyDown(e, node.id, attr.id);
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className={`text-[10px] font-bold px-2 py-1.5 block truncate select-none ${attr.type === 'NUMBER' ? 'text-blue-300' : 'text-gray-300'}`}>
                                                                {value || 'Default'}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Matrix Footer */}
            <div className="px-8 py-3 bg-[#0a0c10] border-t border-gray-800 flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">
                        <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Intelligence Engine Active</span>
                    </div>
                    <div className="h-4 w-px bg-gray-800"></div>
                    <span className="text-[10px] font-bold text-gray-600">Rows: <span className="text-white">{filteredNodes.length}</span></span>
                    <span className="text-[10px] font-bold text-gray-600">Context Cols: <span className="text-white">{intelligentFilteredSchema.length}</span></span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold uppercase tracking-tight">
                    <Info className="w-3 h-3 text-blue-500/50" />
                    Auto-Masking enabled for non-applicable contexts
                </div>
            </div>
        </div>
    );
};
