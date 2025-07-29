'use client';

import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from 'fumadocs-ui/components/codeblock';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import ExampleSet from '@/components/examples';
import { cn } from '@/lib/utils';

export interface ExamplePreviewProps {
  name: keyof typeof ExampleSet;
  previewCenter?: boolean;
}

export const ExamplePreview: React.FC<
  PropsWithChildren<ExamplePreviewProps>
> = ({ name, previewCenter = true }) => {
  if (!(name in ExampleSet)) {
    return <div>Not Found Example: {name}</div>;
  }
  const example = ExampleSet[name];
  const Preview = example.component;

  return (
    <div>
      <CodeBlockTabs defaultValue="preview">
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger className="cursor-pointer" value="preview">
            Preview
          </CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger className="cursor-pointer" value="code">
            Code
          </CodeBlockTabsTrigger>
        </CodeBlockTabsList>
        <CodeBlockTab value="preview">
          <div
            className={cn(
              'not-prose bg-[radial-gradient(#00000020_1px,transparent_1px)] p-5 [background-size:16px_16px]',
              previewCenter && 'flex items-center justify-center'
            )}
          >
            {<Preview />}
          </div>
        </CodeBlockTab>
        <CodeBlockTab value="code">
          <DynamicCodeBlock code={example.codeString.trim()} lang="tsx" />
        </CodeBlockTab>
      </CodeBlockTabs>
    </div>
  );
};
