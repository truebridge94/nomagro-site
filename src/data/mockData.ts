import { WeatherData, Prediction, BlogPost, Product } from '../types';

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

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Cocoa Beans',
    description: 'High-quality organic cocoa beans from Ghana. Perfect for chocolate production with rich flavor profile.',
    price: 2500,
    unit: 'per ton',
    category: 'Cash Crops',
    images: [
      'https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4226801/pexels-photo-4226801.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    sellerId: '1',
    sellerName: 'Kwame Asante',
    sellerContact: {
      phone: '+233 24 123 4567',
      email: 'kwame@example.com',
      whatsapp: '+233 24 123 4567'
    },
    location: {
      country: 'Ghana',
      region: 'Ashanti Region',
      coordinates: { lat: 6.6885, lng: -1.6244 }
    },
    quantity: 50,
    harvestDate: new Date('2024-11-15'),
    isOrganic: true,
    status: 'available',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '2',
    name: 'Fresh Cassava Tubers',
    description: 'Freshly harvested cassava tubers, perfect for processing into flour or direct consumption.',
    price: 800,
    unit: 'per ton',
    category: 'Root Crops',
    images: [
      'https://images.pexels.com/photos/7129165/pexels-photo-7129165.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    sellerId: '2',
    sellerName: 'Amina Kone',
    sellerContact: {
      phone: '+225 07 89 12 34',
      email: 'amina@example.com'
    },
    location: {
      country: 'Côte d\'Ivoire',
      region: 'Bouaké',
      coordinates: { lat: 7.6944, lng: -5.0300 }
    },
    quantity: 25,
    harvestDate: new Date('2024-12-05'),
    isOrganic: false,
    status: 'available',
    createdAt: new Date('2024-12-08'),
    updatedAt: new Date('2024-12-08')
  },
  {
    id: '3',
    name: 'Yellow Maize',
    description: 'High-quality yellow maize suitable for animal feed and human consumption. Well-dried and stored.',
    price: 1200,
    unit: 'per ton',
    category: 'Cereals',
    images: [
      'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    sellerId: '3',
    sellerName: 'Samuel Osei',
    sellerContact: {
      phone: '+233 20 456 7890',
      email: 'samuel@example.com',
      whatsapp: '+233 20 456 7890'
    },
    location: {
      country: 'Ghana',
      region: 'Northern Region',
      coordinates: { lat: 9.4034, lng: -0.8424 }
    },
    quantity: 100,
    harvestDate: new Date('2024-10-20'),
    isOrganic: false,
    status: 'available',
    createdAt: new Date('2024-11-25'),
    updatedAt: new Date('2024-11-25')
  },
  {
    id: '4',
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes, perfect for local markets and restaurants. Pesticide-free cultivation.',
    price: 150,
    unit: 'per crate (25kg)',
    category: 'Vegetables',
    images: [
      'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    sellerId: '4',
    sellerName: 'Sarah Mwangi',
    sellerContact: {
      phone: '+254 712 345 678',
      email: 'sarah@example.com'
    },
    location: {
      country: 'Kenya',
      region: 'Central Kenya',
      coordinates: { lat: -0.0236, lng: 37.9062 }
    },
    quantity: 200,
    harvestDate: new Date('2024-12-10'),
    isOrganic: true,
    status: 'available',
    createdAt: new Date('2024-12-11'),
    updatedAt: new Date('2024-12-11')
  },
  {
    id: '5',
    name: 'Rice Paddy',
    description: 'Premium quality rice paddy from irrigated fields. High yield variety with excellent grain quality.',
    price: 1800,
    unit: 'per ton',
    category: 'Cereals',
    images: [
      'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    sellerId: '5',
    sellerName: 'Ibrahim Diallo',
    sellerContact: {
      phone: '+221 77 123 45 67',
      email: 'ibrahim@example.com',
      whatsapp: '+221 77 123 45 67'
    },
    location: {
      country: 'Senegal',
      region: 'Saint-Louis',
      coordinates: { lat: 16.0469, lng: -16.4975 }
    },
    quantity: 75,
    harvestDate: new Date('2024-11-30'),
    isOrganic: false,
    status: 'available',
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05')
  },
  {
    id: '6',
    name: 'Sweet Potatoes',
    description: 'Orange-fleshed sweet potatoes rich in vitamin A. Perfect for both local consumption and export.',
    price: 600,
    unit: 'per ton',
    category: 'Root Crops',
    images: [
      'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    sellerId: '6',
    sellerName: 'Grace Nakamura',
    sellerContact: {
      phone: '+256 701 234 567',
      email: 'grace@example.com'
    },
    location: {
      country: 'Uganda',
      region: 'Central Uganda',
      coordinates: { lat: 0.3476, lng: 32.5825 }
    },
    quantity: 40,
    harvestDate: new Date('2024-12-01'),
    isOrganic: true,
    status: 'available',
    createdAt: new Date('2024-12-03'),
    updatedAt: new Date('2024-12-03')
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
