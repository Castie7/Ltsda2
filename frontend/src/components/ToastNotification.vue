<script setup lang="ts">
import { useToastNotification } from '../composables/useToastNotification';

const { toasts, removeToast, icons, bgColors } = useToastNotification();
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

<style scoped src="../styles/ToastNotification.css"></style>
