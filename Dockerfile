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

# Stage 3: Final Runtime Image
FROM ubuntu:24.04 AS runtime

WORKDIR /app

# Install dependencies and .NET Runtime directly (not via deb)
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    python3 \
    python3-pip \
    libgomp1 \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Download and install .NET 8 Runtime to standard location
RUN wget -q https://dotnetcli.azureedge.net/dotnet/Runtime/8.0.0/dotnet-runtime-8.0.0-linux-x64.tar.gz && \
    mkdir -p /usr/share/dotnet && \
    tar zxf dotnet-runtime-8.0.0-linux-x64.tar.gz -C /usr/share/dotnet && \
    ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet && \
    rm dotnet-runtime-8.0.0-linux-x64.tar.gz

# Install rshioaji
RUN pip3 install --no-cache-dir --break-system-packages rshioaji

# Create non-root user
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

# Environment variables
# CRITICAL: DOTNET_ROOT must point to where .NET is installed
ENV DOTNET_ROOT=/usr/share/dotnet
ENV PATH="/usr/share/dotnet:/usr/bin:${PATH}"
ENV SJ_SIMULATION=true
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check (longer start-period for first install)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Startup script - use $DOTNET_ROOT/dotnet to ensure correct path
ENTRYPOINT ["/bin/bash", "-c", "\
    echo 'Starting rshioaji server...' && \
    shioaji server start & \
    SHIOAJI_PID=$! && \
    echo 'Waiting for rshioaji (PID: $SHIOAJI_PID)...' && \
    sleep 10 && \
    echo 'Starting ShioajiTrader API...' && \
    $DOTNET_ROOT/dotnet ShioajiTrader.Api.dll & \
    API_PID=$! && \
    trap 'kill $SHIOAJI_PID $API_PID 2>/dev/null' EXIT && \
    wait $API_PID"]