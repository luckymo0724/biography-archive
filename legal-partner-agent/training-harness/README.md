# 业务合同基础审查训练 Harness

这是一套基于 Her-System 分层思想搭建的合同审查训练底座，用于训练、评估和迭代“业务合同基础审查”能力。

它不是一份单次合同审查提示词，而是一套可循环运行的训练系统：

1. **身份层**：定义训练搭档是谁、如何反馈、如何挑战学员。
2. **用户层**：记录学员的业务背景、常见误区和训练目标。
3. **记忆层**：沉淀跨轮次稳定偏好、错误模式和改进策略。
4. **案例层**：提供可复用的合同审查训练题。
5. **评分层**：按统一 Rubric 给出结构化评价。
6. **复盘层**：把本轮表现转化为下一轮训练重点。

## 适用范围

适合训练以下“基础业务合同审查”能力：

- 快速识别合同类型、交易结构、用户角色和签署目的。
- 发现主体、授权、付款、交付、验收、违约、责任上限、解除、争议解决等基础风险。
- 区分法律风险、商业风险、流程风险和需业务确认事项。
- 输出可执行的修改建议、谈判底线和签署前清单。
- 避免编造法条、过度法律化、遗漏业务目标或给出无法落地的建议。

不适合直接替代正式法律意见、重大交易尽调、跨境当地法意见、诉讼仲裁策略或监管专项意见。

## 目录结构

- `her-base/`：从 Her-System 改造而来的训练人格与记忆层。
- `prompts/`：训练调度、学员审查、评分评估的提示词。
- `checklists/`：业务合同基础审查清单。
- `rubrics/`：评分规则与扣分标准。
- `cases/`：训练案例、合同文本和参考要点。
- `templates/`：每轮训练输入、输出、评分、复盘模板。
- `runs/`：建议存放每次训练记录，默认留空。

## 最小运行流程

每轮训练按 5 步走：

1. 选择一个 `cases/` 下的案例。
2. 把 `prompts/harness-orchestrator.md` 作为总控提示词。
3. 把 `prompts/trainee-reviewer.md` 发给被训练模型或学员。
4. 用 `rubrics/basic-contract-review-rubric.md` 和 `prompts/evaluator.md` 评分。
5. 用 `templates/memory-update-proposal.md` 生成记忆更新建议，确认后写入 `her-base/MEMORY.md`。

## 推荐首轮指令

```text
请启动业务合同基础审查训练 Harness。

读取：
- her-base/SOUL.md
- her-base/USER.md
- her-base/MEMORY.md
- prompts/harness-orchestrator.md
- prompts/trainee-reviewer.md
- checklists/basic-business-contract-checklist.md
- rubrics/basic-contract-review-rubric.md
- cases/001-service-agreement.md

请先进入“训练出题模式”：只给我案例材料和作答要求，不要暴露参考答案。
等我提交审查结果后，再进入“评分复盘模式”。
```

## 三种运行模式

### 1. 训练出题模式

只展示案例事实、合同文本和作答要求。不得展示参考风险点、评分要点或标准答案。

### 2. 评分复盘模式

读取学员答案、案例参考要点和评分 Rubric，输出：

- 总分和等级。
- 强项。
- 漏洞。
- 可改写示例。
- 下一轮训练重点。
- 建议写入记忆的错误模式。

### 3. 迭代维护模式

当训练中反复出现新类型问题时，更新：

- `checklists/basic-business-contract-checklist.md`
- `rubrics/basic-contract-review-rubric.md`
- `her-base/MEMORY.md`
- `her-base/ITERATION_LOG.md`

## 法规核验入口

合同审查训练中的法律依据应以最新官方来源为准。中国大陆法律法规优先使用 [国家法律法规数据库](https://flk.npc.gov.cn/) 核验。训练案例中如出现具体法条编号、监管规则、司法解释或部门规章，评分前应再次核验版本。

## 输出边界

本 Harness 仅用于训练和内部工作辅助，不构成正式法律意见。对外签署、重大交易、争议处理、监管提交、跨境当地法或高风险合规事项，应由执业律师结合完整事实和最新规则复核。
