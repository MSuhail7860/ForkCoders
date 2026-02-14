import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, Flame, List, Loader2, Beef, Wheat, X, Info, Pill } from 'lucide-react';

const MealPlan = ({ targetCalories }) => {
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Deep Dive Modal State
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [nutritionData, setNutritionData] = useState(null);
    const [microData, setMicroData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const generatePlan = async (signal) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/generate-meal-plan`,
                { targetCalories },
                { signal } 
            );

            if (res.data.success) {
                setMealPlan(res.data.data);
            } else {
                setError('Failed to generate meal plan.');
            }
        } catch (err) {
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

    useEffect(() => {
        if (!targetCalories) return;
        const controller = new AbortController();
        generatePlan(controller.signal);
        return () => {
            controller.abort();
        };
    }, [targetCalories]);

    const handleManualFetch = () => {
        generatePlan(); 
    };

    const handleCardClick = async (mealData) => {
        const recipeId = mealData.Recipe_id || mealData.id;
        setSelectedMeal(mealData);

        if (recipeId) {
            setModalLoading(true);
            try {
                const [nutritionRes, microRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/nutrition/${recipeId}`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/micronutrition/${recipeId}`)
                ]);

                setNutritionData(nutritionRes.data?.data || null);
                setMicroData(microRes.data?.data || null);

            } catch (err) {
                console.error("Failed to fetch details", err);
            } finally {
                setModalLoading(false);
            }
        } else {
            setNutritionData(null);
            setMicroData(null);
        }
    };

    const closeModal = () => {
        setSelectedMeal(null);
        setNutritionData(null);
        setMicroData(null);
    };

    const meals = ['Breakfast', 'Lunch', 'Dinner'];

    return (
        <div className="mt-8 w-full max-w-5xl mx-auto relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Your Daily Fuel</h3>
                <button
                    onClick={handleManualFetch}
                    disabled={loading}
                    className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ChefHat className="h-4 w-4 mr-2" />}
                    {loading ? 'Chef is cooking...' : "Regenerate Plan"}
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

                        let ingredientsList = [];
                        if (Array.isArray(mealData.ingredients)) {
                            ingredientsList = mealData.ingredients;
                        } else if (mealData.ingredients && typeof mealData.ingredients === 'object') {
                            ingredientsList = Object.values(mealData.ingredients);
                        }

                        const displayedIngredients = ingredientsList.slice(0, 5);
                        const remainingCount = Math.max(0, ingredientsList.length - 5);

                        const calories = Math.round(mealData.Calories || 0);
                        const protein = mealData.protein || (Math.round(calories * 0.075) + "g");
                        const carbs = mealData.carbs || (Math.round(calories * 0.1) + "g");

                        return (
                            <div
                                key={mealType}
                                onClick={() => handleCardClick(mealData)}
                                className="bg-white rounded-xl shadow-md overflow-hidden card-hover border border-gray-100 flex flex-col h-full group cursor-pointer hover:ring-2 hover:ring-brand hover:ring-offset-2 transition-all"
                            >
                                <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                                    <img
                                        src={mealData.img_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'}
                                        alt={mealData.Recipe_title || mealType}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-brand-dark px-4 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                                            View Nutrition
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white p-5 flex-1 flex flex-col relative">
                                    <div className="absolute top-0 right-0 transform -translate-y-1/2 mr-4">
                                        <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                                            {mealType}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-lg text-brand-dark mb-3 mt-2 leading-tight min-h-[3.5rem] line-clamp-2">
                                        {mealData.Recipe_title || "Unknown Recipe"}
                                    </h4>

                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
                                        <div className="flex flex-col items-center">
                                            <Flame className="h-4 w-4 text-orange-500 mb-1" />
                                            <span className="font-semibold text-gray-700">{calories}</span>
                                            <span className="text-[10px]">kcal</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="flex flex-col items-center">
                                            <Beef className="h-4 w-4 text-red-500 mb-1" />
                                            <span className="font-semibold text-gray-700">{String(protein).replace('g', '')}</span>
                                            <span className="text-[10px]">Prot</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="flex flex-col items-center">
                                            <Wheat className="h-4 w-4 text-yellow-500 mb-1" />
                                            <span className="font-semibold text-gray-700">{String(carbs).replace('g', '')}</span>
                                            <span className="text-[10px]">Carb</span>
                                        </div>
                                    </div>

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

            {selectedMeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-fade-in flex flex-col">

                        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 pr-8 leading-tight">
                                {selectedMeal.Recipe_title}
                            </h2>
                            <button onClick={closeModal} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="w-full h-48 rounded-xl overflow-hidden mb-6 bg-gray-100">
                                <img
                                    src={selectedMeal.img_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
                                    }}
                                />
                            </div>

                            {modalLoading && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-brand animate-spin mb-2" />
                                    <span className="text-gray-500">Analyzing molecular structure...</span>
                                </div>
                            )}

                            {!modalLoading && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                                            <Flame className="h-5 w-5 text-orange-500 mr-2" />
                                            Macronutrients
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                                                <div className="text-2xl font-bold text-orange-700">{Math.round(selectedMeal.Calories || 0)}</div>
                                                <div className="text-xs font-bold text-orange-400 uppercase">Calories</div>
                                            </div>
                                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                                                <div className="text-2xl font-bold text-red-700">{String(selectedMeal.protein || '0g').replace('g', '')}g</div>
                                                <div className="text-xs font-bold text-red-400 uppercase">Protein</div>
                                            </div>
                                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-center">
                                                <div className="text-2xl font-bold text-yellow-700">{String(selectedMeal.carbs || '0g').replace('g', '')}g</div>
                                                <div className="text-xs font-bold text-yellow-400 uppercase">Carbs</div>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                                <div className="text-2xl font-bold text-blue-700">{String(selectedMeal.fats || '0g').replace('g', '')}g</div>
                                                <div className="text-xs font-bold text-blue-400 uppercase">Fats</div>
                                            </div>
                                        </div>
                                    </div>

                                    {nutritionData && Object.keys(nutritionData).length > 0 && (
                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                            <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                                                <Info className="h-4 w-4 mr-2" /> Detailed Breakdown
                                            </h4>
                                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                                <div className="flex justify-between border-b border-gray-200 pb-1">
                                                    <span className="text-gray-500">Fiber</span>
                                                    <span className="font-medium text-gray-800">{nutritionData.fiber || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200 pb-1">
                                                    <span className="text-gray-500">Sugar</span>
                                                    <span className="font-medium text-gray-800">{nutritionData.sugar || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200 pb-1">
                                                    <span className="text-gray-500">Sodium</span>
                                                    <span className="font-medium text-gray-800">{nutritionData.sodium || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200 pb-1">
                                                    <span className="text-gray-500">Cholesterol</span>
                                                    <span className="font-medium text-gray-800">{nutritionData.cholesterol || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {microData && Object.keys(microData).length > 0 && (
                                        <div>
                                            <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                                                <Pill className="h-5 w-5 text-purple-500 mr-2" />
                                                Micronutrients
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(microData).slice(0, 10).map(([key, value], idx) => (
                                                    <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium border border-purple-100">
                                                        {key}: {String(value)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(!nutritionData || Object.keys(nutritionData).length === 0) && (!microData || Object.keys(microData).length === 0) && (
                                        <div className="text-center py-8 text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-xl">
                                            Detailed nutritional breakdown unavailable for this specific recipe.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealPlan;
