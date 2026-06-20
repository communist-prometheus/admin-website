import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UploadButton from './UploadButton.vue'

const fileList = (files: readonly File[]): FileList => {
  const list: Record<number, File> = {}
  files.forEach((f, i) => {
    list[i] = f
  })
  return {
    ...list,
    length: files.length,
    item: (i: number) => files[i] ?? null,
    [Symbol.iterator]: () => files[Symbol.iterator](),
  } as unknown as FileList
}

const setFiles = (input: HTMLInputElement, files: readonly File[]): void => {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: fileList(files),
  })
}

describe('UploadButton', () => {
  it('emits one upload per picked file when multiple are selected', async () => {
    const w = mount(UploadButton, {
      props: { label: 'Upload', accept: '*/*', testId: 'up', multiple: true },
    })
    const input = w.get('input').element as HTMLInputElement
    const a = new File(['a'], 'a.txt')
    const b = new File(['b'], 'b.txt')
    setFiles(input, [a, b])
    await w.get('input').trigger('change')
    expect(w.emitted('upload')?.map(e => (e[0] as File).name)).toEqual([
      'a.txt',
      'b.txt',
    ])
  })

  it('renders the multiple attribute when multiple is set', () => {
    const w = mount(UploadButton, {
      props: { label: 'Upload', accept: '*/*', testId: 'up', multiple: true },
    })
    expect(w.get('input').attributes('multiple')).toBeDefined()
  })

  it('omits the multiple attribute by default', () => {
    const w = mount(UploadButton, {
      props: { label: 'Upload', accept: '*/*', testId: 'up' },
    })
    expect(w.get('input').attributes('multiple')).toBeUndefined()
  })
})
