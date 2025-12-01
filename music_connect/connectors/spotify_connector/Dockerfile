# filepath: /Users/paul/Documents/UWO_25-26/CS4471A/MusicConnectRepo/music_connect/connectors/spotify_connector/Dockerfile
FROM python:3.11-slim

# Create a non-root user
RUN useradd -m appuser
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# Copy dependency manifest and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Use non-root user
USER appuser

# Expose the port the app will run on
EXPOSE 8081

# Start the FastAPI app with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8081"]