'use client';

import { useMDXComponent } from 'next-contentlayer2/hooks';
import { ExamplePreview } from './docs/example-preview';

interface MDXContentProps {
  code: string;
}

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMDXComponent(code);

  return (
    <article className="prose">
      <Component
        components={{
          ExamplePreview,
          a: ({ children, ...resetProps }) => (
            <a target="__blank" {...resetProps}>
              {children}
            </a>
          ),
        }}
      />
    </article>
  );
}
