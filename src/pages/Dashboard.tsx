import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Thermometer, Droplets, Wind, CloudSun, AlertTriangle, CheckCircle, Clock, MapPin
} from 'lucide-react';

const API_KEY = '875ab416117c9b81e0550bfa979133c7'; // Replace with your OpenWeather API key
const LOCATION = 'Kano,NG';     // You can make this dynamic later

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${LOCATION}&appid=${API_KEY}&units=metric`
        );
        setWeatherData(res.data);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading weather data...</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load weather data.</div>;

  const { temp, humidity } = weatherData.main;
  const windSpeed = weatherData.wind.speed;
  const weatherCondition = weatherData.weather[0].description;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl shadow p-4 flex items-center space-x-4">
        <Thermometer className="text-orange-500" />
        <div>
          <div className="text-sm text-gray-500">Temperature</div>
          <div className="text-xl font-bold">{temp}°C</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 flex items-center space-x-4">
        <Droplets className="text-blue-500" />
        <div>
          <div className="text-sm text-gray-500">Humidity</div>
          <div className="text-xl font-bold">{humidity}%</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 flex items-center space-x-4">
        <Wind className="text-teal-600" />
        <div>
          <div className="text-sm text-gray-500">Wind Speed</div>
          <div className="text-xl font-bold">{windSpeed} m/s</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 flex items-center space-x-4">
        <CloudSun className="text-yellow-500" />
        <div>
          <div className="text-sm text-gray-500">Condition</div>
          <div className="text-lg capitalize">{weatherCondition}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
