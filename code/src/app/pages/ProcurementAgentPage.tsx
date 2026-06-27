import {
  BadgeCheck,
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Copy,
  Cpu,
  Download,
  Factory,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FileUp,
  Handshake,
  Lightbulb,
  Music2,
  Power,
  Presentation,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  Target,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type AgentMode = "intake" | "supplier" | "rfq" | "quote" | "negotiation" | "risk" | "approval" | "office";

type Message = {
  id: number;
  role: "user" | "agent";
  text: string;
};

type UploadedFile = {
  id: number;
  name: string;
  size: number;
  type: string;
  content: string;
};

type AgentResult = {
  summary?: unknown;
  status?: unknown;
  plan?: string[];
  risks?: string[];
  confirmations?: string[];
  deliverable?: unknown;
  nextAction?: unknown;
};

const conversationStorageKey = "rock-personal-assistant-session-v2";
type DownloadFormat = "word" | "excel" | "txt" | "md" | "json";

const modeConfig: Record<
  AgentMode,
  {
    label: string;
    title: string;
    placeholder: string;
    templatePrompt: string;
    focus: string[];
    icon: typeof Cpu;
  }
> = {
  intake: {
    label: "需求准入",
    title: "Purchase Request Intake Agent",
    placeholder: "输入采购需求，例如：域控制器散热件，年用量 12 万套，SOP 2026-09，目标价 18 元",
    templatePrompt: "请检查以下采购需求是否完整，只指出缺失信息和是否可以进入下一步：\n物料/服务：\n年用量：\nSOP/交付时间：\n目标价/预算：\n附件说明：",
    focus: ["识别物料、数量、SOP、质量等级", "检查图纸/BOM/规格是否齐套", "输出采购需求澄清清单"],
    icon: FileCheck2,
  },
  supplier: {
    label: "供应商地图",
    title: "Supplier 360 & Sourcing Agent",
    placeholder: "输入供应商或物料族，例如：为车规级高速连接器建立国内/海外供应商长名单",
    templatePrompt: "请基于以下物料族生成供应商长名单筛选参考，只输出供应商筛选维度和准入问题：\n物料族：\n区域偏好：\n车规要求：\n已知供应商：",
    focus: ["供应商长名单与短名单", "准入资质、产能、车规经验", "单供/双供策略和替代供应"],
    icon: Factory,
  },
  rfq: {
    label: "RFQ 中心",
    title: "RFQ Package & Clarification Agent",
    placeholder: "上传 BOM、图纸或 SOW，例如：摄像头模组 RFQ 包，需生成报价模板和供应商澄清问题",
    templatePrompt: "请根据以下信息生成 RFQ 澄清问题和报价模板字段：\n物料/BOM：\n供应商范围：\n报价截止时间：\n需要的输出格式：",
    focus: ["BOM/RFQ 文件包生成", "报价口径和商务条款统一", "供应商澄清问题闭环"],
    icon: FileSpreadsheet,
  },
  quote: {
    label: "报价/成本",
    title: "Quote Compare & Should-Cost Agent",
    placeholder: "输入成本目标，例如：毫米波雷达支架当前报价 38 元，目标降本 12%，帮我拆成本和议价策略",
    templatePrompt: "请分析以下报价是否合理，只输出成本拆解要点和需要追问供应商的问题：\n当前报价：\n目标价：\n年用量：\n材料/工艺：",
    focus: ["报价横向对比和异常检测", "材料、制程、良率成本拆解", "目标价、阶梯价和降本机会"],
    icon: BarChart3,
  },
  negotiation: {
    label: "谈判策略",
    title: "Negotiation Playbook Agent",
    placeholder: "输入谈判目标，例如：供应商 A 报价高 9%，但交期最好，帮我制定谈判策略和让步边界",
    templatePrompt: "请基于以下背景生成谈判话术和让步边界：\n供应商：\n当前报价/交期：\n目标：\n可交换条件：",
    focus: ["谈判目标和 BATNA", "让步边界与交换条件", "供应商沟通话术和会议纪要"],
    icon: Handshake,
  },
  risk: {
    label: "供应风险",
    title: "Supply Risk Monitor Agent",
    placeholder: "输入风险场景，例如：主供应商交期延迟 6 周，量产 SOP 在 9 月，帮我做升级预案",
    templatePrompt: "请评估以下供应风险，只输出风险等级、影响和应对动作：\n风险事件：\n影响项目：\nSOP/交付节点：\n可用替代方案：",
    focus: ["交付、质量、合规风险评级", "双供、备料、替代料预案", "升级机制和行动责任人"],
    icon: ShieldAlert,
  },
  approval: {
    label: "定点审批",
    title: "Sourcing Award & Approval Agent",
    placeholder: "输入定点场景，例如：对比 A/B/C 三家供应商，生成推荐定点方案和审批备忘录",
    templatePrompt: "请生成定点审批材料草稿，要求只输出审批需要的信息：\n候选供应商：\n报价对比：\n质量/交付结论：\n推荐理由：",
    focus: ["推荐供应商和依据", "成本、质量、交付、风险结论", "审批材料和决策事项"],
    icon: CalendarClock,
  },
  office: {
    label: "办公模板",
    title: "Office Template Auto-Updater",
    placeholder: "输入模板更新需求，例如：把域控 RFQ 进展自动更新成采购周会 PPT、报价对比 Excel 和审批备忘录",
    templatePrompt: "请生成我指定格式的办公模板内容：\n文件类型（Word/Excel/TXT/PPT）：\n模板名称：\n必须包含字段：\n不需要包含的内容：",
    focus: ["PPT 汇报页结构更新", "Excel/RFQ 表格字段更新", "Word 审批材料和供应商问题单"],
    icon: Presentation,
  },
};

const starters = [
  "先阅读附件，告诉我你理解了什么、还缺什么",
  "只保留和当前问题相关的内容",
  "把上一版结果改成管理层汇报口径",
  "继续细化 Word 审批备忘录",
  "生成 Excel 可下载清单的字段和表头",
  "把风险矩阵补充得更具体",
  "根据我的反馈重写交付物",
  "输出最终版 Word、Excel、TXT 下载包",
];

const defaultMemories = [
  "角色：ROCK Personal Assistant，无人驾驶采购工程师的连续对话式智能助理",
  "行业：车规级硬件、传感器、域控、线控底盘、试制与量产采购",
  "交互偏好：只回答当前任务需要的内容，按任务指定格式生成附件",
];

const procurementMetrics = [
  { label: "待澄清需求", value: "12", icon: FileCheck2 },
  { label: "活跃 RFQ", value: "18", icon: FileSpreadsheet },
  { label: "准入供应商", value: "42", icon: BadgeCheck },
  { label: "风险预警", value: "7", icon: ShieldAlert },
];

const officeTemplates = [
  {
    type: "PPT",
    name: "采购周会汇报",
    icon: Presentation,
    fields: ["项目概览", "RFQ 进度", "风险升级", "决策事项"],
  },
  {
    type: "XLSX",
    name: "RFQ 报价对比",
    icon: FileSpreadsheet,
    fields: ["供应商", "单价/阶梯价", "NRE", "交期", "质量条款"],
  },
  {
    type: "DOCX",
    name: "定点审批备忘录",
    icon: FileText,
    fields: ["推荐供应商", "成本依据", "技术/质量风险", "审批意见"],
  },
];

const workflowStats = [
  "你直接输入目标，附件可传可不传",
  "只回答当前任务需要的内容",
  "需要文件时按指定格式下载",
  "继续追问时沿用上下文",
];

function getStatusLabel(status: string) {
  if (status === "RUNNING") return "正在思考";
  if (status === "WAITING_CONFIRMATION") return "等待确认";
  if (status === "COMPLETED") return "已生成";
  return "等待输入";
}

function getInitialMessages(): Message[] {
  const welcome = {
    id: 1,
    role: "agent" as const,
    text: "我是 ROCK Personal Assistant。你不用先选功能，直接把目标、附件或半成品发给我就行。我只回答当前任务需要的内容；如果你指定 Word、Excel、TXT 等格式，我只提供对应下载文件。生成后你可以继续说“改成管理层口径”“补风险矩阵”“重写 Word 版”，我会沿着对话继续迭代。",
  };
  try {
    const cached = window.localStorage.getItem(conversationStorageKey);
    if (!cached) return [welcome];
    const parsed = JSON.parse(cached) as { messages?: Message[] };
    return parsed.messages?.length ? parsed.messages : [welcome];
  } catch {
    return [welcome];
  }
}

function getInitialResult(): AgentResult | null {
  try {
    const cached = window.localStorage.getItem(conversationStorageKey);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as { activeResult?: AgentResult };
    return parsed.activeResult ?? null;
  } catch {
    return null;
  }
}

function getInitialDownloads(): DownloadFormat[] {
  try {
    const cached = window.localStorage.getItem(conversationStorageKey);
    if (!cached) return [];
    const parsed = JSON.parse(cached) as { downloadFormats?: DownloadFormat[] };
    return parsed.downloadFormats ?? [];
  } catch {
    return [];
  }
}

function getInitialLastTask() {
  try {
    const cached = window.localStorage.getItem(conversationStorageKey);
    if (!cached) return "";
    const parsed = JSON.parse(cached) as { lastTask?: string };
    return parsed.lastTask ?? "";
  } catch {
    return "";
  }
}

function createConversationContext(messages: Message[], activeResult: AgentResult | null) {
  const recent = messages
    .slice(-8)
    .map((message) => `${message.role === "user" ? "用户" : "助理"}：${message.text}`)
    .join("\n\n");
  const previous = activeResult ? `上一版交付结果：\n${formatAgentResult(activeResult)}` : "";
  return [recent ? `最近对话：\n${recent}` : "", previous].filter(Boolean).join("\n\n");
}

function normalizeResult(result: AgentResult): AgentResult {
  return {
    ...result,
    summary: toDisplayText(result.summary),
    status: toDisplayText(result.status),
    plan: toTextList(result.plan),
    risks: toTextList(result.risks),
    confirmations: toTextList(result.confirmations),
    deliverable: toDisplayText(result.deliverable),
    nextAction: toDisplayText(result.nextAction),
  };
}

function detectDownloadFormats(task: string, result?: AgentResult | null): DownloadFormat[] {
  const text = `${task}\n${result ? formatAgentResult(result) : ""}`.toLowerCase();
  const formats: DownloadFormat[] = [];
  if (/word|docx|doc|\.doc|\.docx|申请单|审批单|备忘录/.test(text)) formats.push("word");
  if (/excel|xlsx|xls|\.xls|\.xlsx|表格|清单|报价表/.test(text)) formats.push("excel");
  if (/txt|文本|纪要|纯文本/.test(text)) formats.push("txt");
  if (/markdown|md|\.md/.test(text)) formats.push("md");
  if (/json|结构化数据/.test(text)) formats.push("json");
  return Array.from(new Set(formats));
}

function shouldShowStageBox(task: string, result: AgentResult | null) {
  if (!result) return false;
  return /阶段|分步|计划|工作包|流程|里程碑/.test(task) || Boolean(result.plan?.length || result.risks?.length);
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function createAttachmentSummary(files: UploadedFile[]) {
  if (!files.length) return "";
  return files
    .map((file, index) => {
      const preview = file.content.trim().slice(0, 1600) || "该文件无法直接读取文本内容，请根据文件名和用户指令输出处理框架。";
      return `附件 ${index + 1}：${file.name}（${formatFileSize(file.size)}，${file.type || "unknown"}）\n内容预览：\n${preview}`;
    })
    .join("\n\n");
}

function extractMemory(input: string, mode: AgentMode) {
  const text = input.trim();
  if (!text) return "";
  const prefix =
    mode === "intake"
      ? "需求准入"
      : mode === "supplier"
        ? "供应商地图"
      : mode === "rfq"
        ? "RFQ 任务"
        : mode === "quote"
          ? "报价成本"
          : mode === "negotiation"
            ? "谈判策略"
          : mode === "risk"
            ? "供应风险"
            : mode === "approval"
              ? "定点审批"
              : "模板更新";
  return `${prefix}：${text.slice(0, 42)}${text.length > 42 ? "..." : ""}`;
}

function formatAgentResult(result: AgentResult) {
  const plan = toTextList(result.plan);
  const risks = toTextList(result.risks);
  const confirmations = toTextList(result.confirmations);
  const lines = [
    result.summary ? `${toDisplayText(result.summary)}` : "",
    plan.length ? ["执行计划：", ...plan.map((item, index) => `${index + 1}. ${item}`)].join("\n") : "",
    risks.length ? ["风险识别：", ...risks.map((item, index) => `${index + 1}. ${item}`)].join("\n") : "",
    confirmations.length
      ? ["需确认事项：", ...confirmations.map((item, index) => `${index + 1}. ${item}`)].join("\n")
      : "",
    result.deliverable ? `${toDisplayText(result.deliverable)}` : "",
    result.nextAction ? `下一步：${toDisplayText(result.nextAction)}` : "",
  ].filter(Boolean);

  return lines.join("\n\n");
}

function toTextList(value: unknown) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => stringifyListItem(item)).filter(Boolean);
  if (typeof value === "object") return Object.values(value).map((item) => stringifyListItem(item)).filter(Boolean);
  return String(value)
    .split(/\n|；|;/)
    .map((item) => item.replace(/^\d+[.、]\s*/, "").trim())
    .filter(Boolean);
}

