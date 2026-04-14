using System.Text.Json;
using ShioajiTrader.Application.Interfaces;

namespace ShioajiTrader.Infrastructure.Repositories;

public class JsonFileRepository<T> : IFileRepository<T> where T : class
{
    private readonly string _basePath;
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    private readonly JsonSerializerOptions _jsonOptions;

    public JsonFileRepository(string basePath)
    {
        _basePath = basePath;
        _jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNameCaseInsensitive = true
        };

        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    private string GetFilePath(string fileName)
    {
        return Path.Combine(_basePath, fileName);
    }

    public async Task<IEnumerable<T>> GetAllAsync(string fileName)
    {
        var filePath = GetFilePath(fileName);

        if (!File.Exists(filePath))
        {
            return Enumerable.Empty<T>();
        }

        await _semaphore.WaitAsync();
        try
        {
            var json = await File.ReadAllTextAsync(filePath);
            return JsonSerializer.Deserialize<List<T>>(json, _jsonOptions) ?? Enumerable.Empty<T>();
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<T?> GetByIdAsync(string fileName, string id)
    {
        var items = await GetAllAsync(fileName);
        var idProperty = typeof(T).GetProperty("Id");

        if (idProperty == null)
        {
            return null;
        }

        return items.FirstOrDefault(item =>
        {
            var value = idProperty.GetValue(item)?.ToString();
            return value == id;
        });
    }

    public async Task CreateAsync(string fileName, T entity)
    {
        await _semaphore.WaitAsync();
        try
        {
            var items = (await GetAllAsync(fileName)).ToList();
            items.Add(entity);
            await SaveAllAsync(fileName, items);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task UpdateAsync(string fileName, string id, T entity)
    {
        await _semaphore.WaitAsync();
        try
        {
            var items = (await GetAllAsync(fileName)).ToList();
            var idProperty = typeof(T).GetProperty("Id");

            if (idProperty == null)
            {
                throw new InvalidOperationException("Entity must have an Id property");
            }

            var index = items.FindIndex(item => idProperty.GetValue(item)?.ToString() == id);

            if (index < 0)
            {
                throw new KeyNotFoundException($"Entity with id {id} not found");
            }

            idProperty.SetValue(entity, id);
            items[index] = entity;
            await SaveAllAsync(fileName, items);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task DeleteAsync(string fileName, string id)
    {
        await _semaphore.WaitAsync();
        try
        {
            var items = (await GetAllAsync(fileName)).ToList();
            var idProperty = typeof(T).GetProperty("Id");

            if (idProperty == null)
            {
                throw new InvalidOperationException("Entity must have an Id property");
            }

            var removed = items.RemoveAll(item => idProperty.GetValue(item)?.ToString() == id);

            if (removed == 0)
            {
                throw new KeyNotFoundException($"Entity with id {id} not found");
            }

            await SaveAllAsync(fileName, items);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private async Task SaveAllAsync(string fileName, List<T> items)
    {
        var filePath = GetFilePath(fileName);
        var json = JsonSerializer.Serialize(items, _jsonOptions);
        await File.WriteAllTextAsync(filePath, json);
    }
}
