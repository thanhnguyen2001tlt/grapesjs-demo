// src/@types/grapesjs-react.d.ts
import 'grapesjs';
declare module '@grapesjs/react' {
  interface EditorProps {
    /** cấu hình riêng cho từng plugin */
    pluginsOpts?: Record<string, any>;
    /** nếu dùng import grapesjs từ npm thay vì CDN */
    grapesjs?: any;
  }
}
