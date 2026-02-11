<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  member: {
    type: Object,
    required: true
  }
});

const printedBy = ref('System Admin');

onMounted(() => {
   const userStr = localStorage.getItem('user');
   if (userStr) {
      try {
         const user = JSON.parse(userStr);
         if (user.name) {
            printedBy.value = user.name;
         }
      } catch (e) {
         console.error('Error parsing user data', e);
      }
   }
});
</script>

<template>
  <div class="print-container bg-white text-slate-900 font-serif">
    
    <div v-if="member" class="h-full flex flex-col justify-between">
      
      <!-- HEADER -->
      <div class="text-center mb-6 border-b-2 border-black pb-4">
         <div class="uppercase font-bold tracking-widest text-sm mb-1">Mountain Provinces Mission</div>
         <div class="uppercase font-bold tracking-widest text-xs mb-1">of the Seventh-Day Adventists</div>
         <div class="uppercase font-bold tracking-widest text-sm mt-2">La Trinidad Seventh-Day Adventist Church</div>
         <div class="mt-4 text-2xl font-bold uppercase tracking-wide">Membership Record</div>
      </div>

      <!-- MAIN CONTENT - 2 COLUMN LAYOUT -->
      <div class="grid grid-cols-[38%_62%] gap-8">
         
         <!-- LEFT COL: PROFILE, BASIC INFO -->
         <div class="space-y-6">
            
            <!-- PHOTO & STATUS -->
            <div class="text-center">
               <div class="w-36 h-36 mx-auto border-2 border-slate-300 flex items-center justify-center bg-slate-50 mb-3">
                  <img 
                     v-if="member.profile_pic" 
                     :src="`http://localhost:8080/uploads/profile_pics/${member.profile_pic}`" 
                     class="w-full h-full object-cover"
                  />
                  <span v-else class="text-xs text-slate-400 uppercase">No Photo</span>
               </div>
            </div>

            <!-- CONTACT INFO (Address, Phone, Email) -->
            <section>
               <div class="space-y-3">
                  <div><div class="label">Member Code</div><div class="value font-mono font-bold">{{ member.member_code || '___________' }}</div></div>
                  <div><div class="label">Status</div><div class="value font-bold uppercase">{{ member.status }}</div></div>
                  <div><div class="label">Address</div><div class="value">{{ member.address_street }}, {{ member.barangay }}, {{ member.town_city }}</div><div class="value">{{ member.province }} {{ member.zip_code }}</div></div>
                  <div><div class="label">Phone</div><div class="value">{{ member.phone_no || 'N/A' }}</div></div>
                  <div><div class="label">Email</div><div class="value break-all">{{ member.email || 'N/A' }}</div></div>
               </div>
            </section>
         </div>

         <!-- RIGHT COL: PERSONAL, FAMILY, SPIRITUAL, HISTORY -->
         <div class="space-y-5">
            
            <!-- PERSONAL DETAILS (Moved back to Right) -->
            <section>
               <h3 class="section-title">Personal Details</h3>
               <div class="space-y-3"> 
                  <div><div class="label">Full Name</div><div class="value text-lg font-bold uppercase leading-tight">{{ member.full_name }}</div></div>
                  
                  <div class="grid grid-cols-2 gap-2">
                     <div><div class="label">Gender</div><div class="value">{{ member.gender }}</div></div>
                     <div><div class="label">Civil Status</div><div class="value">{{ member.civil_status }}</div></div>
                  </div>

                  <div><div class="label">Birth Date</div><div class="value">{{ member.birth_date }}</div></div>
                  <div><div class="label">Birthplace</div><div class="value">{{ member.birthplace }}</div></div>
                  <div><div class="label">Occupation</div><div class="value">{{ member.occupation || 'N/A' }}</div></div>
               </div>
            </section>

             <!-- OTHER DETAILS (Education/Religion) -->
            <section>
               <div class="grid grid-cols-2 gap-4">
                  <div><div class="label">Educational Level</div><div class="value">{{ member.educational_level || 'N/A' }}</div></div>
                  <div><div class="label">Former Religion</div><div class="value">{{ member.former_religion || 'None' }}</div></div>
               </div>
            </section>
            
            <!-- FAMILY -->
            <section>
               <h3 class="section-title">Family Background</h3>
               <div class="grid grid-cols-1 gap-2">
                  <div><div class="label">Spouse's Name</div><div class="value">{{ member.spouse_name || 'N/A' }}</div></div>
                  <div class="grid grid-cols-2 gap-4">
                     <div><div class="label">Father's Name</div><div class="value">{{ member.father_name || 'N/A' }}</div></div>
                     <div><div class="label">Mother's Name</div><div class="value">{{ member.mother_name || 'N/A' }}</div></div>
                  </div>
               </div>
            </section>

             <!-- SPIRITUAL -->
             <section>
               <h3 class="section-title">Spiritual Record</h3>
               <div class="grid grid-cols-2 gap-4 mb-3">
                  <div><div class="label">Baptism Date</div><div class="value">{{ member.baptism_date || 'N/A' }}</div></div>
                  <div><div class="label">Officiating Minister</div><div class="value">{{ member.officiating_minister || 'N/A' }}</div></div>
                  <div class="col-span-2"><div class="label">Place of Baptism</div><div class="value">{{ member.place_of_baptism || 'N/A' }}</div></div>
               </div>
               
               <div v-if="member.rebaptism_date" class="mt-4 pt-2 border-t border-dashed border-slate-300">
                  <div class="label">Re-baptism</div>
                  <div class="value">{{ member.rebaptism_date }} by {{ member.rebaptism_minister }} at {{ member.rebaptism_place }}</div>
               </div>

                <div class="mt-3 pt-2 border-t border-dashed border-slate-300">
                  <div class="label">Hobbies / Spiritual Gifts</div><div class="value">{{ member.hobbies_gifts || 'N/A' }}</div>
               </div>
            </section>

            <!-- HISTORY -->
            <section>
               <h3 class="section-title">Membership History</h3>
               <div class="space-y-2">
                  <div class="grid grid-cols-2 gap-4 bg-slate-50 p-2 border border-slate-100">
                     <div><div class="label">Received By</div><div class="value">{{ member.received_by }}</div><div class="text-xs text-slate-500">{{ member.date_received }}</div></div>
                     
                     <div v-if="member.from_church">
                        <div class="label">Transferred From</div>
                        <div class="value">{{ member.from_church }}</div>
                        <div class="text-xs text-slate-500" v-if="member.date_received_letter">Letter: {{ member.date_received_letter }}</div>
                     </div>
                  </div>
                  
                  <div v-if="member.to_church_group" class="text-amber-900 bg-amber-50 p-2 border border-amber-200">
                     <div class="label">Transferred To</div>
                     <div class="value">{{ member.to_church_group }}</div>
                     <div class="text-xs" v-if="member.date_transferred_letter">Date: {{ member.date_transferred_letter }}</div>
                  </div>
                  
                  <div v-if="member.exclusion_type" class="text-red-900 bg-red-50 p-2 border border-red-200">
                     <div class="label">Exclusion</div>
                     <div class="value uppercase font-bold">{{ member.exclusion_type }}</div>
                     <div class="text-xs">Date: {{ member.exclusion_date }}</div>
                  </div>
               </div>
            </section>

            <!-- OBSERVATIONS -->
             <section>
               <h3 class="section-title">Observations / Notes</h3>
               <div class="value italic text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 min-h-[60px]">
                  {{ member.observation || 'No additional notes.' }}
               </div>
             </section>
         </div>
      </div>
      
      <!-- FOOTER -->
      <div class="mt-auto pt-4 border-t-2 border-black flex justify-between text-[10px] uppercase">
         <div>Printed by: {{ printedBy }}</div>
         <div>Date: {{ new Date().toLocaleDateString() }}</div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.section-title {
   @apply text-xs uppercase font-bold border-b border-black mb-3 pb-1 tracking-wider text-slate-700;
}

.label {
   @apply text-[9px] uppercase text-slate-500 font-bold mb-0.5 tracking-wide;
}

.value {
   @apply text-sm font-medium text-slate-900 leading-snug;
}

@media print {
   body { -webkit-print-color-adjust: exact; }
   @page { size: A4; margin: 0; }
   .print-container { 
      width: 210mm;
      min-height: 297mm;
      padding: 10mm 10mm 5mm 10mm !important; 
   }
}
</style>
