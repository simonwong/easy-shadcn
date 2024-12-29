# instruction

## Project Structure

### Monorepo Architecture

- packages/react: a collection of components based on shadcn/ui
- packages/utils: a collection of utility functions
- apps/docs: a documentation site for the components
- apps/storybook: a storybook site for the components

### Dependencies

- React: ^18.3.1
- Next.js: 14.2.5
- TypeScript: ^5.5.4
- Tailwind CSS: ^3.4.7
- shadcn/ui: latest
- Radix UI: ^1.1.x

## packages

### packages/react

a collection of components based on shadcn/ui

#### Directory structure

- `react/components/ui`: a collection of re-usable components by shadcn/ui
- `react/src/**`: Develop enhanced components based on shadcn/ui and expose them for external use

### packages/utils

a collection of utility functions, such as `cn`

## apps

### apps/docs

a documentation site for the components

#### Technology Stack

- [Next.js](https://nextjs.org/)
- [Contentlayer2](https://github.com/timlrx/contentlayer2)
- [MDX](https://mdxjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [sugar-high](https://github.com/huozhi/sugar-high)

#### Directory structure

- `docs/content/components/*.mdx`: documentation for the components
- `docs/content/guide/*.mdx`: documentation for the guide
- `docs/examples/**`: examples for the components

### apps/storybook

a storybook site for the components

## Development Workflow

### Component Development

1. Create component directory under `packages/react/src/`
2. Implement component basic functionality
3. Write Stories and unit tests
4. Add documentation and examples
5. Submit changeset

### Documentation

- Write documentation using MDX under `apps/docs/content/docs/components/`
- Write examples under `apps/docs/example/`
- Include component description, props, and examples
- Examples should include basic usage and advanced usage
