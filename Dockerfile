# ============================
# Stage 1: Frontend Build
# ============================
FROM node:20-alpine as frontend

WORKDIR /app/frontend

COPY react-vite/package*.json ./
RUN npm install

COPY react-vite/ ./
RUN npm run build

# ============================
# Stage 2: Backend Build
# ============================
FROM python:3.9.18-alpine3.18

# System dependencies
RUN apk add --no-cache build-base postgresql-dev gcc python3-dev musl-dev

# Set environment variables
ENV FLASK_APP=app
ENV FLASK_ENV=production
ENV FLASK_DEBUG=0
ENV SECRET_KEY=changeme
ENV DATABASE_URL=sqlite:///dev.db

# Set working directory
WORKDIR /var/www

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt && pip install psycopg2

# Copy backend files
COPY . .

# Copy built React frontend
COPY --from=frontend /app/frontend/dist ./react-vite/dist

# Expose port
EXPOSE 10000

# Use correct CMD
CMD exec gunicorn --bind 0.0.0.0:10000 wsgi:app





