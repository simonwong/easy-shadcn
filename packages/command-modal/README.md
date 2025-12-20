# Command Modal

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

## Documentation

📚 **[Full Documentation](https://your-docs-url.com/docs/packages/command-modal)**

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
