import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const portfolioData = [
  { date: "03/01", total: 985000, daily: 0 },
  { date: "03/08", total: 1020000, daily: 35000 },
  { date: "03/15", total: 998000, daily: -22000 },
  { date: "03/22", total: 1085000, daily: 87000 },
  { date: "03/29", total: 1120000, daily: 35000 },
  { date: "04/05", total: 1150000, daily: 30000 },
  { date: "04/12", total: 1180000, daily: 30000 },
  { date: "04/16", total: 1234567, daily: 54567 },
];

const positions = [
  { code: "2330", name: "台積電", qty: 1000, avg: 610, cur: 615, pnl: 5000, pct: 4.15, side: "long" },
  { code: "2308", name: "台達電", qty: 500, avg: 385, cur: 395, pnl: 5000, pct: 2.60, side: "long" },
  { code: "3711", name: "日月光", qty: 300, avg: 145, cur: 152, pnl: 2100, pct: 4.83, side: "long" },
  { code: "2454", name: "聯發科", qty: 200, avg: 920, cur: 885, pnl: -7000, pct: -3.80, side: "short" },
  { code: "2618", name: "開發金", qty: 1000, avg: 13.2, cur: 13.85, pnl: 650, pct: 4.92, side: "long" },
];

const recentTrades = [
  { time: "04/16 15:32", action: "買入", code: "2330", qty: 100, price: 614, side: "long" },
  { time: "04/15 14:20", action: "賣出", code: "2308", qty: 50, price: 392, side: "long" },
  { time: "04/14 10:15", action: "買入", code: "3711", qty: 100, price: 148, side: "long" },
  { time: "04/12 09:30", action: "買入", code: "2454", qty: 200, price: 920, side: "short" },
];

const strategyPerf = [
  { strategy: "趨勢追蹤", return: 8.5, dd: -2.1, sharpe: 1.8 },
  { strategy: "價值投資", return: 5.2, dd: -1.5, sharpe: 2.1 },
  { strategy: "區間操作", return: 3.8, dd: -0.8, sharpe: 2.5 },
];

export function Portfolio() {
  const [selectedPos, setSelectedPos] = useState<any>(null);

  const totalValue = 1234567;
  const totalCost = 1180000;
  const totalPnl = totalValue - totalCost;
  const pnlPct = (totalPnl / totalCost) * 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">帳務總覽</h1>
        <div className="text-xs text-gray-400">更新時間: 2026/04/16 15:32</div>
      </div>

      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#13161f] rounded-lg p-3 border border-gray-800">
          <div className="text-xs text-gray-400 mb-1">總市值</div>
          <div className="text-xl font-bold">${totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-[#13161f] rounded-lg p-3 border border-gray-800">
          <div className="text-xs text-gray-400 mb-1">成本</div>
          <div className="text-xl font-bold">${totalCost.toLocaleString()}</div>
        </div>
        <div className="bg-green-600/20 rounded-lg p-3 border border-green-600/30">
          <div className="text-xs text-green-400 mb-1">總損益</div>
          <div className="text-xl font-bold text-green-500">
            +${totalPnl.toLocaleString()}
          </div>
          <div className="text-xs text-green-400">+{pnlPct.toFixed(2)}%</div>
        </div>
        <div className="bg-[#13161f] rounded-lg p-3 border border-gray-800">
          <div className="text-xs text-gray-400 mb-1">持有倉位</div>
          <div className="text-xl font-bold">{positions.length}</div>
          <div className="text-xs text-gray-400">4 多 / 1 空</div>
        </div>
      </div>

      {/* Main Content - 2 Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Portfolio Value Chart */}
        <div className="lg:col-span-2 bg-[#13161f] rounded-lg p-3 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">帳務走勢</h2>
            <div className="flex gap-1">
              <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded">日</button>
              <button className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">週</button>
              <button className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">月</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "6px", fontSize: 11 }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, "市值"]}
              />
              <Area type="monotone" dataKey="total" stroke="#22c55e" fill="url(#pnlGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Strategy Performance */}
        <div className="bg-[#13161f] rounded-lg p-3 border border-gray-800">
          <h2 className="text-sm font-semibold mb-2">策略表現</h2>
          <div className="space-y-2">
            {strategyPerf.map((s) => (
              <div key={s.strategy} className="bg-[#0a0e17] rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{s.strategy}</span>
                  <span className="text-xs text-green-500">+{s.return}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">MDD: </span>
                    <span className="text-red-400">-{s.dd}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Sharpe: </span>
                    <span>{s.sharpe}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Positions Table - Compact */}
      <div className="bg-[#13161f] rounded-lg border border-gray-800">
        <div className="p-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold">持有倉位</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left p-2">股票</th>
                <th className="text-right p-2">數量</th>
                <th className="text-right p-2">均價</th>
                <th className="text-right p-2">現價</th>
                <th className="text-right p-2">成本</th>
                <th className="text-right p-2">市值</th>
                <th className="text-right p-2">損益</th>
                <th className="text-right p-2">報酬率</th>
                <th className="text-center p-2">方向</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.code} className="border-b border-gray-800/50 hover:bg-[#0a0e17] cursor-pointer" onClick={() => setSelectedPos(pos)}>
                  <td className="p-2">
                    <div className="font-semibold">{pos.code}</div>
                    <div className="text-gray-400 text-xs">{pos.name}</div>
                  </td>
                  <td className="text-right p-2 font-variant-numeric">{pos.qty}</td>
                  <td className="text-right p-2 text-gray-400 font-variant-numeric">${pos.avg}</td>
                  <td className="text-right p-2 font-semibold font-variant-numeric">${pos.cur}</td>
                  <td className="text-right p-2 text-gray-400 font-variant-numeric">${(pos.qty * pos.avg).toLocaleString()}</td>
                  <td className="text-right p-2 font-variant-numeric">${(pos.qty * pos.cur).toLocaleString()}</td>
                  <td className={`text-right p-2 font-semibold font-variant-numeric ${pos.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toLocaleString()}
                  </td>
                  <td className={`text-right p-2 font-semibold ${pos.pct >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {pos.pct >= 0 ? "+" : ""}{pos.pct.toFixed(2)}%
                  </td>
                  <td className="text-center p-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${pos.side === "long" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                      {pos.side === "long" ? "多" : "空"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-[#13161f] rounded-lg border border-gray-800">
        <div className="p-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold">近期成交</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {recentTrades.map((t, i) => (
            <div key={i} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{t.time}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${t.action === "買入" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                  {t.action}
                </span>
                <span className="font-medium">{t.code}</span>
              </div>
              <div className="text-right">
                <div className="text-xs">{t.qty} 股 @ ${t.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
