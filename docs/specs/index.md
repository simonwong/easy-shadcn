# 功能规格索引

每个规格文件是功能的「实现合同」：背景（WHY）、设计方案、关键决策、对外契约、验收标准。

> Spec 是 source of truth，code 服务于 spec（而不是反过来）。spec 是活文档，随实现迭代同步更新。

命名规范：`YYYY-MM-DD-主题.md`（日期为创建日期，主题用 kebab-case）

## 索引

| 更新日期 | 规格 | 说明 |
| --- | --- | --- |
| 2026-06-02 | [Select](./2026-06-02-select.md) | Compose Select 的模式、状态、clearable 与远程加载契约 |

---

## SDD 标准 Spec 格式

新增 spec 必须遵循以下结构。参考 GitHub Spec Kit / Kiro 等业界 SDD 工具的现代实践。

### 文件头

```markdown
# <主题简称>（<kebab-case-id>）

> Status: Draft / Approved / Implemented / Deprecated
> Owner: <负责人>
> Created: YYYY-MM-DD
> Related: 链接到相关 spec
```

### 章节模板

| # | 章节 | 必填 | 说明 |
|---|---|---|---|
| 1 | **Context** | ✅ | WHY—当前痛点、动机、为什么要做这件事 |
| 2 | **Goals & Non-Goals** | ✅ | 明确目标范围；**Non-Goals 必写**，防止 scope creep |
| 3 | **User Stories** | ✅ | `As a <角色>, I want to <动作>, so that <价值>` |
| 4 | **Functional Requirements (EARS)** | ✅ | `WHEN <trigger> THE SYSTEM SHALL <action>` |
| 5 | **Data Model** | 涉及 DB 时 | ER 图 + 字段定义 + 索引 + 约束理由 |
| 6 | **State Machine** | 有状态时 | 状态流图 + 派生状态计算公式 |
| 7 | **Key Algorithms** | 有非平凡算法时 | 关键算法的伪码 + 事务边界 |
| 8 | **API Contracts** | 有对外接口时 | Server functions / REST endpoints 输入输出契约表 |
| 9 | **Key Design Decisions (ADR)** | ✅ | 关键决策 + Why + 替代方案。**为什么这么设计**比"做了什么"更重要 |
| 10 | **Acceptance Criteria** | ✅ | `GIVEN ... WHEN ... THEN ...` 可测试标准 |
| 11 | **Out of Scope** | ✅ | 再次明确不做什么（防止后人误解） |
| 12 | **References** | ✅ | 实施 plan 链接、相关 spec、关键文件锚点 |

### EARS 格式（功能需求）

> EARS = Easy Approach to Requirements Syntax

```
WHEN <触发条件> THE SYSTEM SHALL <预期行为>
WHILE <持续条件> THE SYSTEM SHALL <持续行为>
IF <条件> THE SYSTEM SHALL <行为> ELSE <fallback>
```

每条需求是一个原子的、可测试的、对系统行为的明确约束。避免模糊措辞如"应该"、"可能"。

### ADR 格式（关键决策）

每个 ADR（Architecture Decision Record）按以下结构：

```markdown
### ADR-N: <一句话决策>

**Decision**: 具体做了什么。

**Why**: 为什么这么做，对比了哪些替代方案，权衡是什么。
```

ADR 是 spec 中最长寿的部分——实现细节会变，决策的"为什么"是后人接手时的指南针。

### Acceptance Criteria 格式

```
GIVEN <前置条件>
WHEN  <动作>
THEN  <可观察结果>
```

每条 AC 必须可被自动化测试覆盖。

---

## 写 Spec 的核心原则

1. **WHY 比 WHAT 重要**：架构图和字段定义会过时，"为什么这么做"几年后还有人需要
2. **Non-Goals 必写**：明确"不做什么"和"做什么"同等重要
3. **Lean 而非详尽**：spec 必须人能一次通读完。超过 500 行考虑拆分
4. **活文档**：实现中如有偏离 spec，必须回填 spec，保持 spec 与代码一致
5. **EARS / GIVEN-WHEN-THEN 格式化**：可测试、无歧义、机器可读
6. **明确 Out of Scope**：不做什么必须列出，防止 scope creep 和后人误解

## 何时写 Spec

| 改动规模 | 需要 spec？ | 需要 plan？ |
|---|---|---|
| 改 ≤3 个文件，无新 schema/API | ❌ | ❌ |
| 新 feature 或跨模块改动 | 可选 | ✅ |
| 新增 schema 表 / 新增 agent / 新对外接口 | ✅ | ✅ |
| 架构级重构 | ✅ | ✅ |

**流程**：spec → plan → 实现 → 回填 spec
