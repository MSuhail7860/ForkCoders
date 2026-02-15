import React, { useState } from 'react';
import axios from 'axios';
import { ChevronRight, Activity, User, Scale, Ruler, Mail, Loader2 } from 'lucide-react';

const Onboarding = ({ onComplete, initialUser }) => {
    const [formData, setFormData] = useState({
        name: initialUser?.name || '',
        email: initialUser?.email || '', // Replaced password with email
        weight: '',
        height: '',
        age: '',
        gender: 'male',
        activity: '1.2',
        goal: 'lose'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Sends data to your existing /api/calculate-and-save endpoint
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/calculate-and-save`, formData);
            onComplete(res.data.data); 
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || err.message || 'Failed to save profile. Please try again.';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030303] text-slate-100 p-6 flex items-center justify-center font-sans">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/5 p-10 rounded-[48px] shadow-2xl shadow-violet-900/10 animate-in fade-in zoom-in duration-500">
                <div className="mb-10 text-center">
                    <div className="inline-block bg-violet-600/20 p-4 rounded-3xl border border-violet-500/30 mb-6">
                        <Activity className="h-8 w-8 text-violet-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white italic mb-2 tracking-tight">Build Your Plan</h2>
                    <p className="text-violet-500/60 text-[10px] font-black uppercase tracking-[0.3em]">Personalized Discipline Blueprint</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-900/20 text-red-400 text-[10px] font-black p-3 rounded-2xl border border-red-900/50 text-center uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    {/* Name and Email Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors" size={18} />
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full bg-[#111111] border border-white/5 text-white pl-12 pr-4 py-4 rounded-2xl focus:border-violet-500/50 outline-none transition-all placeholder:text-white/10 font-medium"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors" size={18} />
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full bg-[#111111] border border-white/5 text-white pl-12 pr-4 py-4 rounded-2xl focus:border-violet-500/50 outline-none transition-all placeholder:text-white/10 font-medium"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Weight, Height, Age Group */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="relative group">
                            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400" size={16} />
                            <input
                                name="weight"
                                type="number"
                                required
                                className="w-full bg-[#111111] border border-white/5 text-white pl-10 pr-4 py-4 rounded-2xl focus:border-violet-500/50 outline-none transition-all placeholder:text-white/10 font-medium"
                                placeholder="Weight (kg)"
                                value={formData.weight}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative group">
                            <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400" size={16} />
                            <input
                                name="height"
                                type="number"
                                required
                                className="w-full bg-[#111111] border border-white/5 text-white pl-10 pr-4 py-4 rounded-2xl focus:border-violet-500/50 outline-none transition-all placeholder:text-white/10 font-medium"
                                placeholder="Height (cm)"
                                value={formData.height}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative">
                            <input
                                name="age"
                                type="number"
                                required
                                className="w-full bg-[#111111] border border-white/5 text-white px-6 py-4 rounded-2xl focus:border-violet-500/50 outline-none transition-all placeholder:text-white/10 font-medium"
                                placeholder="Age"
                                value={formData.age}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Select Group */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                name="gender"
                                className="w-full bg-[#111111] border border-white/5 text-white px-6 py-4 rounded-2xl focus:border-violet-500/50 outline-none appearance-none cursor-pointer"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            <select
                                name="goal"
                                className="w-full bg-[#111111] border border-white/5 text-white px-6 py-4 rounded-2xl focus:border-violet-500/50 outline-none appearance-none cursor-pointer"
                                value={formData.goal}
                                onChange={handleChange}
                            >
                                <option value="lose">Weight Loss</option>
                                <option value="maintain">Maintain Weight</option>
                                <option value="gain">Weight Gain</option>
                            </select>
                        </div>
                        <select
                            name="activity"
                            className="w-full bg-[#111111] border border-white/5 text-white px-6 py-4 rounded-2xl focus:border-violet-500/50 outline-none appearance-none cursor-pointer"
                            value={formData.activity}
                            onChange={handleChange}
                        >
                            <option value="1.2">Sedentary (Office Job)</option>
                            <option value="1.375">Lightly Active (1-2 days/week)</option>
                            <option value="1.55">Moderately Active (3-5 days/week)</option>
                            <option value="1.725">Very Active (6-7 days/week)</option>
                            <option value="1.9">Athlete (2x per day)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-violet-600/20 flex items-center justify-center uppercase text-xs tracking-[0.2em] group"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            <>
                                Calculate My Plan 
                                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
