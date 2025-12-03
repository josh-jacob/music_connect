# services/auth-service/Dockerfile
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy application code
COPY server.js .

# Environment defaults (can be overridden by Docker/Code Engine)
ENV PORT=3001

# Expose the port (for local/docker-compose visibility)
EXPOSE 3001

# Start the service
CMD ["npm", "start"]