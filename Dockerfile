# ================================================
# ShioajiTrader - Python FastAPI Backend
# ================================================
# Build: docker build -t shioajitrader .
# Run:   docker run -d -p 8080:8080 --name shioajitrader shioajitrader
# ================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY frontend/ ./

RUN npm install -g pnpm && \
    pnpm install && \
    pnpm run build

# ================================================
# Stage 2: Python Backend
FROM python:3.11-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        libgomp1 \
        libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY src/requirements.txt .

# Install Python dependencies (use pip cache)
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ .

# ================================================
# Stage 3: Final Runtime Image
FROM python:3.11-slim AS runtime

WORKDIR /app

# Install minimal system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        libgomp1 \
        libssl3 \
        libicu-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend /usr/local/bin /usr/local/bin

# Copy source code
COPY src/ .

# Copy built frontend
COPY --from=frontend-builder /app/dist ./wwwroot

# Create data directory
RUN mkdir -p /app/src.data

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV DATA_PATH=/app/src.data
ENV SJ_SIMULATION=true
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
