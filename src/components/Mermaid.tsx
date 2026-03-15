import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#F3F4F6',
    primaryTextColor: '#111827',
    primaryBorderColor: '#D1D5DB',
    lineColor: '#6B7280',
    secondaryColor: '#E5E7EB',
    tertiaryColor: '#F9FAFB',
  },
  securityLevel: 'loose',
});

// Global queue to prevent concurrent mermaid rendering issues
let renderQueue = Promise.resolve();

const preprocessMermaid = (code: string) => {
  let processed = code.trim();
  const isFlowchart = processed.startsWith('flowchart') || processed.startsWith('graph');
  
  if (isFlowchart) {
    // Fix multiline text inside {}, [], (), || which causes syntax errors if unquoted
    const pairs = [
      ['\\{', '\\}'],
      ['\\[', '\\]'],
      ['\\(', '\\)'],
      ['\\|', '\\|']
    ];
    
    pairs.forEach(([open, close]) => {
      const regex = new RegExp(`${open}([^${open}${close}]+?)${close}`, 'gs');
      processed = processed.replace(regex, (match, inner) => {
        if (inner.includes('\n')) {
          let fixedInner = inner.replace(/\n\s*/g, '<br/>');
          // Clean up leading/trailing <br/>
          fixedInner = fixedInner.replace(/^(?:<br\/>)+|(?:<br\/>)+$/g, '');
          
          if (fixedInner.trim().startsWith('"') && fixedInner.trim().endsWith('"')) {
             return match.replace(inner, fixedInner);
          }
          // Wrap in quotes and escape existing quotes
          const escapedInner = fixedInner.replace(/"/g, '&quot;');
          return match.replace(inner, `"${escapedInner}"`);
        }
        return match;
      });
    });
  }
  
  return processed;
};

export const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');
  const id = useRef(`m${Math.random().toString(36).substring(2, 11)}`);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      renderQueue = renderQueue.then(async () => {
        if (!isMounted) return;
        try {
          setError(false);
          const cleanChart = preprocessMermaid(chart);
          const { svg: renderedSvg } = await mermaid.render(id.current, cleanChart);
          if (isMounted) {
            setSvg(renderedSvg);
          }
        } catch (e: any) {
          console.error('Mermaid rendering error', e);
          if (isMounted) {
            setError(true);
            setErrorText(e?.message || 'Syntax Error');
          }
        }
      }).catch(e => {
        console.error('Queue error', e);
      });
    };

    if (chart) {
      renderChart();
    }

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-mono my-6 shadow-sm">
        <div className="font-semibold mb-1">Mermaid Syntax Error</div>
        <div className="text-xs mb-2 opacity-80 whitespace-pre-wrap">{errorText}</div>
        <pre className="overflow-x-auto mt-4 p-4 bg-white/50 rounded-lg">{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      className="flex justify-center my-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto" 
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};
