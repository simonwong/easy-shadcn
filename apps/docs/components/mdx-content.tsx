'use client';

import { useMDXComponent } from 'next-contentlayer2/hooks';
import Link from 'next/link';
import React from 'react';
import { ExamplePreview } from './docs/example-preview';
import { CodePreview, PreBlock } from './code-preview';

interface MDXContentProps {
  code: string;
}

function CustomLink({
  href,
  children,
  ...restProps
}: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) {
  if (href && href.startsWith('/')) {
    return (
      <Link href={href} {...restProps}>
        {children}
      </Link>
    );
  }

  if (href && href.startsWith('#')) {
    return <a {...restProps}>{children}</a>;
  }

  return (
    <a target="_blank" rel="noopener noreferrer" href={href} {...restProps}>
      {children}
    </a>
  );
}

function slugify(str: string) {
  return (
    str
      .toString()
      .toLowerCase()
      .trim() // Remove whitespace from both ends of a string
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/&/g, '-and-') // Replace & with 'and'
      // .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
      .replace(/--+/g, '-')
  ); // Replace multiple - with single -
}

function createHeading(level: number) {
  const Heading = ({
    children,
  }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => {
    const slug = slugify(children as string);
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    );
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  a: CustomLink,
  code: CodePreview,
  pre: PreBlock,
  ExamplePreview,
};

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMDXComponent(code);

  return (
    <article className="prose">
      <Component components={components} />
    </article>
  );
}
