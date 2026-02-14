import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Activity, Droplet, Camera, Dumbbell, TrendingUp, Plus, Minus, X, Utensils, Zap, Search, ChevronRight, AlertCircle } from 'lucide-react';
import MealPlan from './MealPlan';

// Helper for safe JSON parsing
const safeJsonParse = (key) => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === "undefined") return null;
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error parsing ${key} from LocalStorage, clearing it.`, error);
        localStorage.removeItem(key);
        return null;
    }
};

// --- MOCK DATA FOR FALLBACK ---
const MOCK_RECIPES = [
    { Recipe_title: "Avocado & Egg Toast", Calories: 340, protein: "12g", carbs: "30g", fats: "20g", img_url: "https://www.crunchtimekitchen.com/wp-content/uploads/2018/10/Everything-Avocado-Toast.jpg" },
    { Recipe_title: "Berry Power Smoothie", Calories: 290, protein: "15g", carbs: "45g", fats: "5g", img_url: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&q=80" },
    { Recipe_title: "Grilled Salmon Bowl", Calories: 480, protein: "35g", carbs: "10g", fats: "28g", img_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80" },
    { Recipe_title: "Quinoa Salad", Calories: 320, protein: "8g", carbs: "42g", fats: "12g", img_url: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&q=80" },
    { Recipe_title: "Chia Seed Pudding", Calories: 220, protein: "6g", carbs: "25g", fats: "10g", img_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3GLvkNHUBNgPQszOY4N4NZUWc-jDuRLVlMw&s" }
];

const MOCK_SNACKS = {
    protein: [
        { Recipe_title: "Greek Yogurt Parfait", Calories: 180, protein: "15g", img_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80" },
        { Recipe_title: "Hard Boiled Eggs", Calories: 140, protein: "12g", img_url: "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&q=80" },
        { Recipe_title: "Tuna Salad Cup", Calories: 160, protein: "20g", img_url: "https://www.thewickednoodle.com/wp-content/uploads/2020/12/Tuna-Salad-Lettuce-Cups-5-of-5.jpg" },
        { Recipe_title: "Almonds & Nuts", Calories: 200, protein: "7g", img_url: "https://media.post.rvohealth.io/wp-content/uploads/2020/07/almonds-walnuts-nuts-732x549-thumbnail.jpg" },
        { Recipe_title: "Protein Shake", Calories: 130, protein: "25g", img_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbu_a-VsWOI1eW0HufgnectuuhKJDrDz4bnQ&s" }
    ],
    carbs: [ // Low Carb
        { Recipe_title: "Cucumber Hummus", Calories: 90, carbs: "5g", img_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdMRdZtSFCJK6EOl2ukH534jQdUQJun1iUsg&s" },
        { Recipe_title: "Celery Sticks", Calories: 30, carbs: "2g", img_url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTAKXUCezR-RVJcwR8pTTZR25AguasAbdDrtJ8FsPP02Dl7TKjO" },
        { Recipe_title: "Zucchini Chips", Calories: 110, carbs: "6g", img_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRnQ5t62b7Wy4Lo8LCaFh2Bu8KwX7AsLSs2g&s" },
        { Recipe_title: "Cheese Slices", Calories: 150, carbs: "1g", img_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&q=80" },
        { Recipe_title: "Avocado Slices", Calories: 160, carbs: "4g", img_url: "https://images.unsplash.com/photo-1601039641847-7857b994d704?w=600&q=80" }
    ]
};

const Dashboard = ({ user, metrics, handleLogout }) => {
    // PERSISTENCE: Lazy initialization for waterIntake
    const [waterIntake, setWaterIntake] = useState(() => {
        const saved = safeJsonParse('waterIntake');
        return saved !== null ? saved : 0;
    });

    // PERSISTENCE: Lazy initialization for workout
    const [workout, setWorkout] = useState(() => {
        const saved = safeJsonParse('workoutPlan');
        return saved !== null ? saved : null;
    });

    const [showProgressModal, setShowProgressModal] = useState(false);
    const [analyzingImage, setAnalyzingImage] = useState(false);

    // NEW: Recipe of the Day State
    const [recipeOfDay, setRecipeOfDay] = useState(null);
    const [recipeLoading, setRecipeLoading] = useState(true);

    // NEW: Snack Finder State
    const [snacks, setSnacks] = useState(null);
    const [snackLoading, setSnackLoading] = useState(false);
    const [snackType, setSnackType] = useState(null); // 'protein' or 'carbs'

    // PERSISTENCE: Save waterIntake whenever it changes
    useEffect(() => {
        localStorage.setItem('waterIntake', JSON.stringify(waterIntake));
    }, [waterIntake]);

    // PERSISTENCE: Save workout whenever it changes
    useEffect(() => {
        localStorage.setItem('workoutPlan', JSON.stringify(workout));
    }, [workout]);

    // FETCH: Recipe of the Day on Mount with Fallback
    useEffect(() => {
        const fetchRecipeOfDay = async () => {
            setRecipeLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/recipe-of-the-day`);

                const recipe = res.data?.data?.payload?.data?.[0] ||
                    res.data?.data?.payload?.data ||
                    res.data?.data?.[0] ||
                    res.data?.data ||
                    res.data?.recipes?.[0];

                if (recipe && recipe.Recipe_title) {
                    setRecipeOfDay(recipe);
                } else {
                    console.warn("API Empty, using mock recipe");
                    setRecipeOfDay(MOCK_RECIPES[Math.floor(Math.random() * MOCK_RECIPES.length)]);
                }
            } catch (err) {
                console.warn("API Failed, using mock recipe", err);
                setRecipeOfDay(MOCK_RECIPES[Math.floor(Math.random() * MOCK_RECIPES.length)]);
            } finally {
                setRecipeLoading(false);
            }
        };
        fetchRecipeOfDay();
    }, []);

    // FETCH: Snacks with Fallback
    const fetchSnacks = async (type) => {
        setSnackLoading(true);
        setSnackType(type);
        setSnacks(null);
        try {
            const endpoint = type === 'protein' ? '/api/recipes/protein' : '/api/recipes/carbs';
            const params = type === 'protein' ? { min: 25, max: 100 } : { min: 0, max: 15 };

            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, { params });

            const items = res.data?.data?.payload?.data ||
                res.data?.data?.recipes ||
                res.data?.data ||
                [];

            const results = Array.isArray(items) ? items : [];

            if (results.length > 0) {
                setSnacks(results.slice(0, 10)); // Take top 10
            } else {
                setSnacks(MOCK_SNACKS[type]);
            }

        } catch (err) {
            console.warn(`API Failed for ${type}, using mocks`, err);
            setSnacks(MOCK_SNACKS[type]);
        } finally {
            setSnackLoading(false);
        }
    };

    const adjustWater = (amount) => {
        setWaterIntake(prev => Math.max(0, Math.min(8, prev + amount)));
    };

    const generateWorkoutPlan = () => {
        if (!metrics) return;
        const goal = metrics.goal || (metrics.data?.metrics?.goal);

        let plan = "";
        if (goal === 'lose') {
            plan = "30 min Cardio + High Rep Calisthenics.";
        } else if (goal === 'gain') {
            plan = "Heavy Compound Lifting (Squats/Deadlifts) + Low Reps.";
        } else {
            plan = "Yoga + Moderate Strength Training.";
        }
        setWorkout(plan);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzingImage(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/analyze-food`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { name, calories, protein, carbs, fats } = res.data.data;
            alert(`🤖 AI Analysis Complete!\n\nFood Detected: ${name}\nCalories: ${calories} kcal\nProtein: ${protein}\nCarbs: ${carbs}\nFats: ${fats}`);

        } catch (error) {
            console.error(error);
            alert("AI failed to analyze the image. Please try a clearer picture.");
        } finally {
            setAnalyzingImage(false);
            e.target.value = null;
        }
    };

    const userWeight = metrics?.weight || metrics?.data?.metrics?.weight || user?.metrics?.weight || 0;
    const userGoal = metrics?.goal || metrics?.data?.metrics?.goal || user?.metrics?.goal || 'maintain';
    const targetCals = metrics?.dailyCalories || metrics?.data?.targets?.dailyCalories || metrics?.targets?.dailyCalories || 2000;
    const targetBmi = metrics?.bmi || metrics?.data?.targets?.bmi || metrics?.targets?.bmi || 0;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 relative">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-8 w-8 text-brand" />
                        <span className="text-xl font-bold tracking-tight text-brand-dark">Diet-To-Discipline</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                            Welcome, <span className="font-semibold text-gray-800">{user?.name || 'Athlete'}</span>
                        </div>
                        <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Logout</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Modal */}
                {showProgressModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full relative shadow-2xl animate-fade-in">
                            <button onClick={() => setShowProgressModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Progress Report</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Starting Weight</span>
                                    <span className="font-semibold">{userWeight} kg</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Goal Weight (Est.)</span>
                                    <span className="font-semibold">
                                        {userGoal === 'lose' ? (userWeight - 5) : userGoal === 'gain' ? (parseInt(userWeight) + 5) : userWeight} kg
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-gray-600">Current BMI</span>
                                    <span className={`font-bold ${targetBmi < 18.5 ? 'text-yellow-600' : targetBmi < 25 ? 'text-brand' : 'text-red-600'}`}>
                                        {targetBmi}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* 1. Target Card */}
                    <div className="bg-gradient-to-r from-brand-dark to-brand rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Target className="h-24 w-24" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-lg font-medium opacity-90 mb-1">Discipline Target</h2>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-4xl font-extrabold">{targetCals}</span>
                                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">kcal</span>
                            </div>
                            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium capitalize">
                                Goal: {userGoal}
                            </div>
                        </div>
                    </div>

                    {/* 2. BMI Monitor */}
                    <div className="bg-white rounded-2xl p-6 text-gray-800 shadow-sm border border-gray-200 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-600">BMI Monitor</h2>
                                <p className="text-xs text-gray-400">Body Mass Index</p>
                            </div>
                            <div className={`p-2 rounded-lg ${targetBmi < 18.5 ? 'bg-yellow-100 text-yellow-600' : targetBmi < 25 ? 'bg-green-100 text-brand' : 'bg-red-100 text-red-600'}`}>
                                <Activity className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-3xl font-bold text-gray-900">{targetBmi}</span>
                            <span className="ml-2 text-sm font-medium text-gray-500 block mt-1">
                                {targetBmi < 18.5 ? 'Underweight' : targetBmi < 25 ? 'Normal Weight' : 'Overweight'}
                            </span>
                        </div>
                    </div>

                    {/* 3. Hydration */}
                    <div className="bg-white rounded-2xl p-6 text-gray-800 shadow-sm border border-gray-200 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-600">Hydration</h2>
                                <p className="text-xs text-blue-400 font-medium">{waterIntake}/8 glasses</p>
                            </div>
                            <Droplet className={`h-6 w-6 transition-colors duration-300 ${waterIntake > 0 ? 'text-blue-500 fill-blue-500' : 'text-blue-300'}`} />
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <button onClick={() => adjustWater(-1)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                                <Minus className="h-4 w-4" />
                            </button>
                            <div className="w-full mx-3 bg-blue-50 rounded-full h-3 overflow-hidden border border-blue-100">
                                <div
                                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-700 ease-out relative"
                                    style={{ width: `${(waterIntake / 8) * 100}%` }}
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-full"></div>
                                </div>
                            </div>
                            <button onClick={() => adjustWater(1)} className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* 4. Recipe of the Day */}
                    <div className="bg-white rounded-2xl p-0 text-gray-800 shadow-sm border border-gray-200 overflow-hidden relative group">
                        {recipeLoading ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                                <div className="animate-spin mb-2">
                                    <Utensils className="h-8 w-8 opacity-50" />
                                </div>
                                <span className="text-xs">Finding best recipe...</span>
                            </div>
                        ) : recipeOfDay ? (
                            <>
                                <div className="absolute top-2 left-2 z-10">
                                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center">
                                        <Zap className="h-3 w-3 mr-1" /> Daily Pick
                                    </span>
                                </div>
                                <img
                                    src={recipeOfDay.img_url || 'https://placehold.co/400x300?text=Recipe+of+Day'}
                                    alt={recipeOfDay.Recipe_title || 'Recipe'}
                                    className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=Yum'; }}
                                />
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight min-h-[2.5rem]">{recipeOfDay.Recipe_title}</h3>
                                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                        <span className="flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> {Math.round(recipeOfDay.Calories || 0)} kcal</span>
                                        <span className="flex items-center"><Utensils className="h-3 w-3 mr-1" /> {recipeOfDay.protein || 'N/A'} prot</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
                                <AlertCircle className="h-8 w-8 mb-2 text-red-300" />
                                <span className="text-xs font-medium">Recipe API Unavailable</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <button
                        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group relative cursor-pointer disabled:opacity-50"
                        onClick={() => document.getElementById('photo-upload').click()}
                        disabled={analyzingImage}
                    >
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                            {analyzingImage ? <Activity className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            {analyzingImage ? 'Analyzing...' : 'Photo Analyze'}
                        </span>
                        <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </button>

                    <button className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group" onClick={generateWorkoutPlan}>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                            <Dumbbell className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Workout Plan</span>
                    </button>

                    <button className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group" onClick={() => setShowProgressModal(true)}>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Progress Report</span>
                    </button>
                </div>

                {workout && (
                    <div className="mb-8 bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center shadow-sm animate-fade-in relative">
                        <button onClick={() => setWorkout(null)} className="absolute top-2 right-2 text-purple-400 hover:text-purple-600">
                            <X className="h-4 w-4" />
                        </button>
                        <Dumbbell className="h-6 w-6 text-purple-600 mr-3" />
                        <div>
                            <h4 className="font-bold text-purple-800 text-sm uppercase tracking-wide">Your Plan</h4>
                            <p className="text-purple-700 font-medium">{workout}</p>
                        </div>
                    </div>
                )}

                <MealPlan targetCalories={targetCals} />

                {/* Snack Finder */}
                <div className="mt-12 w-full max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className='flex items-center'>
                            <Search className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="text-2xl font-bold text-gray-800">Snack Discovery</h3>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => fetchSnacks('protein')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${snackType === 'protein' ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                🔥 High Protein
                            </button>
                            <button
                                onClick={() => fetchSnacks('carbs')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${snackType === 'carbs' ? 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                🥑 Low Carb
                            </button>
                        </div>
                    </div>

                    {snackLoading && (
                        <div className="flex space-x-4 overflow-x-hidden py-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="min-w-[200px] h-32 bg-gray-100 animate-pulse rounded-xl"></div>
                            ))}
                        </div>
                    )}

                    {snacks && !snackLoading && (
                        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                            {snacks.map((snack, idx) => {
                                if (!snack.Recipe_title && !snack.name) return null;

                                return (
                                    <div key={idx} className="min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-3 snap-center cursor-pointer flex flex-col">
                                        <div className="relative h-24 mb-3 rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={snack.img_url || 'https://placehold.co/200x150'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x150?text=No+Img'; }}
                                            />
                                            <div className="absolute top-1 right-1 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold text-brand-dark shadow-sm">
                                                {Math.round(snack.Calories)} kcal
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug mb-2 flex-grow">{snack.Recipe_title || snack.name}</h4>
                                        <div className="mt-auto pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                                            {snackType === 'protein' ? (
                                                <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">{snack.protein || 'High'} Prot</span>
                                            ) : (
                                                <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">{snack.carbs || 'Low'} Carb</span>
                                            )}
                                            <ChevronRight className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!snacks && !snackLoading && (
                        <div className="text-center py-6 text-gray-400 bg-white rounded-xl border border-gray-100 border-dashed">
                            Click a button above to find snacks!
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

export default Dashboard;
