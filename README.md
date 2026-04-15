# ShioajiTrader - 台股追蹤系統

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![Vue](https://img.shields.io/badge/Vue-3-green)

基於 **Sinopac Shioaji API** 的台股追蹤系統，使用 **Python FastAPI + Vue 3** 打造。

---

## 📁 專案結構

```
ShioajiTrader/
├── src/                          # Python FastAPI 後端
│   ├── main.py                   # FastAPI 主程式
│   ├── api/                      # API 路由
│   │   ├── auth.py               # 認證（POST /api/auth/login）
│   │   ├── stocks.py             # 股票（GET/POST/DELETE /api/stocks）
│   │   └── orders.py             # 訂單（GET/POST /api/orders）
│   ├── models/
│   │   └── schemas.py            # Pydantic 模型
│   ├── services/
│   │   └── shioaji_service.py   # 直接使用 shioaji Python library
│   └── requirements.txt          # Python 依賴
├── frontend/                     # Vue 3 前端
│   ├── src/
│   │   ├── components/           # StockChart, StockCard
│   │   ├── pages/               # LoginPage, DashboardPage
│   │   ├── services/           # api.js（SSE 即時報價）
│   │   └── router/             # Vue Router
│   ├── dist/                    # 編譯後的前端靜態檔案
│   └── package.json
├── src.data/                     # JSON 資料存放（股票、訂單）
├── Dockerfile                    # Docker 建置腳本
└── README.md                      # 本說明文件
```

---

## ⚡️ 功能列表

### 後端功能

| 功能 | API 端點 | 說明 |
|------|----------|------|
| **登入** | `POST /api/auth/login` | Token 核發 |
| **股票查詢** | `GET /api/stocks/{code}` | 取得個股報價 |
| **K線資料** | `GET /api/stocks/{code}/kbars` | 歷史K線 |
| **即時報價** | `GET /api/stocks/{code}/stream` | SSE 串流 |
| **追蹤清單** | `GET/POST/DELETE /api/stocks` | 股票追蹤 CRUD |
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

### 前置需求

| 項目 | 版本 | 說明 |
|------|------|------|
| Python | 3.11+ | [下載](https://www.python.org/downloads/) |
| Node.js | 18+ | [下載](https://nodejs.org/) |
| pnpm | 最新版 | `npm install -g pnpm` |
| **shioaji** | 最新版 | **直接使用 Python library** |

### 本地開發

```bash
# 1. 安裝 Python 依賴
cd src
pip install -r requirements.txt

# 2. 啟動後端（Port 8080）
uvicorn main:app --reload --port 8080

# 3. 新開終端，啟動前端開發伺服器（Port 5173）
cd frontend
pnpm install
pnpm dev
```

### Docker 部署（Zeabur）

```bash
# 1. 建置映像
docker build -t shioajitrader .

# 2. 運行容器
docker run -d -p 8080:8080 --name shioajitrader shioajitrader

# 3. 開啟瀏覽器
# http://localhost:8080
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
| `PORT` | `8080` | Zeabur 導流端口 |

> ⚠️ **重要**：若 `SJ_API_KEY` 和 `SJ_API_SECRET` 未設定，系統會以 Simulation 模式運行

### Docker 運行

```bash
docker run -d -p 8080:8080 \
  -e SJ_SIMULATION=true \
  -e SJ_API_KEY=your_key \
  -e SJ_API_SECRET=your_secret \
  --name shioajitrader shioajitrader
```

---

## 📊 API 完整列表

| 方法 | 端點 | 需要認證 | 說明 |
|------|------|----------|------|
| POST | `/api/auth/login` | ❌ | 登入 |
| GET | `/api/stocks` | ❌ | 取得追蹤清單 |
| GET | `/api/stocks/{code}` | ❌ | 查詢個股報價 |
| POST | `/api/stocks` | ❌ | 新增股票到追蹤 |
| DELETE | `/api/stocks/{code}` | ❌ | 從追蹤移除 |
| GET | `/api/stocks/{code}/stream` | ❌ | SSE 即時報價 |
| GET | `/api/stocks/{code}/kbars` | ❌ | K線歷史資料 |
| GET | `/api/orders` | ❌ | 委託單列表 |
| POST | `/api/orders/market` | ❌ | 市價單下單 |
| POST | `/api/orders/limit` | ❌ | 限價單下單 |
| POST | `/api/orders/{id}/cancel` | ❌ | 取消委託 |
| GET | `/api/orders/today` | ❌ | 當日統計 |
| GET | `/health` | ❌ | 健康檢查 |

---

## 🏗️ 架構說明

### 簡化後的架構

```
┌─────────────────────────────────────────────┐
│           Python FastAPI                     │
│    直接使用 shioaji Python library            │
│                                             │
│    ├── /api/auth/*    → 認證               │
│    ├── /api/stocks/*  → 股票               │
│    ├── /api/orders/*  → 訂單               │
│    └── /             → Vue Frontend         │
└─────────────────────────────────────────────┘
```

### 與舊版差異

| 項目 | 舊版（C#） | 新版（Python） |
|------|-----------|---------------|
| Backend | .NET 8 | Python FastAPI |
| Shioaji | rshioaji server (HTTP) | 直接用 shioaji library |
| Port | 8080 + 8081 | **統一 8080** |
| Services | 3 個 | **1 個** |
| Build 時間 | 5-10 分鐘 | **1-2 分鐘** |

---

## 🔒 安全說明

- 目前為 Demo 版本，認證機制簡化
- 建議未來加入 proper JWT validation
- 目前僅支援 Simulation 模式，正式交易需申請 API Key

---

## ❓ 常見問題

### Q: Docker build 很慢？
**原因**：Python 套件需要編譯。
**解決**：新版本已優化，使用 python:3.11-slim 大幅減少映像大小。

---

## 📝 License

MIT License - 詳見 [LICENSE](LICENSE) 檔案
