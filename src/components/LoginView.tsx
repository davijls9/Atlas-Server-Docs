import { useState } from 'react';
import { Compass, Shield, Lock, Eye, EyeOff, ArrowRight, Server, Globe } from 'lucide-react';

interface LoginViewProps {
    onLogin: (user: any) => void;
}

export const LoginView = ({ onLogin }: LoginViewProps) => {
    const [email, setEmail] = useState('admin@antigravity.io');
    const [password, setPassword] = useState('password123');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network delay
        setTimeout(() => {
            const normalizedEmail = email.trim().toLowerCase();
            const savedUsers = localStorage.getItem('antigravity_users');
            let userFound = false;

            if (savedUsers) {
                const users = JSON.parse(savedUsers);
                const foundUser = users.find((u: any) =>
                    u.email.trim().toLowerCase() === normalizedEmail &&
                    u.password === password
                );

                if (foundUser) {
                    const sessionUser = {
                        ...foundUser,
                        avatar: null,
                        joinedAt: 'Jan 2026'
                    };
                    localStorage.setItem('antigravity_session', JSON.stringify(sessionUser));
                    onLogin(sessionUser);
                    setIsLoading(false);
                    return;
                    userFound = true;
                }
            }

            // Fallback for default admin if no users exist or for initial setup
            if (!userFound && normalizedEmail === 'admin@antigravity.io' && password === 'password123') {
                const adminUser = {
                    id: 'admin-root',
                    name: 'Administrator',
                    email: 'admin@atlas.com',
                    role: 'ADMIN',
                    groupId: 'admin-group',
                    avatar: null,
                    joinedAt: 'Jan 2026'
                };
                localStorage.setItem('atlas_session', JSON.stringify(adminUser));
                onLogin(adminUser);
                userFound = true;
            }

            if (!userFound) {
                alert('Invalid identity or authentication key (Standard Cluster Domain: @atlas.com).');
            }
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-[#06080a] flex items-center justify-center z-[100] overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative w-full max-w-[440px] p-8 animate-in fade-in zoom-in duration-700">
                {/* Branding */}
                <div className="mb-8 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                        <span className="font-black text-2xl text-white tracking-tighter">AS</span>
                    </div>
                </div>
                <h2 className="text-3xl font-black text-center text-white mb-2 tracking-tight">Atlas Server</h2>
                <p className="text-center text-gray-400 mb-8 text-sm">Secure Documentation Portal</p>

                {/* Login Card */}
                <div className="bg-[#0d1117] border border-gray-800 rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-transparent"></div>

                    <div className="mb-0">
                        <h2 className="text-xl font-bold text-white mb-2">Access Portal</h2>
                        <p className="text-xs text-gray-500 font-medium">Synchronize with your industrial infrastructure clusters.</p>
                        <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Default Fleet Identity:</p>
                            <p className="text-[9px] text-gray-500 font-bold mt-1">ID: admin@antigravity.io | KEY: password123</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Fleet Identity (Email)</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    autoComplete="username"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#161b22] border border-gray-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-gray-700"
                                    placeholder="Enter your terminal ID"
                                    required
                                />
                                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Authentication Key</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    autoComplete="current-password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#161b22] border border-gray-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-gray-700"
                                    placeholder="Enter your secret key"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-gray-700 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black text-[11px] uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-blue-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group overflow-hidden relative"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Authorize Sync <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer status */}
                <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale group hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[9px] font-black uppercase text-gray-600 tracking-tighter">Core v2.4.1</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[9px] font-black uppercase text-gray-600 tracking-tighter">Nodes Online: 48,901</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
