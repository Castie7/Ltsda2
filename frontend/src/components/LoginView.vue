<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Replace with your actual CI4 local URL
    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Success: Save user info/token and redirect
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } else {
      errorMessage.value = data.messages?.error || 'Invalid username or password';
    }
  } catch (error) {
    errorMessage.value = 'Could not connect to the server.';
  } finally {
    isLoading.value = false;
  }
};
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
          <div v-if="errorMessage" class="p-3 text-sm text-red-600 bg-red-50 rounded-xl text-center border border-red-100">
            {{ errorMessage }}
          </div>

          <div>
            <label class="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Username</label>
            <input 
              v-model="username" 
              type="text" 
              required
              class="w-full px-5 py-4 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-900/20 transition-all outline-none placeholder:text-slate-400" 
              placeholder="Your username" 
            />
          </div>

          <div>
            <label class="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Password</label>
            <input 
              v-model="password" 
              type="password" 
              required
              class="w-full px-5 py-4 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-900/20 transition-all outline-none placeholder:text-slate-400" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-900/20 active:scale-[0.98]"
          >
            <span v-if="!isLoading">Sign In</span>
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