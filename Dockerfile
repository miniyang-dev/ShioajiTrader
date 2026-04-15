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

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    python3-full \
    python3-venv \
    libgomp1 \
    libssl3 \
    libicu-dev \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment for Python packages
RUN python3 -m venv /opt/venv

# Install rshioaji in venv
RUN /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install rshioaji

# Download and install .NET 8 Runtime + ASP.NET Core Runtime
RUN wget -q https://dotnetcli.azureedge.net/dotnet/Runtime/8.0.0/dotnet-runtime-8.0.0-linux-x64.tar.gz && \
    wget -q https://dotnetcli.azureedge.net/dotnet/aspnetcore/Runtime/8.0.0/aspnetcore-runtime-8.0.0-linux-x64.tar.gz && \
    mkdir -p /usr/share/dotnet && \
    tar zxf dotnet-runtime-8.0.0-linux-x64.tar.gz -C /usr/share/dotnet && \
    tar zxf aspnetcore-runtime-8.0.0-linux-x64.tar.gz -C /usr/share/dotnet && \
    ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet && \
    rm *.tar.gz

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

EXPOSE 8080

# Environment variables
ENV DOTNET_ROOT=/usr/share/dotnet
ENV PATH="/usr/share/dotnet:/usr/bin:/opt/venv/bin:${PATH}"
ENV VIRTUAL_ENV=/opt/venv
ENV SJ_SIMULATION=true
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Link rshioaji cache to persistent storage
RUN mkdir -p /app/src.data/.shioaji && \
    if [ ! -e /home/appuser/.shioaji ]; then \
        ln -s /app/src.data/.shioaji /home/appuser/.shioaji; \
    fi

# Create startup script
RUN printf "#!/bin/sh\necho 'Starting rshioaji...'\n/opt/venv/bin/shioaji server start &\nSHIOAJI_PID=$!\nsleep 10\necho 'Starting API...'\n$DOTNET_ROOT/dotnet ShioajiTrader.Api.dll &\nAPI_PID=$!\ntrap 'kill $SHIOAJI_PID $API_PID 2>/dev/null' EXIT\nwait $API_PID\n" > /app/start.sh && chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health

# Use startup script
ENTRYPOINT ["/app/start.sh"]
