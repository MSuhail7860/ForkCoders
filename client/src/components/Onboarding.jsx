import React, { useState } from 'react';
import axios from 'axios';
import { ArrowRight, Activity, User, Scale, Ruler } from 'lucide-react';

const Onboarding = ({ onComplete, initialUser }) => {
    const [formData, setFormData] = useState({
        name: initialUser?.name || '',
        email: initialUser?.email || '',
        weight: '',
        height: '',
        age: '',
        gender: 'male',
        activity: '1.2',
        goal: 'lose'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/calculate-and-save`, formData);
            onComplete(res.data.data); // Expecting { user, metrics, targets } structure
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || err.message || 'Failed to save profile. Please try again.';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-brand-dark">
                        Diet-To-Discipline
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Build your personalized nutrition plan.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="focus:ring-brand focus:border-brand block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Scale className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        name="weight"
                                        type="number"
                                        required
                                        className="focus:ring-brand focus:border-brand block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                        placeholder="70"
                                        value={formData.weight}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Ruler className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        name="height"
                                        type="number"
                                        required
                                        className="focus:ring-brand focus:border-brand block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                        placeholder="175"
                                        value={formData.height}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Age</label>
                                <input
                                    name="age"
                                    type="number"
                                    required
                                    className="focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    placeholder="30"
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    name="gender"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm rounded-md border"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Activity Level</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Activity className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        name="activity"
                                        className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm rounded-md border"
                                        value={formData.activity}
                                        onChange={handleChange}
                                    >
                                        <option value="1.2">Sedentary (Office Job)</option>
                                        <option value="1.375">Light Exercise (1-2 days/week)</option>
                                        <option value="1.55">Moderate Exercise (3-5 days/week)</option>
                                        <option value="1.725">Heavy Exercise (6-7 days/week)</option>
                                        <option value="1.9">Athlete (2x per day)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Goal</label>
                            <select
                                name="goal"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm rounded-md border"
                                value={formData.goal}
                                onChange={handleChange}
                            >
                                <option value="lose">Weight Loss (-500 cal)</option>
                                <option value="maintain">Maintain Weight</option>
                                <option value="gain">Weight Gain (+500 cal)</option>
                            </select>
                        </div>
                    </div >

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all duration-200"
                        >
                            {loading ? 'Calculate My Plan' : 'Calculate My Plan'}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </button>
                    </div>
                </form >
            </div >
        </div >
    );
};

export default Onboarding;
