const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  houseId: {
    type: String,
    required: [true, 'House ID is required'],
    ref: 'Housing'
  },
  houseTitle: {
    type: String,
    required: [true, 'House title is required']
  },
  tenantName: {
    type: String,
    required: [true, 'Tenant name is required'],
    trim: true
  },
  tenantEmail: {
    type: String,
    required: [true, 'Tenant email is required'],
    trim: true,
    lowercase: true
  },
  tenantPhone: {
    type: String,
    required: [true, 'Tenant phone is required'],
    trim: true
  },
  rentAmount: {
    type: Number,
    required: [true, 'Rent amount is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  secretKey: {
    type: String,
    required: [true, 'Secret key is required'],
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Pending'
  },
  agreementStatus: {
    type: String,
    enum: ['Active', 'Expired', 'Terminated', 'Pending'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  advanceAmount: {
  type: Number,
  default: 0
},
}, {
  timestamps: true
});

module.exports = mongoose.model('Rental', rentalSchema);