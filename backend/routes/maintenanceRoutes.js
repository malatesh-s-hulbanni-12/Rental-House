const express = require('express');
const router = express.Router();
const {
  createMaintenance,
  getAllMaintenance,
  getMaintenanceByHouse,
  getMaintenanceByTenant,
  updateMaintenanceStatus,
  getMaintenanceById
} = require('../controllers/maintenanceController');

router.post('/', createMaintenance);
router.get('/', getAllMaintenance);
router.get('/house/:houseId', getMaintenanceByHouse);
router.get('/tenant/:tenantName', getMaintenanceByTenant);
router.get('/:id', getMaintenanceById);
router.put('/:id/status', updateMaintenanceStatus);

module.exports = router;