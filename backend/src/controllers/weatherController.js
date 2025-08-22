// backend/src/controllers/weatherController.js
const axios = require('axios');  // ✅ require instead of import

/**
 * GET /api/weather?region=Kano&country=Nigeria
 * Responds with:
 * {
 *   current: { temperature, condition, humidity, windSpeed, pressure, rainfall, icon },
 *   forecast: [{ day, temp, icon, condition }...],
 *   location: { region, country }
 * }
 */
const getWeather = async (req, res) => {
  try {
    const { region, country } = req.query;

    if (!region || !country) {
      return res
        .status(400)
        .json({ error: "Missing required query params: region, country" });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "OPENWEATHER_API_KEY is not configured" });
    }

    // 1) Geocode to lat/lon
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      `${region},${country}`
    )}&limit=1&appid=${apiKey}`;

    const geoRes = await axios.get(geoUrl);
    const geo = geoRes.data;

    if (!Array.isArray(geo) || geo.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    const { lat, lon, name: cityName } = geo[0];

    // 2) Current weather
    // ❌ Remove extra spaces in URL
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const currentRes = await axios.get(currentUrl);
    const currentData = currentRes.data;

    // 3) 5-day / 3-hour forecast
    // ❌ Remove extra spaces in URL
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastRes = await axios.get(forecastUrl);
    const forecastData = forecastRes.data;

    // Group forecasts per day (skip “today”)
    const dailyMap = new Map();
    const todayKey = new Date().toDateString();

    for (const item of forecastData.list || []) {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();
      if (dayKey === todayKey) continue;

      const weekday = date.toLocaleDateString("en", { weekday: "short" });

      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, {
          day: weekday,
          temps: [],
          icons: {},
          conditions: {},
        });
      }
      const d = dailyMap.get(dayKey);
      d.temps.push(item.main?.temp);
      const icon = item.weather?.[0]?.icon || "01d";
      const cond = item.weather?.[0]?.description || "clear sky";
      d.icons[icon] = (d.icons[icon] || 0) + 1;
      d.conditions[cond] = (d.conditions[cond] || 0) + 1;
    }

    const forecast = Array.from(dailyMap.values())
      .slice(0, 5)
      .map((d) => {
        const maxTemp = Math.round(Math.max(...d.temps));
        const icon = Object.keys(d.icons).reduce((a, b) =>
          d.icons[a] > d.icons[b] ? a : b
        );
        const condition = Object.keys(d.conditions).reduce((a, b) =>
          d.conditions[a] > d.conditions[b] ? a : b
        );
        return { day: d.day, temp: maxTemp, icon, condition };
      });

    const response = {
      current: {
        temperature: Math.round(currentData.main?.temp),
        condition: currentData.weather?.[0]?.description || "unknown",
        humidity: currentData.main?.humidity ?? 0,
        windSpeed: Math.round(currentData.wind?.speed ?? 0),
        pressure: currentData.main?.pressure ?? 0,
        rainfall: currentData.rain?.["1h"] ?? 0,
        icon: currentData.weather?.[0]?.icon || "01d",
      },
      forecast,
      location: { region: cityName || region, country },
    };

    return res.json(response);
  } catch (err) {
    console.error("Weather controller error:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch weather data" });
  }
};

// ✅ Export using CommonJS
module.exports = { getWeather };