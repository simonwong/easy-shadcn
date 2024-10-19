'use client';

import { Tabs } from '@easy-shadcn/react';
import React, { PropsWithChildren } from 'react';
import ExampleSet from '@/example';
import { PreBlock, CodePreview } from '../code-preview';

export interface ExamplePreviewProps {
  name: keyof typeof ExampleSet;
}

export const ExamplePreview: React.FC<PropsWithChildren<ExamplePreviewProps>> = ({ name }) => {
  if (!(name in ExampleSet)) {
    return <div>Not Found Example: {name}</div>;
  }
  const example = ExampleSet[name];
  const Preview = example.component;

  return (
    <div>
      <Tabs
        defaultValue="preview"
        option={[
          {
            title: 'Preview',
            value: 'preview',
            content: (
              <div className="not-prose rounded-md border bg-[radial-gradient(#00000020_1px,transparent_1px)] p-5 [background-size:16px_16px]">
                {<Preview />}
              </div>
            ),
          },
          {
            title: 'Code',
            value: 'code',
            content: (
              <PreBlock>
                <CodePreview>{example.codeString}</CodePreview>
              </PreBlock>
            ),
          },
        ]}
      />
    </div>
  );
};
