import React from 'react';
import { Share2, Globe, Server, Database, Plus, Trash2, RotateCcw } from 'lucide-react';
import type { InfraNode, BlueprintAttribute, Link, NetworkInterface, Pop } from '../types/blueprint.types';

interface BlueprintDetailProps {
    node: InfraNode | Pop;
    schema: BlueprintAttribute[];
    allNodes: (InfraNode | Pop)[];
    links: Link[];
    onUpdateNode: (id: string, updates: Partial<InfraNode>) => void;
    onUpdateAttribute: (nodeId: string, attrId: string, value: any) => void;
    onAddLink: (link: Link) => void;
    onRemoveLink: (link: Link) => void;
    onUpdateLink: (link: Link, updates: Partial<Link>) => void;
    permissions: any;
}

export const BlueprintDetail: React.FC<BlueprintDetailProps> = ({
    node,
    schema,
    allNodes,
    links,
    onUpdateNode,
    onUpdateAttribute,
    onAddLink,
    onRemoveLink,
    onUpdateLink,
    permissions
}) => {
    const isPop = 'city' in node;
    const type = isPop ? 'POP' : (node as InfraNode).type;
    const Icon = isPop ? Globe : (node as InfraNode).type === 'PHYSICAL_SERVER' ? Server : Database;

    const getNodeName = (id: string) => {
        const found = allNodes.find(n => n.id === id);
        return found ? found.name : id;
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 px-4 sm:px-0">
            <header className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-6 w-full">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shrink-0">
                        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${isPop ? 'text-[var(--primary)]' : (node as InfraNode).type === 'PHYSICAL_SERVER' ? 'text-[var(--secondary)]' : 'text-[var(--accent)]'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <input
                            readOnly={permissions.edit_node === false}
                            value={node.name}
                            onChange={(e) => onUpdateAttribute(node.id, 'name', e.target.value)}
                            className={`w-full text-xl sm:text-3xl font-black bg-transparent border-none outline-none focus:ring-0 p-0 text-[var(--text-bright)] tracking-tighter truncate ${permissions.edit_node === false ? 'cursor-default' : 'cursor-text'}`}
                        />
                        <p className="text-[10px] sm:text-xs text-[var(--primary)] font-bold uppercase mt-1 leading-none">{isPop ? 'POP REGION' : type} CONFIGURATION</p>
                    </div>
                </div>
            </header>

            {!isPop && (
                <>
                    {/* Network Interfaces Section */}
                    <div className="mt-6 p-4 bg-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/10">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest flex items-center gap-2">
                                <Share2 className="w-3 h-3" /> Network Interfaces / Ports
                            </h4>
                            {permissions.edit_node !== false && (
                                <button
                                    onClick={() => {
                                        const p = prompt('Interface Name (e.g. eth0, Gigabit0/1)');
                                        if (p) {
                                            const newIfaces: NetworkInterface[] = [...((node as InfraNode).interfaces || []), { id: `if-${Date.now()}`, name: p, type: 'COPPER', status: 'ACTIVE' }];
                                            onUpdateNode(node.id, { interfaces: newIfaces });
                                        }
                                    }}
                                    className="p-1.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-lg transition-all"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {(node as InfraNode).interfaces?.map((iface: any) => (
                                <div key={iface.id} className="flex items-center justify-between p-2 bg-[var(--bg-deep)] rounded-xl border border-[var(--border-main)] group/iface">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${iface.status === 'ACTIVE' ? 'bg-[var(--status-success)] shadow-[0_0_5px_var(--status-success)]' : 'bg-[var(--text-dim)]'}`}></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[var(--text-bright)] uppercase tracking-tight leading-none mb-0.5">{iface.name}</p>
                                            <p className="text-[8px] text-[var(--text-dim)] font-black uppercase tracking-tighter">{iface.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/iface:opacity-100 transition-opacity">
                                        {permissions.edit_node !== false && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        const interfaces = (node as InfraNode).interfaces;
                                                        if (!interfaces) return;
                                                        const nextStatus = (iface.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE';
                                                        const newIfaces = interfaces.map((i: NetworkInterface) => i.id === iface.id ? { ...i, status: nextStatus } : i);
                                                        onUpdateNode(node.id, { interfaces: newIfaces });
                                                    }}
                                                    className="p-1 text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors"
                                                    title="Toggle Status"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newIfaces = ((node as InfraNode).interfaces || []).filter((i: NetworkInterface) => i.id !== iface.id);
                                                        onUpdateNode(node.id, { interfaces: newIfaces });
                                                    }}
                                                    className="p-1 text-[var(--status-error)] hover:opacity-80 transition-colors"
                                                    title="Delete Port"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {((node as InfraNode).interfaces?.length === 0 || !(node as InfraNode).interfaces) && (
                                <p className="text-[9px] text-[var(--text-dim)] font-bold italic text-center py-2 uppercase tracking-tighter">No interfaces provisioned</p>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-main)] shadow-2xl">
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-[var(--text-dim)] border-b border-[var(--border-main)] pb-2 tracking-widest">Identity &amp; Location</h4>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-[var(--text-dim)] font-bold uppercase">Public Name</label>
                            <input
                                readOnly={permissions.edit_node === false}
                                value={node.name}
                                onChange={(e) => onUpdateAttribute(node.id, 'name', e.target.value)}
                                className="w-full bg-[var(--bg-deep)] border border-[var(--border-main)] rounded-xl px-4 py-3 font-bold text-sm text-[var(--text-main)] focus:border-[var(--primary)] outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-[var(--text-dim)] font-bold uppercase">{isPop ? 'CITY/SITE' : 'MANAGEMENT IP'}</label>
                            <input
                                readOnly={permissions.edit_node === false}
                                value={isPop ? (node as any).city : (node as any).ip}
                                onChange={(e) => onUpdateAttribute(node.id, isPop ? 'city' : 'ip', e.target.value)}
                                className="w-full bg-[var(--bg-deep)] border border-[var(--border-main)] rounded-xl px-4 py-3 font-mono text-sm text-[var(--primary)] focus:border-[var(--primary)] outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {!isPop && (
                    <div className="space-y-6 overflow-auto max-h-[700px] pr-4 custom-scrollbar">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase text-[var(--text-dim)] border-b border-[var(--border-main)] pb-2 tracking-widest">Context Attributes</h4>
                            <div className="space-y-4 max-h-[300px] sm:max-h-none overflow-auto pr-2 custom-scrollbar">
                                {schema.filter(attr => !attr.appliesTo || attr.appliesTo.includes((node as InfraNode).type)).map(attr => (
                                    <div key={attr.id} className="space-y-1.5">
                                        <label className="text-[9px] sm:text-[10px] text-[var(--text-dim)] font-bold uppercase ml-1">{attr.label}</label>
                                        {attr.type === 'BOOLEAN' ? (
                                            <div
                                                onClick={() => permissions.edit_node !== false && onUpdateAttribute(node.id, attr.id, !((node as InfraNode).attributes.find(a => a.attributeId === attr.id)?.value ?? attr.defaultValue))}
                                                className={`w-12 h-6 rounded-full p-1 transition-all ${(node as InfraNode).attributes.find(a => a.attributeId === attr.id)?.value ? 'bg-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)]' : 'bg-[var(--border-main)]'} ${permissions.edit_node !== false ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${(node as InfraNode).attributes.find(a => a.attributeId === attr.id)?.value ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        ) : (
                                            <input
                                                readOnly={permissions.edit_node === false}
                                                type={attr.type === 'NUMBER' ? 'number' : 'text'}
                                                className={`w-full bg-[var(--bg-deep)] border border-[var(--border-main)] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:ring-2 focus:ring-[var(--primary)]/50 outline-none font-bold text-[var(--text-main)] ${permissions.edit_node === false ? 'cursor-default' : 'cursor-text'}`}
                                                value={(node as InfraNode).attributes.find(a => a.attributeId === attr.id)?.value ?? attr.defaultValue}
                                                onChange={(e) => onUpdateAttribute(node.id, attr.id, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {!isPop && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Logical Relationships (Links)</h4>
                        {permissions.edit_node !== false && (
                            <button
                                onClick={() => {
                                    const targetId = prompt('Enter Target Node ID:');
                                    if (targetId && !links.some(l => l.sourceId === node.id && l.targetId === targetId)) {
                                        onAddLink({
                                            sourceId: node.id,
                                            targetId,
                                            label: 'Logical Connection',
                                            type: 'LOGICAL',
                                            routeName: 'Main Route',
                                            color: '#3b82f6'
                                        });
                                    }
                                }}
                                className="p-1 text-[var(--primary)] hover:opacity-80 transition-all"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <select
                                    disabled={permissions.edit_node === false}
                                    className={`flex-1 bg-[var(--bg-deep)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-xs font-bold text-[var(--text-main)] outline-none ${permissions.edit_node === false ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                    onChange={(e) => {
                                        const targetId = e.target.value;
                                        if (targetId && !links.some(l => l.sourceId === node.id && l.targetId === targetId)) {
                                            onAddLink({
                                                sourceId: node.id,
                                                targetId,
                                                label: 'Logical Connection',
                                                type: 'LOGICAL',
                                                routeName: 'Main Route',
                                                color: '#3b82f6'
                                            });
                                        }
                                        e.target.value = '';
                                    }}
                                >
                                    <option value="">{permissions.edit_node !== false ? '+ Connect to Node...' : 'Logical Connections'}</option>
                                    {allNodes.map((n: any) => (
                                        n.id !== node.id && <option key={n.id} value={n.id}>{n.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2 max-h-[150px] overflow-auto custom-scrollbar">
                                {links.filter(l => l.sourceId === node.id || l.targetId === node.id).map((link, idx) => (
                                    <div key={idx} className="bg-[var(--bg-deep)] p-3 rounded-xl border border-[var(--border-main)] space-y-2">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-[var(--primary)] font-bold uppercase truncate max-w-[150px]">
                                                {link.sourceId === node.id ? `To: ${getNodeName(link.targetId)}` : `From: ${getNodeName(link.sourceId)}`}
                                            </span>
                                            {permissions.delete_node !== false && (
                                                <button onClick={() => onRemoveLink(link)} className="text-[var(--status-error)] hover:opacity-80 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                            )}
                                        </div>
                                        {permissions.edit_node !== false && (
                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 bg-[var(--bg-main)] border border-[var(--border-main)] rounded px-2 py-1 text-[9px] text-[var(--text-dim)] outline-none focus:border-[var(--primary)]"
                                                    placeholder="Route Name"
                                                    value={link.routeName || ''}
                                                    onChange={(e) => onUpdateLink(link, { routeName: e.target.value })}
                                                />
                                                <input
                                                    type="color"
                                                    className="w-8 h-5 bg-transparent border-none p-0 cursor-pointer"
                                                    value={link.color || '#3b82f6'}
                                                    onChange={(e) => onUpdateLink(link, { color: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
