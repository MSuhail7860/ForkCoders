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
    const tdee = Math.round(bmr * parseFloat(activity));

    // Save or Update User
    let user = await User.findOne({ email });
    if (user) {
      user.name = name;
      user.metrics = { weight, height, age, gender, activity };
      user.targets = { dailyCalories: tdee };
      await user.save();
    } else {
      user = new User({
        name,
        email,
        metrics: { weight, height, age, gender, activity },
        targets: { dailyCalories: tdee }
      });
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: {
        dailyCalories: tdee,
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