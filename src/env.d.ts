/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FINNHUB_API_KEY: string;
  // 可以在這裡添加更多環境變數
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
