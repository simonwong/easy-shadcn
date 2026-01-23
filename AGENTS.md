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
pnpm lint                   # 使用 ultracite (Biomejs) 检查代码
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
