import { useState, useEffect, useRef, useMemo } from 'react';
import { Download, Layers, ChevronDown, Menu } from 'lucide-react';
import { BlueprintEditor } from './components/BlueprintEditor';
import { Navigation } from './components/Navigation';
import { InfraMap } from './components/InfraMap';
import { DataList } from './components/DataList';
import { SecurityView } from './components/SecurityView';
import { WorkspaceView } from './components/WorkspaceView';
import { DocumentationView } from './modules/documentation/components/DocumentationView';
import { DocQuickModal } from './modules/documentation/components/DocQuickModal';
import { LoginView } from './components/LoginView';
import { ProfileView } from './components/ProfileView';
import { LogView } from './components/LogView';
import { SecurityMiddleware } from './utils/securityMiddleware';
import { ThemeSwitcher } from './components/ThemeSwitcher';

// Hooks & Context
import { useUI } from './context/UIContext';
import { useToast } from './hooks/useToast';
import { useAppSession } from './hooks/useAppSession';
import { useSystemLogger } from './hooks/useSystemLogger';
import { useBlueprintManager } from './hooks/useBlueprintManager';
import { useDocumentation } from './hooks/useDocumentation';

// Constants & Types
import { CLEAN_BLUEPRINT_TEMPLATE } from './constants/templates';
import type { BlueprintMetadata } from './types/app.types';

