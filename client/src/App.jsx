import React, { useState } from 'react';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import MealPlan from './components/MealPlan';
import { Target, Activity, Droplet, Camera, Dumbbell, TrendingUp, Plus, Minus, X } from 'lucide-react';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [waterIntake, setWaterIntake] = useState(0);

  // New States for features
  const [workout, setWorkout] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const handleLogin = (name) => {
    setUser({ name });
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = (data) => {
    // data contains: dailyCalories, bmi, macros, goal, user (full profile)
    console.log("Onboarding Complete Data:", data);
    setUser(data.user);
    setMetrics(data);
    setCurrentScreen('dashboard');
  };

  const adjustWater = (amount) => {
    setWaterIntake(prev => Math.max(0, Math.min(8, prev + amount)));
  };

  // Workout Plan Logic
  const generateWorkoutPlan = () => {
    if (!metrics) return;
    const goal = metrics.goal;
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

  // Photo Analyze Logic
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Mock Analysis
      alert("AI Analyzing... [Mock Calorie Count: 450 kcal]");
    }
  };

  // 1. Login Screen
  if (currentScreen === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Onboarding Screen
  if (currentScreen === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // 3. Dashboard Screen
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 relative">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-brand" />
            <span className="text-xl font-bold tracking-tight text-brand-dark">Diet-To-Discipline</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Welcome, <span className="font-semibold text-gray-800">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Progress Modal */}
        {showProgressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full relative shadow-2xl">
              <button
                onClick={() => setShowProgressModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Progress Report</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Starting Weight</span>
                  <span className="font-semibold">{metrics?.user?.metrics?.weight} kg</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Goal Weight (Est.)</span>
                  {/* Simple estimation based on goal */}
                  <span className="font-semibold">
                    {metrics?.goal === 'lose' ? (metrics.user.metrics.weight - 5) :
                      metrics?.goal === 'gain' ? (parseInt(metrics.user.metrics.weight) + 5) :
                        metrics.user.metrics.weight} kg
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-600">Current BMI</span>
                  <span className={`font-bold ${metrics?.bmi < 18.5 ? 'text-yellow-600' : metrics?.bmi < 25 ? 'text-brand' : 'text-red-600'}`}>
                    {metrics?.bmi}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
                <span className="text-5xl font-extrabold">{metrics?.dailyCalories}</span>
                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">kcal</span>
              </div>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium capitalize">
                Goal: {metrics?.goal}
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
              <div className={`p-2 rounded-lg ${metrics?.bmi < 18.5 ? 'bg-yellow-100 text-yellow-600' : metrics?.bmi < 25 ? 'bg-green-100 text-brand' : 'bg-red-100 text-red-600'}`}>
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">{metrics?.bmi}</span>
              <span className="ml-2 text-sm font-medium text-gray-500">
                {metrics?.bmi < 18.5 ? 'Underweight' : metrics?.bmi < 25 ? 'Normal Weight' : 'Overweight'}
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

        {/* Feature Buttons Logic */}
        <div className="grid grid-cols-3 gap-4 mb-8">

          {/* Photo Analyze */}
          <button
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
            onClick={() => document.getElementById('photo-upload').click()}
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <Camera className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">Photo Analyze</span>
            <input
              type="file"
              id="photo-upload"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </button>

          {/* Workout Plan */}
          <button
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group"
            onClick={generateWorkoutPlan}
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <Dumbbell className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">Workout Plan</span>
          </button>

          {/* Progress Report */}
          <button
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group"
            onClick={() => setShowProgressModal(true)}
          >
            <div className="p-3 bg-orange-50 text-orange-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">Progress Report</span>
          </button>
        </div>

        {/* Display Generated Workout */}
        {workout && (
          <div className="mb-8 bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center shadow-sm animate-fade-in">
            <Dumbbell className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <h4 className="font-bold text-purple-800 text-sm uppercase tracking-wide">Your Plan</h4>
              <p className="text-purple-700 font-medium">{workout}</p>
            </div>
          </div>
        )}

        {/* Meal Plan Section */}
        <MealPlan targetCalories={metrics?.dailyCalories} />
      </main>
    </div>
  );
}

export default App;
