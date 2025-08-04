import React, { useEffect, useState } from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  CloudSun,
  User,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockPredictions } from '../data/mockData';
import { format } from 'date-fns';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export default function Dashboard() {
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    if (user?.location) {
      const fetchWeather = async () => {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${user.location.region}&appid=${API_KEY}&units=metric`
          );
          const data = await response.json();
          setWeather({
            temperature: data.main.temp,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed,
            condition: data.weather[0].description,
            rainfall: data.rain ? data.rain['1h'] || 0 : 0,
          });
        } catch (err) {
          console.error('Error fetching weather:', err);
        }
      };
      fetchWeather();
    }
  }, [user]);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      'cloud-rain': Droplets,
      'sun': CloudSun,
      'trending-up': TrendingUp,
      'alert': AlertTriangle,
    };
    return iconMap[iconName] || CheckCircle;
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <div className="flex space-x-4 text-gray-600 mt-2">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{user.location.region}, {user.location.country}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Weather */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-8">
          {weather ? (
            <>
              <div className="flex justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Current Weather</h2>
                  <p className="text-blue-100">{user.location.region}, {user.location.country}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{weather.temperature}°C</div>
                  <div className="text-blue-100 capitalize">{weather.condition}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <WeatherBox icon={<Droplets />} label="Humidity" value={`${weather.humidity}%`} />
                <WeatherBox icon={<Wind />} label="Wind Speed" value={`${weather.windSpeed} m/s`} />
                <WeatherBox icon={<Gauge />} label="Pressure" value={`${weather.pressure} hPa`} />
                <WeatherBox icon={<Droplets />} label="Rainfall" value={`${weather.rainfall} mm`} />
              </div>
            </>
          ) : (
            <div className="text-white">Loading weather data...</div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Predictions for Your Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockPredictions.map((prediction, index) => {
                const Icon = getIcon(prediction.icon);
                return (
                  <div key={index} className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between mb-4">
                      <div className={`p-3 rounded-lg ${getSeverityColor(prediction.severity)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Confidence</p>
                        <p className="font-bold text-green-600">{prediction.confidence}%</p>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{prediction.title}</h3>
                    <p className="text-gray-600 mb-4">{prediction.description}</p>
                    {prediction.value && (
                      <div className="bg-gray-50 rounded p-3 mb-4">
                        <p className="text-sm text-gray-500">Value</p>
                        <p className="font-semibold">{prediction.value}</p>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{format(prediction.date, 'MMM dd, yyyy')}</span>
                      </div>
                      {prediction.severity && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(prediction.severity)}`}>
                          {prediction.severity.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Profile</h3>
              <p><strong>Location:</strong> {user.location.region}, {user.location.country}</p>
              {user.farmSize && <p><strong>Farm Size:</strong> {user.farmSize} ha</p>}
              {user.crops?.length > 0 && (
                <p><strong>Main Crops:</strong> {user.crops.join(', ')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherBox({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
      <div className="flex justify-center mb-2 text-white">{icon}</div>
      <div className="text-sm opacity-90">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
