import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, Flame, List, Loader2, ImageOff, Beef, Wheat } from 'lucide-react';

const MealPlan = ({ targetCalories }) => {
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // FIX: Extracted fetch logic into a callback that supports an abort signal
    const generatePlan = async (signal) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/generate-meal-plan`,
                { targetCalories },
                { signal } // Pass the abort signal to axios
            );

            if (res.data.success) {
                setMealPlan(res.data.data);
            } else {
                setError('Failed to generate meal plan.');
            }
        } catch (err) {
            // Check if the error is just a canceled request
            if (axios.isCancel(err)) {
                console.log('Meal plan fetch aborted because component unmounted.');
            } else {
                console.error(err);
                setError('Failed to generate meal plan. The external chef is busy!');
            }
        } finally {
            setLoading(false);
        }
    };

    // FIX: UseEffect with AbortController and cleanup function
    useEffect(() => {
        if (!targetCalories) return;

        const controller = new AbortController();

        // Auto-fetch when targetCalories are available/change
        generatePlan(controller.signal);

        // Cleanup function runs when component unmounts
        return () => {
            controller.abort(); // Cancels the axios request
        };
    }, [targetCalories]);

    // For manual button clicks (if the user wants to regenerate)
    const handleManualFetch = () => {
        generatePlan(); // Without signal, as it's a direct user action, but still safe
    };

    const meals = ['Breakfast', 'Lunch', 'Dinner'];

    return (
        <div className="mt-8 w-full max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Your Daily Fuel</h3>
                <button
                    onClick={handleManualFetch}
                    disabled={loading}
                    className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ChefHat className="h-4 w-4 mr-2" />}
                    {loading ? 'chef is cooking...' : "Regenerate Plan"}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {loading && (
                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-white rounded-xl h-80 w-full flex flex-col border border-gray-100 shadow-sm">
                            <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                            <div className="p-5 space-y-3 flex-1">
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="flex justify-between pt-4 mt-auto">
                                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!mealPlan && !loading && !error && (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                    <ChefHat className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">No meal plan generated yet. Click the button above!</p>
                </div>
            )}

            {mealPlan && (
                <div className="grid gap-6 md:grid-cols-3">
                    {meals.map((mealType) => {
                        const mealData = mealPlan[mealType];
                        if (!mealData) return null;

                        // Ingredients logic: Ensure it's an array for mapping
                        let ingredientsList = [];
                        if (Array.isArray(mealData.ingredients)) {
                            ingredientsList = mealData.ingredients;
                        } else if (mealData.ingredients && typeof mealData.ingredients === 'object') {
                            ingredientsList = Object.values(mealData.ingredients);
                        }

                        const displayedIngredients = ingredientsList.slice(0, 5);
                        const remainingCount = Math.max(0, ingredientsList.length - 5);

                        // Macro Injection Logic
                        const calories = Math.round(mealData.Calories || 0);
                        const protein = mealData.protein || (Math.round(calories * 0.075) + "g");
                        const carbs = mealData.carbs || (Math.round(calories * 0.1) + "g");

                        return (
                            <div key={mealType} className="bg-white rounded-xl shadow-md overflow-hidden card-hover border border-gray-100 flex flex-col h-full group">

                                {/* Image Header with Strict Fallback */}
                                <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                                    <img
                                        src={mealData.img_url || 'https://placehold.co/600x400?text=Recipe+Image'}
                                        alt={mealData.Recipe_title || mealType}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/600x400?text=Recipe+Image';
                                        }}
                                    />
                                </div>

                                <div className="bg-white p-5 flex-1 flex flex-col relative">
                                    {/* Meal Tag */}
                                    <div className="absolute top-0 right-0 transform -translate-y-1/2 mr-4">
                                        <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                                            {mealType}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h4 className="font-bold text-lg text-brand-dark mb-3 mt-2 leading-tight min-h-[3.5rem] line-clamp-2">
                                        {mealData.Recipe_title || "Unknown Recipe"}
                                    </h4>

                                    {/* Macros Row */}
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
                                        <div className="flex flex-col items-center">
                                            <Flame className="h-4 w-4 text-orange-500 mb-1" />
                                            <span className="font-semibold text-gray-700">{calories}</span>
                                            <span className="text-[10px]">kcal</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="flex flex-col items-center">
                                            <Beef className="h-4 w-4 text-red-500 mb-1" />
                                            <span className="font-semibold text-gray-700">{protein}</span>
                                            <span className="text-[10px]">Prot</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="flex flex-col items-center">
                                            <Wheat className="h-4 w-4 text-yellow-500 mb-1" />
                                            <span className="font-semibold text-gray-700">{carbs}</span>
                                            <span className="text-[10px]">Carb</span>
                                        </div>
                                    </div>

                                    {/* Ingredients */}
                                    <div className="mt-auto">
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                            <List className="h-3 w-3 mr-1" /> Ingredients
                                        </div>
                                        <ul className="space-y-1.5">
                                            {displayedIngredients.map((ing, idx) => (
                                                <li key={idx} className="flex items-start text-xs text-gray-600">
                                                    <span className="mr-2 text-brand">•</span>
                                                    <span className="line-clamp-1">
                                                        {typeof ing === 'string' ? ing : (ing.phrase || JSON.stringify(ing))}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        {remainingCount > 0 && (
                                            <p className="text-xs text-brand font-medium mt-2 pl-3">
                                                + {remainingCount} more...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MealPlan;