function stringifyListItem(value: unknown) {
  if (!value) return "";
  if (typeof value !== "object") return String(value);
  const item = value as Record<string, unknown>;
  const primary =
    item.description ?? item.risk ?? item.confirmation ?? item.action ?? item.step ?? item.name ?? item.title;
  const secondary = item.mitigation ?? item.deliverable;
  return [primary, secondary].filter(Boolean).map(String).join("；");
}

function toDisplayText(value: unknown): string {
  if (value == null) return "";
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) return value.map((item) => stringifyListItem(item) || toDisplayText(item)).join("\n");
  return Object.entries(value as Record<string, unknown>)
    .map(([key, item]) => `${key}：${typeof item === "object" ? toDisplayText(item) : String(item)}`)
    .join("\n");
}

function getFailureHint(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("quota") || lower.includes("billing")) {
    return "智谱已识别到密钥，但当前账户额度或计费不可用。请在智谱开放平台检查账户余额、套餐或用量限制。";
  }
  if (lower.includes("api key") || lower.includes("unauthorized")) {
    return "请确认 .env.local 中的 ZHIPUAI_API_KEY 是有效的新密钥，并重启本地开发服务器。";
  }
  if (lower.includes("model")) {
    return "请确认 .env.local 中的 ZHIPU_MODEL 是当前智谱账号有权限使用的模型。";
  }
  return "请稍后重试，或检查本地服务和智谱开放平台状态。";
}

