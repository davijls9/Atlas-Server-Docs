import { useState, useEffect, useMemo } from 'react';
import { SecurityMiddleware } from '../utils/securityMiddleware';
import {
    Users, Shield, Lock, Search, Save,
    Edit2, Trash2, X, Globe, Plus, ExternalLink, RefreshCw, Eye, EyeOff
} from 'lucide-react';

const PERMISSION_ACTIONS = [
    { id: 'view_editor', label: 'Access Blueprint Editor', category: 'PAGES', description: 'View and interact with the infrastructure architect.' },
    { id: 'view_map', label: 'Access Topology Map', category: 'PAGES', description: 'Visualize the infrastructure layout and connectivity.' },
    { id: 'view_data', label: 'Access Correlated Data', category: 'PAGES', description: 'Access structured technical specifications and relationships.' },
    { id: 'view_security', label: 'Access Security Audit', category: 'PAGES', description: 'Monitor and configure security audit frameworks.' },
    { id: 'view_workspace', label: 'Access Workspace Governance', category: 'PAGES', description: 'Manage personnel, groups, and global orchestration.' },
    { id: 'view_docs', label: 'Access Documentation', category: 'PAGES', description: 'View the comprehensive infrastructure encyclopedia.' },
    { id: 'view_logs', label: 'Access System Logs', category: 'PAGES', description: 'Monitor system events and operational audit trails.' },
    { id: 'view_security_intel', label: 'Access Security Intelligence', category: 'PAGES', description: 'Interactive architectural security monitor and forensics.' },
    { id: 'view_profile', label: 'Access Identity Profile', category: 'PAGES', description: 'Manage personal identity and security credentials.' },
    { id: 'add_pop', label: 'Deploy POP Cluster', category: 'ACTIONS', description: 'Initialize and deploy new infrastructure clusters.' },
    { id: 'delete_pop', label: 'Decommission POP Cluster', category: 'ACTIONS', description: 'Permanently remove infrastructure clusters and nested nodes.' },
    { id: 'edit_pop_metadata', label: 'Configure POP Metadata', category: 'ACTIONS', description: 'Modify cluster designations, locations, and global attributes.' },
    { id: 'edit_node', label: 'Modify Infrastructure Nodes', category: 'ACTIONS', description: 'Add, edit, or configure individual infrastructure nodes.' },
    { id: 'delete_node', label: 'Delete Infrastructure Nodes', category: 'ACTIONS', description: 'Remove individual nodes from the architectural blueprint.' },
    { id: 'edit_blueprint_schema', label: 'Architect Schema Protocols', category: 'ACTIONS', description: 'Define and modify global attribute structures and types.' },
    { id: 'manage_security_cols', label: 'Manage Audit Columns', category: 'ACTIONS', description: 'Configure visible metrics in the security framework.' },
    { id: 'generate_report', label: 'Generate Reports', category: 'ACTIONS', description: 'Export architectural and security status reports.' },
    { id: 'export_csv', label: 'Export Dataset CSV', category: 'ACTIONS', description: 'Extract raw infrastructure metrics into spreadsheet format.' },
    { id: 'import_json', label: 'Import JSON Data', category: 'ACTIONS', description: 'Deploy data from external JSON manifest files.' },
    { id: 'manage_users', label: 'Personnel Management', category: 'ACTIONS', description: 'Deploy identities, assign groups, and manage credentials.' },
    { id: 'view_audit_log', label: 'View Security Audit Log', category: 'ACTIONS', description: 'Access detailed logs of security violations and access attempts.' },
];

const DEFAULT_GROUPS = [
    {
        id: 'admin-group',
        name: 'Administrators',
        permissions: PERMISSION_ACTIONS.reduce((acc, action) => ({ ...acc, [action.id]: true }), {})
    },
    {
        id: 'viewer-group',
        name: 'Standard Personnel',
        permissions: {
            view_editor: true, view_map: true, view_data: true, view_docs: true,
            view_logs: false, view_profile: true,
            edit_node: false, delete_node: false, manage_security_cols: false,
            generate_report: false, import_json: false, view_security: false, view_workspace: false, manage_users: false
        }
    }
];

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
    authorizedUserIds?: string[];
    authorizedGroupIds?: string[];
}

