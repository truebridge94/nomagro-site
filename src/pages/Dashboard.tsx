import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  CloudSun,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Calendar
} from 'lucide-react';
import { mockWeatherData, mockPredictions } from '../data/mockData';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();

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
      'wheat': TrendingUp,
      'bug': AlertTriangle,
      'trending-up': TrendingUp,
      'cloud-sun': CloudSun
    };
    return iconMap[iconName] || CheckCircle;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location.region}, {user.location.country}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Farm Size</p>
                    <p className="font-semibold">{user.farmSize ? `${user.farmSize} ha` : 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Current Weather</h2>
              <p className="text-blue-100">{user.location.region}, {user.location.country}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{mockWeatherData.temperature}°C</div>
              <div className="text-blue-100">{mockWeatherData.condition}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <Droplets className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm opacity-90">Humidity</div>
              <div className="text-lg font-semibold">{mockWeatherData.humidity}%</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <Wind className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm opacity-90">Wind Speed</div>
              <div className="text-lg font-semibold">{mockWeatherData.windSpeed} km/h</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <Gauge className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm opacity-90">Pressure</div>
              <div className="text-lg font-semibold">{mockWeatherData.pressure} hPa</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <Droplets className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm opacity-90">Rainfall</div>
              <div className="text-lg font-semibold">{mockWeatherData.rainfall} mm</div>
            </div>
          </div>
        </div>

        {/* Predictions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Predictions */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Predictions for Your Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockPredictions.map((prediction, index) => {
                const IconComponent = getIcon(prediction.icon);
                
                return (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${getSeverityColor(prediction.severity).replace('text-', 'bg-').replace('bg-', 'bg-').replace('-600', '-100')}`}>
                        <IconComponent className={`h-6 w-6 ${getSeverityColor(prediction.severity).split(' ')[0]}`} />
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Confidence</div>
                        <div className="text-lg font-semibold text-green-600">{prediction.confidence}%</div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{prediction.title}</h3>
                    <p className="text-gray-600 mb-4">{prediction.description}</p>
                    
                    {prediction.value && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="text-sm text-gray-600">Prediction Value</div>
                        <div className="text-lg font-semibold text-gray-900">{prediction.value}</div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
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
            {/* User Profile Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Profile</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Location</div>
                  <div className="font-medium">{user.location.region}, {user.location.country}</div>
                </div>
                {user.farmSize && (
                  <div>
                    <div className="text-sm text-gray-600">Farm Size</div>
                    <div className="font-medium">{user.farmSize} hectares</div>
                  </div>
                )}
                {user.crops && user.crops.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600">Main Crops</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.crops.map((crop, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Predictions Checked</span>
                  </div>
                  <span className="font-semibold">5/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-gray-600">Active Alerts</span>
                  </div>
                  <span className="font-semibold">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Avg Confidence</span>
                  </div>
                  <span className="font-semibold">81%</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="text-gray-900">New crop recommendation available</div>
                    <div className="text-gray-500">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="text-gray-900">Weather data updated</div>
                    <div className="text-gray-500">6 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="text-gray-900">Flood risk assessment completed</div>
                    <div className="text-gray-500">1 day ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}