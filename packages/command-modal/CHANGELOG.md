# @easy-shadcn/command-modal

## 0.0.2

### Patch Changes

- [#48](https://github.com/simonwong/easy-shadcn/pull/48) [`d38e5cf`](https://github.com/simonwong/easy-shadcn/commit/d38e5cfd9b76e91e399bc33701969bac143f5761) Thanks [@simonwong](https://github.com/simonwong)! - migrate to tsdown, better output structure

- [#48](https://github.com/simonwong/easy-shadcn/pull/48) [`4781515`](https://github.com/simonwong/easy-shadcn/commit/4781515f3ce5760c09f4951098bcc63092b1beef) Thanks [@simonwong](https://github.com/simonwong)! - Integrated unit test

- [#50](https://github.com/simonwong/easy-shadcn/pull/50) [`884af57`](https://github.com/simonwong/easy-shadcn/commit/884af57534adb88f21ae192c68e699c8fc35ee84) Thanks [@simonwong](https://github.com/simonwong)! - add use client

- [#48](https://github.com/simonwong/easy-shadcn/pull/48) [`12e31b4`](https://github.com/simonwong/easy-shadcn/commit/12e31b4981980e6ca5e32c1d3a23d268ddd0c977) Thanks [@simonwong](https://github.com/simonwong)! - support both named export and default export

  **usage**:

  ```typescript
  // Named export
  import { create, useModal, Provider } from "@easy-shadcn/command-modal";

  // Default export
  import CommandModal from "@easy-shadcn/command-modal";

  // Namespace import
  import * as CommandModal from "@easy-shadcn/command-modal";
  ```

- [#48](https://github.com/simonwong/easy-shadcn/pull/48) [`ebd3fde`](https://github.com/simonwong/easy-shadcn/commit/ebd3fdee26e69329a837a23651de997a0b042644) Thanks [@simonwong](https://github.com/simonwong)! - change unique modal ID

## 0.0.1

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
