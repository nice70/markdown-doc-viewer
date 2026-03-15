/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Edit3, Eye, FileText, Download } from 'lucide-react';
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

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
              <FileText className="text-white w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight text-gray-900">Premium Doc Viewer</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="Download Markdown"
            >
              <Download className="w-5 h-5" />
            </button>
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {mode === 'preview' ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white p-8 sm:p-16 rounded-3xl shadow-sm border border-gray-200/60 min-h-[80vh]"
            >
              <MarkdownRenderer content={markdown} />
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
