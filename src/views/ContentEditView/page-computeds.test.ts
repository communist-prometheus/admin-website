import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { useContentList } from '@/composables/useContent/useContentList'
import { createPageComputeds } from './page-computeds'

type List = ReturnType<typeof useContentList>

const fakeList = (): List =>
  ({
    items: ref([]),
    reloadContent: async (): Promise<void> => undefined,
    loadingList: ref(false),
  }) as unknown as List

describe('createPageComputeds.hasCover', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('is true for blog', () => {
    expect(createPageComputeds('blog', 'x', fakeList()).hasCover.value).toBe(
      true
    )
  })

  it('is true for positions', () => {
    expect(
      createPageComputeds('positions', 'x', fakeList()).hasCover.value
    ).toBe(true)
  })

  it('is true for magazine (manual cover override)', () => {
    expect(
      createPageComputeds('magazine', 'x', fakeList()).hasCover.value
    ).toBe(true)
  })

  it('is false for pages', () => {
    expect(createPageComputeds('pages', 'x', fakeList()).hasCover.value).toBe(
      false
    )
  })

  it('is false for common', () => {
    expect(
      createPageComputeds('common', 'x', fakeList()).hasCover.value
    ).toBe(false)
  })
})
