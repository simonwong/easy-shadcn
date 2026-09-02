<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/logo-dark.svg">
    <img alt="easy/shadcn" src="./.github/logo-light.svg" width="96">
  </picture>
</p>

<h1 align="center">easy/shadcn</h1>

<p align="center"><em>更简单的 shadcn 使用方式。</em></p>

<p align="center">
  在 <a href="https://ui.shadcn.com">shadcn/ui</a> 之上的扁平 props 封装：嵌套 children 折叠成一个标签，而数据驱动的组件——Table、Select、Combobox、Date Picker、Menu、Sidebar、Command Palette、Choice Group——在 shadcn 底座上提供 <strong>antd 级别的开箱 DX</strong>。
  <br/>
  通过 shadcn CLI 安装，代码落进你自己的仓库，原语始终只差一个 import。
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

每个封装都把嵌套梯子换成扁平 props。以 Card 为例，前后对比：

```tsx
// shadcn 原语 —— 嵌套 children
<Card>
  <CardHeader>
    <CardTitle>Team plan</CardTitle>
    <CardDescription>Billed monthly</CardDescription>
    <CardAction><Button size="sm">Upgrade</Button></CardAction>
  </CardHeader>
  <CardContent>Everything in Pro, plus SSO.</CardContent>
  <CardFooter>$30 / user / month</CardFooter>
</Card>

// easy-shadcn —— 一个标签，扁平 props
<Card
  title="Team plan"
  description="Billed monthly"
  action={<Button size="sm">Upgrade</Button>}
  footer="$30 / user / month"
>
  Everything in Pro, plus SSO.
</Card>
```

## 组件清单

八个数据驱动组件排在最前：**Table**、**Select**、**Combobox**、**Date Picker**、**Menu**、**Sidebar**、**Command Palette**、**Choice Group** 拥有真正的状态——选中 tally、异步竞态、快捷动作、嵌套导航、响应式 shell 状态、单选 / 多选 / 范围逻辑——同时仍以 copy-in 的 registry 源码分发。

| 组件 | 折叠了什么 | 安装 |
|------|-----------|------|
| **Table** | `columns` + `dataSource` + `rowKey` 取代手写的 `<thead>` / `<tbody>` 结构，内置 loading / 空态 / caption 状态和行选择（受控或非受控、半选全选、逐行控制） | `@easy-shadcn/table` |
| **Select** | 下拉、可搜索、多选 chips、异步 / 服务端过滤加载，统一在一个由 `items` / `loadItems` 驱动的组件里 | `@easy-shadcn/select` |
| **Combobox** | 始终可搜索的单选自动补全，Select 之上的预设 | `@easy-shadcn/combobox` |
| **Date Picker** | 单选 / 多选 / 范围统一在一个 `mode` prop 下，可选的输入框触发器，以及 min / max / 禁用日期边界 | `@easy-shadcn/date-picker` |
| **Menu** | 一个递归 item tree 提供持久导航，覆盖链接、动作、子菜单、分组、选中状态、展开状态和三种布局模式 | `@easy-shadcn/menu` |
| **Sidebar** | 一个有限 `items` tree 同时提供响应式应用导航、主内容、移动端 Sheet、折叠状态、选中状态和子菜单 | `@easy-shadcn/sidebar` |
| **Command Palette** | 静态动作 → Mod+K 可搜索 Dialog，内置分组投影、异步单飞、可重试错误与旧 Promise 隔离 | `@easy-shadcn/command-palette` |
| **Choice Group** | 一个 items/value API 覆盖单选或多选，并可呈现为 radio、checkbox 或 toggle | `@easy-shadcn/choice-group` |
| **Card** | `<CardHeader><CardTitle>…` 嵌套梯子 → 扁平 `title` / `description` / `action` / `footer` props | `@easy-shadcn/card` |
| **Empty** | Empty root / header / media / title / description / content 嵌套 → 固定原语顺序的扁平可选 slots | `@easy-shadcn/empty` |
| **Tabs** | 完整的 `<TabsList>` + 一堆 trigger → 一个 `items={…}` 数组（`{ value, trigger, content }`） | `@easy-shadcn/tabs` |
| **Accordion** | 每行重复的 `<AccordionItem><AccordionTrigger>…<AccordionContent>…` 三件套 → 一个 `items={…}` 数组（`{ value, trigger, content }`），单开或多开 | `@easy-shadcn/accordion` |
| **Breadcrumb** | 手写嵌套的 `<BreadcrumbList>` / `<BreadcrumbItem>` / `<BreadcrumbLink>` / `<BreadcrumbSeparator>` → 一个 `items={…}` 数组，自动识别当前页，`maxItems` 折叠省略号 | `@easy-shadcn/breadcrumb` |
| **Tooltip** | `<TooltipProvider>` / `<Tooltip>` / `<TooltipTrigger>` / `<TooltipContent>` 四层嵌套 → 一个 `children` 触发元素 + 一个 `content` prop | `@easy-shadcn/tooltip` |
| **Popover** | 点击 Popover 与 hover/focus 链接预览 → 一个 trigger + `title` / `description` / `content` / `footer` API | `@easy-shadcn/popover` |
| **Context Menu** | 右键 / 长按 trigger + 扁平 actions，坐标、焦点、键盘与关闭行为仍由原语负责 | `@easy-shadcn/context-menu` |
| **Radio Group** *（legacy）* | 软废弃兼容封装；新代码使用 Choice Group | `@easy-shadcn/radio-group` |
| **Checkbox Group** *（legacy）* | 软废弃兼容封装；新代码使用 Choice Group | `@easy-shadcn/checkbox-group` |
| **Field** | label、控件、描述、必填标记和校验信息 → 一个表单字段封装（接受 React Hook Form / Zod 的 error 数组） | `@easy-shadcn/field` |
| **Input Group** | InputGroup root / addon / input 嵌套 → 一个保留原生 input 契约、带逻辑 start / end addon slot 的扁平组件 | `@easy-shadcn/input-group` |
| **Input OTP** | 一个真实 OTP input → 自动生成的连续索引 slot，可选统一分组和分隔符 | `@easy-shadcn/input-otp` |
| **Avatar** | Avatar root / image / fallback / badge 嵌套 → 一个 fallback 必填、image / badge 可选的扁平组件 | `@easy-shadcn/avatar` |
| **Switch** | Switch 控件 + 显式 label / description 接线 → 一个保留原语状态、事件和原生表单行为的扁平组件 | `@easy-shadcn/switch` |
| **Pagination** | item 总数、客户端受控 / 非受控变更、真实路由链接和紧凑 boundary / sibling 窗口 → shadcn Pagination 原语之上的扁平组件 | `@easy-shadcn/pagination` |
| **Carousel** | 有序 slide 数据 → 具名 shadcn / Embla 轮播，保留原语负责的滚动、控制、插件和 API | `@easy-shadcn/carousel` |
| **Progress** | Progress label / value / track / indicator 组合 → 一个带标签、固定 0–100 语义并支持确定 / 不确定状态的百分比进度条 | `@easy-shadcn/progress` |
| **Toast** | 一个全局通知队列，提供命令式状态、同 ID 更新、关闭、action 与 Promise 生命周期助手 | `@easy-shadcn/toast` |
| **Slider** | 一个可见标签 API 覆盖标量或显式判别的多 thumb 值，含逐 thumb 名称与原生表单行为 | `@easy-shadcn/slider` |
| **Sheet** | 常规侧边面板的扁平 trigger / title / description / content / footer slot、原生 Dialog 生命周期与可滚动正文 | `@easy-shadcn/sheet` |
| **Async Button** | `onClick` 返回 Promise 的手动 `useState` loading 流程 | `@easy-shadcn/async-button` |
| **Alert** | `<AlertTitle>` / `<AlertDescription>` / `<AlertAction>` 嵌套 → 扁平 `icon` / `title` / `description` / `action` props | `@easy-shadcn/alert` |
| **Alert Dialog** | confirm / cancel 确认对话框，带 `title` / `description` slot、异步处理函数、destructive 变体，以及受控或非受控的开合状态 | `@easy-shadcn/alert-dialog` |
| **Modal** | 命令式 `alert` / `confirm` 助手 + 基于 shadcn Dialog 的组合式 Modal | `@easy-shadcn/modal` |
| **Calendar** | 原生月 / 年下拉 → 三视图（日 / 月 / 年）按钮网格切换 | `@easy-shadcn/calendar` |

