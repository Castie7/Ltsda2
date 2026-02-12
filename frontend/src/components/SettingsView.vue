<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';

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

// ADMIN TOOLS STATE
const activeTab = ref('logs');
const logs = ref<any[]>([]);
const usersList = ref<any[]>([]);
const showAddUserModal = ref(false);
const showResetPasswordModal = ref(false);

// DELETE MEMBER STATE
const deleteSearchQuery = ref('');
const deleteSearchResults = ref<any[]>([]);
const hasSearched = ref(false);

// DATABASE STATE
const sqlFileInput = ref<HTMLInputElement | null>(null);
const selectedSqlFile = ref<File | null>(null);
const isRestoring = ref(false);

const newUser = ref({
   full_name: '',
   username: '',
   password: '',
   role: 'staff' // Default role
});

const resetUser = ref<any>(null);
const newPassword = ref('');

// Computed
const filteredUsers = computed(() => {
   return usersList.value;
});

// METHODS
const API_URL = 'http://localhost:8080/api'; // Define API_URL

// DATABASE METHODS
const downloadBackup = () => {
   window.location.href = `${API_URL}/admin/database/backup`;
};

const handleSqlFileSelect = (event: Event) => {
   const target = event.target as HTMLInputElement;
   if (target.files && target.files.length > 0) {
      selectedSqlFile.value = target.files[0];
   }
};

const restoreDatabase = async () => {
   if (!selectedSqlFile.value) return;
   if (!confirm('WARNING: This will overwrite the entire database! Are you sure?')) return;

   isRestoring.value = true;
   const formData = new FormData();
   formData.append('sql_file', selectedSqlFile.value);
   
   const user = JSON.parse(localStorage.getItem('user') || '{}');
   if (user.id) formData.append('current_user_id', user.id);
   // Fix for name property
   const userName = user.name || user.full_name;
   if (userName) formData.append('current_user_name', userName);

   try {
      const response = await fetch(`${API_URL}/admin/database/import`, {
         method: 'POST',
         body: formData
      });
      const result = await response.json();
      
      if (response.ok) {
         alert('Database restored successfully!');
         selectedSqlFile.value = null; 
         if (sqlFileInput.value) sqlFileInput.value.value = '';
         fetchLogs(); 
      } else {
         alert('Error: ' + (result.messages?.error || result.message || 'Unknown error'));
      }
   } catch (error) {
      console.error('Restore error:', error);
      alert('Network error during restore.');
   } finally {
      isRestoring.value = false;
   }
};

const fetchLogs = async () => {
   try {
      const response = await fetch(`${API_URL}/admin/logs`);
      if (response.ok) {
         const data = await response.json();
         logs.value = Array.isArray(data) ? data : (data.data || []);
      }
   } catch (error) {
      console.error('Error fetching logs:', error);
   }
};

const fetchUsers = async () => {
   try {
      const response = await fetch(`${API_URL}/admin/users`);
      if (response.ok) {
         usersList.value = await response.json();
      }
   } catch (error) {
      console.error('Error fetching users:', error);
   }
};

const createUser = async () => {
   if (!newUser.value.full_name || !newUser.value.username || !newUser.value.password) {
      alert('Please fill in all fields');
      return;
   }
   
   try {
      const response = await fetch(`${API_URL}/admin/users/create`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            ...newUser.value,
            current_user_id: user.value.id,
            current_user_name: user.value.full_name
         })
      });
      
      const data = await response.json();
      if (response.ok) {
         alert('User created successfully');
         showAddUserModal.value = false;
         newUser.value = { full_name: '', username: '', password: '', role: 'staff' };
         fetchUsers();
         fetchLogs();
      } else {
         alert(data.messages?.error || 'Failed to create user');
      }
   } catch (error) {
      console.error('Error creating user:', error);
   }
};

const openResetPassword = (u: any) => {
   resetUser.value = u;
   newPassword.value = '';
   showResetPasswordModal.value = true;
};

