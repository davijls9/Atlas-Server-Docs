import { useState, useRef, useEffect } from 'react';
import { Layout, Info, Settings2, ChevronDown, Table, BarChart3, AlertCircle } from 'lucide-react';
import { MatrixPropertyEditor } from './MatrixPropertyEditor';
import { FieldManagerModal } from './FieldManagerModal';
import { useBlueprintNodes } from '../modules/blueprint/hooks/useBlueprintNodes';
import { useAttributes } from '../modules/blueprint/hooks/useAttributes';
import { useBlueprintStats } from '../modules/blueprint/hooks/useBlueprintStats';
import { BlueprintTree } from '../modules/blueprint/components/BlueprintTree';
import { BlueprintDetail } from '../modules/blueprint/components/BlueprintDetail';
import type { Link, BlueprintAttribute } from '../modules/blueprint/types/blueprint.types';

interface BlueprintEditorProps {
    onJsonChange: (json: string) => void;
    initialData?: string;
    permissions: any;
    workspaceMode?: 'GLOBAL' | 'PERSONAL';
}

// Initial Schema Data
const initialSchema: BlueprintAttribute[] = [
    { id: 'attr-company', label: 'Company', type: 'TEXT', defaultValue: 'Blink' },
    { id: 'attr-type-sys', label: 'System Type', type: 'TEXT', defaultValue: 'Bare Metal' },
    { id: 'attr-os', label: 'Operating System', type: 'TEXT', defaultValue: 'Ubuntu 22.04 LTS' },
    { id: 'attr-veeam', label: 'BKP Veeam BTP', type: 'TEXT', defaultValue: 'Não' },
    { id: 'attr-zabbix', label: 'Monitor Zabbix Agent 2', type: 'BOOLEAN', defaultValue: true, enabled: true, showInSecurity: true },
    { id: 'attr-tanium', label: 'Instalação Tanium', type: 'BOOLEAN', defaultValue: false, enabled: true, showInSecurity: true },
    { id: 'attr-av', label: 'Instalado AV', type: 'BOOLEAN', defaultValue: false, enabled: true, showInSecurity: true },
    { id: 'attr-model-srv', label: 'Modelo Server', type: 'TEXT', defaultValue: 'DELL R660', appliesTo: ['PHYSICAL_SERVER'] },
    { id: 'attr-proc-qt', label: 'QT F Processador', type: 'NUMBER', defaultValue: 1, appliesTo: ['PHYSICAL_SERVER'] },
    { id: 'attr-proc-name', label: 'F Processador', type: 'TEXT', defaultValue: 'Intel(R) Xeon(R) Gold', appliesTo: ['PHYSICAL_SERVER'] },
    { id: 'attr-ram-qt-1', label: '1 QT F Memoria', type: 'NUMBER', defaultValue: 2, appliesTo: ['PHYSICAL_SERVER'] },
    { id: 'attr-ram-val-1', label: '1 F Memoria Ram', type: 'TEXT', defaultValue: '32 GB', appliesTo: ['PHYSICAL_SERVER'] },
    { id: 'attr-ram-type-1', label: '1 Tipo DDR', type: 'TEXT', defaultValue: 'DDR5', appliesTo: ['PHYSICAL_SERVER'] },
    { id: 'attr-disk-qt-1', label: '1 QT F Disco', type: 'NUMBER', defaultValue: 2, appliesTo: ['PHYSICAL_SERVER'] },
    { id: 'attr-disk-val-1', label: '1 F Disco', type: 'TEXT', defaultValue: '480 GB', appliesTo: ['PHYSICAL_SERVER'] },
    { id: 'attr-disk-type-1', label: '1 Tipo Disco', type: 'TEXT', defaultValue: 'SSD', appliesTo: ['PHYSICAL_SERVER'] },
    { id: 'attr-raid-1', label: '1 Tipo Raid', type: 'TEXT', defaultValue: 'Raid 1', appliesTo: ['PHYSICAL_SERVER'] },
    { id: 'attr-idrac-ip', label: 'IP IDRAC', type: 'TEXT', defaultValue: 'https://172.16.x.x/', appliesTo: ['PHYSICAL_SERVER'] },
    { id: 'attr-user', label: 'USER', type: 'TEXT', defaultValue: 'admin', appliesTo: ['VIRTUAL_MACHINE', 'SYSTEM'] },
    { id: 'attr-pass', label: 'SENHA', type: 'TEXT', defaultValue: '', appliesTo: ['VIRTUAL_MACHINE', 'SYSTEM'] },
    { id: 'attr-sys-prop', label: 'Responsible Party/Owner', type: 'TEXT', defaultValue: 'Interno', appliesTo: ['SYSTEM'] }
];

