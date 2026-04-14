using ShioajiTrader.Application.DTOs;
using ShioajiTrader.Application.Interfaces;
using ShioajiTrader.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ShioajiTrader.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IShioajiService _shioajiService;
    private readonly IFileRepository<Order> _orderRepository;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        IShioajiService shioajiService,
        IFileRepository<Order> orderRepository,
        ILogger<OrdersController> logger)
    {
        _shioajiService = shioajiService;
        _orderRepository = orderRepository;
        _logger = logger;
    }

    /// <summary>
    /// 取得委託單列表
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status = null)
    {
        try
        {
            var orders = await _orderRepository.GetAllAsync("orders.json");
            
            if (status.HasValue)
            {
                orders = orders.Where(o => o.Status == status.Value);
            }

            return Ok(new ApiResponse<IEnumerable<Order>>(
                true,
                orders.OrderByDescending(o => o.CreatedAt),
                "查詢成功"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "取得委託單時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 取得特定委託單
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(string id)
    {
        try
        {
            var order = await _orderRepository.GetByIdAsync("orders.json", id);

            if (order == null)
            {
                return NotFound(new ApiResponse(false, "找不到委託單", 404));
            }

            return Ok(new ApiResponse<Order>(true, order, "查詢成功"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "取得委託單時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 下單（市價單）
    /// </summary>
    [HttpPost("market")]
    public async Task<IActionResult> PlaceMarketOrder([FromBody] PlaceOrderRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.StockCode))
            {
                return BadRequest(new ApiResponse(false, "股票代碼不得為空", 400));
            }

            if (request.Quantity <= 0)
            {
                return BadRequest(new ApiResponse(false, "數量必須大於0", 400));
            }

            // 驗證股票代碼格式
            if (!IsValidStockCode(request.StockCode))
            {
                return BadRequest(new ApiResponse(false, "股票代碼格式不正確", 400));
            }

            var order = new Order
            {
                Id = Guid.NewGuid().ToString(),
                StockCode = request.StockCode.ToUpper(),
                StockName = request.StockName ?? request.StockCode.ToUpper(),
                Side = request.Side,
                Type = OrderType.Market,
                Quantity = request.Quantity,
                Price = 0, // 市價單無指定價格
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            // 嘗試透過 Shioaji 下單
            try
            {
                await _shioajiService.PlaceOrderAsync(order);
                order.Status = OrderStatus.Submitted;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Shioaji 下單失敗，使用模擬模式");
                order.Status = OrderStatus.Pending;
                order.Message = "模擬下單（Shioaji 未連接）";
            }

            await _orderRepository.CreateAsync("orders.json", order);

            return Created($"/api/orders/{order.Id}", new ApiResponse<Order>(
                true,
                order,
                order.Status == OrderStatus.Submitted ? "下單成功" : "下單已記錄（待執行）"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "下單時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 下單（限價單）
    /// </summary>
    [HttpPost("limit")]
    public async Task<IActionResult> PlaceLimitOrder([FromBody] PlaceLimitOrderRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.StockCode))
            {
                return BadRequest(new ApiResponse(false, "股票代碼不得為空", 400));
            }

            if (request.Quantity <= 0)
            {
                return BadRequest(new ApiResponse(false, "數量必須大於0", 400));
            }

            if (request.Price <= 0)
            {
                return BadRequest(new ApiResponse(false, "價格必須大於0", 400));
            }

            if (!IsValidStockCode(request.StockCode))
            {
                return BadRequest(new ApiResponse(false, "股票代碼格式不正確", 400));
            }

            var order = new Order
            {
                Id = Guid.NewGuid().ToString(),
                StockCode = request.StockCode.ToUpper(),
                StockName = request.StockName ?? request.StockCode.ToUpper(),
                Side = request.Side,
                Type = OrderType.Limit,
                Quantity = request.Quantity,
                Price = request.Price,
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                await _shioajiService.PlaceOrderAsync(order);
                order.Status = OrderStatus.Submitted;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Shioaji 下單失敗，使用模擬模式");
                order.Status = OrderStatus.Pending;
                order.Message = "模擬下單（Shioaji 未連接）";
            }

            await _orderRepository.CreateAsync("orders.json", order);

            return Created($"/api/orders/{order.Id}", new ApiResponse<Order>(
                true,
                order,
                order.Status == OrderStatus.Submitted ? "下單成功" : "下單已記錄（待執行）"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "下單時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 取消委託
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(string id)
    {
        try
        {
            var order = await _orderRepository.GetByIdAsync("orders.json", id);

            if (order == null)
            {
                return NotFound(new ApiResponse(false, "找不到委託單", 404));
            }

            if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Submitted)
            {
                return BadRequest(new ApiResponse(false, "此委託無法取消", 400));
            }

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepository.UpdateAsync("orders.json", id, order);

            return Ok(new ApiResponse<Order>(true, order, "委託已取消"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "取消委託時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 取得當日成交統計
    /// </summary>
    [HttpGet("today")]
    public async Task<IActionResult> GetTodayStatistics()
    {
        try
        {
            var orders = await _orderRepository.GetAllAsync("orders.json");
            var today = DateTime.UtcNow.Date;

            var todayOrders = orders.Where(o => o.CreatedAt.Date == today).ToList();

            var stats = new OrderStatistics
            {
                TotalCount = todayOrders.Count,
                BuyCount = todayOrders.Count(o => o.Side == OrderSide.Buy),
                SellCount = todayOrders.Count(o => o.Side == OrderSide.Sell),
                PendingCount = todayOrders.Count(o => o.Status == OrderStatus.Pending),
                SubmittedCount = todayOrders.Count(o => o.Status == OrderStatus.Submitted),
                FilledCount = todayOrders.Count(o => o.Status == OrderStatus.Filled),
                CancelledCount = todayOrders.Count(o => o.Status == OrderStatus.Cancelled),
                TotalBuyAmount = todayOrders
                    .Where(o => o.Side == OrderSide.Buy && o.Status == OrderStatus.Filled)
                    .Sum(o => (decimal)(o.Price * o.Quantity)),
                TotalSellAmount = todayOrders
                    .Where(o => o.Side == OrderSide.Sell && o.Status == OrderStatus.Filled)
                    .Sum(o => (decimal)(o.Price * o.Quantity)),
            };

            return Ok(new ApiResponse<OrderStatistics>(true, stats, "查詢成功"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "取得當日統計時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    private static bool IsValidStockCode(string code)
    {
        // 台股代碼通常是 4 位數字
        return System.Text.RegularExpressions.Regex.IsMatch(code, @"^\d{4}$");
    }
}

// ===== Request DTOs =====

public record PlaceOrderRequest(
    string StockCode,
    string? StockName,
    OrderSide Side,
    int Quantity
);

public record PlaceLimitOrderRequest(
    string StockCode,
    string? StockName,
    OrderSide Side,
    int Quantity,
    decimal Price
);

// ===== Response DTOs =====

public class OrderStatistics
{
    public int TotalCount { get; set; }
    public int BuyCount { get; set; }
    public int SellCount { get; set; }
    public int PendingCount { get; set; }
    public int SubmittedCount { get; set; }
    public int FilledCount { get; set; }
    public int CancelledCount { get; set; }
    public decimal TotalBuyAmount { get; set; }
    public decimal TotalSellAmount { get; set; }
}
