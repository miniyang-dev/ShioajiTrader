import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, AlertTriangle, CheckCircle, Plus, Trash2 } from "lucide-react";

const marketStatus = {
  trend: "多頭",
  status: "強勢",
  recommendation: "可維持 7-8 成持股",
  description: "大盤處於多頭排列，建議積極持股"
};

const holdings = [
  { 
    id: 1,
    symbol: "2330", 
    name: "台積電", 
    shares: 10, 
    avgCost: 580, 
    currentPrice: 615,
    value: 6150,
    profit: 350,
    profitPercent: 6.03,
    stopLoss: 560,
    status: "健康",
    signals: ["價格站穩月線", "外資持續買超"],
    warnings: []
  },
  { 
    id: 2,
    symbol: "2454", 
    name: "聯發科", 
    shares: 5, 
    avgCost: 920, 
    currentPrice: 885,
    value: 4425,
    profit: -175,
    profitPercent: -3.80,
    stopLoss: 880,
    status: "警示",
    signals: [],
    warnings: ["接近停損價", "投信連續賣超"]
  },
  { 
    id: 3,
    symbol: "2317", 
    name: "鴻海", 
    shares: 20, 
    avgCost: 105, 
    currentPrice: 112,
    value: 2240,
    profit: 140,
    profitPercent: 6.67,
    stopLoss: 100,
    status: "健康",
    signals: ["突破季線壓力", "法人買超"],
    warnings: []
  },
  { 
    id: 4,
    symbol: "2882", 
    name: "國泰金", 
    shares: 15, 
    avgCost: 62, 
    currentPrice: 58,
    value: 870,
    profit: -60,
    profitPercent: -6.45,
    stopLoss: 56,
    status: "注意",
    signals: [],
    warnings: ["跌破月線支撐"]
  },
];

const performanceData = [
  { date: "1月", value: 12500 },
  { date: "2月", value: 12800 },
  { date: "3月", value: 12300 },
  { date: "4月", value: 13685 },
];

const alerts = [
  { 
    id: 1, 
    type: "warning", 
    stock: "2454 聯發科", 
    message: "即將觸及停損價位 $880，目前價格 $885", 
    time: "2小時前" 
  },
  { 
    id: 2, 
    type: "info", 
    stock: "2330 台積電", 
    message: "外資連續5日買超，累計買超 15,234 張", 
    time: "5小時前" 
  },
  { 
    id: 3, 
    type: "warning", 
    stock: "2882 國泰金", 
    message: "跌破20日均線，投信轉為賣超", 
    time: "1天前" 
  },
];

