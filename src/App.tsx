/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Edit3, Eye, FileText, Download, ChevronDown, FileCode, Printer, UploadCloud, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_MARKDOWN = `
# 高级系统架构设计文档

本文档展示了我们最新的系统架构设计。基于第一性原理，我们重构了核心链路，确保在极高并发场景下的**高可用性**与**零瑕疵**体验。

## 1. 核心架构图

以下是使用 Mermaid 绘制的高质量系统架构流转图，展示了从客户端请求到数据湖的完整生命周期：

\`\`\`mermaid
graph TD
    A[客户端请求] --> B{API 网关}
    B -->|鉴权成功| C[微服务集群]
    B -->|鉴权失败| D[拒绝访问]
    C --> E[(分布式数据库)]
    C --> F[Redis 缓存]
    E -.->|数据同步| G[数据湖]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5
    style C fill:#dfd,stroke:#333,stroke-width:2px
\`\`\`

## 2. 核心算法实现

我们在处理高并发时，采用了以下优雅的代码实现。注意其对异常处理的极致克制：

\`\`\`typescript
/**
 * 优雅的重试机制实现 (Exponential Backoff)
 * @param fn 需要执行的异步函数
 * @param retries 最大重试次数
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    console.warn(\`执行失败，剩余重试次数: \${retries}\`);
    
    // 指数退避策略 (Exponential Backoff)
    const delay = Math.pow(2, 3 - retries) * 1000;
    await new Promise(res => setTimeout(res, delay));
    
    return withRetry(fn, retries - 1);
  }
}
\`\`\`

> **架构师注**：
> 真正的优雅不在于使用了多少前沿技术，而在于对复杂度的极致克制。我们假设网络会断、数据库会崩、用户输入全是攻击代码。设计必须包含完整的容错（Fault Tolerance）和降级策略。

## 3. 性能指标对比

| 指标 | 重构前 | 重构后 | 提升幅度 |
| :--- | :--- | :--- | :--- |
| P99 延迟 | 1250ms | 85ms | **93.2%** |
| 吞吐量 (QPS) | 2,500 | 45,000 | **1700%** |
| 内存占用 | 4.2GB | 850MB | **79.7%** |

## 4. 部署配置

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: core-service
  template:
    metadata:
      labels:
        app: core-service
    spec:
      containers:
      - name: core-service
        image: registry.example.com/core:v2.1.0
        resources:
          limits:
            memory: "1Gi"
            cpu: "1000m"
\`\`\`

请点击右上角的 **Edit** 按钮，粘贴您自己的 Markdown 文件内容以预览效果。
`;

export default function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN.trim());
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.type === 'text/markdown' || file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setMarkdown(content);
          setMode('preview');
        }
      };
      reader.readAsText(file);
    } else {
      alert('请上传有效的 Markdown (.md) 文件。');
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDownloadMenu(false);
    if (showDownloadMenu) {
      // Small delay to prevent immediate closure from the toggle click
      setTimeout(() => document.addEventListener('click', handleClickOutside), 10);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDownloadMenu]);

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHTML = () => {
    if (!previewRef.current) return;
    const contentHtml = previewRef.current.innerHTML;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #FAFAFA;
      color: #111827;
      -webkit-font-smoothing: antialiased;
    }
    /* Hide copy buttons in export since they rely on React state/events */
    button[aria-label="Copy code"] {
      display: none !important;
    }
  </style>
</head>
<body>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white p-8 sm:p-16 rounded-3xl shadow-sm border border-gray-200/60">
      ${contentHtml}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const executePrintDownload = () => {
    if (!previewRef.current) return;
    const contentHtml = previewRef.current.innerHTML;
    
    // Generate a specialized HTML file that auto-triggers the print dialog
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Print Document</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #ffffff;
      color: #000000;
      -webkit-font-smoothing: antialiased;
    }
    button[aria-label="Copy code"] { display: none !important; }
    @media print {
      @page { margin: 20mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="max-w-4xl mx-auto px-8 py-12">
    ${contentHtml}
  </div>
  <script>
    // Automatically trigger print dialog when opened locally
    window.onload = () => {
      setTimeout(() => {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'print-ready.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    if (mode !== 'preview') {
      setMode('preview');
      // Wait for React to render the preview and Framer Motion to finish
      setTimeout(() => executePrintDownload(), 300);
    } else {
      executePrintDownload();
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 print:bg-white relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-blue-50/90 backdrop-blur-sm border-4 border-dashed border-blue-400 m-4 rounded-3xl"
          >
            <div className="flex flex-col items-center justify-center text-blue-600 pointer-events-none">
              <UploadCloud className="w-20 h-20 mb-6 animate-bounce" />
              <h2 className="text-3xl font-bold tracking-tight mb-2">松开鼠标，立即预览</h2>
              <p className="text-blue-500/80 font-medium">Release to instantly preview your document</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
              <FileText className="text-white w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight text-gray-900">Premium Doc Viewer</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 mr-2 border-r border-gray-200 pr-4">
              <input
                type="file"
                accept=".md,.markdown,text/markdown"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Upload Markdown File"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="flex items-center space-x-1 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export Options"
              >
                <Download className="w-5 h-5" />
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showDownloadMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50 border-b border-gray-100">Export As</div>
                    <button onClick={handleDownloadMarkdown} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>Markdown Source</span>
                    </button>
                    <button onClick={handleDownloadHTML} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                      <FileCode className="w-4 h-4 text-emerald-500" />
                      <span>Standalone HTML</span>
                    </button>
                    <button onClick={handlePrintPDF} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                      <Printer className="w-4 h-4 text-purple-500" />
                      <span>Print / Save as PDF</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-full shadow-inner border border-gray-200/50">
              <button
                onClick={() => setMode('preview')}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  mode === 'preview' 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setMode('edit')}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  mode === 'edit' 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 print:p-0 print:max-w-none">
        <AnimatePresence mode="wait">
          {mode === 'preview' ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white p-8 sm:p-16 rounded-3xl shadow-sm border border-gray-200/60 min-h-[80vh] print:shadow-none print:border-none print:p-0 print:min-h-0"
            >
              <div ref={previewRef}>
                <MarkdownRenderer content={markdown} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-[80vh] flex flex-col"
            >
              <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden flex flex-col">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Markdown Editor</span>
                  <span className="text-xs text-gray-400 font-mono">{markdown.length} chars</span>
                </div>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="flex-1 w-full p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed text-gray-800 bg-transparent"
                  placeholder="Paste your markdown here..."
                  spellCheck={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
