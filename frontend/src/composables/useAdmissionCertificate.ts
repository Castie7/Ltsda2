import { ref, computed, onMounted } from 'vue';

export function useAdmissionCertificate() {
    // ── Form Fields ──
    const fromChurch = ref('');
    const forChurch = ref('');
    const lastName = ref('');
    const firstName = ref('');
    const middleInitial = ref('');
    const meetingDate = ref('');
    const minuteNumber = ref('');

    // ── Auto-filled ──
    const clerkName = ref('');
    const currentDate = ref('');

    // ── Preview ──
    const showPreview = ref(false);

    onMounted(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            clerkName.value = user.name || user.full_name || 'Unknown';
        }

        const today = new Date();
        currentDate.value = today.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    });

    const fullName = computed(() => {
        const parts = [];
        if (lastName.value.trim()) parts.push(lastName.value.trim() + ',');
        if (firstName.value.trim()) parts.push(firstName.value.trim());
        if (middleInitial.value.trim()) parts.push(middleInitial.value.trim() + '.');
        return parts.join(' ') || '';
    });

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const isFormValid = () => {
        return fromChurch.value.trim() !== '' &&
            forChurch.value.trim() !== '' &&
            lastName.value.trim() !== '' &&
            firstName.value.trim() !== '';
    };

    const togglePreview = () => {
        showPreview.value = !showPreview.value;
    };

    const printLetter = () => {
        window.print();
    };

    const resetForm = () => {
        fromChurch.value = '';
        forChurch.value = '';
        lastName.value = '';
        firstName.value = '';
        middleInitial.value = '';
        meetingDate.value = '';
        minuteNumber.value = '';
        showPreview.value = false;
    };

    return {
        fromChurch,
        forChurch,
        lastName,
        firstName,
        middleInitial,
        meetingDate,
        minuteNumber,
        clerkName,
        currentDate,
        fullName,
        showPreview,
        formatDate,
        isFormValid,
        togglePreview,
        printLetter,
        resetForm,
    };
}
