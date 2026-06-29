# @easy-shadcn/command-modal

Imperative modal management library for React with TypeScript support.

## Features

- **Imperative API** - Control modals with simple `show()` and `hide()` calls
- **Type-safe** - Full TypeScript support with generic types
- **Flexible** - Works with any modal UI library through adapters
- **Promise-based** - Async/await support for modal workflows
- **Zero dependencies** - Core library has no external dependencies

## Installation

```bash
npm install @easy-shadcn/command-modal
```

## Quick Start

```tsx
import CommandModal from '@easy-shadcn/command-modal';

// 1. Add Provider
function App() {
  return (
    <CommandModal.Provider>
      {/* Your app */}
    </CommandModal.Provider>
  );
}

// 2. Create Modal
const MyModal = CommandModal.create(() => {
  const modal = CommandModal.useModal();
  return <Dialog {...modal.modalProps}>Content</Dialog>;
});

// 3. Show Modal
CommandModal.show(MyModal);
```

## Typed results

Declare a modal's resolve type on `create` and `show` infers it — no casts,
args still checked:

```tsx
const EditUser = CommandModal.create<{ userId: string }, User>(/* … */);

const user = await CommandModal.show(EditUser, { userId }); // user: User
```

## Other UI libraries (antd, …)

shadcn is the zero-config default. For another library, pair its adapter with
`createCommandModal` once in an app-local module — `useModal().modalProps` is
then typed for that library:

```tsx
// lib/modal.ts
import { createCommandModal } from '@easy-shadcn/command-modal';
import { antdModalProps } from '@easy-shadcn/command-modal/antd';

export const { Provider, useModal } = createCommandModal(antdModalProps);
```

`antd` is first-class (official adapter at the `/antd` subpath, no `antd`
dependency added to the core). Any other library works via your own typed
adapter. See the docs for the full recipe (barrel re-export + `no-restricted-imports`).

## Documentation

📚 **[Full Documentation](https://easy-shadcn.vercel.app/docs/packages/command-modal)**

Comprehensive guides including:

- API Reference
- Advanced Usage (Custom Adapters, Nested Modals, etc.)
- TypeScript Guide
- Best Practices
- Examples and Tutorials

## Credits

This project is inspired by and built upon the patterns established by [@ebay/nice-modal-react](https://github.com/eBay/nice-modal-react). Special thanks to the original authors for their pioneering work in imperative modal management.

## License

MIT
