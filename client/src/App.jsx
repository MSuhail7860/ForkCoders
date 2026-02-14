import React, { useState } from 'react';
import Onboarding from './components/Onboarding';
import MealPlan from './components/MealPlan';
import { Target, Activity, Droplet, Camera, Dumbbell, TrendingUp, Plus, Minus } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [waterIntake, setWaterIntake] = useState(0);

  const handleOnboardingComplete = (data) => {
    setUser(data.user);
    // data contains: dailyCalories, bmi, macros, goal, user
    setMetrics(data);
  };

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const adjustWater = (amount) => {
    setWaterIntake(prev => Math.max(0, Math.min(8, prev + amount)));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-brand" />
            <span className="text-xl font-bold tracking-tight text-gray-900">Diet-To-Discipline</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Welcome, <span className="font-semibold text-gray-800">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Card 1: Discipline Target */}
          <div className="bg-gradient-to-r from-brand-dark to-brand rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <h2 className="text-lg font-medium opacity-90 mb-1">Discipline Target</h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-extrabold">{metrics.dailyCalories}</span>
                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">kcal</span>
              </div>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium capitalize">
                Goal: {metrics.goal}
              </div>
            </div>
          </div>

          {/* Card 2: BMI Monitor */}
          <div className="bg-white rounded-2xl p-6 text-gray-800 shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-600">BMI Monitor</h2>
                <p className="text-xs text-gray-400">Body Mass Index</p>
              </div>
              <div className={`p-2 rounded-lg ${metrics.bmi < 18.5 ? 'bg-yellow-100 text-yellow-600' : metrics.bmi < 25 ? 'bg-green-100 text-brand' : 'bg-red-100 text-red-600'}`}>
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">{metrics.bmi}</span>
              <span className="ml-2 text-sm font-medium text-gray-500">
                {metrics.bmi < 18.5 ? 'Underweight' : metrics.bmi < 25 ? 'Normal Weight' : 'Overweight'}
              </span>
            </div>
          </div>

          {/* Card 3: Water Tracker */}
          <div className="bg-white rounded-2xl p-6 text-gray-800 shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold text-gray-600">Hydration</h2>
              <Droplet className={`h-6 w-6 transition-colors duration-300 ${waterIntake > 0 ? 'text-blue-500 fill-blue-500' : 'text-blue-300'}`} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-bold text-gray-900">{waterIntake}</span>
                <span className="text-gray-400 text-sm ml-1">/ 8 glasses</span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => adjustWater(-1)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                  <Minus className="h-5 w-5" />
                </button>
                <button onClick={() => adjustWater(1)} className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(waterIntake / 8) * 100}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* Feature Buttons Placeholder */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <Camera className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">Photo Analyze</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <Dumbbell className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">Workout Plan</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">Progress Report</span>
          </button>
        </div>

        {/* Meal Plan Section */}
        <MealPlan targetCalories={metrics.dailyCalories} />
      </main>
    </div>
  );
}

export default App;
