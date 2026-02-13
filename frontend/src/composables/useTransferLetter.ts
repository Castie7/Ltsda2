import { ref, onMounted } from 'vue';

export function useTransferLetter() {
    // Form fields
    const churchName = ref('');
    const cityProvince = ref('');
    const localMissionConference = ref('');
    const memberName = ref('');

    // Auto-filled fields
    const clerkName = ref('System Admin');
    const currentDate = ref('');

    // View toggle
    const showPreview = ref(false);

    onMounted(() => {
        // Get clerk name from logged-in user
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.name) {
                    clerkName.value = user.name;
                }
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }

        // Auto-generate today's date
        const today = new Date();
        currentDate.value = today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    });

    const isFormValid = () => {
        return (
            churchName.value.trim() !== '' &&
            cityProvince.value.trim() !== '' &&
            localMissionConference.value.trim() !== '' &&
            memberName.value.trim() !== ''
        );
    };

    const togglePreview = () => {
        if (!showPreview.value && !isFormValid()) {
            return false;
        }
        showPreview.value = !showPreview.value;
        return true;
    };

    const printLetter = () => {
        window.print();
    };

    const resetForm = () => {
        churchName.value = '';
        cityProvince.value = '';
        localMissionConference.value = '';
        memberName.value = '';
        showPreview.value = false;
    };

    return {
        churchName,
        cityProvince,
        localMissionConference,
        memberName,
        clerkName,
        currentDate,
        showPreview,
        isFormValid,
        togglePreview,
        printLetter,
        resetForm,
    };
}
