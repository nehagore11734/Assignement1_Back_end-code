const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { email, password, startDate, duration } = req.body;

    // Calculate end date
    const start = new Date(startDate);
    const endDate = new Date(start);
    if (duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      subscriptionStartDate: start,
      subscriptionDuration: duration,
      subscriptionEndDate: endDate
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ email: user.email, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentDate = new Date();
    const status = currentDate <= user.subscriptionEndDate ? 'Active' : 'Expired';
    res.json({ status });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;