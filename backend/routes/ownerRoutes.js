const express = require('express');
const router = express.Router();
const { getOwner, updateOwner } = require('../controllers/ownerController');

router.get('/', getOwner);
router.put('/', updateOwner);

module.exports = router;