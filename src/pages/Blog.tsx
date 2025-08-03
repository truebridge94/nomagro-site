import React from 'react';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { mockBlogPosts } from '../data/mockData';

export default function Blog() {
  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Nomagro <span className="text-green-600">Insights</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Stay informed with the latest developments in agricultural technology, 
              market trends, and farming innovations across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="h-64 lg:h-auto">
                <img
                  src={mockBlogPosts[0].image}
                  alt={mockBlogPosts[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(mockBlogPosts[0].date, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{mockBlogPosts[0].author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tag className="h-4 w-4" />
                      <span>{mockBlogPosts[0].category}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    {mockBlogPosts[0].title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {mockBlogPosts[0].excerpt}
                  </p>
                  <button className="inline-flex items-center space-x-2 text-green-600 font-semibold hover:text-green-700 transition-colors group">
                    <span>Read Full Article</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Articles</h2>
            <p className="text-gray-600">Discover insights that matter to African agriculture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockBlogPosts.slice(1).map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(post.date, 'MMM dd')}</span>
                    </div>
                    <div className="bg-green-100 px-2 py-1 rounded-full text-green-600 text-xs font-medium">
                      {post.category}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 leading-tight group-hover:text-green-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <button className="text-green-600 font-medium hover:text-green-700 transition-colors flex items-center space-x-1 group">
                      <span>Read More</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Stay Updated with Nomagro Insights
            </h2>
            <p className="text-xl text-gray-300">
              Get the latest agricultural technology insights delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}