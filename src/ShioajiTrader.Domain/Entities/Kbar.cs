namespace ShioajiTrader.Domain.Entities;

public class Kbar
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string StockCode { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal Open { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Close { get; set; }
    public long Volume { get; set; }
}
