FROM node:20-slim

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Build production bundle
RUN npm run build

# Install static server
RUN npm install -g serve

ENV PORT=3000
EXPOSE 3000

# Serve the built assets
CMD ["serve", "-s", "build", "-l", "0.0.0.0:3000"]