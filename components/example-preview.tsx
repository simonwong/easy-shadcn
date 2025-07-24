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

export interface ExamplePreviewProps {
  name: keyof typeof ExampleSet;
}

export const ExamplePreview: React.FC<
  PropsWithChildren<ExamplePreviewProps>
> = ({ name }) => {
  if (!(name in ExampleSet)) {
    return <div>Not Found Example: {name}</div>;
  }
  const example = ExampleSet[name];
  const Preview = example.component;

  return (
    <div>
      <CodeBlockTabs>
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger value="preview">Preview</CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger value="code">Code</CodeBlockTabsTrigger>
        </CodeBlockTabsList>
        <CodeBlockTab value="preview">
          <div className="not-prose rounded-md border bg-[radial-gradient(#00000020_1px,transparent_1px)] p-5 [background-size:16px_16px]">
            {<Preview />}
          </div>
        </CodeBlockTab>
        <CodeBlockTab value="code">
          <DynamicCodeBlock code={example.codeString} lang="tsx" />
        </CodeBlockTab>
      </CodeBlockTabs>
    </div>
  );
};
