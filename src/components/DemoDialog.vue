<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useOAuthPopup } from '@/composables/useOAuthPopup'
import { AuthService } from '@/services/auth.service'
import LoginForm from './DemoDialog/LoginForm/LoginForm.vue'
import UserProfile from './DemoDialog/UserProfile/UserProfile.vue'
const dialogRef = ref<HTMLDialogElement | null>(null)
const { user, loading: authLoading, error, checkAuth } = useAuth()
const { loading: oauthLoading, openPopup } = useOAuthPopup(
  u => { user.value = u },
  e => { error.value = e }
)
const loading = computed(() => authLoading.value || oauthLoading.value)
const open = () => { dialogRef.value?.showModal(); checkAuth() }
const close = () => dialogRef.value?.close()
defineExpose({ open, close })
</script>

<template>
  <dialog
    ref="dialogRef"
    class="auth-dialog"
  >
    <h2 class="dialog-title">
      GitHub Auth
    </h2>
    <LoginForm
      v-if="!user"
      :loading="loading"
      :error="error"
      @login="openPopup"
      @different-account="AuthService.openDifferentAccountDialog"
      @close="close"
    />
    <UserProfile
      v-else
      :user="user"
      @logout="AuthService.logout"
      @close="close"
    />
  </dialog>
</template>

<style scoped>
.auth-dialog {
  padding: var(--space-xl);
  border-radius: var(--border-radius-md);
  border: var(--border-width) solid var(--color-border);
  max-width: 500px;
  width: 90vw;
}

.dialog-title {
  margin-top: 0;
}

dialog::backdrop {
  background: rgb(0 0 0 / 50%);
}
</style>
