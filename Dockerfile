# Use Node.js 20 as base image
FROM node:20-alpine

# Install netcat for the wait-for script
RUN apk add --no-cache netcat-openbsd

# Create app directory
WORKDIR /usr/src/app

# Copy and make wait-for script executable
COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
