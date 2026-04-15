<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">📈</div>
        <h1 class="text-3xl font-bold text-white">Shioaji Trader</h1>
        <p class="text-slate-400 mt-2">台股追蹤系統</p>
      </div>

      <!-- Login Form -->
      <div class="bg-slate-800/50 backdrop-blur rounded-3xl p-8 border border-slate-700/30">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm text-slate-400 mb-2">帳號</label>
            <input
              v-model="username"
              type="text"
              class="w-full bg-slate-900/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="請輸入帳號"
              required
            />
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-2">密碼</label>
            <input
              v-model="password"
              type="password"
              class="w-full bg-slate-900/50 border border-slate-600/30 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="請輸入密碼"
              required
            />
          </div>

          <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {{ loading ? '登入中...' : '登入' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-500">
          預設帳號：sheep / 密碼：pass.1234
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

<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}
</style>