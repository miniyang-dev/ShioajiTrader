namespace ShioajiTrader.Application.Interfaces;

public interface IFileRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAllAsync(string fileName);
    Task<T?> GetByIdAsync(string fileName, string id);
    Task CreateAsync(string fileName, T entity);
    Task UpdateAsync(string fileName, string id, T entity);
    Task DeleteAsync(string fileName, string id);
}