export const BlueprintEditor = ({ onJsonChange, initialData, permissions, workspaceMode = 'PERSONAL' }: BlueprintEditorProps) => {
    const [viewMode, setViewMode] = useState<'TREE' | 'MATRIX'>('TREE');
    const [showHierarchy, setShowHierarchy] = useState(false);
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['pop-1', 'node-1']));
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const { attributes: schema, setAttributes: setSchema, addAttribute } = useAttributes(initialSchema);

    // PERSISTENCE: Load schema from initialData if present
    const hasInitializedSchema = useRef(false);
    useEffect(() => {
        if (!initialData || hasInitializedSchema.current) return;
        try {
            const parsed = JSON.parse(initialData);
            if (parsed.schema && Array.isArray(parsed.schema) && parsed.schema.length > 0) {
                setSchema(parsed.schema);
                hasInitializedSchema.current = true;
            }
        } catch (e) {
            console.warn('Failed to parse initial schema', e);
        }
    }, [initialData, setSchema]);

    const {
        pops,
        links,
        setLinks,
        addPop,
        removePop,
        addNode,
        removeNode,
        updateNode,
        updateNodeAttribute,
        findNodeById,
        serializeNode
    } = useBlueprintNodes(initialData, schema);

    const stats = useBlueprintStats(pops, selectedNodeId, findNodeById);

    // Tree Expansion Logic
    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Export Logic
    const lastSyncedJson = useRef<string | null>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const exportData = {
            pops: pops.map(pop => ({
                id: pop.id,
                name: pop.name,
                city: pop.city,
                nodes: pop.nodes.map(node => serializeNode(node))
            })),
            links: links,
            global_stats: stats,
            schema: schema
        };
        const newJson = JSON.stringify(exportData, null, 2);

        if (newJson !== lastSyncedJson.current) {
            // Debounce the update to prevent rapid cyclic updates
            if (debounceTimer.current) clearTimeout(debounceTimer.current);

            debounceTimer.current = setTimeout(() => {
                lastSyncedJson.current = newJson;
                onJsonChange(newJson);
            }, 1000); // 1 second debounce to stabilize
        }
    }, [pops, stats, schema, links, onJsonChange, serializeNode]);

    const handleAddAttribute = (label: string, type: 'TEXT' | 'NUMBER' | 'BOOLEAN') => {
        addAttribute({ id: `attr-${Date.now()}`, label, type: type as any, required: false });
    };

    const handleUpdateLink = (link: Link, updates: Partial<Link>) => {
        setLinks(prev => prev.map(l => l === link ? { ...l, ...updates } : l));
    };

    const selectedNode = selectedNodeId ? (pops.find(p => p.id === selectedNodeId) || findNodeById(selectedNodeId, pops.flatMap(p => p.nodes))) : null;

    return (
        <div className="flex flex-col lg:flex-row h-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans relative">
            {/* Field Manager Modal */}
            <FieldManagerModal
                isOpen={isFieldModalOpen}
                onClose={() => setIsFieldModalOpen(false)}
                schema={schema}
                onUpdateSchema={setSchema}
            />

            {/* Sidebar: Tree View */}
            <div className={`transition-all duration-300 ease-in-out border-b lg:border-b-0 lg:border-r border-[var(--border-main)] flex flex-col bg-[var(--bg-card)] relative ${isTreeCollapsed ? 'h-12 lg:w-12 lg:h-full' : 'h-1/2 lg:w-80 lg:h-full'}`}>
                {/* Fixed Toggle Button - Vertically Centered on Sidebar Edge */}
                <button
                    onClick={() => setIsTreeCollapsed(!isTreeCollapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center border border-[var(--border-main)] text-white z-40 hover:opacity-90 transition-all shadow-lg"
                    title={isTreeCollapsed ? "Expand Blueprint Schema" : "Collapse Blueprint Schema"}
                >
                    <ChevronDown className={`w-3 h-3 transition-transform ${isTreeCollapsed ? '-rotate-90' : 'rotate-90'}`} />
                </button>

                <div className={`p-3 lg:p-3 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-sidebar)] transition-opacity duration-300 ${isTreeCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex items-center gap-2">
                        <Layout className="w-4 h-4 text-[var(--primary)]" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">Topology</h3>
                        <button
                            onClick={() => setIsTreeCollapsed(!isTreeCollapsed)}
                            className="lg:hidden ml-2 p-1 text-[var(--text-dim)] hover:text-[var(--text-main)]"
                        >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isTreeCollapsed ? '' : 'rotate-180'}`} />
                        </button>
                    </div>
                    {!isTreeCollapsed && (
                        <div className="flex gap-1">
                            <button onClick={() => setShowHierarchy(!showHierarchy)} title="Topology Knowledge Base & Logic" className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"><Info className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setIsFieldModalOpen(true)} title="Dynamic Attribute Logic Manager" className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"><Settings2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setViewMode('TREE')} title="Blueprint Architect (Tree View)" className={`p-1.5 rounded-lg transition-all ${viewMode === 'TREE' ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}><ChevronDown className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setViewMode('MATRIX')} title="Resource Spreadsheet (Matrix View)" className={`p-1.5 rounded-lg transition-all ${viewMode === 'MATRIX' ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}><Table className="w-3.5 h-3.5" /></button>
                        </div>
                    )}
                </div>

                {!isTreeCollapsed ? (
                    <>
                        <BlueprintTree
                            pops={pops}
                            expandedIds={expandedIds}
                            selectedNodeId={selectedNodeId}
                            onToggleExpand={toggleExpand}
                            onSelectNode={setSelectedNodeId}
                            onAddPop={addPop}
                            onAddNode={addNode}
                            onRemovePop={removePop}
                            onRemoveNode={removeNode}
                            permissions={permissions}
                        />

                        {/* Stats Panel - Only show when a node is selected */}
                        {selectedNodeId && (
                            <div className="p-4 bg-[var(--bg-deep)] border-t border-[var(--border-main)] space-y-3 animate-in fade-in slide-in-from-bottom-2 mt-auto">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
                                    <span>Selection Stats</span>
                                    <BarChart3 className="w-3 h-3" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-[var(--bg-card)] p-2 rounded-lg border border-[var(--border-main)] hover:border-[var(--primary)]/30 transition-colors">
                                        <p className="text-[9px] text-[var(--text-dim)] uppercase font-black">Host RAM</p>
                                        <p className="text-xs font-bold text-[var(--status-success)] tracking-tighter">
                                            {stats.physicalRAM >= 1024 ? (stats.physicalRAM / 1024).toFixed(1) + ' TB' : stats.physicalRAM + ' GB'}
                                        </p>
                                    </div>
                                    <div className="bg-[var(--bg-card)] p-2 rounded-lg border border-[var(--border-main)] hover:border-[var(--status-warn)]/30 transition-colors">
                                        <p className="text-[9px] text-[var(--text-dim)] uppercase font-black">Alloc VRAM</p>
                                        <p className="text-xs font-bold text-[var(--status-warn)] tracking-tighter">{stats.virtualRAM} GB</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center pt-24 gap-8">
                        <BarChart3 className="w-4 h-4 text-[var(--border-main)]" />
                        <div className="h-32 w-px bg-gradient-to-b from-[var(--border-main)] to-transparent" />
                    </div>
                )}
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col bg-[var(--bg-main)] overflow-hidden min-w-0">
                {viewMode === 'TREE' ? (
                    <div className="flex-1 flex flex-col min-h-0 bg-[radial-gradient(circle_at_top_right,_var(--primary-glow),_transparent)]">
                        {/* Header / Controls - FIXED AT TOP */}
                        <div className="flex items-center justify-between p-4 border-b border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur-md z-10 shrink-0">
                            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="p-1.5 sm:p-2 bg-[var(--primary-glow)] rounded-lg border border-[var(--border-accent)]">
                                        <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--primary)]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xs sm:text-sm font-black text-[var(--text-bright)] uppercase tracking-widest truncate">Blueprint Studio</h3>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <p className="hidden sm:block text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-tight italic">Visual Infrastructure Editor</p>
                                            {workspaceMode === 'GLOBAL' ? (
                                                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">Global</span>
                                            ) : (
                                                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/20">Personal</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-auto p-12 custom-scrollbar">
                            {selectedNode ? (
                                <BlueprintDetail
                                    node={selectedNode}
                                    schema={schema}
                                    allNodes={pops.flatMap(p => [p, ...p.nodes])}
                                    links={links}
                                    onUpdateNode={updateNode}
                                    onUpdateAttribute={updateNodeAttribute}
                                    onAddLink={(link) => setLinks(prev => [...prev, link])}
                                    onRemoveLink={(link) => setLinks(prev => prev.filter(l => l !== link))}
                                    onUpdateLink={handleUpdateLink}
                                    permissions={permissions}
                                />
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-[var(--text-dim)] space-y-4 opacity-30 mt-[-10%]">
                                    <AlertCircle className="w-12 h-12" />
                                    <p className="text-sm font-black tracking-widest uppercase">Select Geographic or Logic Node</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <MatrixPropertyEditor
                        pops={pops}
                        schema={schema}
                        onUpdateAttribute={updateNodeAttribute}
                        onAddAttribute={handleAddAttribute}
                        permissions={permissions}
                    />
                )}
            </div >
        </div >
    );
};
