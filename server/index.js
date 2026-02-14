const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow all origins for dev
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes

// 1. Calculate and Save Profile
app.post('/api/calculate-and-save', async (req, res) => {
  try {
    const { name, email, weight, height, age, gender, activity } = req.body;

    if (!name || !email || !weight || !height || !age || !gender || !activity) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Calculate BMR (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender.toLowerCase() === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Calculate TDEE
    let tdee = Math.round(bmr * parseFloat(activity));

    // Adjust for Goal
    const goalMap = {
      'lose': -500,
      'maintain': 0,
      'gain': 500
    };
    tdee += (goalMap[req.body.goal] || 0);

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

    // Calculate Macros (40% C, 30% P, 30% F)
    const macros = {
      carbs: Math.round((tdee * 0.4) / 4),
      protein: Math.round((tdee * 0.3) / 4),
      fats: Math.round((tdee * 0.3) / 9)
    };

    // Save or Update User
    let user = await User.findOne({ email });
    const userData = {
      name,
      email,
      metrics: { weight, height, age, gender, activity, goal: req.body.goal },
      targets: { dailyCalories: tdee, bmi, macros }
    };

    if (user) {
      Object.assign(user, userData);
      await user.save();
    } else {
      user = new User(userData);
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: {
        dailyCalories: tdee,
        bmi,
        macros,
        goal: req.body.goal,
        user
      }
    });
  } catch (error) {
    console.error('Error in /api/calculate-and-save:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// 2. Generate Meal Plan
app.post('/api/generate-meal-plan', async (req, res) => {
  try {
    const { targetCalories } = req.body;

    if (!targetCalories) {
      return res.status(400).json({ success: false, error: 'targetCalories is required' });
    }

    const minCalories = targetCalories - 150;
    const maxCalories = targetCalories + 150;

    // Construct the query parameter string manually as required by the prompt
    // ?diet_type=vegan&days=1&calories_per_day={min:${targetCalories - 150},max:${targetCalories + 150}}
    const caloriesParam = `{min:${minCalories},max:${maxCalories}}`;

    // Using axios with params object might encode incorrectly for this specific non-standard API format if not careful.
    // Let's construct the URL or be very specific. 
    // The prompt says: Set the API query parameters to: ?diet_type=vegan&days=1&calories_per_day={min:...,max:...}

    const apiURL = 'http://cosylab.iiitd.edu.in:6969/recipe2-api/mealplan/meal-plan';

    const response = await axios.get(apiURL, {
      headers: {
        'Authorization': `Bearer ${process.env.RECIPEDB_KEY}`
      },
      params: {
        diet_type: 'vegan',
        days: 1,
        calories_per_day: caloriesParam
      }
    });

    // Extract Day 1 Data
    const mealPlan = response.data?.data?.meal_plan?.["Day 1"];

    if (!mealPlan) {
      return res.status(404).json({ success: false, error: 'No meal plan generated from external API' });
    }

    // Inject mock macros if missing (RecipeDB sometimes omits them)
    Object.keys(mealPlan).forEach(mealType => {
      const meal = mealPlan[mealType];
      if (!meal.nutrients) meal.nutrients = {};
      // Prompt requirement: "If RecipeDB omits Protein/Carbs, inject mock string values"
      // We'll just add them to the meal object directly or strictly follow prompt to be safe.
      // Prompt says: "inject mock string values (e.g., "15g") into each meal object"
      if (!meal.protein) meal.protein = "25g";
      if (!meal.carbs) meal.carbs = "45g";
      if (!meal.fat) meal.fat = "15g";
    });

    res.json({ success: true, data: mealPlan });

  } catch (error) {
    console.error('Error in /api/generate-meal-plan:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
      return res.status(error.response.status).json({ success: false, error: 'External API Error', details: error.response.data });
    }
    res.status(500).json({ success: false, error: 'Server Error calling RecipeDB' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});