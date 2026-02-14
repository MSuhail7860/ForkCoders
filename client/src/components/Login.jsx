import React, { useState } from 'react';
import axios from 'axios';
import { ArrowRight, Activity, User, Mail } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!name || !email) {
            setError('Please enter both name and email.');
            setLoading(false);
            return;
        }

        // In the prototype, "Login" is essentially "Check if exists" or "Start Session"
        // We will just pass the basic info up. 
        // Or we could call an endpoint to see if user exists. 
        // Let's assume we proceed to onboarding if new, or dashboard if exists.
        // For simplicity in this revert, let's just pass the data up and let App decide or 
        // call the calculate endpoint if we want to "fetch" data.

        // Actually, to restore "real" prototype behavior:
        // usually we just capture Name/Email and move to Onboarding.
        // BUT if we want to support "logging in" to see old data, we need a fetch.
        // Let's rely on calculating/saving in Onboarding for new users. 
        // checking for existing user here might be needed.

        // Simulating "Auth":
        // Logic: Pass simple user object. App.jsx will check if it has data? 
        // No, App.jsx's handleLogin expects userData. 
        // Let's try to "get" the user. 
        // Since we removed the specific 'login' route, we'll implement a simple 
        // check or just pass it through to Onboarding.

        // OPTION: Just pass { name, email } and let App route to Onboarding.
        // This is safe for a prototype.
        onLogin({ name, email });
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-brand-light rounded-full flex items-center justify-center mb-4">
                        <Activity className="h-8 w-8 text-brand" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-brand-dark">
                        Diet-To-Discipline
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your details to start your journey.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="name" className="sr-only">Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="focus:ring-brand focus:border-brand block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="focus:ring-brand focus:border-brand block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all duration-200 shadow-md transform hover:-translate-y-0.5"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
