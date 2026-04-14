using System.Text.Json;
using ShioajiTrader.Application.DTOs;
using ShioajiTrader.Application.Interfaces;
using ShioajiTrader.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ShioajiTrader.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StocksController : ControllerBase
{
    private readonly IShioajiService _shioajiService;
    private readonly IFileRepository<Stock> _stockRepository;
    private readonly ILogger<StocksController> _logger;

    public StocksController(
        IShioajiService shioajiService,
        IFileRepository<Stock> stockRepository,
        ILogger<StocksController> logger)
    {
        _shioajiService = shioajiService;
        _stockRepository = stockRepository;
        _logger = logger;
    }

    /// <summary>
    /// 查詢個股報價
    /// </summary>
    [HttpGet("{code}")]
    public async Task<IActionResult> GetQuote(string code)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest(new ApiResponse(false, "股票代碼不得為空", 400));
            }

            // 從快取或 API 取得報價
            var quotes = await _shioajiService.GetQuoteAsync(code.ToUpper());
            var quote = quotes.FirstOrDefault();

            if (quote == null)
            {
                return NotFound(new ApiResponse(false, $"找不到股票 {code}", 404));
            }

            return Ok(new ApiResponse<Stock>(true, quote, "查詢成功"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "查詢股票 {Code} 時發生錯誤", code);
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 取得歷史 K 線資料
    /// </summary>
    [HttpGet("{code}/kbars")]
    public async Task<IActionResult> GetKbars(string code, int days = 30)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest(new ApiResponse(false, "股票代碼不得為空", 400));
            }

            var stocks = await _stockRepository.GetAllAsync("stocks.json");
            var stock = stocks.FirstOrDefault(s => s.Code == code.ToUpper());

            if (stock == null)
            {
                return NotFound(new ApiResponse(false, $"找不到股票 {code}", 404));
            }

            // TODO: 串接 rshioaji 取得 K 線資料
            return Ok(new ApiResponse<KbarDataDto>(true, new KbarDataDto(code.ToUpper(), new List<KbarDto>()), "查詢成功"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "取得 K 線資料時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 取得已追蹤的股票清單
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTrackedStocks()
    {
        try
        {
            var stocks = await _stockRepository.GetAllAsync("stocks.json");
            return Ok(new ApiResponse<IEnumerable<Stock>>(true, stocks, "查詢成功"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "取得追蹤股票清單時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 新增股票到追蹤清單
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> AddToTracking([FromBody] AddStockRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest(new ApiResponse(false, "股票代碼不得為空", 400));
            }

            var stocks = await _stockRepository.GetAllAsync("stocks.json");
            var existing = stocks.FirstOrDefault(s => s.Code == request.Code.ToUpper());

            if (existing != null)
            {
                return Conflict(new ApiResponse(false, $"股票 {request.Code} 已在追蹤清單中", 409));
            }

            var newStock = new Stock
            {
                Code = request.Code.ToUpper(),
                Name = request.Name ?? request.Code.ToUpper(),
                CurrentPrice = 0,
                Change = 0,
                ChangePercent = 0,
                UpdatedAt = DateTime.UtcNow
            };

            await _stockRepository.CreateAsync("stocks.json", newStock);

            return Created($"/api/stocks/{newStock.Code}", new ApiResponse<Stock>(true, newStock, "已加入追蹤"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "新增追蹤股票時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 從追蹤清單移除股票
    /// </summary>
    [HttpDelete("{code}")]
    public async Task<IActionResult> RemoveFromTracking(string code)
    {
        try
        {
            var stocks = await _stockRepository.GetAllAsync("stocks.json");
            var stock = stocks.FirstOrDefault(s => s.Code == code.ToUpper());

            if (stock == null)
            {
                return NotFound(new ApiResponse(false, $"股票 {code} 不在追蹤清單中", 404));
            }

            await _stockRepository.DeleteAsync("stocks.json", stock.Id);

            return Ok(new ApiResponse(true, "已從追蹤清單移除"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "移除追蹤股票時發生錯誤");
            return StatusCode(500, new ApiResponse(false, $"伺服器錯誤: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// 訂閱即時報價 SSE 串流
    /// </summary>
    [HttpGet("{code}/stream")]
    public async Task StreamQuote(string code, CancellationToken cancellationToken)
    {
        try
        {
            Response.ContentType = "text/event-stream";
            Response.Headers.Append("Cache-Control", "no-cache");
            Response.Headers.Append("Connection", "keep-alive");

            await foreach (var stock in _shioajiService.SubscribeTicksAsync(new[] { code.ToUpper() }, cancellationToken))
            {
                var json = JsonSerializer.Serialize(new
                {
                    code = stock.Code,
                    name = stock.Name,
                    price = stock.CurrentPrice,
                    change = stock.Change,
                    changePercent = stock.ChangePercent,
                    volume = stock.Volume,
                    updatedAt = stock.UpdatedAt
                });


                await Response.WriteAsync($"data: {json}\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }
        }
        catch (OperationCanceledException)
        {
            // Client disconnected
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SSE 串流發生錯誤");
        }
    }
}

// ===== DTOs =====

public record AddStockRequest(string Code, string? Name);

public record StockDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public decimal CurrentPrice { get; init; }
    public decimal Change { get; init; }
    public decimal ChangePercent { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record KbarDataDto(string Code, List<KbarDto> Kbars);

public record KbarDto
{
    public DateTime Date { get; init; }
    public decimal Open { get; init; }
    public decimal High { get; init; }
    public decimal Low { get; init; }
    public decimal Close { get; init; }
    public long Volume { get; init; }
}

// ===== Generic ApiResponse =====

public record ApiResponse(bool Success, string Message, int Code = 200);

public record ApiResponse<T>(bool Success, T Data, string Message, int Code = 200);