interface WorkspaceViewProps {
    jsonData?: string;
    showToast?: (m: string, t?: 'success' | 'error' | 'info') => void;
    currentUser: any;
    permissions?: any;
    blueprintsRegistry?: BlueprintMetadata[];
    activeBlueprintId?: string;
    onSwitchBlueprint?: (id: string) => void;
    onCreateBlueprint?: (name: string, type: 'GLOBAL' | 'PERSONAL' | 'SHARED') => void;
    onDeleteBlueprint?: (id: string) => void;
}

export const WorkspaceView = ({
    jsonData,
    showToast,
    currentUser,
    permissions,
    blueprintsRegistry = [],
    activeBlueprintId = '',
    onSwitchBlueprint,
    onCreateBlueprint,
    onDeleteBlueprint
}: WorkspaceViewProps) => {
    const [activeSubTab, setActiveSubTab] = useState<'personnel' | 'resources'>('personnel');
    const [users, setUsers] = useState<any[]>([]);
    const [permissionGroups, setPermissionGroups] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [showGroupManager, setShowGroupManager] = useState(false);
    const [showBlueprintModal, setShowBlueprintModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editingGroup, setEditingGroup] = useState<any>(null);
    const [showACLModal, setShowACLModal] = useState(false);
    const [aclBlueprint, setACLBlueprint] = useState<BlueprintMetadata | null>(null);
    const [showUserPassword, setShowUserPassword] = useState(false);
    const [showAddGroupModal, setShowAddGroupModal] = useState(false);
    const [isSavingGovernance, setIsSavingGovernance] = useState(false);
    const [isRenamingGroup, setIsRenamingGroup] = useState(false);
    const [newNameValue, setNewNameValue] = useState('');

    // Governance Filtering
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [actionSearchTerm, setActionSearchTerm] = useState('');

    // Derived Metrics from jsonData
    const metrics = useMemo(() => {
        if (!jsonData) return { clusterDistribution: [] };
        try {
            const data = JSON.parse(jsonData);
            const pops = data.pops || [];
            const totalNodes = pops.reduce((acc: number, p: any) => acc + (p.nodes?.length || 0), 0);

            const distribution = pops.map((p: any) => ({
                name: p.name,
                val: totalNodes > 0 ? `${Math.round(((p.nodes?.length || 0) / totalNodes) * 100)}%` : '0%',
                color: p.name.includes('CORE') ? 'bg-emerald-500' : p.name.includes('EDGE') ? 'bg-blue-500' : 'bg-amber-500'
            }));

            return { clusterDistribution: distribution };
        } catch (e) {
            return { clusterDistribution: [] };
        }
    }, [jsonData]);

    // Initial Data Load
    useEffect(() => {
        const savedUsers = localStorage.getItem('atlas_users');
        const savedGroups = localStorage.getItem('atlas_groups') || localStorage.getItem('antigravity_groups');

        if (savedUsers) {
            try {
                const parsed = JSON.parse(savedUsers);
                if (Array.isArray(parsed)) {
                    // Filter out any completely invalid objects and ensure valid group assignment
                    const validUsers = parsed.filter(u => u && typeof u === 'object' && u.id).map(u => ({
                        ...u,
                        groupId: u.groupId || 'viewer-group' // Force standard group if missing
                    }));
                    setUsers(validUsers.length > 0 ? validUsers : [{ id: 'admin-root', name: 'Administrator', email: 'admin@antigravity.io', groupId: 'admin-group', status: 'ACTIVE', lastLogin: 'Never', password: 'password123' }]);
                }
            } catch (e) { /* ignore corrupted */ }
        } else {
            const initialUsers = [
                { id: 'admin-root', name: 'Administrator', email: 'admin@antigravity.io', groupId: 'admin-group', status: 'ACTIVE', lastLogin: '2024-02-11 10:30', password: 'password123' },
                { id: '2', name: 'John Doe', email: 'john@antigravity.io', groupId: 'engineer-group', status: 'ACTIVE', lastLogin: '2024-02-11 09:15', password: 'password123' }
            ];
            setUsers(initialUsers);
            SecurityMiddleware.secureWrite('atlas_users', JSON.stringify(initialUsers));
        }

        if (savedGroups) {
            try {
                const parsed = JSON.parse(savedGroups);
                if (Array.isArray(parsed)) {
                    // Combine with DEFAULT_GROUPS and deduplicate by ID, prioritizing saved data
                    const combined = [...parsed];
                    DEFAULT_GROUPS.forEach(dg => {
                        if (!combined.find(g => g.id === dg.id)) {
                            combined.push(dg);
                        }
                    });

                    // MERGING LOGIC: Ensure all groups have all current PERMISSION_ACTIONS
                    const migratedGroups = combined.map(group => {
                        if (!group || typeof group !== 'object' || !group.id) return null;
                        const currentPerms = group.permissions || {};
                        const mergedPerms = { ...currentPerms };
                        PERMISSION_ACTIONS.forEach(action => {
                            if (mergedPerms[action.id] === undefined) {
                                mergedPerms[action.id] = group.id === 'admin-group';
                            }
                        });
                        return { ...group, permissions: mergedPerms };
                    }).filter(Boolean) as any[];

                    setPermissionGroups(migratedGroups);
                    SecurityMiddleware.secureWrite('atlas_groups', JSON.stringify(migratedGroups));
                }
            } catch (e) {
                setPermissionGroups(DEFAULT_GROUPS);
                SecurityMiddleware.secureWrite('atlas_groups', JSON.stringify(DEFAULT_GROUPS));
            }
        } else {
            setPermissionGroups(DEFAULT_GROUPS);
            SecurityMiddleware.secureWrite('atlas_groups', JSON.stringify(DEFAULT_GROUPS));
        }
    }, []);

    const saveUsers = (newUsers: any[]) => {
        setUsers(newUsers);
        SecurityMiddleware.secureWrite('atlas_users', JSON.stringify(newUsers));
    };

    const saveGroups = (newGroups: any[]) => {
        setPermissionGroups(newGroups);
        SecurityMiddleware.secureWrite('atlas_groups', JSON.stringify(newGroups));
    };

    const handleAddGroup = () => {
        setShowAddGroupModal(true);
    };

    const handleAddGroupComplete = (name: string) => {
        const newGroup = {
            id: `group_${Date.now()}`,
            name,
            permissions: PERMISSION_ACTIONS.reduce((acc, action) => ({ ...acc, [action.id]: false }), {})
        };
        saveGroups([...permissionGroups, newGroup]);
        setEditingGroup(newGroup);
        setShowAddGroupModal(false);
        showToast?.(`New security tier "${name}" initialized`, 'success');
    };

    const handleDeleteGroup = (id: string, e: React.MouseEvent | React.FocusEvent | any) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (e && e.preventDefault) e.preventDefault();

        if (id === 'admin-group' || id === 'viewer-group') {
            showToast?.('Core security tier cannot be decommissioned', 'error');
            return;
        }

        const confirmMsg = 'Decommission this security tier? All personnel in this tier will be reassigned to standard clearance.';
        if (window.confirm(confirmMsg)) {
            // Reassign users to viewer-group
            const updatedUsers = users.map(u => u.groupId === id ? { ...u, groupId: 'viewer-group' } : u);
            saveUsers(updatedUsers);

            // Filter groups
            const updatedGroups = permissionGroups.filter(g => g.id !== id);
            saveGroups(updatedGroups);

            if (editingGroup?.id === id) setEditingGroup(null);
            showToast?.('Security tier purged and personnel reassigned', 'info');
        }
    };

    const handleRenameGroup = () => {
        if (!editingGroup || !newNameValue.trim()) return;
        const updated = permissionGroups.map(g => g.id === editingGroup.id ? { ...g, name: newNameValue.trim() } : g);
        saveGroups(updated);
        setEditingGroup({ ...editingGroup, name: newNameValue.trim() });
        setIsRenamingGroup(false);
        showToast?.('Security tier designation updated', 'success');
    };

    const handleAddUser = (userData: any) => {
        const newUser = {
            ...userData,
            id: `user_${Date.now()}`,
            groupId: userData.groupId || 'viewer-group', // Integrity check
            status: 'ACTIVE',
            lastLogin: 'Never',
            email: userData.email.trim().toLowerCase()
        };
        saveUsers([...users, newUser]);
        setShowUserModal(false);
        setShowUserPassword(false);
        showToast?.(`Identity "${newUser.name}" deployed`, 'success');
    };

    const handleUpdateUser = (userData: any) => {
        const normalizedData = {
            ...userData,
            email: userData.email.trim().toLowerCase()
        };
        const updated = users.map(u => u.id === normalizedData.id ? { ...u, ...normalizedData } : u);
        saveUsers(updated);
        setShowUserModal(false);
        setShowUserPassword(false);
        setEditingUser(null);
        showToast?.(`Personnel profile synchronized`, 'success');
    };

    const handleDeleteUser = (id: string) => {
        if (confirm('Decommission this personnel identity?')) {
            saveUsers(users.filter(u => u.id !== id));
            showToast?.(`Identity purged`, 'info');
        }
    };

    const getGroupName = (groupId: string) => {
        const group = permissionGroups.find(g => g.id === groupId);
        if (group) return group.name;
        return 'ORPHANED/UNKNOWN';
    };

    const canManageUsers = useMemo(() => {
        if (permissions?.manage_users !== undefined) return permissions.manage_users === true;
        if (currentUser?.role === 'ADMIN') return true;
        return false;
    }, [currentUser, permissions]);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Users className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Strategic Resource Manager</h2>
                        <p className="text-xs text-amber-500 font-bold uppercase mt-1 tracking-widest">Global Governance & Asset Orchestration</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-[#161b22] rounded-2xl p-1 border border-gray-800">
                        <button
                            onClick={() => setActiveSubTab('personnel')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'personnel' ? 'bg-amber-500 text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Personnel Hub
                        </button>
                        <button
                            onClick={() => setActiveSubTab('resources')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'resources' ? 'bg-blue-500 text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Blueprint Cluster
                        </button>
                    </div>
                    {canManageUsers && (
                        <button
                            onClick={() => setShowGroupManager(true)}
                            className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl text-amber-500 transition-all shadow-xl"
                            title="Governance Policy Matrix"
                        >
                            <Shield className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </header>

            {activeSubTab === 'personnel' ? (
                <div className="flex-1 flex flex-col min-h-0 space-y-6">
                    {/* Personnel Content */}
                    <div className="grid grid-cols-4 gap-6">
                        <div className="bg-[#161b22] p-6 rounded-[2rem] border border-gray-800 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white">{users.length}</p>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Active Personnel</p>
                            </div>
                        </div>
                        <div className="bg-[#161b22] p-6 rounded-[2rem] border border-gray-800 flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white">{permissionGroups.length}</p>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Security Tiers</p>
                            </div>
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-3">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    type="text"
                                    placeholder="Search Personnel..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-white outline-none focus:border-amber-500 transition-all font-bold"
                                />
                            </div>
                            <button
                                onClick={() => setShowUserModal(true)}
                                className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Deploy Identity
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-[#161b22] rounded-[2.5rem] border border-gray-800 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-[#1c2128] z-10 border-b border-gray-800">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Identity</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Clearance</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Synced</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="group hover:bg-white/[0.01]">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-xs font-black text-gray-500">
                                                        {user.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white uppercase">{user.name}</p>
                                                        <p className="text-[10px] text-gray-600 font-medium lowercase">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-500/5 rounded-lg border border-blue-500/10 italic truncate max-w-[200px] inline-block" title={getGroupName(user.groupId)}>
                                                    {getGroupName(user.groupId)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                {user.lastLogin}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setEditingUser(user); setShowUserModal(true); }} className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2.5 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0 space-y-8">
                    {/* Blueprint Cluster View */}
                    <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
                        <div className="col-span-8 flex flex-col space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                    <Globe className="w-6 h-6 text-blue-500" /> Blueprint Repository
                                </h3>
                                <button
                                    onClick={() => setShowBlueprintModal(true)}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-500/20"
                                >
                                    <Plus className="w-4 h-4" /> Provision New Cluster
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-2 gap-6">
                                {blueprintsRegistry.map(blueprint => (
                                    <div
                                        key={blueprint.id}
                                        className={`p-8 bg-[#161b22] border rounded-[2.5rem] flex flex-col transition-all group relative overflow-hidden ${activeBlueprintId === blueprint.id ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20' : 'border-gray-800 hover:border-gray-700'}`}
                                    >
                                        {activeBlueprintId === blueprint.id && (
                                            <div className="absolute top-0 right-0 px-6 py-2 bg-blue-500 text-black text-[9px] font-black uppercase tracking-widest rounded-bl-3xl shadow-2xl">
                                                Active Manifest
                                            </div>
                                        )}

                                        <div className="mb-6 flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${blueprint.type === 'GLOBAL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                <ExternalLink className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white uppercase tracking-tighter italic leading-none">{blueprint.name}</h4>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">{blueprint.type} Manifest</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-8">
                                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-1.5">Architect</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{blueprint.ownerName}</p>
                                            </div>
                                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-1.5">Timestamp</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(blueprint.lastModified).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                disabled={activeBlueprintId === blueprint.id}
                                                onClick={() => onSwitchBlueprint?.(blueprint.id)}
                                                className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeBlueprintId === blueprint.id ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/10'}`}
                                            >
                                                {activeBlueprintId === blueprint.id ? 'Synchronized' : 'Switch Blueprint'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setACLBlueprint(blueprint);
                                                    setShowACLModal(true);
                                                }}
                                                className="p-3.5 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-2xl transition-all"
                                                title="Manage Access Control"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const newName = prompt('Enter new designation:', blueprint.name);
                                                    if (newName) {
                                                        const updated = blueprintsRegistry.map(b => b.id === blueprint.id ? { ...b, name: newName } : b);
                                                        SecurityMiddleware.secureWrite('antigravity_blueprints_registry', JSON.stringify(updated));
                                                        // Reload is intentionally NOT called — parent would need to re-read registry
                                                        showToast?.(`Blueprint renamed to "${newName}"`, 'success');
                                                    }
                                                }}
                                                className="p-3.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-2xl transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteBlueprint?.(blueprint.id)}
                                                className="p-3.5 bg-gray-800 hover:text-red-500 rounded-2xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-4 flex flex-col space-y-6">
                            <div className="bg-[#161b22] border border-gray-800 rounded-[2.5rem] p-8 flex-1 flex flex-col">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">Asset Distribution Stats</h4>
                                <div className="space-y-6">
                                    {metrics.clusterDistribution.map((c: any, i: number) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase">
                                                <span className="text-gray-400">{c.name}</span>
                                                <span className="text-white italic">{c.val}</span>
                                            </div>
                                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden p-0.5">
                                                <div className={`h-full ${c.color} rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]`} style={{ width: c.val }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-auto pt-8 flex flex-col gap-4">
                                    <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex items-center gap-4">
                                        <RefreshCw className="w-6 h-6 text-blue-500" />
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase italic tracking-tighter">Cluster Sync Active</p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Real-time Data Stream Enabled</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showBlueprintModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
                    <div className="bg-[#161b22] border border-gray-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="p-8 border-b border-gray-800 bg-[#1c2128] flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Initialize Manifest</h3>
                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Strategic provision orchestrator</p>
                            </div>
                            <button onClick={() => setShowBlueprintModal(false)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-500"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            onCreateBlueprint?.(formData.get('name') as string, formData.get('type') as any);
                            setShowBlueprintModal(false);
                        }} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Manifest Designation</label>
                                <input name="name" required className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-blue-500 transition-all font-bold" placeholder="E.g. Core Production Manifest" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Protocol (Type)</label>
                                <select name="type" className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-blue-500 transition-all font-bold appearance-none">
                                    <option value="PERSONAL">Personnel (Private)</option>
                                    <option value="SHARED">Shared (Group Protocol)</option>
                                    {currentUser?.role === 'ADMIN' && <option value="GLOBAL">Global (System Master)</option>}
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowBlueprintModal(false)} className="flex-1 py-4 bg-gray-800 text-[10px] font-black uppercase text-gray-400 rounded-2xl">Abort</button>
                                <button type="submit" className="flex-2 py-4 bg-blue-500 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all">Provision Manifest</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showGroupManager && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
                    <div className="bg-[#161b22] border border-gray-800 w-full max-w-[900px] h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-gray-800 flex items-center justify-between shrink-0 bg-[#1c2128]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 text-purple-500">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Governance Policy Matrix</h3>
                            </div>
                            <button onClick={() => setShowGroupManager(false)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-500"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 flex min-h-0">
                            <div className="w-1/3 border-r border-gray-800 flex flex-col p-6 space-y-4">
                                <button onClick={handleAddGroup} className="w-full py-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-purple-500/20 transition-all shadow-xl"><Plus className="w-3.5 h-3.5" /> Add Tier</button>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                                    <input
                                        type="text"
                                        placeholder="Filter Tiers..."
                                        value={groupSearchTerm}
                                        onChange={(e) => setGroupSearchTerm(e.target.value)}
                                        className="w-full bg-[#0d1117] border border-gray-800 rounded-xl py-2 pl-9 pr-3 text-[10px] text-white outline-none focus:border-purple-500 font-bold"
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                                    {permissionGroups.filter(g => g.name?.toLowerCase().includes(groupSearchTerm.toLowerCase())).map(group => (
                                        <div
                                            key={group.id}
                                            onClick={() => {
                                                setEditingGroup(group);
                                                setIsRenamingGroup(false);
                                                setNewNameValue(group.name);
                                            }}
                                            className={`relative group/item cursor-pointer p-5 rounded-2xl border transition-all ${editingGroup?.id === group.id ? 'bg-purple-600/10 border-purple-500/50 shadow-2xl' : 'bg-[#0d1117] border-gray-800 hover:border-gray-700'}`}
                                        >
                                            <div className="pr-8">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tier</p>
                                                <p className="text-sm font-bold text-white uppercase truncate">{group.name}</p>
                                            </div>
                                            {group.id !== 'admin-group' && group.id !== 'viewer-group' && (
                                                <button
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteGroup(group.id, e);
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-xl opacity-0 group-hover/item:opacity-100 transition-all z-[120] cursor-pointer border-none flex items-center justify-center"
                                                    title="Purge Tier"
                                                >
                                                    <Trash2 className="w-4 h-4 pointer-events-none" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 bg-[#0d1117] overflow-y-auto custom-scrollbar p-8">
                                {editingGroup ? (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between border-b border-gray-800 pb-6 mb-8">
                                            <div className="flex-1 min-w-0 mr-4">
                                                {isRenamingGroup ? (
                                                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                                                        <input
                                                            autoFocus
                                                            value={newNameValue}
                                                            onChange={(e) => setNewNameValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleRenameGroup();
                                                                if (e.key === 'Escape') setIsRenamingGroup(false);
                                                            }}
                                                            className="bg-[#161b22] border-2 border-purple-500 rounded-xl px-4 py-2 text-xl font-black text-white uppercase italic tracking-tight outline-none w-full max-w-md shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                                        />
                                                        <button onClick={handleRenameGroup} className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors"><Save className="w-5 h-5" /></button>
                                                        <button onClick={() => setIsRenamingGroup(false)} className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"><X className="w-5 h-5" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="group/title flex items-center gap-3">
                                                        <h4 className="text-xl font-black text-white uppercase italic tracking-tight truncate max-w-full">{editingGroup.name} Capability Matrix</h4>
                                                        <button
                                                            onClick={() => {
                                                                setNewNameValue(editingGroup.name);
                                                                setIsRenamingGroup(true);
                                                            }}
                                                            className="p-1.5 text-gray-600 hover:text-purple-400 opacity-0 group-hover/title:opacity-100 transition-all"
                                                            title="Rename Tier"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-50">Sovereign Policy Manifest</p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setIsSavingGovernance(true);
                                                        saveGroups(permissionGroups);
                                                        setTimeout(() => {
                                                            setIsSavingGovernance(false);
                                                            showToast?.('Governance Protocol Persisted', 'success');
                                                        }, 800);
                                                    }}
                                                    disabled={isSavingGovernance}
                                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all"
                                                >
                                                    {isSavingGovernance ? (
                                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                    ) : <Save className="w-4 h-4" />}
                                                    {isSavingGovernance ? 'Persisting...' : 'Save Protocol'}
                                                </button>
                                                <div className="w-px h-8 bg-gray-800 mx-2"></div>
                                                <button onClick={() => setEditingGroup(null)} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400" title="Close Matrix"><X className="w-5 h-5" /></button>
                                            </div>
                                        </div>

                                        <div className="relative w-full mb-8">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                                            <input
                                                type="text"
                                                placeholder="Filter Capabilities..."
                                                value={actionSearchTerm}
                                                onChange={(e) => setActionSearchTerm(e.target.value)}
                                                className="w-full bg-[#161b22] border border-gray-800 rounded-xl py-2.5 pl-9 pr-3 text-[10px] text-white outline-none focus:border-purple-500 font-bold shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-12">
                                            {['PAGES', 'ACTIONS'].map(category => (
                                                <div key={category} className="space-y-4">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className={`w-1 h-6 ${category === 'PAGES' ? 'bg-purple-500' : 'bg-amber-500'} rounded-full`}></div>
                                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{category} Protocol Layer</h5>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4">
                                                        {PERMISSION_ACTIONS.filter(a =>
                                                            a.category === category && (
                                                                a.label.toLowerCase().includes(actionSearchTerm.toLowerCase()) ||
                                                                a.category.toLowerCase().includes(actionSearchTerm.toLowerCase())
                                                            )).map(action => (
                                                                <div key={action.id} className="p-5 bg-[#161b22] border border-gray-800 rounded-3xl flex items-center justify-between group hover:border-purple-500/30 transition-all shadow-lg hover:shadow-purple-500/5">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className={`text-[8px] font-black ${category === 'PAGES' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20'} px-1.5 py-0.5 rounded border uppercase tracking-widest`}>{action.category}</span>
                                                                            <p className="text-sm font-bold text-gray-200">{action.label}</p>
                                                                        </div>
                                                                        <p className="text-[10px] text-gray-600 font-medium">{action.description}</p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            const updatedPerms = { ...editingGroup.permissions, [action.id]: !editingGroup.permissions[action.id] };
                                                                            const updated = permissionGroups.map(g => g.id === editingGroup.id ? { ...g, permissions: updatedPerms } : g);
                                                                            saveGroups(updated);
                                                                            setEditingGroup({ ...editingGroup, permissions: updatedPerms });
                                                                        }}
                                                                        className={`w-12 h-6 rounded-full relative transition-all ${editingGroup.permissions?.[action.id] ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-gray-800'}`}
                                                                    >
                                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingGroup.permissions?.[action.id] ? 'right-1' : 'left-1'}`}></div>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-50">
                                        <Shield className="w-20 h-20 text-gray-800 mb-6" />
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Select security tier for policy synchronization</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showUserModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
                    <div className="bg-[#161b22] border border-gray-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="p-8 border-b border-gray-800 bg-[#1c2128] flex items-center justify-between">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Identity Manifest</h3>
                            <button onClick={() => { setShowUserModal(false); setEditingUser(null); setShowUserPassword(false); }} className="p-2 hover:bg-gray-800 rounded-xl text-gray-500"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const data = {
                                name: formData.get('name'), email: formData.get('email'),
                                groupId: formData.get('groupId'), password: formData.get('password'),
                                id: editingUser?.id
                            };
                            editingUser ? handleUpdateUser(data) : handleAddUser(data);
                        }} className="p-8 space-y-6">
                            <input name="name" defaultValue={editingUser?.name} required className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-amber-500 font-bold" placeholder="Operational Name" />
                            <input name="email" type="email" defaultValue={editingUser?.email} required className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-amber-500 font-bold" placeholder="Designated Email" />
                            <div className="grid grid-cols-2 gap-4">
                                <select name="groupId" defaultValue={editingUser?.groupId || 'viewer-group'} className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl py-4 px-5 text-sm text-white outline-none font-bold appearance-none">
                                    {permissionGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                <div className="relative">
                                    <input name="password" type={showUserPassword ? "text" : "password"} defaultValue={editingUser?.password || 'password123'} required className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-amber-500 font-bold pr-12" placeholder="Auth Key" />
                                    <button
                                        type="button"
                                        onClick={() => setShowUserPassword(!showUserPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setShowUserModal(false); setEditingUser(null); setShowUserPassword(false); }} className="flex-1 py-4 bg-gray-800 text-[10px] uppercase font-black text-gray-400 rounded-2xl">Abort</button>
                                <button type="submit" className="flex-2 py-4 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/20">Authorize Identity</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showACLModal && aclBlueprint && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
                    <div className="bg-[#161b22] border border-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-8 border-b border-gray-800 bg-[#1c2128] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-500">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Access Control: {aclBlueprint.name}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Manage Authorization Matrix</p>
                                </div>
                            </div>
                            <button onClick={() => setShowACLModal(false)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-500"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/20 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tighter">Universal System Access</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Authorized for all verified personnel</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const currentIds = aclBlueprint.authorizedUserIds || [];
                                        const isUniversal = currentIds.includes('*');
                                        const newIds = isUniversal ? currentIds.filter(id => id !== '*') : ['*', ...currentIds];
                                        const updated = blueprintsRegistry.map(b => b.id === aclBlueprint.id ? { ...b, authorizedUserIds: newIds } : b);
                                        SecurityMiddleware.secureWrite('antigravity_blueprints_registry', JSON.stringify(updated));
                                        setACLBlueprint({ ...aclBlueprint, authorizedUserIds: newIds });
                                    }}
                                    className={`w-14 h-7 rounded-full relative transition-all ${aclBlueprint.authorizedUserIds?.includes('*') ? 'bg-emerald-500' : 'bg-gray-800'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${aclBlueprint.authorizedUserIds?.includes('*') ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Authorized Personnel
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {users.map(user => {
                                        const isAuthorized = aclBlueprint.authorizedUserIds?.includes(user.id) || aclBlueprint.authorizedUserIds?.includes('*');
                                        const isOwner = user.id === aclBlueprint.ownerId;

                                        return (
                                            <div key={user.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${isAuthorized ? 'bg-blue-500/5 border-blue-500/20' : 'bg-[#0d1117] border-gray-800 opacity-60'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-[10px] font-black">{user.name[0]}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white uppercase">{user.name}</p>
                                                        <p className="text-[9px] text-gray-600 font-medium">{user.email}</p>
                                                    </div>
                                                </div>
                                                {isOwner ? (
                                                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest px-2 py-1 bg-amber-500/10 rounded-md border border-amber-500/20">OWNER</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        {aclBlueprint.authorizedUserIds?.includes('*') && (
                                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">UNIVERSAL</span>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                let currentIds = aclBlueprint.authorizedUserIds || [];
                                                                const newIds = isAuthorized ? currentIds.filter(id => id !== user.id && id !== '*') : [...currentIds.filter(id => id !== '*'), user.id];
                                                                const updated = blueprintsRegistry.map(b => b.id === aclBlueprint.id ? { ...b, authorizedUserIds: newIds } : b);
                                                                SecurityMiddleware.secureWrite('antigravity_blueprints_registry', JSON.stringify(updated));
                                                                setACLBlueprint({ ...aclBlueprint, authorizedUserIds: newIds });
                                                            }}
                                                            className={`w-10 h-5 rounded-full relative transition-all ${isAuthorized ? 'bg-blue-500' : 'bg-gray-800'}`}
                                                        >
                                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isAuthorized ? 'right-0.5' : 'left-0.5'}`}></div>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-800">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5" /> Authorized Security Tiers
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {permissionGroups.map(group => {
                                        const isAuthorized = aclBlueprint.authorizedGroupIds?.includes(group.id);
                                        const isAdmin = group.id === 'admin-group';

                                        return (
                                            <div key={group.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${isAuthorized || isAdmin ? 'bg-purple-500/5 border-purple-500/20' : 'bg-[#0d1117] border-gray-800 opacity-60'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center"><Lock className="w-4 h-4 text-gray-600" /></div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white uppercase">{group.name}</p>
                                                        <p className="text-[9px] text-gray-600 font-medium">Clearance Group: {group.id}</p>
                                                    </div>
                                                </div>
                                                {isAdmin ? (
                                                    <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest px-2 py-1 bg-purple-500/10 rounded-md border border-amber-500/20">SYSTEM ADMIN</span>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            const currentIds = aclBlueprint.authorizedGroupIds || [];
                                                            const newIds = isAuthorized ? currentIds.filter(id => id !== group.id) : [...currentIds, group.id];
                                                            const updated = blueprintsRegistry.map(b => b.id === aclBlueprint.id ? { ...b, authorizedGroupIds: newIds } : b);
                                                            SecurityMiddleware.secureWrite('antigravity_blueprints_registry', JSON.stringify(updated));
                                                            setACLBlueprint({ ...aclBlueprint, authorizedGroupIds: newIds });
                                                        }}
                                                        className={`w-10 h-5 rounded-full relative transition-all ${isAuthorized ? 'bg-purple-500' : 'bg-gray-800'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isAuthorized ? 'right-0.5' : 'left-0.5'}`}></div>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-800 bg-[#1c2128] flex justify-end">
                            <button onClick={() => { setShowACLModal(false); showToast?.('Authorization matrix synchronized', 'success'); }} className="px-10 py-4 bg-blue-500 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all">Synchronize Authorization</button>
                        </div>
                    </div>
                </div>
            )}

            {showAddGroupModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] p-6 animate-in fade-in zoom-in duration-300">
                    <div className="bg-[#161b22] border border-gray-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-gray-800 bg-[#1c2128] flex items-center justify-between">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">New Security Tier</h3>
                            <button onClick={() => setShowAddGroupModal(false)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-500"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tier Designation</label>
                                <input
                                    id="new-group-name"
                                    autoFocus
                                    className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-purple-500 font-bold"
                                    placeholder="e.g. Infrastructure Engineers"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddGroupModal(false)}
                                    className="flex-1 py-4 bg-gray-800 text-[10px] uppercase font-black text-gray-400 rounded-2xl hover:bg-gray-700 transition-colors"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('new-group-name') as HTMLInputElement;
                                        if (input?.value) {
                                            handleAddGroupComplete(input.value);
                                        }
                                    }}
                                    className="flex-2 py-4 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-600/20 hover:bg-purple-500 transition-all"
                                >
                                    Initialize Tier
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
