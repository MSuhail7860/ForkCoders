const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  metrics: {
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    activity: { type: Number, required: true }
  },
  targets: {
    dailyCalories: { type: Number }
  }
});

module.exports = mongoose.model('User', UserSchema);