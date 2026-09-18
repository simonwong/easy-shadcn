import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";
import { ExamplePreview } from "./example-preview";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    ExamplePreview,
    table: (props) => <defaultMdxComponents.table tabIndex={0} {...props} />,
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock
        {...props}
        className={cn(
          "bg-(--shiki-light-bg) dark:bg-(--shiki-dark-bg)",
          props.className
        )}
      >
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
  };
}
