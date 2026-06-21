<script setup lang="ts">
import { STATUS_META, STATUS_ORDER } from './status-meta'
</script>

<template>
  <section class="legend" aria-labelledby="status-legend-title">
    <h3 id="status-legend-title" class="legend-title">
      What the statuses mean
    </h3>
    <ul class="legend-list" role="list">
      <li v-for="status in STATUS_ORDER" :key="status" class="legend-item">
        <span
          class="legend-badge"
          :class="`status-${status}`"
          data-testid="status-legend-badge"
        >{{ STATUS_META[status].icon }} {{ STATUS_META[status].label }}</span>
        <span class="legend-desc">{{ STATUS_META[status].description }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.legend {
  margin: 0 0 var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.legend-title {
  margin: 0 0 var(--spacing-sm);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.legend-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--spacing-sm);
}

.legend-item {
  display: grid;
  grid-template-columns: minmax(8.5rem, max-content) 1fr;
  gap: var(--spacing-sm);
  align-items: baseline;
}

@media (width < 560px) {
  .legend-item {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
}

.legend-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}

.legend-desc {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.status-active {
  color: var(--color-accent);
}

.status-unsubscribed {
  color: var(--color-muted);
}

.status-bounced,
.status-complained {
  color: var(--color-danger);
}
</style>
