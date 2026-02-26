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
            case 'DEBUG': return 'text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20';
            case 'INFO': return 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20';
            case 'WARN': return 'text-[var(--status-warn)] bg-[var(--status-warn)]/10 border-[var(--status-warn)]/20';
            case 'ERROR': return 'text-[var(--status-error)] bg-[var(--status-error)]/10 border-[var(--status-error)]/20';
            default: return 'text-[var(--text-dim)] bg-[var(--text-dim)]/10 border-[var(--text-dim)]/20';
        }
    };

    const getSourceIcon = (source: string) => {
        if (source.includes('EDITOR')) return <Cpu className="w-3 h-3" />;
        if (source.includes('DATA') || source.includes('SCHEMA')) return <Database className="w-3 h-3" />;
        if (source.includes('AUTH') || source.includes('SECURITY')) return <ShieldAlert className="w-3 h-3" />;
        return <Info className="w-3 h-3" />;
    };

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-main)] p-8 space-y-8 animate-in fade-in duration-500 overflow-hidden">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-[var(--bg-card)] px-6 py-4 rounded-2xl border border-[var(--border-main)] shadow-xl border-l-2 border-l-[var(--text-dim)]">
                    <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1">Total Logs</p>
                    <h3 className="text-xl font-black text-[var(--text-bright)]">{stats.total}</h3>
                </div>
                <div className="bg-[var(--bg-card)] px-6 py-4 rounded-2xl border border-[var(--border-main)] shadow-xl border-l-2 border-l-[var(--primary)]">
                    <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1">Information</p>
                    <h3 className="text-xl font-black text-[var(--primary)]">{stats.info}</h3>
                </div>
                <div className="bg-[var(--bg-card)] px-6 py-4 rounded-2xl border border-[var(--border-main)] shadow-xl border-l-2 border-l-[var(--status-warn)]">
                    <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1">Warnings</p>
                    <h3 className="text-xl font-black text-[var(--status-warn)]">{stats.warn}</h3>
                </div>
                <div className="bg-[var(--bg-card)] px-6 py-4 rounded-2xl border border-[var(--border-main)] shadow-xl border-l-2 border-l-[var(--status-error)]">
                    <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1">Critical Errors</p>
                    <h3 className="text-xl font-black text-[var(--status-error)]">{stats.error}</h3>
                </div>
                <div className="bg-[var(--bg-card)] px-6 py-4 rounded-2xl border border-[var(--border-main)] shadow-xl border-l-2 border-l-[var(--accent)]">
                    <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1">Debug Events</p>
                    <h3 className="text-xl font-black text-[var(--accent)]">{stats.debug}</h3>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-[var(--bg-card)] rounded-[32px] border border-[var(--border-main)] shadow-2xl overflow-hidden flex flex-col flex-1 relative">
                <div className="p-6 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-sidebar)]">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-main)]">
                            <button
                                onClick={() => setActiveTab('logs')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'logs' ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
                            >
                                <ScrollText className="w-3.5 h-3.5" />
                                System Audit
                            </button>
                            <button
                                onClick={() => setActiveTab('modules')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'modules' ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
                            >
                                <LayoutPanelLeft className="w-3.5 h-3.5" />
                                Module Health
                            </button>
                            <button
                                onClick={() => setActiveTab('errors')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'errors' ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
                            >
                                <Bug className="w-3.5 h-3.5" />
                                Error Tracking
                            </button>
                            {permissions?.view_security_intel && (
                                <button
                                    onClick={() => setActiveTab('intel')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'intel' ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
                                >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>Security Intel</span>
                                    <span className="text-[7px] bg-[var(--status-error)]/20 text-[var(--status-error)] px-1 rounded-sm border border-[var(--status-error)]/30">STRATEGEM</span>
                                </button>
                            )}
                        </div>

                        {activeTab === 'logs' && (
                            <>
                                <div className="h-8 w-px bg-[var(--border-main)]"></div>

                                {/* Search */}
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] transition-colors group-focus-within:text-[var(--primary)]" />
                                    <input
                                        type="text"
                                        placeholder="Search logs (message, source...)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl py-2 pl-10 pr-4 text-xs text-[var(--text-main)] w-64 focus:border-[var(--primary)] outline-none transition-all font-medium"
                                    />
                                </div>

                                {/* Level Filter */}
                                <div className="flex items-center gap-2 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-main)]">
                                    {['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setLevelFilter(lvl as any)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${levelFilter === lvl ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
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
                            className="px-6 py-2.5 bg-[var(--status-error)]/10 hover:bg-[var(--status-error)] text-[var(--status-error)] hover:text-white rounded-2xl text-[9px] font-black uppercase border border-[var(--status-error)]/20 transition-all flex items-center gap-2 group"
                        >
                            <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Clear Audit Chain
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    {activeTab === 'logs' ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-[var(--bg-sidebar)] z-10 border-b border-[var(--border-main)]">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Timestamp</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Level</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Identity</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Source</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Event Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-main)]/50 font-mono">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-[var(--bg-deep)] rounded-full border border-[var(--border-main)]">
                                                    <Filter className="w-8 h-8 text-[var(--text-dim)]" />
                                                </div>
                                                <p className="text-[var(--text-dim)] text-sm font-bold uppercase tracking-widest italic">No matching system logs discovered in orbit</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-[var(--text-bright)]/[0.015] transition-colors group">
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-3.5 h-3.5 text-[var(--text-dim)] opacity-50" />
                                                    <span className="text-[11px] text-[var(--text-dim)] font-bold uppercase tracking-tighter italic">
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </span>
                                                    <span className="text-[9px] text-[var(--text-dim)] font-black opacity-30">
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
                                                    <div className="w-6 h-6 rounded bg-[var(--bg-deep)] flex items-center justify-center text-[8px] font-black text-[var(--text-dim)]">
                                                        {(log.details?.user || 'SYS').split(' ').map((n: string) => n[0]).join('')}
                                                    </div>
                                                    <span className="text-[10px] text-[var(--text-main)] font-bold uppercase tracking-tight">{log.details?.user || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 bg-[var(--bg-deep)] rounded text-[var(--text-dim)]">
                                                        {getSourceIcon(log.source)}
                                                    </div>
                                                    <span className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest">{log.source}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-[11px] text-[var(--text-main)] font-medium leading-relaxed">{log.message}</p>
                                                    {log.details && (
                                                        <div className="text-[9px] text-[var(--text-dim)] bg-[var(--bg-deep)] p-2 rounded-lg border border-[var(--border-main)] group-hover:border-[var(--text-dim)]/30 transition-colors font-mono">
                                                            {(() => {
                                                                // Filter out identity fields from display as they are in the column
                                                                const { user, userId, role, ...rest } = log.details || {};
                                                                if (Object.keys(rest).length === 0) return null;

                                                                return (
                                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                                        {Object.entries(rest).map(([key, value]) => (
                                                                            <div key={key} className="flex gap-2">
                                                                                <span className="text-[var(--text-dim)] uppercase tracking-wider">{key}:</span>
                                                                                <span className="text-[var(--primary)] truncate">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
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
                                    <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <ModuleAnalysis modules={modules} />
                            )}
                        </div>
                    ) : activeTab === 'errors' ? (
                        <div className="p-8">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
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
