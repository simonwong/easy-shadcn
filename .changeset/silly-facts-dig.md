---
"@easy-shadcn/command-modal": patch
---

use Named export instead of default export

**before**:

```typescript
import CommandModal from "@easy-shadcn/command-modal";
```

**after**:

```typescript
import * as CommandModal from "@easy-shadcn/command-modal";
```
