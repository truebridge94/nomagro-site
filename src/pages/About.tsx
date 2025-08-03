import React from 'react';
import { Target, Eye, Users, Award, MapPin, TrendingUp } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              About <span className="text-green-600">Nomagro</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to revolutionize African agriculture through cutting-edge AI technology, 
              empowering farmers with the insights they need to thrive in an changing climate.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                To democratize access to advanced agricultural intelligence across Africa, enabling smallholder 
                farmers and large-scale operations alike to make data-driven decisions that increase productivity, 
                reduce risks, and maximize profitability while promoting sustainable farming practices.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">10,000+</div>
                  <div className="text-gray-600">Farmers Empowered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">15+</div>
                  <div className="text-gray-600">African Countries</div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                To become Africa's leading agricultural technology platform, creating a future where every farmer 
                has access to predictive intelligence that enables them to adapt to climate change, optimize their 
                resources, and contribute to food security across the continent.
              </p>
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-xl text-white">
                <h3 className="text-xl font-semibold mb-2">Our Impact Goal</h3>
                <p>By 2030, we aim to serve 1 million African farmers and increase agricultural productivity by 50% across our network.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              What We Do
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines multiple AI technologies to provide actionable insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900">Weather & Climate Risk Systems</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg mt-1">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Flood Prediction Models</h4>
                    <p className="text-gray-600">Using satellite imagery and weather data to predict flooding events with 85% accuracy</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 p-2 rounded-lg mt-1">
                    <MapPin className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Drought Detection Systems</h4>
                    <p className="text-gray-600">Early warning systems that help farmers prepare for dry conditions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 p-2 rounded-lg mt-1">
                    <MapPin className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Pest & Disease Prediction</h4>
                    <p className="text-gray-600">ML models using NDVI and field reports to prevent crop damage</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900">Market Intelligence & Predictions</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg mt-1">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Crop Price Prediction</h4>
                    <p className="text-gray-600">Historical data and macroeconomic analysis for price forecasting</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-2 rounded-lg mt-1">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Market Demand Forecasting</h4>
                    <p className="text-gray-600">Tools to help farmers choose high-demand, profitable crops</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 p-2 rounded-lg mt-1">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Crop Recommendations</h4>
                    <p className="text-gray-600">Location-based suggestions for optimal crop selection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Led by agricultural experts, data scientists, and AI researchers passionate about African agriculture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Abubakar Sabiu",
                role: "CEO & Co-Founder",
                background: "Data Scientist, Machine Learning and Artificial Intelligence Expert",
                image: "https://ibb.co/201qYBWV?auto=compress&cs=tinysrgb&w=400"
              },
              {
                name: "Muhammad Buhari Sabiu",
                role: "CTO & Co-Founder",
                background: "B.Eng Agricultural Engineering, Msc. Environmental Management and Control",
                image: "https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=400"
              },
              {
                name: "Mrs. Maryam Abdurrahman",
                role: "Head of Research",
                background: "Agricultural Economics, Climate Adaptation",
                image: "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400"
              }
            ].map((member, index) => (
              <div key={index} className="text-center space-y-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-green-600 font-medium">{member.role}</p>
                  <p className="text-gray-600 text-sm mt-2">{member.background}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Our Core Values
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Farmer-Centric",
                description: "Every decision we make puts African farmers first"
              },
              {
                icon: Award,
                title: "Innovation",
                description: "Pushing the boundaries of agricultural technology"
              },
              {
                icon: Target,
                title: "Accuracy",
                description: "Delivering reliable, precise predictions farmers can trust"
              },
              {
                icon: Eye,
                title: "Transparency",
                description: "Open about our methods and committed to honest communication"
              }
            ].map((value, index) => (
              <div key={index} className="text-center text-white space-y-4">
                <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">{value.title}</h3>
                <p className="text-green-100">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}