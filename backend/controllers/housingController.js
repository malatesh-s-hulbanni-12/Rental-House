const Housing = require('../models/Housing');

// @desc    Create new housing
// @route   POST /api/housing
// @access  Public
const createHousing = async (req, res) => {
  try {
    const { houseTitle, houseId, bhkType } = req.body;

    // Check if houseId already exists
    const existingHouse = await Housing.findOne({ houseId });
    if (existingHouse) {
      return res.status(400).json({
        success: false,
        message: 'House ID already exists. Please use a different ID.'
      });
    }

    // Create new housing
    const housing = await Housing.create({
      houseTitle,
      houseId: houseId.toUpperCase(),
      bhkType
    });

    res.status(201).json({
      success: true,
      message: 'House added successfully',
      data: housing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all housing
// @route   GET /api/housing
// @access  Public
const getAllHousing = async (req, res) => {
  try {
    const housing = await Housing.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: housing.length,
      data: housing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single housing by ID
// @route   GET /api/housing/:id
// @access  Public
const getHousingById = async (req, res) => {
  try {
    const housing = await Housing.findById(req.params.id);
    if (!housing) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }
    res.status(200).json({
      success: true,
      data: housing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update housing
// @route   PUT /api/housing/:id
// @access  Public
const updateHousing = async (req, res) => {
  try {
    const housing = await Housing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!housing) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'House updated successfully',
      data: housing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete housing
// @route   DELETE /api/housing/:id
// @access  Public
const deleteHousing = async (req, res) => {
  try {
    const housing = await Housing.findByIdAndDelete(req.params.id);
    if (!housing) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'House deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get housing by status
// @route   GET /api/housing/status/:status
// @access  Public
const getHousingByStatus = async (req, res) => {
  try {
    const housing = await Housing.find({ status: req.params.status });
    res.status(200).json({
      success: true,
      count: housing.length,
      data: housing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createHousing,
  getAllHousing,
  getHousingById,
  updateHousing,
  deleteHousing,
  getHousingByStatus
};