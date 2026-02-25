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
import type { DocPage } from './modules/documentation/types/documentation.types';

interface LogEntry {
    id: string;
    timestamp: string;
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    source: string;
    message: string;
    details?: any;
}

interface BlueprintMetadata {
    id: string;
    name: string;
    ownerId: string;
    ownerName: string;
    groupId: string;
    type: 'GLOBAL' | 'PERSONAL' | 'SHARED';
    createdAt: string;
    lastModified: string;
    storageKey: string;
    authorizedUserIds?: string[]; // '*' for universal
    authorizedGroupIds?: string[];
}

const CLEAN_BLUEPRINT_TEMPLATE = JSON.stringify({
    pops: [
        {
            id: 'pop-1',
            name: 'São Paulo HQ',
            city: 'São Paulo',
            nodes: [
                {
                    id: 'node-1',
                    type: 'SWITCH',
                    name: 'Core-Switch-01',
                    ip: '10.0.0.1',
                    status: 'ON',
                    criticality: 'HIGH',
                    attributes: [],
                    interfaces: [
                        { id: 'if-1', name: 'GigabitEthernet0/1', type: 'COPPER', status: 'ACTIVE' },
                        { id: 'if-2', name: 'GigabitEthernet0/2', type: 'FIBER', status: 'ACTIVE' }
                    ]
                },
                {
                    id: 'node-2',
                    type: 'PHYSICAL_SERVER',
                    name: 'Auth-Server-PRD',
                    ip: '10.0.0.50',
                    status: 'ON',
                    criticality: 'HIGH',
                    attributes: [],
                    interfaces: [
                        { id: 'if-3', name: 'eth0', type: 'COPPER', status: 'ACTIVE' }
                    ]
                }
            ]
        }
    ],
    links: [
        {
            sourceId: 'node-1',
            targetId: 'node-2',
            label: 'Production Uplink',
            type: 'DATA',
            routeName: 'PRD-BACKBONE',
            color: '#10b981',
            sourceHandle: 'if-2',
            targetHandle: 'if-3',
            waypoints: []
        }
    ],
    global_stats: { physicalRAM: 128, virtualRAM: 256, vcpuCount: 16, efficiency: 95 },
    schema: []
}, null, 2);

