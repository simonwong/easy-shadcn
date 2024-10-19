import React from 'react';
import { highlight } from 'sugar-high';

export const CodePreview = ({
  children,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) => {
  const codeHTML = highlight(children as string);
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
};

export const PreBlock = ({
  children,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>) => {
  return (
    <pre className="max-h-[500px] overflow-auto" {...props}>
      {children}
    </pre>
  );
};
