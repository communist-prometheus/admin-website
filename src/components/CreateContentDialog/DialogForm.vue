<script setup lang="ts">
import { ref } from 'vue'
import type { ContentType, Language } from '@/types/content'

const props = defineProps<{
  readonly contentType: ContentType
}>()

const emit = defineEmits<{
  submit: [data: FormData]
}>()

export interface FormData {
  readonly slug: string
  readonly lang: Language
  readonly title: string
  readonly description?: string
  readonly category?: string
  readonly order?: number
}

const slug = ref('')
const lang = ref<Language>('en')
const title = ref('')
const description = ref('')
const category = ref('')
const order = ref<number>(1)

const buildFormData = (): FormData => {
  const base = { slug: slug.value, lang: lang.value, title: title.value }
  if (props.contentType === 'blog') {
    return { ...base, description: description.value, category: category.value }
  }
  if (props.contentType === 'positions') {
    return { ...base, description: description.value, order: order.value }
  }
  return base
}

const reset = () => {
  slug.value = ''
  lang.value = 'en'
  title.value = ''
  description.value = ''
  category.value = ''
  order.value = 1
}

defineExpose({ reset, submit: () => emit('submit', buildFormData()) })
