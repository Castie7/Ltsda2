import { ref, onMounted, computed, watch } from 'vue';
import { api, getAuthToken } from '../api';
import { useToast } from './useToast';

export function useSettingsView() {
    const toast = useToast();

    const user = ref({
        id: null as number | null,
        username: '',
        full_name: '',
        role: '',
        profile_pic: '',
        password: ''
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
            const response = await api(`/api/users/${id}`);
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
            const response = await api(`/api/users/update/${id}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                message.value = "Profile updated successfully!";
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                currentUser.name = data.user.full_name;
                currentUser.profile_pic = data.user.profile_pic;
                localStorage.setItem('user', JSON.stringify(currentUser));

                setTimeout(() => window.location.reload(), 1000);
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
        role: 'staff'
    });

    const resetUser = ref<any>(null);
    const newPassword = ref('');

    // Computed
    const filteredUsers = computed(() => {
        return usersList.value;
    });

    // METHODS
    const API_URL = 'http://localhost:8080/api';

    // DATABASE METHODS
    const downloadBackup = () => {
        const token = getAuthToken();
        window.location.href = `${API_URL}/admin/database/backup${token ? '?token=' + token : ''}`;
    };

    const handleSqlFileSelect = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            selectedSqlFile.value = file;
        }
    };

    const restoreDatabase = async () => {
        if (!selectedSqlFile.value) return;
        if (!confirm('WARNING: This will overwrite the entire database! Are you sure?')) return;

        isRestoring.value = true;
        const formData = new FormData();
        formData.append('sql_file', selectedSqlFile.value);

        const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
        if (userLocal.id) formData.append('current_user_id', userLocal.id);
        const userName = userLocal.name || userLocal.full_name;
        if (userName) formData.append('current_user_name', userName);

        try {
            const response = await api(`/api/admin/database/import`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (response.ok) {
                toast.success('Database restored successfully!');
                selectedSqlFile.value = null;
                if (sqlFileInput.value) sqlFileInput.value.value = '';
                fetchLogs();
            } else {
                toast.error('Error: ' + (result.messages?.error || result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Restore error:', error);
            toast.error('Network error during restore.');
        } finally {
            isRestoring.value = false;
        }
    };

    const fetchLogs = async () => {
        try {
            const response = await api(`/api/admin/logs`);
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
            const response = await api(`/api/admin/users`);
            if (response.ok) {
                usersList.value = await response.json();
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const createUser = async () => {
        if (!newUser.value.full_name || !newUser.value.username || !newUser.value.password) {
            toast.warning('Please fill in all fields');
            return;
        }

        try {
            const response = await api(`/api/admin/users/create`, {
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
                toast.success('User created successfully');
                showAddUserModal.value = false;
                newUser.value = { full_name: '', username: '', password: '', role: 'staff' };
                fetchUsers();
                fetchLogs();
            } else {
                toast.error(data.messages?.error || 'Failed to create user');
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
            toast.warning('Please enter a new password');
            return;
        }

        try {
            const response = await api(`/api/admin/users/reset-password/${resetUser.value.id}`, {
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
                toast.success('Password reset successfully');
                showResetPasswordModal.value = false;
                fetchLogs();
            } else {
                toast.error(data.messages?.error || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
        }
    };

    // DELETE MEMBER FUNCTIONS
    const searchMembersToDelete = async () => {
        if (!deleteSearchQuery.value || deleteSearchQuery.value.trim() === '') {
            toast.warning("Please enter a name to search");
            return;
        }

        hasSearched.value = true;
        deleteSearchResults.value = [];

        try {
            const response = await api(`/api/members`);
            if (response.ok) {
                const allMembers = await response.json();
                const query = deleteSearchQuery.value.toLowerCase();
                deleteSearchResults.value = allMembers.filter((m: any) =>
                    m.full_name.toLowerCase().includes(query) ||
                    m.member_code.toLowerCase().includes(query)
                );
            }
        } catch (e) {
            console.error(e);
            toast.error("Error searching members");
        }
    };

    const confirmDeleteMember = async (member: any) => {
        if (!confirm(`Are you sure you want to delete ${member.full_name}? This will move them to 'Deleted' state (Soft Delete).`)) {
            return;
        }

        try {
            const response = await api(`/api/members/${member.id}`, {
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
                toast.success(`Member ${member.full_name} deleted successfully.`);
                deleteSearchResults.value = deleteSearchResults.value.filter((m: any) => m.id !== member.id);
                fetchLogs();
            } else {
                const data = await response.json();
                toast.error(data.messages?.error || "Failed to delete member.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error processing deletion.");
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

    return {
        user,
        form,
        imagePreview,
        selectedFile,
        isLoading,
        message,
        error,
        handleFileChange,
        saveSettings,
        activeTab,
        logs,
        usersList,
        showAddUserModal,
        showResetPasswordModal,
        deleteSearchQuery,
        deleteSearchResults,
        hasSearched,
        sqlFileInput,
        selectedSqlFile,
        isRestoring,
        newUser,
        resetUser,
        newPassword,
        filteredUsers,
        downloadBackup,
        handleSqlFileSelect,
        restoreDatabase,
        fetchLogs,
        fetchUsers,
        createUser,
        openResetPassword,
        resetPassword,
        searchMembersToDelete,
        confirmDeleteMember,
    };
}
