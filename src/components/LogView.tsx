import { useMemo, useState } from 'react';
import { ScrollText, Search, Filter, Trash2, Clock, Info, ShieldAlert, Cpu, Database, LayoutPanelLeft, Bug } from 'lucide-react';
import { ModuleAnalysis } from '../modules/documentation/components/ModuleAnalysis';
import { ErrorAnalysis } from '../modules/documentation/components/ErrorAnalysis';
import { SecurityIntel } from './SecurityIntel';
import { useModuleMetrics } from '../modules/documentation/hooks/useModuleMetrics';

interface LogEntry {
    id: string;
    timestamp: string;
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    source: string;
    message: string;
    details?: any;
}

interface LogViewProps {
    logs: LogEntry[];
    onClearLogs: () => void;
    permissions?: any;
}

export const LogView = ({ logs, onClearLogs, permissions }: LogViewProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<'ALL' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
    const [activeTab, setActiveTab] = useState<'logs' | 'modules' | 'errors' | 'intel'>('logs');
    const { modules, isLoading } = useModuleMetrics();

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch =
                log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.source.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
            return matchesSearch && matchesLevel;
        });
    }, [logs, searchTerm, levelFilter]);

    const stats = useMemo(() => {
        return {
            total: logs.length,
            debug: logs.filter(l => l.level === 'DEBUG').length,
            info: logs.filter(l => l.level === 'INFO').length,
            warn: logs.filter(l => l.level === 'WARN').length,
            error: logs.filter(l => l.level === 'ERROR').length,
        };
    }, [logs]);

    const getLevelStyle = (level: string) => {
        switch (level) {
            case 'DEBUG': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
            case 'INFO': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'WARN': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'ERROR': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getSourceIcon = (source: string) => {
        if (source.includes('EDITOR')) return <Cpu className="w-3 h-3" />;
        if (source.includes('DATA') || source.includes('SCHEMA')) return <Database className="w-3 h-3" />;
        if (source.includes('AUTH') || source.includes('SECURITY')) return <ShieldAlert className="w-3 h-3" />;
        return <Info className="w-3 h-3" />;
    };

    return (
        <div className="flex-1 flex flex-col bg-[#0d1117] p-8 space-y-8 animate-in fade-in duration-500 overflow-hidden">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-[#161b22] px-6 py-4 rounded-2xl border border-gray-800 shadow-xl border-l-2 border-l-gray-500">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Logs</p>
                    <h3 className="text-xl font-black text-white">{stats.total}</h3>
                </div>
                <div className="bg-[#161b22] px-6 py-4 rounded-2xl border border-gray-800 shadow-xl border-l-2 border-l-blue-500">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Information</p>
                    <h3 className="text-xl font-black text-blue-400">{stats.info}</h3>
                </div>
                <div className="bg-[#161b22] px-6 py-4 rounded-2xl border border-gray-800 shadow-xl border-l-2 border-l-yellow-500">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Warnings</p>
                    <h3 className="text-xl font-black text-yellow-500">{stats.warn}</h3>
                </div>
                <div className="bg-[#161b22] px-6 py-4 rounded-2xl border border-gray-800 shadow-xl border-l-2 border-l-red-500">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Critical Errors</p>
                    <h3 className="text-xl font-black text-red-500">{stats.error}</h3>
                </div>
                <div className="bg-[#161b22] px-6 py-4 rounded-2xl border border-gray-800 shadow-xl border-l-2 border-l-purple-500">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Debug Events</p>
                    <h3 className="text-xl font-black text-purple-400">{stats.debug}</h3>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-[#161b22] rounded-[32px] border border-gray-800 shadow-2xl overflow-hidden flex flex-col flex-1 relative">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1c2128]">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-[#0d1117] p-1 rounded-xl border border-gray-800">
                            <button
                                onClick={() => setActiveTab('logs')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'logs' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <ScrollText className="w-3.5 h-3.5" />
                                System Audit
                            </button>
                            <button
                                onClick={() => setActiveTab('modules')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'modules' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <LayoutPanelLeft className="w-3.5 h-3.5" />
                                Module Health
                            </button>
                            <button
                                onClick={() => setActiveTab('errors')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'errors' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Bug className="w-3.5 h-3.5" />
                                Error Tracking
                            </button>
                            {permissions?.view_security_intel && (
                                <button
                                    onClick={() => setActiveTab('intel')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'intel' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>Security Intel</span>
                                    <span className="text-[7px] bg-red-500/20 text-red-500 px-1 rounded-sm border border-red-500/30">STRATEGEM</span>
                                </button>
                            )}
                        </div>

                        {activeTab === 'logs' && (
                            <>
                                <div className="h-8 w-px bg-gray-800"></div>

                                {/* Search */}
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-blue-400" />
                                    <input
                                        type="text"
                                        placeholder="Search logs (message, source...)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-[#0d1117] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white w-64 focus:border-blue-500 outline-none transition-all font-medium"
                                    />
                                </div>

                                {/* Level Filter */}
                                <div className="flex items-center gap-2 bg-[#0d1117] p-1 rounded-xl border border-gray-800">
                                    {['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setLevelFilter(lvl as any)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${levelFilter === lvl ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {activeTab === 'logs' && (
                        <button
                            onClick={onClearLogs}
                            className="px-6 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl text-[9px] font-black uppercase border border-red-500/20 transition-all flex items-center gap-2 group"
                        >
                            <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Clear Audit Chain
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    {activeTab === 'logs' ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-[#1c2128] z-10 border-b border-gray-800">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Timestamp</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Level</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Identity</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Source</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Event Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50 font-mono">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-gray-800/20 rounded-full border border-gray-800/50">
                                                    <Filter className="w-8 h-8 text-gray-600" />
                                                </div>
                                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest italic">No matching system logs discovered in orbit</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/[0.015] transition-colors group">
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                                                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter italic">
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </span>
                                                    <span className="text-[9px] text-gray-700 font-black">
                                                        .{new Date(log.timestamp).getMilliseconds().toString().padStart(3, '0')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border tracking-widest ${getLevelStyle(log.level)}`}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center text-[8px] font-black text-gray-500">
                                                        {(log.details?.user || 'SYS').split(' ').map((n: string) => n[0]).join('')}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{log.details?.user || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 bg-gray-800 rounded text-gray-500">
                                                        {getSourceIcon(log.source)}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{log.source}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-[11px] text-gray-200 font-medium leading-relaxed">{log.message}</p>
                                                    {log.details && (
                                                        <div className="text-[9px] text-gray-500 bg-black/20 p-2 rounded-lg border border-gray-800 group-hover:border-gray-700 transition-colors font-mono">
                                                            {(() => {
                                                                // Filter out identity fields from display as they are in the column
                                                                const { user, userId, role, ...rest } = log.details || {};
                                                                if (Object.keys(rest).length === 0) return null;

                                                                return (
                                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                                        {Object.entries(rest).map(([key, value]) => (
                                                                            <div key={key} className="flex gap-2">
                                                                                <span className="text-gray-600 uppercase tracking-wider">{key}:</span>
                                                                                <span className="text-blue-400 truncate">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : activeTab === 'modules' ? (
                        <div className="p-8">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <ModuleAnalysis modules={modules} />
                            )}
                        </div>
                    ) : activeTab === 'errors' ? (
                        <div className="p-8">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <ErrorAnalysis modules={modules} />
                            )}
                        </div>
                    ) : (
                        <SecurityIntel />
                    )}
                </div>
            </div>
        </div>
    );
};
