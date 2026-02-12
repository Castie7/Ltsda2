<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 1. Define the shape of our Member object
interface Member {
  id: number;
  full_name: string;
  member_code: string;
  status: string;       // Matches 'Active', 'Inactive'
  civil_status: string;
  gender: string;
  phone_no: string;     
  email: string;
  birth_date: string;
  baptism_date: string;
}

const members = ref<Member[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');

// Filters State
const statusFilter = ref('');
const genderFilter = ref('');
const civilStatusFilter = ref('');
const minAgeFilter = ref<number | null>(null);
const maxAgeFilter = ref<number | null>(null);
const activeFilter = ref<string | null>(null);

const toggleFilterMenu = (name: string) => {
   activeFilter.value = activeFilter.value === name ? null : name;
};

// 2. Fetch data from CodeIgniter 4 API
const fetchMembers = async (): Promise<void> => {
  try {
    const response = await fetch('http://localhost:8080/api/members');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    members.value = data;
  } catch (error) {
    console.error("Error loading members:", error);
  } finally {
    isLoading.value = false;
  }
};

const calculateAge = (birthDate: string | null) => {
   if (!birthDate) return null;
   const today = new Date();
   const birth = new Date(birthDate);
   let age = today.getFullYear() - birth.getFullYear();
   const m = today.getMonth() - birth.getMonth();
   if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
   }
   return age;
};

// 3. Client-side Search Logic
const filteredMembers = computed(() => {
  let result = members.value;

  // Text Search
  if (searchQuery.value) {
      const lowerQuery = searchQuery.value.toLowerCase();
      result = result.filter(m => 
        (m.full_name && m.full_name.toLowerCase().includes(lowerQuery)) ||
        (m.status && m.status.toLowerCase().includes(lowerQuery)) ||
        (m.member_code && m.member_code.toLowerCase().includes(lowerQuery))
      );
  }

   // Status Filter
   if (statusFilter.value) {
       result = result.filter(m => m.status === statusFilter.value);
   }

   // Gender Filter
   if (genderFilter.value) {
       result = result.filter(m => m.gender === genderFilter.value);
   }

   // Civil Status Filter
   if (civilStatusFilter.value) {
       result = result.filter(m => m.civil_status === civilStatusFilter.value);
   }

   // Age Filter
   if (minAgeFilter.value !== null || maxAgeFilter.value !== null) {
       result = result.filter(m => {
          const age = calculateAge(m.birth_date);
          if (age === null) return false; 
          
          if (minAgeFilter.value !== null && age < minAgeFilter.value) return false;
          if (maxAgeFilter.value !== null && age > maxAgeFilter.value) return false;
          
          return true;
       });
   }
   return result;
});

// Pagination Logic
const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPage));

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredMembers.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

// Reset to page 1 when filters change
watch([searchQuery, statusFilter, genderFilter, civilStatusFilter, minAgeFilter, maxAgeFilter], () => {
  currentPage.value = 1;
});

// Navigate to Add Page
const goToAddMember = () => {
  router.push('/members/add');
};

// Helper: Get Initials (Safety check added)
const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

onMounted(fetchMembers);
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <header class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Church Registry</h1>
        <p class="text-slate-500 mt-1">
          <span v-if="isLoading">Loading records...</span>
          <span v-else>Managing {{ members.length }} records at La Trinidad SDA.</span>
        </p>
      </div>
      <div class="flex gap-3">
        <button 
          @click="router.push('/import')"
          class="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <span>📥</span> Import
        </button>  
        <button 
            @click="goToAddMember"
            class="bg-blue-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
            <span>+</span> New Member
        </button>
      </div>
    </header>

    <div class="bg-white/70 backdrop-blur-md border border-slate-100 p-4 rounded-2xl mb-6 shadow-sm">
         <!-- Search Line -->
         <div class="relative w-full mb-3">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
               v-model="searchQuery" 
               type="text" 
               placeholder="Search by name, status, or member code..." 
               class="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-900/20 text-sm outline-none text-slate-700"
            />
         </div>
         
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
                  <button v-for="opt in ['Active', 'Inactive', 'Regular', 'Visitor', 'Transferred']" :key="opt" @click="statusFilter = opt; activeFilter = null" class="text-left px-3 py-2 text-sm rounded-lg hover:bg-blue-50 font-medium text-slate-700">
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
                  'bg-green-100 text-green-700': member.status === 'Active' || member.status === 'Regular',
                  'bg-slate-100 text-slate-500': member.status === 'Inactive',
                  'bg-amber-100 text-amber-700': member.status === 'Visitor',
                  'bg-red-100 text-red-700': member.status === 'Transferred'
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