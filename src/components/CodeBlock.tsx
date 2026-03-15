import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CodeBlock = ({ language, value, className }: { language: string, value: string, className?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("my-8 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-[#FAFAFA]", className)}>
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex space-x-2 items-center">
          <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm"></div>
        </div>
        <div className="text-xs font-mono font-medium text-gray-500 uppercase tracking-wider">{language || 'text'}</div>
        <button 
          onClick={handleCopy} 
          className="text-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-100"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <SyntaxHighlighter 
          language={language || 'text'} 
          style={oneLight} 
          customStyle={{ margin: 0, padding: 0, background: 'transparent', fontSize: '13px' }}
          wrapLines={true}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
