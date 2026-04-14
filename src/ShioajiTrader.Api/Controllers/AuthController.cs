using Microsoft.AspNetCore.Mvc;
using ShioajiTrader.Application.DTOs;
using ShioajiTrader.Application.Services;

namespace ShioajiTrader.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ApiKey) || string.IsNullOrWhiteSpace(request.ApiSecret))
        {
            return BadRequest(new ApiResponse(false, "ApiKey 和 ApiSecret 不得為空", 400));
        }

        try
        {
            var result = await _authService.LoginAsync(request);

            if (!result.Success)
            {
                return Unauthorized(new ApiResponse(false, result.Message, 401));
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "登入時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }
}
