require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB using URI from .env
const url = process.env.MONGODB_URI;

mongoose.connect(url)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

const api = require('./api.js');
api.setApp(app, mongoose);

// Handle CORS properly
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));
