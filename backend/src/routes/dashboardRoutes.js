const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth); // Protect dashboard routes

router.get('/summary', dashboardController.getSummary);

module.exports = router;
