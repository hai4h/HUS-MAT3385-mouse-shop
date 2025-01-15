# Frontend Dockerfile
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Chạy ứng dụng frontend
CMD ["npm", "start"]