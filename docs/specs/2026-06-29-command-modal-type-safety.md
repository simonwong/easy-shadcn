# Command-Modal 类型安全与多 UI 库一等支持（command-modal-type-safety）

> Status: Draft
> Owner: Simon
> Created: 2026-06-29
> Related: [ADR-0001](../adr/0001-adapter-seam-and-typed-factory.md) · [ADR-0002](../adr/0002-resolve-type-on-create.md) · [CONTEXT.md](../../CONTEXT.md)

## 1. Context

`@easy-shadcn/command-modal`（本地 0.2.0）的 README 宣称两件事：**"Type-safe — Full TypeScript support"** 与 **"Works with any modal UI library through adapters"**。实测（已用 antd 实接验证）这两句都没兑现：

- **自定义 adapter 的类型链全程断裂**。`CommandModalConfig<TModalProps>` 有泛型，但 `TModalProps` 没有流过 Provider → Context → useModal，`useModal().modalProps` 被写死成 `ShadCNModalProps`。非 shadcn 用户每个消费点都要 `as unknown as`——作者自己的测试就在 cast（`test/config.test.tsx`）。
- **`show<T>(Comp)` 显式标注返回类型会编译报错**。`show` 重载①有两个无默认值的类型参数，显式只给一个 `<T>` 会落到 `modal: string` 的重载②，报"组件不是 string"。要么放弃标注、要么 `as Promise<T>`。
- **默认 adapter 吐了个 antd 概念 `afterClose`**，而本仓库 Dialog 用的是 Base UI（`@base-ui/react`，无 `afterClose`，真名是 `onOpenChangeComplete`）。照 README 把 `modal.modalProps` spread 到裸 `<Dialog>` 会**静默忽略 `afterClose` → `remove()` 永不触发 → reducer 条目与 HOC 实例残留泄漏**。
- **缺官方 antd adapter 与类型入口**。`context.tsx` 的 Provider JSDoc 甚至示范 `import { antdModalAdapter }`——一个根本不存在的导出。
- **死类型 `CommandModalArgs<T>`** 对任意 `React.FC` 塌缩成 `Record<string, unknown>`（作者注释已自认"type-checks nothing"），仍被 `show` 实现签名引用，误导。
- **README `[Full Documentation]` 是 `your-docs-url.com` 占位死链**，且最易踩坑的自定义 adapter / TypeScript 现状完全没写。

本 spec 把上述六项收敛成一次连贯的类型安全 + 多 UI 库一等支持的改造。

## 2. Goals & Non-Goals

### Goals

- G1：让**任意 BYO adapter** 的 `modalProps` 在消费端类型贯通，零 `as`。
- G2：让 **antd v6** 成为与 shadcn 对等的**一等公民**（官方 adapter + 类型入口），shadcn 仍是零配置默认。
- G3：让 `show()` 能**同时**类型安全地拿到 args 校验与 resolve 结果类型。
- G4：让默认 shadcn adapter 产出 **Base UI 真实 prop**，README 旗舰示例 `<Dialog {...modal.modalProps}>` 真能跑、不泄漏。
- G5：core 入口保持 **Zero dependencies**。
- G6：删除误导性死类型，补真实文档链接与 antd recipe。

### Non-Goals

- **NG1：不内置/维护 mui 及其它库的 adapter**。它们是"类型安全但 BYO"，仅文档给 recipe（见 ADR-0001）。
- **NG2：不把 `TModalProps` 泛型真正穿过 `Provider`/`Context`/`useModal`**。React context 在值层面擦除泛型，改用工厂在闭包边界捕获（见 ADR-0001）。
- **NG3：不在 `create` 之外提供"调用处覆盖 resolve 类型"的写法**（`show<R>(Comp)`）。TS 无部分类型推断，调用处标注会牺牲 args 校验（见 ADR-0002）。
- **NG4：不引入 antd 为运行时/类型硬依赖**。`AntdModalProps` 手写、零 import。
- **NG5：不升 1.0**。破坏性变更按 0.x semver 约定走 minor（0.2.0 → 0.3.0）。
- **NG6：不改动 `components/ui/**`**（只读，仅 shadcn CLI 维护）。

