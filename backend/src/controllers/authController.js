const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_change_in_prod', { expiresIn: '7d' });

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });

  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  res.status(201).json({ token, user });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id);
  res.json({ token, user });
};

const me = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { signup, login, me };
