# ---------- Build stage ----------
FROM node:25 AS build

# Create app directory
WORKDIR /app

# Install dependencies (clean, reproducible)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source (src, public, etc.)
COPY . .

# Build the production bundle
RUN npm run build

# ---------- Run stage ----------
FROM node:25

WORKDIR /app

# Lightweight static file server
RUN npm install -g serve

# Copy built static files from build stage
COPY --from=build /app/build ./build

# Port for the web server (Code Engine can also use this)
ENV PORT=3000
EXPOSE 3000

# Serve the production build
CMD ["serve", "-s", "build", "-l", "3000"]
