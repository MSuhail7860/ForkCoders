import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, Flame, List, Loader2, Beef, Wheat, X, Info, Pill, Clock, Utensils } from 'lucide-react';

const MealPlan = ({ targetCalories }) => {
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal State for Nutrition Details
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [nutritionData, setNutritionData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const generatePlan = async (signal) => {
        setLoading(true);
        setError(null);
        try {
            // Using targetCalories derived from user metrics
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/generate-meal-plan`,
                { dailyCalories: targetCalories },
                { signal }
            );

            if (res.data.success) {
                // Spoonacular returns { meals: [], nutrients: {} }
                setMealPlan(res.data.data);
            } else {
                setError('Failed to generate meal plan.');
            }
        } catch (err) {
            if (!axios.isCancel(err)) {
                const specificError = err.response?.data?.details || err.message;
                console.error("Meal Plan Error:", specificError);
                setError(`The kitchen is a bit busy. (${specificError})`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!targetCalories) return;
        const controller = new AbortController();
        generatePlan(controller.signal);
        return () => controller.abort();
    }, [targetCalories]);

    const handleCardClick = async (meal) => {
        setSelectedMeal(meal);
        setModalLoading(true);
        try {
            // Fetching detailed metrics for the modal
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/nutrition/${meal.id}`);
            if (res.data.success) {
                setNutritionData(res.data.data);
            }
        } catch (err) {
            console.error("Detail fetch failed", err);
        } finally {
            setModalLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedMeal(null);
        setNutritionData(null);
    };

    // --- Safety Gates to prevent Blank Page ---
    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-3 mt-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-slate-900 rounded-[32px] h-80 border border-slate-800" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="mt-8 text-red-500 text-center font-bold uppercase text-xs">{error}</div>;
    }

    // This check is crucial: if mealPlan is null, return null or a placeholder instead of crashing
    if (!mealPlan || !mealPlan.meals || !Array.isArray(mealPlan.meals)) {
        return (
            <div className="mt-8 p-10 bg-slate-900/50 rounded-[32px] border border-dashed border-slate-800 text-center">
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                    No active meal plan. Click "Regenerate" to start.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-12 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-white flex items-center">
                    <Utensils className="mr-3 text-blue-500 h-8 w-8" />
                    Your Daily Fuel
                </h3>
                <button
                    onClick={() => generatePlan()}
                    className="flex items-center px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-full transition-all font-bold text-xs"
                >
                    <ChefHat className="h-4 w-4 mr-2" />
                    Regenerate Plan
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {mealPlan.meals.map((meal, idx) => {
                    const label = ['Breakfast', 'Lunch', 'Dinner'][idx];
                    const imageUrl = `https://spoonacular.com/recipeImages/${meal.id}-556x370.${meal.imageType || 'jpg'}`;

                    return (
                        <div
                            key={meal.id}
                            onClick={() => handleCardClick(meal)}
                            className="bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 group cursor-pointer hover:border-blue-500/50 transition-all flex flex-col shadow-xl"
                        >
                            <div className="h-48 relative overflow-hidden">
                                <img
                                    src={imageUrl}
                                    alt={meal.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Recipe+Image'; }}
                                />
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                                    {label}
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h4 className="font-bold text-lg text-white mb-6 line-clamp-2 min-h-[3.5rem] leading-tight">
                                    {meal.title}
                                </h4>

                                <div className="mt-auto flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-tighter">
                                    <span className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1 text-blue-500" />
                                        {meal.readyInMinutes}m
                                    </span>
                                    <span className="flex items-center text-blue-400">
                                        <Flame className="h-3 w-3 mr-1" />
                                        {Math.round(mealPlan.nutrients.calories / 3)} kcal
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Nutrition Modal */}
            {selectedMeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
                    <div className="bg-slate-950 rounded-[40px] w-full max-w-xl p-8 border border-slate-800 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <button onClick={closeModal} className="absolute top-6 right-6 p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors">
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-2xl font-black mb-6 pr-10 text-white leading-tight">{selectedMeal.title}</h2>

                        {modalLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Analyzing Nutrients...</span>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-center">
                                        <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Fiber</div>
                                        <div className="text-2xl font-black text-green-400">{nutritionData?.fiber || '---'}</div>
                                    </div>
                                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-center">
                                        <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Sugar</div>
                                        <div className="text-2xl font-black text-red-400">{nutritionData?.sugar || '---'}</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-slate-900 rounded-2xl border border-slate-800">
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Sodium</span>
                                        <span className="text-lg font-black">{nutritionData?.sodium || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-slate-900 rounded-2xl border border-slate-800">
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Cholesterol</span>
                                        <span className="text-lg font-black">{nutritionData?.cholesterol || 'N/A'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => window.open(`https://spoonacular.com/recipes/${selectedMeal.title.replace(/\s+/g, '-')}-${selectedMeal.id}`, '_blank')}
                                    className="w-full bg-blue-600 py-5 rounded-[24px] font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 uppercase text-xs tracking-widest"
                                >
                                    Get Full Instructions
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealPlan;
