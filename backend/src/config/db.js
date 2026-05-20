const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};

module.exports = connectDB;
