import React, { useState } from 'react';
import {
    Shield, Workflow, Binary, Lock, Users, Zap, ShieldAlert, Activity,
    ChevronRight, Fingerprint, Database, Eye, X, Terminal, Server, Search, RefreshCw, Radar
} from 'lucide-react';
import { useSecurityScan } from '../hooks/useSecurityScan';

type LayerId = 'user' | 'identity' | 'middleware' | 'ssdlc';

interface LayerMeta {
    id: LayerId;
    label: string;
    icon: React.ElementType;
    status: 'SECURE' | 'AT_RISK' | 'CRITICAL';
    score: number;
    metrics: { label: string; value: string; trend?: 'UP' | 'DOWN' | 'NEUTRAL' }[];
    recentEvents: { msg: string; type: 'SUCCESS' | 'ERROR' | 'WARN'; origin?: string; action?: string }[];
}

export const SecurityIntel: React.FC = () => {
    const [activeLayer, setActiveLayer] = useState<LayerId>('middleware');
    const [showForensics, setShowForensics] = useState(false);
    const [showRealTime, setShowRealTime] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [inspectedItem, setInspectedItem] = useState<any>(null);
    const { isScanning, progress, message, startScan } = useSecurityScan();

    const layers: Record<LayerId, LayerMeta> = {
        user: {
            id: 'user',
            label: 'User Personnel Layer',
            icon: Users,
            status: 'SECURE',
            score: 100,
            metrics: [
                { label: 'Active Sessions', value: '14 Active' },
                { label: 'Auth Success Rate', value: '99.4%', trend: 'UP' },
                { label: 'Role Escalations', value: '0 Detected' }
            ],
            recentEvents: [
                { msg: 'Admin session initialized from 127.0.0.1', type: 'SUCCESS', origin: '127.0.0.1', action: 'Verify session token lifecycle' },
                { msg: 'Token rotation successful for user_jane', type: 'SUCCESS', origin: 'Internal Auth' }
            ]
        },
        identity: {
            id: 'identity',
            label: 'Identity Registry',
            icon: Fingerprint,
            status: 'SECURE',
            score: 98,
            metrics: [
                { label: 'JWT Entropy', value: '256-bit' },
                { label: 'Valid Keys', value: '1,042' },
                { label: 'Symmetric Latency', value: '2ms', trend: 'NEUTRAL' }
            ],
            recentEvents: [
                { msg: 'Global identity manifest synced', type: 'SUCCESS', origin: 'Atlas Proxy', action: 'No action required' },
                { msg: 'Key cache warmed from Atlas_Proxy', type: 'SUCCESS', origin: 'Cache Sync' }
            ]
        },
        middleware: {
            id: 'middleware',
            label: 'Access Middleware',
            icon: Workflow,
            status: 'AT_RISK',
            score: 82,
            metrics: [
                { label: 'Auth Protocol Calls', value: '24k/hr' },
                { label: 'Access Denied', value: '142', trend: 'UP' },
                { label: 'Policy Latency', value: '45ms' }
            ],
            recentEvents: [
                { msg: 'Multiple unauthorized protocol attempts: delete_pop', type: 'ERROR', origin: 'IP: 185.22.41.1', action: 'Block source IP and rotate ingress keys' },
                { msg: 'Group permission bypass attempt blocked', type: 'WARN', origin: 'User: guest_01', action: 'Quarantine session for review' }
            ]
        },
        ssdlc: {
            id: 'ssdlc',
            label: 'Governance SSDLC',
            icon: Binary,
            status: 'CRITICAL',
            score: 64,
            metrics: [
                { label: 'Code Integrity', value: 'FAILED' },
                { label: 'Scanner Status', value: 'ALIVE' },
                { label: 'Vuln Delta', value: '+4 New', trend: 'DOWN' }
            ],
            recentEvents: [
                { msg: 'Falha na verificação de integridade do manifesto de produção', type: 'ERROR', origin: 'Registry Sync', action: 'Reverter para o manifesto estável v1.4.2' },
                { msg: 'Violação de esquema do blueprint detectada em module_security', type: 'ERROR', origin: 'CD Pipeline', action: 'Reauditar o esquema do módulo' },
                { msg: 'CVE-2024-CORE: Ignoração Lógica no Pop Orchestrator', type: 'ERROR', origin: 'Vulnerability Scanner', action: 'Aplicar patch de segurança imediato' }
            ]
        }
    };

    const activeLayerData = layers[activeLayer];

    const handleDownloadPdf = () => {
        const content = `STRATEGIC FORENSIC DUMP\nLayer: ${activeLayerData.label}\nStatus: ${activeLayerData.status}\nScore: ${activeLayerData.score}%\n\nINCIDENTS:\n${activeLayerData.recentEvents.map(e => `[${e.type}] ${e.msg} (Source: ${e.origin})`).join('\n')}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `atlas_forensic_${activeLayer}_${Date.now()}.pdf`;
        link.click();
    };

    const handleExportJson = () => {
        const data = JSON.stringify(activeLayerData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `atlas_manifest_${activeLayer}_${Date.now()}.json`;
        link.click();
    };

    return (
        <div className="p-4 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
            {/* Scanning Overlay */}
            {isScanning && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
                    <div className="max-w-md w-full space-y-8 text-center">
                        <div className="relative inline-block">
                            <Radar className="w-24 h-24 text-blue-500 animate-spin-slow" />
                            <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-20 animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">{message}</h4>
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] pl-1">{progress}% Complete</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Inspection Overlay */}
            {inspectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-in zoom-in-95" onClick={() => setInspectedItem(null)}>
                    <div className="bg-[#0d1117] border border-gray-800 rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <Activity className="w-8 h-8 text-blue-500" />
                                <h4 className="text-xl font-black text-white uppercase italic">Event Inspection</h4>
                            </div>
                            <button onClick={() => setInspectedItem(null)} className="p-2 hover:bg-gray-800 rounded-xl transition-all"><X className="w-6 h-6 text-gray-500" /></button>
                        </div>
                        <div className="space-y-6 font-mono">
                            <div className="p-6 bg-black/30 rounded-2xl border border-gray-800 space-y-4">
                                <div>
                                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Source Origin</p>
                                    <p className="text-sm text-blue-400 font-bold">{inspectedItem.origin || 'INTERNAL_KERNEL'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Payload / Message</p>
                                    <p className="text-sm text-white leading-relaxed">{inspectedItem.msg}</p>
                                </div>
                                {inspectedItem.action && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-[10px] text-red-500 uppercase font-black tracking-widest mb-1 italic">Protocol Recommended Action</p>
                                        <p className="text-sm text-red-400 font-bold">{inspectedItem.action}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setInspectedItem(null)}
                                    className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Close Inspection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Header section with Threat Level & Actions */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                        <Shield className="w-10 h-10 text-blue-500" />
                        Strategic Tactical Intelligence
                    </h2>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest pl-14">High-Fidelity Architecture & Forensic Suite</p>
                </div>

                <div className="flex items-center gap-2 bg-[#0d1117] p-1.5 rounded-2xl border border-gray-800 shadow-2xl">
                    <button
                        onClick={() => setShowRealTime(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/10 group"
                    >
                        <Zap className="w-3.5 h-3.5 group-hover:animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Real-time Feed</span>
                    </button>

                    <button
                        onClick={() => setShowForensics(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#161b22] hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl border border-gray-800 transition-all group"
                    >
                        <Terminal className="w-3.5 h-3.5 group-hover:text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Forensic Deep-Dive</span>
                    </button>

                    <button
                        onClick={() => startScan()}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/5 hover:bg-purple-600/10 text-purple-400/80 hover:text-purple-300 rounded-xl border border-purple-500/20 transition-all group"
                    >
                        <Radar className="w-3.5 h-3.5 group-hover:animate-spin-slow" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Re-Scan</span>
                    </button>

                    <div className="h-6 w-px bg-gray-800 mx-1"></div>

                    <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 px-4 py-1.5 rounded-xl">
                        <div className="relative">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Risk</p>
                            <p className="text-[10px] font-black text-red-500 uppercase italic">Elevated</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic Architecture Roadmap */}
            <div className="relative p-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-red-500/20 rounded-[4.5rem]">
                <div className="bg-[#0d1117] rounded-[4.4rem] py-18 px-12 border border-gray-800/50 shadow-inner relative overflow-hidden">
                    {/* Layer Labels Background */}
                    <div className="absolute top-8 inset-x-0 flex justify-between px-20">
                        {['ENTRY', 'IDENTITY', 'SECURITY', 'GOVERNANCE'].map((label, i) => (
                            <span key={i} className="text-[9px] font-black text-gray-800 uppercase tracking-[0.5em]">{label}</span>
                        ))}
                    </div>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">

                        {/* User Layer */}
                        <button
                            onClick={() => setActiveLayer('user')}
                            className={`flex flex-col items-center gap-4 group/node w-full lg:w-48 transition-all duration-500 ${activeLayer === 'user' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                        >
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-500 relative ${activeLayer === 'user' ? 'bg-blue-500/20 border-blue-500 shadow-xl shadow-blue-500/20' : 'bg-gray-800/20 border-gray-700 group-hover/node:border-blue-500/50'}`}>
                                <Users className={`w-10 h-10 ${activeLayer === 'user' ? 'text-blue-400' : 'text-gray-500'}`} />
                            </div>
                            <div className="text-center">
                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">User Layer</h4>
                                <span className="text-[8px] font-bold text-emerald-500 uppercase px-1.5 py-0.5 bg-emerald-500/5 rounded">SECURE</span>
                            </div>
                        </button>

                        <div className="hidden lg:block h-px flex-1 bg-gradient-to-r from-blue-500/50 to-blue-500/20 relative">
                            <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] transition-all duration-500 ${activeLayer === 'user' ? 'bg-blue-500 animate-pulse' : 'bg-gray-800 scale-0'}`}></div>
                        </div>

                        {/* Identity Layer */}
                        <button
                            onClick={() => setActiveLayer('identity')}
                            className={`flex flex-col items-center gap-4 group/node w-full lg:w-48 transition-all duration-500 ${activeLayer === 'identity' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                        >
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-500 ${activeLayer === 'identity' ? 'bg-blue-500/20 border-blue-500 shadow-xl shadow-blue-500/20' : 'bg-gray-800/20 border-gray-700 group-hover/node:border-blue-500/50'}`}>
                                <Lock className={`w-10 h-10 ${activeLayer === 'identity' ? 'text-blue-400' : 'text-gray-500'}`} />
                            </div>
                            <div className="text-center">
                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Auth Registry</h4>
                                <span className="text-[8px] font-bold text-emerald-500 uppercase px-1.5 py-0.5 bg-emerald-500/5 rounded">SYNCED</span>
                            </div>
                        </button>

                        <div className="hidden lg:block h-px flex-1 bg-gradient-to-r from-blue-500/20 to-purple-500/50 relative">
                            <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] transition-all duration-500 ${activeLayer === 'identity' ? 'bg-blue-500 animate-pulse' : 'bg-gray-800 scale-0'}`}></div>
                        </div>

                        {/* Middleware Layer (Suffering) */}
                        <button
                            onClick={() => setActiveLayer('middleware')}
                            className={`flex flex-col items-center gap-4 group/node w-full lg:w-48 transition-all duration-500 ${activeLayer === 'middleware' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                        >
                            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center border-2 transition-all duration-500 relative ${activeLayer === 'middleware' ? 'bg-purple-500/20 border-purple-500 shadow-xl shadow-purple-500/20' : 'bg-amber-500/5 border-amber-500/30 group-hover/node:border-purple-500/50'}`}>
                                <Workflow className={`w-12 h-12 ${activeLayer === 'middleware' ? 'text-purple-400' : 'text-amber-400'}`} />
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-4 border-[#161b22] animate-ping"></div>
                            </div>
                            <div className="text-center">
                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Middleware</h4>
                                <span className="text-[8px] font-bold text-amber-500 uppercase px-1.5 py-0.5 bg-amber-500/5 rounded">AT RISK</span>
                            </div>
                        </button>

                        <div className="hidden lg:block h-px flex-1 bg-gradient-to-r from-purple-500/50 to-red-500/50 relative">
                            <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] transition-all duration-500 ${activeLayer === 'middleware' ? 'bg-purple-500 animate-pulse' : 'bg-gray-800 scale-0'}`}></div>
                        </div>

                        {/* SSDLC Layer (Suffering Most) */}
                        <button
                            onClick={() => setActiveLayer('ssdlc')}
                            className={`flex flex-col items-center gap-4 group/node w-full lg:w-48 transition-all duration-500 ${activeLayer === 'ssdlc' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                        >
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-500 relative ${activeLayer === 'ssdlc' ? 'bg-red-500/20 border-red-500 shadow-xl shadow-red-500/20' : 'bg-red-500/5 border-red-500/20 group-hover/node:border-red-500/50'}`}>
                                <Binary className={`w-10 h-10 ${activeLayer === 'ssdlc' ? 'text-red-400' : 'text-red-500/50'}`} />
                                <div className="absolute inset-0 bg-red-500/10 animate-pulse rounded-[2rem]"></div>
                            </div>
                            <div className="text-center">
                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Governance</h4>
                                <span className="text-[8px] font-bold text-red-500 uppercase px-1.5 py-0.5 bg-red-500/5 rounded">CRITICAL</span>
                            </div>
                        </button>

                    </div>

                    {/* Tactical Detail Overlay (Fades in based on selection) */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-12 py-3 bg-[#1c2128]/90 border border-gray-800 rounded-2xl flex items-center gap-6 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${activeLayerData.status === 'SECURE' ? 'bg-emerald-500' : activeLayerData.status === 'AT_RISK' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{activeLayerData.label}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-800"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Health Score: <span className={activeLayerData.score > 90 ? 'text-emerald-500' : activeLayerData.score > 70 ? 'text-amber-500' : 'text-red-500'}>{activeLayerData.score}%</span></span>
                    </div>
                </div>

                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>
            </div>

            {/* Tactical Detail Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Layer Metrics */}
                <div className="bg-[#161b22] border border-gray-800 rounded-[2.5rem] p-8 space-y-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2 border-l-2 border-l-blue-500 mb-8">
                            Tactical Layer Metrics
                        </h3>

                        <div className="space-y-6">
                            {activeLayerData.metrics.map((m, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                                        <span className="text-gray-600">{m.label}</span>
                                        <span className="text-white italic">{m.value}</span>
                                    </div>
                                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden relative">
                                        <div
                                            className={`h-full bg-gradient-to-r ${m.trend === 'UP' ? 'from-emerald-500 to-emerald-400' : m.trend === 'DOWN' ? 'from-red-500 to-red-400' : 'from-blue-500 to-blue-400'} rounded-full`}
                                            style={{ width: `${(i + 1) * 25}%` }}
                                        ></div>
                                    </div>
                                    {m.trend && (
                                        <div className={`text-[8px] font-black flex items-center gap-1 ${m.trend === 'UP' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            <Activity className="w-3 h-3" />
                                            {m.trend === 'UP' ? 'Improving Signal' : 'Degrading Performance'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white uppercase">Real-time Feed</p>
                                <p className="text-[8px] text-gray-500 font-bold uppercase mt-0.5">Tactical Sync Active</p>
                            </div>
                        </div>
                        <button onClick={() => setShowRealTime(true)} className="p-2 hover:bg-gray-800 rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-gray-700 hover:text-blue-500" /></button>
                    </div>
                </div>

                {/* Layer Incident Monitor (The "Suffering" part) */}
                <div className="bg-[#161b22] border border-gray-800 rounded-[2.5rem] p-8 space-y-8 lg:col-span-2">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 border-l-2 border-l-red-500">
                            Layer Incident Monitor
                        </h3>
                        <div className="px-3 py-1 bg-red-500/5 border border-red-500/10 rounded-full flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Live Audit</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Event Feed */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center ml-2">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Anomalous Activity Feed</p>
                                <button onClick={() => setShowRealTime(true)} className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest px-2 py-0.5 rounded border border-blue-500/20 hover:bg-blue-500/5 transition-all">Expand View</button>
                            </div>
                            {activeLayerData.recentEvents.map((ev, i) => (
                                <div key={i} className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all group ${ev.type === 'ERROR' ? 'bg-red-500/5 border-red-500/10' : ev.type === 'WARN' ? 'bg-amber-500/5 border-amber-500/10' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${ev.type === 'ERROR' ? 'bg-red-500/20 text-red-500' : ev.type === 'WARN' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {ev.type === 'ERROR' ? 'VIOLATION' : ev.type === 'WARN' ? 'SUSPICIOUS' : 'AUTHORIZED'}
                                            </span>
                                            {ev.origin && <span className="text-[8px] font-black text-gray-700 uppercase tracking-tighter bg-gray-800/50 px-1.5 py-0.5 rounded">Source: {ev.origin}</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] text-gray-600 font-black">JUST NOW</span>
                                            <button onClick={() => setInspectedItem(ev)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded"><Eye className="w-3 h-3 text-gray-500" /></button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-300 font-bold leading-relaxed">{ev.msg}</p>
                                    {ev.action && <p className="text-[8px] text-red-500/50 font-black uppercase italic mt-1 animate-pulse">Action: {ev.action}</p>}
                                </div>
                            ))}
                        </div>

                        {/* Layer Performance Card */}
                        <div className="bg-[#0d1117]/50 rounded-3xl border border-gray-800 p-6 flex flex-col justify-between relative overflow-hidden group">
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-400 transition-colors">
                                        <Database className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase italic tracking-tighter">Diagnostic Report</p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Layer: {activeLayer.toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                                        <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-600">
                                            <span>Layer Latency</span>
                                            <span className="text-emerald-500">-12% optimized</span>
                                        </div>
                                        <p className="text-xl font-black text-white">4.2ms</p>
                                    </div>
                                    <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                                        <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-600">
                                            <span>Breach Attempts</span>
                                            <span className="text-red-500">+4 Critical</span>
                                        </div>
                                        <p className="text-xl font-black text-white">{activeLayer === 'ssdlc' ? '1,048' : '0'}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowForensics(true)}
                                className="relative z-10 w-full mt-6 py-3 bg-gray-800/50 hover:bg-blue-600 text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Eye className="w-3.5 h-3.5" /> Full Forensic Deep-Dive
                            </button>

                            {/* Abs Background Gradient */}
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] transition-all duration-1000 ${activeLayerData.status === 'SECURE' ? 'bg-emerald-500/10' : activeLayerData.status === 'AT_RISK' ? 'bg-amber-500/10' : 'bg-red-500/10'}`}></div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Forensic Modal */}
            {showForensics && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[500] flex items-center justify-center p-4 lg:p-12 animate-in zoom-in-95 duration-300">
                    <div className="w-full max-w-6xl h-full bg-[#0d1117] border border-gray-800 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-gray-800 bg-[#161b22] flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
                                    <Terminal className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Forensic Diagnostic Laboratory</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Dumping architectural state for layer: {activeLayerData.label}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowForensics(false)} className="p-4 hover:bg-gray-800 rounded-2xl text-gray-500 transition-all"><X className="w-8 h-8" /></button>
                        </div>

                        <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-black/50 font-mono space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 space-y-4">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Stack Integrity</p>
                                    <div className="space-y-2">
                                        {[
                                            { l: 'Checksum', v: '0xFA32BE81', s: 'VALID' },
                                            { l: 'Memory Pin', v: '0x0042FF10', s: 'LOCKED' },
                                            { l: 'Encryption', v: 'AES-256-GCM', s: 'ACTIVE' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-[11px]">
                                                <span className="text-gray-600">{item.l}</span>
                                                <span className="text-emerald-500 font-black">{item.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 space-y-4">
                                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Protocol Handshakes</p>
                                    <div className="space-y-2">
                                        {[
                                            { l: 'Success', v: '14,282', s: 'VALID' },
                                            { l: 'Violations', v: '0', s: 'LOCKED' },
                                            { l: 'Peak Load', v: '1.2k/s', s: 'STABLE' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-[11px]">
                                                <span className="text-gray-600">{item.l}</span>
                                                <span className="text-purple-400 font-black">{item.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 space-y-4">
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Threat Heuristics</p>
                                    <div className="space-y-2">
                                        {[
                                            { l: 'Pattern Match', v: '99.9%', s: 'VALID' },
                                            { l: 'Zero-Day Prob', v: '0.001%', s: 'LOCKED' },
                                            { l: 'Geo-Fencing', v: 'ENFORCED', s: 'ACTIVE' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-[11px]">
                                                <span className="text-gray-600">{item.l}</span>
                                                <span className="text-amber-500 font-black">{item.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-black border border-gray-800 p-8 rounded-[2rem] space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Raw Forensic Trace Log</p>
                                    <div className="flex gap-4">
                                        <span className="text-[10px] text-gray-700 font-black uppercase tracking-tighter italic">DUMP_TS: {new Date().toISOString()}</span>
                                        <Search className="w-4 h-4 text-gray-700" />
                                    </div>
                                </div>
                                <div className="text-[11px] text-gray-400 leading-loose">
                                    <p className="text-emerald-500 opacity-50">[0.0001s] STACK_INIT: Spawning security orchestration thread {Math.random().toString(16).slice(2, 10)}</p>
                                    <p className="text-blue-500 opacity-50">[0.0042s] IDENTITY_PROBE: Validating JWT signature against root sovereign key</p>
                                    <p className="text-blue-500 opacity-50">[0.0128s] HANDSHAKE_OK: User person_id authenticated (Tier: ARCHITECT)</p>
                                    <p className="text-purple-500 opacity-50">[0.0450s] MIDDLEWARE_GATE: Verifying protocol view_security_intel access for group admin-group</p>
                                    <p className="text-gray-500 italic uppercase">... streaming 14.2k more events ...</p>
                                    <p className="text-red-500 font-black mt-4 animate-pulse uppercase tracking-[0.2em]">[ALARM] {activeLayerData.recentEvents[0].msg}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-[#161b22] border-t border-gray-800 flex justify-between items-center">
                            <div className="flex gap-6">
                                <button
                                    onClick={handleDownloadPdf}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                                >
                                    Download Full Dump (PDF)
                                </button>
                                <button
                                    onClick={handleExportJson}
                                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Export JSON Manifest
                                </button>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-600 uppercase">Sovereign Integrity Verified</p>
                                <p className="text-[8px] text-gray-700 font-black uppercase tracking-tighter">ID: STR-TAC-LAB-001</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Real-Time Feed Modal */}
            {showRealTime && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[500] flex items-end justify-center p-0 animate-in slide-in-from-bottom duration-500">
                    <div className="w-full max-w-5xl h-[85vh] bg-[#0d1117] border-t border-x border-gray-800 rounded-t-[4rem] shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-10 border-b border-gray-800 bg-[#161b22] flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white relative">
                                    <Zap className="w-8 h-8" />
                                    <div className="absolute inset-0 bg-blue-500 rounded-3xl animate-ping opacity-20"></div>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">Live Tactical Audit Stream</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Synchronized with System Kernel</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowRealTime(false)} className="p-5 hover:bg-gray-800 rounded-[2rem] text-gray-500 transition-all group">
                                <ChevronRight className="w-10 h-10 rotate-90 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar relative">
                            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0d1117] to-transparent z-10 pointer-events-none"></div>
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0d1117] to-transparent z-10 pointer-events-none"></div>

                            <div className="space-y-6">
                                {[
                                    { t: '12:45:01.242', src: 'USER_PERSONNEL', msg: 'Admin session initialized from 127.0.0.1', type: 'SUCCESS', layer: 'user' },
                                    { t: '12:45:01.350', src: 'USER_PERSONNEL', msg: 'Token rotation successful for user_jane', type: 'SUCCESS', layer: 'user' },
                                    { t: '12:45:01.898', src: 'MIDDLEWARE', msg: 'Access violation at tier_omega ingress', type: 'ERROR', layer: 'middleware' },
                                    { t: '12:45:01.950', src: 'MIDDLEWARE', msg: 'Multiple unauthorized protocol attempts: delete_pop', type: 'ERROR', layer: 'middleware' },
                                    { t: '12:45:02.112', src: 'AUTH_REGISTRY', msg: 'Key rotation cycle #42 initiated', type: 'INFO', layer: 'identity' },
                                    { t: '12:45:02.456', src: 'GOVERNANCE', msg: 'Compliance score recalculated: 84.2%', type: 'WARN', layer: 'ssdlc' },
                                    { t: '12:45:02.800', src: 'GOVERNANCE', msg: 'SSDLC health probe returned AT_RISK status', type: 'WARN', layer: 'ssdlc' },
                                    { t: '12:45:03.001', src: 'AUTH_REGISTRY', msg: 'Global identity manifest synced', type: 'SUCCESS', layer: 'identity' },
                                    { t: '12:45:03.442', src: 'MIDDLEWARE', msg: 'Protocol validation bypass attempt blocked', type: 'ERROR', layer: 'middleware', action: 'Quarantine session' },
                                    { t: '12:45:04.112', src: 'GOVERNANCE', msg: 'Blueprint schema violation detected in module_security', type: 'ERROR', layer: 'ssdlc', action: 'Reauditar o esquema do módulo' },
                                    { t: '12:45:04.220', src: 'GOVERNANCE', msg: 'Falha na integridade do manifesto de produção: Região US-EAST-1', type: 'ERROR', layer: 'ssdlc', action: 'Reverter para o manifesto estável v1.4.2' },
                                    { t: '12:45:04.567', src: 'AUTH_REGISTRY', msg: 'Global root key integrity check passed', type: 'SUCCESS', layer: 'identity' },
                                    { t: '12:45:05.100', src: 'VULN_SCAN', msg: 'CVE-2024-CORE: Logical Bypass in Pop Orchestrator detected', type: 'ERROR', layer: 'ssdlc', action: 'Aplicar patch de segurança imediato' },
                                ].filter(log => log.layer === activeLayer).map((log, i) => (
                                    <div key={i} className={`p-6 bg-[#161b22]/50 border-l-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.02] transition-all group ${log.type === 'ERROR' ? 'border-l-red-500' : log.type === 'WARN' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                                        <div className="flex items-center gap-8">
                                            <span className="text-[10px] font-mono text-gray-700 font-black">{log.t}</span>
                                            <div>
                                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">{log.src}</p>
                                                <p className="text-xs font-bold text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">{log.msg}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setInspectedItem(log)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-all" title="View Details"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => setInspectedItem(log)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-blue-500 transition-all" title="Inspect Terminal"><Terminal className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-center pt-8">
                                    <div className="flex flex-col items-center gap-3">
                                        <Server className="w-8 h-8 text-gray-800 animate-bounce" />
                                        <p className="text-[9px] font-black text-gray-800 uppercase tracking-[0.5em] italic">Streaming more forensic data ...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-[#1c2128] border-t border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-gray-800 rounded-2xl text-gray-400">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-white uppercase">Sovereign Audit Chain</p>
                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Enforcing high-fidelity observability protocols</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                className={`px-10 py-4 ${isPaused ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 active:scale-95`}
                            >
                                <RefreshCw className={`w-5 h-5 ${isPaused ? '' : 'animate-spin-slow'}`} />
                                {isPaused ? 'Resume Stream' : 'Pause Stream'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Note */}
            <div className="text-center opacity-30 group hover:opacity-100 transition-opacity">
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] italic flex items-center justify-center gap-3">
                    <span className="w-12 h-px bg-gray-800"></span>
                    Antigravity Strategic Security Framework
                    <span className="w-12 h-px bg-gray-800"></span>
                </p>
            </div>
        </div>
    );
};
