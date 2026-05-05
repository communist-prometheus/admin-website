import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
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

const stubRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/deploys/:runId',
        name: 'deploy-detail',
        component: { template: '<div />' },
      },
      { path: '/', component: { template: '<div />' } },
    ],
  })

const mountItem = (build: DeployBuild) =>
  mount(DeployItem, {
    props: { build },
    global: { plugins: [stubRouter()] },
  })

describe('DeployItem', () => {
  it('renders the commit message', () => {
    const wrapper = mountItem(buildWith([step('compile')]))
    expect(wrapper.text()).toContain('updated Home in pages')
  })

  /*
   * The deploy item used to expand inline steps via a toggle. The
   * details now live on /deploys/:runId — a dedicated page with the
   * full step list AND the failed-step log tail. Clicking a list
   * row therefore navigates rather than toggling.
   */
  it('links to /deploys/:runId for navigation to the detail page', () => {
    const wrapper = mountItem(buildWith([step('compile')]))
    const link = wrapper.get('[data-testid="deploy-item-link-456"]')
    expect(link.attributes('href')).toBe('/deploys/456')
  })

  it('renders without steps when the build has no jobs', () => {
    const wrapper = mountItem(buildWith([]))
    /* No crash, no toggle, link still present. */
    expect(
      wrapper.find('[data-testid="deploy-item-link-456"]').exists()
    ).toBe(true)
  })
})
