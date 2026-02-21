import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UserCard from './UserCard.vue'
import type { User } from './userCard.types'

describe('UserCard', () => {
  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
  }

  it('renders user information', () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser },
    })

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('john@example.com')
  })

  it('passes avatar props to UserAvatar component', () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser },
    })

    const avatar = wrapper.findComponent({ name: 'UserAvatar' })
    expect(avatar.props('src')).toBe(mockUser.avatar)
    expect(avatar.props('alt')).toBe(mockUser.name)
  })
})
