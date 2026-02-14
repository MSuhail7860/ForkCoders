import React, { useState } from 'react';
import axios from 'axios';
import { ChefHat, Flame, List, Loader2, ImageOff, Beef, Wheat } from 'lucide-react';

const MealPlan = ({ targetCalories }) => {
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMealPlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:5000/api/generate-meal-plan', { targetCalories });
            // API returns { success: true, data: { ... } }
            setMealPlan(res.data.data);
        } catch (err) {
            console.error(err);
            setError('Failed to generate meal plan. The external chef might be busy!');
        } finally {
            setLoading(false);
        }
    };

    const meals = ['Breakfast', 'Lunch', 'Dinner'];

    return (
        <div className="mt-8 w-full max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Your Daily Fuel</h3>
                <button
                    onClick={fetchMealPlan}
                    disabled={loading}
                    className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ChefHat className="h-4 w-4 mr-2" />}
                    {loading ? 'Cooking...' : "Generate Today's Plan"}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                    <p className="text-red-700">{error}</p>
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

                        // Ingredients logic
                        // Ensure ingredients is an array. RecipeDB sometimes assumes object or array.
                        // Based on prompt "map over the ingredients array".
                        let ingredientsList = [];
                        if (Array.isArray(mealData.ingredients)) {
                            ingredientsList = mealData.ingredients;
                        } else if (mealData.ingredients && typeof mealData.ingredients === 'object') {
                            ingredientsList = Object.values(mealData.ingredients);
                        }

                        const displayedIngredients = ingredientsList.slice(0, 5);
                        const remainingCount = Math.max(0, ingredientsList.length - 5);

                        return (
                            <div key={mealType} className="bg-white rounded-xl shadow-md overflow-hidden card-hover border border-gray-100 flex flex-col h-full group">

                                {/* Image Header */}
                                <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                                    {mealData.img_url ? (
                                        <img
                                            src={mealData.img_url}
                                            alt={mealData.Recipe_title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                // Show fallback
                                                e.target.parentElement.querySelector('.fallback-img').style.display = 'flex';
                                            }}
                                        />
                                    ) : null}

                                    {/* Fallback (Overlay or Replacement) */}
                                    {/* We use a class 'fallback-img' to toggle visibility on error */}
                                    <div
                                        className="fallback-img absolute inset-0 flex-col items-center justify-center text-gray-400 bg-gray-100"
                                        style={{ display: mealData.img_url ? 'none' : 'flex' }}
                                    >
                                        <ImageOff className="h-10 w-10 mb-2 opacity-50" />
                                        <span className="text-xs font-semibold uppercase tracking-wider opacity-60">No Image</span>
                                    </div>
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
                                        {mealData.Recipe_title}
                                    </h4>

                                    {/* Macros Row */}
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
                                        <div className="flex flex-col items-center">
                                            <Flame className="h-4 w-4 text-orange-500 mb-1" />
                                            <span className="font-semibold text-gray-700">{Math.round(mealData.Calories)}</span>
                                            <span className="text-[10px]">kcal</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="flex flex-col items-center">
                                            <Beef className="h-4 w-4 text-red-500 mb-1" />
                                            <span className="font-semibold text-gray-700">{mealData.protein || "25g"}</span>
                                            <span className="text-[10px]">Prot</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="flex flex-col items-center">
                                            <Wheat className="h-4 w-4 text-yellow-500 mb-1" />
                                            <span className="font-semibold text-gray-700">{mealData.carbs || "45g"}</span>
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
                                                    <span className="line-clamp-1">{typeof ing === 'string' ? ing : ing.phrase || JSON.stringify(ing)}</span>
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
