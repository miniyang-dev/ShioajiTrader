using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ShioajiTrader.Api.Filters;
using ShioajiTrader.Application.Interfaces;
using ShioajiTrader.Application.Services;
using ShioajiTrader.Domain.Entities;
using ShioajiTrader.Infrastructure.Cache;
using ShioajiTrader.Infrastructure.Repositories;
using ShioajiTrader.Infrastructure.Shioaji;


var builder = WebApplication.CreateBuilder(args);

// Configuration
var dataPath = builder.Configuration["Data:Path"] ?? Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "src.data");
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "ShioajiTrader_SuperSecret_Key_Must_Be_At_Least_32_Characters";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ShioajiTrader";
var shioajiBaseUrl = builder.Configuration["Shioaji:BaseUrl"] ?? "http://localhost:8080";

// Services - Infrastructure
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<MemoryCacheService>();

builder.Services.AddHttpClient<ShioajiClient>();
builder.Services.AddSingleton<IShioajiService>(sp =>
{
    var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();
    var cache = sp.GetRequiredService<MemoryCacheService>();
    var client = httpClientFactory.CreateClient(nameof(ShioajiClient));
    return new ShioajiClient(client, cache, shioajiBaseUrl);
});

builder.Services.AddSingleton<JsonFileRepository<User>>(new JsonFileRepository<User>(dataPath));

// Services - Application
builder.Services.AddSingleton(sp =>
{
    var shioajiService = sp.GetRequiredService<IShioajiService>();
    var userRepo = sp.GetRequiredService<JsonFileRepository<User>>();
    return new AuthService(shioajiService, userRepo, jwtSecret, jwtIssuer);
});

// Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Exception Filters
builder.Services.AddScoped<GlobalExceptionFilter>();
builder.Services.AddScoped<ValidationExceptionFilter>();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }));

app.Run();

public partial class Program { }
