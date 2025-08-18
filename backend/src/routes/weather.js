// backend/src/routes/weather.js
import { Router } from "express";
import { getWeather } from "../controllers/weatherController.js";

const router = Router();

// GET /api/weather?region=Kano&country=Nigeria
router.get("/weather", getWeather);

export default router;
