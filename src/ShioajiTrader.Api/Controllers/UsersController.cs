using System.Security.Claims;
using ShioajiTrader.Application.DTOs;
using ShioajiTrader.Application.Interfaces;
using ShioajiTrader.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ShioajiTrader.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IFileRepository<User> _userRepository;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IFileRepository<User> userRepository,
        ILogger<UsersController> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    private string? GetApiKey()
    {
        return User.FindFirstValue("api_key");
    }

    /// <summary>
    /// 取得目前使用者資訊
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var apiKey = GetApiKey();
            if (string.IsNullOrEmpty(apiKey))
            {
                return Unauthorized(new ApiResponse(false, "未授權", 401));
            }

            var users = await _userRepository.GetAllAsync("users.json");
            var user = users.FirstOrDefault(u => u.ApiKey == apiKey);

            if (user == null)
            {
                return NotFound(new ApiResponse(false, "找不到使用者", 404));
            }

            return Ok(new ApiResponse<UserDto>(
                true,
                new UserDto(user.Id, user.Username, user.Email),
                "查詢成功"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "取得使用者資訊時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 更新使用者資訊
    /// </summary>
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var apiKey = GetApiKey();
            if (string.IsNullOrEmpty(apiKey))
            {
                return Unauthorized(new ApiResponse(false, "未授權", 401));
            }

            var users = await _userRepository.GetAllAsync("users.json");
            var user = users.FirstOrDefault(u => u.ApiKey == apiKey);

            if (user == null)
            {
                return NotFound(new ApiResponse(false, "找不到使用者", 404));
            }

            // 更新欄位
            if (!string.IsNullOrEmpty(request.Username))
                user.Username = request.Username;
            if (!string.IsNullOrEmpty(request.Email))
                user.Email = request.Email;

            await _userRepository.UpdateAsync("users.json", user.Id, user);

            return Ok(new ApiResponse<UserDto>(
                true,
                new UserDto(user.Id, user.Username, user.Email),
                "更新成功"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "更新使用者資訊時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 變更密碼
    /// </summary>
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.CurrentPassword) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest(new ApiResponse(false, "密碼不得為空", 400));
            }

            var apiKey = GetApiKey();
            if (string.IsNullOrEmpty(apiKey))
            {
                return Unauthorized(new ApiResponse(false, "未授權", 401));
            }

            var users = await _userRepository.GetAllAsync("users.json");
            var user = users.FirstOrDefault(u => u.ApiKey == apiKey);

            if (user == null)
            {
                return NotFound(new ApiResponse(false, "找不到使用者", 404));
            }

            // 驗證當前密碼（這裡應該做 hash 比對，這裡簡化）
            if (!string.IsNullOrEmpty(user.PasswordHash) && user.PasswordHash != request.CurrentPassword)
            {
                return BadRequest(new ApiResponse(false, "當前密碼錯誤", 400));
            }

            user.PasswordHash = request.NewPassword; // 實際應該 hash
            await _userRepository.UpdateAsync("users.json", user.Id, user);

            return Ok(new ApiResponse(true, "密碼變更成功"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "變更密碼時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 刪除帳戶
    /// </summary>
    [HttpDelete("me")]
    public async Task<IActionResult> DeleteAccount()
    {
        try
        {
            var apiKey = GetApiKey();
            if (string.IsNullOrEmpty(apiKey))
            {
                return Unauthorized(new ApiResponse(false, "未授權", 401));
            }

            var users = await _userRepository.GetAllAsync("users.json");
            var user = users.FirstOrDefault(u => u.ApiKey == apiKey);

            if (user == null)
            {
                return NotFound(new ApiResponse(false, "找不到使用者", 404));
            }

            await _userRepository.DeleteAsync("users.json", user.Id);

            return Ok(new ApiResponse(true, "帳戶已刪除"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "刪除帳戶時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }
}

// ===== DTOs =====

public record UpdateProfileRequest(string? Username, string? Email);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
