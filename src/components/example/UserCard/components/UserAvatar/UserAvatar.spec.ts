import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UserAvatar from './UserAvatar.vue'

describe('UserAvatar', () => {
  it('renders with correct src and alt', () => {
    const wrapper = mount(UserAvatar, {
      props: {
        src: 'https://example.com/avatar.jpg',
        alt: 'User Avatar',
      },
    })

    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('https://example.com/avatar.jpg')
    expect(img.attributes('alt')).toBe('User Avatar')
  })
})

describe('UserAvatar size', () => {
  it('applies size data attribute', () => {
    const wrapper = mount(UserAvatar, {
      props: { src: 'test.jpg', alt: 'Test', size: 'lg' },
    })
    expect(wrapper.find('img').attributes('data-size')).toBe('lg')
  })

  it('defaults to md', () => {
    const wrapper = mount(UserAvatar, {
      props: { src: 'test.jpg', alt: 'Test' },
    })
    expect(wrapper.find('img').attributes('data-size')).toBe('md')
  })
})
