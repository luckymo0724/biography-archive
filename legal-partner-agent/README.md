# Legal Partner Agent

独立法务顾问 Agent 模块，定位为“律所合伙人级别的法务顾问”。本模块不依赖现有前端项目，可接入任意 Agent 平台、聊天机器人、工作流系统或自建 API。

## 定位

- 主线：中国大陆法律法规、监管政策、司法实践、行政执法与合规规范。
- 扩展：企业出海、跨境交易、跨境数据、制裁与出口管制、海外雇佣、知识产权、隐私合规、反贿赂与当地律师协同。
- 风格：合伙人级、审慎、结构化、可执行，避免未经核验的具体法条引用。
- 边界：可做法律研究、风险识别、合同审查、交易结构建议、争议策略和文书草稿；最终正式法律意见应由执业律师结合完整事实和最新法规核验。

## 文件结构

- `prompts/system-prompt.md`：核心系统提示词，可直接作为 Agent system prompt。
- `prompts/developer-instructions.md`：开发者/平台层约束，适合放在 developer prompt 或 agent 配置中。
- `config/agent.json`：结构化 Agent 配置，便于平台导入或二次开发。
- `templates/legal-memo.md`：法律备忘录输出模板。
- `templates/contract-review.md`：合同审查输出模板。
- `templates/outbound-compliance.md`：出海合规评估输出模板。
- `training-harness/`：业务合同基础审查训练 Harness，用于案例训练、Rubric 评分、复盘和记忆迭代。

## 训练 Harness

`training-harness/` 基于 Her-System 的身份层、用户层、记忆层和迭代日志搭建，适合训练基础业务合同审查能力。它包含：

- `her-base/`：训练搭档人格、学员画像、动态记忆、关系档案和迭代记录。
- `prompts/`：出题总控、学员审查、评分复盘提示词。
- `checklists/`：业务合同基础审查清单。
- `rubrics/`：100 分制评分 Rubric。
- `cases/`：训练案例与参考风险点。
- `templates/`：训练提交、评分报告、记忆更新和训练记录模板。

首轮可从 `training-harness/cases/001-service-agreement.md` 开始，按 `training-harness/README.md` 的“最小运行流程”执行。

## 建议接入方式

1. 将 `prompts/system-prompt.md` 作为系统提示词。
2. 将 `prompts/developer-instructions.md` 作为开发者约束或工具使用规范。
3. 用户输入中尽量提供：主体、交易背景、司法辖区、合同文本、业务流程、时间节点、目标结果。
4. 涉及最新法律法规、监管口径、司法解释、制裁名单、出口管制清单、海外当地法时，必须接入官方数据库或要求人工核验。

## 推荐模型能力

- 长上下文：用于合同、证据材料、政策文件和多轮事实澄清。
- 网络/数据库检索：用于核验最新法规、政策、监管公告和案例。
- 文件解析：用于处理 Word、PDF、Excel、邮件和尽调资料。
- 引用管理：对外输出时应标注来源、版本、发布日期或检索日期。

## 默认免责声明

本 Agent 输出仅供内部工作参考，不构成正式法律意见。涉及对外出具、签署、提交监管机关、诉讼仲裁、重大交易决策或境外法律判断时，应由具备相应执业资格的律师结合完整事实和最新规则进行复核。
