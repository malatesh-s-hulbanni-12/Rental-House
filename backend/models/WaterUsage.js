// backend/models/WaterUsage.js
const mongoose = require('mongoose');

const waterUsageSchema = new mongoose.Schema({
  rentalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    required: true
  },
  tenantName: {
    type: String,
    required: true
  },
  houseId: {
    type: String,
    required: true
  },
  houseTitle: {
    type: String,
    required: true
  },
  tankCapacity: {
    type: Number,
    required: true,
    default: 1000
  },
  fillTime: {
    type: Number,
    required: true,
    default: 35
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  startTimeFormatted: {
    type: String,
    required: true
  },
  endTimeFormatted: {
    type: String,
    required: true
  },
  totalMinutes: {
    type: Number,
    required: true
  },
  purpose: {
    type: String,
    required: true,
    default: 'General'
  },
  location: {
    type: String,
    default: 'Not specified'
  },
  flowRate: {
    type: Number,
    required: true
  },
  totalLiters: {
    type: Number,
    required: true
  },
  fullTanks: {
    type: Number,
    required: true,
    default: 0
  },
  remainingLiters: {
    type: Number,
    required: true,
    default: 0
  },
  partialPercentage: {
    type: Number,
    required: true,
    default: 0
  },
  breakdown: {
    type: [{
      tankNumber: Number,
      startTime: String,
      endTime: String,
      duration: Number,
      liters: Number,
      isFull: Boolean
    }],
    default: []
  },
  usageDate: {
    type: String,
    required: true
  },
  usageTime: {
    type: String,
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

waterUsageSchema.index({ rentalId: 1, usageDate: -1 });
waterUsageSchema.index({ houseId: 1, usageDate: -1 });
waterUsageSchema.index({ tenantName: 1, usageDate: -1 });

const WaterUsage = mongoose.model('WaterUsage', waterUsageSchema);

module.exports = WaterUsage;