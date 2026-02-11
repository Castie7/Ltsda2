<script setup lang="ts">
import { ref, onMounted } from 'vue';

const user = ref({
   id: null,
   username: '',
   full_name: '',
   role: '',
   profile_pic: '',
   password: '' // Only for verifying old pw if we implemented it
});

const form = ref({
   full_name: '',
   username: '',
   new_password: '',
   confirm_password: ''
});

const imagePreview = ref('');
const selectedFile = ref<File | null>(null);
const isLoading = ref(false);
const message = ref('');
const error = ref('');

// Get User ID from LocalStorage (saved during Login)
const getUserId = () => {
   const userStr = localStorage.getItem('user');
   if (userStr) {
       const u = JSON.parse(userStr);
       return u.id;
   }
   return null;
};

const fetchUser = async () => {
   const id = getUserId();
   if (!id) return;

   isLoading.value = true;
   try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`);
      if (response.ok) {
         const data = await response.json();
         user.value = data;
         
         // Init Form
         form.value.full_name = data.full_name;
         form.value.username = data.username;
         
         if (data.profile_pic) {
            imagePreview.value = `http://localhost:8080/uploads/profile_pics/${data.profile_pic}`;
         }
      }
   } catch (e) {
      console.error(e);
   } finally {
      isLoading.value = false;
   }
};

const handleFileChange = (e: Event) => {
   const target = e.target as HTMLInputElement;
   if (target.files && target.files[0]) {
      selectedFile.value = target.files[0];
      imagePreview.value = URL.createObjectURL(selectedFile.value);
   }
};

const saveSettings = async () => {
   message.value = '';
   error.value = '';
   
   if (form.value.new_password && form.value.new_password !== form.value.confirm_password) {
       error.value = "New passwords do not match!";
       return;
   }

   const id = getUserId();
   if (!id) return;

   isLoading.value = true;

   const formData = new FormData();
   formData.append('full_name', form.value.full_name);
   formData.append('username', form.value.username);
   
   if (form.value.new_password) {
       formData.append('new_password', form.value.new_password);
   }
   
   if (selectedFile.value) {
       formData.append('profile_pic_file', selectedFile.value);
   }

   try {
      const response = await fetch(`http://localhost:8080/api/users/update/${id}`, {
         method: 'POST',
         body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
          message.value = "Profile updated successfully!";
          // Update LocalStorage to reflect new name/pic instantly in UI
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          currentUser.name = data.user.full_name;
          currentUser.profile_pic = data.user.profile_pic;
          localStorage.setItem('user', JSON.stringify(currentUser));
          
          // Optionally emit event or refresh page to update header
          setTimeout(() => window.location.reload(), 1000); // Reload to update header/sidebar
      } else {
          error.value = data.messages ? JSON.stringify(data.messages) : 'Update failed';
      }
   } catch (e) {
      error.value = "An error occurred while saving.";
      console.error(e);
   } finally {
      isLoading.value = false;
   }
};

onMounted(fetchUser);
</script>

<template>
<div class="p-8 max-w-4xl mx-auto">
   <h1 class="text-3xl font-bold text-slate-800 mb-2">Account Settings</h1>
   <p class="text-slate-500 mb-8">Manage your profile details and security.</p>

   <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- PROFILE CARD -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
         <div class="relative w-32 h-32 mb-4">
            <div class="w-full h-full rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md">
               <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover">
               <div v-else class="w-full h-full flex items-center justify-center text-4xl bg-slate-200 text-slate-400">👤</div>
            </div>
            <label class="absolute bottom-0 right-0 bg-blue-900 text-white p-2 rounded-full cursor-pointer hover:bg-blue-800 shadow-sm transition-colors">
               <input type="file" @change="handleFileChange" accept="image/*" class="hidden">
               📷
            </label>
         </div>
         <h2 class="font-bold text-xl text-slate-800">{{ form.full_name || user.full_name }}</h2>
         <p class="text-slate-400 text-sm">{{ user.role }}</p>
      </div>

      <!-- EDIT FORM -->
      <div class="md:col-span-2 space-y-6">
         <!-- GENERAL INFO -->
         <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 class="font-bold text-lg text-slate-800 mb-4 border-b pb-2">General Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input v-model="form.full_name" type="text" class="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20">
               </div>
               <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                  <input v-model="form.username" type="text" class="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20">
               </div>
            </div>
         </div>

         <!-- PASSWORD -->
         <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 class="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Security</h3>
            <div class="space-y-4">
               <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                  <input v-model="form.new_password" type="password" placeholder="Leave blank to keep current" class="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20">
               </div>
               <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm Password</label>
                  <input v-model="form.confirm_password" type="password" placeholder="Confirm new password" class="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20">
               </div>
            </div>
         </div>

         <!-- ACTION BUTTONS -->
         <div class="flex items-center justify-end gap-4">
            <div v-if="message" class="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded">{{ message }}</div>
            <div v-if="error" class="text-red-500 font-bold text-sm bg-red-50 px-3 py-1 rounded">{{ error }}</div>
            
            <button @click="saveSettings" :disabled="isLoading" class="bg-blue-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-shadow shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center gap-2">
               <span v-if="isLoading" class="animate-spin">⏳</span>
               Save Changes
            </button>
         </div>
      </div>
   </div>
</div>
</template>
