const Rental = require('../models/Rental');
const Housing = require('../models/Housing');

// @desc    Create new rental agreement
// @route   POST /api/rentals
const createRental = async (req, res) => {
  try {
    const {
      houseId,
      houseTitle,
      tenantName,
      tenantEmail,
      tenantPhone,
      rentAmount,
      advanceAmount,
      startDate,
      endDate,
      secretKey
    } = req.body;

    // Verify house exists and matches
    const house = await Housing.findOne({ houseId: houseId.toUpperCase() });
    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found with this House ID'
      });
    }

    // Verify house title matches
    if (house.houseTitle !== houseTitle) {
      return res.status(400).json({
        success: false,
        message: 'House title does not match the House ID'
      });
    }

    // Check if house is already rented
    if (house.status === 'Rented') {
      return res.status(400).json({
        success: false,
        message: 'This house is already rented'
      });
    }

    // Create rental agreement with advanceAmount and secretKey
    const rental = await Rental.create({
      houseId: houseId.toUpperCase(),
      houseTitle,
      tenantName,
      tenantEmail,
      tenantPhone,
      rentAmount,
      advanceAmount: advanceAmount || 0,  // Add this line
      startDate,
      endDate,
      secretKey,
      paymentStatus: 'Pending',
      agreementStatus: 'Active'
    });

    // Update house status to Rented
    house.status = 'Rented';
    await house.save();

    res.status(201).json({
      success: true,
      message: 'Rental agreement created successfully',
      data: rental
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all rental agreements
// @route   GET /api/rentals
const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get rental by ID
// @route   GET /api/rentals/:id
const getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental agreement not found'
      });
    }
    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/rentals/:id/payment
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental agreement not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Payment status updated',
      data: rental
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get rentals by house ID
// @route   GET /api/rentals/house/:houseId
const getRentalsByHouseId = async (req, res) => {
  try {
    const rentals = await Rental.find({ houseId: req.params.houseId.toUpperCase() });
    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Renew rental agreement
// @route   PUT /api/rentals/:id/renew
const renewRental = async (req, res) => {
  try {
    const { newEndDate, rentAmount } = req.body;
    const rental = await Rental.findById(req.params.id);
    
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental agreement not found'
      });
    }

    // Update rental
    rental.endDate = new Date(newEndDate);
    if (rentAmount && rentAmount !== rental.rentAmount) {
      rental.rentAmount = rentAmount;
    }
    rental.agreementStatus = 'Active';
    rental.updatedAt = Date.now();
    
    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Rental agreement renewed successfully',
      data: rental
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify login with secret key
// @route   POST /api/rentals/verify-login
const verifyLogin = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { houseId, secretKey } = req.body;

    if (!houseId || !secretKey) {
      return res.status(400).json({
        success: false,
        message: 'House ID and Secret Key are required'
      });
    }

    // Find rental agreement with matching houseId and secretKey
    const rental = await Rental.findOne({ 
      houseId: houseId.toUpperCase(), 
      secretKey: secretKey 
    });

    console.log('Found rental:', rental);

    if (!rental) {
      return res.status(401).json({
        success: false,
        message: 'Invalid house ID or secret key'
      });
    }

    // Check if agreement is active
    if (rental.agreementStatus !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Your rental agreement is not active. Please contact administrator.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      rental: rental
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update rental agreement
// @route   PUT /api/rentals/:id
const updateRental = async (req, res) => {
  try {
    const { tenantName, tenantEmail, tenantPhone } = req.body;
    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      { tenantName, tenantEmail, tenantPhone },
      { new: true, runValidators: true }
    );
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental agreement not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: rental
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createRental,
  getAllRentals,
  getRentalById,
  updatePaymentStatus,
  getRentalsByHouseId,
  renewRental,
  verifyLogin,
  updateRental
};