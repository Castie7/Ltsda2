import { ref, onMounted, computed } from 'vue';
import { api } from '../api';

interface Member {
    id: number;
    status: string;
    gender: string;
    exclusion_type?: string;
}

export function useHomeView() {
    const members = ref<Member[]>([]);
    const isLoading = ref(true);

    const fetchMembers = async () => {
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

    const stats = computed(() => {
        // Total excludes: Deceased, Drop, Abroad, Transferred, Missing (Status) OR Death, Reform (Exclusion)
        const total = members.value.filter(m =>
            !['Deceased', 'Drop', 'Abroad', 'Transferred', 'Missing'].includes(m.status) &&
            !['Death', 'Reform'].includes((m as any).exclusion_type || '')
        ).length;

        const active = members.value.filter(m => m.status === 'Active').length;
        const inactive = members.value.filter(m => m.status === 'Inactive').length;
        const male = members.value.filter(m => m.gender === 'Male').length;
        const female = members.value.filter(m => m.gender === 'Female').length;

        return { total, active, inactive, male, female };
    });

    onMounted(fetchMembers);

    return { members, isLoading, stats };
}
