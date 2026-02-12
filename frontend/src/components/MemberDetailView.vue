<script setup lang="ts">
import { useMemberDetailView } from '../composables/useMemberDetailView';
import MemberPrintView from './MemberPrintView.vue';

const {
  router,
  member,
  isLoading,
  history,
  showHistory,
  formatFieldName,
  formatDate,
  openPrintView,
} = useMemberDetailView();
</script>

<template>
  <div class="max-w-6xl mx-auto p-6 pb-20 print:hidden">
    <div v-if="isLoading" class="text-center py-20 text-slate-400">
      Loading record...
    </div>

    <div v-else-if="member" class="animate-fade-in">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <button @click="router.back()" class="text-slate-400 text-sm hover:text-blue-900 mb-2 font-bold">← Back to List</button>
          <div class="flex items-center gap-4">
            <h1 class="text-3xl font-extrabold text-slate-900">{{ member.full_name }}</h1>
            <span 
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
              :class="member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'"
            >
              {{ member.status }}
            </span>
          </div>
          <div class="flex gap-4 mt-1 text-sm text-slate-500">
             <span class="bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold border border-slate-200">
                Code: <span class="font-mono text-slate-900">{{ member.member_code || 'N/A' }}</span>
             </span>
             <span>Email: <span class="text-blue-600">{{ member.email || 'N/A' }}</span></span>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button 
            @click="router.push(`/members/edit/${member.id}`)"
            class="bg-blue-900 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-blue-800 transition-colors flex items-center gap-2"
          >
            <span>✏️</span> Edit Record
          </button>
          <button 
            @click="openPrintView"
            class="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      <!-- CLERK OBSERVATIONS / NOTES - PROMINENT DISPLAY -->
      <div v-if="member.observation" class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm mb-8 flex gap-4 items-start">
         <div class="text-2xl pt-1">📌</div>
         <div>
            <h3 class="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2">Clerk Observations / Notes</h3>
            <p class="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">{{ member.observation }}</p>
         </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- LEFT COLUMN: MAIN INFO -->
        <div class="lg:col-span-2 space-y-6">
           
           <!-- PERSONAL & FAMILY CARD -->
           <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              
              <!-- PROFILE HEADER INSIDE CARD -->
              <div class="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-slate-100">
                 <div class="shrink-0 flex flex-col items-center">
                    <div class="w-40 h-40 rounded-full bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                       <img 
                          v-if="member.profile_pic" 
                          :src="`http://localhost:8080/uploads/profile_pics/${member.profile_pic}`" 
                          class="w-full h-full object-cover"
                          alt="Profile"
                       />
                       <div v-else class="text-slate-300 flex flex-col items-center">
                          <span class="text-4xl mb-1">👤</span>
                          <span class="text-xs font-bold uppercase">No Photo</span>
                       </div>
                    </div>
                 </div>
                 
                 <div class="flex-grow">
                    <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Personal Information</h2>
                    <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
                       <div><label class="detail-label">Birth Date</label><div class="detail-value">{{ member.birth_date }}</div></div>
                       <div><label class="detail-label">Gender</label><div class="detail-value">{{ member.gender }}</div></div>
                       <div><label class="detail-label">Civil Status</label><div class="detail-value">{{ member.civil_status }}</div></div>
                       <div class="col-span-2"><label class="detail-label">Birthplace</label><div class="detail-value">{{ member.birthplace }}</div></div>
                       <div><label class="detail-label">Phone</label><div class="detail-value font-mono">{{ member.phone_no || 'N/A' }}</div></div>
                       <div class="col-span-3"><label class="detail-label">Occupation</label><div class="detail-value">{{ member.occupation || 'N/A' }}</div></div>
                    </div>
                 </div>
              </div>

              <!-- FAMILY BACKGROUND -->
              <div class="mb-8">
                 <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Family Background</h2>
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label class="detail-label">Spouse's Name</label><div class="detail-value">{{ member.spouse_name || 'N/A' }}</div></div>
                    <div><label class="detail-label">Father's Name</label><div class="detail-value">{{ member.father_name || 'N/A' }}</div></div>
                    <div><label class="detail-label">Mother's Name</label><div class="detail-value">{{ member.mother_name || 'N/A' }}</div></div>
                 </div>
              </div>

              <!-- ADDRESS -->
              <div>
                 <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Current Address</h2>
                 <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div class="col-span-2"><label class="detail-label">Street / House No.</label><div class="detail-value">{{ member.address_street || 'N/A' }}</div></div>
                       <div><label class="detail-label">Barangay</label><div class="detail-value">{{ member.barangay || 'N/A' }}</div></div>
                       <div><label class="detail-label">Town / City</label><div class="detail-value">{{ member.town_city || 'N/A' }}</div></div>
                       <div><label class="detail-label">Province</label><div class="detail-value">{{ member.province || 'N/A' }}</div></div>
                       <div><label class="detail-label">Zip Code</label><div class="detail-value">{{ member.zip_code || 'N/A' }}</div></div>
                    </div>
                 </div>
              </div>

           </div>
        </div>

        <!-- RIGHT COLUMN: SPIRITUAL & OTHER -->
        <div class="space-y-6">
           <!-- Spiritual Record (Existing) -->
          <div class="bg-blue-900 text-white p-6 rounded-3xl shadow-xl shadow-blue-900/20">
            <h2 class="text-xs font-bold text-blue-200 uppercase tracking-wider mb-6 border-b border-blue-800 pb-2">Spiritual Record</h2>
            <div class="space-y-5">
              <div><label class="block text-[10px] text-blue-300 uppercase font-bold">Baptism Date</label><div class="text-white font-bold text-xl">{{ member.baptism_date || 'N/A' }}</div></div>
              <div><label class="block text-[10px] text-blue-300 uppercase font-bold">Officiating Minister</label><div class="text-white font-medium">{{ member.officiating_minister || 'N/A' }}</div></div>
              <div><label class="block text-[10px] text-blue-300 uppercase font-bold">Place of Baptism</label><div class="text-white font-medium text-sm leading-relaxed">{{ member.place_of_baptism || 'N/A' }}</div></div>
            </div>
            <div class="mt-6 pt-4 border-t border-blue-800 bg-blue-800/30 -mx-6 px-6 pb-2">
              <div class="text-xs font-bold text-amber-400 mb-2 mt-4 uppercase tracking-wider">Re-baptism Record</div>
              <div class="space-y-2">
                 <div class="text-sm"><span class="text-blue-300 text-xs">Date:</span> {{ member.rebaptism_date || 'N/A' }}</div>
                 <div class="text-sm"><span class="text-blue-300 text-xs">Minister:</span> {{ member.rebaptism_minister || 'N/A' }}</div>
                 <div class="text-sm"><span class="text-blue-300 text-xs">Place:</span> {{ member.rebaptism_place || 'N/A' }}</div>
              </div>
            </div>
          </div>

          <!-- Other Details (Existing) -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Other Details</h2>
            <div class="space-y-4">
              <div><label class="detail-label">Educational Level</label><div class="detail-value">{{ member.educational_level || 'N/A' }}</div></div>
              <div><label class="detail-label">Former Religion</label><div class="detail-value">{{ member.former_religion || 'None' }}</div></div>
              <div><label class="detail-label">Hobbies / Spiritual Gifts</label><div class="detail-value italic text-slate-600">{{ member.hobbies_gifts || 'Not specified' }}</div></div>
            </div>
          </div>
        </div>

        <!-- BOTTOM: TRANSACTION HISTORY -->
        <div class="bg-slate-50 p-8 rounded-3xl border border-slate-200 lg:col-span-3">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Membership Transaction History</h2>
          
          <div class="flex flex-col md:flex-row gap-8 items-start">
             <div class="flex items-start gap-4 flex-1">
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-3xl">📥</div>
                <div>
                   <div class="text-xs text-slate-400 uppercase font-bold">Method Received</div>
                   <div class="text-lg font-bold text-slate-800 mt-1">{{ member.received_by }}</div>
                   <div class="text-sm text-slate-500 mt-1">Date: {{ member.date_received || 'Unknown' }}</div>
                </div>
             </div>

             <div class="flex items-start gap-4 flex-1">
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-3xl">⛪</div>
                <div>
                   <div class="text-xs text-slate-400 uppercase font-bold">Transferred From</div>
                   <div class="text-lg font-bold text-blue-900 mt-1">{{ member.from_church || 'N/A' }}</div>
                     <div class="text-sm text-slate-500 mt-1">Letter Date: {{ member.date_received_letter || 'N/A' }}</div>
                     <div class="text-sm text-slate-500">Group: {{ member.from_church_group || 'N/A' }}</div>
                </div>
             </div>

             <div class="flex items-start gap-4 flex-1">
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-3xl">📤</div>
                <div>
                   <div class="text-xs text-slate-400 uppercase font-bold">Transferred To</div>
                   <div class="text-lg font-bold text-amber-600 mt-1">{{ member.to_church_group || 'N/A' }}</div>
                     <div class="text-sm text-slate-500 mt-1">Date: {{ member.date_transferred_letter || 'N/A' }}</div>
                </div>
             </div>


          </div>

           <!-- EXCLUSION RECORD -->
           <div class="mt-6 pt-6 border-t border-slate-200">
              <div 
                 class="p-4 rounded-2xl flex items-start gap-4 border"
                 :class="member.exclusion_type ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'"
              >
                 <div class="text-3xl">{{ member.exclusion_type ? '⚠️' : '✅' }}</div>
                 <div>
                    <div 
                       class="text-xs uppercase font-bold"
                       :class="member.exclusion_type ? 'text-red-700' : 'text-slate-400'"
                    >
                       Exclusion Record
                    </div>
                    <div 
                       class="text-lg font-bold mt-1"
                       :class="member.exclusion_type ? 'text-red-900' : 'text-slate-500'"
                    >
                       {{ member.exclusion_type || 'None (Active Member)' }}
                    </div>
                    <div 
                       class="text-sm mt-1"
                       :class="member.exclusion_type ? 'text-red-600' : 'text-slate-400'"
                    >
                       Date: {{ member.exclusion_date || 'N/A' }}
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>

    <!-- UPDATE HISTORY BOX -->
    <div v-if="member" class="mt-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
       <button 
          @click="showHistory = !showHistory"
          class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
       >
          <div class="flex items-center gap-3">
             <span class="text-lg">📋</span>
             <span class="text-sm font-bold text-slate-700">Update History</span>
             <span v-if="history.length" class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{{ history.length }}</span>
          </div>
          <span class="text-slate-400 text-xs">{{ showHistory ? '▲ Hide' : '▼ Show' }}</span>
       </button>

       <div v-if="showHistory" class="border-t border-slate-100">
          <div v-if="history.length === 0" class="px-6 py-8 text-center text-slate-400 text-sm">
             No changes recorded yet.
          </div>
          <div v-else class="divide-y divide-slate-50 max-h-96 overflow-y-auto">
             <div v-for="entry in history" :key="entry.id" class="px-6 py-4 hover:bg-slate-50/50">
                <div class="flex items-center justify-between mb-2">
                   <div class="flex items-center gap-2">
                      <span class="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold">✏️</span>
                      <span class="text-xs font-bold text-slate-600">{{ entry.changed_by }}</span>
                   </div>
                   <span class="text-[10px] text-slate-400 font-mono">{{ formatDate(entry.created_at) }}</span>
                </div>
                <div class="ml-8 space-y-1">
                   <template v-if="entry.changes">
                      <div 
                         v-for="(change, field) in (typeof entry.changes === 'string' ? JSON.parse(entry.changes) : entry.changes)" 
                         :key="String(field)"
                         class="text-xs text-slate-500"
                      >
                         <span class="font-semibold text-slate-700">{{ formatFieldName(String(field)) }}:</span>
                         <span class="text-red-400 line-through mx-1">{{ change.old || '(empty)' }}</span>
                         →
                         <span class="text-green-600 font-medium ml-1">{{ change.new || '(empty)' }}</span>
                      </div>
                   </template>
                </div>
             </div>
          </div>
       </div>
    </div>

  </div>

  <!-- HIDDEN PRINT VIEW -->
  <div class="hidden print:block fixed inset-0 bg-white z-[9999]">
     <MemberPrintView v-if="member" :member="member" />
  </div>
</template>

<style scoped src="../styles/MemberDetailView.css"></style>
