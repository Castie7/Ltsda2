import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

interface Member {
    id: number;
    full_name: string;
    member_code: string;
    status: string;
    civil_status: string;
    gender: string;
    phone_no: string;
    email: string;
    birth_date: string;
    baptism_date: string;
    exclusion_type?: string;
}

export function useMemberListView() {
    const router = useRouter();

    const members = ref<Member[]>([]);
    const isLoading = ref(true);
    const searchQuery = ref('');

    // Filters State
    const statusFilter = ref('');
    const genderFilter = ref('');
    const civilStatusFilter = ref('');
    const minAgeFilter = ref<number | null>(null);
    const maxAgeFilter = ref<number | null>(null);
    const activeFilter = ref<string | null>(null);

    // Tabs State
    const activeTab = ref('All');

    const toggleFilterMenu = (name: string) => {
        activeFilter.value = activeFilter.value === name ? null : name;
    };

    // 2. Fetch data from CodeIgniter 4 API
    const fetchMembers = async (): Promise<void> => {
        try {
            const response = await api('/api/members');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            members.value = data;
        } catch (error) {
            console.error("Error loading members:", error);
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

    // 3. Client-side Search Logic
    const filteredMembers = computed(() => {
        let result = members.value;

        // TAB FILTERING
        if (activeTab.value === 'All') {
            // Show all records (no filter applied)
        } else if (activeTab.value === 'Members') {
            result = result.filter(m =>
                ['Active', 'Inactive', 'Child'].includes(m.status) &&
                !['Death', 'Unknown whereabouts', 'Reform', 'Discipline'].includes(m.exclusion_type || '') &&
                !['Transferred', 'Deceased', 'Abroad', 'Drop', 'Missing'].includes(m.status)
            );
        } else if (activeTab.value === 'Transferred') {
            result = result.filter(m => m.status === 'Transferred');
        } else if (activeTab.value === 'Deceased') {
            result = result.filter(m => m.status === 'Deceased' || m.exclusion_type === 'Death');
        } else if (activeTab.value === 'Others') {
            result = result.filter(m =>
                ['Unknown whereabouts', 'Reform', 'Discipline'].includes(m.exclusion_type || '') ||
                ['Abroad', 'Missing', 'Drop'].includes(m.status)
            );
        }

        // Text Search
        if (searchQuery.value) {
            const lowerQuery = searchQuery.value.toLowerCase();
            result = result.filter(m =>
                (m.full_name && m.full_name.toLowerCase().includes(lowerQuery)) ||
                (m.status && m.status.toLowerCase().includes(lowerQuery)) ||
                (m.member_code && m.member_code.toLowerCase().includes(lowerQuery))
            );
        }

        // Status Filter
        if (statusFilter.value) {
            result = result.filter(m => m.status === statusFilter.value);
        }

        // Gender Filter
        if (genderFilter.value) {
            result = result.filter(m => m.gender === genderFilter.value);
        }

        // Civil Status Filter
        if (civilStatusFilter.value) {
            result = result.filter(m => m.civil_status === civilStatusFilter.value);
        }

        // Age Filter
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

    // Navigate to Add Page
    const goToAddMember = () => {
        router.push('/members/add');
    };

    // Helper: Get Initials (Safety check added)
    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    onMounted(fetchMembers);

    return {
        router,
        members,
        isLoading,
        searchQuery,
        statusFilter,
        genderFilter,
        civilStatusFilter,
        minAgeFilter,
        maxAgeFilter,
        activeFilter,
        activeTab,
        toggleFilterMenu,
        filteredMembers,
        currentPage,
        totalPages,
        paginatedMembers,
        nextPage,
        prevPage,
        goToAddMember,
        getInitials,
        calculateAge,
    };
}
