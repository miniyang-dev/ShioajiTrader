import { useState } from "react";
import { Search, TrendingUp, DollarSign, Lightbulb, BarChart3, AlertCircle } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// 模擬技術指標數據
const priceData = [
  { date: "03/01", price: 145, ma5: 142, ma20: 140, ma60: 138 },
  { date: "03/08", price: 148, ma5: 144, ma20: 141, ma60: 139 },
  { date: "03/15", price: 152, ma5: 147, ma20: 143, ma60: 140 },
  { date: "03/22", price: 149, ma5: 149, ma20: 145, ma60: 141 },
  { date: "03/29", price: 155, ma5: 151, ma20: 147, ma60: 143 },
  { date: "04/05", price: 158, ma5: 153, ma20: 149, ma60: 145 },
  { date: "04/12", price: 162, ma5: 156, ma20: 152, ma60: 147 },
];

const volumeData = [
  { date: "04/08", volume: 15000, type: "買" },
  { date: "04/09", volume: 12000, type: "買" },
  { date: "04/10", volume: 18000, type: "賣" },
  { date: "04/11", volume: 22000, type: "買" },
  { date: "04/12", volume: 20000, type: "買" },
  { date: "04/15", volume: 16000, type: "買" },
  { date: "04/16", volume: 25000, type: "買" },
];

const institutionalData = [
  { name: "外資", buy: 15234, sell: 8567, net: 6667 },
  { name: "投信", buy: 8765, sell: 3421, net: 5344 },
  { name: "自營商", buy: 4532, sell: 6789, net: -2257 },
];

