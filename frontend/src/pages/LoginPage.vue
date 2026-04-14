<template>
  <div class="min-h-screen flex items-center justify-center bg-deep-sea">
    <div class="glass-card p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold text-white mb-6 text-center">Shioaji Trader</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm text-gray-400 mb-2">API Key</label>
          <input
            v-model="apiKey"
            type="text"
            class="input-field w-full"
            placeholder="請輸入 Shioaji API Key"
            required
          />
        </div>
        
        <div>
          <label class="block text-sm text-gray-400 mb-2">API Secret</label>
          <input
            v-model="apiSecret"
            type="password"
            class="input-field w-full"
            placeholder="請輸入 Shioaji API Secret"
            required
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full"
        >
          {{ loading ? '登入中...' : '登入' }}
        </button>
      </form>

      <p class="text-center text-gray-500 text-sm mt-4">
        還沒有 API Key？<br/>
        <a href="https://sinotrade.github.io/" target="_blank" class="text-purple-500 hover:underline">
          前往申請
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const apiKey = ref('')
const apiSecret = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!apiKey.value || !apiSecret.value) {
    error.value = '請填寫所有欄位'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await api.login(apiKey.value, apiSecret.value)
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/')
    } else {
      error.value = response.data.message || '登入失敗'
    }
  } catch (err) {
    error.value = err.response?.data?.message || '網路錯誤，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>