## 3. User Stories

1. As an antd 应用开发者, I want `useModal(MyModal).modalProps` 静态类型就是 antd 的 props, so that 我能直接 `<Modal {...modalProps}>` 而不写任何 `as`。
2. As an antd 应用开发者, I want 一个官方的 `antdModalProps` adapter, so that 我不必自己手写 `{ open, onCancel, afterClose }` 映射。
3. As an antd 应用开发者, I want 一行 `createCommandModal(antdModalProps)` 就拿到类型贯通的 `Provider` 和 `useModal`, so that 我按一次 opt-in 后体验与 shadcn 用户对等。
4. As an antd 应用开发者, I want 把 adapter 装配收敛到一个 app 本地 barrel 文件, so that 应用代码只从一个出口 import，不暴露包根。
5. As an antd 应用开发者, I want 一条 `no-restricted-imports` 规则禁止从包根 import `useModal`, so that 手滑 import 错的 `useModal`（shadcn 类型）会在 CI 报错而不是运行时静默错配。
6. As a shadcn 应用开发者, I want 零配置默认仍是 shadcn, so that 我什么都不配就拿到正确类型。
7. As a shadcn 应用开发者, I want `<Dialog {...modal.modalProps}>` 直接产出 Base UI 真实 prop, so that 关闭后 `remove()` 正常触发、不泄漏。
8. As a 模态框作者, I want 用 `create<Props, Result>` 声明这个 modal 收什么、还什么, so that `await show(MyModal, args)` 同时校验 args 并返回 `Promise<Result>`。
9. As a 模态框作者, I want `Result` 可选且默认 `unknown`, so that 不在乎返回值的 modal 一行都不用多写、行为与现在一致。
10. As a 调用方, I want `await show(ConfirmModal)` 在 `create<{}, boolean>` 下返回 `Promise<boolean>`, so that 确认框结果天然类型化、无需 cast。
11. As a 调用方, I want 传错 args（拼写错误的字段）时编译报错, so that 我在写代码时就发现问题。
12. As a BYO adapter 作者, I want `ModalPropsAdapter<TMine>` 与工厂配合后类型贯通, so that 即便我接的是冷门库也享受同等类型安全。
13. As a 库使用者, I want core 入口零依赖, so that 我只用 shadcn 时不会被 antd 类型或代码连累。
14. As a 库使用者, I want README 有可点击的真实文档链接, so that 我能找到 antd recipe 与 TypeScript 指南。
15. As a 库维护者, I want 工厂只返回 `{ Provider, useModal }`（adapter 真正改变的那两个）, so that 不产生 `show` 等函数的双 import 路径与漂移。
16. As a 库维护者, I want 根与工厂两套 `useModal` 重载走单源类型, so that 二者不会 copy-paste 后漂移。
17. As a 库维护者, I want 每个 adapter 只吐自己库的真实 prop 名, so that 类型不再交叉污染（shadcn 不再借 antd 的 `afterClose`）。
18. As a 库维护者, I want 删掉死类型 `CommandModalArgs` 与不存在的 `antdModalAdapter` JSDoc, so that 公共表面不再误导。
19. As a 文档读者, I want docs 站有 antd recipe、自定义 adapter 指南、resolve 类型说明, so that 我照着就能接任意库。
20. As a 模态框作者, I want `modal.resolve(value)` 在 `create<P,R>` 下被类型为 `(value: R)`（对外契约层面）, so that 调用方拿到的结果类型与我声明的一致。
21. As a CI/构建, I want `/antd` 子路径在 `node` 与 `bundler` 解析下都能 resolve 类型, so that 不出现"运行时能 import、类型却找不到"。

## 4. Functional Requirements (EARS)

