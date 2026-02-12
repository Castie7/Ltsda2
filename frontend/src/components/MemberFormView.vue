<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const currentStep = ref(1);
const isLoading = ref(false);
const isEditMode = ref(false);
const memberId = route.params.id;

// UI State for Special Logic
const religionSelect = ref('Roman Catholic');
const isRebaptism = ref(false); 
const selectedFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

const form = ref({
  // --- STEP 1: PERSONAL INFO ---
  member_code: '',
  full_name: '', // We will construct this from parts
  status: 'Active', 
  gender: 'Male',
  civil_status: 'Single',
  birth_date: '',
  birthplace: '',
  mother_name: '',
  father_name: '',
  address_street: '',
  barangay: '',
  town_city: '',
  province: '',
  zip_code: '',
  phone_no: '',
  email: '',
  educational_level: 'College', 
  occupation: '',
  former_religion: 'Roman Catholic', 
  hobbies_gifts: '',
  profile_pic: '', // Stores the filename from DB
  
  // --- STEP 2: BAPTISMAL INFO ---
  baptism_date: '',
  officiating_minister: '',
  place_of_baptism: '',
  rebaptism_date: '',
  rebaptism_minister: '',
  rebaptism_place: '',
  
  // --- STEP 3: TRANSACTION & EXCLUSIONS ---
  received_by: 'Profession of Faith',
  date_received: '',
  from_church: '',
  observation: '',
  exclusion_type: '', 
  exclusion_date: ''
});

// Separate Name Fields for Input
const firstName = ref('');
const lastName = ref('');
const middleName = ref('');

// 1. FETCH DATA IF EDITING
onMounted(async () => {
  if (memberId) {
    isEditMode.value = true;
    isLoading.value = true;
    try {
      const response = await fetch(`http://localhost:8080/api/members/${memberId}`);
      if (!response.ok) throw new Error('Member not found');
      
      const data = await response.json();
      Object.assign(form.value, data);
      
      // PARSE FULL NAME (Format: Last, First Middle)
      if (data.full_name) {
         if (data.full_name.includes(',')) {
             const parts = data.full_name.split(',');
             lastName.value = parts[0].trim();
             
             const rest = parts[1].trim();
             const nameParts = rest.split(' ');
             
             // Simple heuristic: Last part is middle name if > 1 part? 
             // Actually, usually it's "First Middle". 
             // Let's assume all except last word are First Name?
             // Or better: Let's simpler assume "First Name" is everything until the last space?
             // No, Middle name is usually 1 word or Initial.
             // Let's try: First Name is required. Middle is optional.
             
             // Strategy: "First Middle"
             // If we can't perfectly separate, put whole thing in First Name and let user fix.
             firstName.value = rest; 
             if (nameParts.length > 1) {
                 // Assume last part is Middle Name/Initial
                 middleName.value = nameParts.pop() || '';
                 firstName.value = nameParts.join(' ');
             } else {
                 firstName.value = rest;
                 middleName.value = '';
             }
         } else {
             // Fallback
             lastName.value = data.full_name;
         }
      }
      
      // Handle Re-baptism Toggle
      if (data.rebaptism_date && data.rebaptism_date !== '0000-00-00') {
          isRebaptism.value = true;
      }
      
      // Handle Profile Picture Preview
      if (data.profile_pic) {
        imagePreview.value = `http://localhost:8080/uploads/profile_pics/${data.profile_pic}`;
      }
      
      // Handle Religion Dropdown logic
      const standardReligions = ['Roman Catholic', 'Iglesia ni Cristo', 'Born Again Christian', 'Baptist', 'Methodist', 'Anglican / Episcopal', 'Aglipayan', 'Jehovah\'s Witness', 'Mormon (LDS)', 'Islam', 'Buddhism', 'Indigenous Beliefs', 'None'];
      if (data.former_religion && !standardReligions.includes(data.former_religion)) {
          religionSelect.value = 'Other';
      } else {
          religionSelect.value = data.former_religion || 'Roman Catholic';
      }

    } catch (error) {
      console.error(error);
      alert('Error loading member data');
      router.push('/members');
    } finally {
      isLoading.value = false;
    }
  }
});

// Handling File Selection
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    // Create local preview URL
    imagePreview.value = URL.createObjectURL(selectedFile.value);
  }
};

// WATCHERS
watch(isRebaptism, (newVal) => {
  if (!newVal) {
    form.value.rebaptism_date = '';
    form.value.rebaptism_minister = '';
    form.value.rebaptism_place = '';
  }
});

watch(religionSelect, (newVal) => {
  if (newVal !== 'Other') {
    form.value.former_religion = newVal; 
  }
});

