<script setup lang="ts">
import { useLoginView } from '../composables/useLoginView';

const {
  username,
  password,
  isLoading,
  errorMessage,
  isLockedOut,
  lockoutDisplay,
  attemptsWarning,
  handleLogin,
} = useLoginView();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-50"></div>

    <div class="max-w-md w-full z-10">
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 p-10 border border-white/20">
        <div class="mb-8 text-center">
         <div class="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-blue-900/20">
            <img src="/logo.svg" class="w-full h-full object-cover rounded-2xl">
         </div>
         <h1 class="text-2xl font-bold text-blue-900">LT SDA Management</h1>
         <p class="text-slate-400 text-sm mt-1">Please sign in to continue</p>
      </div>

        <form @submit.prevent="handleLogin" class="space-y-6">

          <!-- ERROR MESSAGE -->
          <div v-if="errorMessage" class="p-3 text-sm text-red-600 bg-red-50 rounded-xl text-center border border-red-100">
            {{ errorMessage }}
          </div>

          <!-- LOCKOUT COUNTDOWN -->
          <div v-if="isLockedOut" class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <div class="text-amber-800 font-bold text-sm mb-1">🔒 Account Temporarily Locked</div>
            <div class="text-amber-900 text-3xl font-mono font-bold my-2">{{ lockoutDisplay }}</div>
            <div class="text-amber-600 text-xs">Please wait before trying again</div>
          </div>

          <!-- ATTEMPTS WARNING -->
          <div v-else-if="attemptsWarning && !isLockedOut" class="p-2 text-xs text-amber-700 bg-amber-50 rounded-lg text-center border border-amber-100">
            ⚠️ {{ attemptsWarning }}
          </div>

          <div>
            <label class="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Username</label>
            <input 
              v-model="username" 
              type="text" 
              required
              :disabled="isLockedOut"
              class="w-full px-5 py-4 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-900/20 transition-all outline-none placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" 
              placeholder="Your username" 
            />
          </div>

          <div>
            <label class="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Password</label>
            <input 
              v-model="password" 
              type="password" 
              required
              :disabled="isLockedOut"
              class="w-full px-5 py-4 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-900/20 transition-all outline-none placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            :disabled="isLoading || isLockedOut"
            class="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:shadow-none"
          >
            <span v-if="isLockedOut">Locked ({{ lockoutDisplay }})</span>
            <span v-else-if="!isLoading">Sign In</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Authenticating...
            </span>
          </button>
        </form>

        <div class="mt-10 text-center">
          <p class="text-xs text-slate-400 font-medium">© 2026 La Trinidad Seventh-day Adventist Church</p>
        </div>
      </div>
    </div>
  </div>
</template>