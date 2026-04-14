const express = require('express');
const router = express.Router();
const {
  createHousing,
  getAllHousing,
  getHousingById,
  updateHousing,
  deleteHousing,
  getHousingByStatus
} = require('../controllers/housingController');

// Routes
router.post('/', createHousing);
router.get('/', getAllHousing);
router.get('/status/:status', getHousingByStatus);
router.get('/:id', getHousingById);
router.put('/:id', updateHousing);
router.delete('/:id', deleteHousing);

module.exports = router;