import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type {
  DeployBuild,
  WorkflowJob,
  WorkflowRun,
  WorkflowStep,
} from '@/composables/useDeployStatus/workflow-types'
import DeployItem from './DeployItem.vue'

const step = (name: string): WorkflowStep => ({
  name,
  status: 'completed',
  conclusion: 'success',
  number: 1,
  started_at: '2026-04-16T00:00:00Z',
  completed_at: '2026-04-16T00:00:30Z',
})

const buildWith = (steps: ReadonlyArray<WorkflowStep>): DeployBuild => {
  const job: WorkflowJob = {
    id: 123,
    run_id: 456,
    status: 'completed',
    conclusion: 'success',
    started_at: '2026-04-16T00:00:00Z',
    completed_at: '2026-04-16T00:00:30Z',
    steps,
  }
  const run: WorkflowRun = {
    id: 456,
    name: 'Deploy',
    status: 'completed',
    conclusion: 'success',
    head_branch: 'master',
    head_sha: 'abcdef123456',
    created_at: '2026-04-16T00:00:00Z',
    updated_at: '2026-04-16T00:00:30Z',
    head_commit: {
      message: 'updated Home in pages',
      author: { name: 'undeadliner', email: 'u@example.com' },
    },
  }
  return { run, jobs: steps.length > 0 ? [job] : [] }
}

describe('DeployItem', () => {
  it('renders collapsed by default (steps not visible)', () => {
    const wrapper = mount(DeployItem, {
      props: { build: buildWith([step('compile'), step('test')]) },
    })
    expect(wrapper.find('[data-testid="deploy-item-steps"]').exists()).toBe(
      false
    )
    const toggle = wrapper.get('[data-testid="deploy-item-toggle"]')
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('expands on toggle click and shows steps', async () => {
    const wrapper = mount(DeployItem, {
      props: { build: buildWith([step('compile'), step('test')]) },
    })
    await wrapper.get('[data-testid="deploy-item-toggle"]').trigger('click')
    expect(wrapper.find('[data-testid="deploy-item-steps"]').exists()).toBe(
      true
    )
    expect(
      wrapper
        .get('[data-testid="deploy-item-toggle"]')
        .attributes('aria-expanded')
    ).toBe('true')
  })

  it('collapses again on second click', async () => {
    const wrapper = mount(DeployItem, {
      props: { build: buildWith([step('compile')]) },
    })
    const toggle = wrapper.get('[data-testid="deploy-item-toggle"]')
    await toggle.trigger('click')
    await toggle.trigger('click')
    expect(wrapper.find('[data-testid="deploy-item-steps"]').exists()).toBe(
      false
    )
  })

  it('disables toggle when there are no steps', () => {
    const wrapper = mount(DeployItem, {
      props: { build: buildWith([]) },
    })
    const toggle = wrapper.get('[data-testid="deploy-item-toggle"]')
    expect(toggle.attributes('disabled')).toBeDefined()
  })

  it('shows the commit message even when collapsed', () => {
    const wrapper = mount(DeployItem, {
      props: { build: buildWith([step('compile')]) },
    })
    expect(wrapper.text()).toContain('updated Home in pages')
  })
})
