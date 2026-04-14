using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ShioajiTrader.Application.DTOs;
using ShioajiTrader.Application.Interfaces;
using ShioajiTrader.Domain.Entities;

namespace ShioajiTrader.Application.Services;

public class AuthService
{
    private readonly IShioajiService _shioajiService;
    private readonly IFileRepository<User> _userRepository;
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;

    public AuthService(
        IShioajiService shioajiService,
        IFileRepository<User> userRepository,
        string jwtSecret,
        string jwtIssuer)
    {
        _shioajiService = shioajiService;
        _userRepository = userRepository;
        _jwtSecret = jwtSecret;
        _jwtIssuer = jwtIssuer;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var (success, token, message) = await _shioajiService.LoginAsync(request.ApiKey, request.ApiSecret);

        if (!success)
        {
            return new LoginResponse(false, string.Empty, message, null);
        }

        var users = await _userRepository.GetAllAsync("users.json");
        var user = users.FirstOrDefault(u => u.ApiKey == request.ApiKey);

        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid().ToString(),
                ApiKey = request.ApiKey,
                ApiSecret = request.ApiSecret,
                LastLoginAt = DateTime.UtcNow
            };
            await _userRepository.CreateAsync("users.json", user);
        }
        else
        {
            user.LastLoginAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync("users.json", user.Id, user);
        }

        var jwtToken = GenerateJwtToken(user);

        return new LoginResponse(true, jwtToken, "登入成功", new UserDto(user.Id, user.Username, user.Email));
    }

    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("api_key", user.ApiKey ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtIssuer,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
