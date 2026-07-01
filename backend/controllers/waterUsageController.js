// backend/controllers/waterUsageController.js
const WaterUsage = require('../models/WaterUsage');
const Rental = require('../models/Rental');
const mongoose = require('mongoose');

// @desc    Create new water usage record
// @route   POST /api/water-usage
// @access  Public
exports.createWaterUsage = async (req, res) => {
  try {
    const {
      rentalId,
      tenantName,
      houseId,
      houseTitle,
      tankCapacity,
      fillTime,
      startTime,
      endTime,
      startTimeFormatted,
      endTimeFormatted,
      totalMinutes,
      purpose,
      location,
      flowRate,
      totalLiters,
      fullTanks,
      remainingLiters,
      partialPercentage,
      breakdown,
      usageDate,
      usageTime
    } = req.body;

    // Validate required fields
    if (!rentalId || !tenantName || !houseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rentalId, tenantName, and houseId'
      });
    }

    // Verify that the rental exists
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Create water usage record
    const waterUsage = await WaterUsage.create({
      rentalId,
      tenantName,
      houseId,
      houseTitle: houseTitle || rental.houseTitle || 'Unknown',
      tankCapacity: tankCapacity || 1000,
      fillTime: fillTime || 35,
      startTime,
      endTime,
      startTimeFormatted,
      endTimeFormatted,
      totalMinutes,
      purpose: purpose || 'General',
      location: location || 'Not specified',
      flowRate,
      totalLiters,
      fullTanks: fullTanks || 0,
      remainingLiters: remainingLiters || 0,
      partialPercentage: partialPercentage || 0,
      breakdown: breakdown || [],
      usageDate,
      usageTime,
      createdBy: rental.tenantName || 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Water usage record created successfully',
      data: waterUsage
    });

  } catch (error) {
    console.error('Error creating water usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating water usage record',
      error: error.message
    });
  }
};

