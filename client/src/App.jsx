import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

// Helper function to safely parse LocalStorage and prevent blank screens
const safeJsonParse = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === "undefined") return null;
    return JSON.parse(item);
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

  if (currentScreen === 'login') return <Login onLogin={handleLogin} />;
  if (currentScreen === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <Dashboard
      user={user}
      metrics={metrics}
      handleLogout={handleLogout}
    />
  );
}

export default App;