### Hooks

| Hook | 做什么 | 安装 |
|------|--------|------|
| **useDelayLoading** | 给 loading 状态加一个最小可见时长，避免快操作时 spinner 一闪而过 | `@easy-shadcn/use-delay-loading` |
| **useSelectItems** | 把扁平的 `SelectItem[]` 转成 Select 类 UI 需要的查找函数和默认 `contains` 过滤 | `@easy-shadcn/use-select-items` |
| **useSelectLoader** | 异步选项加载器，支持一次性加载或服务端过滤两种模式，带 `AbortController`、防抖和已选项缓存 | `@easy-shadcn/use-select-loader` |

## 设计理念

easy-shadcn 是 shadcn/ui 的**组合层**——通过 CLI 安装，每个组件都以你自己拥有、可以随手改的普通源码落进你的仓库。三条规则让它保持诚实：

- **薄封装保持极小；状态机组件做深。** 像 Card、Tabs 这样的封装只为把重复的嵌套写法折叠成扁平 props——回退原语手写缺失场景只要十几行，所以 API 保持极小。Table、Select、Combobox、Date Picker、Menu、Sidebar、Command Palette、Choice Group 拥有真正状态或跨呈现适配，手写重来成本高，所以能力覆盖跟随其拥有的任务边界。
- **入门斜率永久冻结。** props 总数可以无上限地涨，但"跑通第一个用例必须理解的 props 数"永远不动。Table 永远是 `columns` + `dataSource` + `rowKey`，Select 永远是 `items` + `value` / `onValueChange`。新 prop 只有在"不用它的人完全无感知它存在"时才允许加入。
- **原语的大门始终敞开。** 没有 render props，没有 slot 对象，没有"在 A 和 B 之间插入节点"的逃生口。需要最后那一段灵活性？直接下沉到 `components/ui/*`——组合层永远不会为此再开第二道 API 口。

每条规则背后的推理见 [完整设计笔记](./AGENTS.md#component-design-philosophy) 和 [ADR-0004](./docs/adr/0004-props-vocabulary.md)。

## 状态

🚧 easy-shadcn 仍在早期开发中。上面的组合层规则已经稳定，组件清单在刻意地稳步生长。

## License

MIT © Simon
