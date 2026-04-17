import { useState } from "react";
import { useNavigate } from "react-router";
import { login, isAuthenticated } from "../services/api";
import "./login.css";

export function Login() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated()) {
    navigate("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!apiKey || !apiSecret) {
      setError("請輸入帳號和密碼");
      setLoading(false);
      return;
    }

    try {
      const result = await login(apiKey, apiSecret);
      
      if (result.success && result.token) {
        localStorage.setItem("token", result.token);
        navigate("/");
      } else {
        setError(result.message || "登入失敗");
      }
    } catch (err) {
      setError("連線錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-grid" />
      
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h18v18H3V3z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="login-logo-text">IreneTrader</span>
        </div>

        <h1 className="login-title">登入帳戶</h1>
        <p className="login-subtitle">連接永豐金融 API</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="apiKey" className="login-label">Account</label>
            <input
              id="apiKey"
              type="text"
              className="login-input"
              placeholder="Enter your Account"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="apiSecret" className="login-label">Password</label>
            <input
              id="apiSecret"
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="login-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 4v5M8 11v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              "登入"
            )}
          </button>
        </form>

        <div className="login-demo">
          <span className="login-demo-label">Demo</span>
          <code className="login-demo-cred">Irene / pass.1234</code>
        </div>
      </div>
    </div>
  );
}
