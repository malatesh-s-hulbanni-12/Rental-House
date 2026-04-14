const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true
  },
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
    required: [true, 'Tenant email is required']
  },
  tenantPhone: {
    type: String,
    required: [true, 'Tenant phone is required']
  },
  complaintType: {
    type: String,
    enum: ['plumbing', 'electrical', 'internet', 'pest', 'garbage', 'other'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required']
  },
  urgency: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  preferredTime: {
    type: String,
    default: 'Any time'
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate complaint ID before saving
complaintSchema.pre('save', async function(next) {
  if (!this.complaintId) {
    const Complaint = mongoose.model('Complaint');
    const count = await Complaint.countDocuments();
    this.complaintId = `CMP-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);