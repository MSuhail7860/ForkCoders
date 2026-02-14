const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
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

startServer();

// Centralized Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Routes

// 1. Calculate & Save User Data
app.post('/api/calculate-and-save', async (req, res, next) => {
  try {
    const { name, email, weight, height, age, gender, activity, goal } = req.body;

    if (!name || !email || !weight || !height || !age || !gender || !activity || !goal) {
      return next(new AppError('All fields are required', 400));
    }

    // --- CALCULATIONS ---
    const bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    const tdee = bmr * parseFloat(activity);

    let dailyCalories = tdee;
    if (goal === 'lose') dailyCalories -= 500;
    else if (goal === 'gain') dailyCalories += 500;

    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

    const protein = Math.round((dailyCalories * 0.30) / 4);
    const fats = Math.round((dailyCalories * 0.35) / 9);
    const carbs = Math.round((dailyCalories * 0.35) / 4);

    // --- DATABASE SAVE ---
    const metrics = { weight, height, age, gender, activity, goal };
    const targets = { bmr: Math.round(bmr), tdee: Math.round(tdee), dailyCalories: Math.round(dailyCalories), macros: { protein, fats, carbs }, bmi };

    // Check if user exists, update if so, create if not
    let user = await User.findOne({ email });
    if (user) {
      user.name = name;
      user.metrics = metrics;
      user.targets = targets;
      await user.save();
    } else {
      user = new User({
        name,
        email,
        metrics,
        targets
      });
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: {
        user: { name: user.name, email: user.email }, // Send back minimal info
        metrics: user.metrics,
        targets: user.targets
      }
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. Meal Plan Generator 
// ==========================================

const MOCK_MEAL_PLAN = {
  "Breakfast": {
    "Recipe_title": "Protein Pancakes with Greek Yogurt & Honey",
    "Calories": 410,
    "protein": "28g",
    "carbs": "45g",
    "fats": "12g",
    "img_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4-nC9f-oC0KpAkjTsnVXwWTgxj3DRiTkjIQ&s",
    "ingredients": ["Protein Powder", "Oat Flour", "Eggs", "Greek Yogurt", "Raw Honey"]
  },
  "Lunch": {
    "Recipe_title": "Spicy Grilled Chicken & Avocado Wrap",
    "Calories": 580,
    "protein": "42g",
    "carbs": "55g",
    "fats": "22g",
    "img_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn-X0iAxR5HSAGBfeqyLjDEcSUrzmyQsh19A&s",
    "ingredients": ["Grilled Chicken Breast", "Whole Wheat Wrap", "Avocado", "Spinach", "Sriracha Mayo"]
  },
  "Dinner": {
    "Recipe_title": "Baked Lemon Salmon with Asparagus & Quinoa",
    "Calories": 520,
    "protein": "38g",
    "carbs": "35g",
    "fats": "24g",
    "img_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpZt_QedC2pwU_8hP3B-fKsmasHWYfXO5YTw&s",
    "ingredients": ["Wild Caught Salmon", "Asparagus", "Quinoa", "Olive Oil", "Fresh Lemon"]
  }
};

app.post('/api/generate-meal-plan', async (req, res, next) => {
  try {
    // We are returning the MOCK_MEAL_PLAN so the frontend cards render perfectly
    res.json({ success: true, data: MOCK_MEAL_PLAN });
  } catch (error) {
    next(error);
  }
});

// 3. Recipe of the Day (RecipeDB API)
app.get('/api/recipe-of-the-day', async (req, res, next) => {
  try {
    const response = await axios.get('https://cosylab.iiitd.edu.in/recipe-db/api/recipes?page=1&limit=1');
    if (response.data) {
      res.json({ success: true, data: response.data });
    } else {
      throw new Error("No data from RecipeDB");
    }
  } catch (error) {
    next(new AppError('Failed to fetch recipe', 502));
  }
});

// 4. Snack Finder
app.get('/api/recipes/protein', async (req, res, next) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
});

app.get('/api/recipes/carbs', async (req, res, next) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
});

// 5. Image Analysis (Gemini Vision)
app.post('/api/analyze-food', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No image uploaded', 400));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Analyze this food image. Identify the food item and estimate its calories, protein, carbs, and fats. Return ONLY a JSON object with keys: name, calories, protein, carbs, fats. Do not use Markdown formatting.";

    const imageParts = [{ inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype } }];
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;

    const text = response.text();
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(jsonString);

    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error("Gemini Vision Error:", err);
    next(new AppError('Failed to analyze image', 500));
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});