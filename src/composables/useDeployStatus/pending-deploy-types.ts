/**
 * Synthetic DeployBuild representing a commit that was just saved
 * in the admin UI but whose GitHub Actions run has not yet been
 * registered. Merged into the shared entries list so the home page
 * shows the user's action without a 10-30s gap while GitHub catches
 * up. Replaced on the next poll tick when a real run with a matching
 * head_commit.message appears.
 */
export interface PendingDeploy {
  readonly id: string
  readonly message: string
  readonly createdAt: string
}
