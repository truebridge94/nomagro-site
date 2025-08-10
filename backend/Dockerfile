FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create logs directory
RUN mkdir -p logs

# Create uploads directory
RUN mkdir -p uploads/products

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]