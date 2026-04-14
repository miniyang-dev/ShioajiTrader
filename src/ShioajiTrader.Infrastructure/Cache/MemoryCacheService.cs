using Microsoft.Extensions.Caching.Memory;

namespace ShioajiTrader.Infrastructure.Cache;

public class MemoryCacheService
{
    private readonly IMemoryCache _cache;
    private readonly MemoryCacheEntryOptions _defaultOptions;

    public MemoryCacheService(IMemoryCache cache)
    {
        _cache = cache;
        _defaultOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromSeconds(30));
    }

    public void SetQuote(string stockCode, object quote, TimeSpan? expiration = null)
    {
        var options = expiration.HasValue
            ? new MemoryCacheEntryOptions().SetAbsoluteExpiration(expiration.Value)
            : _defaultOptions;

        _cache.Set($"quote:{stockCode}", quote, options);
    }

    public T? GetQuote<T>(string stockCode) where T : class
    {
        return _cache.TryGetValue($"quote:{stockCode}", out T? value) ? value : null;
    }

    public void SetOrderBook(string stockCode, object orderBook, TimeSpan? expiration = null)
    {
        var options = expiration.HasValue
            ? new MemoryCacheEntryOptions().SetAbsoluteExpiration(expiration.Value)
            : _defaultOptions;

        _cache.Set($"orderbook:{stockCode}", orderBook, options);
    }

    public T? GetOrderBook<T>(string stockCode) where T : class
    {
        return _cache.TryGetValue($"orderbook:{stockCode}", out T? value) ? value : null;
    }

    public void Set(string key, object value, TimeSpan? expiration = null)
    {
        var options = expiration.HasValue
            ? new MemoryCacheEntryOptions().SetAbsoluteExpiration(expiration.Value)
            : _defaultOptions;

        _cache.Set(key, value, options);
    }

    public T? Get<T>(string key) where T : class
    {
        return _cache.TryGetValue(key, out T? value) ? value : null;
    }

    public void Remove(string key)
    {
        _cache.Remove(key);
    }
}
