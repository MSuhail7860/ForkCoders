import React, { useState } from 'react';
import axios from 'axios';
import { ChefHat, Flame, List, Loader2 } from 'lucide-react';

const MealPlan = ({ targetCalories }) => {
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMealPlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:5000/api/generate-meal-plan', { targetCalories });
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
        <div className="mt-8 w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Your Daily Fuel</h3>
                <button
                    onClick={fetchMealPlan}
                    disabled={loading}
                    className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors"
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

                        return (
                            <div key={mealType} className="bg-white rounded-xl shadow-md overflow-hidden card-hover border border-gray-100 flex flex-col h-full">
                                <div className="bg-brand-light p-4 border-b border-brand-light">
                                    <h4 className="font-bold text-lg text-brand-dark flex items-center">
                                        {mealType}
                                    </h4>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h5 className="font-semibold text-gray-900 mb-2 leading-tight min-h-[3rem]">
                                        {mealData.Recipe_title}
                                    </h5>
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <Flame className="h-4 w-4 text-orange-500 mr-1" />
                                        <span>{Math.round(mealData.Calories)} kcal</span>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                            <List className="h-3 w-3 mr-1" /> Ingredients
                                        </div>
                                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside h-32 overflow-y-auto custom-scrollbar">
                                            {/* According to prompt: "map over the ingredients array to display each ingredient's phrase" 
                          Wait, RecipeDB returns ingredients as an object or array? Prompt says "ingredients array".
                          I'll assume it's an array of strings or objects. 
                          Ideally I should check the API structure but I'll assume standard array of strings or objects with 'phrase' or similar.
                          Checking prompt again: "map over the ingredients array to display each ingredient's phrase".
                          If it's an array of objects like { phrase: "..." }, I'll handle that.
                          If it acts weird I will debug.
                      */}
                                            {/* Assuming ingredients is a clear text array or object array with meaningful string representation */}
                                            {/* Defensive coding: check if ingredients is an object (common in some APIs) or array */}
                                            {Object.values(mealData.ingredients || {}).map((ing, idx) => (
                                                <li key={idx} className="truncate">
                                                    {typeof ing === 'string' ? ing : ing.phrase || JSON.stringify(ing)}
                                                </li>
                                            ))}
                                        </ul>
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