export function StockAnalysis() {
  const [stockCode, setStockCode] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    // 模擬 API 呼叫
    setTimeout(() => {
      setAnalysisResult({
        stockCode: stockCode || "2330",
        stockName: "台積電",
        currentPrice: 162.5,
        change: 2.5,
        changePercent: 1.56,
        scores: {
          trend: { score: 14, max: 17, items: ["MA多頭排列", "RSI > 50", "MACD黃金交叉"] },
          capital: { score: 7, max: 9, items: ["外資連5買", "投信加碼", "分點主力進場"] },
          theme: { score: 6, max: 8, items: ["AI晶片族群強勢", "產業龍頭"] },
          relative: { score: 5, max: 6, items: ["相對大盤強", "族群領漲"] },
        },
        totalScore: 32,
        rating: "強力買進",
        suggestedPrice: { low: 158, high: 165 },
        stopLoss: 152,
        technicals: {
          rsi: 65.4,
          macd: "多頭",
          kd: { k: 72, d: 68 },
          atr: 3.2,
        },
      });
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">個股分析儀表板</h1>
        <p className="text-gray-400">輸入股票代號或名稱，獲取即時智能分析</p>
      </div>

      {/* Search Box */}
      <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="輸入股票代號或名稱（例如：2330 或 台積電）"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              className="w-full pl-12 pr-4 py-4 bg-[#0a0e17] border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-lg"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg transition-colors font-medium"
          >
            {analyzing ? "分析中..." : "開始分析"}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <>
          {/* Stock Info & Score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stock Basic Info */}
            <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-gray-400 text-sm">股票代號</div>
                  <div className="text-2xl font-semibold mt-1">
                    {analysisResult.stockCode} {analysisResult.stockName}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-400 text-sm">當前價格</div>
                  <div className="text-3xl font-semibold text-green-500">
                    ${analysisResult.currentPrice}
                  </div>
                  <div className="text-green-500 text-sm mt-1">
                    +{analysisResult.change} (+{analysisResult.changePercent}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Total Score */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 border border-gray-800 text-white">
              <div className="text-sm opacity-90 mb-2">綜合評分</div>
              <div className="text-6xl font-bold mb-2">{analysisResult.totalScore}</div>
              <div className="text-sm opacity-90">滿分 40 分</div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-2xl font-semibold">{analysisResult.rating}</div>
              </div>
            </div>

            {/* Suggested Action */}
            <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
              <div className="text-gray-400 text-sm mb-4">操作建議</div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">建議買入區間</div>
                  <div className="text-xl font-semibold text-green-500">
                    ${analysisResult.suggestedPrice.low} - ${analysisResult.suggestedPrice.high}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">停損價位</div>
                  <div className="text-xl font-semibold text-red-500">
                    ${analysisResult.stopLoss}
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-yellow-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>建議停損距離: {analysisResult.technicals.atr}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Score Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">評分細項</h2>
              
              {/* Trend Score */}
              <ScoreCard
                title="趨勢 & 動能"
                score={analysisResult.scores.trend.score}
                maxScore={analysisResult.scores.trend.max}
                icon={<TrendingUp className="w-5 h-5" />}
                items={analysisResult.scores.trend.items}
                color="blue"
              />

              {/* Capital Score */}
              <ScoreCard
                title="資金面"
                score={analysisResult.scores.capital.score}
                maxScore={analysisResult.scores.capital.max}
                icon={<DollarSign className="w-5 h-5" />}
                items={analysisResult.scores.capital.items}
                color="green"
              />

              {/* Theme Score */}
              <ScoreCard
                title="題材面"
                score={analysisResult.scores.theme.score}
                maxScore={analysisResult.scores.theme.max}
                icon={<Lightbulb className="w-5 h-5" />}
                items={analysisResult.scores.theme.items}
                color="purple"
              />

              {/* Relative Score */}
              <ScoreCard
                title="相對強弱"
                score={analysisResult.scores.relative.score}
                maxScore={analysisResult.scores.relative.max}
                icon={<BarChart3 className="w-5 h-5" />}
                items={analysisResult.scores.relative.items}
                color="orange"
              />
            </div>

            {/* Right: Technical Indicators */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">技術指標詳情</h2>
              
              <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold mb-4">關鍵指標</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a0e17] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">RSI</div>
                    <div className="text-2xl font-semibold text-green-500">
                      {analysisResult.technicals.rsi}
                    </div>
                  </div>
                  <div className="bg-[#0a0e17] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">MACD</div>
                    <div className="text-2xl font-semibold text-green-500">
                      {analysisResult.technicals.macd}
                    </div>
                  </div>
                  <div className="bg-[#0a0e17] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">KD (K/D)</div>
                    <div className="text-2xl font-semibold text-green-500">
                      {analysisResult.technicals.kd.k}/{analysisResult.technicals.kd.d}
                    </div>
                  </div>
                  <div className="bg-[#0a0e17] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">ATR</div>
                    <div className="text-2xl font-semibold">
                      {analysisResult.technicals.atr}
                    </div>
                  </div>
                </div>
              </div>

              {/* Institutional Investors */}
              <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold mb-4">三大法人買賣超（千股）</h3>
                <div className="space-y-3">
                  {institutionalData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg">
                      <div className="font-medium">{item.name}</div>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-gray-400">買：</span>
                          <span className="text-green-500">{item.buy.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">賣：</span>
                          <span className="text-red-500">{item.sell.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">淨額：</span>
                          <span className={item.net >= 0 ? "text-green-500" : "text-red-500"}>
                            {item.net >= 0 ? "+" : ""}{item.net.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Chart */}
            <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
              <h3 className="font-semibold mb-4">價格走勢 & 均線</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#9ca3af" }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} name="股價" />
                  <Line type="monotone" dataKey="ma5" stroke="#10b981" strokeWidth={1.5} name="MA5" />
                  <Line type="monotone" dataKey="ma20" stroke="#f59e0b" strokeWidth={1.5} name="MA20" />
                  <Line type="monotone" dataKey="ma60" stroke="#8b5cf6" strokeWidth={1.5} name="MA60" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Volume Chart */}
            <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
              <h3 className="font-semibold mb-4">成交量分析</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#9ca3af" }}
                  />
                  <Bar dataKey="volume" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  icon: React.ReactNode;
  items: string[];
  color: "blue" | "green" | "purple" | "orange";
}

function ScoreCard({ title, score, maxScore, icon, items, color }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  const colorClasses = {
    blue: "from-blue-600 to-blue-400",
    green: "from-green-600 to-green-400",
    purple: "from-purple-600 to-purple-400",
    orange: "from-orange-600 to-orange-400",
  };

  return (
    <div className="bg-[#13161f] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-br ${colorClasses[color]} rounded-lg text-white`}>
            {icon}
          </div>
          <div>
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-gray-400">{score} / {maxScore} 分</div>
          </div>
        </div>
        <div className="text-2xl font-bold">{score}</div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
