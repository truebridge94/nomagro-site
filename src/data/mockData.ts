import { WeatherData, Prediction, BlogPost } from '../types';

export const mockWeatherData: WeatherData = {
  temperature: 28,
  humidity: 75,
  rainfall: 12.5,
  windSpeed: 8.2,
  pressure: 1013.2,
  condition: 'Partly Cloudy',
  icon: 'cloud-sun'
};

export const mockPredictions: Prediction[] = [
  {
    type: 'flood',
    title: 'Flood Risk Alert',
    description: 'Moderate flood risk expected in the next 7 days due to heavy rainfall predictions.',
    confidence: 78,
    severity: 'medium',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    icon: 'cloud-rain'
  },
  {
    type: 'drought',
    title: 'Drought Monitoring',
    description: 'Current drought conditions are low. Soil moisture levels are adequate.',
    confidence: 85,
    severity: 'low',
    date: new Date(),
    icon: 'sun'
  },
  {
    type: 'crop',
    title: 'Crop Recommendation',
    description: 'Based on current conditions, maize and sorghum are recommended for next season.',
    confidence: 92,
    value: 'Maize, Sorghum',
    date: new Date(),
    icon: 'wheat'
  },
  {
    type: 'pest',
    title: 'Pest Alert',
    description: 'Low risk of fall armyworm infestation. Continue monitoring.',
    confidence: 67,
    severity: 'low',
    date: new Date(),
    icon: 'bug'
  },
  {
    type: 'price',
    title: 'Market Price Forecast',
    description: 'Cocoa prices expected to increase by 15% in the next month.',
    confidence: 81,
    value: '+15%',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    icon: 'trending-up'
  }
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Revolutionizing African Agriculture with AI-Powered Predictions',
    excerpt: 'Discover how machine learning is transforming crop yields and reducing risks for African farmers.',
    content: 'Full article content here...',
    author: 'Dr. Amina Kone',
    date: new Date('2024-12-10'),
    category: 'Technology',
    image: 'https://images.pexels.com/photos/2518861/pexels-photo-2518861.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '2',
    title: 'Climate Change Adaptation: Early Warning Systems for Extreme Weather',
    excerpt: 'How our flood and drought prediction models are helping farmers prepare for climate challenges.',
    content: 'Full article content here...',
    author: 'Prof. Samuel Osei',
    date: new Date('2024-12-08'),
    category: 'Climate',
    image: 'https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '3',
    title: 'Market Intelligence: Maximizing Profit Through Data-Driven Crop Selection',
    excerpt: 'Learn how price prediction tools are helping farmers choose the most profitable crops.',
    content: 'Full article content here...',
    author: 'Sarah Mwangi',
    date: new Date('2024-12-05'),
    category: 'Market Analysis',
    image: 'https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];