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
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600/10 border border-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shrink-0">
                        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${isPop ? 'text-blue-400' : (node as InfraNode).type === 'PHYSICAL_SERVER' ? 'text-emerald-400' : 'text-purple-400'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <input
                            readOnly={permissions.edit_node === false}
                            value={node.name}
                            onChange={(e) => onUpdateAttribute(node.id, 'name', e.target.value)}
                            className={`w-full text-xl sm:text-3xl font-black bg-transparent border-none outline-none focus:ring-0 p-0 text-white tracking-tighter truncate ${permissions.edit_node === false ? 'cursor-default' : 'cursor-text'}`}
                        />
                        <p className="text-[10px] sm:text-xs text-blue-500 font-bold uppercase mt-1 leading-none">{isPop ? 'POP REGION' : type} CONFIGURATION</p>
                    </div>
                </div>
            </header>

            {!isPop && (
                <>
                    {/* Network Interfaces Section */}
                    <div className="mt-6 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
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
                                    className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {(node as InfraNode).interfaces?.map((iface: any) => (
                                <div key={iface.id} className="flex items-center justify-between p-2 bg-[#0d1117] rounded-xl border border-gray-800 group/iface">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${iface.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-gray-600'}`}></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white uppercase tracking-tight leading-none mb-0.5">{iface.name}</p>
                                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-tighter">{iface.type}</p>
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
                                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                                    title="Toggle Status"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newIfaces = ((node as InfraNode).interfaces || []).filter((i: NetworkInterface) => i.id !== iface.id);
                                                        onUpdateNode(node.id, { interfaces: newIfaces });
                                                    }}
                                                    className="p-1 text-red-500 hover:text-red-400 transition-colors"
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
                                <p className="text-[9px] text-gray-600 font-bold italic text-center py-2 uppercase tracking-tighter">No interfaces provisioned</p>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-[#161b22]/30 backdrop-blur-xl border border-white/5 shadow-2xl">
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-gray-600 border-b border-gray-800 pb-2 tracking-widest">Identity & Location</h4>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-bold uppercase">Public Name</label>
                            <input
                                readOnly={permissions.edit_node === false}
                                value={node.name}
                                onChange={(e) => onUpdateAttribute(node.id, 'name', e.target.value)}
                                className="w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 font-bold text-sm text-gray-300 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-bold uppercase">{isPop ? 'CITY/SITE' : 'MANAGEMENT IP'}</label>
                            <input
                                readOnly={permissions.edit_node === false}
                                value={isPop ? (node as any).city : (node as any).ip}
                                onChange={(e) => onUpdateAttribute(node.id, isPop ? 'city' : 'ip', e.target.value)}
                                className="w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 font-mono text-sm text-blue-400 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {!isPop && (
                    <div className="space-y-6 overflow-auto max-h-[700px] pr-4 custom-scrollbar">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase text-gray-600 border-b border-gray-800 pb-2 tracking-widest">Context Attributes</h4>
                            <div className="space-y-4 max-h-[300px] sm:max-h-none overflow-auto pr-2 custom-scrollbar">
                                {schema.filter(attr => !attr.appliesTo || attr.appliesTo.includes((node as InfraNode).type)).map(attr => (
                                    <div key={attr.id} className="space-y-1.5">
                                        <label className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase ml-1">{attr.label}</label>
                                        {attr.type === 'BOOLEAN' ? (
                                            <div
                                                onClick={() => permissions.edit_node !== false && onUpdateAttribute(node.id, attr.id, !((node as InfraNode).attributes.find(a => a.attributeId === attr.id)?.value ?? attr.defaultValue))}
                                                className={`w-12 h-6 rounded-full p-1 transition-all ${(node as InfraNode).attributes.find(a => a.attributeId === attr.id)?.value ? 'bg-blue-600 shadow-[0_0_10px_#2563eb66]' : 'bg-gray-800'} ${permissions.edit_node !== false ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${(node as InfraNode).attributes.find(a => a.attributeId === attr.id)?.value ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        ) : (
                                            <input
                                                readOnly={permissions.edit_node === false}
                                                type={attr.type === 'NUMBER' ? 'number' : 'text'}
                                                className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/50 outline-none font-bold text-gray-400 ${permissions.edit_node === false ? 'cursor-default' : 'cursor-text'}`}
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
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logical Relationships (Links)</h4>
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
                                className="p-1 text-blue-400 hover:text-blue-300 transition-all"
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
                                    className={`flex-1 bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 text-xs font-bold text-gray-400 outline-none ${permissions.edit_node === false ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
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
                                    <div key={idx} className="bg-[#0d1117] p-3 rounded-xl border border-gray-800 space-y-2">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-blue-400 font-bold uppercase truncate max-w-[150px]">
                                                {link.sourceId === node.id ? `To: ${getNodeName(link.targetId)}` : `From: ${getNodeName(link.sourceId)}`}
                                            </span>
                                            {permissions.delete_node !== false && (
                                                <button onClick={() => onRemoveLink(link)} className="text-red-500 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                            )}
                                        </div>
                                        {permissions.edit_node !== false && (
                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 bg-gray-900 border border-gray-800 rounded px-2 py-1 text-[9px] text-gray-400 outline-none focus:border-blue-500"
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