const resetPassword = async () => {
   if (!newPassword.value) {
      alert('Please enter a new password');
      return;
   }
   
   try {
      const response = await fetch(`${API_URL}/admin/users/reset-password/${resetUser.value.id}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            new_password: newPassword.value,
            current_user_id: user.value.id,
            current_user_name: user.value.full_name
         })
      });
      
      const data = await response.json();
      if (response.ok) {
         alert('Password reset successfully');
         showResetPasswordModal.value = false;
         fetchLogs();
      } else {
         alert(data.messages?.error || 'Failed to reset password');
      }
   } catch (error) {
      console.error('Error resetting password:', error);
   }
};

// DELETE MEMBER FUNCTIONS
const searchMembersToDelete = async () => {
   if (!deleteSearchQuery.value || deleteSearchQuery.value.trim() === '') {
      alert("Please enter a name to search");
      return;
   }
   
   hasSearched.value = true;
   deleteSearchResults.value = [];

   try {
      const response = await fetch(`${API_URL}/members`); 
      if (response.ok) {
         const allMembers = await response.json();
         const query = deleteSearchQuery.value.toLowerCase();
         deleteSearchResults.value = allMembers.filter((m: any) => 
            m.full_name.toLowerCase().includes(query) || 
            m.member_code.toLowerCase().includes(query)
         );
      }
   } catch(e) {
      console.error(e);
      alert("Error searching members");
   }
};

const confirmDeleteMember = async (member: any) => {
   if (!confirm(`Are you sure you want to delete ${member.full_name}? This will move them to 'Deleted' state (Soft Delete).`)) {
      return;
   }

   try {
      const response = await fetch(`${API_URL}/members/${member.id}`, {
         method: 'DELETE',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
             current_user_id: user.value.id,
             current_user_name: user.value.full_name
         })
      });

      if (response.ok) {
         alert(`Member ${member.full_name} deleted successfully.`);
         deleteSearchResults.value = deleteSearchResults.value.filter((m: any) => m.id !== member.id);
         fetchLogs(); 
      } else {
         const data = await response.json();
         alert(data.messages?.error || "Failed to delete member.");
      }
   } catch (e) {
      console.error(e);
      alert("Error processing deletion.");
   }
};

// Lifecycle
onMounted(() => {
   fetchUser(); 
   
   if (user.value.role === 'admin' || user.value.role === 'Admin') {
      fetchLogs();
      fetchUsers();
   }
});

watch(activeTab, (val) => {
   if (val === 'logs') fetchLogs();
   if (val === 'users') fetchUsers();
});

watch(user, (u) => {
   if ((u.role === 'admin' || u.role === 'Admin') && activeTab.value === 'logs') {
      fetchLogs();
   }
});
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

          <!-- ADMIN TOOLS -->
          <div v-if="user.role === 'admin' || user.role === 'Admin'" class="pt-8">
             <h3 class="font-bold text-lg text-slate-800 mb-4 pb-2 border-b">Admin Tools</h3>
             
             <!-- Tabs -->
             <div class="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-6 inline-flex">
                <button @click="activeTab = 'logs'" :class="{'bg-blue-900 text-white': activeTab === 'logs', 'bg-white text-slate-500 hover:bg-slate-50': activeTab !== 'logs'}" class="px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                   Activity Logs
                </button>
                <button @click="activeTab = 'users'" :class="{'bg-blue-900 text-white': activeTab === 'users', 'bg-white text-slate-500 hover:bg-slate-50': activeTab !== 'users'}" class="px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                   User Management
                </button>
                <button @click="activeTab = 'delete_members'" :class="{'bg-blue-900 text-white': activeTab === 'delete_members', 'bg-white text-slate-500 hover:bg-slate-50': activeTab !== 'delete_members'}" class="px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                   Delete Members
                </button>
                <button @click="activeTab = 'database'" :class="{'bg-blue-900 text-white': activeTab === 'database', 'bg-white text-slate-500 hover:bg-slate-50': activeTab !== 'database'}" class="px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                   Database
                </button>
             </div>

             <!-- ACTIVITY LOGS -->
             <div v-if="activeTab === 'logs'" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="p-4 border-b border-slate-100 flex justify-between items-center">
                   <h4 class="font-bold text-slate-700">Recent Activity</h4>
                   <button @click="fetchLogs" class="text-xs text-blue-900 font-bold hover:underline">Refresh</button>
                </div>
                <!-- ... existing logs table ... -->
                <div class="max-h-[400px] overflow-y-auto">
                   <table class="w-full text-left text-sm">
                      <thead class="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                         <tr>
                            <th class="px-4 py-3">User</th>
                            <th class="px-4 py-3">Action</th>
                            <th class="px-4 py-3">Details</th>
                            <th class="px-4 py-3">Date</th>
                         </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                         <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50">
                            <td class="px-4 py-3 font-medium text-slate-700">{{ log.user_name || 'System' }}</td>
                             <td class="px-4 py-3">
                               <span class="px-2 py-1 rounded-md text-xs font-bold"
                                  :class="{
                                     'bg-green-100 text-green-700': (log.action || '').includes('Login') || (log.action || '').includes('Create'),
                                     'bg-blue-100 text-blue-700': (log.action || '').includes('Update') || (log.action || '').includes('Import'),
                                     'bg-amber-100 text-amber-700': (log.action || '').includes('Logout'),
                                     'bg-red-100 text-red-700': (log.action || '').includes('Delete'),
                                     'bg-slate-100 text-slate-600': !(log.action || '').includes('Login') && !(log.action || '').includes('Create') && !(log.action || '').includes('Update') && !(log.action || '').includes('Import') && !(log.action || '').includes('Logout') && !(log.action || '').includes('Delete')
                                  }"
                               >
                                  {{ log.action }}
                               </span>
                            </td>
                            <td class="px-4 py-3 text-slate-500 truncate max-w-xs" :title="log.details">{{ log.details }}</td>
                            <td class="px-4 py-3 text-slate-400 text-xs">{{ new Date(log.created_at).toLocaleString() }}</td>
                         </tr>
                         <tr v-if="logs.length === 0">
                            <td colspan="4" class="px-4 py-8 text-center text-slate-400 italic">No activity logs found.</td>
                         </tr>
                      </tbody>
                   </table>
                </div>
             </div>

             <!-- DELETE MEMBERS -->
             <div v-if="activeTab === 'delete_members'" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="p-4 border-b border-slate-100">
                   <h4 class="font-bold text-slate-700 mb-2">Search & Delete Members</h4>
                   <p class="text-xs text-slate-500 mb-4">Search for a member by name to delete them. This action uses Soft Delete.</p>
                   
                   <div class="flex gap-2">
                      <input 
                        v-model="deleteSearchQuery" 
                        @keyup.enter="searchMembersToDelete"
                        type="text" 
                        placeholder="Enter member name..." 
                        class="flex-1 p-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                      >
                      <button @click="searchMembersToDelete" class="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors">
                         Search
                      </button>
                   </div>
                </div>

                <div class="p-4 max-h-[400px] overflow-y-auto" v-if="deleteSearchResults.length > 0">
                   <table class="w-full text-left text-sm">
                      <thead class="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                         <tr>
                            <th class="px-4 py-3">Member Code</th>
                            <th class="px-4 py-3">Name</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                         <tr v-for="m in deleteSearchResults" :key="m.id" class="hover:bg-slate-50">
                            <td class="px-4 py-3 text-slate-500 text-xs">{{ m.member_code }}</td>
                            <td class="px-4 py-3 font-bold text-slate-700">{{ m.full_name }}</td>
                            <td class="px-4 py-3">
                               <span class="px-2 py-1 rounded-full text-xs font-bold" :class="{
                                  'bg-green-100 text-green-700': m.status === 'Active',
                                  'bg-yellow-100 text-yellow-700': m.status === 'Inactive' || m.status === 'Child',
                                  'bg-red-100 text-red-700': m.status === 'Deceased' || m.status === 'Drop'
                               }">{{ m.status }}</span>
                            </td>
                            <td class="px-4 py-3 text-right">
                               <button @click="confirmDeleteMember(m)" class="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-100 hover:text-red-700 transition-colors">
                                  Delete
                               </button>
                            </td>
                         </tr>
                      </tbody>
                   </table>
                </div>
                <div v-else-if="hasSearched" class="p-8 text-center text-slate-400 italic">
                   No members found matching "{{ deleteSearchQuery }}"
                </div>
             </div>

             <div v-if="activeTab === 'users'" class="space-y-6">
                <!-- ... existing user management content ... -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                   <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h4 class="font-bold text-slate-700">System Users</h4>
                      <button @click="showAddUserModal = true" class="bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-800 transition-colors">
                        + Add User
                      </button>
                   </div>
                   <div class="max-h-[400px] overflow-y-auto">
                      <table class="w-full text-left text-sm">
                         <thead class="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                            <tr>
                               <th class="px-4 py-3">User</th>
                               <th class="px-4 py-3">Role</th>
                               <th class="px-4 py-3">Created</th>
                               <th class="px-4 py-3 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody class="divide-y divide-slate-100">
                            <tr v-for="u in usersList" :key="u.id" class="hover:bg-slate-50">
                               <td class="px-4 py-3 flex items-center gap-3">
                                  <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                     {{ u.full_name.charAt(0) }}
                                  </div>
                                  <div>
                                     <div class="font-bold text-slate-700">{{ u.full_name }}</div>
                                     <div class="text-xs text-slate-400">{{ u.username }}</div>
                                  </div>
                               </td>
                               <td class="px-4 py-3">
                                  <span class="px-2 py-1 rounded-full text-xs font-bold uppercase"
                                     :class="u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'"
                                  >
                                     {{ u.role }}
                                  </span>
                               </td>
                               <td class="px-4 py-3 text-slate-400 text-xs">{{ u.created_at ? new Date(u.created_at).toLocaleDateString() : '-' }}</td>
                               <td class="px-4 py-3 text-right">
                                  <button @click="openResetPassword(u)" class="text-xs text-blue-600 font-bold hover:underline mr-2">Reset Pwd</button>
                               </td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>

             <!-- DATABASE TAB -->
             <div v-if="activeTab === 'database'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <!-- EXPORT SECTION -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                   <div class="flex items-center space-x-4 mb-4">
                      <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                         <span class="text-xl">💾</span>
                      </div>
                      <div>
                         <h3 class="text-lg font-bold text-slate-800">Backup Database</h3>
                         <p class="text-sm text-slate-500">Download a full SQL dump of the database.</p>
                      </div>
                   </div>
                   <button @click="downloadBackup" class="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                      <span>⬇️ Download Backup</span>
                   </button>
                </div>

                <!-- IMPORT SECTION -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                   <div class="flex items-center space-x-4 mb-4">
                      <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                         <span class="text-xl">⚠️</span>
                      </div>
                      <div>
                         <h3 class="text-lg font-bold text-slate-800">Restore Database</h3>
                         <p class="text-sm text-slate-500">Import a SQL file to overwrite the current database.</p>
                      </div>
                   </div>
                   
                   <div class="space-y-4">
                      <div class="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer relative">
                         <input type="file" ref="sqlFileInput" accept=".sql" @change="handleSqlFileSelect" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                         <div v-if="!selectedSqlFile">
                            <span class="text-4xl block mb-2">📄</span>
                            <p class="font-bold text-slate-600">Click to upload SQL file</p>
                            <p class="text-xs text-slate-400 mt-1">Accepts .sql files only</p>
                         </div>
                         <div v-else>
                            <span class="text-4xl block mb-2">✅</span>
                            <p class="font-bold text-blue-600">{{ selectedSqlFile.name }}</p>
                            <p class="text-xs text-slate-400 mt-1">{{ (selectedSqlFile.size / 1024).toFixed(2) }} KB</p>
                         </div>
                      </div>

                      <button v-if="selectedSqlFile" @click="restoreDatabase" :disabled="isRestoring" class="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                         <span v-if="isRestoring" class="animate-spin">⏳</span>
                         <span v-else>🚀 Restore Database</span>
                      </button>
                   </div>
                </div>
             </div>
          </div>
       </div>

    <!-- MODALS -->
    <!-- ADD USER MODAL -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
       <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
          <h3 class="text-xl font-bold text-slate-800 mb-4">Add New User</h3>
          <div class="space-y-4">
             <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input v-model="newUser.full_name" type="text" class="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20">
             </div>
             <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                <input v-model="newUser.username" type="text" class="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20">
             </div>
             <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <input v-model="newUser.password" type="password" class="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20">
             </div>
             <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                <select v-model="newUser.role" class="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20">
                   <option value="staff">Staff</option>
                   <option value="admin">Admin</option>
                </select>
             </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
             <button @click="showAddUserModal = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
             <button @click="createUser" class="px-6 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold hover:bg-blue-800 shadow-lg shadow-blue-900/20">Create User</button>
          </div>
       </div>
    </div>

    <!-- RESET PASSWORD MODAL -->
    <div v-if="showResetPasswordModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
       <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
          <h3 class="text-xl font-bold text-slate-800 mb-2">Reset Password</h3>
          <p class="text-sm text-slate-500 mb-4">Resetting password for <strong>{{ resetUser?.full_name }}</strong></p>
          <div class="space-y-4">
             <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                <input v-model="newPassword" type="password" class="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20">
             </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
             <button @click="showResetPasswordModal = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
             <button @click="resetPassword" class="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-900/20">Reset Password</button>
          </div>
       </div>
    </div>
   </div>
</div>
</template>
