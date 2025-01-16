# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# # Install system dependencies required for MySQL
# RUN apt-get update && apt-get install -y \
#     gcc \
#     default-libmysqlclient-dev \
#     pkg-config \
#     && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code
COPY . .

# Create static directory
RUN mkdir -p static/products

# Expose the port the app runs on
EXPOSE 8000

# Define environment variable to run in production
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]