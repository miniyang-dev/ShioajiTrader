using ShioajiTrader.Domain.Entities;

namespace ShioajiTrader.Application.Interfaces;

public interface IShioajiService
{
    Task<(bool Success, string Token, string Message)> LoginAsync(string apiKey, string apiSecret);
    Task<IEnumerable<Stock>> GetQuoteAsync(string stockCode);
    IAsyncEnumerable<Stock> SubscribeTicksAsync(IEnumerable<string> stockCodes, CancellationToken cancellationToken);
    Task PlaceOrderAsync(Order order);
}
