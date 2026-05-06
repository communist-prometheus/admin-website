<script setup lang="ts">
import type {
  BugTemplate,
  TicketTemplate,
  UserStoryTemplate,
} from '../templates/types'
import BugTemplateFields from './BugTemplateFields.vue'
import UserStoryTemplateFields from './UserStoryTemplateFields.vue'

defineProps<{ readonly modelValue: TicketTemplate }>()
defineEmits<{ 'update:modelValue': [t: TicketTemplate] }>()

const asBug = (t: TicketTemplate): BugTemplate =>
  t.kind === 'bug' ? t : { kind: 'bug', reproductionSteps: '',
    actualBehavior: '', expectedBehavior: '', description: '' }

const asUserStory = (t: TicketTemplate): UserStoryTemplate =>
  t.kind === 'user-story' ? t : { kind: 'user-story', iAs: '',
    wantTo: '', soThat: '', description: '' }
</script>

<template>
  <BugTemplateFields
    v-if="modelValue.kind === 'bug'"
    :model-value="asBug(modelValue)"
    @update:model-value="$emit('update:modelValue', $event)"
  />
  <UserStoryTemplateFields
    v-else
    :model-value="asUserStory(modelValue)"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
