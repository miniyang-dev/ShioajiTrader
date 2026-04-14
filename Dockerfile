# ================================================
# ShioajiTrader - Docker Deployment
# ================================================
# Build: docker build -t shioajitrader .
# Run:   docker run -d -p 5000:5000 --name shioajitrader shioajitrader
# ================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY frontend/ ./

RUN npm install -g pnpm && \
    pnpm install && \
    pnpm run build

# ================================================

# Stage 2: Build .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-builder

WORKDIR /src

COPY ShioajiTrader.sln ./
COPY src/ShioajiTrader.Api/ShioajiTrader.Api.csproj ./src/ShioajiTrader.Api/
COPY src/ShioajiTrader.Application/ShioajiTrader.Application.csproj ./src/ShioajiTrader.Application/
COPY src/ShioajiTrader.Domain/ShioajiTrader.Domain.csproj ./src/ShioajiTrader.Domain/
COPY src/ShioajiTrader.Infrastructure/ShioajiTrader.Infrastructure.csproj ./src/ShioajiTrader.Infrastructure/
COPY src/ShioajiTrader.Presentation/ShioajiTrader.Presentation.csproj ./src/ShioajiTrader.Presentation/

RUN dotnet restore

COPY src/ ./src/

RUN dotnet publish src/ShioajiTrader.Api/ShioajiTrader.Api.csproj -c Release -o /app/publish

# ================================================

# Stage 3: Final Runtime Image (Ubuntu 24.04 for GLIBC 2.39)
FROM ubuntu:24.04 AS runtime

WORKDIR /app

# Install required packages (Ubuntu 24.04 has GLIBC 2.39)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install rshioaji (requires GLIBC 2.38+)
RUN pip3 install --no-cache-dir --break-system-packages rshioaji

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash appuser

# Create directories
RUN mkdir -p /app/wwwroot /app/src.data

# Copy published backend
COPY --from=backend-builder /app/publish .

# Copy built frontend
COPY --from=frontend-builder /app/dist ./wwwroot

# Fix permissions
RUN chown -R appuser:appuser /app

USER appuser
WORKDIR /app

EXPOSE 5000

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV Shioaji__BaseUrl=http://localhost:8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Startup script
CMD /bin/bash -c '\
    echo "Starting rshioaji server..." && \
    shioaji server start & \
    SHIOAJI_PID=$! && \
    echo "Waiting for rshioaji (PID: $SHIOAJI_PID)..." && \
    sleep 8 && \
    echo "Starting ShioajiTrader API..." && \
    dotnet ShioajiTrader.Api.dll & \
    API_PID=$! && \
    trap "kill $SHIOAJI_PID $API_PID 2>/dev/null" EXIT && \
    wait $API_PID'