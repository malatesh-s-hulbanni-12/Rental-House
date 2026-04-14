const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  getComplaintsByHouseId,
  getComplaintsByTenant,
  updateComplaintStatus,
  getComplaintById
} = require('../controllers/complaintController');

router.post('/', createComplaint);
router.get('/', getAllComplaints);
router.get('/house/:houseId', getComplaintsByHouseId);
router.get('/tenant/:tenantName', getComplaintsByTenant);
router.get('/:id', getComplaintById);
router.put('/:id/status', updateComplaintStatus);

module.exports = router;