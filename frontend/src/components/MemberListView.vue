<script setup lang="ts">
import { useMemberListView } from '../composables/useMemberListView';

const {
  router,
  members,
  isLoading,
  searchQuery,
  statusFilter,
  genderFilter,
  civilStatusFilter,
  minAgeFilter,
  maxAgeFilter,
  activeFilter,
  activeTab,
  toggleFilterMenu,
  filteredMembers,
  currentPage,
  totalPages,
  paginatedMembers,
  nextPage,
  prevPage,
  goToAddMember,
  getInitials,
} = useMemberListView();
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <header class="flex justify-between items-end mb-6">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Church Registry</h1>
        <p class="text-slate-500 mt-1">
          <span v-if="isLoading">Loading records...</span>
          <span v-else>Managing {{ members.length }} records at La Trinidad SDA.</span>
        </p>
      </div>
    </header>

    <!-- TOOLBAR: Tabs + Search + Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <!-- TABS -->
        <div class="flex space-x-1 bg-slate-100/50 p-1 rounded-xl w-fit overflow-x-auto">
            <button 
                v-for="tab in ['All', 'Members', 'Transferred', 'Deceased', 'Others']" 
                :key="tab"
                @click="activeTab = tab; currentPage = 1"
                class="px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                :class="activeTab === tab ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            >
                {{ tab }}
            </button>
        </div>

        <div class="flex items-center gap-3">
             <!-- Search Line -->
             <div class="relative w-64">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input 
                   v-model="searchQuery" 
                   type="text" 
                   placeholder="Search..." 
                   class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-900/20 text-sm outline-none text-slate-700 shadow-sm"
                />
             </div>
             
             <!-- Action Buttons -->
             <button 
              @click="router.push('/import')"
              class="bg-white border border-slate-200 text-slate-600 px-3 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors"
              title="Import Data"
            >
              📥
            </button>  
            <button 
                @click="goToAddMember"
                class="bg-blue-900 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 transition-all text-sm whitespace-nowrap"
            >
                + New
            </button>
        </div>
    </div>

    <div class="bg-white/70 backdrop-blur-md border border-slate-100 p-4 rounded-2xl mb-6 shadow-sm">
         <!-- Filter Buttons -->
         <div class="flex flex-wrap gap-2">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider self-center mr-2">Filter By:</span>
            
            <!-- STATUS TOGGLE -->
            <div class="relative">
               <button 
                  @click="toggleFilterMenu('status')"
                  class="px-4 py-1.5 rounded-full text-sm font-bold border transition-colors flex items-center gap-2"
                  :class="statusFilter ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'"
               >
                  Status {{ statusFilter ? `(${statusFilter})` : '' }} ▾
               </button>
               <div v-if="activeFilter === 'status'" class="absolute top-full mt-2 left-0 bg-white border border-slate-100 shadow-xl rounded-xl p-2 min-w-[150px] z-20 flex flex-col gap-1">
                  <button @click="statusFilter = ''; activeFilter = null" class="text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500">Clear</button>
                  <div class="h-px bg-slate-100 my-1"></div>
                  <button v-for="opt in ['Active', 'Inactive', 'Child', 'Transferred', 'Deceased', 'Abroad', 'Drop', 'Missing']" :key="opt" @click="statusFilter = opt; activeFilter = null" class="text-left px-3 py-2 text-sm rounded-lg hover:bg-blue-50 font-medium text-slate-700">
                     {{ opt }}
                  </button>
               </div>
            </div>

            <!-- GENDER TOGGLE -->
            <div class="relative">
               <button 
                  @click="toggleFilterMenu('gender')"
                  class="px-4 py-1.5 rounded-full text-sm font-bold border transition-colors flex items-center gap-2"
                  :class="genderFilter ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'"
               >
                  Gender {{ genderFilter ? `(${genderFilter})` : '' }} ▾
               </button>
               <div v-if="activeFilter === 'gender'" class="absolute top-full mt-2 left-0 bg-white border border-slate-100 shadow-xl rounded-xl p-2 min-w-[150px] z-20 flex flex-col gap-1">
                  <button @click="genderFilter = ''; activeFilter = null" class="text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500">Clear</button>
                  <div class="h-px bg-slate-100 my-1"></div>
                  <button v-for="opt in ['Male', 'Female']" :key="opt" @click="genderFilter = opt; activeFilter = null" class="text-left px-3 py-2 text-sm rounded-lg hover:bg-blue-50 font-medium text-slate-700">
                     {{ opt }}
                  </button>
               </div>
            </div>

            <!-- AGE TOGGLE -->
            <div class="relative">
               <button 
                  @click="toggleFilterMenu('age')"
                  class="px-4 py-1.5 rounded-full text-sm font-bold border transition-colors flex items-center gap-2"
                  :class="(minAgeFilter || maxAgeFilter) ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'"
               >
                  Age {{ (minAgeFilter || maxAgeFilter) ? `(${minAgeFilter || 0}-${maxAgeFilter || '∞'})` : '' }} ▾
               </button>
               <div v-if="activeFilter === 'age'" class="absolute top-full mt-2 left-0 bg-white border border-slate-100 shadow-xl rounded-xl p-4 w-[200px] z-20">
                  <div class="space-y-3">
                     <div>
                        <label class="text-xs font-bold text-slate-400 uppercase">Min Age</label>
                        <input v-model.number="minAgeFilter" type="number" class="w-full border rounded px-2 py-1 text-sm text-slate-800">
                     </div>
                     <div>
                        <label class="text-xs font-bold text-slate-400 uppercase">Max Age</label>
                        <input v-model.number="maxAgeFilter" type="number" class="w-full border rounded px-2 py-1 text-sm text-slate-800">
                     </div>
                     <button @click="minAgeFilter = null; maxAgeFilter = null; activeFilter = null" class="w-full py-1 text-xs font-bold text-red-500 bg-red-50 rounded hover:bg-red-100">Reset</button>
                  </div>
               </div>
            </div>

            <!-- CIVIL STATUS TOGGLE -->
            <div class="relative">
               <button 
                  @click="toggleFilterMenu('civil')"
                  class="px-4 py-1.5 rounded-full text-sm font-bold border transition-colors flex items-center gap-2"
                  :class="civilStatusFilter ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'"
               >
                  Civil Status {{ civilStatusFilter ? `(${civilStatusFilter})` : '' }} ▾
               </button>
               <div v-if="activeFilter === 'civil'" class="absolute top-full mt-2 left-0 bg-white border border-slate-100 shadow-xl rounded-xl p-2 min-w-[150px] z-20 flex flex-col gap-1">
                  <button @click="civilStatusFilter = ''; activeFilter = null" class="text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500">Clear</button>
                  <div class="h-px bg-slate-100 my-1"></div>
                  <button v-for="opt in ['Single', 'Married', 'Widow/er', 'Separated']" :key="opt" @click="civilStatusFilter = opt; activeFilter = null" class="text-left px-3 py-2 text-sm rounded-lg hover:bg-blue-50 font-medium text-slate-700">
                     {{ opt }}
                  </button>
               </div>
            </div>
            
            <!-- CLEAR ALL -->
             <button 
               v-if="statusFilter || genderFilter || civilStatusFilter || minAgeFilter || maxAgeFilter"
               @click="statusFilter = ''; genderFilter = ''; civilStatusFilter = ''; minAgeFilter = null; maxAgeFilter = null"
               class="px-4 py-1.5 rounded-full text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50 transition-colors ml-auto"
            >
               Clear Filters ✕
            </button>
         </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm min-h-[300px]">
      
      <div v-if="isLoading" class="flex items-center justify-center h-40 text-slate-400">
        <svg class="animate-spin h-6 w-6 mr-3 text-blue-900" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading Data...
      </div>

      <table v-else class="w-full">
        <thead class="bg-slate-50/50">
          <tr class="text-left text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            <th class="px-6 py-4">Member Name</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4">Contact</th>
            <th class="px-6 py-4">Baptism Date</th>
            <th class="px-6 py-4 text-right">Manage</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-if="filteredMembers.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-slate-400 italic">
              No members found matching your search.
            </td>
          </tr>
          
          <tr 
            v-for="member in paginatedMembers" 
            :key="member.id" 
            @click="router.push(`/members/${member.id}`)"
            class="group hover:bg-slate-50/50 transition-colors cursor-pointer"
          >
            <td class="px-6 py-5 flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-blue-900">
                {{ getInitials(member.full_name) }}
              </div>
              <div>
                <span class="block font-semibold text-slate-700">{{ member.full_name }}</span>
                <span class="text-xs text-slate-400">{{ member.email || 'No email' }}</span>
              </div>
            </td>
            <td class="px-6 py-5">
              <span 
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                :class="{
                  'bg-green-100 text-green-700': member.status === 'Active',
                  'bg-indigo-100 text-indigo-700': member.status === 'Child',
                  'bg-slate-100 text-slate-500': member.status === 'Inactive',
                  'bg-amber-100 text-amber-700': member.status === 'Visitor',
                  'bg-red-100 text-red-700': member.status === 'Transferred',
                  'bg-stone-800 text-white': member.status === 'Deceased',
                  'bg-teal-100 text-teal-800': member.status === 'Abroad',
                  'bg-rose-100 text-rose-800': member.status === 'Drop',
                  'bg-orange-100 text-orange-800': member.status === 'Missing'
                }"
              >
                {{ member.status || 'Unknown' }}
              </span>
            </td>
            <td class="px-6 py-5 text-sm text-slate-500 font-mono">{{ member.phone_no || 'N/A' }}</td>
            <td class="px-6 py-5 text-sm text-slate-500">{{ member.baptism_date || '-' }}</td>
            <td class="px-6 py-5 text-right">
              <button 
                @click="router.push(`/members/${member.id}`)"
                class="text-blue-900 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
              >
                View Record →
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination Footer -->
      <div v-if="totalPages > 1" class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span class="text-xs text-slate-500 font-medium">
           Page {{ currentPage }} of {{ totalPages }} ({{ filteredMembers.length }} results)
        </span>
        <div class="flex gap-2">
           <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-3 py-1 text-xs font-bold rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
           >
              Previous
           </button>
           <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-xs font-bold rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
           >
              Next
           </button>
        </div>
      </div>
    </div>
  </div>
</template>