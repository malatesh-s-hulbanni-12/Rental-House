const Complaint = require('../models/Complaint');

// @desc    Create new complaint
// @route   POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    console.log('Received complaint data:', req.body); // Debug log
    
    const {
      houseId,
      houseTitle,
      tenantName,
      tenantEmail,
      tenantPhone,
      complaintType,
      title,
      description,
      urgency,
      preferredTime
    } = req.body;

    // Validate required fields
    if (!houseId || !tenantName || !complaintType || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const complaint = await Complaint.create({
      houseId: houseId.toUpperCase(),
      houseTitle,
      tenantName,
      tenantEmail,
      tenantPhone,
      complaintType,
      title,
      description,
      urgency: urgency || 'Medium',
      preferredTime: preferredTime || 'Any time',
      status: 'Pending'
    });

    console.log('Complaint created:', complaint); // Debug log

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get complaints by house ID
// @route   GET /api/complaints/house/:houseId
const getComplaintsByHouseId = async (req, res) => {
  try {
    const complaints = await Complaint.find({ houseId: req.params.houseId.toUpperCase() });
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Error fetching complaints by house:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get complaints by tenant
// @route   GET /api/complaints/tenant/:tenantName
const getComplaintsByTenant = async (req, res) => {
  try {
    const complaints = await Complaint.find({ tenantName: req.params.tenantName });
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Error fetching complaints by tenant:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const updateData = { status };
    if (adminRemarks) updateData.adminRemarks = adminRemarks;
    if (status === 'Resolved') updateData.resolvedAt = Date.now();

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint status updated',
      data: complaint
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaintsByHouseId,
  getComplaintsByTenant,
  updateComplaintStatus,
  getComplaintById
};