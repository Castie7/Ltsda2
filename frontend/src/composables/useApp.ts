import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clearAuthToken } from '../api';

export function useApp() {
    const route = useRoute();
    const router = useRouter();

    // Hide navigation if we are on the login page
    const showNav = computed(() => route.path !== '/login');

    const logout = async () => {
        try {
            const userData = localStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : null;
            if (user?.id) {
                await fetch('http://localhost:8080/auth/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: user.id }),
                });
            }
        } catch (e) { /* ignore logout errors */ }
        clearAuthToken();
        localStorage.removeItem('user');
        router.push('/login');
    };

    return { showNav, logout };
}
