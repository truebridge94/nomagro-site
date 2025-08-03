export interface User {
  id: string;
  name: string;
  email: string;
  location: {
    country: string;
    region: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  farmSize?: number;
  crops?: string[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  pressure: number;
  condition: string;
  icon: string;
}

export interface Prediction {
  type: 'flood' | 'drought' | 'pest' | 'crop' | 'price';
  title: string;
  description: string;
  confidence: number;
  severity?: 'low' | 'medium' | 'high';
  value?: string | number;
  date: Date;
  icon: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: Date;
  category: string;
  image: string;
}