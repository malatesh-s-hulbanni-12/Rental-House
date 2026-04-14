const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware - CORS must be first
// Update with your hosted URLs
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://rental-house-renter.vercel.app',      // Your hosted frontend URL
  'https://rental-house-admin-zeta.vercel.app',          // Your hosted admin URL
  'https://your-main-domain.com'            // Your main domain
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
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
// Add this with your other routes
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MS Hulbanni Housing API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;