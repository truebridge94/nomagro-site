// backend/src/routes/weather.js
const express = require('express');
const { getWeather } = require('../controllers/weatherController');

const router = express.Router();

// GET /api/weather?region=Kano&country=Nigeria
router.get('/weather', getWeather);

module.exports = router;