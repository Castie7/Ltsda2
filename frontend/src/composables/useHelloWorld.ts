import { ref } from 'vue';

export function useHelloWorld() {
    const count = ref(0);

    return { count };
}
