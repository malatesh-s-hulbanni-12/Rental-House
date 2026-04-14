const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  houseId: {
    type: String,
    required: [true, 'House ID is required'],
    uppercase: true
  },
  houseTitle: {
    type: String,
    required: [true, 'House title is required']
  },
  tenantName: {
    type: String,
    required: [true, 'Tenant name is required']
  },
  tenantEmail: {
    type: String,
    required: [true, 'Tenant email is required'],
    lowercase: true
  },
  tenantPhone: {
    type: String,
    required: [true, 'Tenant phone is required']
  },
  description: {
    type: String,
    required: [true, 'Maintenance description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate maintenance ID
maintenanceSchema.virtual('maintenanceId').get(function() {
  return `MT-${this._id.toString().slice(-6).toUpperCase()}`;
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);