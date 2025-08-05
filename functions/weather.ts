// functions/weather.ts
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import fetch from 'node-fetch';

// 🔐 Set your API key in Netlify environment variables
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

if (!OPENWEATHER_API_KEY) {
  console.warn('⚠️ OPENWEATHER_API_KEY is not set. Some features may not work.');
}

// === Types ===
interface GeoData {
  name: string;
  lat: number;
  lon: number;
  country: string;
}

interface WeatherResponse {
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    rainfall: number;
    icon: string;
  };
  forecast: {
    day: string;
    temp: number;
    icon: string;
    condition: string;
  }[];
  location: {
    region: string;
    country: string;
  };
}

// === Main Handler ===
const handler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<any> => {
  try {
    const { region, country } = event.queryStringParameters || {};

    if (!region || !country) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing region or country in query parameters' }),
      };
    }

    if (!OPENWEATHER_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Weather API key is not configured' }),
      };
    }

    // Step 1: Geocode location → lat, lon
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      `${region},${country}`
    )}&limit=1&appid=${OPENWEATHER_API_KEY}`;

    const geoRes = await fetch(geoUrl);
    const geoData: GeoData[] = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Location not found' }),
      };
    }

    const { lat, lon, name: cityName } = geoData[0];

    // Step 2: Fetch current weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const currentRes = await fetch(currentUrl);
    const currentData = await currentRes.json();

    // Step 3: Fetch 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();

    // Process 5-day forecast (skip today)
    const dailyMap = new Map<string, any>();
    const today = new Date().toDateString();

    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const day = date.toDateString();
      if (day === today) return;

      const weekday = date.toLocaleDateString('en', { weekday: 'short' });

      if (!dailyMap.has(day)) {
        dailyMap.set(day, {
          day: weekday,
          temps: [] as number[],
          icons: {} as Record<string, number>,
          conditions: {} as Record<string, number>,
        });
      }

      const dayData = dailyMap.get(day);
      dayData.temps.push(item.main.temp);
      dayData.icons[item.weather[0].icon] = (dayData.icons[item.weather[0].icon] || 0) + 1;
      dayData.conditions[item.weather[0].description] =
        (dayData.conditions[item.weather[0].description] || 0) + 1;
    });

    const forecast = Array.from(dailyMap.values())
      .slice(0, 5)
      .map((day: any) => {
        const maxTemp = Math.round(Math.max(...day.temps));
        const icon = Object.keys(day.icons).reduce((a, b) => (day.icons[a] > day.icons[b] ? a : b));
        const condition = Object.keys(day.conditions).reduce((a, b) =>
          day.conditions[a] > day.conditions[b] ? a : b
        );

        return { day: day.day, temp: maxTemp, icon, condition };
      });

    // Build final response
    const response: WeatherResponse = {
      current: {
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed),
        pressure: currentData.main.pressure,
        rainfall: currentData.rain ? currentData.rain['1h'] || 0 : 0,
        icon: currentData.weather[0].icon,
      },
      forecast,
      location: { region: cityName, country },
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.error('Server error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch weather data' }),
    };
  }
};

export { handler };