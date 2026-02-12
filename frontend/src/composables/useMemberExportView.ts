import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

export function useMemberExportView() {
    const router = useRouter();

    const members = ref<any[]>([]);
    const selectedMembers = ref<Set<number>>(new Set());
    const isLoading = ref(true);
    const isPrinting = ref(false);

    const searchQuery = ref('');
    const statusFilter = ref('');
    const genderFilter = ref('');
    const civilStatusFilter = ref('');
    const minAgeFilter = ref<number | null>(null);
    const maxAgeFilter = ref<number | null>(null);

    const activeFilter = ref<string | null>(null);

    const toggleFilterMenu = (name: string) => {
        activeFilter.value = activeFilter.value === name ? null : name;
    };

    const fetchMembers = async () => {
        isLoading.value = true;
        try {
            const response = await api('/api/members');
            if (response.ok) {
                const data = await response.json();
                members.value = data;
            }
        } catch (error) {
            console.error('Failed to load members', error);
        } finally {
            isLoading.value = false;
        }
    };

    const calculateAge = (birthDate: string | null) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const filteredMembers = computed(() => {
        let result = members.value;

        // 1. Text Search
        if (searchQuery.value) {
            const lowerQuery = searchQuery.value.toLowerCase();
            result = result.filter(m =>
                m.full_name.toLowerCase().includes(lowerQuery) ||
                (m.member_code && m.member_code.toLowerCase().includes(lowerQuery))
            );
        }

        // 2. Status Filter
        if (statusFilter.value) {
            result = result.filter(m => m.status === statusFilter.value);
        }

        // 3. Gender Filter
        if (genderFilter.value) {
            result = result.filter(m => m.gender === genderFilter.value);
        }

        // 4. Civil Status
        if (civilStatusFilter.value) {
            result = result.filter(m => m.civil_status === civilStatusFilter.value);
        }

        // 5. Age Filter
        if (minAgeFilter.value !== null || maxAgeFilter.value !== null) {
            result = result.filter(m => {
                const age = calculateAge(m.birth_date);
                if (age === null) return false;

                if (minAgeFilter.value !== null && age < minAgeFilter.value) return false;
                if (maxAgeFilter.value !== null && age > maxAgeFilter.value) return false;

                return true;
            });
        }

        // Status Priority Sort: Active → Child → Inactive → rest
        const statusOrder: Record<string, number> = { 'Active': 0, 'Child': 1, 'Inactive': 2 };
        result = [...result].sort((a, b) => {
            const aOrder = statusOrder[a.status] ?? 3;
            const bOrder = statusOrder[b.status] ?? 3;
            return aOrder - bOrder;
        });

        return result;
    });

    // Pagination Logic
    const currentPage = ref(1);
    const itemsPerPage = 10;

    const totalPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPage));

    const paginatedMembers = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredMembers.value.slice(start, end);
    });

    const nextPage = () => {
        if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const prevPage = () => {
        if (currentPage.value > 1) currentPage.value--;
    };

    // Reset to page 1 when filters change
    watch([searchQuery, statusFilter, genderFilter, civilStatusFilter, minAgeFilter, maxAgeFilter], () => {
        currentPage.value = 1;
    });

    const toggleSelection = (id: number) => {
        if (selectedMembers.value.has(id)) {
            selectedMembers.value.delete(id);
        } else {
            selectedMembers.value.add(id);
        }
    };

    const toggleSelectAll = () => {
        const visibleIds = filteredMembers.value.map(m => m.id);
        const allVisibleSelected = visibleIds.every(id => selectedMembers.value.has(id));

        if (allVisibleSelected) {
            visibleIds.forEach(id => selectedMembers.value.delete(id));
        } else {
            visibleIds.forEach(id => selectedMembers.value.add(id));
        }
    };

    const isAllSelected = computed(() => {
        if (filteredMembers.value.length === 0) return false;
        return filteredMembers.value.every(m => selectedMembers.value.has(m.id));
    });

    const getSelectedMembersData = computed(() => {
        return members.value.filter(m => selectedMembers.value.has(m.id));
    });

    const printSelected = () => {
        if (selectedMembers.value.size === 0) return;

        isPrinting.value = true;
        setTimeout(() => {
            window.print();
            isPrinting.value = false;
        }, 500);
    };

    onMounted(fetchMembers);

    return {
        router,
        members,
        selectedMembers,
        isLoading,
        isPrinting,
        searchQuery,
        statusFilter,
        genderFilter,
        civilStatusFilter,
        minAgeFilter,
        maxAgeFilter,
        activeFilter,
        toggleFilterMenu,
        filteredMembers,
        currentPage,
        totalPages,
        paginatedMembers,
        nextPage,
        prevPage,
        toggleSelection,
        toggleSelectAll,
        isAllSelected,
        getSelectedMembersData,
        printSelected,
        calculateAge,
    };
}
