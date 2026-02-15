import React from 'react';
import { TrendingUp, Scale, Target, ChevronLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const ProgressTracker = ({ metrics, onClose }) => {
    // Extracting data from the user summary and props
    const currentWeight = metrics?.weight || metrics?.data?.metrics?.weight || 0;
    const targetCals = metrics?.dailyCalories || metrics?.data?.targets?.dailyCalories || 0;
    const bmi = metrics?.bmi || metrics?.data?.targets?.bmi || 0;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 animate-in fade-in duration-500">
            <button onClick={onClose} className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
                <ChevronLeft className="mr-2" /> Back to Dashboard
            </button>

            <h2 className="text-4xl font-black mb-10 flex items-center">
                <TrendingUp className="mr-4 text-orange-500" size={40} /> Progress Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Weight Card */}
                <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <Scale className="text-blue-400" size={24} />
                        <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-2 py-1 rounded-lg flex items-center">
                            <ArrowDownRight size={12} className="mr-1" /> 2.4%
                        </span>
                    </div>
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Current Weight</div>
                    <div className="text-4xl font-black">{currentWeight} <span className="text-sm">kg</span></div>
                    <div className="mt-6 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[70%]" />
                    </div>
                </div>

                {/* BMI Card */}
                <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <Target className="text-purple-400" size={24} />
                        <span className="text-slate-500 text-[10px] font-black uppercase">Healthy Range</span>
                    </div>
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Current BMI</div>
                    <div className="text-4xl font-black">{bmi}</div>
                    <p className="text-xs text-slate-400 mt-4 italic">You are in the "Normal" weight category.</p>
                </div>

                {/* Calorie Card */}
                <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <TrendingUp className="text-orange-400" size={24} />
                        <span className="bg-orange-500/10 text-orange-400 text-[10px] font-black px-2 py-1 rounded-lg">Active</span>
                    </div>
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Daily Burn Goal</div>
                    <div className="text-4xl font-black">{targetCals} <span className="text-sm">kcal</span></div>
                </div>
            </div>

            {/* History Placeholder */}
            <div className="mt-12 bg-slate-900 p-10 rounded-[48px] border border-slate-800">
                <h3 className="text-2xl font-black mb-6">Activity History</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
                            <span className="text-sm font-bold text-slate-400">Feb {15 - i}, 2026</span>
                            <span className="text-sm font-black text-white">Target Met: {targetCals} kcal</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;