- FR1：WHEN 调用 `createCommandModal(adapter)` THE SYSTEM SHALL 返回 `{ Provider, useModal }`，其中 `Provider` 已绑定 `config={{ modalPropsAdapter: adapter }}`。
- FR2：WHEN 在工厂 `Provider` 子树内调用工厂 `useModal(C)` THE SYSTEM SHALL 使 `modalProps` 的静态类型为该 adapter 的返回类型 `TModalProps`。
- FR3：THE SYSTEM SHALL 使工厂 `useModal` 在运行时与 base `useModal` 行为完全一致（类型换肤），不得二次调用 adapter、不得破坏 base 的 memo 稳定性。
- FR4：WHEN 未提供 config THE SYSTEM SHALL 使包根 `useModal` 的 `modalProps` 保持 `ShadCNModalProps`（shadcn 为零配置默认）。
- FR5：THE SYSTEM SHALL 从 `@easy-shadcn/command-modal/antd` 导出 `antdModalProps`（类型 `ModalPropsAdapter<AntdModalProps>`），且其实现不 import `antd`。
- FR6：`antdModalProps(handler)` SHALL 返回 `{ open: handler.visible, onCancel: () => handler.hide(), afterClose: () => { handler.resolveHide(); IF !handler.keepMounted THEN handler.remove() } }`。
- FR7：`createModalProps(handler)`（shadcn）SHALL 返回 `{ open, onOpenChange, onOpenChangeComplete }`；其中 `onOpenChangeComplete(open)` IF `open === false` THEN 调用 `handler.resolveHide()` 并 IF `!handler.keepMounted` THEN `handler.remove()`。
- FR8：THE SYSTEM SHALL NOT 再让 `createModalProps` / `ShadCNModalProps` 产出或声明 `afterClose`。
- FR9：WHEN 以 `create<Props, Result>(Comp)` 创建组件并 `show(Comp, args)` THE SYSTEM SHALL 推断 `args` 为 `Partial<Props>` 并返回 `Promise<Result>`，无需任何显式类型实参。
- FR10：WHEN 省略 `Result`（`create<Props>` 或 `create(Comp)`）THE SYSTEM SHALL 令 `Result` 默认为 `unknown`，`show(Comp)` 返回 `Promise<unknown>`，行为与现状一致。
- FR11：WHEN 以字符串 id 调用 `show<T>(id, args)` THE SYSTEM SHALL 返回 `Promise<T>`（字符串 id 不携带组件，沿用显式 `T`）。
- FR12：THE SYSTEM SHALL 删除 `CommandModalArgs` 类型，并将其在内部签名处的引用替换为 `Record<string, unknown>`。
- FR13：THE SYSTEM SHALL 移除 `context.tsx` 中引用不存在的 `antdModalAdapter` 的 JSDoc，替换为真实 API 示例。
- FR14：THE SYSTEM SHALL 将包 README 的 `Full Documentation` 链接改为 `https://easy-shadcn.vercel.app/docs/packages/command-modal`。
- FR15：THE SYSTEM SHALL 更新 registry `Modal` wrapper 以消费 `onOpenChangeComplete`（而非自家 `afterClose` 桥接），使 `<Modal {...modalProps}>` 仍正常 remove。

## 5. Data Model

不涉及持久化。运行时状态仍是 reducer `CommandModalStore`（`{ [modalId]: { id, args, visible, delayVisible, keepMounted } }`），本 spec 不改其形状。

## 6. State Machine（与 adapter 关闭路径相关）

一个 modal 实例的关闭生命周期（adapter 负责把 UI 库事件接到这条链）：

```
visible:true ──UI 用户关闭（ESC/遮罩/取消按钮）──▶ hide()  → visible:false（开始退出动画）
                                                            │
        退出动画结束（shadcn: onOpenChangeComplete(false)；antd: afterClose）
                                                            ▼
                                       resolveHide() ；若 !keepMounted 则 remove()
                                                            │
                                  remove() 删 reducer 条目 → placeholder 卸载 HOC
```

