namespace ShioajiTrader.Application.DTOs;

public record LoginRequest(string ApiKey, string ApiSecret);

public record LoginResponse(
    bool Success,
    string Token,
    string Message,
    UserDto? User
);

public record UserDto(
    string Id,
    string Username,
    string Email
);

public record ApiResponse(
    bool Success,
    string Message,
    int Code = 200
);
