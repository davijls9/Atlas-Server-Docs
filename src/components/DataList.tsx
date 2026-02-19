import React, { useState, useMemo } from 'react';
import { Search, Download, Zap, Database, Server, ExternalLink, Globe, Layers, ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { saveAs } from 'file-saver';

interface DataListProps {
    jsonData: string;
}

export const DataList = ({ jsonData }: DataListProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [selectedServer, setSelectedServer] = useState<any>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleExpandAll = () => {
        const allIds = new Set<string>();
        const collect = (node: any) => {
            const children = node.children || node.connected_devices || node.connected_servers || node.virtual_machines || node.systems || [];
            if (children.length > 0) {
                allIds.add(node.id);
                children.forEach(collect);
            }
        };
        rootNodes.forEach(collect);
        setExpandedIds(allIds);
    };

    const handleCollapseAll = () => {
        setExpandedIds(new Set());
    };

    const rootNodes = useMemo(() => {
        try {
            const data = JSON.parse(jsonData);
            return (data.pops || []).flatMap((p: any) => p.nodes || []);
        } catch (e) {
            return [];
        }
    }, [jsonData]);

    const dynamicColumns = useMemo(() => {
        const columns = new Set<string>();
        const processNode = (item: any) => {
            Object.keys(item).forEach(key => {
                if (!['id', 'name', 'ip', 'status', 'criticality', 'type', 'children', 'connected_devices', 'connected_servers', 'virtual_machines', 'systems', 'attributes'].includes(key)) {
                    columns.add(key);
                }
            });
            const children = item.children || item.connected_devices || item.connected_servers || item.virtual_machines || item.systems || [];
            children.forEach(processNode);
        };
        rootNodes.forEach(processNode);
        return Array.from(columns);
    }, [rootNodes]);

    const renderNode = (node: any, depth: number = 0): React.ReactNode => {
        const sTerm = searchTerm.toLowerCase();

        // Check if this node or any of its descendants match the search term
        const hasMatchingDescendant = (n: any): boolean => {
            const matches = (n.name && n.name.toLowerCase().includes(sTerm)) ||
                (n.ip && n.ip.toLowerCase().includes(sTerm)) ||
                (n.type && n.type.toLowerCase().includes(sTerm));
            if (matches) return true;
            const children = n.children || n.connected_devices || n.connected_servers || n.virtual_machines || n.systems || [];
            return children.some((c: any) => hasMatchingDescendant(c));
        };

        const matchesSearch = !searchTerm || hasMatchingDescendant(node);
        const matchesFilter = filterType === 'ALL' || node.criticality === filterType;

        if (!matchesSearch || !matchesFilter) return null;

        const children = node.children || node.connected_devices || node.connected_servers || node.virtual_machines || node.systems || [];
        const isExpanded = expandedIds.has(node.id) || (searchTerm.length > 0 && matchesSearch); // Auto-expand if searching
        const isSelected = selectedServer?.id === node.id;
        const correlated = isCorrelated(node);

        return (
            <React.Fragment key={node.id}>
                <tr
                    onClick={() => setSelectedServer(isSelected ? null : node)}
                    className={`group cursor-pointer transition-all duration-200 hover:bg-white/5 ${isSelected ? 'bg-blue-600/20' : correlated ? 'bg-blue-400/5' : ''}`}
                >
                    <td className="px-6 py-4" style={{ paddingLeft: `${depth * 2 + 1.5}rem` }}>
                        <div className="flex items-center gap-3">
                            {children.length > 0 ? (
                                <button onClick={(e) => toggleExpand(node.id, e)} className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400">
                                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                </button>
                            ) : <div className="w-5" />}
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 group-hover:text-blue-400 transition-colors'}`}>
                                {getIcon(node.type)}
                            </div>
                            <span className={`font-semibold ${isSelected ? 'text-blue-400' : 'text-gray-200'}`}>
                                {node.name}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter bg-gray-800 px-2 py-0.5 rounded-md border border-gray-700">
                            {node.type?.toUpperCase() || 'UNKNOWN'}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-400">{node.ip}</td>
                    {dynamicColumns.map(col => (
                        <td key={col} className="px-6 py-4 text-xs text-gray-400 border-l border-gray-800/20">
                            {typeof node[col] === 'boolean' ? (node[col] ? '✅ YES' : '❌ NO') :
                                typeof node[col] === 'object' ? '-' : (node[col] || '-')}
                        </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${node.criticality === 'HIGH' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            node.criticality === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            }`}>
                            {node.status}
                        </span>
                    </td>
                </tr>
                {isExpanded && children.map((c: any) => renderNode(c, depth + 1))}
            </React.Fragment>
        );
    };

    const handleExport = (format: 'json' | 'csv') => {
        if (format === 'json') {
            const blob = new Blob([jsonData], { type: 'application/json' });
            saveAs(blob, 'infrastructure.json');
        } else if (format === 'csv') {
            const flattened: any[] = [];
            const flatten = (n: any) => {
                flattened.push(n);
                const children = n.children || n.connected_devices || n.connected_servers || n.virtual_machines || n.systems || [];
                children.forEach(flatten);
            }
            rootNodes.forEach(flatten);

            const headers = ['Type', 'Name', 'IP', 'Status', 'Criticality', ...dynamicColumns];
            const rows = flattened.map((n: any) => [
                n.type, n.name, n.ip, n.status, n.criticality,
                ...dynamicColumns.map(col => n[col] ?? '')
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(r => r.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            saveAs(blob, 'infrastructure.csv');
        }
    };

    const isCorrelated = (node: any) => {
        if (!selectedServer) return false;
        if (selectedServer.id === node.id) return true;

        return (
            (node.type === selectedServer.type) ||
            (node.os && node.os === selectedServer.os) ||
            (node.status === selectedServer.status)
        );
    };

    const getIcon = (type: string) => {
        const t = type?.toUpperCase();
        if (t === 'PHYSICAL_SERVER') return <Zap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />;
        if (t === 'VIRTUAL_MACHINE') return <Layers className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />;
        if (t === 'SWITCH' || t === 'ROUTER') return <Globe className="w-4 h-4 text-blue-400" />;
        return <Server className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="flex flex-col h-full bg-[#0d1117] text-gray-100 p-8 space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161b22] p-6 rounded-2xl border border-gray-800 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 w-5 h-5 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search nodes, IPs, types..."
                            className="pl-11 pr-4 py-2.5 bg-[#0d1117] border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-white w-full md:w-80 transition-all placeholder:text-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            className="bg-[#0d1117] border border-gray-700 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none text-white transition-all cursor-pointer hover:border-gray-600"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="ALL">All Levels</option>
                            <option value="HIGH">High Criticality</option>
                            <option value="MEDIUM">Medium Criticality</option>
                            <option value="LOW">Low Criticality</option>
                        </select>
                    </div>

                    <div className="h-8 w-px bg-gray-700 mx-2 hidden md:block"></div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExpandAll}
                            className="p-2.5 bg-[#0d1117] hover:bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-blue-400 transition-all"
                            title="Expand All"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleCollapseAll}
                            className="p-2.5 bg-[#0d1117] hover:bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-blue-400 transition-all"
                            title="Collapse All"
                        >
                            <Minimize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => handleExport('json')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-semibold text-sm transition-all active:scale-95">
                        <Download className="w-4 h-4 text-blue-400" /> JSON
                    </button>
                    <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-white">
                        <ExternalLink className="w-4 h-4" /> CSV
                    </button>
                </div>
            </div>

            {/* Correlation Alert */}
            {selectedServer && (
                <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl flex items-center justify-between animate-in">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Zap className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-sm text-gray-300">
                            Correlating <span className="font-bold text-blue-400">{selectedServer.name}</span>. Grouping by <span className="capitalize">{selectedServer.type.toLowerCase()}</span> + attributes.
                        </p>
                    </div>
                    <button onClick={() => setSelectedServer(null)} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">Clear</button>
                </div>
            )}

            {/* Table Area */}
            <div className="flex-1 overflow-hidden bg-[#161b22] border border-gray-800 rounded-2xl shadow-2xl flex flex-col">
                <div className="overflow-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-[#0d1117] border-b border-gray-800">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Topology Node</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">IP Address</th>
                                {dynamicColumns.map(col => (
                                    <th key={col} className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l border-gray-800/30">
                                        {col.replace(/_/g, ' ')}
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {rootNodes.map((node: any) => renderNode(node))}
                        </tbody>
                    </table>

                    {rootNodes.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                            <Database className="w-12 h-12 mb-4 opacity-10" />
                            <p className="text-lg font-medium">No results matched</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