function getDisplayTask(task: string) {
  return task.split("\n\n请结合以下附件内容进行分析：")[0].trim() || "当前采购任务";
}

function createStageDeliverables(result: AgentResult | null) {
  if (!result) return [];
  const plan = toTextList(result.plan);
  const risks = toTextList(result.risks);
  const confirmations = toTextList(result.confirmations);
  const deliverable = toDisplayText(result.deliverable);
  const nextAction = toDisplayText(result.nextAction);
  return [
    {
      stage: "阶段 1",
      title: "指令确认与输入缺口",
      content: [toDisplayText(result.summary), ...confirmations].filter(Boolean),
    },
    {
      stage: "阶段 2",
      title: "采购分析与执行方案",
      content: plan.length ? plan : ["等待生成执行计划"],
    },
    {
      stage: "阶段 3",
      title: "风险矩阵与审批口径",
      content: risks.length ? risks : ["等待生成风险识别"],
    },
    {
      stage: "阶段 4",
      title: "附件交付包与下一步",
      content: [deliverable, nextAction].filter(Boolean),
    },
  ].filter((item) => item.content.length);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadBlob(content: BlobPart, type: string, filename: string) {
  const file = new Blob([content], { type });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildPlainTextOutput(result: AgentResult, stages = createStageDeliverables(result)) {
  const lines = [
    "ROCK Personal Assistant 阶段性交付",
    `生成时间：${new Date().toLocaleString("zh-CN")}`,
    "",
    formatAgentResult(result),
    "",
    "阶段性交付清单：",
    ...stages.flatMap((stage) => [
      `${stage.stage}｜${stage.title}`,
      ...stage.content.map((item, index) => `${index + 1}. ${item}`),
      "",
    ]),
  ];
  return lines.join("\n");
}

function buildWordDocument(result: AgentResult, stages = createStageDeliverables(result)) {
  const content = toDisplayText(result.deliverable) || formatAgentResult(result);
  const stageHtml = stages.length
    ? stages
        .map(
          (stage) => `
            <h2>${escapeHtml(stage.stage)}｜${escapeHtml(stage.title)}</h2>
            <ul>${stage.content.map((item) => `<li>${escapeHtml(item).replace(/\n/g, "<br />")}</li>`).join("")}</ul>
          `
        )
        .join("")
    : "";
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>ROCK Personal Assistant Deliverable</title>
  <style>
    body { font-family: "Microsoft YaHei", Arial, sans-serif; color: #1f1f1f; line-height: 1.7; }
    h1 { color: #8f1d1d; border-bottom: 3px solid #d79b22; padding-bottom: 8px; }
    h2 { color: #8f1d1d; margin-top: 24px; }
    li { margin: 6px 0; }
    .meta { color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(toDisplayText(result.summary) || "ROCK Personal Assistant 交付物")}</h1>
  <p class="meta">生成时间：${escapeHtml(new Date().toLocaleString("zh-CN"))}</p>
  <p>${escapeHtml(content).replace(/\n/g, "<br />")}</p>
  ${stageHtml}
</body>
</html>`;
}

function buildExcelWorkbook(result: AgentResult, stages = createStageDeliverables(result)) {
  const rows = stages
    .flatMap((stage) =>
      stage.content.map((item, index) => `
        <tr>
          <td>${escapeHtml(stage.stage)}</td>
          <td>${escapeHtml(stage.title)}</td>
          <td>${index + 1}</td>
          <td>${escapeHtml(item).replace(/\n/g, "<br />")}</td>
        </tr>
      `)
    )
    .join("");
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    table { border-collapse: collapse; font-family: "Microsoft YaHei", Arial, sans-serif; }
    th { background: #8f1d1d; color: #fff; }
    th, td { border: 1px solid #999; padding: 8px; vertical-align: top; }
  </style>
</head>
<body>
  <table>
    <thead>
      <tr><th>阶段</th><th>交付主题</th><th>序号</th><th>内容</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

function buildLocalResult(task: string, mode: AgentMode): AgentResult {
  const displayTask = getDisplayTask(task);
  if (/采购申请单/.test(displayTask) && /word|docx|doc|格式|模板/i.test(displayTask)) {
    return {
      summary: "已生成《采购申请单模板》Word 文档。",
      deliverable: [
        "采购申请单",
        "",
        "申请信息",
        "申请部门：__________",
        "申请人：__________",
        "申请日期：____年__月__日",
        "项目名称：__________",
        "项目编号：__________",
        "",
        "采购内容",
        "物料/服务名称：__________",
        "规格型号：__________",
        "数量：__________",
        "单位：__________",
        "期望交付日期：____年__月__日",
        "预算金额：__________",
        "",
        "采购原因",
        "请填写采购背景、用途、紧急程度、是否影响项目节点或 SOP。",
        "",
        "供应商建议",
        "推荐供应商：__________",
        "是否已有报价：□ 是  □ 否",
        "是否需要 RFQ：□ 是  □ 否",
        "",
        "审批信息",
        "采购工程师意见：__________",
        "部门负责人审批：__________",
        "财务审批：__________",
        "最终批准：__________",
      ].join("\n"),
      nextAction: "点击右侧“下载 Word”即可获取模板。",
    };
  }
  if (mode === "office" || /ppt|excel|xlsx|word|docx|模板|办公|汇报|表格/i.test(task)) {
    return {
      summary: `基于“${displayTask}”生成办公文件模板更新方案，覆盖 PPT、Excel 和 Word 三类采购交付物。`,
      status: "COMPLETED_LOCAL_TEMPLATE_ENGINE",
      plan: [
        "识别输入中的项目、物料族、供应商、报价、风险和审批信息，缺失项统一标记为待补充。",
        "更新 PPT 采购周会汇报结构，形成项目概览、RFQ 进展、成本对比、风险升级和下周行动页。",
        "更新 Excel RFQ/报价对比表字段，统一供应商、单价、阶梯价、NRE、MOQ、LT、付款条款和风险等级。",
        "更新 Word 定点审批备忘录结构，串联推荐供应商、成本依据、质量/交付风险和审批建议。",
      ],
      risks: [
        "真实报价、图纸、BOM 和供应商联系人属于敏感数据，写入共享模板前需要确认脱敏范围。",
        "不同供应商报价口径可能包含或不包含模具费、NRE、物流、税费，不能直接横向比较。",
        "如果缺少技术评审、质量体系或产能确认，定点审批结论只能作为草案。",
      ],
      confirmations: [
        "请确认是否允许把真实供应商名称、报价和物料号写入办公模板。",
        "请补充项目名称、物料号、年用量、SOP 时间、报价截止时间和模板版本号。",
      ],
      deliverable: [
        "阶段 1｜输入确认：项目名称、物料号、年用量、SOP、报价截止时间、模板版本号。",
        "阶段 2｜文字结果：输出采购周会口径、RFQ 进展摘要、风险与决策事项。",
        "阶段 3｜附件交付：生成 Word 审批稿、Excel 报价字段表、TXT 纯文本纪要。",
        "阶段 4｜确认后更新：待用户确认敏感字段和真实供应商名称后再进入正式模板。",
        "",
        "PPT：采购周会_项目名_物料族_YYYYMMDD.pptx",
        "第 1 页 项目与采购目标：项目名称、物料族、年用量、SOP 时间、当前阶段。",
        "第 2 页 RFQ / 寻源进展：供应商长名单、已发 RFQ、已回收报价、待技术澄清。",
        "第 3 页 成本与商务对比：目标价、最低报价、should-cost 假设、降本机会。",
        "第 4 页 风险与升级事项：交付风险、质量风险、合规风险、需管理层决策事项。",
        "",
        "Excel：RFQ报价对比_项目名_物料号_YYYYMMDD.xlsx",
        "Sheet 1 RFQ 总览：项目名称、物料号、规格摘要、年用量、SOP、RFQ 截止时间。",
        "Sheet 2 报价对比：供应商、单价、阶梯价、NRE、模具费、MOQ、LT、付款条款、质保、风险等级。",
        "Sheet 3 技术澄清：问题编号、供应商、问题、责任人、截止时间、状态、结论。",
        "Sheet 4 风险台账：风险类型、描述、影响、概率、等级、应对措施、责任人。",
        "",
        "Word：供应商定点审批_项目名_物料族_YYYYMMDD.docx",
        "章节：申请事项、背景与需求、供应商评估、成本依据、风险与应对、审批建议。",
        "更新规则：缺失字段标记为待补充；推荐结论必须能回溯到报价、技术评审或风险台账。",
      ].join("\n"),
      nextAction: "补充项目名称、物料号、供应商报价和风险台账后，可继续生成可复制到 PPT/Excel/Word 的正式内容。",
    };
  }

  const modeLabel = modeConfig[mode].label;
  const modeDeliverables: Record<Exclude<AgentMode, "office">, string[]> = {
    intake: [
      `需求任务：${displayTask}`,
      "准入检查：物料号、图纸版本、BOM、规格书、年用量、SOP、目标价、质量等级。",
      "缺口清单：待补技术参数、样件节点、测试标准、保密/出口管制要求。",
      "采购路径：试制采购 / 小批量验证 / 量产 RFQ / 紧急替代料。",
    ],
    supplier: [
      `供应商任务：${displayTask}`,
      "供应商地图：现供、备供、潜在供应商、禁用供应商。",
      "准入评分：车规经验、IATF16949、产能、良率、财务健康、交付记录。",
      "推荐动作：发 RFI、安排技术交流、样件验证、质量体系审核。",
    ],
    rfq: [
      `RFQ 任务：${displayTask}`,
      "RFQ 文件包：规格书、BOM、图纸、SOW、报价模板、质量条款、交付节点。",
      "澄清问题：可制造性、替代料、测试标准、模具/NRE、MOQ、LT、报价有效期。",
      "回收节奏：发放、答疑、报价截止、技术评审、商务澄清。",
    ],
    quote: [
      `报价任务：${displayTask}`,
      "比价口径：币种、税率、NRE、模具费、物流、付款条款、质保和年降。",
      "成本拆解：材料、加工、良率、人工、设备折旧、包装运输、管理费。",
      "结论输出：异常报价、目标价、降本机会、推荐谈判点。",
    ],
    negotiation: [
      `谈判任务：${displayTask}`,
      "谈判目标：目标价、交期、付款、质保、NRE 分摊、年度降本。",
      "策略：BATNA、让步边界、可交换条件、供应商关切点。",
      "话术：开场、数据锚点、让步交换、会议纪要和待确认事项。",
    ],
    risk: [
      `风险任务：${displayTask}`,
      "风险矩阵：交付、质量、成本、合规、单供依赖、产能瓶颈。",
      "预案：双供、备料、替代料、空运、现场驻厂、管理层升级。",
      "跟踪机制：责任人、截止时间、状态、触发阈值。",
    ],
    approval: [
      `审批任务：${displayTask}`,
      "定点建议：推荐供应商、备选供应商、推荐理由。",
      "审批依据：报价对比、技术评审、质量体系、交付能力、风险接受条件。",
      "管理层决策：需批准金额、合同边界、例外条款、前置条件。",
    ],
  };

  return {
    summary: `围绕“${displayTask}”生成${modeLabel}采购工程师工作包。`,
    status: "COMPLETED_LOCAL_RULE_ENGINE",
    plan: [
      "冻结采购输入：物料规格、年用量、SOP 时间、质量等级、样件节点和目标成本。",
      "拆分供应商动作：长名单筛选、RFI/RFQ 发放、技术澄清、报价回收和样件验证。",
      "建立对比口径：统一币种、税率、NRE、模具费、MOQ、LT、付款条款和质保条件。",
      "形成决策材料：输出风险矩阵、推荐方案、待审批事项和下一轮谈判策略。",
    ],
    risks: [
      "规格未冻结会导致供应商报价不可比。",
      "车规质量、功能安全、出口管制或数据保密约束未明确会影响准入。",
      "单一供应商或长周期关键料可能影响 SOP 节点。",
    ],
    confirmations: ["是否允许向供应商发送 RFQ 或共享图纸/BOM。", "是否采用单供、双供或试制/量产分阶段定点策略。"],
    deliverable: [
      "阶段 1｜指令确认：冻结物料规格、年用量、SOP、质量等级、目标成本和附件口径。",
      "阶段 2｜文字交付：输出采购判断、执行计划、供应商动作、风险矩阵和审批建议。",
      "阶段 3｜附件交付：可下载 Word 工作包、Excel 阶段清单、TXT 纯文本记录和 JSON 数据。",
      "阶段 4｜继续推进：用户确认共享范围、供应策略和缺失字段后，再生成下一阶段精修版。",
      "",
      ...modeDeliverables[mode],
    ].join("\n"),
    nextAction: "输入具体物料号、年用量、目标价格和供应商名单后，可生成更细的 RFQ 表格和审批备忘录。",
  };
}

export function AgentPage() {
  const [mode, setMode] = useState<AgentMode>("intake");
  const [input, setInput] = useState("");
  const [taskStatus, setTaskStatus] = useState("READY");
  const [activeResult, setActiveResult] = useState<AgentResult | null>(() => getInitialResult());
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [downloadFormats, setDownloadFormats] = useState<DownloadFormat[]>(() => getInitialDownloads());
  const [lastTask, setLastTask] = useState(() => getInitialLastTask());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageStreamRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>(() => getInitialMessages());
  const [memories, setMemories] = useState<string[]>(defaultMemories);

  const resolvedMode = (modeConfig[mode] ? mode : "intake") as AgentMode;
  const activeMode = modeConfig[resolvedMode] ?? modeConfig.intake;
  const outputText = useMemo(() => (activeResult ? formatAgentResult(activeResult) : ""), [activeResult]);
  const stageDeliverables = useMemo(() => createStageDeliverables(activeResult), [activeResult]);
  const attachmentSummary = useMemo(() => createAttachmentSummary(uploadedFiles), [uploadedFiles]);
  const actionItems = useMemo(() => {
    const lastAgentMessage = [...messages].reverse().find((message) => message.role === "agent");
    return lastAgentMessage?.text
      .split("\n")
      .filter((line) => /^\d+\./.test(line))
      .map((line) => line.replace(/^\d+\.\s*/, ""));
  }, [messages]);
  const showStages = shouldShowStageBox(lastTask, activeResult);
  const visibleResultItems = showStages && activeResult?.plan?.length ? activeResult.plan : showStages && actionItems?.length ? actionItems : [];
  const visibleStarters =
    activeResult && downloadFormats.includes("word") && downloadFormats.length === 1
      ? ["把这个 Word 模板改成公司正式版式", "补充审批流字段", "增加预算和供应商信息字段", "精简成一页版采购申请单"]
      : starters;

  function applyPromptTemplate(nextMode: AgentMode) {
    setMode(nextMode);
    setInput(modeConfig[nextMode].templatePrompt);
  }

  useEffect(() => {
    window.localStorage.setItem(
      conversationStorageKey,
      JSON.stringify({
        messages,
        activeResult,
        downloadFormats,
        lastTask,
      })
    );
  }, [messages, activeResult, downloadFormats, lastTask]);

  useEffect(() => {
    if (messageStreamRef.current) {
      messageStreamRef.current.scrollTop = messageStreamRef.current.scrollHeight;
    }
  }, [messages, taskStatus]);

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length) return;

    const nextFiles = await Promise.all(
      files.map(async (file) => {
        let content = "";
        const readable =
          file.type.startsWith("text/") ||
          /\.(csv|tsv|txt|md|json|xml|html|css|js|ts|tsx|log)$/i.test(file.name);
        if (readable && file.size <= 1024 * 1024) {
          content = await file.text();
        }
        return {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          content,
        };
      })
    );

    setUploadedFiles((current) => [...current, ...nextFiles].slice(0, 8));
    setError("");
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      addFiles(event.target.files);
      event.target.value = "";
    }
  }

  function removeFile(id: number) {
    setUploadedFiles((current) => current.filter((file) => file.id !== id));
  }

  async function runTask(rawTask: string) {
    const task = rawTask.trim();
    if (!task) return;
    const conversationContext = createConversationContext(messages, activeResult);
    const enrichedTask = [
      task,
      conversationContext ? `请延续以下连续对话上下文，不要当成全新任务：\n${conversationContext}` : "",
      attachmentSummary ? `请结合以下附件内容进行分析：\n${attachmentSummary}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const timestamp = Date.now();
    const userMessage: Message = {
      id: timestamp,
      role: "user",
      text: uploadedFiles.length ? `${task}\n\n已上传附件：${uploadedFiles.map((file) => file.name).join("、")}` : task,
    };
    const memory = extractMemory(task, resolvedMode);
    const nextMessages = [...messages, userMessage];
    const requestedFormats = detectDownloadFormats(task, activeResult);

    setMessages(nextMessages);
    setLastTask(task);
    setDownloadFormats(requestedFormats);
    setMemories((current) => Array.from(new Set([memory, ...current])).slice(0, 5));
    setTaskStatus("RUNNING");
    setError("");
    setInput("");

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 7000);
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          task,
          enrichedTask,
          mode: resolvedMode,
          memories,
          history: nextMessages.slice(-10),
          previousResult: activeResult,
          conversationContext,
          attachments: uploadedFiles.map(({ name, size, type, content }) => ({ name, size, type, content })),
        }),
      });
      window.clearTimeout(timeout);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "任务执行失败");
      }

      const result = data.result as AgentResult;
      const normalizedResult = normalizeResult(result);
      const resolvedFormats = detectDownloadFormats(task, normalizedResult);
      const agentMessage: Message = {
        id: timestamp + 1,
        role: "agent",
        text: formatAgentResult(normalizedResult),
      };

      setActiveResult(normalizedResult);
      setDownloadFormats(resolvedFormats);
      setMessages((current) => [...current, agentMessage]);
      setTaskStatus((normalizedResult.confirmations?.length ?? 0) ? "WAITING_CONFIRMATION" : "COMPLETED");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "任务执行失败";
      const fallbackResult = buildLocalResult(enrichedTask, resolvedMode);
      const normalizedFallback = normalizeResult(fallbackResult);
      const resolvedFormats = detectDownloadFormats(task, normalizedFallback);
      setError(`外部 AI 暂不可用，已切换本地模板引擎：${message}`);
      setActiveResult(normalizedFallback);
      setDownloadFormats(resolvedFormats);
      setMessages((current) => [
        ...current,
        {
          id: timestamp + 1,
          role: "agent",
          text: `${formatAgentResult(normalizedFallback)}\n\n系统提示：${getFailureHint(message)}`,
        },
      ]);
      setTaskStatus((normalizedFallback.confirmations?.length ?? 0) ? "WAITING_CONFIRMATION" : "COMPLETED");
    }
  }

  function submitMessage(event?: FormEvent) {
    event?.preventDefault();
    runTask(input || (uploadedFiles.length ? "请先阅读我上传的附件，复述你的理解，列出缺口，并告诉我下一步可以生成哪些交付物。" : ""));
  }

  function resetAgent() {
    setInput("");
    setTaskStatus("READY");
    setActiveResult(null);
    setError("");
    setUploadedFiles([]);
    setDownloadFormats([]);
    setLastTask("");
    setMemories(defaultMemories);
    setMessages([
      {
        id: 1,
        role: "agent",
        text: "新对话已开始。直接告诉我你要完成什么，也可以先上传附件。我只输出当前任务需要的内容和对应格式的下载文件。",
      },
    ]);
    window.localStorage.removeItem(conversationStorageKey);
  }

  async function copyResult() {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setError("结果已复制到剪贴板。");
    } catch {
      setError("浏览器未允许直接复制，请在交付物区域手动选择文本。");
    }
  }

  function downloadResult() {
    if (!outputText) return;
    downloadBlob(`# ROCK Personal Assistant 阶段性交付\n\n${outputText}\n`, "text/markdown;charset=utf-8", `rock-assistant-output-${new Date().toISOString().slice(0, 10)}.md`);
  }

  function downloadText() {
    if (!activeResult) return;
    downloadBlob(
      buildPlainTextOutput(activeResult, stageDeliverables),
      "text/plain;charset=utf-8",
      `rock-assistant-deliverable-${new Date().toISOString().slice(0, 10)}.txt`
    );
  }

  function downloadWord() {
    if (!activeResult) return;
    downloadBlob(
      buildWordDocument(activeResult, stageDeliverables),
      "application/msword;charset=utf-8",
      `rock-assistant-deliverable-${new Date().toISOString().slice(0, 10)}.doc`
    );
  }

  function downloadExcel() {
    if (!activeResult) return;
    downloadBlob(
      buildExcelWorkbook(activeResult, stageDeliverables),
      "application/vnd.ms-excel;charset=utf-8",
      `rock-assistant-stage-list-${new Date().toISOString().slice(0, 10)}.xls`
    );
  }

  function downloadJson() {
    if (!activeResult) return;
    downloadBlob(
      JSON.stringify({ result: activeResult, stages: stageDeliverables, attachments: uploadedFiles }, null, 2),
      "application/json;charset=utf-8",
      `rock-assistant-result-${new Date().toISOString().slice(0, 10)}.json`
    );
  }

  return (
    <main className="procurement-app-shell">
      <header className="procurement-topbar">
        <div className="terminal-brand">
          <span className="terminal-mark">
            <Music2 size={19} />
          </span>
          <div>
            <strong>ROCK Personal Assistant</strong>
            <small>无人驾驶采购工程师的摇滚智能助理</small>
          </div>
        </div>
        <div className="procurement-topbar-actions">
          <span>{getStatusLabel(taskStatus)}</span>
          <button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()}>
            <Upload size={17} />
            上传文件
          </button>
          <button type="button" className="primary-button" onClick={resetAgent}>
            <RotateCcw size={17} />
            新对话
          </button>
        </div>
      </header>

      <section className="procurement-workbench" aria-label="无人驾驶采购工程师智能助理">
        <aside className="procurement-sidebar">
          <div>
            <p className="panel-label">
              <Cpu size={15} />
              提示词范本
            </p>
            <div className="agent-mode-tabs">
              {(Object.keys(modeConfig) as AgentMode[]).map((key) => (
                <button key={key} className={mode === key ? "active" : ""} onClick={() => applyPromptTemplate(key)}>
                  {(() => {
                    const Icon = modeConfig[key].icon;
                    return <Icon size={15} />;
                  })()}
                  {modeConfig[key].label}
                </button>
              ))}
            </div>
            <p className="sidebar-note">点击只会把对应提示词填入中间输入框，不会直接执行。</p>
          </div>

          <div>
            <p className="panel-label">
              <Target size={15} />
              当前范本参考
            </p>
            <ul className="agent-list">
              {activeMode.focus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="workflow-strip">
            {workflowStats.map((item, index) => (
              <span key={item}>
                {index + 1}. {item}
              </span>
            ))}
          </div>
        </aside>

        <section className="procurement-main">
          <div className="procurement-hero-panel">
            <div>
              <span className="module-kicker">
                <Bot size={16} />
                Chat-first workflow
              </span>
              <h1>像聊天一样推进，不需要先配置功能</h1>
              <p>
                你可以直接输入目标，也可以先上传 BOM、RFQ、报价表、会议纪要或模板文件。我会围绕你的反馈持续修订，并把阶段结果转成可下载附件。
              </p>
            </div>
            <div className="procurement-metrics">
              {procurementMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label}>
                    <Icon size={16} />
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <section className="task-card legacy-input-card">
            <div className="section-title-row">
              <div>
                <p className="panel-label">
                  <FileUp size={15} />
                  附件上传
                </p>
                <h2>采购资料输入区</h2>
              </div>
              <button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()}>
                <Upload size={17} />
                选择文件
              </button>
            </div>
            <input
              className="file-input"
              type="file"
              multiple
              onChange={handleFileInput}
              accept=".txt,.md,.csv,.tsv,.json,.xlsx,.xls,.docx,.doc,.pptx,.ppt,.pdf"
            />
            <div
              className={`upload-dropzone ${isDragActive ? "active" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragActive(false);
                addFiles(event.dataTransfer.files);
              }}
            >
              <Upload size={24} />
              <strong>拖拽上传 BOM、报价表、RFQ、PPT、Word、PDF</strong>
              <span>文本、CSV、JSON 会读取内容预览；Office/PDF 会记录文件信息并纳入分析上下文。</span>
            </div>

            {uploadedFiles.length ? (
              <div className="uploaded-file-list">
                {uploadedFiles.map((file) => (
                  <article key={file.id}>
                    <FileText size={17} />
                    <div>
                      <strong>{file.name}</strong>
                      <span>{formatFileSize(file.size)} · {file.type || "unknown"}</span>
                    </div>
                    <button type="button" onClick={() => removeFile(file.id)} aria-label={`移除 ${file.name}`}>
                      <X size={16} />
                    </button>
                  </article>
              ))}
              </div>
            ) : null}
          </section>

          <section className="task-card legacy-input-card">
            <div className="section-title-row">
              <div>
                <p className="panel-label">
                  <Send size={15} />
                  文字指令
                </p>
                <h2>告诉助理要如何处理附件</h2>
              </div>
              <span className="status-pill">{taskStatus}</span>
            </div>

            <form className="agent-composer procurement-composer" onSubmit={submitMessage}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={activeMode.placeholder}
                aria-label="采购助理指令输入"
                rows={5}
              />
              <div>
                <button type="button" className="secondary-button" onClick={resetAgent}>
                  <RotateCcw size={17} />
                  重置
                </button>
                <button type="submit" className="primary-button" disabled={taskStatus === "RUNNING"}>
                  <Send size={17} />
                  {taskStatus === "RUNNING" ? "分析中" : "发送并分析"}
                </button>
              </div>
            </form>

            <div className="starter-row">
              {starters.map((starter) => (
                <button key={starter} disabled={taskStatus === "RUNNING"} onClick={() => runTask(starter)}>
                  {starter}
                </button>
              ))}
            </div>
          </section>

          <section className="task-card conversation-card">
            <div className="section-title-row">
              <div>
                <p className="panel-label">
                  <Lightbulb size={15} />
                  对话工作区
                </p>
                <h2>ROCK Chat</h2>
              </div>
              <span className="context-pill">{messages.length > 1 ? `已记住 ${messages.length} 条上下文` : "连续对话已开启"}</span>
            </div>
            <div className="message-stream" ref={messageStreamRef}>
              {messages.map((message) => (
                <article key={message.id} className={`message-bubble ${message.role}`}>
                  <span>{message.role === "agent" ? "rock.assistant" : "you.command"}</span>
                  <p>{message.text}</p>
                </article>
              ))}
            </div>
            <form
              className={`chat-followup-composer ${isDragActive ? "active" : ""}`}
              onSubmit={submitMessage}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragActive(false);
                addFiles(event.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                className="file-input"
                type="file"
                multiple
                onChange={handleFileInput}
                accept=".txt,.md,.csv,.tsv,.json,.xlsx,.xls,.docx,.doc,.pptx,.ppt,.pdf"
              />
              {uploadedFiles.length ? (
                <div className="chat-file-tray" aria-label="已上传附件">
                  {uploadedFiles.map((file) => (
                    <span className="chat-file-pill" key={file.id}>
                      <FileText size={15} />
                      <span>
                        <strong>{file.name}</strong>
                        <small>{formatFileSize(file.size)}</small>
                      </span>
                      <button type="button" onClick={() => removeFile(file.id)} aria-label={`移除 ${file.name}`}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="chat-composer-row">
                <button
                  type="button"
                  className="icon-button attach-button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="上传附件"
                  title="上传附件"
                >
                  <Upload size={18} />
                </button>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="直接说你想完成什么。例如：阅读附件并先总结；把结果改成管理层口径；继续生成 Word 和 Excel 附件。"
                  aria-label="连续对话输入"
                  rows={2}
                />
                <button type="submit" className="primary-button" disabled={taskStatus === "RUNNING"}>
                  <Send size={17} />
                  {taskStatus === "RUNNING" ? "分析中" : "发送"}
                </button>
              </div>
              <div className="chat-helper-row">
                <span>对话就是产品主流程：输入、上传、追问、修订、确认、下载。</span>
                <button type="button" className="text-button" onClick={resetAgent}>
                  <RotateCcw size={15} />
                  重置会话
                </button>
              </div>
            </form>
            <div className="starter-row chat-starters">
              {visibleStarters.map((starter) => (
                <button key={starter} disabled={taskStatus === "RUNNING"} onClick={() => runTask(starter)}>
                  {starter}
                </button>
              ))}
            </div>
          </section>
        </section>

        <aside className="procurement-result-panel">
          <p className="panel-label">
            <ClipboardList size={15} />
            交付物
          </p>
          <div className="result-panel-header">
            <h2>{activeResult ? "交付物已生成" : "等待你的消息"}</h2>
            <span>{messages.length} 条对话</span>
          </div>

          {error ? <div className="agent-error">{error}</div> : null}

          <div className="result-scroll-area">
            {visibleResultItems.length ? (
              <ol className="agent-output-list">
                {visibleResultItems.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={17} />
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            ) : null}

            {activeResult?.confirmations?.length ? (
              <div className="confirmation-box">
                <strong>需要你确认</strong>
                {activeResult.confirmations.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            ) : null}
            {showStages && stageDeliverables.length ? (
              <div className="stage-delivery-box">
                <strong>阶段性交付</strong>
                {stageDeliverables.map((stage) => (
                  <article key={`${stage.stage}-${stage.title}`}>
                    <span>{stage.stage}</span>
                    <b>{stage.title}</b>
                    <small>{stage.content.length} 项内容，可下载附件</small>
                  </article>
                ))}
              </div>
            ) : null}
            <div className="empty-result-box">
              <Power size={18} />
              <strong>{activeResult ? "按任务要求提供下载" : "先告诉我你要什么"}</strong>
              <span>{activeResult ? "这里只有本次任务需要的文件格式，不预设无关附件。" : "例如：需要一个采购申请单模板 Word 格式。"}</span>
            </div>
          </div>

          <div className="result-actions">
            <button type="button" className="secondary-button" disabled={!outputText} onClick={copyResult}>
              <Copy size={16} />
              复制结果
            </button>
            {downloadFormats.includes("md") ? (
              <button type="button" className="secondary-button" disabled={!outputText} onClick={downloadResult}>
                <Download size={16} />
                下载 MD
              </button>
            ) : null}
            {downloadFormats.includes("word") ? (
              <button type="button" className="secondary-button" disabled={!activeResult} onClick={downloadWord}>
                <FileText size={16} />
                下载 Word
              </button>
            ) : null}
            {downloadFormats.includes("excel") ? (
              <button type="button" className="secondary-button" disabled={!activeResult} onClick={downloadExcel}>
                <FileSpreadsheet size={16} />
                下载 Excel
              </button>
            ) : null}
            {downloadFormats.includes("txt") ? (
              <button type="button" className="secondary-button" disabled={!activeResult} onClick={downloadText}>
                <FileText size={16} />
                下载 TXT
              </button>
            ) : null}
            {downloadFormats.includes("json") ? (
              <button type="button" className="secondary-button" disabled={!activeResult} onClick={downloadJson}>
                <Download size={16} />
                下载 JSON
              </button>
            ) : null}
          </div>

        </aside>
      </section>
    </main>
  );
}