function App() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'editor' | 'map' | 'data' | 'security' | 'workspace' | 'docs' | 'profile' | 'logs'>('editor');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isSyncing, setIsSyncing] = useState(true);

    // Blueprint Management
    const [blueprintsRegistry, setBlueprintsRegistry] = useState<BlueprintMetadata[]>([]);
    const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(null);

    const [jsonPreview, setJsonPreview] = useState<string>('');
    const [jsonInput, setJsonInput] = useState<string>(''); // For live editing
    const [sidebarWidth, setSidebarWidth] = useState(400);
    const [isNavCollapsed, setIsNavCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isSaved, setIsSaved] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    // Documentation Global State
    const [docPages, setDocPages] = useState<DocPage[]>([]);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);

    const INITIAL_DOCS: DocPage[] = [
        {
            id: 'welcome',
            title: 'Infrastructure Encyclopedia Welcome',
            content: '# Welcome to the Global Infrastructure Encyclopedia\n\nThis is your central source of truth for all documentation related to the Atlas Server system.\n\n## Getting Started\n- Use the sidebar to navigate between documentation pages.\n- Click **Create New Page** to add a new document to the encyclopedia.\n- Use the **Edit Protocol** button to modify existing content.',
            lastModified: new Date().toISOString(),
            tags: ['Help', 'Overview', 'Welcome'],
            relatedNodeIds: [],
            relatedPageIds: ['editor', 'map', 'data', 'security', 'workspace', 'docs', 'logs']
        }
    ];

    const handleSaveDocPage = (updatedPage: DocPage) => {
        const newPages = docPages.some(p => p.id === updatedPage.id)
            ? docPages.map(p => p.id === updatedPage.id ? updatedPage : p)
            : [...docPages, updatedPage];

        setDocPages(newPages);
        SecurityMiddleware.secureWrite('atlas_documentation_pages', JSON.stringify(newPages));
        showToast(`Protocol "${updatedPage.title}" synchronized`, 'success');
    };


    const fileInputRef = useRef<HTMLInputElement>(null);
    const userRef = useRef<any>(null); // Ref to track current user for logs without staleness

    useEffect(() => {
        userRef.current = currentUser;
    }, [currentUser]);

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

    const handleJsonChange = (newJson: string) => {
        setJsonPreview(newJson);
        setJsonInput(newJson);
        setIsSaved(false);

        // AUTO-SAVE LOGIC: Persist to active blueprint context
        const activeBlueprint = blueprintsRegistry.find(b => b.id === activeBlueprintId);
        if (activeBlueprint) {
            SecurityMiddleware.secureWrite(activeBlueprint.storageKey, newJson);
            // Optional: Debounce this in a real high-traffic app, but here it's fine
            setIsSaved(true);
        }
    };

    const handleSchemaEdit = (value: string) => {
        setJsonInput(value);
        setIsSaved(false);
    };

    const handleManualSave = () => {
        try {
            JSON.parse(jsonInput); // Validate
            setJsonPreview(jsonInput);

            const activeBlueprint = blueprintsRegistry.find(b => b.id === activeBlueprintId);

            // STRICT CORRELATION: Always use the active blueprint's storage key
            if (!activeBlueprint) {
                showToast('No active blueprint context found', 'error');
                return;
            }

            const key = activeBlueprint.storageKey;
            SecurityMiddleware.secureWrite(key, jsonInput);

            // Update Registry Metadata
            if (activeBlueprintId) {
                const updatedRegistry = blueprintsRegistry.map(b =>
                    b.id === activeBlueprintId
                        ? { ...b, lastModified: new Date().toISOString() }
                        : b
                );
                setBlueprintsRegistry(updatedRegistry);
                SecurityMiddleware.secureWrite('atlas_blueprints_registry', JSON.stringify(updatedRegistry));
            }

            setIsSaved(true);
            showToast(`Blueprint "${activeBlueprint?.name || 'Local'}" saved successfully`, 'success');
            logEvent('INFO', 'Manual blueprint save triggered', 'EDITOR_SAVE', { target: key, name: activeBlueprint?.name });
        } catch (e) {
            showToast('Invalid JSON syntax', 'error');
        }
    };

    const switchBlueprint = (blueprintId: string) => {
        const blueprint = blueprintsRegistry.find(b => b.id === blueprintId);
        if (!blueprint) return;

        // Persist the selection (User-scoped)
        const activeKey = currentUser ? `atlas_active_bp_id_${currentUser.id}` : 'atlas_active_bp_id';
        setActiveBlueprintId(blueprintId);
        SecurityMiddleware.secureWrite(activeKey, blueprintId);

        let savedData = localStorage.getItem(blueprint.storageKey);

        // Use clean template if no data exists
        if (!savedData || savedData === '[]' || savedData === '{}') {
            savedData = CLEAN_BLUEPRINT_TEMPLATE;
        }

        setJsonPreview(savedData);
        setJsonInput(savedData);
        setIsSaved(true);
        showToast(`Sovereign Context: ${blueprint.name}`, 'info');
        logEvent('INFO', `User switched context to: ${blueprint.name}`, 'WORKSPACE_ACTION', { blueprintId });
    };

    const deleteBlueprint = (blueprintId: string) => {
        const blueprint = blueprintsRegistry.find(b => b.id === blueprintId);
        if (!blueprint) return;

        if (blueprintId === activeBlueprintId) {
            showToast('Cannot delete active blueprint', 'error');
            return;
        }

        const updatedRegistry = blueprintsRegistry.filter(b => b.id !== blueprintId);
        setBlueprintsRegistry(updatedRegistry);
        SecurityMiddleware.secureWrite('atlas_blueprints_registry', JSON.stringify(updatedRegistry));
        localStorage.removeItem(blueprint.storageKey);

        showToast(`Blueprint "${blueprint.name}" deleted`, 'success');
        logEvent('WARN', `User deleted blueprint: ${blueprint.name}`, 'WORKSPACE_ACTION', { blueprintId });
    };

    const createBlueprint = (name: string, type: BlueprintMetadata['type'] = 'PERSONAL') => {
        const user = userRef.current;
        const id = `bp_${Date.now()}`;
        const newBP: BlueprintMetadata = {
            id,
            name,
            ownerId: user?.id || 'sys',
            ownerName: user?.name || 'Authorized system',
            groupId: user?.groupId || 'default',
            type,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            storageKey: `atlas_bp_data_${id}`,
            authorizedUserIds: type === 'GLOBAL' ? ['*'] : [user?.id],
            authorizedGroupIds: type === 'SHARED' ? [user?.groupId] : []
        };

        const updatedRegistry = [...blueprintsRegistry, newBP];
        setBlueprintsRegistry(updatedRegistry);
        SecurityMiddleware.secureWrite('atlas_blueprints_registry', JSON.stringify(updatedRegistry));

        // Initialize with CLEAN template (No more cloning current data)
        SecurityMiddleware.secureWrite(newBP.storageKey, CLEAN_BLUEPRINT_TEMPLATE);

        // SYNC STATE: Reset inputs IMMEDIATELY to prevent auto-save from writing previous manifest data
        setJsonPreview(CLEAN_BLUEPRINT_TEMPLATE);
        setJsonInput(CLEAN_BLUEPRINT_TEMPLATE);
        setIsSaved(true);

        const activeKey = user ? `atlas_active_bp_id_${user.id}` : 'atlas_active_bp_id';
        setActiveBlueprintId(id);
        SecurityMiddleware.secureWrite(activeKey, id);

        showToast(`Blueprint "${name}" created`, 'success');
        logEvent('INFO', `User created blueprint: ${name}`, 'WORKSPACE_ACTION', { blueprintId: id, type });
    };

    const handleLogout = () => {
        localStorage.removeItem('atlas_session');
        setCurrentUser(null);
        showToast('Logged out successfully', 'info');
    };


    const logEvent = (level: LogEntry['level'], message: string, source: string, details?: any) => {
        const user = userRef.current;
        const newEntry: LogEntry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            level,
            message,
            source,
            details: {
                ...details,
                user: user?.name || 'Authorized System',
                userId: user?.id || 'sys',
                role: user?.role || 'SYSTEM'
            }
        };
        const updatedLogs = [newEntry, ...logs].slice(0, 1000);
        setLogs(updatedLogs);
        SecurityMiddleware.secureWrite('atlas_system_logs', JSON.stringify(updatedLogs));
        console.log(`[${level}][${source}][${user?.name || 'SYSTEM'}] ${message}`, details || '');
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
        logEvent(type === 'error' ? 'ERROR' : type === 'success' ? 'INFO' : 'DEBUG', message, 'SYSTEM_NOTIFICATION');
    };

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

    // Initial Load with data migration, server hydration and proper default
    useEffect(() => {
        const initializeApp = async () => {
            setIsSyncing(true);

            // 1. PULL FROM CLUSTER (New Server-Side Persistence)
            await SecurityMiddleware.hydrateFromServer();

            // 2. DATA MIGRATION CHECK (Legacy support)
            const migrateData = () => {
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

                let migratedCount = 0;
                keysToMigrate.forEach(({ old, new: newKey }) => {
                    const oldData = localStorage.getItem(old);
                    const newData = localStorage.getItem(newKey);

                    if (oldData && !newData) {
                        console.log(`[MIGRATION] Migrating ${old} to ${newKey}`);
                        if (newKey === 'atlas_blueprints_registry') {
                            try {
                                const registry = JSON.parse(oldData);
                                const updatedRegistry = registry.map((bp: any) => ({
                                    ...bp,
                                    storageKey: bp.storageKey.replace('antigravity_', 'atlas_')
                                }));
                                registry.forEach((bp: any) => {
                                    const oldBpKey = bp.storageKey;
                                    const newBpKey = bp.storageKey.replace('antigravity_', 'atlas_');
                                    const bpData = localStorage.getItem(oldBpKey);
                                    if (bpData) localStorage.setItem(newBpKey, bpData);
                                });
                                localStorage.setItem(newKey, JSON.stringify(updatedRegistry));
                            } catch (e) {
                                localStorage.setItem(newKey, oldData);
                            }
                        } else {
                            localStorage.setItem(newKey, oldData);
                        }
                        migratedCount++;
                    }
                });
            };

            try { migrateData(); } catch (e) { console.error('Migration failed', e); }

            // 3. LOAD SYSTEM LOGS
            const savedLogs = localStorage.getItem('atlas_system_logs');
            if (savedLogs) {
                try { setLogs(JSON.parse(savedLogs)); } catch (e) { console.error('Log load error', e); }
            }

            // 4. LOAD SESSION
            const session = localStorage.getItem('atlas_session');
            let user: any = null;
            if (session) {
                try {
                    user = JSON.parse(session);
                    if (user && !user.id) user.id = user.email || 'anonymous';
                    setCurrentUser(user);
                } catch (e) {
                    localStorage.removeItem('atlas_session');
                }
            }

            // 5. LOAD BLUEPRINT REGISTRY
            const savedRegistry = localStorage.getItem('atlas_blueprints_registry');
            let registry: BlueprintMetadata[] = [];
            if (savedRegistry) {
                try { registry = JSON.parse(savedRegistry); } catch (e) { console.error('Registry load error', e); }
            }

            if (registry.length === 0) {
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
                registry = [globalBP];
                SecurityMiddleware.secureWrite('atlas_blueprints_registry', JSON.stringify(registry));

                const legacy = localStorage.getItem('atlas_blueprint') || localStorage.getItem('antigravity_blueprint');
                if (legacy) SecurityMiddleware.secureWrite('atlas_blueprint_global', legacy);
            }
            setBlueprintsRegistry(registry);

            // 6. LOAD DOCUMENTATION
            const savedDocs = localStorage.getItem('atlas_documentation_pages');
            if (savedDocs) {
                try { setDocPages(JSON.parse(savedDocs)); } catch (e) { setDocPages(INITIAL_DOCS); }
            } else {
                setDocPages(INITIAL_DOCS);
            }

            // 7. DETERMINE ACTIVE CONTEXT
            const activeKey = user ? `atlas_active_bp_id_${user.id}` : 'atlas_active_bp_id';
            const lastActiveId = localStorage.getItem(activeKey);
            const localAuth = registry.filter((b: any) => {
                if (user?.role === 'ADMIN') return true;
                const isAuthorizedUser = b.authorizedUserIds?.includes(user?.id) || b.authorizedUserIds?.includes('*');
                const isAuthorizedGroup = b.authorizedGroupIds?.some((gid: string) => gid === user?.groupId);
                return isAuthorizedUser || isAuthorizedGroup;
            });

            const initialActive = localAuth.find((b: any) => b.id === lastActiveId) || localAuth[0] || registry[0];
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
    }, []);

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
        return <LoginView onLogin={setCurrentUser} />;
    }

    const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 200 && newWidth < 800) setSidebarWidth(newWidth);
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden" onMouseMove={handleResize} onMouseUp={() => setIsResizing(false)}>
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
            <main className="flex-1 flex flex-col overflow-hidden bg-[#0d1117] relative">
                <header className="flex items-center justify-between px-4 lg:px-8 py-5 bg-[#0a0c10] border-b border-gray-800 shadow-2xl z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            <Menu className="w-6 h-6 text-gray-400" />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                            <span className="font-black text-xl text-white tracking-tighter">AS</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold tracking-tight text-white leading-none">Atlas Server Docs</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-blue-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'}`}></span>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[150px] lg:max-w-none">
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
                                <Layers className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                            </div>
                            <select
                                value={activeBlueprintId || ''}
                                onChange={(e) => switchBlueprint(e.target.value)}
                                className="block w-full pl-9 pr-8 py-2 text-[10px] font-black uppercase tracking-widest bg-[#161b22] border border-gray-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 appearance-none hover:bg-[#1c2128] transition-all cursor-pointer"
                            >
                                {authorizedBlueprints.length > 0 ? (
                                    <>
                                        <optgroup label="System Global" className="bg-[#0a0c10] text-gray-500">
                                            {authorizedBlueprints.filter(b => b.type === 'GLOBAL').map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Private Manifests" className="bg-[#0a0c10] text-gray-400">
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
                                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                            </div>
                        </div>
                        {/* Persistent Manifest Badge - Hidden on small mobile */}
                        <div className="hidden md:flex justify-center mt-2">
                            {activeBlueprintId && (
                                <div className={`px-4 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border flex items-center gap-1.5 shadow-lg ${blueprintsRegistry.find(b => b.id === activeBlueprintId)?.type === 'GLOBAL'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                    <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                                    {authorizedBlueprints.find(b => b.id === activeBlueprintId)?.name}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-3">
                        <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={effectivePermissions.import_json === false}
                            className={`hidden md:flex px-4 py-2 border rounded-xl text-xs font-bold transition-all items-center gap-2 ${effectivePermissions.import_json !== false ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-blue-400' : 'bg-gray-800/50 border-gray-800 text-gray-600 cursor-not-allowed grayscale'}`}
                        >
                            <Download className="w-3.5 h-3.5 rotate-180" /> <span className="hidden lg:inline">Import JSON</span>
                        </button>
                        <div className="hidden md:block w-px h-6 bg-gray-800 mx-1"></div>
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
                            className={`text-[10px] font-black uppercase tracking-widest transition-all bg-blue-500/10 hover:bg-blue-500/20 px-3 lg:px-4 py-2 rounded-xl border border-blue-500/20 ${effectivePermissions.view_docs === false ? 'opacity-50 grayscale cursor-not-allowed' : 'text-blue-400 hover:text-white'}`}
                        >
                            <span className="hidden sm:inline">Docs: </span>{activeTab.toUpperCase()}
                        </button>
                    </div>
                </header>

                {/* Global Toast */}
                {toast && (
                    <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right duration-500">
                        <div className={`px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} shadow-[0_0_8px_currentColor]`}></div>
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
                <div className="flex-1 relative overflow-hidden bg-[#0d1117]">

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
                            className={`transition-all duration-300 ease-in-out shrink-0 bg-[#0d1117] border-l border-gray-800 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] z-20 overflow-hidden relative ${sidebarWidth < 50 ? 'border-none' : ''}`}
                        >
                            {/* Resize Handle */}
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-30"
                                onMouseDown={() => setIsResizing(true)}
                            />

                            {/* Sidebar Header Toggle (Matching Topology sidebar style) */}
                            <button
                                onClick={() => setSidebarWidth(sidebarWidth > 0 ? 0 : 384)}
                                className="absolute -left-3 top-20 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 text-gray-400 z-30 hover:text-white transition-colors"
                                title={sidebarWidth > 0 ? "Collapse Panel" : "Expand Panel"}
                            >
                                {sidebarWidth > 0 ? <span className="w-3 h-3 flex items-center justify-center">→</span> : <span className="w-3 h-3 flex items-center justify-center">←</span>}
                            </button>

                            <div className={`px-6 py-4 border-b border-gray-800 bg-[#161b22] flex items-center justify-between shrink-0 transition-opacity ${sidebarWidth < 100 ? 'opacity-0' : 'opacity-100'}`}>
                                <h2 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isSaved ? 'bg-emerald-500 shadow-[0_0_8px_#10b98166]' : 'bg-orange-500 animate-pulse shadow-[0_0_8px_#f59e0b66]'}`}></div>
                                    Schema Manifest
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-gray-600 uppercase font-black">{isSaved ? 'Sync Stable' : 'Unsaved Changes'}</span>
                                </div>
                            </div>

                            <div className={`flex-1 p-0 overflow-hidden bg-[#0d1117] transition-opacity ${sidebarWidth < 100 ? 'opacity-0' : 'opacity-100'}`}>
                                <textarea
                                    spellCheck={false}
                                    className="w-full h-full text-[11px] font-mono text-blue-300/80 p-6 bg-transparent outline-none resize-none custom-scrollbar leading-relaxed selection:bg-blue-500/20"
                                    value={jsonInput}
                                    onChange={(e) => handleSchemaEdit(e.target.value)}
                                    placeholder="// Paste or edit manifest JSON here..."
                                />
                            </div>

                            <div className={`p-4 bg-[#161b22] border-t border-gray-800 shrink-0 flex gap-2 transition-opacity ${sidebarWidth < 100 ? 'opacity-0' : 'opacity-100'}`}>
                                <button
                                    onClick={() => {
                                        handleManualSave();
                                        logEvent('INFO', 'Blueprint manifest manually synchronized', 'EDITOR_WORKSPACE');
                                    }}
                                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isSaved ? 'bg-gray-800 text-gray-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10'}`}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(jsonPreview);
                                        alert("Manifest copied to clipboard!");
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10"
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
