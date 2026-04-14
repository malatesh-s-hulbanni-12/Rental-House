const Maintenance = require('../models/Maintenance');

// @desc    Create maintenance request
// @route   POST /api/maintenance
const createMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Maintenance request submitted successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all maintenance requests
// @route   GET /api/maintenance
const getAllMaintenance = async (req, res) => {
  try {
    const requests = await Maintenance.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get maintenance by house ID
// @route   GET /api/maintenance/house/:houseId
const getMaintenanceByHouse = async (req, res) => {
  try {
    const requests = await Maintenance.find({ houseId: req.params.houseId.toUpperCase() });
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching maintenance by house:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get maintenance by tenant
// @route   GET /api/maintenance/tenant/:tenantName
const getMaintenanceByTenant = async (req, res) => {
  try {
    const requests = await Maintenance.find({ tenantName: req.params.tenantName });
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching maintenance by tenant:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update maintenance status
// @route   PUT /api/maintenance/:id/status
const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const updateData = { 
      status, 
      updatedAt: Date.now() 
    };
    
    if (adminRemarks) updateData.adminRemarks = adminRemarks;
    if (status === 'Completed') updateData.completedAt = Date.now();

    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: request
    });
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get maintenance by ID
// @route   GET /api/maintenance/:id
const getMaintenanceById = async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createMaintenance,
  getAllMaintenance,
  getMaintenanceByHouse,
  getMaintenanceByTenant,
  updateMaintenanceStatus,
  getMaintenanceById
};