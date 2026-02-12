import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { setAuthToken } from '../api';

export function useLoginView() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const isLoading = ref(false);
    const errorMessage = ref('');

    // ── LOCKOUT STATE ──
    const lockoutSeconds = ref(0);
    const failedAttempts = ref(0);
    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    const isLockedOut = computed(() => lockoutSeconds.value > 0);

    const lockoutDisplay = computed(() => {
        const mins = Math.floor(lockoutSeconds.value / 60);
        const secs = lockoutSeconds.value % 60;
        return mins > 0
            ? `${mins}m ${secs.toString().padStart(2, '0')}s`
            : `${secs}s`;
    });

    const attemptsWarning = computed(() => {
        if (failedAttempts.value === 0) return '';
        const nextLockAt = failedAttempts.value < 3 ? 3 : failedAttempts.value < 6 ? 6 : failedAttempts.value < 9 ? 9 : null;
        if (!nextLockAt) return 'Maximum lockout reached. Wait 15 minutes.';
        const remaining = nextLockAt - failedAttempts.value;
        return `${remaining} attempt${remaining > 1 ? 's' : ''} remaining before lockout`;
    });

    const startCountdown = (seconds: number) => {
        if (countdownInterval) clearInterval(countdownInterval);
        lockoutSeconds.value = seconds;
        countdownInterval = setInterval(() => {
            lockoutSeconds.value--;
            if (lockoutSeconds.value <= 0) {
                lockoutSeconds.value = 0;
                if (countdownInterval) clearInterval(countdownInterval);
                countdownInterval = null;
            }
        }, 1000);
    };

    onUnmounted(() => {
        if (countdownInterval) clearInterval(countdownInterval);
    });

    const handleLogin = async () => {
        if (isLockedOut.value) return;
        isLoading.value = true;
        errorMessage.value = '';

        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username.value,
                    password: password.value,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                failedAttempts.value = 0;
                lockoutSeconds.value = 0;
                setAuthToken(data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                router.push('/');
            } else if (response.status === 429) {
                // Locked out
                failedAttempts.value = data.attempts || 0;
                errorMessage.value = 'Too many failed attempts. Please wait.';
                startCountdown(data.retry_after || 60);
            } else {
                // Bad credentials
                failedAttempts.value = data.attempts || 0;
                errorMessage.value = data.messages?.error || 'Invalid username or password';
                if (data.retry_after && data.retry_after > 0) {
                    startCountdown(data.retry_after);
                }
            }
        } catch (error) {
            errorMessage.value = 'Could not connect to the server.';
        } finally {
            isLoading.value = false;
        }
    };

    return {
        username,
        password,
        isLoading,
        errorMessage,
        lockoutSeconds,
        failedAttempts,
        isLockedOut,
        lockoutDisplay,
        attemptsWarning,
        handleLogin,
    };
}
