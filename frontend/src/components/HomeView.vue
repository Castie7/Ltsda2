<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { api } from '../api';

interface Member {
  id: number;
  status: string;
  gender: string;
  exclusion_type?: string;
}

const members = ref<Member[]>([]);
const isLoading = ref(true);

const fetchMembers = async () => {
  try {
    const response = await api('/api/members');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    members.value = data;
  } catch (error) {
    console.error("Error loading members:", error);
  } finally {
    isLoading.value = false;
  }
};

const stats = computed(() => {
   // Total excludes: Deceased, Drop, Abroad, Transferred, Missing (Status) OR Death, Reform (Exclusion)
   const total = members.value.filter(m => 
      !['Deceased', 'Drop', 'Abroad', 'Transferred', 'Missing'].includes(m.status) &&
      !['Death', 'Reform'].includes((m as any).exclusion_type || '')
   ).length;

   const active = members.value.filter(m => m.status === 'Active').length;
   const inactive = members.value.filter(m => m.status === 'Inactive').length;
   const male = members.value.filter(m => m.gender === 'Male').length;
   const female = members.value.filter(m => m.gender === 'Female').length;
   
   return { total, active, inactive, male, female };
});

onMounted(fetchMembers);
</script>

<template>
  <div class="p-8">
    <header class="mb-8 border-b pb-4 flex justify-between items-center">
      <div>
         <h1 class="text-3xl font-bold text-blue-900">Dashboard</h1>
         <p class="text-slate-500">Overview of the church membership.</p>
      </div>
      <div class="text-right">
         <p class="text-sm text-slate-400">Total Members</p>
         <p class="text-4xl font-bold text-blue-900">{{ isLoading ? '...' : stats.total }}</p>
      </div>
    </header>

    <!-- STATS GRID -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      <!-- MEMBERSHIP STATUS -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
         <div class="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-blue-900 select-none">📊</div>
         <h3 class="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Membership Status</h3>
         <div class="flex items-end gap-2 mb-1">
             <span class="text-3xl font-bold text-slate-800">{{ isLoading ? '-' : stats.active }}</span>
             <span class="text-sm text-green-600 font-medium mb-1">Active</span>
         </div>
         <div class="flex items-end gap-2">
             <span class="text-2xl font-bold text-slate-400">{{ isLoading ? '-' : stats.inactive }}</span>
             <span class="text-sm text-slate-400 font-medium mb-1">Inactive</span>
         </div>
      </div>

      <!-- GENDER DEMOGRAPHICS -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
         <div class="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-pink-500 select-none">👥</div>
         <h3 class="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Gender Demographics</h3>
         <div class="flex gap-6 mt-2">
             <div>
                <span class="text-3xl font-bold text-blue-600 block">{{ isLoading ? '-' : stats.male }}</span>
                <span class="text-xs text-slate-400 font-bold uppercase">Male</span>
             </div>
             <div>
                <span class="text-3xl font-bold text-pink-500 block">{{ isLoading ? '-' : stats.female }}</span>
                <span class="text-xs text-slate-400 font-bold uppercase">Female</span>
             </div>
         </div>
      </div>

      <!-- QUICK ACTIONS -->
      <div class="bg-blue-900 p-6 rounded-2xl shadow-sm border border-blue-800 text-white flex flex-col justify-between">
         <h3 class="text-blue-200 font-bold text-xs uppercase tracking-wider mb-2">Quick Actions</h3>
         <div class="flex gap-3 mt-2">
            <router-link to="/members/add" class="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors text-center flex-1">
               + Add Member
            </router-link>
            <router-link to="/export" class="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors text-center flex-1">
               🖨️ Export
            </router-link>
         </div>
      </div>
    </div>

    <!-- MAIN NAV CARDS -->
    <h3 class="font-bold text-lg text-slate-800 mb-4">Management</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <router-link to="/members" class="bg-white border hover:border-blue-300 p-6 rounded-2xl shadow-sm transition-all group">
        <h3 class="font-bold text-lg text-blue-900 group-hover:text-blue-700 transition-colors">📂 Membership Management</h3>
        <p class="text-slate-500 text-sm mt-2">View the master list, search records, and manage member details.</p>
      </router-link>

      <div class="bg-slate-50 border p-6 rounded-2xl shadow-inner opacity-60">
        <h3 class="font-bold text-lg text-slate-600">📊 Reports (Coming Soon)</h3>
        <p class="text-slate-400 text-sm mt-2">Quarterly report generation will be available here.</p>
      </div>
    </div>
  </div>
</template>