// backend/src/routes/weather.js
const express = require('express');
const weatherController = require('../controllers/weatherController');

const router = express.Router();

// GET /api/weather?region=Kano&country=Nigeria
router.get('/weather', weatherController.getWeather);

module.exports = router;