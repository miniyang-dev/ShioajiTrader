/**
 * API Service for ShioajiTrader Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Types
export interface LoginRequest {
  apiKey: string;
  apiSecret: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message: string;
  code: number;
}

export interface Stock {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface QuoteResponse {
  success: boolean;
  data?: Stock;
  message: string;
  code: number;
}

export interface Order {
  id: string;
  stockCode: string;
  stockName: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: string;
  createdAt: string;
}

export interface Statistics {
  totalOrders: number;
  completedOrders: number;
  totalPnL: number;
  winRate: number;
}

// Auth
export const login = async (apiKey: string, apiSecret: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, apiSecret }),
  });
  return response.json();
};

export const logout = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (token) {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  }
  localStorage.removeItem('token');
};

// Stocks
export const getQuote = async (code: string): Promise<QuoteResponse> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/stocks/${code}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  return response.json();
};

export const getTrackedStocks = async (): Promise<{ success: boolean; data: Stock[] }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/stocks`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

export const addStock = async (code: string, name: string): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/stocks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, name }),
  });
  return response.json();
};

export const removeStock = async (code: string): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/stocks/${code}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

// Orders
export const getOrders = async (): Promise<{ success: boolean; data: Order[] }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

export const placeMarketOrder = async (
  code: string, name: string, side: 'BUY' | 'SELL', quantity: number
): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/orders/market`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stockCode: code, stockName: name, side, quantity }),
  });
  return response.json();
};

export const cancelOrder = async (id: string): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/orders/${id}/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

// Statistics
export const getTodayStatistics = async (): Promise<{ success: boolean; data: Statistics }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/orders/today`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

// Auth check
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};
