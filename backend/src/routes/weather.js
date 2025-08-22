// backend/src/routes/weather.js
const { Router } = require('express');
const { getWeather } = require('../controllers/weatherController');

const router = Router();

// GET /api/weather?region=Kano&country=Nigeria
router.get('/weather', getWeather);

module.exports = router;