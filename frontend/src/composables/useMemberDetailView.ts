import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api';
import { useToast } from './useToast';

export function useMemberDetailView() {
    const toast = useToast();

    const route = useRoute();
    const router = useRouter();
    const member = ref<any>(null);
    const isLoading = ref(true);
    const history = ref<any[]>([]);
    const showHistory = ref(false);

    const fetchMember = async () => {
        try {
            const id = route.params.id;
            const response = await api(`/api/members/${id}`);

            if (!response.ok) throw new Error('Member not found');

            member.value = await response.json();

            // Fetch history
            const histRes = await api(`/api/members/${id}/history`);
            if (histRes.ok) {
                history.value = await histRes.json();
            }
        } catch (error) {
            console.error(error);
            toast.error('Could not load member record.');
            router.push('/members');
        } finally {
            isLoading.value = false;
        }
    };

    const formatFieldName = (field: string) => {
        return field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const openPrintView = () => {
        window.print();
    };

    onMounted(fetchMember);

    return {
        router,
        member,
        isLoading,
        history,
        showHistory,
        formatFieldName,
        formatDate,
        openPrintView,
    };
}
