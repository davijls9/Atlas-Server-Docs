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
        <div className="flex-1 flex flex-col bg-[#0d1117] overflow-auto custom-scrollbar p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Identity Banner */}
            <div className="min-h-32 sm:h-48 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-transparent rounded-[24px] sm:rounded-[32px] border border-gray-800 flex flex-col sm:flex-row items-center justify-center sm:justify-start px-6 sm:px-12 py-6 sm:py-0 relative overflow-hidden group gap-4 sm:gap-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

                <div className="relative group/avatar shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] sm:rounded-[32px] bg-gradient-to-tr from-gray-800 to-gray-700 border-2 border-gray-700 flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-2xl">
                        {user?.name?.[0] || 'A'}
                    </div>
                </div>

                <div className="sm:ml-8 text-center sm:text-left space-y-1 sm:space-y-2">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase truncate max-w-[200px] sm:max-w-none">{user?.name}</h2>
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest">{user?.role}</span>
                    </div>
                    <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 font-bold uppercase text-[9px] sm:text-xs tracking-tighter">
                        <Mail className="w-3.5 h-3.5" /> {user?.email}
                    </p>
                </div>

                <div className="sm:ml-auto flex gap-4 w-full sm:w-auto">
                    <button
                        onClick={onLogout}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase text-red-500 transition-all active:scale-95 shadow-lg shadow-red-500/5"
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
                        <div className="bg-[#161b22] p-8 rounded-[32px] border border-gray-800 shadow-xl space-y-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-2">
                                <Activity className="w-3 h-3 text-blue-500" /> Identity Signature
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-[#0d1117] rounded-2xl border border-gray-800/50">
                                    <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3" /> Registration</span>
                                    <span className="text-xs font-bold text-gray-300 capitalize">{user?.joinedAt || 'Jan 2026'}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-[#0d1117] rounded-2xl border border-gray-800/50">
                                    <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Clearance Level</span>
                                    <span className="text-xs font-bold text-blue-400 capitalize">Tier-1 Administrator</span>
                                </div>
                            </div>
                        </div>

                        {/* Security Center & Password */}
                        <div className="bg-[#161b22] p-8 rounded-[32px] border border-gray-800 shadow-2xl flex flex-col space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-600/10 rounded-xl">
                                    <Lock className="w-5 h-5 text-purple-400" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Sovereign Security Center</h3>
                            </div>

                            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Current Authentication Key</label>
                                        <input type="password" placeholder="••••••••" autoComplete="current-password" className="w-full bg-[#0d1117] border border-gray-800 transition-all rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-purple-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">New Symmetric Key</label>
                                        <input type="password" placeholder="Min 12 characters" autoComplete="new-password" className="w-full bg-[#0d1117] border border-gray-800 transition-all rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-purple-500" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-purple-500/10 transition-all">Rotate Security Keys</button>
                            </form>
                        </div>
                    </div>

                    {/* Interface Preferences */}
                    <div className="bg-[#161b22] p-8 rounded-[32px] border border-gray-800 shadow-xl space-y-6">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-2">
                            <Bell className="w-3 h-3 text-emerald-500" /> Interface Preferences
                        </h3>

                        <div className="flex justify-between items-center p-4 bg-[#0d1117] rounded-2xl border border-gray-800/50">
                            <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Protocol Alerts</span>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.3)]' : 'bg-gray-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-red-500/5 rounded-[32px] border border-red-500/10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Danger Zone</p>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">De-authorize this terminal session</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-red-500/10"
                        >
                            Terminate Session
                        </button>
                    </div>
                </div>

                {/* Right Column - System Activity Logs */}
                <div className="lg:col-span-5 bg-[#161b22] rounded-[32px] border border-gray-800 shadow-2xl flex flex-col overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-[#1c2128]/50 overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600/10 rounded-xl">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest truncate">Activity Audit Logs</h3>
                        </div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest shrink-0">Recent Trends</span>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-3">
                        {logs.slice(0, 10).map((log, i) => (
                            <div key={log.id || i} className="flex flex-col gap-2 p-5 hover:bg-white/[0.02] rounded-[2rem] transition-colors border border-transparent hover:border-gray-800/50 group">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-gray-200 uppercase tracking-widest">{log.action || log.message.split(' ').slice(0, 2).join('_').replace(/:/g, '').toUpperCase()}</p>
                                    <span className={`px-2 py-0.5 ${(log.level === 'ERROR' || log.level === 'WARN') ? 'bg-red-500/5 text-red-500 border-red-500/10' : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'} text-[8px] font-black uppercase rounded border`}>{log.level === 'ERROR' ? 'FAILED' : 'SUCCESS'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter italic truncate max-w-[150px]">{log.source || 'System'}</p>
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{formatRelativeTime(log.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                                <Activity className="w-8 h-8 mb-4 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No spectral activity detected</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-gray-800 bg-[#1c2128]/20 mt-auto">
                        <button
                            onClick={onViewFullHistory}
                            className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                        >
                            View Full History Manifest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
