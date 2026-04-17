import { Calendar, TrendingUp, DollarSign, Target, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const reportDate = {
  current: "2026年04月16日",
  period: "04/01 - 04/15",
  nextReport: "04/30"
};

const topSectors = [
  { sector: "AI晶片", score: 35, growth: 12.5, stocks: ["2330 台積電", "3711 日月光", "2454 聯發科"], reason: "AI伺服器需求強勁", volume: "外資連2週買超" },
  { sector: "電動車", score: 32, growth: 8.3, stocks: ["2308 台達電", "1590 亞德客", "2327 國巨"], reason: "車用電子滲透率提升", volume: "投信積極布局" },
  { sector: "生技醫療", score: 28, growth: 6.7, stocks: ["6446 藥華藥", "4119 旭富", "6547 高端"], reason: "新藥臨床進展順利", volume: "法人持續關注" },
];

const capitalFlow = [
  { stock: "2330 台積電", buy: 15234, days: 8, avg: 610, cur: 615, mom: "強勢", rec: "強力買進" },
  { stock: "2308 台達電", buy: 8765, days: 5, avg: 385, cur: 395, mom: "積極", rec: "買進" },
  { stock: "3711 日月光", buy: 6543, days: 7, avg: 145, cur: 152, mom: "穩健", rec: "買進" },
  { stock: "2454 聯發科", buy: 5432, days: 4, avg: 915, cur: 885, mom: "觀察", rec: "觀望" },
  { stock: "6446 藥華藥", buy: 4321, days: 6, avg: 520, cur: 535, mom: "積極", rec: "買進" },
];

const sectorPerf = [
  { sector: "AI", w1: 5.2, w2: 7.3 },
  { sector: "車", w1: 3.8, w2: 4.5 },
  { sector: "生", w1: 2.1, w2: 4.6 },
  { sector: "金", w1: -0.5, w2: 1.2 },
  { sector: "傳", w1: 1.2, w2: 0.8 },
];

const instTrend = [
  { d: "04/01", f: 1200, t: 580, z: -320 },
  { d: "04/08", f: 2100, t: 890, z: -200 },
  { d: "04/12", f: 2300, t: 1050, z: -240 },
  { d: "04/15", f: 2450, t: 1180, z: -300 },
];

export function Reports() {
  return (
    <div className="space-y-4">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">雙週策略報告</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
          <Download className="w-4 h-4" />
          下載
        </button>
      </div>

      {/* Report Info - Compact Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3 h-3" />
            <span className="text-xs opacity-90">報告日期</span>
          </div>
          <div className="text-lg font-semibold">{reportDate.current}</div>
          <div className="text-xs opacity-90">{reportDate.period}</div>
        </div>
        <div className="bg-[#13161f] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-1 text-gray-400">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs">市場</span>
          </div>
          <div className="text-lg font-semibold text-green-500">多頭格局</div>
        </div>
        <div className="bg-[#13161f] rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-1 text-gray-400">
            <Target className="w-3 h-3" />
            <span className="text-xs">下次報告</span>
          </div>
          <div className="text-lg font-semibold">{reportDate.nextReport}</div>
        </div>
      </div>

      {/* Top Sectors - Compact */}
      <div className="bg-[#13161f] rounded-lg border border-gray-800">
        <div className="p-3 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-sm font-semibold">強勢族群 Top 3</h2>
          <span className="text-xs text-gray-400">依權重排序</span>
        </div>
        <div className="divide-y divide-gray-800">
          {topSectors.map((s, i) => (
            <div key={s.sector} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : "bg-orange-600"
                  } text-white`}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{s.sector}</div>
                    <div className="text-xs text-green-500">+{s.growth}%</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-500">{s.score}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-400 mb-1">個股</div>
                  <div className="text-gray-300 truncate">{s.stocks[0]}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">題材</div>
                  <div className="text-gray-300 truncate">{s.reason}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">資金</div>
                  <div className="text-green-500">{s.volume}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts - 2 Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#13161f] rounded-lg p-3 border border-gray-800">
          <h3 className="text-sm font-semibold mb-2">族群表現</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={sectorPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="sector" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "4px", fontSize: 11 }} />
              <Bar dataKey="w1" fill="#3b82f6" name="W1" radius={[2, 2, 0, 0]} />
              <Bar dataKey="w2" fill="#8b5cf6" name="W2" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#13161f] rounded-lg p-3 border border-gray-800">
          <h3 className="text-sm font-semibold mb-2">法人趨勢</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={instTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="d" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "4px", fontSize: 11 }} />
              <Line type="monotone" dataKey="f" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="t" stroke="#10b981" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Capital Flow Table - Compact */}
      <div className="bg-[#13161f] rounded-lg border border-gray-800">
        <div className="p-3 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-sm font-semibold">資金流向</h2>
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs">
            <DollarSign className="w-3 h-3" />
            法人持續流入
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left p-2">股票</th>
                <th className="text-right p-2">投信買超</th>
                <th className="text-right p-2">天數</th>
                <th className="text-right p-2">成本</th>
                <th className="text-right p-2">現價</th>
                <th className="text-left p-2">動能</th>
                <th className="text-left p-2">建議</th>
              </tr>
            </thead>
            <tbody>
              {capitalFlow.map((item, i) => (
                <tr key={item.stock} className="border-b border-gray-800/50 hover:bg-[#0a0e17]">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{i + 1}</span>
                      <span className="font-medium">{item.stock}</span>
                    </div>
                  </td>
                  <td className="text-right p-2 text-green-500">+{item.buy.toLocaleString()}</td>
                  <td className="text-right p-2">{item.days}天</td>
                  <td className="text-right p-2 text-gray-400">${item.avg}</td>
                  <td className="text-right p-2 font-semibold">${item.cur}</td>
                  <td className="p-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      item.mom === "強勢" ? "bg-green-500/20 text-green-500" :
                      item.mom === "積極" ? "bg-blue-500/20 text-blue-500" : "bg-yellow-500/20 text-yellow-500"
                    }`}>{item.mom}</span>
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.rec === "強力買進" ? "bg-green-600 text-white" : "bg-blue-600 text-white"
                    }`}>{item.rec}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary - Compact */}
      <div className="bg-[#13161f] rounded-lg p-4 border border-gray-800">
        <h2 className="text-sm font-semibold mb-3">本期總結</h2>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">●</span>
            <div>
              <span className="font-medium">市場研判：</span>
              <span className="text-gray-400">外資、投信同步買超，資金面支撐強勁。建議維持 7-8 成持股。</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">●</span>
            <div>
              <span className="font-medium">操作策略：</span>
              <span className="text-gray-400">優先布局 AI晶片、車電族群，搭配生技衛星持股。</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5">●</span>
            <div>
              <span className="font-medium">風險提示：</span>
              <span className="text-gray-400">留意 Fed 政策與外資動向，關注月線支撐。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
