const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscriptionStartDate: { type: Date, required: true },
  subscriptionDuration: { type: String, required: true, enum: ['monthly', 'yearly'] },
  subscriptionEndDate: { type: Date, required: true }
});

module.exports = mongoose.model('User', userSchema);