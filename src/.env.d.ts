/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  // add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}