# Nomagro Backend System

A comprehensive AI-powered agriculture backend system for African farmers, providing weather predictions, crop recommendations, market intelligence, and agricultural marketplace functionality.

## Features

### 🤖 Machine Learning Models
- **Flood Prediction**: Neural network model predicting flood risks with 85% accuracy
- **Drought Detection**: Advanced drought prediction using multiple environmental factors
- **Crop Recommendations**: Multi-class classification for optimal crop selection
- **Price Forecasting**: Linear regression models for market price predictions

### 🌤️ Weather Intelligence
- Real-time weather data integration with OpenWeather API
- Historical weather data storage and analysis
- Location-based weather forecasting
- Automated weather data updates

### 📊 Prediction System
- Real-time AI predictions for multiple agricultural risks
- Confidence scoring and severity assessment
- Historical prediction validation and model improvement
- Automated prediction generation and notifications

### 🛒 Agricultural Marketplace
- Product listing and management
- Location-based product discovery
- Seller-buyer communication system
- Product rating and review system

### 👥 User Management
- Secure authentication with JWT tokens
- User profiles with farm information
- Location-based services
- Preference management

### 🔄 Automated Services
- Hourly weather data updates
- Daily prediction generation
- Weekly data cleanup
- Monthly model retraining
- Real-time notifications

## Technology Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **ML Framework**: TensorFlow.js Node
- **Authentication**: JWT tokens with bcrypt
- **Real-time**: Socket.IO
- **Caching**: Redis
- **Job Queue**: Bull
- **Logging**: Winston
- **Validation**: Joi
- **API Integration**: Axios

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Make sure MongoDB is running
   npm run migrate
   npm run seed
   ```

5. **Train ML Models**
   ```bash
   npm run train
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile
- `PUT /api/v1/auth/password` - Change password

### Weather
- `GET /api/v1/weather` - Get weather for user location
- `GET /api/v1/weather/location/:lat/:lng` - Get weather for specific location
- `GET /api/v1/weather/historical` - Get historical weather data

### Predictions
- `GET /api/v1/predictions` - Get user predictions
- `POST /api/v1/predictions/flood` - Generate flood prediction
- `POST /api/v1/predictions/drought` - Generate drought prediction
- `POST /api/v1/predictions/crops` - Get crop recommendations
- `POST /api/v1/predictions/price` - Get price prediction
- `PUT /api/v1/predictions/:id/validate` - Validate prediction

### Marketplace
- `GET /api/v1/marketplace/products` - List products
- `POST /api/v1/marketplace/products` - Create product
- `GET /api/v1/marketplace/products/:id` - Get product details
- `PUT /api/v1/marketplace/products/:id` - Update product
- `DELETE /api/v1/marketplace/products/:id` - Delete product

### ML Models
- `GET /api/v1/ml/status` - Get model status
- `POST /api/v1/ml/retrain` - Retrain models
- `GET /api/v1/ml/models/:type/info` - Get model information

## Machine Learning Models

### Flood Prediction Model
- **Input Features**: Rainfall (24h, 7d, 30d), temperature, humidity, pressure, elevation, slope, soil type, river distance, drainage density, NDVI, land cover
- **Architecture**: Neural network with dropout and batch normalization
- **Output**: Flood probability and risk level (low/medium/high)
- **Accuracy**: ~85%

### Drought Prediction Model
- **Input Features**: Temperature (avg, max, min), rainfall (30d, 60d, 90d), humidity, evapotranspiration, soil moisture, groundwater level, NDVI, VHI, season, elevation
- **Architecture**: Deep neural network with regularization
- **Output**: Drought probability and risk level
- **Accuracy**: ~82%

### Crop Recommendation Model
- **Input Features**: Temperature, humidity, pH, rainfall, NPK levels, elevation, slope, soil type, season, market trends
- **Architecture**: Multi-class classification neural network
- **Output**: Top 3 crop recommendations with confidence scores
- **Accuracy**: ~78%

### Price Prediction Model
- **Input Features**: Historical prices, supply, demand, season, weather impact, fuel prices, exchange rates, trade volumes, storage costs
- **Architecture**: Linear regression (simple/multivariate)
- **Output**: Price forecast with change percentage
- **Accuracy**: Variable by crop (60-85%)

## Data Flow

1. **Weather Data**: Hourly updates from OpenWeather API
2. **User Input**: Farm details, location, preferences
3. **ML Processing**: Real-time predictions using trained models
4. **Data Storage**: MongoDB for structured data, Redis for caching
5. **Notifications**: Real-time updates via Socket.IO and email
6. **Model Updates**: Monthly retraining with new data

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t nomagro-backend .

# Run container
docker run -p 5000:5000 --env-file .env nomagro-backend
```

### Production Considerations
- Use PM2 for process management
- Set up MongoDB replica set
- Configure Redis cluster
- Implement proper logging and monitoring
- Set up SSL/TLS certificates
- Configure rate limiting and security headers

## Monitoring and Logging

- **Logs**: Winston logger with file rotation
- **Health Check**: `/health` endpoint
- **Metrics**: Request/response times, error rates
- **Alerts**: High-risk prediction notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.