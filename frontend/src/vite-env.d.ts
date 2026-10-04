/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENABLE_MOCK_API: string;
  readonly VITE_ENABLE_GEMINI_AMBIENT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
