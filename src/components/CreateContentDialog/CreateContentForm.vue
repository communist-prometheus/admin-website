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

const handleSubmit = () => {
  emit('submit', {
    slug: slug.value,
    lang: lang.value,
    title: title.value,
    description: description.value,
    category: category.value,
    order: order.value,
  })
  resetForm()
}

const resetForm = () => {
  slug.value = ''
  lang.value = 'en'
  title.value = ''
  description.value = ''
  category.value = ''
  order.value = 1
}

defineExpose({ reset: resetForm })
