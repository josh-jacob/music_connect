# youtube_connector/Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Default location of the credentials file *inside* the container
ENV YOUTUBE_CLIENT_SECRET_FILE=/app/youtube_oauth_credentials.json

# App listens on 8000 inside the container
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
