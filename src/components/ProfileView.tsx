import { useState } from 'react';
import { Mail, Calendar, Activity, LogOut, Bell, ShieldCheck, Lock } from 'lucide-react';

interface ProfileViewProps {
    user: any;
    logs: any[];
    onViewFullHistory: () => void;
    onLogout: () => void;
}

export const ProfileView = ({ user, logs, onViewFullHistory, onLogout }: ProfileViewProps) => {
    const [notifications, setNotifications] = useState(true);

    const formatRelativeTime = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-main)] overflow-auto custom-scrollbar p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Identity Banner */}
            <div className="min-h-32 sm:h-48 bg-gradient-to-r from-[var(--primary)]/20 via-[var(--accent)]/20 to-transparent rounded-[24px] sm:rounded-[32px] border border-[var(--border-main)] flex flex-col sm:flex-row items-center justify-center sm:justify-start px-6 sm:px-12 py-6 sm:py-0 relative overflow-hidden group gap-4 sm:gap-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className="relative group/avatar shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] sm:rounded-[32px] bg-gradient-to-tr from-[var(--border-main)] to-[var(--bg-deep)] border-2 border-[var(--border-main)] flex items-center justify-center text-3xl sm:text-4xl font-black text-[var(--text-bright)] shadow-2xl">
                        {user?.name?.[0] || 'A'}
                    </div>
                </div>

                <div className="sm:ml-8 text-center sm:text-left space-y-1 sm:space-y-2">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                        <h2 className="text-xl sm:text-3xl font-black text-[var(--text-bright)] tracking-tight uppercase truncate max-w-[200px] sm:max-w-none">{user?.name || 'Administrator'}</h2>
                        <span className="px-2 py-0.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full text-[8px] sm:text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">{user?.role || 'ADMIN'}</span>
                    </div>
                    <p className="flex items-center justify-center sm:justify-start gap-2 text-[var(--text-dim)] font-bold uppercase text-[9px] sm:text-xs tracking-tighter">
                        <Mail className="w-3.5 h-3.5" /> {user?.email || 'admin@antigravity.io'}
                    </p>
                </div>

                <div className="sm:ml-auto flex gap-4 w-full sm:w-auto">
                    <button
                        onClick={onLogout}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[var(--status-error)]/10 hover:bg-[var(--status-error)]/20 border border-[var(--status-error)]/20 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase text-[var(--status-error)] transition-all active:scale-95 shadow-lg shadow-[var(--status-error)]/5"
                    >
                        <LogOut className="w-4 h-4" /> <span className="sm:inline">Logout</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                {/* Left/Main Column - Identification & Security */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
                        {/* Stats & Identity */}
                        <div className="bg-[var(--bg-card)] p-8 rounded-[32px] border border-[var(--border-main)] shadow-xl space-y-6">
                            <h3 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest flex items-center gap-2 px-2">
                                <Activity className="w-3 h-3 text-[var(--primary)]" /> Identity Signature
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)]/50">
                                    <span className="text-[10px] font-black uppercase text-[var(--text-dim)] tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3" /> Registration</span>
                                    <span className="text-xs font-bold text-[var(--text-main)] capitalize">{user?.joinedAt || 'Jan 2026'}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)]/50">
                                    <span className="text-[10px] font-black uppercase text-[var(--text-dim)] tracking-widest flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Clearance Level</span>
                                    <span className="text-xs font-bold text-[var(--primary)] capitalize">
                                        {user?.groupId === 'admin-group' ? 'Tier-1 Root Admin' :
                                            user?.groupId === 'engineer-group' ? 'Tier-2 Infrastructure' :
                                                user?.groupId === 'viewer-group' ? 'Tier-3 Auditor' : 'Special Authorization'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Security Center & Password */}
                        <div className="bg-[var(--bg-card)] p-8 rounded-[32px] border border-[var(--border-main)] shadow-2xl flex flex-col space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--accent)]/10 rounded-xl">
                                    <Lock className="w-5 h-5 text-[var(--accent)]" />
                                </div>
                                <h3 className="text-sm font-black text-[var(--text-bright)] uppercase tracking-widest">Sovereign Security Center</h3>
                            </div>

                            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest ml-1">Current Authentication Key</label>
                                        <input type="password" placeholder="••••••••" autoComplete="current-password" className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] transition-all rounded-xl py-3 px-4 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest ml-1">New Symmetric Key</label>
                                        <input type="password" placeholder="Min 12 characters" autoComplete="new-password" className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] transition-all rounded-xl py-3 px-4 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)]" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-3 bg-[var(--accent)] hover:opacity-90 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-[var(--accent)]/10 transition-all">Rotate Security Keys</button>
                            </form>
                        </div>
                    </div>

                    {/* Interface Preferences */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-[32px] border border-[var(--border-main)] shadow-xl space-y-6">
                        <h3 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest flex items-center gap-2 px-2">
                            <Bell className="w-3 h-3 text-[var(--status-success)]" /> Interface Preferences
                        </h3>

                        <div className="flex justify-between items-center p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)]/50">
                            <span className="text-[10px] font-black uppercase text-[var(--text-dim)] tracking-widest">Protocol Alerts</span>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'bg-[var(--primary)] shadow-[var(--primary-glow)]' : 'bg-[var(--border-main)]'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-[var(--status-error)]/5 rounded-[32px] border border-[var(--status-error)]/10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-[var(--status-error)] uppercase tracking-widest">Danger Zone</p>
                            <p className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-tighter">De-authorize this terminal session</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-6 py-2.5 bg-[var(--status-error)] hover:opacity-90 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-[var(--status-error)]/10"
                        >
                            Terminate Session
                        </button>
                    </div>
                </div>

                {/* Right Column - System Activity Logs */}
                <div className="lg:col-span-5 bg-[var(--bg-card)] rounded-[32px] border border-[var(--border-main)] shadow-2xl flex flex-col overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-sidebar)]/50 overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--primary)]/10 rounded-xl">
                                <Activity className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <h3 className="text-sm font-black text-[var(--text-bright)] uppercase tracking-widest truncate">Activity Audit Logs</h3>
                        </div>
                        <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest shrink-0">Recent Trends</span>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-3">
                        {logs.slice(0, 10).map((log, i) => (
                            <div key={log.id || i} className="flex flex-col gap-2 p-5 hover:bg-white/[0.02] rounded-[2rem] transition-colors border border-transparent hover:border-[var(--border-main)]/50 group">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest">{log.action || log.message.split(' ').slice(0, 2).join('_').replace(/:/g, '').toUpperCase()}</p>
                                    <span className={`px-2 py-0.5 ${(log.level === 'ERROR' || log.level === 'WARN') ? 'bg-[var(--status-error)]/5 text-[var(--status-error)] border-[var(--status-error)]/10' : 'bg-[var(--status-success)]/5 text-[var(--status-success)] border-[var(--status-success)]/10'} text-[8px] font-black uppercase rounded border`}>{log.level === 'ERROR' ? 'FAILED' : 'SUCCESS'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-tighter italic truncate max-w-[150px]">{log.source || 'System'}</p>
                                    <p className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">{formatRelativeTime(log.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-[var(--text-dim)]">
                                <Activity className="w-8 h-8 mb-4 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No spectral activity detected</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-[var(--border-main)] bg-[var(--bg-sidebar)]/20 mt-auto">
                        <button
                            onClick={onViewFullHistory}
                            className="w-full py-4 bg-[var(--border-subtle)] hover:opacity-90 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                        >
                            View Full History Manifest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
