import { ref, onMounted } from 'vue';

export function useMemberPrintView() {
    const printedBy = ref('System Admin');

    onMounted(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.name) {
                    printedBy.value = user.name;
                }
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }
    });

    return { printedBy };
}
