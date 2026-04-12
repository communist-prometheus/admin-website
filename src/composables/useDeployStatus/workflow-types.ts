/** GitHub Actions workflow step. */
export interface WorkflowStep {
  readonly name: string
  readonly status: 'completed' | 'in_progress' | 'queued' | 'pending'
  readonly conclusion:
    | 'success'
    | 'failure'
    | 'cancelled'
    | 'skipped'
    | undefined
  readonly number: number
  readonly started_at: string | undefined
  readonly completed_at: string | undefined
}

/** GitHub Actions workflow job. */
export interface WorkflowJob {
  readonly id: number
  readonly run_id: number
  readonly status: string
  readonly conclusion: string | undefined
  readonly started_at: string
  readonly completed_at: string | undefined
  readonly steps: ReadonlyArray<WorkflowStep>
}

/** GitHub Actions workflow run. */
export interface WorkflowRun {
  readonly id: number
  readonly name: string
  readonly status: 'queued' | 'in_progress' | 'completed'
  readonly conclusion: string | undefined
  readonly head_branch: string
  readonly head_sha: string
  readonly created_at: string
  readonly updated_at: string
  readonly head_commit: {
    readonly message: string
    readonly author: { readonly name: string; readonly email: string }
  }
}

/** Combined run + jobs entry for display. */
export interface DeployBuild {
  readonly run: WorkflowRun
  readonly jobs: ReadonlyArray<WorkflowJob>
}
