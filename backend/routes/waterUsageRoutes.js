// backend/routes/waterUsageRoutes.js
const express = require('express');
const router = express.Router();
const {
  createWaterUsage,
  getAllWaterUsage,
  getWaterUsageByTenant,
  getWaterUsageStatsByHouse,
  getWaterUsageById,
  updateWaterUsage,
  deleteWaterUsage,
  getAllWaterUsageSummary
} = require('../controllers/waterUsageController');

// @route   GET /api/water-usage/summary/all
// @desc    Get summary statistics for all houses
// @access  Public
router.get('/summary/all', getAllWaterUsageSummary);

// @route   GET /api/water-usage/stats/house/:houseId
// @desc    Get water usage statistics by house
// @access  Public
router.get('/stats/house/:houseId', getWaterUsageStatsByHouse);

// @route   GET /api/water-usage/tenant/:rentalId
// @desc    Get water usage records for a specific tenant
// @access  Public
router.get('/tenant/:rentalId', getWaterUsageByTenant);

// @route   POST /api/water-usage
// @desc    Create new water usage record
// @access  Public
router.post('/', createWaterUsage);

// @route   GET /api/water-usage
// @desc    Get all water usage records with filters
// @access  Public
router.get('/', getAllWaterUsage);

// @route   GET /api/water-usage/:id
// @desc    Get single water usage record
// @access  Public
router.get('/:id', getWaterUsageById);

// @route   PUT /api/water-usage/:id
// @desc    Update water usage record
// @access  Public
router.put('/:id', updateWaterUsage);

// @route   DELETE /api/water-usage/:id
// @desc    Delete water usage record
// @access  Public
router.delete('/:id', deleteWaterUsage);

module.exports = router;