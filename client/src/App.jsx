import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure this is imported!
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import MealPlan from './components/MealPlan';
import { Target, Activity, Droplet, Camera, Dumbbell, TrendingUp, Plus, Minus, X } from 'lucide-react';

// Helper function to safely parse LocalStorage and prevent blank screens
const safeJsonParse = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error parsing ${key} from LocalStorage, clearing it.`, error);
    localStorage.removeItem(key);
    return null;
  }
};

function App() {
  // CRASH-PROOF INITIALIZATION
  const [currentScreen, setCurrentScreen] = useState(() => {
    return safeJsonParse('userMetrics') ? 'dashboard' : 'login';
  });
  
  const [user, setUser] = useState(() => safeJsonParse('userData'));
  const [metrics, setMetrics] = useState(() => safeJsonParse('userMetrics'));

  const [waterIntake, setWaterIntake] = useState(0);
  const [workout, setWorkout] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  
  // State for AI Analysis Loading
  const [analyzingImage, setAnalyzingImage] = useState(false);

  const handleLogin = (name) => {
    setUser({ name });
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = (data) => {
    setUser(data.data); 
    setMetrics(data);
    setCurrentScreen('dashboard');

    localStorage.setItem('userData', JSON.stringify(data.data));
    localStorage.setItem('userMetrics', JSON.stringify(data));
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setMetrics(null);
    setCurrentScreen('login');
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

  // ACTUAL AI INTEGRATION LOGIC
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnalyzingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/api/analyze-food', formData, {
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

  if (currentScreen === 'login') return <Login onLogin={handleLogin} />;
  if (currentScreen === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;

  const userWeight = metrics?.data?.metrics?.weight || metrics?.user?.metrics?.weight || 0;
  const userGoal = metrics?.goal || metrics?.data?.metrics?.goal || 'maintain';
  const targetCals = metrics?.dailyCalories || metrics?.data?.targets?.dailyCalories;
  const targetBmi = metrics?.bmi || metrics?.data?.targets?.bmi;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-brand-dark to-brand rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <h2 className="text-lg font-medium opacity-90 mb-1">Discipline Target</h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-extrabold">{targetCals}</span>
                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">kcal</span>
              </div>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium capitalize">
                Goal: {userGoal}
              </div>
            </div>
          </div>

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
              <span className="text-4xl font-bold text-gray-900">{targetBmi}</span>
              <span className="ml-2 text-sm font-medium text-gray-500">
                {targetBmi < 18.5 ? 'Underweight' : targetBmi < 25 ? 'Normal Weight' : 'Overweight'}
              </span>
            </div>
          </div>

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
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${(waterIntake / 8) * 100}%` }}></div>
            </div>
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
                <X className="h-4 w-4"/>
             </button>
            <Dumbbell className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <h4 className="font-bold text-purple-800 text-sm uppercase tracking-wide">Your Plan</h4>
              <p className="text-purple-700 font-medium">{workout}</p>
            </div>
          </div>
        )}

        <MealPlan targetCalories={targetCals} />
      </main>
    </div>
  );
}

export default App;