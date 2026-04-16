<template>
  <div class="login-container">
    <!-- Background Pattern -->
    <div class="background-pattern"></div>
    
    <div class="login-wrapper">
      <!-- Left Side - Branding -->
      <div class="branding-section">
        <div class="branding-content">
          <div class="logo-mark">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="url(#logo-gradient)"/>
              <path d="M14 32L24 16L34 32H14Z" fill="white" fill-opacity="0.9"/>
              <circle cx="24" cy="26" r="4" fill="white" fill-opacity="0.6"/>
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="48">
                  <stop stop-color="#3B82F6"/>
                  <stop offset="1" stop-color="#1D4ED8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="brand-title">Shioaji Trader</h1>
          <p class="brand-subtitle">Professional stock tracking</p>
          
          <div class="brand-features">
            <div class="feature-item">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3v18h18"/>
                <path d="M7 16l4-4 4 4 5-6"/>
              </svg>
              <span>Real-time quotes</span>
            </div>
            <div class="feature-item">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
                <path d="M9 21V9"/>
              </svg>
              <span>K-line charts</span>
            </div>
            <div class="feature-item">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <span>Instant notifications</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="form-section">
        <div class="form-card">
          <div class="form-header">
            <h2>Sign in</h2>
            <p>Enter your credentials to continue</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="username">Account</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  placeholder="Enter your account"
                  required
                  autocomplete="username"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
                />
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="error" class="error-message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="submit-button"
            >
              <span v-if="loading" class="loading-spinner"></span>
              <span v-else>Sign in</span>
            </button>
          </form>

          <div class="form-footer">
            <p>Demo account: <code>sheep</code> / <code>pass.1234</code></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await api.login(username.value, password.value)
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token)
      router.push('/')
    } else {
      error.value = response.data.message || 'Login failed'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Network error, please try again'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.login-wrapper {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  margin: 1rem;
  position: relative;
  z-index: 1;
}

/* Branding Section */
.branding-section {
  flex: 1;
  display: none;
  padding: 3rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 41, 59, 0.8) 100%);
  border-radius: 1.5rem 0 0 1.5rem;
  position: relative;
}

@media (min-width: 768px) {
  .branding-section {
    display: flex;
    align-items: center;
  }
}

.branding-content {
  max-width: 400px;
}

.logo-mark {
  margin-bottom: 1.5rem;
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: 1.125rem;
  color: #94a3b8;
  margin-bottom: 2.5rem;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #cbd5e1;
  font-size: 0.9375rem;
}

.feature-icon {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

/* Form Section */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.form-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 1.5rem;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.form-header p {
  color: #64748b;
  font-size: 0.9375rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #94a3b8;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 18px;
  height: 18px;
  color: #64748b;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 0.75rem;
  color: #f1f5f9;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.input-wrapper input::placeholder {
  color: #475569;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password svg {
  width: 18px;
  height: 18px;
  color: #64748b;
  transition: color 0.2s;
}

.toggle-password:hover svg {
  color: #94a3b8;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.75rem;
  color: #fca5a5;
  font-size: 0.875rem;
}

.error-message svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.submit-button {
  width: 100%;
  padding: 0.9375rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.form-footer p {
  font-size: 0.8125rem;
  color: #64748b;
}

.form-footer code {
  background: rgba(59, 130, 246, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  color: #60a5fa;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}
</style>
