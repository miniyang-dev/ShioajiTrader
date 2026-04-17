import { useState } from "react";
import { Search, TrendingUp, DollarSign, Lightbulb, BarChart3, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Skeleton, ChartSkeleton, CardSkeleton } from "../components/LoadingSkeleton";
import { "../../styles/theme.css";

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
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">個股分析</h1>
      </div>

      {/* Search Box */}
      <div className="bg-[#13161f] rounded-lg p-4 border border-gray-800 shadow-card transition-spring hover-lift">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="輸入股票代號或名稱"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e17] border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-spring"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-spring btn-press"
          >
            {analyzing ? "分析中..." : "分析"}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {analyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-4"><Skeleton height="120px" /></div>
          <CardSkeleton />
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && !analyzing && (
        <>
          {/* Stock Info & Score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Stock Basic Info */}
            <div className="bg-[#13161f] rounded-lg p-4 border border-gray-800 shadow-card transition-spring hover-lift">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-gray-400 text-xs">股票</div>
                  <div className="text-xl font-semibold tabular-nums">
                    {analysisResult.stockCode} {analysisResult.stockName}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-bold text-green-500 tabular-nums">
                  ${analysisResult.currentPrice}
                </div>
                <div className="text-green-500 text-sm tabular-nums">
                  +{analysisResult.change} (+{analysisResult.changePercent}%)
                </div>
              </div>
            </div>

            {/* Total Score */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg p-4 text-white shadow-card transition-spring hover-lift">
              <div className="text-xs opacity-90 mb-1">綜合評分</div>
              <div className="text-5xl font-bold tabular-nums">{analysisResult.totalScore}</div>
              <div className="text-xs opacity-90">滿分 40 分</div>
              <div className="mt-2 pt-2 border-t border-white/20">
                <div className="text-lg font-semibold">{analysisResult.rating}</div>
              </div>
            </div>

            {/* Suggested Action */}
            <div className="bg-[#13161f] rounded-lg p-4 border border-gray-800 shadow-card transition-spring hover-lift">
              <div className="text-gray-400 text-xs mb-3">操作建議</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-400">買入區間</div>
                  <div className="text-sm font-semibold text-green-500 tabular-nums">
                    ${analysisResult.suggestedPrice.low}-${analysisResult.suggestedPrice.high}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">停損價位</div>
                  <div className="text-sm font-semibold text-red-500 tabular-nums">
                    ${analysisResult.stopLoss}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-yellow-500 text-xs">
                <AlertCircle className="w-3 h-3" />
                <span>停損距離: {analysisResult.technicals.atr}%</span>
              </div>
            </div>
          </div>

          {/* Score Breakdown & Technicals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Score Details */}
            <div className="grid grid-cols-2 gap-3">
              <ScoreCardCompact
                title="趨勢"
                score={analysisResult.scores.trend.score}
                maxScore={analysisResult.scores.trend.max}
                icon={<TrendingUp className="w-4 h-4" />}
                color="blue"
              />
              <ScoreCardCompact
                title="資金"
                score={analysisResult.scores.capital.score}
                maxScore={analysisResult.scores.capital.max}
                icon={<DollarSign className="w-4 h-4" />}
                color="green"
              />
              <ScoreCardCompact
                title="題材"
                score={analysisResult.scores.theme.score}
                maxScore={analysisResult.scores.theme.max}
                icon={<Lightbulb className="w-4 h-4" />}
                color="purple"
              />
              <ScoreCardCompact
                title="強弱"
                score={analysisResult.scores.relative.score}
                maxScore={analysisResult.scores.relative.max}
                icon={<BarChart3 className="w-4 h-4" />}
                color="orange"
              />
            </div>

            {/* Technical Indicators & Institutional */}
            <div className="space-y-3">
              {/* Technical */}
              <div className="bg-[#13161f] rounded-lg p-3 border border-gray-800 shadow-card transition-spring hover-lift">
                <h3 className="text-sm font-semibold mb-2">技術指標</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-[#0a0e17] p-2 rounded text-center transition-spring hover:bg-[#1a1f2e]">
                    <div className="text-xs text-gray-400">RSI</div>
                    <div className="text-sm font-semibold text-green-500 tabular-nums">{analysisResult.technicals.rsi}</div>
                  </div>
                  <div className="bg-[#0a0e17] p-2 rounded text-center transition-spring hover:bg-[#1a1f2e]">
                    <div className="text-xs text-gray-400">MACD</div>
                    <div className="text-sm font-semibold text-green-500">{analysisResult.technicals.macd}</div>
                  </div>
                  <div className="bg-[#0a0e17] p-2 rounded text-center transition-spring hover:bg-[#1a1f2e]">
                    <div className="text-xs text-gray-400">KD</div>
                    <div className="text-sm font-semibold tabular-nums">{analysisResult.technicals.kd.k}/{analysisResult.technicals.kd.d}</div>
                  </div>
                  <div className="bg-[#0a0e17] p-2 rounded text-center transition-spring hover:bg-[#1a1f2e]">
                    <div className="text-xs text-gray-400">ATR</div>
                    <div className="text-sm font-semibold tabular-nums">{analysisResult.technicals.atr}</div>
                  </div>
                </div>
              </div>

              {/* Institutional */}
              <div className="bg-[#13161f] rounded-lg p-3 border border-gray-800 shadow-card transition-spring hover-lift">
                <h3 className="text-sm font-semibold mb-2">三大法人（千股）</h3>
                <div className="space-y-1.5">
                  {institutionalData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs transition-spring hover:bg-[#0a0e17] p-1 -mx-1 rounded">
                      <span className="font-medium w-12">{item.name}</span>
                      <span className="text-green-500 tabular-nums">{item.buy.toLocaleString()}</span>
                      <span className="text-red-500 tabular-nums">{item.sell.toLocaleString()}</span>
                      <span className={item.net >= 0 ? "text-green-500 tabular-nums" : "text-red-500 tabular-nums"}>
                        {item.net >= 0 ? "+" : ""}{item.net.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#13161f] rounded-lg p-3 border border-gray-800 shadow-card transition-spring hover-lift">
              <h3 className="text-sm font-semibold mb-2">價格走勢</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "6px", fontSize: 12 }} />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="ma5" stroke="#10b981" strokeWidth={1} />
                  <Line type="monotone" dataKey="ma20" stroke="#f59e0b" strokeWidth={1} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-[#13161f] rounded-lg p-3 border border-gray-800 shadow-card transition-spring hover-lift">
              <h3 className="text-sm font-semibold mb-2">成交量</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "6px", fontSize: 12 }} />
                  <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface ScoreCardCompactProps {
  title: string;
  score: number;
  maxScore: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}

function ScoreCardCompact({ title, score, maxScore, icon, color }: ScoreCardCompactProps) {
  const percentage = (score / maxScore) * 100;
  const colorClasses = {
    blue: "from-blue-600 to-blue-400",
    green: "from-green-600 to-green-400",
    purple: "from-purple-600 to-purple-400",
    orange: "from-orange-600 to-orange-400",
  };
  const bgClasses = {
    blue: "bg-blue-600/20 border-blue-600/30",
    green: "bg-green-600/20 border-green-600/30",
    purple: "bg-purple-600/20 border-purple-600/30",
    orange: "bg-orange-600/20 border-orange-600/30",
  };

  return (
    <div className={`rounded-lg p-3 border shadow-card transition-spring hover-lift ${bgClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1 bg-gradient-to-br ${colorClasses[color]} rounded text-white`}>
            {icon}
          </div>
          <span className="text-xs font-medium">{title}</span>
        </div>
        <span className="text-lg font-bold tabular-nums">{score}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
