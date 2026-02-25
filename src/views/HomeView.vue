<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
</script>

<template>
  <AppLayout>
    <template #header-actions>
      <AuthButton />
    </template>

    <div
      v-if="!user"
      class="welcome"
    >
      <h1>Content Management System</h1>
      <p>Login with GitHub to manage Prometheus website content</p>
    </div>

    <div
      v-else
      class="dashboard"
    >
      <h1>Content Dashboard</h1>
      <p>Manage blog posts, pages, and job positions for Prometheus public website</p>

      <div class="content-grid">
        <div class="content-card">
          <h2>Blog Posts</h2>
          <p>Create and edit blog articles</p>
        </div>

        <div class="content-card">
          <h2>Pages</h2>
          <p>Manage static pages</p>
        </div>

        <div class="content-card">
          <h2>Positions</h2>
          <p>Update job openings</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.welcome,
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.content-card {
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.content-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.content-card p {
  font-size: 0.875rem;
  margin-bottom: 0;
}
</style>
