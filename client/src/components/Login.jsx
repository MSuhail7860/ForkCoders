import React, { useState } from 'react';
import { ChevronRight, Activity, User, Lock, Loader2 } from 'lucide-react';

const Login = ({ onLogin, onNavigateToOnboarding }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!name || !email) {
            setError('Please enter both name and email.');
            setLoading(false);
            return;
        }

        // Logic: Pass credentials up to App.jsx for session management
        onLogin({ name, email });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-6 text-slate-100">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="bg-violet-600/20 p-4 rounded-3xl border border-violet-500/30 mb-4 shadow-2xl shadow-violet-500/10">
                    <Activity className="h-10 w-10 text-violet-400" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight italic">
                    Diet-To-Discipline
                </h1>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/5 p-10 rounded-[48px] shadow-[0_0_60px_-15px_rgba(139,92,246,0.15)]">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
                    <p className="text-violet-500/60 text-[10px] font-black uppercase tracking-[0.3em]">
                        Sync Your Progress
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 text-red-400 text-[10px] font-black p-3 rounded-2xl border border-red-500/20 text-center uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors" size={18} />
                            <input
                                type="text"
                                className="w-full bg-[#111111] border border-white/5 text-white pl-14 pr-6 py-5 rounded-3xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-white/10 font-medium"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group">
                            {/* Changed Lock to Mail for Email field */}
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                            </div>
                            <input
                                type="email"
                                className="w-full bg-[#111111] border border-white/5 text-white pl-14 pr-6 py-5 rounded-3xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-white/10 font-medium"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-violet-600/20 flex items-center justify-center group uppercase text-xs tracking-[0.2em]"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Enter System"}
                        {!loading && <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />}
                    </button>
                </form>

                <button
                    onClick={onNavigateToOnboarding}
                    className="w-full mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-violet-400 transition-colors"
                >
                    New here? Create your plan
                </button>
            </div>
        </div>
    );
};

export default Login;
