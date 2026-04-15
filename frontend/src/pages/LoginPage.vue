<template>
  <div class="min-h-screen flex items-center justify-center bg-deep-sea">
    <div class="glass-card p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold text-white mb-6 text-center">Shioaji Trader</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm text-gray-400 mb-2">帳號</label>
          <input
            v-model="username"
            type="text"
            class="input-field w-full"
            placeholder="請輸入帳號"
            required
          />
        </div>
        
        <div>
          <label class="block text-sm text-gray-400 mb-2">密碼</label>
          <input
            v-model="password"
            type="password"
            class="input-field w-full"
            placeholder="請輸入密碼"
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

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '請填寫所有欄位'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await api.login(username.value, password.value)
    
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