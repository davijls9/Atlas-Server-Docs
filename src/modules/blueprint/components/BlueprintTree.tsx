import React from 'react';
import { Share2, Globe, Layers, ChevronRight, ChevronDown, Server, Database, Trash2, Plus } from 'lucide-react';
import type { InfraNode, Pop, NodeType } from '../types/blueprint.types';

interface BlueprintTreeProps {
    pops: Pop[];
    expandedIds: Set<string>;
    selectedNodeId: string | null;
    onToggleExpand: (id: string) => void;
    onSelectNode: (id: string) => void;
    onAddPop: () => void;
    onAddNode: (parentId: string, type: NodeType) => void;
    onRemovePop: (id: string) => void;
    onRemoveNode: (id: string) => void;
    permissions: any;
}

export const BlueprintTree: React.FC<BlueprintTreeProps> = ({
    pops,
    expandedIds,
    selectedNodeId,
    onToggleExpand,
    onSelectNode,
    onAddPop,
    onAddNode,
    onRemovePop,
    onRemoveNode,
    permissions
}) => {
    const renderTreeNode = (node: InfraNode) => {
        const isExpanded = expandedIds.has(node.id);
        const isSelected = selectedNodeId === node.id;
        const Icon = node.type === 'SWITCH' ? Share2 : node.type === 'ROUTER' ? Globe : node.type === 'PHYSICAL_SERVER' ? Server : node.type === 'VIRTUAL_MACHINE' ? Layers : Database;
        const color = node.type === 'SWITCH' ? 'text-blue-400' : node.type === 'PHYSICAL_SERVER' ? 'text-emerald-400' : node.type === 'VIRTUAL_MACHINE' ? 'text-orange-400' : 'text-purple-400';

        return (
            <div key={node.id} className="space-y-0.5">
                <div
                    className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg cursor-pointer group transition-all ${isSelected ? 'bg-[var(--primary)]/20 ring-1 ring-[var(--primary)]/50' : 'hover:bg-[var(--border-subtle)]'}`}
                    onClick={(e) => { e.stopPropagation(); onSelectNode(node.id); if (node.children?.length) onToggleExpand(node.id); }}
                >
                    {node.children && node.children.length > 0 ? (
                        isExpanded ? <ChevronDown className="w-2.5 h-2.5 text-[var(--text-dim)]" /> : <ChevronRight className="w-2.5 h-2.5 text-[var(--text-dim)]" />
                    ) : <div className="w-2.5" />}

                    <Icon className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${color} transition-transform group-hover:scale-110`} />
                    <span className={`text-[9px] sm:text-[10px] font-black truncate flex-1 uppercase tracking-tighter ${isSelected ? 'text-[var(--text-bright)]' : 'text-[var(--text-dim)]'}`}>{node.name}</span>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {permissions.edit_node !== false && (
                            <>
                                {node.type === 'SWITCH' && <button onClick={(e) => { e.stopPropagation(); onAddNode(node.id, 'PHYSICAL_SERVER'); }} className="p-1 hover:text-emerald-400"><Plus className="w-3 h-3" /></button>}
                                {node.type === 'PHYSICAL_SERVER' && <button onClick={(e) => { e.stopPropagation(); onAddNode(node.id, 'VIRTUAL_MACHINE'); }} className="p-1 hover:text-orange-400"><Plus className="w-3 h-3" /></button>}
                                {node.type === 'VIRTUAL_MACHINE' && <button onClick={(e) => { e.stopPropagation(); onAddNode(node.id, 'SYSTEM'); }} className="p-1 hover:text-purple-400"><Plus className="w-3 h-3" /></button>}
                            </>
                        )}
                        {permissions.delete_node !== false && (
                            <button onClick={(e) => { e.stopPropagation(); onRemoveNode(node.id); }} className="p-1 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                        )}
                    </div>
                </div>
                {isExpanded && <div className="ml-3 pl-3 border-l border-[var(--border-main)] space-y-0.5">{node.children?.map(child => renderTreeNode(child))}</div>}
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-auto p-4 custom-scrollbar space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={onAddPop} className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-xl text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-4 transition-all"><Plus className="w-4 h-4" /> New Pop Region</button>
            {pops.map(pop => (
                <div key={pop.id}>
                    <div className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer group transition-colors ${selectedNodeId === pop.id ? 'bg-[var(--primary)]/20 ring-1 ring-[var(--primary)]/50' : 'hover:bg-[var(--border-subtle)]'}`} onClick={() => { onSelectNode(pop.id); onToggleExpand(pop.id); }}>
                        {expandedIds.has(pop.id) ? <ChevronDown className="w-4 h-4 text-[var(--text-dim)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-dim)]" />}
                        <Globe className="w-4 h-4 text-[var(--primary)]" />
                        <span className="text-[10px] font-black truncate flex-1 uppercase tracking-tight text-[var(--text-dim)]">{pop.name}</span>
                        {permissions.delete_node !== false && (
                            <button onClick={(e) => { e.stopPropagation(); onRemovePop(pop.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                    </div>
                    {expandedIds.has(pop.id) && (
                        <div className="ml-4 pl-4 border-l border-[var(--border-main)] mt-2 space-y-1">
                            {pop.nodes.map(node => renderTreeNode(node))}
                            {permissions.edit_node !== false && (
                                <button onClick={() => onAddNode(pop.id, 'SWITCH')} className="w-full flex items-center gap-2 p-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"><Plus className="w-3 h-3" /> Add Switch</button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
