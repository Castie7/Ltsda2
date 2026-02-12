<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isUploading = ref(false);
const uploadStatus = ref<{ type: 'success' | 'error', message: string } | null>(null);

const downloadTemplate = () => {
   const headers = [
      'first_name', 'middle_name', 'last_name', 
      'member_code', 'status', 'gender', 'civil_status', 
      'birth_date', 'birthplace', 
      'address_street', 'barangay', 'town_city', 'province', 'zip_code',
      'phone_no', 'email', 
      'educational_level', 'occupation', 
      'hear_about_us', // derived field or just extra? Form had former_religion
      'former_religion', 'hobbies_gifts',
      'baptism_date', 'officiating_minister', 'place_of_baptism',
      'rebaptism_date', 'rebaptism_minister', 'rebaptism_place',
      'received_by', 'date_received', 'from_church',
      'observation'
   ];
   
   const exampleRow = [
      'John', 'A.', 'Doe',
      'MEM001', 'Active', 'Male', 'Single',
      '1990-01-01', 'Manila',
      '123 Sun St.', 'San Jose', 'La Trinidad', 'Benguet', '2601',
      '09123456789', 'john.doe@example.com',
      'College', 'Engineer',
      '', 
      'Roman Catholic', 'Singing',
      '2010-05-15', 'Ptr. Smith', 'LTSDA Church',
      '', '', '',
      'Profession of Faith', '2010-05-15', '',
      'No specific observations'
   ];

  const csvContent = headers.join(',') + '\n' + exampleRow.join(',');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'LTSDA_Member_Template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0] || null;
    uploadStatus.value = null; // Clear previous status
  }
};

const uploadFile = async () => {
  if (!selectedFile.value) return;

  isUploading.value = true;
  uploadStatus.value = null;

  const formData = new FormData();
  formData.append('csv_file', selectedFile.value);

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) formData.append('current_user_id', user.id);
    // Auth.php returns 'name', not 'full_name'. key is user.name
    const userName = user.name || user.full_name; 
    if (userName) formData.append('current_user_name', userName);

    // Assuming backend endpoint is /api/members/import
    const response = await fetch('http://localhost:8080/api/members/import', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
        // const result = await response.json(); 
        uploadStatus.value = { type: 'success', message: 'Members imported successfully!' };
        selectedFile.value = null;
        if(fileInput.value) fileInput.value.value = '';
        setTimeout(() => router.push('/members'), 1500); // Redirect after success
    } else {
        const errorText = await response.text();
        uploadStatus.value = { type: 'error', message: `Upload failed: ${errorText || response.statusText}` };
    }
  } catch (error) {
    uploadStatus.value = { type: 'error', message: 'Network error occurred during upload.' };
    console.error(error);
  } finally {
    isUploading.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <div class="mb-8">
      <button 
        @click="router.back()" 
        class="text-slate-500 hover:text-blue-900 font-medium flex items-center gap-2 transition-colors mb-4"
      >
        ← Back to Members
      </button>
      <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Import Members</h1>
      <p class="text-slate-500 mt-2">Upload a CSV file to bulk add members to the registry.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Instructions & Template -->
      <div class="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
        <h2 class="text-lg font-bold text-blue-900 mb-4">1. Prepare your data</h2>
        <p class="text-slate-600 text-sm mb-4">
          Download the template CSV file to ensure your data is formatted correctly. 
          The file should include headers for all required fields.
        </p>
        <ul class="text-sm text-slate-600 list-disc list-inside mb-6 space-y-1">
           <li><b>Personal Info:</b> Name, Address, Contact, Status</li>
           <li><b>Background:</b> Education, Occupation, Religion</li>
           <li><b>Church:</b> Baptism, Re-baptism, Membership History</li>
           <li><b>Dates:</b> YYYY-MM-DD format (e.g. 1990-01-31)</li>
        </ul>
        <button 
          @click="downloadTemplate"
          class="bg-white border border-blue-200 text-blue-900 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm"
        >
          <span class="text-lg">📄</span> Download CSV Template
        </button>
      </div>

      <!-- Upload Area -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900 mb-4">2. Upload CSV</h2>
        
        <div 
            class="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center transition-colors hover:border-blue-300 hover:bg-slate-50"
            @dragover.prevent
            @drop.prevent="selectedFile = $event.dataTransfer?.files[0] || null"
        >
            <input 
                ref="fileInput"
                type="file" 
                accept=".csv" 
                class="hidden" 
                @change="handleFileChange"
            />
            
            <div v-if="!selectedFile">
                <div class="text-4xl mb-3">☁️</div>
                <p class="text-slate-600 font-medium mb-1">Drag and drop your file here</p>
                <p class="text-slate-400 text-xs mb-4">or</p>
                <button 
                    @click="fileInput?.click()"
                    class="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors"
                >
                    Browse Files
                </button>
            </div>

            <div v-else>
                <div class="text-4xl mb-3">📄</div>
                <p class="text-slate-800 font-bold break-all mb-1">{{ selectedFile.name }}</p>
                <p class="text-slate-400 text-xs mb-4">{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
                <button 
                    @click="selectedFile = null; uploadStatus = null"
                    class="text-red-500 text-xs font-bold hover:underline"
                >
                    Remove File
                </button>
            </div>
        </div>

        <!-- Status Messages -->
        <div v-if="uploadStatus" class="mt-4 p-3 rounded-lg text-sm font-medium" 
            :class="uploadStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            {{ uploadStatus.message }}
        </div>

        <button 
            v-if="selectedFile"
            @click="uploadFile"
            :disabled="isUploading"
            class="w-full mt-4 bg-blue-900 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            <span v-if="isUploading" class="animate-spin">⏳</span>
            {{ isUploading ? 'Importing...' : 'Start Import' }}
        </button>

      </div>
    </div>
  </div>
</template>