**关键不变量**：`remove()` 由"退出动画完成"事件驱动，必须经由各 UI 库的真实完成钩子（shadcn=`onOpenChangeComplete`，antd=`afterClose`）。若 adapter 吐的钩子名 UI 库不认识，这条链断裂即泄漏（即旧 P1-1）。

## 7. Type Design（关键类型机制）

### 7.1 工厂类型换肤

工厂的 `useModal` 是 base `useModal` 的**同一个函数引用**，仅收窄返回类型：

```ts
type UseModalReturn<TModalProps> = {
  (modal?: string, args?: Record<string, unknown>):
    CommandModalHandler & { modalProps: TModalProps }
  <C extends CreateModalComponent<any, any>>(modal: C, args?: Partial<ModalInnerProps<C>>):
    Omit<CommandModalHandler<any, ResolveType<C>>, "show">
      & { show: (args?: Partial<ModalInnerProps<C>>) => Promise<ResolveType<C>> }
      & { modalProps: TModalProps }
}
// 库内一次受控断言，把"每个调用点的 cast"吸收到此一处
const useModal = baseUseModal as unknown as UseModalReturn<TModalProps>
```

根 `useModal` 用 `UseModalReturn<ShadCNModalProps>`，工厂用 `UseModalReturn<TModalProps>`——**单源**，禁止 copy-paste 两套重载。

### 7.2 resolve 结果类型挂在 create

`Result` 写在定义处（`create`），不写在调用处（`show`），以释放调用处的推断名额，使 args 与 result 共存（ADR-0002）：

```ts
type CreateModalComponent<T = object, R = unknown> =
  React.FC<Partial<T> & CommandModalHocProps> & { readonly __resolveType?: R } // phantom brand
type ResolveType<C> = C extends { __resolveType?: infer R } ? R : unknown

create<P extends object, R = unknown>(Comp): CreateModalComponent<P, R>
show<C extends CreateModalComponent<any, any>>(modal: C, args?: Partial<ModalInnerProps<C>>): Promise<ResolveType<C>>
show<T = unknown>(modal: string, args?: Record<string, unknown>): Promise<T>
```

> 上述类型片段编码的是决策（非可运行实现）：phantom brand `__resolveType` 仅存在于类型层，运行时无此字段。

## 8. API Contracts（对外公共表面）

| 导出 | 入口 | 形状/契约 | 备注 |
|---|---|---|---|
| `createCommandModal(adapter)` | 包根 | `→ { Provider, useModal }` | MIN 返回；类型换肤 |
| `antdModalProps` | `/antd` 子路径 | `ModalPropsAdapter<AntdModalProps>` | 手写零依赖 |
| `AntdModalProps` (type) | `/antd` 子路径 | `{ open?; onCancel?; afterClose? }` | 不 import antd |
| `createModalProps` | 包根 | `→ ShadCNModalProps` | 改吐 `onOpenChangeComplete` |
| `ShadCNModalProps` (type) | 包根 | `{ open?; onOpenChange?; onOpenChangeComplete? }` | **破坏性**：移除 `afterClose` |
| `create<P, R>(Comp)` | 包根 | `→ CreateModalComponent<P, R>` | `R` 默认 `unknown`，additive |
| `show(Comp, args)` / `show<T>(id, args)` | 包根 | `→ Promise<ResolveType<C>>` / `Promise<T>` | 组件路径零类型实参 |
| ~~`CommandModalArgs`~~ | — | **删除** | 内部专用，零公开导出 |

**app 本地 barrel（antd 用户的唯一出口，文档示范）**：
```ts
// src/lib/modal.ts
import { createCommandModal, show, hide, remove, create } from '@easy-shadcn/command-modal'
import { antdModalProps } from '@easy-shadcn/command-modal/antd'
export const { Provider, useModal } = createCommandModal(antdModalProps)
export { show, hide, remove, create }
```

## 9. Key Design Decisions (ADR)

完整记录见 [ADR-0001](../adr/0001-adapter-seam-and-typed-factory.md) 与 [ADR-0002](../adr/0002-resolve-type-on-create.md)。摘要：

