import LightningFS from '@isomorphic-git/lightning-fs'

/** IndexedDB-backed filesystem for isomorphic-git */
export const fs = new LightningFS('sw-git')

/** Root working directory for the cloned repository */
export const REPO_DIR = '/repo'
