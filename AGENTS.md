# Coding Agents

This file provides guidance to Coding Agents when working with code in this repository.

## Project Overview

easy-shadcn 是一个基于 shadcn/ui 的组件库，采用 monorepo 结构，包含：

- **文档站点**：基于 Next.js 16 + Fumadocs
- **npm 包**：位于 `packages/` 目录下

## Common Commands

```bash
# Development
pnpm dev                    # 启动开发服务器（自动生成示例索引）
pnpm build                  # 构建文档站点

# Packages
pnpm package:build          # 构建所有 packages
pnpm -F @easy-shadcn/command-modal build  # 构建单个包

# Testing (command-modal package)
cd packages/command-modal
pnpm test                   # 运行测试
pnpm test:watch             # 监听模式
pnpm test:coverage          # 运行测试并生成覆盖率报告

# Linting
pnpm fix # 使用 ultracite (Biomejs) 修复代码，禁止使用。使用指定文件 `pnpm exec ultracite fix [files...]`
pnpm check # 使用 ultracite (Biomejs) 检查代码，禁止使用。使用指定文件 `pnpm exec ultracite check [files...]`
```

## Architecture

### Monorepo Structure

```
packages/
└── command-modal/     # 模态框管理库（类似 @ebay/nice-modal-react）
    ├── src/           # 源码
    ├── test/          # Vitest 测试
    ├── lib/           # CommonJS 输出
    └── es/            # ES modules 输出

registry/
└── ui/                # shadcn/ui 组件封装
    └── modal/         # Modal 组件（依赖 command-modal）

components/examples/   # 组件示例（自动索引生成）
content/docs/          # MDX 文档内容
```

### Command-Modal Package

核心的模态框状态管理库，采用 Redux-like 模式：

- **context.tsx**: Provider + reducer 状态管理
- **useModal.tsx**: 主 hook，支持字符串 ID 或 React 组件两种调用方式
- **actions.tsx**: Action creators (create, register, show, hide, remove)
- **holders.tsx**: ModalHolder 包装组件
- **constants.ts**: 模态框注册表和回调存储

使用方式：

```tsx
const modal = useModal(MyModalComponent)
modal.show({ data: 'props' })
modal.hide()
```

### Build Tools

- **tsdown**: 用于 command-modal 包的构建（双格式输出 CJS + ESM）
- **Next.js**: 文档站点
- **Vitest + jsdom**: 单元测试

## Component Design Philosophy

本库对 shadcn/ui 采用 **双层架构** 封装，**新增 `registry/ui/*` 组件必须遵循以下原则**。

### 分层结构

- **底层原语** (`components/ui/*`)：shadcn 原生 compound component（如 `<Card><CardHeader><CardTitle>...`），保留完整组合自由度
- **Compose 层** (`registry/ui/*`)：基于原语的扁平化封装，用 props 代替 children 结构

### 核心原则：80/20

Compose 层服务 **80% 常见场景**，牺牲灵活性换取易用性。复杂的 20% 场景，用户直接使用 `components/ui/*` 原语自己组合，**不在 Compose 层开口子**。这是一条硬线——每次想加 prop 时都要回到这条线上问一遍。

### 新增组件时的规则

**1. 扁平 props 优先于 children 结构**

```tsx
// ✅ 好：一个 prop 对应一个 slot
<Card title="..." description="..." footer={<Btn />}>body</Card>

// ❌ 差：强迫用户写嵌套
<Card><CardHeader><CardTitle>...</CardTitle></CardHeader>...</Card>
```

**2. 每个 slot 默认只暴露 `xxxClassName`，克制地使用 `xxxProps`**

- 命名模式：`titleClassName`、`descriptionClassName`、`footerClassName`、`contentClassName`
- `xxxProps` 允许但必须克制：仅当 slot 确有高频的非样式定制需求（典型如按钮 slot 的 `variant` / `disabled` / `loading`）才暴露，且类型必须收窄为该 slot 真实组件的 props（禁止 `Record<string, unknown>` 兜底）
- 默认不加：能用 `xxxClassName` 表达的、或只为 5% 场景服务的 `xxxProps` 一律不加——去用原语

**3. 命名对齐原语**

减少用户记忆成本。例如 shadcn 叫 `TabsList`，所以用 `listClassName`（✗ `tabBarClassName`）。

