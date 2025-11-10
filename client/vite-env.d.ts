/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_API_BASE?: string;
    readonly VITE_EMBED_BASE?: string;
    readonly VITE_WIDGET_PATH?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv; }
