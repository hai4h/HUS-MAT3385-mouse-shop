FROM node:23-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source files (excludes the build folder)
COPY . .

# Nếu bạn đã build trước đó, sao chép thư mục build vào container
COPY ./build ./build

# Expose port 3000
EXPOSE 3000

# Chạy ứng dụng frontend
CMD ["npm", "start"]
