const express = require('express');
const router = express.Router();
const {
  createRental,
  getAllRentals,
  getRentalById,
  updatePaymentStatus,
  getRentalsByHouseId,
  renewRental,
  verifyLogin,
  updateRental
} = require('../controllers/rentalController');

router.post('/', createRental);
router.get('/', getAllRentals);
router.get('/house/:houseId', getRentalsByHouseId);
router.get('/:id', getRentalById);
router.put('/:id/payment', updatePaymentStatus);
router.put('/:id/renew', renewRental);
router.post('/verify-login', verifyLogin);
router.put('/:id', updateRental);

module.exports = router;