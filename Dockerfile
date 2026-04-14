# ================================================
# ShioajiTrader - Docker Deployment
# ================================================
# Build: docker build -t shioajitrader .
# Run:   docker run -d -p 5000:5000 --name shioajitrader shioajitrader
# ================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend files
COPY frontend/ ./

# Install dependencies and build
RUN npm install -g pnpm && \
    pnpm install && \
    pnpm run build

# ================================================

# Stage 2: Build .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-builder

WORKDIR /src

# Copy solution and project files first (for caching)
COPY ShioajiTrader.sln ./
COPY src/ShioajiTrader.Api/ShioajiTrader.Api.csproj ./src/ShioajiTrader.Api/
COPY src/ShioajiTrader.Application/ShioajiTrader.Application.csproj ./src/ShioajiTrader.Application/
COPY src/ShioajiTrader.Domain/ShioajiTrader.Domain.csproj ./src/ShioajiTrader.Domain/
COPY src/ShioajiTrader.Infrastructure/ShioajiTrader.Infrastructure.csproj ./src/ShioajiTrader.Infrastructure/
COPY src/ShioajiTrader.Presentation/ShioajiTrader.Presentation.csproj ./src/ShioajiTrader.Presentation/

# Restore packages
RUN dotnet restore

# Copy all source files
COPY src/ ./src/

# Build and publish
RUN dotnet publish src/ShioajiTrader.Api/ShioajiTrader.Api.csproj -c Release -o /app/publish

# ================================================

# Stage 3: Final Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

# Install Python, pip, and curl for health checks
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-venv \
        curl \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app user for security
RUN useradd --create-home --shell /bin/bash appuser

# Install rshioaji globally (required for API calls)
RUN pip3 install --no-cache-dir --break-system-packages rshioaji

# Create wwwroot directory for static files
RUN mkdir -p /app/wwwroot /app/src.data

# Copy published backend from builder
COPY --from=backend-builder /app/publish .

# Copy built frontend to wwwroot
COPY --from=frontend-builder /app/dist ./wwwroot

# Fix permissions - allow appuser to write to src.data
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Set working directory
WORKDIR /app

# Expose port
EXPOSE 5000

# Environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV Shioaji__BaseUrl=http://localhost:8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start script: launch rshioaji first, then run .NET app
# rshioaji will run in background, .NET app waits for it
CMD /bin/bash -c '\
    echo "Starting rshioaji server..." && \
    shioaji server start & \
    SHIOAJI_PID=$! && \
    echo "Waiting for rshioaji to be ready (PID: $SHIOAJI_PID)..." && \
    sleep 5 && \
    echo "Starting ShioajiTrader API..." && \
    dotnet ShioajiTrader.Api.dll & \
    API_PID=$! && \
    trap "kill $SHIOAJI_PID $API_PID 2>/dev/null" EXIT && \
    wait $API_PID'