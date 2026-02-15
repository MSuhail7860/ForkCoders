import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Activity, Droplet, Camera, Dumbbell, TrendingUp, Plus, Minus, X, Utensils, Zap, Search, ChevronRight } from 'lucide-react';
import MealPlan from './MealPlan';
import ProgressTracker from './ProgressTracker'; // Import the new component

const safeJsonParse = (key) => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === "undefined") return null;
        return JSON.parse(item);
    } catch (error) { return null; }
};

const MOCK_RECIPES = [
    { Recipe_title: "Avocado & Egg Toast", img_url: "https://www.crunchtimekitchen.com/wp-content/uploads/2018/10/Everything-Avocado-Toast.jpg" }
];

const MOCK_SNACKS = {
    protein: [
        { Recipe_title: "Greek Yogurt Parfait", Calories: 180, protein: "15g", img_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80" },
        { Recipe_title: "Hard Boiled Eggs", Calories: 140, protein: "12g", img_url: "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&q=80" },
        { Recipe_title: "Tuna Salad Cup", Calories: 160, protein: "20g", img_url: "https://images.unsplash.com/photo-1628191010210-a59771599553?w=600&q=80" },
        { Recipe_title: "Protein Shake", Calories: 130, protein: "25g", img_url: "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?w=600&q=80" }
    ],
    carbs: [
        { Recipe_title: "Cucumber Hummus", Calories: 90, carbs: "5g", img_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdMRdZtSFCJK6EOl2ukH534jQdUQJun1iUsg&s" },
        { Recipe_title: "Avocado Slices", Calories: 160, carbs: "4g", img_url: "https://images.unsplash.com/photo-1601039641847-7857b994d704?w=600&q=80" },
        { Recipe_title: "Mixed Berries", Calories: 70, carbs: "12g", img_url: "https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?w=600&q=80" },
        { Recipe_title: "Cheese Slices", Calories: 150, carbs: "1g", img_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&q=80" }
    ]
};

const Dashboard = ({ user, metrics, handleLogout }) => {
    // --- State Management ---
    const [waterIntake, setWaterIntake] = useState(() => safeJsonParse('waterIntake') || 0);
    const [workout, setWorkout] = useState(() => safeJsonParse('workoutPlan'));
    const [recipeOfDay, setRecipeOfDay] = useState(null);
    const [recipeLoading, setRecipeLoading] = useState(true);
    const [snacks, setSnacks] = useState(null);
    const [snackLoading, setSnackLoading] = useState(false);
    const [snackType, setSnackType] = useState(null);
    const [analyzingImage, setAnalyzingImage] = useState(false);
    
    // Toggle state for Progress view
    const [showProgress, setShowProgress] = useState(false);

    useEffect(() => localStorage.setItem('waterIntake', waterIntake), [waterIntake]);
    useEffect(() => localStorage.setItem('workoutPlan', JSON.stringify(workout)), [workout]);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/recipe-of-the-day`);
                setRecipeOfDay(res.data?.data || MOCK_RECIPES[0]);
            } catch (err) { 
                setRecipeOfDay(MOCK_RECIPES[0]); 
            } finally { 
                setRecipeLoading(false); 
            }
        };
        fetchRecipe();
    }, []);

    const fetchSnacks = async (type) => {
        setSnackLoading(true);
        setSnackType(type);
        try {
            const endpoint = type === 'protein' ? '/api/recipes/protein' : '/api/recipes/carbs';
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`);
            setSnacks(res.data?.success && res.data.data.length > 0 ? res.data.data : MOCK_SNACKS[type]);
        } catch (err) { 
            setSnacks(MOCK_SNACKS[type]); 
        } finally { 
            setSnackLoading(false); 
        }
    };

    const targetCals = metrics?.dailyCalories || metrics?.data?.targets?.dailyCalories || 1533;
    const targetBmi = metrics?.bmi || metrics?.data?.targets?.bmi || 22.9;

    // --- Conditional Rendering for Progress View ---
    if (showProgress) {
        return <ProgressTracker metrics={metrics} onClose={() => setShowProgress(false)} />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
                <div className="flex items-center space-x-3"><Activity className="h-8 w-8 text-blue-500" /><span className="text-2xl font-black">Diet-To-Discipline</span></div>
                <div className="flex items-center space-x-4">
                    <span className="text-slate-400 font-medium">Hi, {user?.name || 'Suhail'}</span>
                    <button onClick={handleLogout} className="bg-red-900/20 text-red-400 border border-red-900/50 px-5 py-2 rounded-full text-xs font-bold transition-all hover:bg-red-900/40">Logout</button>
                </div>
            </header>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-blue-600 p-8 rounded-[32px] shadow-2xl shadow-blue-900/20">
                    <h2 className="text-[10px] font-black opacity-70 mb-2 uppercase tracking-widest">Calorie Target</h2>
                    <div className="text-4xl font-black">{targetCals} <span className="text-sm">kcal</span></div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 shadow-xl">
                    <h2 className="text-slate-500 text-[10px] font-black mb-2 uppercase tracking-widest">BMI</h2>
                    <div className="text-4xl font-black">{targetBmi}</div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 shadow-xl">
                    <h2 className="text-slate-500 text-[10px] font-black mb-2 uppercase tracking-widest">Hydration</h2>
                    <div className="flex items-center space-x-4 mt-2">
                        <button onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))} className="text-slate-500 hover:text-white"><Minus size={18}/></button>
                        <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-2 rounded-full transition-all duration-700 ease-out" style={{width: `${(waterIntake/8)*100}%`}}></div>
                        </div>
                        <button onClick={() => setWaterIntake(Math.min(8, waterIntake + 1))} className="text-slate-500 hover:text-white"><Plus size={18}/></button>
                    </div>
                </div>
                
                <div className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden relative group shadow-xl">
                    {recipeLoading ? (
                        <div className="p-8 text-slate-600 font-bold animate-pulse uppercase text-[10px]">Fetching Daily Special...</div>
                    ) : recipeOfDay && (
                        <div className="relative h-full w-full">
                            <img 
                                src={recipeOfDay.img_url} 
                                className="h-full w-full object-cover opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" 
                                alt="Recipe pick"
                                onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Healthy+Selection'; }}
                            />
                            <div className="absolute inset-0 p-5 flex flex-col justify-end bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent">
                                <div className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Recipe of the Day</div>
                                <div className="text-sm font-bold text-white leading-tight drop-shadow-md">{recipeOfDay.Recipe_title}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-6 mb-10">
                <button onClick={() => document.getElementById('photo-upload').click()} className="bg-slate-900 border border-slate-800 p-7 rounded-[32px] hover:bg-slate-800/50 hover:border-blue-500/50 transition-all group shadow-lg">
                    <Camera className="mx-auto mb-3 text-blue-400 group-hover:scale-110 transition-transform" size={28}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">{analyzingImage ? 'Scanning...' : 'AI Food Scan'}</span>
                    <input type="file" id="photo-upload" className="hidden" onChange={async (e) => {
                        const file = e.target.files[0];
                        if(!file) return;
                        const formData = new FormData(); formData.append('image', file); setAnalyzingImage(true);
                        try { 
                            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/analyze-food`, formData); 
                            alert(`Nutrition Analysis:\n${res.data.data.name}\n${res.data.data.calories} kcal | ${res.data.data.protein}g Protein`); 
                        } catch { alert("AI Scan failed. Please try a clearer photo."); } finally { setAnalyzingImage(false); }
                    }}/>
                </button>
                
                <button onClick={() => setWorkout(metrics?.goal === 'lose' ? "Fat Burn HIIT" : "Strength Training")} className="bg-slate-900 border border-slate-800 p-7 rounded-[32px] hover:bg-slate-800/50 hover:border-purple-500/50 transition-all group shadow-lg">
                    <Dumbbell className="mx-auto mb-3 text-purple-400 group-hover:rotate-12 transition-transform" size={28}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Workout</span>
                </button>

                {/* UPDATED PROGRESS BUTTON */}
                <button 
                    onClick={() => setShowProgress(true)} 
                    className="bg-slate-900 border border-slate-800 p-7 rounded-[32px] hover:bg-slate-800/50 hover:border-orange-500/50 transition-all group shadow-lg"
                >
                    <TrendingUp className="mx-auto mb-3 text-orange-400 group-hover:-translate-y-1 transition-transform" size={28}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Progress</span>
                </button>
            </div>

            {/* Workout Alert */}
            {workout && (
                <div className="mb-10 bg-slate-900 border border-purple-500/20 p-6 rounded-[32px] flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center space-x-5">
                        <div className="bg-purple-500/20 p-3 rounded-2xl"><Zap className="text-purple-400 fill-purple-400" size={20} /></div>
                        <div>
                            <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Active Routine</div>
                            <div className="text-lg font-black text-white">{workout}</div>
                        </div>
                    </div>
                    <button onClick={() => setWorkout(null)} className="p-2 text-slate-600 hover:text-white transition-colors"><X size={20}/></button>
                </div>
            )}

            <MealPlan targetCalories={targetCals} />

            {/* Snack Finder Section */}
            <div className="mt-16 bg-slate-900 p-10 rounded-[48px] border border-slate-800 shadow-inner">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <h3 className="text-3xl font-black tracking-tight text-white">Snack Finder</h3>
                    <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                        <button onClick={() => fetchSnacks('protein')} className={`px-7 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${snackType === 'protein' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>High Protein</button>
                        <button onClick={() => fetchSnacks('carbs')} className={`px-7 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${snackType === 'carbs' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Low Carb</button>
                    </div>
                </div>
                {snackLoading ? (
                    <div className="text-slate-600 font-bold uppercase text-[10px] tracking-widest text-center py-20 animate-pulse">Scanning the pantry...</div>
                ) : snacks && (
                    <div className="flex space-x-6 overflow-x-auto pb-4 hide-scrollbar snap-x">
                        {snacks.map((s, i) => (
                            <div key={i} className="min-w-[240px] bg-slate-950 p-5 rounded-[32px] border border-slate-800 snap-center group hover:border-blue-500/30 transition-all shadow-xl">
                                <div className="relative h-36 mb-5 overflow-hidden rounded-2xl shadow-inner bg-slate-900">
                                    <img src={s.img_url} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={s.Recipe_title}/>
                                    <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-lg">
                                        {Math.round(s.Calories || 0)} kcal
                                    </div>
                                </div>
                                <div className="text-sm font-black text-white truncate mb-2">{s.Recipe_title || s.name}</div>
                                <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
                                    {snackType === 'protein' ? `${s.protein || '15g'}+ Protein` : `${s.carbs || '5g'}- Carbs`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
