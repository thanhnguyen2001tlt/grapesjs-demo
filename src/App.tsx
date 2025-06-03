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

  // Xử lý submit trong iframe
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
        res = await fetch(action, { method, body: formData });
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('Form submitted successfully:', data);
      alert('Form submitted successfully!');
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Form submission failed');
    }
  };

  // Khởi tạo editor và gắn sự kiện submit
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

  // Export JSON
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

  // Import JSON
  const importJSON = () => jsonInputRef.current?.click();
  const handleJSONChange: React.ChangeEventHandler<HTMLInputElement> = async e => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      editorRef.current.loadProjectData(json);
    } catch {
      alert('Invalid JSON file');
    }
    e.target.value = '';
  };

  // Import HTML + CSS
  const importHtmlCss = () => htmlCssInputRef.current?.click();
 const handleHtmlCssChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
  if (!editorRef.current) return;
  const files = Array.from(e.target.files || []);
  let html = '', css = '';

  // Đọc nội dung từ tất cả các file
  await Promise.all(files.map(async (file) => {
    const content = await file.text();

    if (file.name.endsWith('.html')) {
      html = content;

      // Tách CSS bên trong <style> nếu có
      const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      if (styleMatch) {
        css += styleMatch[1]; // lấy CSS từ thẻ <style>
      }

      // Tách nội dung body
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        html = bodyMatch[1];
      }
    }

    if (file.name.endsWith('.css')) {
      css += content; // cộng dồn nếu có file CSS riêng
    }
  }));

  // Dọn editor và gán nội dung mới
  const editor = editorRef.current;
  editor.DomComponents.clear();
  editor.CssComposer.clear();
  editor.setComponents(html, { avoidInlineStyle: false });
  editor.setStyle(css);

  e.target.value = '';
};


  const buttonStyle: React.CSSProperties = {
    marginRight: 8,
    padding: '6px 12px',
    borderRadius: 4,
    border: '1px solid #007bff',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ padding: 8, background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <button style={buttonStyle} onClick={exportJSON}>Export JSON</button>
        <button style={buttonStyle} onClick={importJSON}>Import JSON</button>
        <button style={buttonStyle} onClick={importHtmlCss}>Import HTML & CSS</button>
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
