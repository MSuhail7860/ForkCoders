const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Gemini AI Integration ---
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Spoonacular API Configuration ---
const SPOONACULAR_BASE = 'https://api.spoonacular.com';
const API_KEY = process.env.SPOONACULAR_API_KEY;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// --- Database Connection ---
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI || !API_KEY) {
      throw new Error("Missing MONGO_URI or SPOONACULAR_API_KEY in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Server startup error:', err.message);
    process.exit(1);
  }
};
startServer();

// --- API Routes ---

// 1. Calculate & Save User Data (Warning Fixed Here)
app.post('/api/calculate-and-save', async (req, res) => {
  try {
    const { name, email, weight, height, age, gender, activity, goal } = req.body;

    // BMR Calculation (Mifflin-St Jeor)
    const bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    const tdee = bmr * parseFloat(activity);
    let dailyCalories = tdee;

    if (goal === 'lose') dailyCalories -= 500;
    else if (goal === 'gain') dailyCalories += 500;

    const bmi = parseFloat((weight / ((height / 100) ** 2)).toFixed(1));
    const targets = { bmr: Math.round(bmr), tdee: Math.round(tdee), dailyCalories: Math.round(dailyCalories), bmi };

    // Updated with returnDocument: 'after' to fix the Mongoose warning
    let user = await User.findOneAndUpdate(
      { email },
      { name, metrics: { weight, height, age, gender, activity, goal }, targets },
      { upsert: true, returnDocument: 'after' }
    );

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Meal Plan Generation
app.post('/api/generate-meal-plan', async (req, res) => {
  try {
    const { dailyCalories } = req.body;
    console.log(`Generating meal plan for ${dailyCalories} calories...`);
    const url = `${SPOONACULAR_BASE}/mealplanner/generate?timeFrame=day&targetCalories=${dailyCalories || 2000}&apiKey=${API_KEY}`;
    const response = await axios.get(url);
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Meal Plan API Error:", error.response?.data || error.message);
    res.status(502).json({
      success: false,
      message: 'Meal plan API error',
      details: error.response?.data?.message || error.message
    });
  }
});

// 3. Recipe of the Day
app.get('/api/recipe-of-the-day', async (req, res) => {
  try {
    const url = `${SPOONACULAR_BASE}/recipes/random?number=1&apiKey=${API_KEY}`;
    const response = await axios.get(url);
    const recipe = response.data.recipes[0];

    const imgUrl = recipe.image || `https://spoonacular.com/recipeImages/${recipe.id}-636x393.jpg`;

    res.json({
      success: true, data: {
        Recipe_title: recipe.title,
        img_url: imgUrl
      }
    });
  } catch (error) {
    res.status(502).json({ success: false, message: 'Recipe API error' });
  }
});

// 4. Nutrient Specific Snacks
app.get('/api/recipes/protein', async (req, res) => {
  try {
    const { min = 25 } = req.query;
    const url = `${SPOONACULAR_BASE}/recipes/findByNutrients?minProtein=${min}&number=10&apiKey=${API_KEY}`;
    const response = await axios.get(url);
    const mappedData = response.data.map(item => ({
      Recipe_title: item.title,
      img_url: item.image,
      Calories: item.calories,
      protein: item.protein
    }));
    res.json({ success: true, data: mappedData });
  } catch (error) { res.json({ success: false, data: [] }); }
});

app.get('/api/recipes/carbs', async (req, res) => {
  try {
    const { max = 15 } = req.query;
    const url = `${SPOONACULAR_BASE}/recipes/findByNutrients?maxCarbs=${max}&number=10&apiKey=.${API_KEY}`;
    const response = await axios.get(url);
    const mappedData = response.data.map(item => ({
      Recipe_title: item.title,
      img_url: item.image,
      Calories: item.calories,
      carbs: item.carbs
    }));
    res.json({ success: true, data: mappedData });
  } catch (error) { res.json({ success: false, data: [] }); }
});

// 5. Nutrition Detail Helper
app.get('/api/nutrition/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${SPOONACULAR_BASE}/recipes/${id}/nutritionWidget.json?apiKey=${API_KEY}`;
    const response = await axios.get(url);
    const data = {
      fiber: response.data.bad.find(i => i.title === 'Fiber')?.amount || '0g',
      sugar: response.data.bad.find(i => i.title === 'Sugar')?.amount || '0g',
      sodium: response.data.bad.find(i => i.title === 'Sodium')?.amount || '0mg',
      cholesterol: response.data.bad.find(i => i.title === 'Cholesterol')?.amount || '0mg',
    };
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch details" });
  }
});

// 6. Image Analysis (Gemini)
app.post('/api/analyze-food', upload.single('image'), async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Analyze this food image. Return ONLY a JSON object with keys: name, calories, protein, carbs, fats. No Markdown.";
    const result = await model.generateContent([{ inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype } }, prompt]);
    const cleanJson = result.response.text().replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleanJson);
    res.json({ success: true, data: analysis });
  } catch (err) { res.status(500).json({ success: false, message: 'AI Analysis failed' }); }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
});