import React, { useRef } from 'react';
import { Editor, grapesjs } from 'grapesjs';
import GjsEditor from '@grapesjs/react';

import blocksBasic from 'grapesjs-blocks-basic';
import pluginForms from 'grapesjs-plugin-forms';
import pluginCountdown from 'grapesjs-component-countdown';
import presetWebpage from 'grapesjs-preset-webpage';
import pluginTabs from 'grapesjs-tabs';
import pluginTooltip from 'grapesjs-tooltip';
import pluginTyped from 'grapesjs-typed';

import 'grapesjs/dist/css/grapes.min.css';

export default function App() {
  const editorRef = useRef<Editor | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const htmlCssInputRef = useRef<HTMLInputElement>(null);

  // Lưu instance editor
  const handleEditor = (editor: Editor) => {
    editorRef.current = editor;
    console.log('Editor loaded', editor);
  };

  // Xuất JSON
  const exportJSON = () => {
    if (!editorRef.current) return;
    const data = editorRef.current.getProjectData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grapesjs-project.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mở file picker JSON
  const importJSON = () => {
    jsonInputRef.current?.click();
  };

  // Xử lý file JSON
  const handleJSONChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      editorRef.current.loadProjectData(json);
    } catch (err) {
      console.error('Invalid JSON file', err);
      alert('Không phải file JSON hợp lệ');
    }
    e.target.value = '';
  };

  // Mở file picker HTML & CSS
  const importHtmlCss = () => {
    htmlCssInputRef.current?.click();
  };

  // Xử lý file HTML & CSS
  const handleHtmlCssChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!editorRef.current) return;
    const files = Array.from(e.target.files || []);
    let html = '';
    let css = '';

    await Promise.all(
      files.map(async (file) => {
        const text = await file.text();
        if (file.name.endsWith('.html')) html = text;
        if (file.name.endsWith('.css')) css = text;
      })
    );

    // Clear project cũ
    editorRef.current.DomComponents.clear();
    editorRef.current.CssComposer.clear();
    // Nạp mới
    editorRef.current.setComponents(html);
    editorRef.current.setStyle(css);

    e.target.value = '';
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 8, background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <button onClick={exportJSON} style={{ marginRight: 8 }}>Xuất JSON</button>
        <button onClick={importJSON} style={{ marginRight: 8 }}>Nạp JSON</button>
        <button onClick={importHtmlCss}>Nạp HTML & CSS</button>
        {/* Input ẩn cho JSON */}
        <input
          ref={jsonInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleJSONChange}
        />
        {/* Input ẩn cho HTML & CSS */}
        <input
          ref={htmlCssInputRef}
          type="file"
          accept=".html,.css"
          multiple
          style={{ display: 'none' }}
          onChange={handleHtmlCssChange}
        />
      </div>
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
          ]}
          pluginsOpts={{
            'grapesjs-plugin-forms': { blocks: ['input', 'textarea', 'button'] },
            'grapesjs-component-countdown': { defaultEndDate: new Date(Date.now() + 3600 * 1000) },
            'grapesjs-typed': { strings: ['Hello', 'GrapesJS', 'React'], typeSpeed: 100, loop: true },
          }}
          options={{ height: '100%', storageManager: false }}
          onEditor={handleEditor}
        />
      </div>
    </div>
  );
}
