import React, { useState } from 'react';
import Onboarding from './components/Onboarding';
import MealPlan from './components/MealPlan';
import { Target, Activity } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const handleOnboardingComplete = (data) => {
    setUser(data.user);
    setMetrics({ dailyCalories: data.dailyCalories });
  };

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

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
        {/* Dashboard Metric Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-brand-dark to-brand text-white">
          <div>
            <h2 className="text-2xl font-bold mb-2">Discipline Target</h2>
            <p className="text-brand-light opacity-90">Your daily nutritional goal to reach peak performance.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <Target className="h-10 w-10 text-white mr-4" />
            <div>
              <span className="block text-4xl font-extrabold">{metrics.dailyCalories}</span>
              <span className="text-sm font-medium uppercase tracking-wider opacity-80">Calories / Day</span>
            </div>
          </div>
        </div>

        {/* Meal Plan Section */}
        <MealPlan targetCalories={metrics.dailyCalories} />
      </main>
    </div>
  );
}

export default App;
