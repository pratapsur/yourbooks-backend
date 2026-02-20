// MUST BE ON THE VERY FIRST LINE!
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Fallback to * if env is missing
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// This line is super important! It lets the frontend read the files inside the 'uploads' folder
app.use('/uploads', express.static('uploads')); 

// Import and use our new routes
const bookRoutes = require('./routes/bookRoutes');
app.use('/api/books', bookRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/social', require('./routes/socialRoutes'));

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; 

// --- SAFETY CHECK TO PREVENT CRASHES ---
if (!MONGO_URI) {
    console.error("🚨 FATAL ERROR: MONGO_URI is missing or unreadable. Check your .env file!");
    process.exit(1); 
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('☁️ MongoDB Atlas Connected!');
        app.listen(PORT, () => {
            console.log(`🚀 Server blasting off on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log('Database connection error:', err);
    });