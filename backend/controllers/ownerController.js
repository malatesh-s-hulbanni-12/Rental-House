const Owner = require('../models/Owner');

// @desc    Get owner profile
// @route   GET /api/owner
const getOwner = async (req, res) => {
  try {
    let owner = await Owner.findOne();
    if (!owner) {
      // Create default owner if none exists
      owner = await Owner.create({
        name: 'M S Hulbanni',
        email: 'mshulbanni@housing.com',
        phone: '+91 9876543210',
        address: '123 Luxury Street, City, Country',
        companyName: 'MS Hulbanni Housing Pvt Ltd',
        gstNumber: '22AAAAA0000A1Z',
        bankName: 'State Bank of India',
        accountNumber: '1234567890123456',
        ifscCode: 'SBIN0001234'
      });
    }
    res.status(200).json({
      success: true,
      data: owner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update owner profile
// @route   PUT /api/owner
const updateOwner = async (req, res) => {
  try {
    const owner = await Owner.findOneAndUpdate(
      {},
      { ...req.body, updatedAt: Date.now() },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'Owner profile updated successfully',
      data: owner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getOwner,
  updateOwner
};