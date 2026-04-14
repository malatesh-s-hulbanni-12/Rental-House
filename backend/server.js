const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware - CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://rental-house-renter.vercel.app',
  'https://rental-house-admin-woad.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/housing', require('./routes/housingRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to MS Hulbanni Housing API',
    status: 'active',
    endpoints: [
      '/api/housing',
      '/api/rentals',
      '/api/complaints',
      '/api/owner',
      '/api/maintenance'
    ]
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

// For local development only
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel (required for serverless deployment)
module.exports = app;