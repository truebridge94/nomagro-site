import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  CloudRain, 
  Sun, 
  TrendingUp, 
  Wheat, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Users,
  BarChart3
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  AI-Powered
                  <span className="text-green-600 block">Agriculture</span>
                  for Africa
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Revolutionizing African farming with machine learning predictions for floods, droughts, 
                  crop recommendations, and market intelligence to maximize yields and profits.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center group"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/2518861/pexels-photo-2518861.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Smart Agriculture"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Yield Increase</p>
                    <p className="text-2xl font-bold text-green-600">+67%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Comprehensive Agricultural Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides everything you need to make data-driven farming decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: CloudRain,
                title: "Flood & Drought Prediction",
                description: "Advanced ML models using satellite imagery and weather data to predict extreme weather events with 85% accuracy."
              },
              {
                icon: Wheat,
                title: "Crop Recommendations",
                description: "Location-based crop suggestions using soil data, climate patterns, and historical yield information."
              },
              {
                icon: Shield,
                title: "Pest & Disease Detection",
                description: "Early warning systems using NDVI analysis and field reports to prevent crop damage."
              },
              {
                icon: TrendingUp,
                title: "Price Prediction",
                description: "Market intelligence tools using historical data, CPI, and macroeconomic indicators."
              },
              {
                icon: Sun,
                title: "Weather Risk Assessment",
                description: "Comprehensive climate risk analysis to help farmers plan and adapt their strategies."
              },
              {
                icon: BarChart3,
                title: "Market Intelligence",
                description: "Demand forecasting tools to help choose high-demand, profitable crops for your region."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow group">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: "10,000+", label: "Farmers Served", icon: Users },
              { number: "85%", label: "Prediction Accuracy", icon: Brain },
              { number: "35%", label: "Average Yield Increase", icon: TrendingUp }
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-12 w-12" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-xl opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="African farmer with technology"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Why Choose Nomagro?
                </h2>
                <p className="text-xl text-gray-600">
                  Built specifically for African agriculture, our platform understands local challenges and opportunities.
                </p>
              </div>
              <div className="space-y-6">
                {[
                  "Reduce crop losses by up to 40% with early warning systems",
                  "Increase profits with accurate market price predictions",
                  "Optimize resource usage with weather-based recommendations",
                  "Access localized insights for your specific region",
                  "Make data-driven decisions with AI-powered analytics"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 text-lg">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of African farmers who are already using AI to increase their yields and profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center justify-center group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}