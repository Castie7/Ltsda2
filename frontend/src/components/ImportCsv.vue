<script setup lang="ts">
import { useImportCsv } from '../composables/useImportCsv';

const {
  router,
  fileInput,
  selectedFile,
  isUploading,
  uploadStatus,
  downloadTemplate,
  handleFileChange,
  uploadFile,
} = useImportCsv();
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