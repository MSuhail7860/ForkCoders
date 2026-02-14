const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  metrics: {
    weight: Number,
    height: Number,
    age: Number,
    gender: String,
    activity: Number,
    goal: String
  },
  targets: {
    bmr: Number,
    tdee: Number,
    dailyCalories: Number,
    macros: {
      protein: Number,
      fats: Number,
      carbs: Number
    },
    bmi: Number
  }
});

module.exports = mongoose.model('User', userSchema);