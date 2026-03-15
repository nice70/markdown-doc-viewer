import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Mermaid } from './Mermaid';
import { CodeBlock } from './CodeBlock';

export const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <div className="markdown-body max-w-none text-gray-800 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-4xl font-bold tracking-tight text-gray-900 mt-12 mb-8 pb-4 border-b border-gray-100" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mt-10 mb-6" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-medium tracking-tight text-gray-900 mt-8 mb-4" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-lg font-medium tracking-tight text-gray-900 mt-6 mb-3" {...props} />,
          p: ({ node, ...props }) => <p className="text-base text-gray-700 mb-6 leading-[1.8]" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-600 hover:text-blue-800 underline underline-offset-4 decoration-blue-200 hover:decoration-blue-600 transition-all font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 text-gray-700 space-y-2" {...props} />,
          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-900 pl-6 italic text-gray-600 my-8 bg-gray-50 py-4 pr-4 rounded-r-xl shadow-sm" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 bg-white" {...props} />,
          tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
          th: ({ node, ...props }) => <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
          td: ({ node, ...props }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-10 border-gray-200" {...props} />,
          pre: ({ children }: any) => {
            if (React.isValidElement(children)) {
              return React.cloneElement(children as React.ReactElement<any>, { isBlock: true });
            }
            return <pre>{children}</pre>;
          },
          code({ node, className, children, isBlock, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const value = String(children).replace(/\n$/, '');

            if (isBlock) {
              if (language === 'mermaid') {
                return <Mermaid chart={value} />;
              }
              return <CodeBlock language={language} value={value} />;
            }

            return (
              <code className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 font-mono text-[0.85em] border border-gray-200" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
