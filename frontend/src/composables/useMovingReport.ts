import { ref, computed, onMounted } from 'vue';
import { api } from '../api';

interface TransferredMember {
    id: number;
    member_code: string;
    full_name: string;
    to_church_group: string;
    date_transferred_letter: string;
    status: string;
}

interface ReportRow {
    id: number;
    code: string;
    name: string;
    transferredTo: string;
}

export function useMovingReport() {
    // ── All transferred members from API ──
    const allTransferred = ref<TransferredMember[]>([]);
    const isLoading = ref(false);

    // ── Date filters ──
    const dateFrom = ref('');
    const dateTo = ref('');

    // ── Report rows (user can add/remove) ──
    const reportRows = ref<ReportRow[]>([]);

    // ── Auto-filled ──
    const clerkName = ref('');
    const currentDate = ref('');

    // ── Preview ──
    const showPreview = ref(false);

    onMounted(async () => {
        // Clerk name
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            clerkName.value = user.name || user.full_name || 'Unknown';
        }

        // Today's date
        const today = new Date();
        currentDate.value = today.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Fetch transferred members
        await fetchTransferred();
    });

    const fetchTransferred = async () => {
        isLoading.value = true;
        try {
            const response = await api('/api/members');
            if (response.ok) {
                const data = await response.json();
                allTransferred.value = data.filter(
                    (m: TransferredMember) => m.status === 'Transferred'
                );
            }
        } catch (err) {
            console.error('Failed to fetch members:', err);
        } finally {
            isLoading.value = false;
        }
    };

    // Filtered by date range
    const filteredMembers = computed(() => {
        let result = allTransferred.value;

        if (dateFrom.value) {
            result = result.filter(m => {
                if (!m.date_transferred_letter || m.date_transferred_letter === '0000-00-00') return false;
                return m.date_transferred_letter >= dateFrom.value;
            });
        }

        if (dateTo.value) {
            result = result.filter(m => {
                if (!m.date_transferred_letter || m.date_transferred_letter === '0000-00-00') return false;
                return m.date_transferred_letter <= dateTo.value;
            });
        }

        return result;
    });

    // Add a member to the report
    const addToReport = (member: TransferredMember) => {
        // Avoid duplicates
        if (reportRows.value.some(r => r.id === member.id)) return;
        reportRows.value.push({
            id: member.id,
            code: member.member_code || 'N/A',
            name: member.full_name,
            transferredTo: member.to_church_group || 'N/A',
        });
    };

    // Add all filtered members to report
    const addAllFiltered = () => {
        filteredMembers.value.forEach(m => addToReport(m));
    };

    // Remove a row
    const removeFromReport = (id: number) => {
        reportRows.value = reportRows.value.filter(r => r.id !== id);
    };

    // Clear all rows
    const clearReport = () => {
        reportRows.value = [];
    };

    const togglePreview = () => {
        showPreview.value = !showPreview.value;
    };

    const printReport = () => {
        window.print();
    };

    const resetAll = () => {
        dateFrom.value = '';
        dateTo.value = '';
        reportRows.value = [];
        showPreview.value = false;
    };

    return {
        allTransferred,
        isLoading,
        dateFrom,
        dateTo,
        filteredMembers,
        reportRows,
        clerkName,
        currentDate,
        showPreview,
        addToReport,
        addAllFiltered,
        removeFromReport,
        clearReport,
        togglePreview,
        printReport,
        resetAll,
    };
}
