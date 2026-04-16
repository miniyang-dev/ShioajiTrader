<template>
  <div class="login-wrapper">
    <!-- Ambient background -->
    <div class="bg-ambient"></div>
    <div class="grid-pattern"></div>
    
    <!-- Login card -->
    <div class="login-card">
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-mark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 3h18v18H3V3z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M3 9h18M9 3v18" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </div>
        <span class="logo-text">ShioajiTrader</span>
      </div>

      <!-- Title -->
      <h1 class="title">Sign in to your account</h1>
      <p class="subtitle">Track Taiwan stocks with real-time data</p>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="form">
        <div class="form-group">
          <label for="apiKey" class="label">API Key</label>
          <input
            id="apiKey"
            v-model="form.apiKey"
            type="text"
            class="input"
            placeholder="Enter your API key"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="apiSecret" class="label">API Secret</label>
          <input
            id="apiSecret"
            v-model="form.apiSecret"
            type="password"
            class="input"
            placeholder="Enter your API secret"
            autocomplete="current-password"
          />
        </div>

        <!-- Error message -->
        <div v-if="error" class="error-message">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 4v5M8 11v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ error }}
        </div>

        <!-- Submit button -->
        <button 
          type="submit" 
          class="btn-submit"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- Demo hint -->
      <div class="demo-hint">
        <span class="hint-label">Demo account</span>
        <code class="hint-credentials">sheep / pass.1234</code>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/api'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = reactive({
  apiKey: '',
  apiSecret: ''
})

const handleLogin = async () => {
  error.value = ''
  
  if (!form.apiKey || !form.apiSecret) {
    error.value = 'Please enter both API key and secret'
    return
  }

  loading.value = true

  try {
    const result = await login(form.apiKey, form.apiSecret)
    
    if (result.success && result.token) {
      localStorage.setItem('token', result.token)
      router.push('/dashboard')
    } else {
      error.value = result.message || 'Login failed'
    }
  } catch (err) {
    error.value = 'Connection error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Variables */
:root {
  --bg-base: #09090b;
  --bg-elevated: #18181b;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-medium: rgba(255, 255, 255, 0.1);
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --danger: #ef4444;
  --radius-md: 10px;
  --radius-lg: 16px;
}

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
}

/* Background */
.bg-ambient {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    var(--bg-base);
  z-index: -2;
}

.grid-pattern {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  z-index: -1;
}

/* Login card - Liquid Glass */
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background:
    linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255,255,255,0.06);
}

/* Logo */
.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.logo-mark {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Title */
.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 32px;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.input {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-variant-numeric: tabular-nums;
}

.input::placeholder {
  color: var(--text-muted);
}

.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* Error message */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--danger);
}

/* Submit button */
.btn-submit {
  width: 100%;
  padding: 14px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  color: white;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Demo hint */
.demo-hint {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hint-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hint-credentials {
  font-size: 12px;
  font-family: 'Geist Mono', 'JetBrains Mono', monospace;
  color: var(--text-secondary);
  background: rgba(255,255,255,0.05);
  padding: 4px 8px;
  border-radius: 4px;
}
</style>