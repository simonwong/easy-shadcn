---
"@easy-shadcn/command-modal": patch
---

### Features

- **Imperative Modal Management**: Introduced a Promise-based API to handle modals dynamically, eliminating the need for repetitive `useState` hooks in your components.
- **Shadcn UI Optimization**: Deep integration with Shadcn's `Dialog` components, providing specialized control over `Overlay` and stack management.
- **React 19 & TS 5.x Ready**: Fully compatible with the latest React 19 types, resolving previous `JSX` namespace conflicts.
- **Dual Format Support**: Ships with both ESM (`.mjs`) and CJS (`.js`) builds for seamless compatibility with Vite, Next.js (App Router), and legacy Node.js environments.

### Improvements

- **Full Type Safety**: Comprehensive TypeScript definitions with intelligent prop inference for `createModal`.
- **Lightweight & Tree-shakable**: Minimal footprint designed to work efficiently within the `@easy-shadcn` ecosystem.
- **Monorepo Integration**: Optimized for use within the `@easy-shadcn` workspace using `workspace:*` resolution.

### Credits

- Core logic inspired by the pioneering work of `@ebay/nice-modal-react`. Built with modern enhancements for the Shadcn community.