### ADR-1: 工厂而非穿透泛型实现 adapter 类型贯通

**Decision**：`createCommandModal(adapter)` 在闭包边界捕获 `TModalProps`，返回类型贯通的 `{ Provider, useModal }`。

**Why**：React context 在值层面擦除泛型，`useContext` 无法把 per-Provider 的 `TModalProps` 带回 `useModal()` 返回类型。穿透泛型做不到，逐调用点 `useModal<T>()` 又到处重复易漏。工厂捕获一次即可。备选"穿透泛型"被否。

### ADR-2: 每个 adapter 吐自己库的真实 prop 名

**Decision**：shadcn=`onOpenChangeComplete`（Base UI 真名，已对 `@base-ui/react@1.4.0` 验证），antd=`afterClose`（antd 真名）。`ShadCNModalProps` 破坏性移除 `afterClose`。

**Why**：旧"shadcn" adapter 借了 antd 概念 `afterClose`，Base UI 不认识，裸 `<Dialog>` 泄漏。让每个 adapter 吐真名是 antd 一等公民后唯一自洽的不变量，并修好 README 旗舰示例。破坏面仅 registry wrapper + 测试（自有），库外裸 Dialog 用户本就泄漏、此改是修好。

### ADR-3: resolve 结果类型挂 create 而非 show 调用处

**Decision**：`create<Props, Result>` 携带 `R`（默认 `unknown`），`show(Comp)` 零类型实参同时推出 args 与 `Promise<R>`。

**Why**：TS 无部分类型推断；调用处 `show<R>(Comp)` 会占掉推断名额、牺牲 args 校验（args xor result）。定义处声明 `R` 释放该名额，args 与 result 共存。

### ADR-4: antd 类型手写零依赖 + `/antd` 子路径

**Decision**：`AntdModalProps` 手写 `{ open?, onCancel?, afterClose? }`，置于 `/antd` 子路径导出。

**Why**：adapter 只产出这 3 个 prop（其余 antd props 从 JSX 现场给），手写即够且与 antd v5→v6 稳定 prop 对齐，低漂移。保住 core "Zero dependencies"；子路径隔离命名并为"未来若需精确对齐 antd 真实 ModalProps"留对冲。

### ADR-5: 工厂只返回 `{ Provider, useModal }`（MIN）

**Decision**：不把 `show/hide/remove/create` 等打包进工厂返回。

**Why**：这些函数签名与 adapter 无关，打包进去会产生双 import 路径与漂移，且暗示它们 adapter-aware（虚假作用域）。其 DX 红利由用户的 app 本地 barrel 完全回收。

## 10. Acceptance Criteria

- AC1：GIVEN `const { useModal } = createCommandModal(antdModalProps)` WHEN 在其 Provider 内 `useModal(MyModal)` THEN `modalProps` 类型为 `AntdModalProps` 且无需任何 `as`。
- AC2：GIVEN 工厂 Provider 已挂载 WHEN 触发 modal 显示 THEN 运行时 `modalProps` 由 antd adapter 产出（`onCancel`/`afterClose` 存在），且 base `useModal` 仅被调用一次（无双跑 adapter）。
- AC3：GIVEN shadcn 默认 adapter WHEN `<Dialog {...modal.modalProps}>` 关闭并完成退出动画 THEN `onOpenChangeComplete(false)` 触发 `resolveHide()`，且 `keepMounted=false` 时触发 `remove()`，reducer 条目被清除。
- AC4：GIVEN `const M = create<{ userId: string }, User>(Inner)` WHEN `const u = await show(M, { userId: 'x' })` THEN `u` 类型为 `User` 且 `{ userId }` 被类型校验（拼错字段编译报错）。
- AC5：GIVEN `const C = create<{}, boolean>(Inner)` WHEN `await show(C)` THEN 返回类型为 `Promise<boolean>`。
- AC6：GIVEN `create<Props>(Inner)`（省略 Result）WHEN `show(Comp, args)` THEN 返回 `Promise<unknown>` 且 args 仍被校验（与现状一致）。
- AC7：GIVEN 包根 `useModal` WHEN 不配置 adapter THEN `modalProps` 类型仍为 `ShadCNModalProps`。
- AC8：GIVEN `import { antdModalProps } from '@easy-shadcn/command-modal/antd'` WHEN 在 `node` 与 `bundler` 两种 `moduleResolution` 下类型检查 THEN 均能 resolve，无类型错误。
- AC9：GIVEN 代码库 WHEN grep `afterClose` 于 shadcn 路径（`createModalProps`/`ShadCNModalProps`）THEN 无命中。
- AC10：GIVEN 代码库 WHEN grep `CommandModalArgs` THEN 无命中（已删除）。
- AC11：GIVEN 包 README WHEN 检查 `Full Documentation` 链接 THEN 指向真实 docs URL，无 `your-docs-url.com`。