// VALIDATION
const validateStep1 = () => {
  // Always require Name
  if (!lastName.value || !firstName.value) {
      alert("Last Name and First Name are required.");
      return false;
  }

  // In Edit Mode, skip other validations
  if (isEditMode.value) return true;

  // In Create Mode, require Birthdate and Birthplace
  if (!form.value.birth_date || !form.value.birthplace) {
    alert("Please fill in all REQUIRED fields:\n- Birthdate\n- Birthplace");
    return false;
  }
  return true;
};

const nextStep = () => {
  if (currentStep.value === 1 && !validateStep1()) return; 
  if (currentStep.value < 3) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

// 2. SUBMIT FORM (FormData used for Image Support)
const submitForm = async () => {
  isLoading.value = true;
  
  // CONSTRUCT FULL NAME before submit
  let constructedName = `${lastName.value}, ${firstName.value}`;
  if (middleName.value) {
      constructedName += ` ${middleName.value}`;
  }
  form.value.full_name = constructedName;
  
  const formData = new FormData();
  
  // Append all form text fields to FormData
  Object.keys(form.value).forEach(key => {
    formData.append(key, (form.value as any)[key] || '');
  });

  // Append the actual image file if one was selected
  if (selectedFile.value) {
    formData.append('profile_pic_file', selectedFile.value);
  }

  // NOTE: We use POST for both create and update because 
  // standard PHP/XAMPP doesn't handle 'PUT' for Multipart files well.
  const url = isEditMode.value 
    ? `http://localhost:8080/api/members/update/${memberId}`
    : 'http://localhost:8080/api/members/create';

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData // Note: No Content-Type header needed for FormData
    });

    if (response.ok) {
      alert(isEditMode.value ? 'Member updated successfully!' : 'Member added successfully!');
      router.push('/members');
    } else {
      const errorData = await response.json();
      
      // Check for Validation Errors
      if (errorData.messages) {
          if (errorData.messages.full_name) {
              alert(errorData.messages.full_name); // Show "Member name already exists"
          } else {
              // Show generic error list
              alert('Error saving:\n' + JSON.stringify(errorData.messages));
          }
      } else {
          alert('Error saving: ' + (errorData.message || 'Check your data.'));
      }
    }
  } catch (error) {
    console.error(error);
    alert('Server connection failed.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-5xl mx-auto p-6 pb-20">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <button @click="router.back()" class="text-slate-400 text-sm hover:text-blue-900 mb-2 font-bold">← Back</button>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ isEditMode ? 'Edit Member Record' : 'New Member Record' }}
        </h1>
        <p class="text-slate-500 text-sm">Appendix 11 - Official Church Clerk Form</p>
      </div>
      <div class="text-right hidden md:block">
        <div class="text-xs font-bold text-slate-400 uppercase">Form Status</div>
        <div class="font-bold" :class="isEditMode ? 'text-amber-600' : 'text-blue-900'">
          {{ isEditMode ? 'Editing Mode' : 'New Draft' }}
        </div>
      </div>
    </div>

    <div class="flex justify-between mb-10 px-2">
      <div v-for="step in 3" :key="step" class="flex-1 mx-2 relative">
        <div 
          class="h-2 rounded-full transition-all duration-500"
          :class="currentStep >= step ? 'bg-blue-900' : 'bg-slate-200'"
        ></div>
        <div class="text-[10px] uppercase font-bold mt-3 text-center tracking-widest" :class="currentStep >= step ? 'text-blue-900' : 'text-slate-300'">
          {{ step === 1 ? 'Personal' : step === 2 ? 'Baptismal' : 'Transaction' }}
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10 relative overflow-hidden">
      <div v-if="isLoading && isEditMode" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
         <span class="text-blue-900 font-bold animate-pulse">Loading Member Data...</span>
      </div>

      <form @submit.prevent="submitForm">
        
        <div v-show="currentStep === 1" class="space-y-8 animate-fade-in">
          

          <div class="flex items-center justify-between border-b pb-4">
            <h2 class="text-xl font-bold text-blue-900">Personal Information</h2>
            <span class="text-xs text-red-500 font-bold">* Required Fields</span>
          </div>



          <div class="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
             <div class="relative group">
                <div class="w-28 h-28 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                   <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
                   <div v-else class="text-center px-2">
                      <span class="text-[10px] text-slate-300 font-bold uppercase block">No Photo</span>
                   </div>
                </div>
             </div>
             <div class="flex-1 text-center md:text-left">
                <label class="label">Profile Picture (Optional)</label>
                <input type="file" @change="handleFileChange" accept="image/*" class="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
                <p class="text-[10px] text-slate-400 mt-2">Recommended: Square JPEG/PNG, max 2MB</p>
             </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <div class="col-span-12 md:col-span-6 grid grid-cols-1 md:grid-cols-12 gap-2">
               <div class="md:col-span-5">
                  <label class="label">Last Name <span class="text-red-500">*</span></label>
                  <input v-model="lastName" type="text" class="input-field" placeholder="Dela Cruz" required />
               </div>
               <div class="md:col-span-5">
                   <label class="label">First Name <span class="text-red-500">*</span></label>
                   <input v-model="firstName" type="text" class="input-field" placeholder="Juan" required />
               </div>
               <div class="md:col-span-2">
                   <label class="label">M.I.</label>
                   <input v-model="middleName" type="text" class="input-field text-center" placeholder="A." />
               </div>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="label">Status <span class="text-red-500">*</span></label>
              <select v-model="form.status" class="input-field">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Child">Child</option>
                <option value="Transferred">Transferred</option>
                <option value="Deceased">Deceased</option>
                <option value="Abroad">Abroad</option>
                <option value="Missing">Missing</option>
                <option value="Drop">Drop</option>
              </select>
            </div>
            <div class="col-span-6 md:col-span-4">
              <label class="label">Gender <span class="text-red-500">*</span></label>
              <select v-model="form.gender" class="input-field">
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div class="col-span-6 md:col-span-4">
              <label class="label">Birth Date <span v-if="!isEditMode" class="text-red-500">*</span></label>
              <input v-model="form.birth_date" type="date" class="input-field" :required="!isEditMode" />
            </div>
            <div class="col-span-12 md:col-span-4">
              <label class="label">Birthplace <span v-if="!isEditMode" class="text-red-500">*</span></label>
              <input v-model="form.birthplace" type="text" class="input-field" placeholder="Town, Province" :required="!isEditMode" />
            </div>
            <div class="col-span-12 md:col-span-4">
              <label class="label">Civil Status <span class="text-red-500">*</span></label>
              <select v-model="form.civil_status" class="input-field">
                <option>Single</option>
                <option>Married</option>
                <option>Widow/er</option>
                <option>Separated</option>
              </select>
            </div>
          </div>

          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mt-6">Additional Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label class="label">Father's Name</label><input v-model="form.father_name" type="text" class="input-field" /></div>
            <div><label class="label">Mother's Name</label><input v-model="form.mother_name" type="text" class="input-field" /></div>
            <div class="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-2">
               <div class="col-span-3"><label class="label text-slate-800">Complete Address</label></div>
               <input v-model="form.address_street" placeholder="Street / House No." class="input-field" />
               <input v-model="form.barangay" placeholder="Barangay" class="input-field" />
               <input v-model="form.town_city" placeholder="Town / City" class="input-field" />
               <input v-model="form.province" placeholder="Province" class="input-field" />
               <input v-model="form.zip_code" placeholder="Zip Code" class="input-field" />
               <input v-model="form.phone_no" placeholder="Phone Number" class="input-field" />
               <input v-model="form.email" type="email" placeholder="Email Address" class="input-field" />
            </div>
            <div>
              <label class="label">Educational Level</label>
              <select v-model="form.educational_level" class="input-field">
                <option value="Elementary">Elementary</option>
                <option value="High School">High School</option>
                <option value="Senior High School">Senior High School</option>
                <option value="Vocational">Vocational / Technical</option>
                <option value="College">College / Bachelor's</option>
                <option value="Post Graduate">Post Graduate (Master's/PhD)</option>
                <option value="None">None / N/A</option>
              </select>
            </div>
            <div><label class="label">Occupation</label><input v-model="form.occupation" type="text" class="input-field" /></div>
            <div>
              <label class="label">Former Religion</label>
              <select v-model="religionSelect" class="input-field">
                <option value="Roman Catholic">Roman Catholic</option>
                <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
                <option value="Born Again Christian">Born Again Christian</option>
                <option value="Baptist">Baptist</option>
                <option value="Methodist">Methodist</option>
                <option value="Anglican / Episcopal">Anglican / Episcopal</option>
                <option value="Aglipayan">Aglipayan (IFI)</option>
                <option value="Jehovah's Witness">Jehovah's Witness</option>
                <option value="Mormon (LDS)">Mormon (LDS)</option>
                <option value="Islam">Islam</option>
                <option value="Buddhism">Buddhism</option>
                <option value="Indigenous Beliefs">Indigenous Beliefs</option>
                <option value="None">None / Atheist</option>
                <option value="Other">Other (Please Specify)</option>
              </select>
              <div v-if="religionSelect === 'Other'" class="mt-3 animate-fade-in">
                <label class="text-[10px] text-blue-900 font-bold uppercase ml-1">Specify Religion:</label>
                <input v-model="form.former_religion" type="text" class="input-field border-blue-300 bg-blue-50/50" />
              </div>
            </div>
            <div><label class="label">Hobbies / Gifts</label><input v-model="form.hobbies_gifts" type="text" class="input-field" /></div>
          </div>
        </div>

        <div v-show="currentStep === 2" class="space-y-8 animate-fade-in">
          <h2 class="text-xl font-bold text-blue-900 border-b pb-4">Baptismal Record</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="label">Date of Baptism</label>
                <input v-model="form.baptism_date" type="text" class="input-field" placeholder="YYYY-MM-DD or Month Year (e.g. Sept 1995)" />
                <p class="text-[10px] text-slate-400 mt-1">Format: Exact Date, Year, or Month & Year</p>
            </div>
            <div><label class="label">Officiating Minister</label><input v-model="form.officiating_minister" type="text" class="input-field" /></div>
            <div class="col-span-2"><label class="label">Place of Baptism</label><input v-model="form.place_of_baptism" type="text" class="input-field" /></div>
          </div>

          <div class="bg-amber-50 rounded-2xl p-6 border border-amber-100 mt-6">
            <div class="flex items-center space-x-3 mb-4">
              <input type="checkbox" v-model="isRebaptism" id="rebaptism" class="w-5 h-5 text-blue-900 rounded focus:ring-blue-900">
              <label for="rebaptism" class="text-slate-800 font-bold cursor-pointer select-none">Was this member Re-baptized?</label>
            </div>
            <div v-if="isRebaptism" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
               <div>
                   <label class="label text-amber-800">Re-baptism Date</label>
                   <input v-model="form.rebaptism_date" type="text" class="input-field bg-white border-amber-200" placeholder="YYYY-MM-DD or Month Year" />
               </div>
               <div><label class="label text-amber-800">Officiating Minister</label><input v-model="form.rebaptism_minister" type="text" class="input-field bg-white border-amber-200" /></div>
               <div class="col-span-2"><label class="label text-amber-800">Place of Re-baptism</label><input v-model="form.rebaptism_place" type="text" class="input-field bg-white border-amber-200" /></div>
            </div>
          </div>
        </div>

        <div v-show="currentStep === 3" class="space-y-8 animate-fade-in">
          <h2 class="text-xl font-bold text-blue-900 border-b pb-4">Membership History</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="label">Received By</label>
              <select v-model="form.received_by" class="input-field">
                <option>Profession of Faith</option>
                <option>Letter of Transfer</option>
                <option>Baptism</option>
              </select>
            </div>
            <div><label class="label">Date Received</label><input v-model="form.date_received" type="date" class="input-field" /></div>
            <div v-if="form.received_by === 'Letter of Transfer'" class="col-span-2 animate-fade-in">
              <label class="label">Transferred From</label><input v-model="form.from_church" type="text" class="input-field" />
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-slate-100">
            <h3 class="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Exclusions / Removal (Official Checklist)</h3>
            <div class="bg-red-50/50 p-6 rounded-2xl border border-red-100">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label class="label text-red-700">Reason for Exclusion</label>
                  <div class="flex flex-col gap-3">
                    <label class="flex items-center gap-3 cursor-pointer" v-for="opt in ['Discipline', 'Unknown whereabouts', 'Reform', 'Death']" :key="opt">
                      <input type="radio" v-model="form.exclusion_type" :value="opt" class="w-4 h-4 text-red-600">
                      <span class="text-sm text-slate-700">{{ opt }}</span>
                    </label>
                    <button 
                      v-if="form.exclusion_type" 
                      type="button" 
                      @click="form.exclusion_type = ''; form.exclusion_date = '';"
                      class="text-[10px] text-red-500 font-bold uppercase hover:underline text-left w-fit"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                <div v-if="form.exclusion_type" class="animate-fade-in">
                  <label class="label text-red-700">Date of Exclusion / Death</label>
                  <input v-model="form.exclusion_date" type="date" class="input-field bg-white border-red-200 focus:ring-red-900/20" />
                </div>
                <div class="mt-4">
            <label class="label">Observations / Notes</label>
            <textarea v-model="form.observation" rows="4" class="input-field" placeholder="Additional clerk remarks..."></textarea>
          </div>
        </div>
            </div>
          </div>


        </div>

        <div class="mt-10 flex justify-between pt-6 border-t border-slate-50">
          <button v-if="currentStep > 1" @click="prevStep" type="button" class="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Back</button>
          <div v-else></div>

          <button v-if="currentStep < 3" @click="nextStep" type="button" class="bg-blue-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 transition-all">Next Step</button>
          
          <button v-else type="submit" :disabled="isLoading" class="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <span v-if="isLoading">Saving...</span>
            <span v-else>{{ isEditMode ? 'Update Record' : 'Save Record' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.label { @apply block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2; }

.input-field { 
  @apply w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300; 
}

.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}
</style>