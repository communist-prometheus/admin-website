import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UserInfo from './UserInfo.vue'

describe('UserInfo', () => {
  it('renders name and email', () => {
    const wrapper = mount(UserInfo, {
      props: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    })

    expect(wrapper.find('h3').text()).toBe('John Doe')
    expect(wrapper.find('p').text()).toBe('john@example.com')
  })
})
