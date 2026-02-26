import React from 'react';
import { Shield, Terminal, Code, Cpu, Activity, Radar } from 'lucide-react';
import { useSecurityScan } from '../../../hooks/useSecurityScan';

interface SSDLCStep {
    id: string;
    label: string;
    status: 'SECURE' | 'AT_RISK' | 'CRITICAL';
    score: number;
    description: string;
}

export const SSDLCView: React.FC = () => {
    const { isScanning, progress, message, startScan } = useSecurityScan();

    const steps: SSDLCStep[] = [
        { id: '1', label: 'Requirements Analysis', status: 'SECURE', score: 100, description: 'Security constraints defined for all architectural clusters.' },
        { id: '2', label: 'Secure Design', status: 'SECURE', score: 98, description: 'Threat modeling completed for multi-tenant blueprint orchestration.' },
        { id: '3', label: 'Security Coding', status: 'AT_RISK', score: 85, description: 'Automated static analysis detected 2 non-critical violations in module logic.' },
        { id: '4', label: 'Security Testing', status: 'SECURE', score: 95, description: 'Dynamic penetration testing synchronized with cloud perimeter.' },
        { id: '5', label: 'Secure Deployment', status: 'CRITICAL', score: 65, description: 'Production manifest integrity verification failed in 1 region.' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 relative">
            {/* Scanning Overlay */}
            {isScanning && (
                <div className="absolute inset-0 bg-[var(--bg-main)]/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-[2.5rem] p-8">
                    <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-main)] p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6">
                        <Radar className="w-16 h-16 text-[var(--primary)] mx-auto animate-spin-slow" />
                        <div className="space-y-2">
                            <h4 className="text-lg font-black text-[var(--text-bright)] uppercase italic">{message}</h4>
                            <div className="h-2 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--primary)] transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-[0.2em]">{progress}% Processando</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Global Status Card */}
                <div className="col-span-full bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                        <Shield className="w-32 h-32 text-[var(--primary)]" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-black text-[var(--text-bright)] uppercase italic tracking-tighter mb-2">SSDLC Governance Dashboard</h3>
                            <p className="text-xs text-[var(--text-dim)] font-bold uppercase tracking-widest">Secure Software Development Life Cycle Protocol</p>
                        </div>

                        <button
                            onClick={() => startScan()}
                            className="px-8 py-4 bg-[var(--primary)] hover:opacity-90 text-white rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-[var(--primary-glow)]/20 active:scale-95 group"
                        >
                            <Radar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Executar Varredura</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-12">
                        <div>
                            <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest mb-1">Global Compliance</p>
                            <p className="text-4xl font-black text-[var(--status-success)]">88.6%</p>
                        </div>
                        <div className="h-12 w-px bg-[var(--border-main)]"></div>
                        <div>
                            <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest mb-1">Active Protocols</p>
                            <p className="text-4xl font-black text-[var(--primary)]">24/24</p>
                        </div>
                        <div className="h-12 w-px bg-[var(--border-main)]"></div>
                        <div>
                            <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest mb-1">Security Tier</p>
                            <p className="text-4xl font-black text-[var(--accent)] font-mono">ST-V</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SSDLC Steps */}
            {steps.map((step) => (
                <div key={step.id} className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-[var(--border-main)] hover:border-[var(--primary)]/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${step.status === 'SECURE' ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]' :
                            step.status === 'AT_RISK' ? 'bg-[var(--status-warn)]/10 text-[var(--status-warn)]' :
                                'bg-[var(--status-error)]/10 text-[var(--status-error)]'
                            }`}>
                            {step.id === '1' && <Terminal className="w-5 h-5" />}
                            {step.id === '2' && <Activity className="w-5 h-5" />}
                            {step.id === '3' && <Code className="w-5 h-5" />}
                            {step.id === '4' && <Shield className="w-5 h-5" />}
                            {step.id === '5' && <Cpu className="w-5 h-5" />}
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${step.status === 'SECURE' ? 'bg-[var(--status-success)]/20 text-[var(--status-success)]' :
                            step.status === 'AT_RISK' ? 'bg-[var(--status-warn)]/20 text-[var(--status-warn)]' :
                                'bg-[var(--status-error)]/20 text-[var(--status-error)]'
                            }`}>
                            {step.status}
                        </span>
                    </div>

                    <h4 className="text-sm font-black text-[var(--text-bright)] uppercase tracking-tight mb-2">{step.label}</h4>
                    <p className="text-[10px] text-[var(--text-dim)] font-medium leading-relaxed mb-6">{step.description}</p>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                            <span>Integrity Sync</span>
                            <span>{step.score}%</span>
                        </div>
                        <div className="h-1 bg-[var(--bg-deep)] rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${step.score >= 95 ? 'bg-[var(--status-success)]' : step.score >= 80 ? 'bg-[var(--status-warn)]' : 'bg-[var(--status-error)]'
                                    }`}
                                style={{ width: `${step.score}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Tech Radar Mock */}
            <div className="flex flex-col gap-6">
                <div className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-[var(--border-main)] flex-1">
                    <div className="flex items-center gap-2 mb-6 text-[var(--primary)]">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Vulnerability Feed</span>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 bg-[var(--status-error)]/5 border border-[var(--status-error)]/10 rounded-xl">
                            <p className="text-[9px] font-black text-[var(--status-error)] uppercase tracking-widest">CRÍTICO</p>
                            <p className="text-[10px] text-[var(--text-dim)] font-bold mt-1">CVE-2024-CORE: Ignoração Lógica no Pop Orchestrator</p>
                        </div>
                        <div className="p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-xl">
                            <p className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest">CORRIGIDO</p>
                            <p className="text-[10px] text-[var(--text-dim)] font-bold mt-1">Upgrade de Dependência: Patch de segurança Lucide-Icons</p>
                        </div>
                        <div className="p-3 bg-[var(--status-success)]/5 border border-[var(--status-success)]/10 rounded-xl">
                            <p className="text-[9px] font-black text-[var(--status-success)] uppercase tracking-widest">VERIFICADO</p>
                            <p className="text-[10px] text-[var(--text-dim)] font-bold mt-1">Todas as chaves do registro de blueprints prefixadas com atlas_</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
