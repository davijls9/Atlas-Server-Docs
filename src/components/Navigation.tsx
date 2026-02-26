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
                    className="fixed inset-0 bg-[var(--bg-deep)]/60 backdrop-blur-sm z-[1050] lg:hidden"
                    onClick={onCloseMobile}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 lg:relative
                ${collapsed ? 'w-20' : 'w-64'} 
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-main)] flex flex-col py-6 z-[1100] lg:z-20 
                shadow-2xl transition-all duration-300 ease-in-out
            `}>
                {/* Collapse Toggle */}
                <button
                    onClick={onToggleCollapse}
                    className="absolute -right-3 top-20 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center border border-[var(--border-main)] text-white shadow-lg z-30 hover:opacity-90 transition-all"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <div className={`px-6 mb-8 flex items-center gap-3 transition-all ${collapsed ? 'justify-center px-0' : ''}`}>
                    <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--status-info)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary-glow)]">
                        <Compass className="text-white w-6 h-6" />
                    </div>
                    {!collapsed && (
                        <div className="animate-in fade-in duration-500">
                            <h2 className="text-sm font-bold tracking-wider text-[var(--text-bright)] uppercase">Atlas Server</h2>
                            <p className="text-[10px] text-[var(--text-dim)] font-medium uppercase tracking-tighter">System Console</p>
                        </div>
                    )}
                </div>

                <div className={`flex-1 space-y-2 ${collapsed ? 'px-2' : 'px-4'}`}>
                    {!collapsed && <div className="text-[10px] font-semibold text-[var(--text-dim)] uppercase px-2 mb-2 tracking-[0.2em] animate-in fade-in">Main Views</div>}

                    {permissions.view_editor !== false && (
                        <button
                            onClick={() => setActiveTab('editor')}
                            title={collapsed ? "Visual Editor" : ""}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'editor'
                                ? 'bg-[var(--primary-glow)] text-[var(--primary)] shadow-[inset_0_0_0_1px_var(--border-accent)]'
                                : 'text-[var(--text-dim)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]'
                                } ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                            <LayoutGrid className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'editor' ? 'text-[var(--primary)]' : 'group-hover:text-[var(--text-main)]'}`} />
                            {!collapsed && <span className="font-medium text-sm animate-in fade-in">Visual Editor</span>}
                            {!collapsed && activeTab === 'editor' && (
                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary-glow)]"></div>
                            )}
                        </button>
                    )}

                    {permissions.view_map !== false && (
                        <button
                            onClick={() => setActiveTab('map')}
                            title={collapsed ? "Infra Map" : ""}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'map'
                                ? 'bg-[var(--accent)]/10 text-[var(--accent)] shadow-[inset_0_0_0_1px_var(--accent)]/20'
                                : 'text-[var(--text-dim)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]'
                                } ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                            <Network className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'map' ? 'text-[var(--accent)]' : 'group-hover:text-[var(--accent)]'}`} />
                            {!collapsed && <span className="font-medium text-sm animate-in fade-in">Infra Map</span>}
                            {!collapsed && activeTab === 'map' && (
                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]/40"></div>
                            )}
                        </button>
                    )}

                    {permissions.view_data !== false && (
                        <button
                            onClick={() => setActiveTab('data')}
                            title={collapsed ? "Correlated Data" : ""}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'data'
                                ? 'bg-[var(--secondary)]/10 text-[var(--secondary)] shadow-[inset_0_0_0_1px_var(--secondary)]/20'
                                : 'text-[var(--text-dim)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]'
                                } ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                            <List className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'data' ? 'text-[var(--secondary)]' : 'group-hover:text-[var(--secondary)]'}`} />
                            {!collapsed && <span className="font-medium text-sm animate-in fade-in">Correlated Data</span>}
                            {!collapsed && activeTab === 'data' && (
                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[var(--secondary)] shadow-[0_0_8px_var(--secondary)]/40"></div>
                            )}
                        </button>
                    )}

                    <div className={`pt-6 ${collapsed ? 'border-t border-[var(--border-main)]/50' : ''}`}>
                        {!collapsed && <div className="text-[10px] font-semibold text-[var(--text-dim)] uppercase px-2 mb-2 tracking-[0.2em] animate-in fade-in">Management</div>}

                        {permissions.view_security !== false && (
                            <button
                                onClick={() => setActiveTab('security')}
                                title={collapsed ? "Security" : ""}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'security'
                                    ? 'bg-[var(--status-error)]/10 text-[var(--status-error)] shadow-[inset_0_0_0_1px_var(--status-error)]/20'
                                    : 'text-[var(--text-dim)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]'
                                    } ${collapsed ? 'justify-center px-0' : ''}`}
                            >
                                <Shield className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'security' ? 'text-[var(--status-error)]' : 'group-hover:text-[var(--status-error)]'}`} />
                                {!collapsed && <span className="font-medium text-sm animate-in fade-in">Security</span>}
                                {!collapsed && activeTab === 'security' && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[var(--status-error)] shadow-[0_0_8px_var(--status-error)]/40"></div>
                                )}
                            </button>
                        )}

                        {permissions.view_workspace !== false && (
                            <button
                                onClick={() => setActiveTab('workspace')}
                                title={collapsed ? "Workspace" : ""}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'workspace'
                                    ? 'bg-[var(--status-warn)]/10 text-[var(--status-warn)] shadow-[inset_0_0_0_1px_var(--status-warn)]/20'
                                    : 'text-[var(--text-dim)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]'
                                    } ${collapsed ? 'justify-center px-0' : ''}`}
                            >
                                <Settings className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'workspace' ? 'text-[var(--status-warn)]' : 'group-hover:text-[var(--status-warn)]'}`} />
                                {!collapsed && <span className="font-medium text-sm animate-in fade-in">Workspace</span>}
                                {!collapsed && activeTab === 'workspace' && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[var(--status-warn)] shadow-[0_0_8px_var(--status-warn)]/40"></div>
                                )}
                            </button>
                        )}

                        {permissions.view_docs !== false && (
                            <button
                                onClick={() => setActiveTab('docs')}
                                title={collapsed ? "Documentation" : ""}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'docs'
                                    ? 'bg-[var(--status-info)]/10 text-[var(--status-info)] shadow-[inset_0_0_0_1px_var(--status-info)]/20'
                                    : 'text-[var(--text-dim)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]'
                                    } ${collapsed ? 'justify-center px-0' : ''}`}
                            >
                                <Compass className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'docs' ? 'text-[var(--status-info)]' : 'group-hover:text-[var(--status-info)]'}`} />
                                {!collapsed && <span className="font-medium text-sm animate-in fade-in">Documentation</span>}
                                {!collapsed && activeTab === 'docs' && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[var(--status-info)] shadow-[0_0_8px_var(--status-info)]/40"></div>
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => setActiveTab('logs')}
                            title={collapsed ? "System Logs" : ""}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'logs'
                                ? 'bg-[var(--text-main)]/10 text-[var(--text-main)] shadow-[inset_0_0_0_1px_var(--text-main)]/20'
                                : 'text-[var(--text-dim)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-main)]'
                                } ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                            <ScrollText className={`w-5 h-5 shrink-0 transition-colors ${activeTab === 'logs' ? 'text-[var(--text-main)]' : 'group-hover:text-[var(--text-main)]'}`} />
                            {!collapsed && <span className="font-medium text-sm animate-in fade-in">System Logs</span>}
                            {!collapsed && activeTab === 'logs' && (
                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[var(--text-dim)] shadow-[0_0_8px_var(--text-dim)]/40"></div>
                            )}
                        </button>

                        {/* Mobile-only Import JSON */}
                        {isMobileOpen && onImportJson && (
                            <button
                                onClick={onImportJson}
                                className="lg:hidden w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-[var(--primary)] hover:bg-[var(--primary-glow)] mt-2"
                            >
                                <Download className="w-5 h-5 shrink-0 rotate-180" />
                                <span className="font-bold text-sm uppercase tracking-widest">Import JSON</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className={`px-6 py-4 mt-auto border-t border-[var(--border-main)]/50 ${collapsed ? 'px-0 flex justify-center' : ''}`}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className="flex items-center gap-3 w-full hover:bg-[var(--border-subtle)] p-2 rounded-2xl transition-all group"
                    >
                        <div className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-[var(--border-main)] to-[var(--bg-deep)] ring-2 ring-[var(--border-main)] shadow-inner flex items-center justify-center text-[10px] font-bold text-[var(--text-bright)] group-hover:scale-110 transition-transform ${activeTab === 'profile' ? 'ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-sidebar)]' : ''}`}>
                            {user?.name?.[0] || 'A'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0 animate-in slide-in-from-left duration-300 text-left">
                                <p className="text-xs font-semibold text-[var(--text-main)] truncate group-hover:text-[var(--primary)] transition-colors">{user?.name || 'Administrator'}</p>
                                <p className="text-[10px] text-[var(--text-dim)] truncate uppercase tracking-tighter">Sovereign Identity</p>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};
