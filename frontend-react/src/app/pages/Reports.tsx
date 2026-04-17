import { Calendar, TrendingUp, DollarSign, Target, Download, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const reportDate = {
  current: "2026年04月16日",
  period: "04/01 - 04/15",
  nextReport: "04/30"
};

const topSectors = [
  { 
    sector: "AI晶片", 
    score: 35, 
    growth: 12.5, 
    stocks: ["2330 台積電", "3711 日月光投控", "2454 聯發科"],
    reason: "AI伺服器需求強勁，訂單能見度高",
    volume: "外資連續2週買超"
  },
  { 
    sector: "電動車", 
    score: 32, 
    growth: 8.3, 
    stocks: ["2308 台達電", "1590 亞德客-KY", "2327 國巨"],
    reason: "車用電子滲透率提升，受惠新能源車",
    volume: "投信積極布局"
  },
  { 
    sector: "生技醫療", 
    score: 28, 
    growth: 6.7, 
    stocks: ["6446 藥華藥", "4119 旭富", "6547 高端疫苗"],
    reason: "新藥臨床進展順利，題材面支撐",
    volume: "法人持續關注"
  },
];

const capitalFlow = [
  { 
    stock: "2330 台積電", 
    institutionBuy: 15234, 
    days: 8, 
    avgPrice: 610, 
    currentPrice: 615,
    momentum: "強勢",
    recommendation: "強力買進"
  },
  { 
    stock: "2308 台達電", 
    institutionBuy: 8765, 
    days: 5, 
    avgPrice: 385, 
    currentPrice: 395,
    momentum: "積極",
    recommendation: "買進"
  },
  { 
    stock: "3711 日月光投控", 
    institutionBuy: 6543, 
    days: 7, 
    avgPrice: 145, 
    currentPrice: 152,
    momentum: "穩健",
    recommendation: "買進"
  },
  { 
    stock: "2454 聯發科", 
    institutionBuy: 5432, 
    days: 4, 
    avgPrice: 915, 
    currentPrice: 885,
    momentum: "觀察",
    recommendation: "觀望"
  },
  { 
    stock: "6446 藥華藥", 
    institutionBuy: 4321, 
    days: 6, 
    avgPrice: 520, 
    currentPrice: 535,
    momentum: "積極",
    recommendation: "買進"
  },
];

const sectorPerformance = [
  { sector: "AI晶片", week1: 5.2, week2: 7.3 },
  { sector: "電動車", week1: 3.8, week2: 4.5 },
  { sector: "生技", week1: 2.1, week2: 4.6 },
  { sector: "金融", week1: -0.5, week2: 1.2 },
  { sector: "傳產", week1: 1.2, week2: 0.8 },
];

const institutionTrend = [
  { date: "04/01", foreign: 1200, trust: 580, dealer: -320 },
  { date: "04/02", foreign: 1500, trust: 620, dealer: -280 },
  { date: "04/05", foreign: 1800, trust: 750, dealer: -150 },
  { date: "04/08", foreign: 2100, trust: 890, dealer: -200 },
  { date: "04/09", foreign: 1950, trust: 920, dealer: -180 },
  { date: "04/12", foreign: 2300, trust: 1050, dealer: -240 },
  { date: "04/15", foreign: 2450, trust: 1180, dealer: -300 },
];

export function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">雙週策略報告</h1>
          <p className="text-gray-400">洞察市場趨勢，把握投資機會</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Download className="w-5 h-5" />
          <span>下載報告</span>
        </button>
      </div>

      {/* Report Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl p-6 border border-gray-800 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm opacity-90">報告日期</span>
          </div>
          <div className="text-2xl font-semibold">{reportDate.current}</div>
          <div className="text-sm opacity-90 mt-1">統計期間：{reportDate.period}</div>
        </div>

        <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">市場概況</span>
          </div>
          <div className="text-2xl font-semibold text-green-500">多頭格局</div>
          <div className="text-sm text-gray-400 mt-1">外資、投信同步加碼</div>
        </div>

        <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <Target className="w-5 h-5" />
            <span className="text-sm">下次報告</span>
          </div>
          <div className="text-2xl font-semibold">{reportDate.nextReport}</div>
          <div className="text-sm text-gray-400 mt-1">預計產出時間</div>
        </div>
      </div>

      {/* Top Performing Sectors */}
      <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">強勢族群掃描 Top 3</h2>
          <div className="text-sm text-gray-400">依權重得分排序</div>
        </div>

        <div className="space-y-4">
          {topSectors.map((sector, index) => (
            <div key={sector.sector} className="bg-[#0a0e17] rounded-xl p-6 border border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                    index === 0 ? "bg-gradient-to-br from-yellow-500 to-orange-500" :
                    index === 1 ? "bg-gradient-to-br from-gray-400 to-gray-500" :
                    "bg-gradient-to-br from-orange-600 to-orange-700"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-xl font-semibold mb-1">{sector.sector}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>族群權重：{sector.score} 分</span>
                      <span className="text-green-500">雙週漲幅：+{sector.growth}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-500">{sector.score}</div>
                  <div className="text-sm text-gray-400">分</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <div className="text-sm text-gray-400 mb-2">代表個股</div>
                  <div className="space-y-1">
                    {sector.stocks.map((stock) => (
                      <div key={stock} className="text-sm flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-blue-500" />
                        {stock}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">題材說明</div>
                  <div className="text-sm text-gray-300">{sector.reason}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">資金動向</div>
                  <div className="text-sm">
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded">
                      {sector.volume}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Performance Chart */}
      <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-6">族群雙週表現比較</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sectorPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="sector" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
              labelStyle={{ color: "#9ca3af" }}
            />
            <Bar dataKey="week1" fill="#3b82f6" name="第一週" radius={[4, 4, 0, 0]} />
            <Bar dataKey="week2" fill="#8b5cf6" name="第二週" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Capital Flow Analysis */}
      <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">資金流向分析</h2>
            <p className="text-sm text-gray-400">投信兩週內積極加碼的潛力股</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-500 rounded-lg">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">法人資金持續流入</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-400 font-medium">股票代號</th>
                <th className="text-right p-4 text-gray-400 font-medium">投信買超（張）</th>
                <th className="text-right p-4 text-gray-400 font-medium">連續天數</th>
                <th className="text-right p-4 text-gray-400 font-medium">平均成本</th>
                <th className="text-right p-4 text-gray-400 font-medium">目前價格</th>
                <th className="text-left p-4 text-gray-400 font-medium">動能評估</th>
                <th className="text-left p-4 text-gray-400 font-medium">操作建議</th>
              </tr>
            </thead>
            <tbody>
              {capitalFlow.map((item, index) => (
                <tr key={item.stock} className="border-b border-gray-800 hover:bg-[#0a0e17] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{item.stock}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-green-500 font-medium">+{item.institutionBuy.toLocaleString()}</span>
                  </td>
                  <td className="p-4 text-right">{item.days} 天</td>
                  <td className="p-4 text-right text-gray-400">${item.avgPrice}</td>
                  <td className="p-4 text-right">
                    <span className={item.currentPrice >= item.avgPrice ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      ${item.currentPrice}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      item.momentum === "強勢" ? "bg-green-500/20 text-green-500" :
                      item.momentum === "積極" ? "bg-blue-500/20 text-blue-500" :
                      item.momentum === "穩健" ? "bg-purple-500/20 text-purple-500" :
                      "bg-yellow-500/20 text-yellow-500"
                    }`}>
                      {item.momentum}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded font-medium text-sm ${
                      item.recommendation === "強力買進" ? "bg-green-600 text-white" :
                      item.recommendation === "買進" ? "bg-blue-600 text-white" :
                      "bg-gray-700 text-gray-300"
                    }`}>
                      {item.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institutional Trend */}
      <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-6">三大法人買賣超趨勢（百萬元）</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={institutionTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
              labelStyle={{ color: "#9ca3af" }}
            />
            <Line type="monotone" dataKey="foreign" stroke="#3b82f6" strokeWidth={2} name="外資" />
            <Line type="monotone" dataKey="trust" stroke="#10b981" strokeWidth={2} name="投信" />
            <Line type="monotone" dataKey="dealer" stroke="#ef4444" strokeWidth={2} name="自營商" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary & Recommendations */}
      <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">本期總結與建議</h2>
        <div className="space-y-4">
          <div className="bg-[#0a0e17] p-4 rounded-lg border-l-4 border-blue-500">
            <div className="font-medium mb-2">🎯 市場研判</div>
            <div className="text-sm text-gray-300">
              大盤維持多頭格局，外資與投信同步買超，資金面支撐強勁。建議維持 7-8 成持股水位，積極布局強勢族群。
            </div>
          </div>
          <div className="bg-[#0a0e17] p-4 rounded-lg border-l-4 border-green-500">
            <div className="font-medium mb-2">✅ 操作策略</div>
            <div className="text-sm text-gray-300">
              優先關注 AI晶片、電動車族群龍頭股，搭配生技醫療作為衛星持股。可於回檔時分批佈局，並設定適當停損。
            </div>
          </div>
          <div className="bg-[#0a0e17] p-4 rounded-lg border-l-4 border-yellow-500">
            <div className="font-medium mb-2">⚠️ 風險提示</div>
            <div className="text-sm text-gray-300">
              留意國際政經局勢變化與美國聯準會政策動向，若外資轉賣超應適度調節持股。密切關注個股月線支撐。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
