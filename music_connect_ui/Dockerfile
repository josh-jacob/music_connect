# music_connect_ui/Dockerfile
FROM node:16-slim

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy the rest of the app (src, public, etc.)
COPY . .

# CRA dev server config
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Start the CRA dev server (reads REACT_APP_* at runtime)
CMD ["npm", "start"]
