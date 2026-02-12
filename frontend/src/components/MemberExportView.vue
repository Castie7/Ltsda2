<script setup lang="ts">
import { useMemberExportView } from '../composables/useMemberExportView';
import MemberPrintView from './MemberPrintView.vue';

const {
  router,
  selectedMembers,
  isLoading,
  searchQuery,
  statusFilter,
  genderFilter,
  civilStatusFilter,
  minAgeFilter,
  maxAgeFilter,
  activeFilter,
  toggleFilterMenu,
  filteredMembers,
  currentPage,
  totalPages,
  paginatedMembers,
  nextPage,
  prevPage,
  toggleSelection,
  toggleSelectAll,
  isAllSelected,
  getSelectedMembersData,
  printSelected,
  calculateAge,
} = useMemberExportView();
</script>
<template>
<div class="p-8">
   <div class="mb-6 print:hidden">
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
         <div>
            <h1 class="text-2xl font-bold text-slate-800">Bulk Export Members</h1>
            <p class="text-slate-500 text-sm">Select members to print their records.</p>
         </div>
         
         <div class="flex gap-4 items-center self-end md:self-auto">
            <div class="text-sm bg-blue-50 text-blue-800 px-4 py-2 rounded-lg font-bold flex items-center whitespace-nowrap">
               {{ selectedMembers.size }} Selected
            </div>
            <button 
               @click="printSelected"
               :disabled="selectedMembers.size === 0"
               class="bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white px-6 py-2 rounded-xl font-bold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
            >
               🖨️ Print Selected
            </button>
         </div>
      </div>

      <!-- FILTERS TOOLBAR -->
      <div class="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
         <!-- Search Line -->
         <div class="relative w-full">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
               v-model="searchQuery" 
               type="text" 
               placeholder="Search by name or code..." 
               class="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-900/20 text-sm"
            />
         </div>
         
         <!-- Filter Buttons -->
         <div class="flex flex-wrap gap-2 px-2 pb-2">
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
                        <input v-model.number="minAgeFilter" type="number" class="w-full border rounded px-2 py-1 text-sm">
                     </div>
                     <div>
                        <label class="text-xs font-bold text-slate-400 uppercase">Max Age</label>
                        <input v-model.number="maxAgeFilter" type="number" class="w-full border rounded px-2 py-1 text-sm">
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
   </div>

   <!-- LOADING SCREEN -->
   <div v-if="isLoading" class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
      <div class="text-blue-900 font-bold">Loading Members...</div>
   </div>

   <!-- LIST -->
   <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
      <div class="p-4 border-b border-slate-100 flex items-center bg-slate-50 font-bold text-slate-500 text-xs uppercase tracking-wider">
         <div class="w-12 text-center">
            <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer w-4 h-4">
         </div>
         <div class="w-24">Code</div>
         <div class="flex-1">Full Name</div>
         <div class="w-32">Status</div>
         <div class="w-40">Age / Gender</div>
      </div>
      
      <div class="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
         <div v-if="filteredMembers.length === 0" class="p-8 text-center text-slate-400 italic">
            No members found matching "{{ searchQuery }}"
         </div>
         <div 
            v-for="member in paginatedMembers" 
            :key="member.id"
            class="p-4 flex items-center hover:bg-slate-50 transition-colors cursor-pointer group"
            @click="router.push(`/members/${member.id}`)"
         >
            <div class="w-12 text-center" @click.stop>
               <input 
                  type="checkbox" 
                  :checked="selectedMembers.has(member.id)" 
                  @change="toggleSelection(member.id)"
                  class="rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer w-4 h-4"
               >
            </div>
            <div class="w-24 font-mono text-slate-400 text-xs">{{ member.member_code || '---' }}</div>
            <div class="flex-1 font-bold text-slate-800">{{ member.full_name }}</div>
            <div class="w-32">
               <span 
                  class="px-2 py-1 rounded-full text-[10px] uppercase font-bold"
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
                  {{ member.status }}
               </span>
            </div>
            <div class="w-40 text-sm text-slate-500">{{ calculateAge(member.birth_date) }} / {{ member.gender }}</div>
         </div>
      </div>
       
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

   <!-- HIDDEN PRINT AREA -->
   <div class="hidden print:block absolute top-0 left-0 w-full min-h-screen bg-white z-[9999]">
      <div 
         v-for="member in getSelectedMembersData" 
         :key="member.id" 
         class="print-page-break"
      >
         <MemberPrintView :member="member" />
      </div>
   </div>
</div>
</template>

<style scoped src="../styles/MemberExportView.css"></style>