## 10.1 Testing Strategy

**好测试的标准**：只断言外部可观察行为（adapter 产出的 props、调用 handler 动词的副作用、`show` 的返回类型/settle 值），不耦合内部实现细节（reducer action 名、内部 ref）。

| 模块 | 测什么 | 类型 | 现成范式 |
|---|---|---|---|
| M1 `antdModalProps` | 给定 handler，断言返回 `{ open, onCancel, afterClose }` 形状；调用各回调触发 `hide`/`resolveHide`/`remove` | 运行时 | `test/modalProps.test.tsx` |
| M1 `createModalProps`(shadcn) | 断言返回 `{ open, onOpenChange, onOpenChangeComplete }`；`onOpenChangeComplete(false)` 触发 `resolveHide`+`remove`（防泄漏回归） | 运行时 | 同上 |
| M2 工厂 | Provider 注入 adapter；其内 `useModal` 运行时产出 adapter 形状 `modalProps`；base `useModal` 不被二次包裹 | 运行时 | `test/config.test.tsx` |
| M3 类型 | `show(create<P,R>(C))→Promise<R>` 且 args 校验；工厂 `useModal(C).modalProps:TModalProps`；根 `useModal` 仍 `ShadCNModalProps`；`show<T>(string)→Promise<T>` | 类型断言（`expectTypeOf`，零新依赖） | 新增 `test/types.test-d.ts` 类范式 |
| M5 registry Modal | `<Modal {...modalProps}>` 关闭后仍触发 remove | 运行时 | `registry/ui/modal/modal.test.tsx` |
| M4 `/antd` 子路径 | 冒烟：能 import `antdModalProps` 且类型 resolve | 构建/冒烟 | — |

M6 文档不测。覆盖率门槛维持 lines 90 / functions 90 / branches 85 / statements 90。

## 11. Out of Scope

- 内置 mui 或其它库 adapter（NG1）。
- 把泛型真正穿过 Provider/Context/useModal（NG2）。
- 调用处覆盖 resolve 类型 `show<R>(Comp)`（NG3）。
- antd 作为运行时/类型硬依赖（NG4）。
- 1.0 / 多 Provider 路由语义变更（沿用现状）。
- 改动 `components/ui/**`（只读）。
- 修改 reducer / `CommandModalStore` 形状。

## 12. References

- ADR：[0001 adapter 接缝 + 工厂](../adr/0001-adapter-seam-and-typed-factory.md)、[0002 resolve 类型挂 create](../adr/0002-resolve-type-on-create.md)
- 词汇表与关键决策：[CONTEXT.md](../../CONTEXT.md)
- 关键文件锚点：`packages/command-modal/src/{useModal.tsx,actions.tsx,context.tsx,type.ts,index.ts}`、`registry/ui/modal/modal.tsx`、`components/ui/dialog.tsx`
- 外部契约：`@base-ui/react@1.4.0` `DialogRoot.Props`（`onOpenChangeComplete: (open: boolean) => void`）；antd v6 Modal（`open` / `onCancel` / `afterClose`）
- 文档落点：包 `README.md`、`content/docs/packages/command-modal.mdx`
