# ShioajiTrader - 台股追蹤系統

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-purple)
![Vue](https://img.shields.io/badge/Vue-3-green)

基於 **Sinopac Shioaji API** 的台股追蹤系統，使用 .NET 8 + Vue 3 打造。

---

## 📁 專案結構

```
ShioajiTrader/
├── src/                          # .NET 8 後端（Clean Architecture）
│   ├── ShioajiTrader.Api/        # API 入口、Web API Controllers
│   ├── ShioajiTrader.Application/  # 應用層（Services, DTOs, Interfaces）
│   ├── ShioajiTrader.Domain/    # 領域層（Entities: User, Stock, Order, Kbar）
│   ├── ShioajiTrader.Infrastructure/  # 基礎設施（Repositories, Cache, ShioajiClient）
│   └── ShioajiTrader.Presentation/  # 展示層（保留，未使用）
├── frontend/                     # Vue 3 前端
│   ├── src/
│   │   ├── components/           # StockChart, StockCard
│   │   ├── pages/               # LoginPage, DashboardPage
│   │   ├── services/           # api.js（SSE 即時報價）
│   │   └── router/             # Vue Router
│   ├── dist/                    # 編譯後的前端靜態檔案
│   └── package.json
├── src.data/                     # JSON 資料存放（使用者、股票、訂單）
├── ShioajiTrader.sln             # .NET 解決方案
├── Dockerfile                    # Docker 建置腳本
└── README.md                      # 本說明文件
```

---

## ⚡️ 功能列表

### 後端功能

| 功能 | API 端點 | 說明 |
|------|----------|------|
| **Shioaji 登入** | `POST /api/auth/login` | JWT Token 核發 |
| **股票查詢** | `GET /api/stocks/{code}` | 取得個股報價 |
| **K線資料** | `GET /api/stocks/{code}/kbars` | 歷史K線（未實作）|
| **即時報價** | `GET /api/stocks/{code}/stream` | SSE 串流 |
| **追蹤清單** | `GET/POST/DELETE /api/stocks` | 股票追蹤 CRUD |
| **會員資料** | `GET/PUT /api/users/me` | 會員管理 |
| **市價單** | `POST /api/orders/market` | 市場委託 |
| **限價單** | `POST /api/orders/limit` | 限價委託 |
| **取消委託** | `POST /api/orders/{id}/cancel` | 委託管理 |
| **當日統計** | `GET /api/orders/today` | 成交統計 |
| **健康檢查** | `GET /health` | 服務狀態 |

### 前端功能

| 功能 | 說明 |
|------|------|
| **Deep Sea Dark** | 科技感暗色調主題 |
| **Glassmorphism** | 毛玻璃透明卡片 |
| **股票閃爍動畫** | 紅/綠漲跌即時顯示 |
| **Skeleton Loading** | 骨架屏載入體驗 |
| **TradingView K線** | 蠟燭圖 + 成交量 |
| **SSE 即時更新** | 即時股價串流 |
| **JWT 認證** | 登入/登出/保護路由 |

---

## 🔧 環境設定

### 前置需求（必要）

| 項目 | 版本 | 說明 |
|------|------|------|
| .NET SDK | 8.0+ | [下載](https://dotnet.microsoft.com/download/dotnet/8.0) |
| Node.js | 18+ | [下載](https://nodejs.org/) |
| pnpm | 最新版 | `npm install -g pnpm` |
| **Python** | 3.9+ | rshioaji 需要 |
| **rshioaji** | 最新版 | **必要元件**，股票 API 服務 |

### 本地開發

```bash
# 1. 安裝 rshioaji（必要）
pip install rshioaji

# 2. 啟動 rshioaji 服務（保持運行）
shioaji server start

# 3. 新開終端，還原 NuGet 套件
dotnet restore

# 4. 啟動後端（Port 5000）
dotnet run --project src/ShioajiTrader.Api

# 5. 再新開終端，啟動前端開發伺服器（Port 5173）
cd frontend
pnpm install
pnpm dev
```

> ⚠️ **重要**：`shioaji server start` 必須保持運行，否則 API 會回傳 502 Bad Gateway

### Docker 部署（Zeabur）

> ⚠️ **注意**：Docker 容器內的 API 仍需要連線到 rshioaji 服務。
> 請確保 rshioaji 服務已啟動，或修改 `Shioaji:BaseUrl` 指向外部服務。

```bash
# 1. 建置映像
docker build -t shioajitrader .

# 2. 運行容器
docker run -d -p 5000:5000 --name shioajitrader shioajitrader

# 3. 開啟瀏覽器
# http://localhost:5000
```

### Zeabur Git 部署

1. 將 `Dockerfile` 和 `.dockerignore` 推送到 GitHub
2. 在 Zeabur 建立新服務，選擇「從 GitHub 部署」
3. 選擇 `miniyang-dev/ShioajiTrader` repo
4. Zeabur 自動偵測 Dockerfile 並建置

---

## ⚙️ 環境變數

### Zeabur 部署（必要）

在 Zeabur 設定以下環境變數：

| 變數 | 預設值 | 說明 |
|------|--------|------|
| `SJ_SIMULATION` | `true` | 模擬模式（true=不回傳真實報價）|
| `SJ_API_KEY` | （需填入）| Shioaji API Key（向永豐金申請）|
| `SJ_API_SECRET` | （需填入）| Shioaji API Secret |
| `ASPNETCORE_ENVIRONMENT` | `Production` | .NET 環境 |

> ⚠️ **重要**：若 `SJ_API_KEY` 和 `SJ_API_SECRET` 未設定，rshioaji 會顯示錯誤但仍可運行（Simulation 模式）

### 本機開發（.env 檔案）

```env
SJ_SIMULATION=true
SJ_API_KEY=your_api_key_here
SJ_API_SECRET=your_api_secret_here
```

### Docker 運行

```bash
docker run -d -p 5000:5000 \
  -e SJ_SIMULATION=true \
  -e SJ_API_KEY=your_key \
  -e SJ_API_SECRET=your_secret \
  --name shioajitrader shioajitrader
```

---

## 📊 API 完整列表

| 方法 | 端點 | 需要認證 | 說明 |
|------|------|----------|------|
| POST | `/api/auth/login` | ❌ | Shioaji 登入 |
| GET | `/api/stocks` | ✅ | 取得追蹤清單 |
| GET | `/api/stocks/{code}` | ✅ | 查詢個股報價 |
| POST | `/api/stocks` | ✅ | 新增股票到追蹤 |
| DELETE | `/api/stocks/{code}` | ✅ | 從追蹤移除 |
| GET | `/api/stocks/{code}/stream` | ❌ | SSE 即時報價 |
| GET | `/api/users/me` | ✅ | 取得會員資料 |
| PUT | `/api/users/me` | ✅ | 更新會員資料 |
| GET | `/api/orders` | ✅ | 委託單列表 |
| POST | `/api/orders/market` | ✅ | 市價單下單 |
| POST | `/api/orders/limit` | ✅ | 限價單下單 |
| POST | `/api/orders/{id}/cancel` | ✅ | 取消委託 |
| GET | `/health` | ❌ | 健康檢查 |

---

## 🏗️ 架構說明

### Clean Architecture 層級

```
┌─────────────────────────────────────────────┐
│           Presentation (API)                │
│    Controllers: Auth, Stocks, Users, Orders │
├─────────────────────────────────────────────┤
│             Application                     │
│    Services, DTOs, Interfaces               │
├─────────────────────────────────────────────┤
│               Domain                         │
│    Entities: User, Stock, Order, Kbar       │
├─────────────────────────────────────────────┤
│           Infrastructure                      │
│  Repositories, Cache, ShioajiClient        │
└─────────────────────────────────────────────┘
```

### 資料流向

```
使用者 → Vue 前端 → API → Controllers → Services → ShioajiClient → rshioaji
                                          ↓
                                     JsonFileRepository → src.data/*.json
                                          ↓
                                     MemoryCacheService
```

---

## 🔒 安全說明

- JWT Token 有效期：12 小時
- 密碼應使用 hash，未來建議遷移到 PostgreSQL/Oracle
- **rshioaji 為必要元件**，請確保已啟動 `shioaji server start`
- 目前僅支援 Simulation 模式，正式交易需申請 API Key

---

## ❓ 常見問題

### Q: 出現 502 Bad Gateway 錯誤？
**原因**：rshioaji 服務未啟動。
**解決**：執行 `shioaji server start` 並保持運行。

---

## 📝 License

MIT License - 詳見 [LICENSE](LICENSE) 檔案