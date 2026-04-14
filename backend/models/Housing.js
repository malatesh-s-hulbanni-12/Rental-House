const mongoose = require('mongoose');

const housingSchema = new mongoose.Schema({
  houseTitle: {
    type: String,
    required: [true, 'House title is required'],
    trim: true,
    maxlength: [100, 'House title cannot exceed 100 characters']
  },
  houseId: {
    type: String,
    required: [true, 'House ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  bhkType: {
    type: String,
    required: [true, 'BHK type is required'],
    enum: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK']
  },
  status: {
    type: String,
    enum: ['Available', 'Rented', 'Pending'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Housing', housingSchema);