function App() {
    // 1. Core UI State (Context)
    const {
        activeTab, setActiveTab,
        isSyncing, setIsSyncing,
        sidebarWidth, setSidebarWidth,
        isNavCollapsed, setIsNavCollapsed,
        isMobileMenuOpen, setIsMobileMenuOpen,
        theme
    } = useUI();

    // 2. Utility Hooks
    const { toast, showToast } = useToast();

    // 3. Domain Logic Hooks
    const { currentUser, setCurrentUser, userRef, handleLogout, loadSession } = useAppSession(showToast);
    const { logs, setLogs, logEvent, loadLogs } = useSystemLogger(userRef);
    const {
        blueprintsRegistry, setBlueprintsRegistry,
        activeBlueprintId, setActiveBlueprintId,
        jsonPreview, setJsonPreview,
        jsonInput, setJsonInput,
        isSaved, setIsSaved,
        switchBlueprint, handleJsonChange, handleManualSave, createBlueprint, deleteBlueprint
    } = useBlueprintManager(currentUser, logEvent, showToast);
    const {
        docPages, setDocPages,
        isDocModalOpen, setIsDocModalOpen,
        handleSaveDocPage, loadDocumentation
    } = useDocumentation(showToast);

    // 4. Local App State (Remaining)
    const [isResizing, setIsResizing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate authorized blueprints
    const authorizedBlueprints = useMemo(() => {
        if (!currentUser) return [];
        return blueprintsRegistry.filter(b => {
            if (currentUser.role === 'ADMIN') return true;
            const isAuthorizedUser = b.authorizedUserIds?.includes(currentUser.id) || b.authorizedUserIds?.includes('*');
            const isAuthorizedGroup = b.authorizedGroupIds?.some(gid => gid === currentUser.groupId);
            return isAuthorizedUser || isAuthorizedGroup;
        });
    }, [blueprintsRegistry, currentUser]);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                JSON.parse(content); // Validate JSON
                setJsonPreview(content);
                setJsonInput(content);
                showToast('JSON imported successfully', 'success');
            } catch (error) {
                showToast('Invalid JSON file', 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleSchemaEdit = (value: string) => {
        setJsonInput(value);
        setIsSaved(false);
    };


    // 5. Initial Load Orchestration
    useEffect(() => {
        const initializeApp = async () => {
            setIsSyncing(true);

            // a. Sync with Server
            await SecurityMiddleware.hydrateFromServer();

            // b. Legacy Migration
            const keysToMigrate = [
                { old: 'antigravity_session', new: 'atlas_session' },
                { old: 'antigravity_blueprints_registry', new: 'atlas_blueprints_registry' },
                { old: 'antigravity_blueprint_global', new: 'atlas_blueprint_global' },
                { old: 'antigravity_security_overrides', new: 'atlas_security_overrides' },
                { old: 'antigravity_security_columns', new: 'atlas_security_columns' },
                { old: 'antigravity_system_logs', new: 'atlas_system_logs' },
                { old: 'antigravity_groups', new: 'atlas_groups' },
                { old: 'antigravity_active_bp_id', new: 'atlas_active_bp_id' }
            ];

            keysToMigrate.forEach(({ old, new: newKey }) => {
                const oldData = localStorage.getItem(old);
                if (oldData && !localStorage.getItem(newKey)) {
                    localStorage.setItem(newKey, oldData);
                }
            });

            // c. Hydrate Data through Hooks
            // Sanitize logs storage before loading (guard against double-stringified legacy data)
            const rawLogs = localStorage.getItem('atlas_system_logs');
            if (rawLogs) {
                try {
                    const parsed = JSON.parse(rawLogs);
                    if (typeof parsed === 'string') {
                        // Double-stringified: unwrap and re-save correctly
                        const inner = JSON.parse(parsed);
                        if (Array.isArray(inner)) {
                            localStorage.setItem('atlas_system_logs', JSON.stringify(inner));
                        } else {
                            localStorage.removeItem('atlas_system_logs');
                        }
                    }
                } catch (_) {
                    localStorage.removeItem('atlas_system_logs');
                }
            }
            loadLogs();
            const user = loadSession();
            loadDocumentation();

            // Initialize Registry
            const savedRegistry = localStorage.getItem('atlas_blueprints_registry');
            let blueRegistry: BlueprintMetadata[] = [];
            if (savedRegistry) {
                try { blueRegistry = JSON.parse(savedRegistry); } catch (e) { console.error('Registry load error', e); }
            }

            if (blueRegistry.length === 0) {
                const globalBP: BlueprintMetadata = {
                    id: 'global-v1',
                    name: 'Main Production Blueprint',
                    ownerId: 'sys',
                    ownerName: 'Authorized system',
                    groupId: 'admin-group',
                    type: 'GLOBAL',
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    storageKey: 'atlas_blueprint_global',
                    authorizedUserIds: ['*'],
                    authorizedGroupIds: ['admin-group']
                };
                blueRegistry = [globalBP];
                SecurityMiddleware.secureWrite('atlas_blueprints_registry', JSON.stringify(blueRegistry));
                const legacy = localStorage.getItem('atlas_blueprint') || localStorage.getItem('antigravity_blueprint');
                if (legacy) SecurityMiddleware.secureWrite('atlas_blueprint_global', legacy);
            }
            setBlueprintsRegistry(blueRegistry);

            // d. Active Context Determination
            const activeKey = user ? `atlas_active_bp_id_${user.id}` : 'atlas_active_bp_id';
            const lastActiveId = localStorage.getItem(activeKey);

            const localAuth = blueRegistry.filter((b: BlueprintMetadata) => {
                if (user?.role === 'ADMIN') return true;
                const isAuthorizedUser = b.authorizedUserIds?.includes(user?.id) || b.authorizedUserIds?.includes('*');
                const isAuthorizedGroup = b.authorizedGroupIds?.some((gid: string) => gid === user?.groupId);
                return isAuthorizedUser || isAuthorizedGroup;
            });

            const initialActive = localAuth.find((b: BlueprintMetadata) => b.id === lastActiveId) || localAuth[0] || blueRegistry[0];
            setActiveBlueprintId(initialActive.id);

            let saved = localStorage.getItem(initialActive.storageKey);
            if (!saved || saved === '[]' || saved === '{}') {
                saved = CLEAN_BLUEPRINT_TEMPLATE;
            }

            setJsonPreview(saved);
            setJsonInput(saved);
            setIsSyncing(false);
        };

        initializeApp();
    }, [loadLogs, loadSession, loadDocumentation, setBlueprintsRegistry, setActiveBlueprintId, setJsonPreview, setJsonInput, setIsSyncing]);

    // Persist active blueprint ID (User-scoped with Security Validation)
    useEffect(() => {
        if (activeBlueprintId && currentUser) {
            SecurityMiddleware.secureWrite(`atlas_active_bp_id_${currentUser.id}`, activeBlueprintId);
        }
    }, [activeBlueprintId, currentUser]);

    // Calculate effective permissions for currentUser
    const effectivePermissions = useMemo(() => {
        if (!currentUser) return {};

        const ALL_PERMS = {
            view_editor: true, view_map: true, view_data: true, view_security: true,
            view_workspace: true, view_docs: true, view_logs: true, view_profile: true,
            view_security_intel: true,
            edit_node: true, delete_node: true, manage_security_cols: true,
            generate_report: true, import_json: true, manage_users: true
        };

        // ADMIN FALLBACK: If user has 'ADMIN' role OR is in the 'admin-group', grant full permissions immediately
        // This prevents lockout if localStorage groups haven't initialized yet
        if (currentUser.role === 'ADMIN' || currentUser.groupId === 'admin-group') {
            return ALL_PERMS;
        }

        const savedGroups = localStorage.getItem('atlas_groups');
        if (!savedGroups) return {};
        try {
            const groups = JSON.parse(savedGroups);
            const group = groups.find((g: any) => g.id === currentUser.groupId);
            return group?.permissions || {};
        } catch (e) {
            console.error('[APP] Failed to parse atlas_groups, resetting corrupted data');
            localStorage.removeItem('atlas_groups');
            return {};
        }
    }, [currentUser]);

    // Auto-save when jsonPreview changes
    useEffect(() => {
        if (jsonPreview && currentUser) {
            const timer = setTimeout(() => {
                const activeBlueprint = blueprintsRegistry.find(b => b.id === activeBlueprintId);
                if (activeBlueprint) {
                    SecurityMiddleware.secureWrite(activeBlueprint.storageKey, jsonPreview);
                } else if (currentUser.role === 'ADMIN') {
                    // Safety fallback only for global legacy state
                    SecurityMiddleware.secureWrite('atlas_blueprint_global', jsonPreview);
                }
                setIsSaved(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [jsonPreview, currentUser, activeBlueprintId, blueprintsRegistry]);

    // Navigation Middleware (Enforced by Security Policy)
    const navigateTo = (tab: "editor" | "map" | "data" | "security" | "workspace" | "docs" | "profile" | "logs") => {
        const isAuthorized = SecurityMiddleware.authorizeProtocol(`view_${tab}`, effectivePermissions);

        if (isAuthorized) {
            setActiveTab(tab);
            logEvent('INFO', `User navigated to ${tab} view`, 'NAVIGATION', { target: tab });
        } else {
            showToast(`Sovereign access denied: ${tab.toUpperCase()} protocol restricted.`, 'error');
            logEvent('WARN', `Unauthorized navigation attempt to ${tab}`, 'SECURITY_VIOLATION', { target: tab });
        }
    };

    // Navigation Guard (Double Validation/Middleware effect)
    useEffect(() => {
        if (!SecurityMiddleware.authorizeProtocol(`view_${activeTab}`, effectivePermissions)) {
            setActiveTab('profile'); // Safe fallback
            showToast('Strategic Redirect: Protocol unauthorized.', 'info');
        }
    }, [activeTab, currentUser, effectivePermissions]); // Also track currentUser to re-validate on login/logout

    // LOGIN CHECK - must be logged in to access the app
    if (!currentUser) {
        return (
            <div className={`theme-${theme} w-full h-screen relative`}>
                <LoginView onLogin={setCurrentUser} />

                {toast && (
                    <div className="fixed top-24 right-8 z-[200] animate-in slide-in-from-right duration-500">
                        <div className={`px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl backdrop-blur-xl ${toast.type === 'success' ? 'bg-[var(--status-success)]/10 border-[var(--status-success)]/20 text-[var(--status-success)]' :
                            toast.type === 'error' ? 'bg-[var(--status-error)]/10 border-[var(--status-error)]/20 text-[var(--status-error)]' :
                                'bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-[var(--status-success)]' : toast.type === 'error' ? 'bg-[var(--status-error)]' : 'bg-[var(--primary)]'} shadow-[0_0_8px_currentColor]`}></div>
                            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 200 && newWidth < 800) setSidebarWidth(newWidth);
    };

    return (
        <div className={`flex h-screen bg-[var(--bg-deep)] text-[var(--text-main)] font-sans overflow-hidden transition-all duration-300 theme-${theme}`} onMouseMove={handleResize} onMouseUp={() => setIsResizing(false)}>
            {/* LEFT NAVIGATION */}
            <Navigation
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    navigateTo(tab);
                    setIsMobileMenuOpen(false);
                }}
                collapsed={isNavCollapsed}
                onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
                user={currentUser}
                permissions={effectivePermissions}
                isMobileOpen={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
                onImportJson={() => fileInputRef.current?.click()}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-main)] relative">
                <header className="flex items-center justify-between px-4 lg:px-8 py-5 bg-[var(--bg-sidebar)] border-b border-[var(--border-main)] shadow-2xl z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-[var(--border-subtle)] rounded-xl transition-colors"
                        >
                            <Menu className="w-6 h-6 text-[var(--text-dim)]" />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary-glow)] shrink-0">
                            <span className="font-black text-xl text-[var(--text-bright)] tracking-tighter">AS</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold tracking-tight text-[var(--text-bright)] leading-none">Atlas Server Docs</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-[var(--primary)] animate-pulse' : 'bg-[var(--status-success)] shadow-[0_0_8px_var(--status-success)]'}`}></span>
                                <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-widest truncate max-w-[150px] lg:max-w-none">
                                    {isSyncing ? 'Synchronizing Cluster...' : (
                                        <>
                                            {activeTab === 'editor' && 'Blueprint Architect'}
                                            {activeTab === 'map' && 'Topological Map Rendering'}
                                            {activeTab === 'data' && 'Structured Correlation Data'}
                                            {activeTab === 'security' && 'Security Audit Framework'}
                                            {activeTab === 'workspace' && 'Strategic Resource Manager'}
                                            {activeTab === 'docs' && 'Infrastructure Encyclopedia'}
                                            {activeTab === 'profile' && 'Identity & Sovereign Profile'}
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 px-4 lg:px-8 max-w-md">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Layers className="h-3.5 w-3.5 text-[var(--text-dim)] group-hover:text-[var(--primary)] transition-colors" />
                            </div>
                            <select
                                value={activeBlueprintId || ''}
                                onChange={(e) => switchBlueprint(e.target.value)}
                                className="block w-full pl-9 pr-8 py-2 text-[10px] font-black uppercase tracking-widest bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-[var(--text-bright)] outline-none focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-[var(--primary)] appearance-none hover:bg-[var(--bg-sidebar)] transition-all cursor-pointer"
                            >
                                {authorizedBlueprints.length > 0 ? (
                                    <>
                                        <optgroup label="System Global" className="bg-[var(--bg-sidebar)] text-[var(--text-dim)]">
                                            {authorizedBlueprints.filter(b => b.type === 'GLOBAL').map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Private Manifests" className="bg-[var(--bg-sidebar)] text-[var(--text-dim)]">
                                            {authorizedBlueprints.filter(b => b.type === 'PERSONAL').map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </optgroup>
                                    </>
                                ) : (
                                    <option value="">No Blueprint Active</option>
                                )}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-dim)]" />
                            </div>
                        </div>
                        {/* Persistent Manifest Badge - Hidden on small mobile */}
                        <div className="hidden md:flex justify-center mt-2">
                            {activeBlueprintId && (
                                <div className={`px-4 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border flex items-center gap-1.5 shadow-lg ${blueprintsRegistry.find(b => b.id === activeBlueprintId)?.type === 'GLOBAL'
                                    ? 'bg-[var(--status-success)]/10 text-[var(--status-success)] border-[var(--status-success)]/20 shadow-[0_4px_12px_var(--status-success)]/10'
                                    : 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 shadow-[0_4px_12px_var(--primary-glow)]/10'
                                    }`}>
                                    <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                                    {authorizedBlueprints.find(b => b.id === activeBlueprintId)?.name}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-3">
                        <ThemeSwitcher />
                        <div className="hidden md:block w-px h-6 bg-[var(--border-main)] mx-1"></div>
                        <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={effectivePermissions.import_json === false}
                            className={`hidden md:flex px-4 py-2 border rounded-xl text-xs font-bold transition-all items-center gap-2 ${effectivePermissions.import_json !== false ? 'bg-[var(--bg-deep)] hover:bg-[var(--border-subtle)] border-[var(--border-main)] text-[var(--primary)]' : 'bg-[var(--bg-deep)]/50 border-[var(--border-main)] text-[var(--text-dim)] cursor-not-allowed grayscale'}`}
                        >
                            <Download className="w-3.5 h-3.5 rotate-180" /> <span className="hidden lg:inline">Import JSON</span>
                        </button>
                        <div className="hidden md:block w-px h-6 bg-[var(--border-main)] mx-1"></div>
                        <button
                            onClick={() => {
                                if (effectivePermissions.view_docs !== false) {
                                    setIsDocModalOpen(true);
                                    logEvent('INFO', `Quick Documentation accessed for ${activeTab.toUpperCase()} context`, 'SYSTEM_HELP');
                                } else {
                                    showToast('Sovereign Docs Restricted', 'error');
                                }
                            }}
                            disabled={effectivePermissions.view_docs === false}
                            className={`text-[10px] font-black uppercase tracking-widest transition-all bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 px-3 lg:px-4 py-2 rounded-xl border border-[var(--primary)]/20 ${effectivePermissions.view_docs === false ? 'opacity-50 grayscale cursor-not-allowed' : 'text-[var(--primary)] hover:text-[var(--text-bright)]'}`}
                        >
                            <span className="hidden sm:inline">Docs: </span>{activeTab.toUpperCase()}
                        </button>
                    </div>
                </header>

                {/* Global Toast */}
                {toast && (
                    <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right duration-500">
                        <div className={`px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl backdrop-blur-xl ${toast.type === 'success' ? 'bg-[var(--status-success)]/10 border-[var(--status-success)]/20 text-[var(--status-success)]' :
                            toast.type === 'error' ? 'bg-[var(--status-error)]/10 border-[var(--status-error)]/20 text-[var(--status-error)]' :
                                'bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-[var(--status-success)]' : toast.type === 'error' ? 'bg-[var(--status-error)]' : 'bg-[var(--primary)]'} shadow-[0_0_8px_currentColor]`}></div>
                            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
                        </div>
                    </div>
                )}

                {/* Documentation Global Modal */}
                <DocQuickModal
                    isOpen={isDocModalOpen}
                    onClose={() => setIsDocModalOpen(false)}
                    pages={docPages}
                    currentTab={activeTab}
                    onFullDocumentation={() => {
                        setIsDocModalOpen(false);
                        setActiveTab('docs');
                    }}
                />

                {/* View Switcher */}
                <div className="flex-1 relative overflow-hidden bg-[var(--bg-main)]">

                    {/* EDITOR VIEW */}
                    <div className={`absolute inset-0 flex ${activeTab === 'editor' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
                        <div className="flex-1 relative min-w-0">
                            <BlueprintEditor
                                onJsonChange={handleJsonChange}
                                initialData={jsonPreview}
                                permissions={effectivePermissions}
                                workspaceMode={currentUser?.role === 'ADMIN' ? 'GLOBAL' : 'PERSONAL'}
                            />
                        </div>

                        {/* Live Preview Sidebar for Editor */}
                        <div
                            style={{ width: sidebarWidth }}
                            className={`transition-all duration-300 ease-in-out shrink-0 bg-[var(--bg-main)] border-l border-[var(--border-main)] flex flex-col shadow-[var(--shadow-premium)] z-20 overflow-hidden relative ${sidebarWidth < 50 ? 'border-none' : ''}`}
                        >
                            {/* Resize Handle */}
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--primary)]/50 transition-colors z-30"
                                onMouseDown={() => setIsResizing(true)}
                            />

                            {/* Sidebar Header Toggle (Matching Topology sidebar style) */}
                            <button
                                onClick={() => setSidebarWidth(sidebarWidth > 0 ? 0 : 384)}
                                className="absolute -left-3 top-20 w-6 h-6 bg-[var(--bg-card)] rounded-full flex items-center justify-center border border-[var(--border-main)] text-[var(--text-dim)] z-40 hover:text-[var(--text-bright)] transition-colors"
                                title={sidebarWidth > 0 ? "Collapse Panel" : "Expand Panel"}
                            >
                                {sidebarWidth > 0 ? <span className="w-3 h-3 flex items-center justify-center">→</span> : <span className="w-3 h-3 flex items-center justify-center">←</span>}
                            </button>

                            <div className={`px-6 py-4 border-b border-[var(--border-main)] bg-[var(--bg-card)] flex items-center justify-between shrink-0 transition-opacity ${sidebarWidth < 100 ? 'opacity-0' : 'opacity-100'}`}>
                                <h2 className="font-bold text-[var(--text-dim)] text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isSaved ? 'bg-[var(--status-success)] shadow-[0_0_8px_var(--status-success)]' : 'bg-[var(--status-warn)] animate-pulse shadow-[0_0_8px_var(--status-warn)]'}`}></div>
                                    Schema Manifest
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase font-black">{isSaved ? 'Sync Stable' : 'Unsaved Changes'}</span>
                                </div>
                            </div>

                            <div className={`flex-1 p-0 overflow-hidden bg-[var(--bg-main)] transition-opacity ${sidebarWidth < 100 ? 'opacity-0' : 'opacity-100'}`}>
                                <textarea
                                    spellCheck={false}
                                    className="w-full h-full text-[11px] font-mono text-[var(--primary)] p-6 bg-transparent outline-none resize-none custom-scrollbar leading-relaxed selection:bg-[var(--primary-glow)]"
                                    value={jsonInput}
                                    onChange={(e) => handleSchemaEdit(e.target.value)}
                                    placeholder="// Paste or edit manifest JSON here..."
                                />
                            </div>

                            <div className={`p-4 bg-[var(--bg-card)] border-t border-[var(--border-main)] shrink-0 flex gap-2 transition-opacity ${sidebarWidth < 100 ? 'opacity-0' : 'opacity-100'}`}>
                                <button
                                    onClick={() => {
                                        handleManualSave();
                                        logEvent('INFO', 'Blueprint manifest manually synchronized', 'EDITOR_WORKSPACE');
                                    }}
                                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isSaved ? 'bg-[var(--bg-deep)] text-[var(--text-dim)]' : 'bg-[var(--status-success)] hover:opacity-90 text-white shadow-lg shadow-[var(--status-success)]/10'}`}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(jsonPreview);
                                        alert("Manifest copied to clipboard!");
                                    }}
                                    className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[var(--primary-glow)]/10"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MAP VIEW */}
                    {activeTab === 'map' && (
                        <div className="absolute inset-0 z-10">
                            <InfraMap
                                jsonData={jsonPreview}
                                onJsonChange={handleSchemaEdit}
                            />
                        </div>
                    )}

                    {/* DATA VIEW */}
                    {activeTab === 'data' && (
                        <div className="absolute inset-0 z-10">
                            <DataList jsonData={jsonPreview} />
                        </div>
                    )}

                    {/* SECURITY VIEW */}
                    <div className={`absolute inset-0 flex ${activeTab === 'security' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
                        <SecurityView jsonData={jsonPreview} showToast={showToast} currentUser={currentUser} logEvent={logEvent} permissions={effectivePermissions} />
                    </div>

                    {/* WORKSPACE VIEW */}
                    <div className={`absolute inset-0 flex ${activeTab === 'workspace' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
                        <WorkspaceView
                            jsonData={jsonPreview}
                            showToast={showToast}
                            currentUser={currentUser}
                            permissions={effectivePermissions}
                            blueprintsRegistry={blueprintsRegistry}
                            activeBlueprintId={activeBlueprintId || ''}
                            onSwitchBlueprint={switchBlueprint}
                            onCreateBlueprint={createBlueprint}
                            onDeleteBlueprint={deleteBlueprint}
                        />
                    </div>

                    {/* DOCUMENTATION VIEW */}
                    <div className={`absolute inset-0 flex ${activeTab === 'docs' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
                        <DocumentationView
                            pages={docPages}
                            onSavePage={handleSaveDocPage}
                            onDeletePage={(id: string) => {
                                const newPages = docPages.filter(p => p.id !== id);
                                setDocPages(newPages);
                                SecurityMiddleware.secureWrite('atlas_documentation_pages', JSON.stringify(newPages));
                            }}
                        />
                    </div>

                    {/* LOGS VIEW */}
                    <div className={`absolute inset-0 flex ${activeTab === 'logs' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
                        <LogView logs={logs} onClearLogs={() => setLogs([])} permissions={effectivePermissions} />
                    </div>

                    {/* PROFILE VIEW */}
                    <div className={`absolute inset-0 flex ${activeTab === 'profile' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
                        <ProfileView
                            user={currentUser}
                            logs={logs}
                            onViewFullHistory={() => navigateTo('logs')}
                            onLogout={handleLogout}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
