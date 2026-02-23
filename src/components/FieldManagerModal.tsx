import { useState, useMemo, useEffect } from 'react';
import { X, Save, Trash2, Plus, Info, Search, SortAsc, SortDesc, ArrowUp, Filter, Layers } from 'lucide-react';
import type { BlueprintAttribute, NodeType } from '../modules/blueprint/types/blueprint.types';

interface FieldManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    schema: BlueprintAttribute[];
    onUpdateSchema: (newSchema: BlueprintAttribute[]) => void;
}

type SortMode = 'A-Z' | 'Z-A' | 'TYPE';

export const FieldManagerModal = ({ isOpen, onClose, schema, onUpdateSchema }: FieldManagerModalProps) => {
    const [editingSchema, setEditingSchema] = useState<BlueprintAttribute[]>(schema);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortMode, setSortMode] = useState<SortMode>('A-Z');

    // CRITICAL FIX: Re-sync editingSchema every time the modal opens
    // useState(schema) only runs once on mount — stale data was shown on subsequent opens
    useEffect(() => {
        if (isOpen) {
            setEditingSchema(schema);
            setSearchTerm(''); // Reset search to avoid confusion
        }
    }, [isOpen, schema]);

    const nodeTypes: NodeType[] = ['PHYSICAL_SERVER', 'VIRTUAL_MACHINE', 'SWITCH', 'ROUTER', 'SYSTEM'];

    const filteredAndSortedSchema = useMemo(() => {
        let result = editingSchema.filter(attr =>
            attr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            attr.id.toLowerCase().includes(searchTerm.toLowerCase())
        );

        result.sort((a, b) => {
            if (sortMode === 'A-Z') return a.label.localeCompare(b.label);
            if (sortMode === 'Z-A') return b.label.localeCompare(a.label);
            if (sortMode === 'TYPE') return a.type.localeCompare(b.type);
            return 0;
        });

        return result;
    }, [editingSchema, searchTerm, sortMode]);

    if (!isOpen) return null;

    const handleUpdate = (id: string, updates: Partial<BlueprintAttribute>) => {
        setEditingSchema(prev => prev.map(attr => attr.id === id ? { ...attr, ...updates } : attr));
    };

    const handleToggleAppliesTo = (id: string, type: NodeType) => {
        setEditingSchema(prev => prev.map(attr => {
            if (attr.id !== id) return attr;
            const current = attr.appliesTo || [];
            const next = current.includes(type)
                ? current.filter(t => t !== type)
                : [...current, type];
            return { ...attr, appliesTo: next.length > 0 ? next : undefined };
        }));
    };

    const handleAddField = () => {
        const newField: BlueprintAttribute = {
            id: `attr-${Date.now()}`,
            label: 'New Field',
            type: 'TEXT',
            defaultValue: ''
        };
        setEditingSchema([...editingSchema, newField]);
    };

    const handleRemoveField = (id: string) => {
        setEditingSchema(prev => prev.filter(attr => attr.id !== id));
    };

    const handleSave = () => {
        onUpdateSchema(editingSchema);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#161b22] border border-gray-800 w-full h-full md:h-auto md:max-w-4xl md:max-h-[85vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                <header className="px-6 md:px-10 py-6 md:py-8 border-b border-gray-800 flex justify-between items-center bg-[#0d1117]/80 backdrop-blur-md relative shrink-0">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Field & Logic Manager</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-2 opacity-70">Configure attribute visualization rules</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                        <div className="flex items-center gap-3 bg-[#0d1117] border border-gray-800 rounded-2xl px-5 py-2.5 group-focus-within:border-blue-500/50 transition-all shadow-inner">
                            <Search className="w-4 h-4 text-gray-600 group-focus-within:text-blue-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search attributes..."
                                className="bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-gray-700 w-56"
                            />
                        </div>
                        <div className="flex bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden p-1.5 shadow-inner">
                            {(['A-Z', 'Z-A', 'TYPE'] as SortMode[]).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setSortMode(mode)}
                                    className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all flex items-center gap-2 ${sortMode === mode ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-gray-600 hover:text-gray-400'
                                        }`}
                                >
                                    {mode === 'A-Z' && <SortAsc className="w-4 h-4" />}
                                    {mode === 'Z-A' && <SortDesc className="w-4 h-4" />}
                                    {mode === 'TYPE' && <Filter className="w-4 h-4" />}
                                    <span className="hidden lg:inline">{mode}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-gray-800 rounded-2xl transition-all hover:rotate-90">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-10 custom-scrollbar space-y-6 scroll-smooth relative" id="modal-content-area">
                    <div className="flex items-center gap-3 px-6 py-4 bg-blue-600/5 border border-blue-500/10 rounded-3xl mb-8 shrink-0">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Info className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest leading-relaxed">Intelligence Tip: If 'Applies To' is empty, the field will automatically be exposed for all infrastructure nodes.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredAndSortedSchema.map((attr) => (
                            <div key={attr.id} className="bg-[#0d1117] border border-gray-800/80 p-5 rounded-[32px] flex flex-col gap-4 group transition-all hover:border-blue-500/30 hover:bg-[#161b22]/50 hover:shadow-2xl hover:shadow-blue-500/5">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0 pl-2">
                                        <input
                                            value={attr.label}
                                            onChange={(e) => handleUpdate(attr.id, { label: e.target.value })}
                                            className="w-full bg-transparent border-none text-lg font-black text-white outline-none focus:ring-0 p-0 truncate placeholder:text-gray-800"
                                            placeholder="Enter Field Name"
                                        />
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_currentColor]"></div>
                                            <div className="text-[9px] text-gray-600 font-black truncate tracking-[0.2em] uppercase">{attr.id}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex flex-col gap-1 items-end mr-2">
                                            <label className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Type Protocol</label>
                                            <select
                                                value={attr.type}
                                                onChange={(e) => handleUpdate(attr.id, { type: e.target.value as any })}
                                                className="bg-[#161b22] border border-gray-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-blue-400 outline-none hover:border-gray-700 transition-colors"
                                            >
                                                <option value="TEXT">TEXT</option>
                                                <option value="NUMBER">NUMERIC</option>
                                                <option value="BOOLEAN">BOOLEAN</option>
                                                <option value="DATE">DATE</option>
                                                <option value="SELECT">SELECT</option>
                                                <option value="LIST">LIST</option>
                                            </select>
                                        </div>

                                        <div className="flex gap-2 bg-[#161b22] p-1.5 rounded-2xl border border-gray-800">
                                            <button
                                                onClick={() => handleUpdate(attr.id, { enabled: attr.enabled === false ? true : false })}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${attr.enabled !== false
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                                    : 'bg-transparent text-gray-600 hover:text-gray-400'
                                                    }`}
                                            >
                                                {attr.enabled !== false ? 'ENABLED' : 'DISABLED'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleUpdate(attr.id, { showInSecurity: attr.showInSecurity === false ? true : false })}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${attr.showInSecurity !== false
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                    : 'bg-transparent text-gray-600 hover:text-gray-400'
                                                    }`}
                                            >
                                                SECURITY
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveField(attr.id)}
                                            className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 bg-[#0a0c10] px-4 lg:px-6 py-4 rounded-[2rem] border border-gray-800/40">
                                    <div className="shrink-0 text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] opacity-50 px-2 lg:px-0">Applies To Protocol</div>
                                    <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                                        {nodeTypes.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => handleToggleAppliesTo(attr.id, type)}
                                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${attr.appliesTo?.includes(type)
                                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30'
                                                    : 'bg-transparent text-gray-700 border border-transparent hover:border-gray-800 hover:text-gray-500'
                                                    }`}
                                            >
                                                {type.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-800 pt-4 lg:pt-0 lg:pl-6 px-2 lg:px-0">
                                        <button
                                            onClick={() => handleUpdate(attr.id, { appliesTo: nodeTypes })}
                                            className="text-[9px] text-blue-500 hover:text-blue-400 font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                                        >
                                            <Layers className="w-3 h-3" /> Select All
                                        </button>
                                        <button
                                            onClick={() => handleUpdate(attr.id, { appliesTo: undefined })}
                                            className="text-[9px] text-orange-500 hover:text-orange-400 font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                                        >
                                            <X className="w-3 h-3" /> Clear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddField}
                        className="w-full py-8 border-2 border-dashed border-gray-800/50 rounded-[40px] text-gray-600 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-3 font-black uppercase text-[12px] tracking-[0.3em] mt-8 group"
                    >
                        <div className="p-3 bg-gray-800 rounded-2xl group-hover:bg-blue-500/20 transition-all">
                            <Plus className="w-6 h-6" />
                        </div>
                        Add New Schema Attribute
                    </button>

                    {filteredAndSortedSchema.length > 4 && (
                        <button
                            onClick={() => document.getElementById('modal-content-area')?.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="fixed bottom-32 right-32 p-4 bg-blue-600 text-white rounded-[24px] shadow-2xl shadow-blue-600/40 hover:bg-blue-500 transition-all animate-in zoom-in hover:scale-110 active:scale-95 z-50 border border-blue-400/20"
                        >
                            <ArrowUp className="w-6 h-6" />
                        </button>
                    )}
                </div>

                <footer className="px-8 py-6 border-t border-gray-800 bg-[#0d1117]/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Persist Logic
                    </button>
                </footer>
            </div>
        </div>
    );
};
