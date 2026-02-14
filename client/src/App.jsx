import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login', 'onboarding', 'dashboard'

  // Load from local storage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedMetrics = localStorage.getItem('metrics');

    if (savedUser && savedMetrics) {
      setUser(JSON.parse(savedUser));
      setMetrics(JSON.parse(savedMetrics));
      setCurrentScreen('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    // For prototype, "Login" might just be entering name/email or 
    // if the user already exists in DB, we fetch them.
    // Simulating login:
    setUser(userData);

    // Check if we have metrics (if returning user)
    if (userData.metrics && userData.metrics.weight) {
      setMetrics(userData.metrics); // And targets presumably
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('metrics', JSON.stringify(userData.metrics));
      // Note: metrics in DB might be nested differently than local expectation, but let's assume standard
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('onboarding');
    }
  };

  const handleOnboardingComplete = (data) => {
    // data = { user, metrics, targets } from backend
    setUser(data.user);
    setMetrics({ ...data.metrics, ...data.targets });

    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('metrics', JSON.stringify({ ...data.metrics, ...data.targets }));

    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setMetrics(null);
    localStorage.removeItem('user');
    localStorage.removeItem('metrics');
    setCurrentScreen('login');
  };

  return (
    <div>
      {currentScreen === 'login' && <Login onLogin={handleLogin} />}
      {currentScreen === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} initialUser={user} />}
      {currentScreen === 'dashboard' && <Dashboard user={user} metrics={metrics} handleLogout={handleLogout} />}
    </div>
  );
}

export default App;