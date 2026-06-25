<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/logo-dark.svg">
    <img alt="easy/shadcn" src="./.github/logo-light.svg" width="96">
  </picture>
</p>

<h1 align="center">easy/shadcn</h1>

<p align="center"><em>更简单的 shadcn 使用方式。</em></p>

<p align="center">
  在 <a href="https://ui.shadcn.com">shadcn/ui</a> 之上手工封装的轻量层，把嵌套 children 换成<strong>扁平 props</strong>。
  <br/>
  80% 的 UI 一行搞定，剩下 20% 直接下沉到原语层。
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="https://easy-shadcn.vercel.app">官网</a> ·
  <a href="https://easy-shadcn.vercel.app/docs">文档</a> ·
  <a href="https://easy-shadcn.vercel.app/preview">预览</a>
</p>

---

## 快速开始

```sh
# 1. 一次性配置 registry
pnpm dlx shadcn@latest init

# 2. 按需安装任意组件
pnpm dlx shadcn@latest add @easy-shadcn/card
```

完整步骤（包括 namespace 别名和直链方式）见 [安装指南](https://easy-shadcn.vercel.app/docs/installation)。

## 组件清单

| 组件 | 折叠了什么 | 安装 |
|------|-----------|------|
| **Card** | `<CardHeader><CardTitle>…` 嵌套梯子 → 扁平 `title` / `description` / `action` / `footer` props | `@easy-shadcn/card` |
| **Tabs** | 完整的 `<TabsList>` + 一堆 trigger → 一个 `items={…}` 数组 | `@easy-shadcn/tabs` |
| **Async Button** | `onClick` 返回 Promise 的手动 `useState` loading 流程 | `@easy-shadcn/async-button` |
| **Modal** | 命令式 `alert` / `confirm` 助手 + 基于 shadcn Dialog 的组合式 Modal | `@easy-shadcn/modal` |
| **Calendar** | 原生月/年下拉 → 三视图按钮网格切换 | `@easy-shadcn/calendar` |
| **Date Picker** | 单选 / 多选 / 范围 / inline-input 多形态合一 | `@easy-shadcn/date-picker` |
| **Accordion** | 每行重复的 `<AccordionItem><AccordionTrigger>…<AccordionContent>…` 三件套 → 一个 `items={…}` 数组（`{ value, trigger, content }`） | `@easy-shadcn/accordion` |
| **Breadcrumb** | 手写嵌套的 `<BreadcrumbList>` / `<BreadcrumbItem>` / `<BreadcrumbLink>` / `<BreadcrumbSeparator>` → 一个 `items={…}` 数组 | `@easy-shadcn/breadcrumb` |
| **Tooltip** | `<TooltipProvider>` / `<Tooltip>` / `<TooltipTrigger>` / `<TooltipContent>` 四层嵌套 → 一个 `children` 触发元素 + 一个 `content` prop | `@easy-shadcn/tooltip` |
| **Radio Group** | 逐个手接的 `<RadioGroupItem>` 控件 + `<label>` / 描述结构 → 一个 `items={…}` 数组（`{ value, label, description }`） | `@easy-shadcn/radio-group` |

## 设计理念

easy-shadcn 是 shadcn/ui 的**组合层**，绝不是替代品。整个项目只有一条规则——80/20：

- **扁平 props，不要嵌套 children。** 一个 prop 对应一个 slot。用 `<Card title="…" footer={…}>body</Card>` 替代四层深的 `<CardHeader><CardTitle>…` 梯子。
- **每个组件都得自己挣进来。** 只有当它能把重复的 shadcn 写法折叠成一行你不假思索就敲得出的代码时，才被加入。复制粘贴三次以上是门槛。
- **拒绝 render props 和 slot 对象。** 需要剩下的 20%？直接下沉到 `components/ui/*` — 原语层的大门始终敞开。组合层永远不会再开第二道 API 口。
- **命名对齐原语。** shadcn 叫 `TabsList`，prop 就叫 `listClassName`——不发明新词汇，不增加记忆成本。
- **代码归你所有。** 通过 shadcn CLI 安装到你的项目，每个组件都活在你的仓库里，可以随手改、随时修。没有黑盒。

每条规则背后的推理见 [完整设计笔记](./AGENTS.md#component-design-philosophy)。

## 状态

🚧 easy-shadcn 仍在早期开发中。上面的组合层规则已经稳定，组件清单刻意地慢慢生长。

## License

MIT © Simon
