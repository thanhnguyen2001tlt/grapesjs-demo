import React, { useRef, useCallback } from 'react';
import { Editor, grapesjs } from 'grapesjs';
import GjsEditor from '@grapesjs/react';
import blocksBasic from 'grapesjs-blocks-basic';
import pluginForms from 'grapesjs-plugin-forms';
import pluginCountdown from 'grapesjs-component-countdown';
import presetWebpage from 'grapesjs-preset-webpage';
import pluginTabs from 'grapesjs-tabs';
import pluginTooltip from 'grapesjs-tooltip';
import pluginTyped from 'grapesjs-typed';
import customCodePlugin from 'grapesjs-custom-code';
import parserPostCSS from 'grapesjs-parser-postcss';
import pluginNavbar from 'grapesjs-navbar';
import imageEditor from 'grapesjs-tui-image-editor';
import pluginTemplates from 'grapesjs-templates';

import 'grapesjs/dist/css/grapes.min.css';

export default function App() {
  const editorRef = useRef<Editor | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const htmlCssInputRef = useRef<HTMLInputElement>(null);

  // Xử lý submit form từ canvas, tôn trọng method trên <form>
  const handleFormSubmit = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const action = form.getAttribute('action') || '/api/endpoint';
    const method = (form.getAttribute('method') || 'POST').toUpperCase();
    const formData = new FormData(form);

    try {
      let res: Response;

      if (method === 'GET') {
        const params = new URLSearchParams();
        formData.forEach((value, key) => {
          if (typeof value === 'string') {
            params.append(key, value);
          }
        });
        const url = `${action}?${params.toString()}`;
        res = await fetch(url, { method: 'GET' });
      } else {
        res = await fetch(action, {
          method,
          body: formData,
        });
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Giả sử response trả JSON
      const data = await res.json();
      console.log('Form submit thành công:', data);
      alert('Gửi form thành công!');
    } catch (err) {
      console.error('Lỗi khi gửi form:', err);
      alert('Gửi form thất bại');
    }
  };

  // Đăng ký listener khi editor load xong
  const handleEditor = useCallback((editor: Editor) => {
    editorRef.current = editor;
    editor.on('load', () => {
      const frame = editor.Canvas.getFrameEl();
      if (!frame) return;
      const doc = frame.contentDocument;
      if (!doc) return;
      doc.addEventListener('submit', handleFormSubmit);
    });
  }, []);

  // --- Xuất JSON dự án ---
  const exportJSON = () => {
    if (!editorRef.current) return;
    const data = editorRef.current.getProjectData();
    const str = JSON.stringify(data, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grapesjs-project.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Nạp JSON ---
  const importJSON = () => jsonInputRef.current?.click();
  const handleJSONChange: React.ChangeEventHandler<HTMLInputElement> = async e => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      editorRef.current.loadProjectData(json);
    } catch {
      alert('Không phải file JSON hợp lệ');
    }
    e.target.value = '';
  };

  // --- Nạp HTML & CSS ---
  const importHtmlCss = () => htmlCssInputRef.current?.click();
  const handleHtmlCssChange: React.ChangeEventHandler<HTMLInputElement> = async e => {
    if (!editorRef.current) return;
    const files = Array.from(e.target.files || []);
    let html = '', css = '';

    await Promise.all(
      files.map(async file => {
        const txt = await file.text();
        if (file.name.endsWith('.html')) html = txt;
        if (file.name.endsWith('.css')) css = txt;
      })
    );

    editorRef.current.DomComponents.clear();
    editorRef.current.CssComposer.clear();
    editorRef.current.setComponents(html);
    editorRef.current.setStyle(css);

    e.target.value = '';
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ padding: 8, background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <button onClick={exportJSON} style={{ marginRight: 8 }}>Xuất JSON</button>
        <button onClick={importJSON} style={{ marginRight: 8 }}>Nạp JSON</button>
        <button onClick={importHtmlCss}>Nạp HTML &amp; CSS</button>
        <input
          ref={jsonInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleJSONChange}
        />
        <input
          ref={htmlCssInputRef}
          type="file"
          accept=".html,.css"
          multiple
          style={{ display: 'none' }}
          onChange={handleHtmlCssChange}
        />
      </div>

      {/* GrapesJS Editor */}
      <div style={{ flex: 1 }}>
        <GjsEditor
          grapesjs={grapesjs}
          plugins={[
            blocksBasic,
            pluginForms,
            pluginCountdown,
            presetWebpage,
            pluginTabs,
            pluginTooltip,
            pluginTyped,
            customCodePlugin,
            parserPostCSS,
            pluginNavbar,
            imageEditor,
            pluginTemplates,
          ]}
          options={{ height: '100%', storageManager: false }}
          onEditor={handleEditor}
        />
      </div>
    </div>
  );
}