**4. 默认行为可以反转原语默认**

如 shadcn 原生 `CardFooter` 默认带 `border-t bg-muted/50`，但 Compose 层 80% 用户不想要分隔——所以默认关闭（`border-none bg-transparent`），靠 `dividers` prop 打开。让默认观感符合 **Compose 层** 的心智模型，而不是 **原语层** 的。

**5. 拒绝扩大 API 的诱惑**

永远禁止：

- ❌ `renderHeader` / `renderFooter` 这类 render prop
- ❌ `slots` 对象（MUI 风格）
- ❌ "在 A 和 B 中间插入自定义节点"的 prop
- ❌ 为了 5% 场景新增的任何 prop

遇到此类需求，答案永远是："**去用 `components/ui/*` 原语**"。

**6. 列表型组件用 `items: Item[]`**

Tabs、Breadcrumb 这种列表型组件用 `items` 数组是 80% 友好的。代价：每项结构必须同构。需要异构的用户走原语。

**7. props 命名一致性**

- 布尔型：`dividers`、`keepMounted`，允许 `boolean | { ... }` 的双形式（简单场景一个 bool 搞定）
- className 覆盖：统一 `xxxClassName` 后缀
- 内容 slot：`title`、`description`、`footer`、`action`、`content` 等语义命名，不要 `topSlot`、`bottomSlot`

### 参考实现

- `registry/ui/card.tsx`：嵌套 slot（title/description/action/content/footer）的扁平化
- `registry/ui/tabs.tsx`：列表型（`items` 数组）的扁平化
- `registry/ui/async-button.tsx`：行为增强型
- `registry/ui/modal/`：依赖外部包（command-modal）的扁平化

## Key Configuration

- **TypeScript**: 严格模式，路径别名 `@/*` 指向根目录
- **Linting**: Biomejs via ultracite，配置在 `biome.jsonc`
- **React Compiler**: 在 Next.js 中已启用
- **Coverage thresholds**: lines 90%, functions 90%, branches 85%, statements 90%

## Release Process

使用 Changesets 进行版本管理：

- 推送到 `main` 或 `next` 分支触发 CI
- `ci:publish` 发布所有包到 npm（public access）

## Code Style

- 禁止使用 `if (xx) return yy` ，必须使用 block 包裹，`if (xx) { return yy }`

## Agent skills

### Issue tracker

GitHub Issues，使用 `gh` CLI 管理。See `docs/agents/issue-tracker.md`.

### Triage labels

标准五角色标签：needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix。See `docs/agents/triage-labels.md`.

### Domain docs

Single-context 布局，`CONTEXT.md` + `docs/adr/` 在根目录。See `docs/agents/domain.md`.

## 禁止事项

### `components/ui/**` 严格只读

`components/ui/**` 下的所有文件**只能**通过 shadcn CLI 引入和更新：

```bash
pnpm dlx shadcn@latest add <component>
pnpm dlx shadcn@latest add <component> --overwrite   # 重新覆盖
```

引入之后，**任何形式**的改动都被禁止，包括但不限于：

- ❌ 直接编辑文件内容（改样式、改命名、改 props、加 className）
- ❌ 在该目录下新建任何文件（包括手写的 primitive）
- ❌ 删除已通过 shadcn add 添加的文件
- ❌ 在该目录下追加 wrapper / 工具函数 / hooks
- ❌ "只调一行样式"、"只补一个 data-attr"、"作者预留了 hook 所以可以接入" 等任何形式的合理化

**没有任何例外。** 即使是 plan 已经被批准、即使存在预留命名 hook、即使只是一个字符的修改，都不允许。规则的目的就是让 `components/ui/**` 成为可被随时 `shadcn add --overwrite` 重置的、与上游完全同步的目录。

### 所有自有代码都放 `registry/`

任何需要在原语之上做的工作——封装、组合、状态管理、数据 helpers、特殊样式——**只能**放在：

- `registry/ui/**`：Compose 组件
- `registry/hooks/**`：自定义 hooks
- `components/examples/**`：demo
- `content/docs/**`：文档

如果你想在 `components/ui/xxx.tsx` 上加一行样式，正确做法是：在 `registry/ui/` 下写一个 wrapper 接受 className，由用户传入。
