import { LayoutGrid, Network, List, Compass, Settings, Shield, ChevronLeft, ChevronRight, ScrollText, Download } from 'lucide-react';

interface NavigationProps {
    activeTab: 'editor' | 'map' | 'data' | 'security' | 'workspace' | 'docs' | 'profile' | 'logs';
    setActiveTab: (tab: 'editor' | 'map' | 'data' | 'security' | 'workspace' | 'docs' | 'profile' | 'logs') => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
    user: any;
    permissions: any;
    isMobileOpen?: boolean;
    onCloseMobile?: () => void;
    onImportJson?: () => void;
}

export const Navigation = ({ activeTab, setActiveTab, collapsed, onToggleCollapse, user, permissions, isMobileOpen, onCloseMobile, onImportJson }: NavigationProps) => {
    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1050] lg:hidden"
                    onClick={onCloseMobile}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 lg:relative
                ${collapsed ? 'w-20' : 'w-64'} 
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                h-full bg-[#0a0c10] border-r border-gray-800 flex flex-col py-6 z-[1100] lg:z-20 
                shadow-2xl transition-all duration-300 ease-in-out
            `}>
                {/* Collapse Toggle */}
                <button
                    onClick={onToggleCollapse}
                    className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border border-gray-800 text-white shadow-lg z-30 hover:bg-blue-500 transition-colors"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <div className={`px-6 mb-8 flex items-center gap-3 transition-all ${collapsed ? 'justify-center px-0' : ''}`}>
                    <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Compass className="text-white w-6 h-6" />
                    </div>
                    {!collapsed && (
                        <div className="animate-in fade-in duration-500">
                            <h2 className="text-sm font-bold tracking-wider text-white uppercase">Atlas Server</h2>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">System Console</p>
                        </div>
                    )}
                </div>

                <div className={`flex-1 space-y-2 ${collapsed ? 'px-2' : 'px-4'}`}>
                    {!collapsed && <div className="text-[10px] font-semibold text-gray-500 uppercase px-2 mb-2 tracking-[0.2em] animate-in fade-in">Main Views</div>}

                    {permissions.view_editor !== false && (
                        <button
                            onClick={() => setActiveTab('editor')}
                            title={collapsed ? "Visual Editor" : ""}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'editor'
                                ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.2)]'
                                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                } ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                            <LayoutGrid className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'editor' ? 'text-blue-400' : 'group-hover:text-blue-300'}`} />
                            {!collapsed && <span className="font-medium text-sm animate-in fade-in">Visual Editor</span>}
                            {!collapsed && activeTab === 'editor' && (
                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                            )}
                        </button>
                    )}

                    {permissions.view_map !== false && (
                        <button
                            onClick={() => setActiveTab('map')}
                            title={collapsed ? "Infra Map" : ""}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'map'
                                ? 'bg-purple-600/10 text-purple-400 shadow-[inset_0_0_0_1px_rgba(147,51,234,0.2)]'
                                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                } ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                            <Network className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'map' ? 'text-purple-400' : 'group-hover:text-purple-300'}`} />
                            {!collapsed && <span className="font-medium text-sm animate-in fade-in">Infra Map</span>}
                            {!collapsed && activeTab === 'map' && (
                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
                            )}
                        </button>
                    )}

                    {permissions.view_data !== false && (
                        <button
                            onClick={() => setActiveTab('data')}
                            title={collapsed ? "Correlated Data" : ""}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'data'
                                ? 'bg-emerald-600/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                } ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                            <List className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'data' ? 'text-emerald-400' : 'group-hover:text-emerald-300'}`} />
                            {!collapsed && <span className="font-medium text-sm animate-in fade-in">Correlated Data</span>}
                            {!collapsed && activeTab === 'data' && (
                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                            )}
                        </button>
                    )}

                    <div className={`pt-6 ${collapsed ? 'border-t border-gray-800/50' : ''}`}>
                        {!collapsed && <div className="text-[10px] font-semibold text-gray-500 uppercase px-2 mb-2 tracking-[0.2em] animate-in fade-in">Management</div>}

                        {permissions.view_security !== false && (
                            <button
                                onClick={() => setActiveTab('security')}
                                title={collapsed ? "Security" : ""}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'security'
                                    ? 'bg-red-600/10 text-red-400 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]'
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                    } ${collapsed ? 'justify-center px-0' : ''}`}
                            >
                                <Shield className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'security' ? 'text-red-400' : 'group-hover:text-red-300'}`} />
                                {!collapsed && <span className="font-medium text-sm animate-in fade-in">Security</span>}
                                {!collapsed && activeTab === 'security' && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                                )}
                            </button>
                        )}

                        {permissions.view_workspace !== false && (
                            <button
                                onClick={() => setActiveTab('workspace')}
                                title={collapsed ? "Workspace" : ""}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'workspace'
                                    ? 'bg-amber-600/10 text-amber-400 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.2)]'
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                    } ${collapsed ? 'justify-center px-0' : ''}`}
                            >
                                <Settings className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'workspace' ? 'text-amber-400' : 'group-hover:text-amber-300'}`} />
                                {!collapsed && <span className="font-medium text-sm animate-in fade-in">Workspace</span>}
                                {!collapsed && activeTab === 'workspace' && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                                )}
                            </button>
                        )}

                        {permissions.view_docs !== false && (
                            <button
                                onClick={() => setActiveTab('docs')}
                                title={collapsed ? "Documentation" : ""}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'docs'
                                    ? 'bg-cyan-600/10 text-cyan-400 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.2)]'
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                    } ${collapsed ? 'justify-center px-0' : ''}`}
                            >
                                <Compass className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'docs' ? 'text-cyan-400' : 'group-hover:text-cyan-300'}`} />
                                {!collapsed && <span className="font-medium text-sm animate-in fade-in">Documentation</span>}
                                {!collapsed && activeTab === 'docs' && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => setActiveTab('logs')}
                            title={collapsed ? "System Logs" : ""}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'logs'
                                ? 'bg-gray-600/20 text-gray-300 shadow-[inset_0_0_0_1px_rgba(156,163,175,0.2)]'
                                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                } ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                            <ScrollText className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'logs' ? 'text-gray-200' : 'group-hover:text-gray-300'}`} />
                            {!collapsed && <span className="font-medium text-sm animate-in fade-in">System Logs</span>}
                            {!collapsed && activeTab === 'logs' && (
                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.6)]"></div>
                            )}
                        </button>

                        {/* Mobile-only Import JSON */}
                        {isMobileOpen && onImportJson && (
                            <button
                                onClick={onImportJson}
                                className="lg:hidden w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-blue-400 hover:bg-blue-600/10 mt-2"
                            >
                                <Download className="w-5 h-5 shrink-0 rotate-180" />
                                <span className="font-bold text-sm uppercase tracking-widest">Import JSON</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className={`px-6 py-4 mt-auto border-t border-gray-800/50 ${collapsed ? 'px-0 flex justify-center' : ''}`}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className="flex items-center gap-3 w-full hover:bg-white/5 p-2 rounded-2xl transition-all group"
                    >
                        <div className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 ring-2 ring-gray-800 shadow-inner flex items-center justify-center text-[10px] font-bold text-white group-hover:scale-110 transition-transform ${activeTab === 'profile' ? 'ring-blue-500 ring-offset-2 ring-offset-[#0a0c10]' : ''}`}>
                            {user?.name?.[0] || 'A'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0 animate-in slide-in-from-left duration-300 text-left">
                                <p className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition-colors">{user?.name || 'Administrator'}</p>
                                <p className="text-[10px] text-gray-500 truncate uppercase tracking-tighter">Sovereign Identity</p>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};
