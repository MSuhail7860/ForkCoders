const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Gemini Integration ---
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
// --- MOCK DATA FOR FALLBACK ---
const MOCK_MEAL_PLAN = {
  "Breakfast": {
    "Recipe_title": "Oatmeal with Berries & Nut Butter",
    "Calories": 450,
    "protein": "15g",
    "carbs": "60g",
    "fats": "18g",
    "img_url": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&q=80",
    "ingredients": ["Oats", "Almond Milk", "Blueberries", "Peanut Butter", "Chia Seeds"]
  },
  "Lunch": {
    "Recipe_title": "Quinoa & Roasted Veggie Buddha Bowl",
    "Calories": 600,
    "protein": "22g",
    "carbs": "75g",
    "fats": "25g",
    "img_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
    "ingredients": ["Quinoa", "Chickpeas", "Sweet Potato", "Kale", "Tahini Dressing"]
  },
  "Dinner": {
    "Recipe_title": "Grilled Tofu Stir-Fry",
    "Calories": 550,
    "protein": "30g",
    "carbs": "45g",
    "fats": "28g",
    "img_url": "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&q=80",
    "ingredients": ["Firm Tofu", "Broccoli", "Bell Peppers", "Soy Sauce", "Sesame Oil"]
  }
};

app.post('/api/generate-meal-plan', async (req, res, next) => {
  try {
    const { targetCalories } = req.body;
    if (!targetCalories) return next(new AppError('targetCalories is required', 400));

    const caloriesParam = `min:${targetCalories - 150},max:${targetCalories + 150}`;
    const apiURL = 'http://cosylab.iiitd.edu.in:6969/recipe2-api/mealplan/meal-plan';

    const response = await axios.get(apiURL, {
      headers: { 'Authorization': `Bearer ${process.env.RECIPEDB_KEY}` },
      params: { diet_type: 'vegan', days: 1, calories_per_day: caloriesParam },
      timeout: 5000 // 5s timeout to trigger fallback quickly
    });

    const mealPlan = response.data?.payload?.data?.meal_plan?.["Day 1"];
    if (!mealPlan) throw new Error('RecipeDB returned empty plan');

    res.json({ success: true, data: mealPlan });
  } catch (error) {
    console.error('⚠️ RecipeDB API Failed (using mock data):', error.message);
    // FALLBACK: Return success with Mock Data
    res.json({ success: true, data: MOCK_MEAL_PLAN });
  }
});

// 3. AI Food Analysis
app.post('/api/analyze-food', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No image uploaded', 400));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this food image. Identify the main dish and estimate its nutritional content. 
    Return ONLY a JSON object with this structure (no markdown):
    {
      "name": "Food Name",
      "calories": 0,
      "protein": "0g",
      "carbs": "0g",
      "fats": "0g"
    }
    If it's not food, return "calories": 0 and "name": "Not Food".`;

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Clean up potential markdown code blocks
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    res.json({ success: true, data });
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    next(new AppError('Failed to analyze image', 500));
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