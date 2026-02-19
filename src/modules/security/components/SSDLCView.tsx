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
                <div className="absolute inset-0 bg-[#0d1117]/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-[2.5rem] p-8">
                    <div className="max-w-md w-full bg-[#161b22] border border-gray-800 p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6">
                        <Radar className="w-16 h-16 text-blue-500 mx-auto animate-spin-slow" />
                        <div className="space-y-2">
                            <h4 className="text-lg font-black text-white uppercase italic">{message}</h4>
                            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{progress}% Processando</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Global Status Card */}
                <div className="col-span-full bg-gradient-to-br from-[#161b22] to-[#0d1117] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                        <Shield className="w-32 h-32 text-blue-500" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">SSDLC Governance Dashboard</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Secure Software Development Life Cycle Protocol</p>
                        </div>

                        <button
                            onClick={() => startScan()}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95 group"
                        >
                            <Radar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Executar Varredura</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-12">
                        <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Global Compliance</p>
                            <p className="text-4xl font-black text-emerald-400">88.6%</p>
                        </div>
                        <div className="h-12 w-px bg-gray-800"></div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Active Protocols</p>
                            <p className="text-4xl font-black text-blue-400">24/24</p>
                        </div>
                        <div className="h-12 w-px bg-gray-800"></div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Security Tier</p>
                            <p className="text-4xl font-black text-purple-400 font-mono">ST-V</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SSDLC Steps */}
            {steps.map((step) => (
                <div key={step.id} className="bg-[#161b22] p-6 rounded-[2rem] border border-gray-800 hover:border-blue-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${step.status === 'SECURE' ? 'bg-emerald-500/10 text-emerald-400' :
                            step.status === 'AT_RISK' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-red-500/10 text-red-400'
                            }`}>
                            {step.id === '1' && <Terminal className="w-5 h-5" />}
                            {step.id === '2' && <Activity className="w-5 h-5" />}
                            {step.id === '3' && <Code className="w-5 h-5" />}
                            {step.id === '4' && <Shield className="w-5 h-5" />}
                            {step.id === '5' && <Cpu className="w-5 h-5" />}
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${step.status === 'SECURE' ? 'bg-emerald-500/20 text-emerald-400' :
                            step.status === 'AT_RISK' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {step.status}
                        </span>
                    </div>

                    <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">{step.label}</h4>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed mb-6">{step.description}</p>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-600">
                            <span>Integrity Sync</span>
                            <span>{step.score}%</span>
                        </div>
                        <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${step.score >= 95 ? 'bg-emerald-500' : step.score >= 80 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${step.score}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Tech Radar Mock */}
            <div className="flex flex-col gap-6">
                <div className="bg-[#161b22] p-6 rounded-[2rem] border border-gray-800 flex-1">
                    <div className="flex items-center gap-2 mb-6 text-blue-400">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Vulnerability Feed</span>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">CRÍTICO</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">CVE-2024-CORE: Ignoração Lógica no Pop Orchestrator</p>
                        </div>
                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">CORRIGIDO</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">Upgrade de Dependência: Patch de segurança Lucide-Icons</p>
                        </div>
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">VERIFICADO</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">Todas as chaves do registro de blueprints prefixadas com atlas_</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
