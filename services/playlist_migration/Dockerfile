# services/playlist_migration/Dockerfile
FROM python:3.12-slim

# Don't write .pyc files, and flush output immediately
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app

# Default port inside the container
ENV PORT=8000

# FastAPI/uvicorn listens on 8000 inside the container
EXPOSE 8000

# Start the FastAPI app via uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