// @desc    Get all water usage records
// @route   GET /api/water-usage
// @access  Public
exports.getAllWaterUsage = async (req, res) => {
  try {
    const { 
      rentalId, 
      houseId, 
      tenantName,
      startDate,
      endDate,
      limit = 50,
      page = 1 
    } = req.query;

    // Build filter object
    const filter = {};
    if (rentalId) filter.rentalId = rentalId;
    if (houseId) filter.houseId = houseId;
    if (tenantName) filter.tenantName = { $regex: tenantName, $options: 'i' };
    if (startDate && endDate) {
      filter.usageDate = { $gte: startDate, $lte: endDate };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const waterUsages = await WaterUsage.find(filter)
      .sort({ usageDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('rentalId', 'tenantName houseId houseTitle bhkType');

    const total = await WaterUsage.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: waterUsages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching water usage records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching water usage records',
      error: error.message
    });
  }
};

// @desc    Get water usage records for a specific tenant/house
// @route   GET /api/water-usage/tenant/:rentalId
// @access  Public
exports.getWaterUsageByTenant = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { limit = 30, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const waterUsages = await WaterUsage.find({ rentalId })
      .sort({ usageDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WaterUsage.countDocuments({ rentalId });

    // Calculate statistics
    const stats = await WaterUsage.aggregate([
      { $match: { rentalId: new mongoose.Types.ObjectId(rentalId) } },
      {
        $group: {
          _id: null,
          totalLiters: { $sum: '$totalLiters' },
          totalMinutes: { $sum: '$totalMinutes' },
          averageLiters: { $avg: '$totalLiters' },
          totalRecords: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: waterUsages,
      statistics: stats[0] || {
        totalLiters: 0,
        totalMinutes: 0,
        averageLiters: 0,
        totalRecords: 0
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching tenant water usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tenant water usage records',
      error: error.message
    });
  }
};

// @desc    Get water usage statistics by house
// @route   GET /api/water-usage/stats/house/:houseId
// @access  Public
exports.getWaterUsageStatsByHouse = async (req, res) => {
  try {
    const { houseId } = req.params;
    const { startDate, endDate } = req.query;

    const filter = { houseId };
    if (startDate && endDate) {
      filter.usageDate = { $gte: startDate, $lte: endDate };
    }

    const stats = await WaterUsage.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$houseId',
          totalLiters: { $sum: '$totalLiters' },
          totalMinutes: { $sum: '$totalMinutes' },
          averageLiters: { $avg: '$totalLiters' },
          totalRecords: { $sum: 1 },
          totalFullTanks: { $sum: '$fullTanks' }
        }
      }
    ]);

    // Get daily usage
    const dailyUsage = await WaterUsage.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$usageDate',
          totalLiters: { $sum: '$totalLiters' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.status(200).json({
      success: true,
      statistics: stats[0] || {
        totalLiters: 0,
        totalMinutes: 0,
        averageLiters: 0,
        totalRecords: 0,
        totalFullTanks: 0
      },
      dailyUsage
    });

  } catch (error) {
    console.error('Error fetching house water usage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching house water usage statistics',
      error: error.message
    });
  }
};

// @desc    Get a single water usage record
// @route   GET /api/water-usage/:id
// @access  Public
exports.getWaterUsageById = async (req, res) => {
  try {
    const waterUsage = await WaterUsage.findById(req.params.id)
      .populate('rentalId', 'tenantName houseId houseTitle bhkType');

    if (!waterUsage) {
      return res.status(404).json({
        success: false,
        message: 'Water usage record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: waterUsage
    });

  } catch (error) {
    console.error('Error fetching water usage record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching water usage record',
      error: error.message
    });
  }
};

// @desc    Update a water usage record
// @route   PUT /api/water-usage/:id
// @access  Public
exports.updateWaterUsage = async (req, res) => {
  try {
    const waterUsage = await WaterUsage.findById(req.params.id);

    if (!waterUsage) {
      return res.status(404).json({
        success: false,
        message: 'Water usage record not found'
      });
    }

    const updatedWaterUsage = await WaterUsage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Water usage record updated successfully',
      data: updatedWaterUsage
    });

  } catch (error) {
    console.error('Error updating water usage record:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating water usage record',
      error: error.message
    });
  }
};

// @desc    Delete a water usage record
// @route   DELETE /api/water-usage/:id
// @access  Public
exports.deleteWaterUsage = async (req, res) => {
  try {
    const waterUsage = await WaterUsage.findById(req.params.id);

    if (!waterUsage) {
      return res.status(404).json({
        success: false,
        message: 'Water usage record not found'
      });
    }

    await waterUsage.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Water usage record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting water usage record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting water usage record',
      error: error.message
    });
  }
};

// @desc    Get summary statistics for all houses
// @route   GET /api/water-usage/summary/all
// @access  Public
exports.getAllWaterUsageSummary = async (req, res) => {
  try {
    const summary = await WaterUsage.aggregate([
      {
        $group: {
          _id: '$houseId',
          houseTitle: { $first: '$houseTitle' },
          totalLiters: { $sum: '$totalLiters' },
          totalMinutes: { $sum: '$totalMinutes' },
          totalRecords: { $sum: 1 },
          totalFullTanks: { $sum: '$fullTanks' },
          averageLiters: { $avg: '$totalLiters' }
        }
      },
      { $sort: { totalLiters: -1 } }
    ]);

    const overallStats = await WaterUsage.aggregate([
      {
        $group: {
          _id: null,
          totalLiters: { $sum: '$totalLiters' },
          totalMinutes: { $sum: '$totalMinutes' },
          totalRecords: { $sum: 1 },
          averageLiters: { $avg: '$totalLiters' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: summary,
        overall: overallStats[0] || {
          totalLiters: 0,
          totalMinutes: 0,
          totalRecords: 0,
          averageLiters: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching water usage summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching water usage summary',
      error: error.message
    });
  }
};