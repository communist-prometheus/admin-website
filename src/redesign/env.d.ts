/// <reference types="vite/client" />

/** Ambient module declarations for the redesign preview (Vite asset imports). */
declare module '*.css';

interface ImportMetaEnv {
  readonly VITE_DEV_TOKEN?: string;
  readonly VITE_GITHUB_OWNER?: string;
  readonly VITE_GITHUB_REPO?: string;
  readonly VITE_GITHUB_BRANCH?: string;
  readonly VITE_GITHUB_CONTENT_PATH?: string;
  readonly VITE_CORS_PROXY?: string;
  readonly VITE_MOCK_AUTH?: string;
}
