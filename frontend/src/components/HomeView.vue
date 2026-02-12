<script setup lang="ts">
import { computed } from 'vue';
import { useHomeView } from '../composables/useHomeView';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Pie } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

const { isLoading, stats } = useHomeView();

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: "'Inter', sans-serif",
          size: 11
        }
      }
    }
  },
  cutout: '65%',
};

const statusData = computed(() => ({
  labels: ['Active', 'Inactive'],
  datasets: [
    {
      backgroundColor: ['#10b981', '#64748b'], // Emerald-500, Slate-500
      borderColor: ['#ffffff', '#ffffff'],
      borderWidth: 2,
      data: [stats.value.active, stats.value.inactive]
    }
  ]
}));

const genderData = computed(() => ({
  labels: ['Male', 'Female'],
  datasets: [
    {
      backgroundColor: ['#3b82f6', '#ec4899'], // Blue-500, Pink-500
      borderColor: ['#ffffff', '#ffffff'],
      borderWidth: 2,
      data: [stats.value.male, stats.value.female]
    }
  ]
}));
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p class="text-slate-500 text-sm">Overview of church membership records</p>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-20 text-slate-400">
      <div class="animate-pulse flex flex-col items-center">
        <div class="h-4 w-32 bg-slate-200 rounded mb-4"></div>
        <div class="h-64 w-full max-w-md bg-slate-100 rounded-2xl"></div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Total Members Card (Main Highlight) -->
      <div class="lg:col-span-1 bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl shadow-blue-900/20 flex flex-col justify-center relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        </div>
        
        <div class="relative z-10">
          <div class="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">Total Membership</div>
          <div class="text-6xl font-black tracking-tighter mb-4">{{ stats.total }}</div>
          <div class="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-medium text-blue-100">Live Record Update</span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Status Chart -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 class="text-slate-800 font-bold mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
            Membership Status
          </h3>
          <div class="h-48 relative">
            <Doughnut :data="statusData" :options="chartOptions" />
            <!-- Center Text for Doughnut -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="text-center">
                <span class="block text-2xl font-bold text-slate-800">{{ stats.active }}</span>
                <span class="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Gender Chart -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 class="text-slate-800 font-bold mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            Gender Distribution
          </h3>
          <div class="h-48">
            <Pie :data="genderData" :options="{
              ...chartOptions,
              cutout: '0%' // Pie chart doesn't have cutout
            }" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>