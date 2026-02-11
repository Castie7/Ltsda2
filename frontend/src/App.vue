<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Hide navigation if we are on the login page
const showNav = computed(() => route.path !== '/login');

const logout = () => {
  localStorage.removeItem('user');
  router.push('/login');
};
</script>

<template>
  <div id="app" class="flex min-h-screen">
    <nav v-if="showNav" class="w-72 m-4 mr-0 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col p-6">
      <div class="mb-10 flex items-center space-x-3">
        <img src="/logo.svg" alt="Logo" class="w-10 h-10 object-contain rounded-full shadow-sm">
        <div>
          <h2 class="text-sm font-bold text-primary tracking-tight">LT SDA Management</h2>
          <p class="text-[10px] text-slate-400 uppercase tracking-widest">Registry System</p>
        </div>
      </div>

      <div class="flex-1 space-y-2">
        <router-link to="/" class="nav-link" active-class="nav-link-active">
          <span class="text-lg">🏠</span> <span>Dashboard</span>
        </router-link>
        <router-link to="/members" class="nav-link" active-class="nav-link-active">
          <span class="text-lg">👥</span> <span>Members</span>
        </router-link>
        <router-link to="/members/add" class="nav-link" active-class="nav-link-active">
          <span class="text-lg">➕</span> <span>Add Member</span>
        </router-link>
        <router-link to="/export" class="nav-link" active-class="nav-link-active">
          <span class="text-lg">🖨️</span> <span>Bulk Export</span>
        </router-link>
      </div>

      <div class="pt-6 border-t border-slate-50 space-y-2">
        <router-link to="/settings" class="nav-link text-slate-500" active-class="nav-link-active">
          <span class="text-lg">⚙️</span> <span>Settings</span>
        </router-link>
        <button @click="logout" class="w-full text-left nav-link text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <span class="text-lg">🚪</span> <span>Sign Out</span>
        </button>
      </div>
    </nav>
    
    <main class="flex-1 p-8 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>


<style scoped>
/* Reference your main CSS file to give @apply access to utilities */
@reference "./style.css";

.nav-link {
  @apply flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all duration-200;
}

.nav-link-active {
  @apply bg-primary/5 text-primary font-semibold border-r-4 border-primary rounded-r-none;
}
</style>