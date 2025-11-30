import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { containsArabic } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  code: string;
  language: string;
}

/**
 * Code block component with copy button
 */
const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('تم نسخ الكود!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('فشل نسخ الكود');
    }
  };

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-border group">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          backgroundColor: '#1e1e1e',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

/**
 * Renders markdown content with syntax highlighting for code blocks
 * Supports RTL for Arabic text
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const isArabic = containsArabic(content);

  return (
    <div className={`markdown-content ${className}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <ReactMarkdown
        components={{
          // Custom code block rendering with syntax highlighting
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            
            return !inline && match ? (
              <CodeBlock code={codeString} language={match[1]} />
            ) : (
              <code
                {...props}
                className={`px-1.5 py-0.5 rounded bg-secondary text-foreground text-sm font-mono ${className || ''}`}
                dir="ltr"
              >
                {children}
              </code>
            );
          },
          // Custom paragraph rendering for RTL support
          p({ children, ...props }: any) {
            const text = React.Children.toArray(children).join('');
            const paragraphIsArabic = containsArabic(text);
            
            return (
              <p
                {...props}
                className={`mb-3 last:mb-0 ${paragraphIsArabic ? 'text-right' : 'text-left'}`}
                dir={paragraphIsArabic ? 'rtl' : 'ltr'}
              >
                {children}
              </p>
            );
          },
          // Custom list rendering
          ul({ children, ...props }: any) {
            return (
              <ul {...props} className="list-disc list-inside mb-3 space-y-1">
                {children}
              </ul>
            );
          },
          ol({ children, ...props }: any) {
            return (
              <ol {...props} className="list-decimal list-inside mb-3 space-y-1">
                {children}
              </ol>
            );
          },
          // Custom heading rendering
          h1({ children, ...props }: any) {
            const text = React.Children.toArray(children).join('');
            const headingIsArabic = containsArabic(text);
            
            return (
              <h1
                {...props}
                className={`text-2xl font-bold mb-3 mt-4 first:mt-0 ${headingIsArabic ? 'text-right' : 'text-left'}`}
                dir={headingIsArabic ? 'rtl' : 'ltr'}
              >
                {children}
              </h1>
            );
          },
          h2({ children, ...props }: any) {
            const text = React.Children.toArray(children).join('');
            const headingIsArabic = containsArabic(text);
            
            return (
              <h2
                {...props}
                className={`text-xl font-bold mb-2 mt-3 first:mt-0 ${headingIsArabic ? 'text-right' : 'text-left'}`}
                dir={headingIsArabic ? 'rtl' : 'ltr'}
              >
                {children}
              </h2>
            );
          },
          h3({ children, ...props }: any) {
            const text = React.Children.toArray(children).join('');
            const headingIsArabic = containsArabic(text);
            
            return (
              <h3
                {...props}
                className={`text-lg font-semibold mb-2 mt-3 first:mt-0 ${headingIsArabic ? 'text-right' : 'text-left'}`}
                dir={headingIsArabic ? 'rtl' : 'ltr'}
              >
                {children}
              </h3>
            );
          },
          // Custom blockquote rendering
          blockquote({ children, ...props }: any) {
            return (
              <blockquote
                {...props}
                className="border-l-4 border-primary pl-4 italic my-3 text-muted-foreground"
              >
                {children}
              </blockquote>
            );
          },
          // Custom link rendering
          a({ children, ...props }: any) {
            return (
              <a
                {...props}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          // Custom strong/bold rendering
          strong({ children, ...props }: any) {
            return (
              <strong {...props} className="font-bold">
                {children}
              </strong>
            );
          },
          // Custom emphasis/italic rendering
          em({ children, ...props }: any) {
            return (
              <em {...props} className="italic">
                {children}
              </em>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

