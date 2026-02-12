<script setup lang="ts">
import { useToast } from '../composables/useToast';

const { toasts, removeToast } = useToast();

const icons: Record<string, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const bgColors: Record<string, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none" style="max-width: 420px;">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="bgColors[toast.type]"
          class="pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-xl border shadow-lg backdrop-blur-sm cursor-pointer transition-all duration-300"
          @click="removeToast(toast.id)"
        >
          <span class="text-lg flex-shrink-0 mt-0.5">{{ icons[toast.type] }}</span>
          <p class="text-sm font-medium leading-snug flex-1">{{ toast.message }}</p>
          <button 
            @click.stop="removeToast(toast.id)" 
            class="text-current opacity-40 hover:opacity-80 text-lg leading-none flex-shrink-0 cursor-pointer"
          >×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  animation: slideOut 0.25s cubic-bezier(0.7, 0, 0.84, 0) forwards;
}
.toast-move {
  transition: transform 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100px) scale(0.95);
  }
}
</style>
