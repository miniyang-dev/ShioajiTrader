using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Channels;
using ShioajiTrader.Application.Interfaces;
using ShioajiTrader.Domain.Entities;
using ShioajiTrader.Infrastructure.Cache;

namespace ShioajiTrader.Infrastructure.Shioaji;

public class ShioajiClient : IShioajiService
{
    private readonly HttpClient _httpClient;
    private readonly MemoryCacheService _cache;
    private readonly string _baseUrl;
    private string? _sessionToken;
    private readonly Channel<Stock> _tickChannel;

    public ShioajiClient(HttpClient httpClient, MemoryCacheService cache, string baseUrl = "http://localhost:8080")
    {
        _httpClient = httpClient;
        _cache = cache;
        _baseUrl = baseUrl;
        _tickChannel = Channel.CreateUnbounded<Stock>(new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false
        });
    }

    public async Task<(bool Success, string Token, string Message)> LoginAsync(string apiKey, string apiSecret)
    {
        try
        {
            var payload = new
            {
                api_key = apiKey,
                api_secret = apiSecret
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/auth/login", content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                return (false, string.Empty, $"登入失敗: {error}");
            }

            var result = await JsonSerializer.DeserializeAsync<LoginResult>(await response.Content.ReadAsStreamAsync());

            if (result == null || string.IsNullOrEmpty(result.SessionToken))
            {
                return (false, string.Empty, "無效的回應");
            }

            _sessionToken = result.SessionToken;
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _sessionToken);

            return (true, _sessionToken, "登入成功");
        }
        catch (Exception ex)
        {
            return (false, string.Empty, $"連線錯誤: {ex.Message}");
        }
    }

    public async Task<IEnumerable<Stock>> GetQuoteAsync(string stockCode)
    {
        try
        {
            var cached = _cache.GetQuote<Stock>($"quote:{stockCode}");
            if (cached != null)
            {
                return new[] { cached };
            }

            var response = await _httpClient.GetAsync($"{_baseUrl}/api/v1/quote/{stockCode}");

            if (!response.IsSuccessStatusCode)
            {
                return Enumerable.Empty<Stock>();
            }

            var quote = await JsonSerializer.DeserializeAsync<Stock>(await response.Content.ReadAsStreamAsync());

            if (quote != null)
            {
                quote.Code = stockCode;
                quote.UpdatedAt = DateTime.UtcNow;
                _cache.SetQuote(stockCode, quote);
                return new[] { quote };
            }

            return Enumerable.Empty<Stock>();
        }
        catch
        {
            return Enumerable.Empty<Stock>();
        }
    }

    public async IAsyncEnumerable<Stock> SubscribeTicksAsync(
        IEnumerable<string> stockCodes,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var codesList = stockCodes.ToList();
        var subscribePayload = new
        {
            codes = codesList,
            tick_type = "tick_stk"
        };

        var content = new StringContent(JsonSerializer.Serialize(subscribePayload), Encoding.UTF8, "application/json");
        var subscribeResponse = await _httpClient.PostAsync($"{_baseUrl}/api/v1/stream/subscribe", content);
        subscribeResponse.EnsureSuccessStatusCode();

        // SSE stream reading using StreamReader
        var stream = await _httpClient.GetStreamAsync($"{_baseUrl}/api/v1/stream/data/tick_stk");

        using var reader = new StreamReader(stream);

        while (!cancellationToken.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(cancellationToken);
            if (line == null) break;

            if (string.IsNullOrWhiteSpace(line) || !line.StartsWith("data:"))
            {
                continue;
            }

            var data = line["data:".Length..].Trim();
            var stock = JsonSerializer.Deserialize<Stock>(data);

            if (stock != null)
            {
                stock.UpdatedAt = DateTime.UtcNow;
                _cache.SetQuote(stock.Code, stock);
                yield return stock;
            }
        }
    }

    public async Task PlaceOrderAsync(Order order)
    {
        var payload = new
        {
            stock_code = order.StockCode,
            side = order.Side.ToString().ToLower(),
            type = order.Type.ToString().ToLower(),
            quantity = order.Quantity,
            price = order.Price
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/order", content);
        response.EnsureSuccessStatusCode();
    }

    private class LoginResult
    {
        public string SessionToken { get; set; } = string.Empty;
    }
}
