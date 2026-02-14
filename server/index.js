const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// --- FIX: CORS Configuration ---
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// --- FIX: Database Connection Timing ---
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Centralized Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Routes

// 1. Calculate and Save Profile
app.post('/api/calculate-and-save', async (req, res, next) => {
  try {
    const { name, email, weight, height, age, gender, activity, goal } = req.body;

    if (!name || !email || !weight || !height || !age || !gender || !activity) {
      return next(new AppError('Missing required profile fields', 400));
    }

    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = (gender.toLowerCase() === 'male') ? bmr + 5 : bmr - 161;

    let tdee = Math.round(bmr * parseFloat(activity));
    const goalMap = { 'lose': -500, 'maintain': 0, 'gain': 500 };
    tdee += (goalMap[goal] || 0);

    const bmi = parseFloat((weight / ((height / 100) ** 2)).toFixed(1));

    const userData = {
      name, email,
      metrics: { weight, height, age, gender, activity, goal },
      targets: { 
        dailyCalories: tdee, 
        bmi, 
        macros: {
          carbs: Math.round((tdee * 0.4) / 4),
          protein: Math.round((tdee * 0.3) / 4),
          fats: Math.round((tdee * 0.3) / 9)
        }
      }
    };

    const user = await User.findOneAndUpdate({ email }, userData, { upsert: true, new: true });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ success: true, token, data: user });
  } catch (error) {
    next(error);
  }
});

// 2. Generate Meal Plan
app.post('/api/generate-meal-plan', async (req, res, next) => {
  try {
    const { targetCalories } = req.body;
    if (!targetCalories) return next(new AppError('targetCalories is required', 400));

    const caloriesParam = `min:${targetCalories - 150},max:${targetCalories + 150}`;
    const apiURL = 'http://cosylab.iiitd.edu.in:6969/recipe2-api/mealplan/meal-plan';

    const response = await axios.get(apiURL, {
      headers: { 'Authorization': `Bearer ${process.env.RECIPEDB_KEY}` },
      params: { diet_type: 'vegan', days: 1, calories_per_day: caloriesParam }
    });

    const mealPlan = response.data?.payload?.data?.meal_plan?.["Day 1"];
    if (!mealPlan) return next(new AppError('RecipeDB API returned no plan for Day 1', 404));

    res.json({ success: true, data: mealPlan });
  } catch (error) {
    next(error);
  }
});

// --- FIX: Improved Global Error Handler ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only show the stack trace if you are in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
});

// Initialize the Database and Server
startServer();