import { ref, computed, onMounted } from 'vue';
import { api } from '../api';
import { useToast } from './useToast';

interface Member {
    id: number;
    full_name: string;
    gender: string;
    birth_date: string;
    birthplace: string;
    father_name: string;
    mother_name: string;
    baptism_date: string;
    place_of_baptism: string;
    officiating_minister: string;
    status: string;
}

export function useTransferForm() {
    const toast = useToast();

    // ── Form Fields ──
    const fromChurch = ref('');
    const forChurch = ref('');
    const meetingDate = ref('');
    const minuteNumber = ref('');

    // ── Member Search ──
    const allMembers = ref<Member[]>([]);
    const searchQuery = ref('');
    const showDropdown = ref(false);
    const selectedMember = ref<Member | null>(null);
    const statusUpdated = ref(false);

    // ── Auto-filled ──
    const clerkName = ref('');
    const currentDate = ref('');

    // Initialize
    onMounted(async () => {
        // Get clerk name
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            clerkName.value = user.name || user.full_name || 'Unknown';
        }

        // Set today's date
        const today = new Date();
        currentDate.value = today.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Fetch all members
        try {
            const response = await api('/api/members');
            if (response.ok) {
                const data = await response.json();
                allMembers.value = data.filter((m: Member) => m.status === 'Active');
            }
        } catch (err) {
            console.error('Failed to fetch members:', err);
        }
    });

    // Search results (filter active members)
    const searchResults = computed(() => {
        if (!searchQuery.value || searchQuery.value.length < 2) return [];
        const query = searchQuery.value.toLowerCase();
        return allMembers.value
            .filter(m => m.full_name.toLowerCase().includes(query))
            .slice(0, 8);
    });

    // Select a member from search
    const selectMember = (member: Member) => {
        selectedMember.value = member;
        searchQuery.value = member.full_name;
        showDropdown.value = false;
        statusUpdated.value = false;
    };

    // Clear selected member
    const clearMember = () => {
        selectedMember.value = null;
        searchQuery.value = '';
        statusUpdated.value = false;
    };

    // Gender pronoun
    const genderPronoun = computed(() => {
        if (!selectedMember.value) return 'him/her';
        return selectedMember.value.gender === 'Female' ? 'her' : 'him';
    });

    // Format date helper
    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr === '0000-00-00') return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    // Show preview
    const showPreview = ref(false);

    const isFormValid = () => {
        return fromChurch.value.trim() !== '' &&
            forChurch.value.trim() !== '' &&
            selectedMember.value !== null;
    };

    const togglePreview = () => {
        showPreview.value = !showPreview.value;
    };

    // Update member status to Transferred
    const updateMemberStatus = async () => {
        if (!selectedMember.value) return;

        const formData = new FormData();
        formData.append('status', 'Transferred');
        formData.append('observation', `Transferred to ${forChurch.value} Seventh-Day Adventist Church`);
        formData.append('to_church_group', `${forChurch.value} Seventh-Day Adventist Church`);
        formData.append('date_transferred_letter', meetingDate.value || '');

        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            formData.append('current_user_name', user.name || user.full_name || 'System');
        }

        try {
            const response = await api(`/api/members/update/${selectedMember.value.id}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                statusUpdated.value = true;
                toast.success(`${selectedMember.value.full_name} status updated to Transferred.`);
            } else {
                toast.error('Failed to update member status.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Server connection failed.');
        }
    };

    // Print
    const printLetter = () => {
        window.print();
    };

    // Reset
    const resetForm = () => {
        fromChurch.value = '';
        forChurch.value = '';
        meetingDate.value = '';
        minuteNumber.value = '';
        searchQuery.value = '';
        selectedMember.value = null;
        showPreview.value = false;
        statusUpdated.value = false;
    };

    return {
        fromChurch,
        forChurch,
        meetingDate,
        minuteNumber,
        searchQuery,
        showDropdown,
        searchResults,
        selectedMember,
        statusUpdated,
        clerkName,
        currentDate,
        genderPronoun,
        showPreview,
        selectMember,
        clearMember,
        formatDate,
        isFormValid,
        togglePreview,
        updateMemberStatus,
        printLetter,
        resetForm,
    };
}