export function Portfolio() {
  const [showAddStock, setShowAddStock] = useState(false);

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalProfit = holdings.reduce((sum, h) => sum + h.profit, 0);
  const totalProfitPercent = (totalProfit / (totalValue - totalProfit)) * 100;

  const healthyCount = holdings.filter(h => h.status === "健康").length;
  const warningCount = holdings.filter(h => h.status === "警示" || h.status === "注意").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">持股管理與監控</h1>
          <p className="text-gray-400">追蹤您的投資組合，即時健檢與警示</p>
        </div>
        <button 
          onClick={() => setShowAddStock(true)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新增持股</span>
        </button>
      </div>

      {/* Market Environment */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 border border-gray-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90 mb-1">大盤環境分析</div>
            <div className="text-3xl font-semibold mb-2">{marketStatus.trend} - {marketStatus.status}</div>
            <div className="text-lg opacity-90">{marketStatus.description}</div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90 mb-1">持股水位建議</div>
            <div className="text-2xl font-semibold">{marketStatus.recommendation}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">總持股市值</span>
            <Wallet className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-semibold mb-1">${totalValue.toLocaleString()}</div>
          <div className={`text-sm flex items-center gap-1 ${totalProfitPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
            {totalProfitPercent >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {totalProfitPercent >= 0 ? "+" : ""}{totalProfitPercent.toFixed(2)}%
          </div>
        </div>

        <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">未實現損益</span>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className={`text-3xl font-semibold mb-1 ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
            {totalProfit >= 0 ? "+" : ""}${totalProfit.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">總損益</div>
        </div>

        <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">持股健康狀態</span>
            <CheckCircle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-semibold mb-1 text-green-500">{healthyCount}</div>
          <div className="text-sm text-gray-400">健康 / {holdings.length} 檔</div>
        </div>

        <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">需要關注</span>
            <AlertTriangle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-semibold mb-1 text-yellow-500">{warningCount}</div>
          <div className="text-sm text-gray-400">警示 / 注意</div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-[#13161f] rounded-xl p-6 border border-yellow-500/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">即時警示 ({alerts.length})</h2>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border ${
                  alert.type === "warning" 
                    ? "bg-yellow-500/10 border-yellow-500/30" 
                    : "bg-blue-500/10 border-blue-500/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium mb-1">{alert.stock}</div>
                    <div className="text-sm text-gray-300">{alert.message}</div>
                  </div>
                  <div className="text-sm text-gray-400">{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-[#13161f] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">投資組合績效</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">1月</button>
              <button className="px-3 py-1 text-sm bg-blue-600 rounded-lg">3月</button>
              <button className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">1年</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                labelStyle={{ color: "#9ca3af" }}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#portfolioGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">快速操作建議</h2>
          <div className="space-y-3">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">建議減碼</span>
              </div>
              <div className="text-sm text-gray-300">2454 聯發科接近停損</div>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">持續觀察</span>
              </div>
              <div className="text-sm text-gray-300">2882 國泰金跌破月線</div>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-500 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">持續持有</span>
              </div>
              <div className="text-sm text-gray-300">2330 台積電趨勢良好</div>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-[#13161f] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">持股明細</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-400 font-medium">股票</th>
                <th className="text-right p-4 text-gray-400 font-medium">持有股數</th>
                <th className="text-right p-4 text-gray-400 font-medium">成本價</th>
                <th className="text-right p-4 text-gray-400 font-medium">現價</th>
                <th className="text-right p-4 text-gray-400 font-medium">市值</th>
                <th className="text-right p-4 text-gray-400 font-medium">損益</th>
                <th className="text-right p-4 text-gray-400 font-medium">停損價</th>
                <th className="text-left p-4 text-gray-400 font-medium">健檢狀態</th>
                <th className="text-center p-4 text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.id} className="border-b border-gray-800 hover:bg-[#0a0e17] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">{holding.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{holding.symbol}</div>
                        <div className="text-sm text-gray-400">{holding.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">{holding.shares.toLocaleString()}</td>
                  <td className="p-4 text-right text-gray-400">${holding.avgCost}</td>
                  <td className="p-4 text-right font-medium">${holding.currentPrice}</td>
                  <td className="p-4 text-right font-medium">${holding.value.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className={holding.profit >= 0 ? "text-green-500" : "text-red-500"}>
                      <div className="font-medium">
                        {holding.profit >= 0 ? "+" : ""}${holding.profit}
                      </div>
                      <div className="text-sm flex items-center justify-end gap-1">
                        {holding.profitPercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {holding.profitPercent >= 0 ? "+" : ""}{holding.profitPercent.toFixed(2)}%
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right text-red-500 font-medium">${holding.stopLoss}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        holding.status === "健康" ? "bg-green-500/20 text-green-500" :
                        holding.status === "警示" ? "bg-red-500/20 text-red-500" :
                        "bg-yellow-500/20 text-yellow-500"
                      }`}>
                        {holding.status}
                      </span>
                      {holding.signals.map((signal, idx) => (
                        <div key={idx} className="text-xs text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {signal}
                        </div>
                      ))}
                      {holding.warnings.map((warning, idx) => (
                        <div key={idx} className="text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {warning}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}