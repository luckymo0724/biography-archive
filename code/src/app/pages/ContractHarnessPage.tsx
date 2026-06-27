import {
  AlertTriangle,
  Archive,
  BookOpenCheck,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Database,
  Download,
  FileText,
  Gauge,
  GitBranch,
  History,
  Layers3,
  ListChecks,
  PlayCircle,
  RotateCcw,
  Save,
  Scale,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Severity = "high" | "medium" | "low";
type HarnessMode = "case" | "answer" | "evaluate" | "memory" | "admin";
type TextCategory = "prompt" | "case" | "rubric" | "clause" | "policy";

type RiskPoint = {
  id: string;
  severity: Severity;
  title: string;
  why: string;
  expected: string;
  keywords: string[];
};

type ScoreDimension = {
  key: string;
  name: string;
  max: number;
  score: number;
  note: string;
};

type EvaluationReport = {
  total: number;
  level: string;
  oneLine: string;
  dimensions: ScoreDimension[];
  matchedRisks: RiskPoint[];
  missedRisks: RiskPoint[];
  strengths: string[];
  structureIssues: string[];
  rewriteSamples: string[];
  nextTraining: string[];
  memoryProposals: string[];
  createdAt: string;
};

type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
};

type VersionEntry = {
  version: string;
  date: string;
  title: string;
  changes: string[];
  status: "draft" | "released";
};

type TextBlock = {
  id: string;
  category: TextCategory;
  title: string;
  body: string;
  updatedAt: string;
};

type RepositoryConfig = {
  owner: string;
  repo: string;
  branch: string;
  deployTarget: string;
};

type HarnessState = {
  answer?: string;
  memory?: string[];
  mode?: HarnessMode;
  auditEvents?: AuditEvent[];
  versionEntries?: VersionEntry[];
  textBlocks?: TextBlock[];
  repository?: RepositoryConfig;
};

const storageKey = "contract-review-training-harness-v1";

const caseText = `市场推广服务协议

甲方：某消费品牌公司
乙方：某文化传媒工作室

1. 服务内容
乙方为甲方提供品牌推广服务，包括但不限于内容策划、达人沟通、图文和短视频发布、数据复盘等。具体服务内容以双方沟通确认为准。

2. 服务期限
服务期限为 2026 年 7 月 1 日至 2026 年 8 月 31 日。

3. 服务费用
甲方应在本协议签署后 3 个工作日内一次性向乙方支付服务费人民币 200,000 元。乙方收到款项后开始服务。

4. 交付与验收
乙方应按约提供推广服务。甲方应在乙方提交服务成果后 3 日内完成验收；逾期未提出书面异议的，视为验收通过。

5. 知识产权
乙方为履行本协议制作的全部内容归乙方所有，甲方可在合作期间用于品牌宣传。

6. 保密
双方应对合作中获知的商业信息保密，保密期限为本协议有效期内。

7. 违约责任
任何一方违反本协议，应赔偿守约方因此遭受的损失。

8. 解除
任一方可提前 5 日通知对方解除本协议。协议解除后，已支付费用不予退还。

9. 争议解决
因本协议产生的争议，由乙方所在地人民法院管辖。`;

const riskPoints: RiskPoint[] = [
  {
    id: "scope",
    severity: "high",
    title: "服务范围过于模糊",
    why: "服务内容以双方沟通确认为准，缺少达人数量、平台、发布篇数、发布时间、交付物和复盘报告。",
    expected: "增加 SOW 或服务清单，明确平台、达人数量、内容篇数、发布时间、审核流程和复盘报告。",
    keywords: ["服务范围", "服务内容", "交付", "达人", "平台", "篇数", "SOW", "清单", "沟通确认", "数据复盘"],
  },
  {
    id: "payment",
    severity: "high",
    title: "一次性预付全款且不退费",
    why: "甲方签署后即支付 20 万全款，解除后不退费，缺少交付和质量控制抓手。",
    expected: "改为分阶段付款，付款节点与中期交付、最终验收、合规发票挂钩。",
    keywords: ["一次性", "全款", "预付", "付款", "分阶段", "尾款", "验收后", "不予退还", "现金流"],
  },
  {
    id: "acceptance",
    severity: "high",
    title: "验收标准和异议机制不足",
    why: "3 日验收期过短，且没有客观验收标准、不合格整改、二次验收或扣款机制。",
    expected: "明确验收标准、7 到 10 个工作日验收期、整改期、二次验收和拒收后果。",
    keywords: ["验收", "3日", "三日", "异议", "视为验收", "验收标准", "整改", "重交", "拒收"],
  },
  {
    id: "termination",
    severity: "high",
    title: "解除条款对甲方不利",
    why: "任一方可提前 5 日解除，但已付费用不退，乙方可低成本退出。",
    expected: "区分便利解除和违约解除，约定按已完成合格工作结算，未履行部分退费。",
    keywords: ["解除", "终止", "5日", "五日", "不退", "退费", "已支付费用", "便利解除"],
  },
  {
    id: "ip",
    severity: "medium",
    title: "知识产权安排不利于甲方",
    why: "内容归乙方所有，甲方仅合作期间使用，不利于后续投放、复用、维权和品牌资产沉淀。",
    expected: "约定甲方在费用结清后享有交付成果的长期、全球、免费使用和改编权。",
    keywords: ["知识产权", "IP", "著作权", "权属", "归乙方", "使用权", "改编", "投放", "永久"],
  },
  {
    id: "compliance",
    severity: "medium",
    title: "侵权与广告合规责任缺失",
    why: "未要求乙方保证素材、字体、音乐、图片、达人授权和广告表述合法合规。",
    expected: "增加素材授权、广告合规、平台规则、第三方索赔处理和赔偿责任。",
    keywords: ["侵权", "广告", "合规", "素材", "字体", "音乐", "图片", "达人授权", "平台规则", "索赔"],
  },
  {
    id: "confidentiality",
    severity: "medium",
    title: "保密期限过短",
    why: "仅协议有效期内保密，不能覆盖合作结束后的营销方案、价格、数据和商业秘密。",
    expected: "将保密期限延长至协议终止后 3 年或商业秘密持续保密。",
    keywords: ["保密", "商业秘密", "期限", "有效期内", "终止后", "三年", "3年"],
  },
  {
    id: "liability",
    severity: "medium",
    title: "违约责任过于抽象",
    why: "没有覆盖延期交付、数量不足、内容违规、数据造假、侵权、泄密等具体责任。",
    expected: "按违约类型设置整改、扣款、违约金、赔偿和解除权。",
    keywords: ["违约", "赔偿", "违约金", "责任", "延期", "数据造假", "泄密", "扣款"],
  },
  {
    id: "jurisdiction",
    severity: "medium",
    title: "争议解决地对甲方不利",
    why: "由乙方所在地法院管辖，会增加甲方维权成本。",
    expected: "争取甲方所在地法院管辖，或选择中立且便利的争议解决地。",
    keywords: ["争议", "管辖", "法院", "乙方所在地", "甲方所在地", "仲裁"],
  },
  {
    id: "entity",
    severity: "low",
    title: "乙方主体和开票能力需确认",
    why: "乙方是工作室，需要核验登记信息、授权、履约团队和发票能力。",
    expected: "签署前核验主体信息、签署授权、发票类型和实际服务团队。",
    keywords: ["主体", "工作室", "授权", "签署人", "发票", "开票", "资质"],
  },
];

const checklist = [
  "主体资格与授权",
  "交易范围与交付",
  "验收标准",
  "付款与发票",
  "知识产权",
  "保密、数据与个人信息",
  "合规承诺",
  "违约责任",
  "赔偿与责任上限",
  "解除与终止",
  "适用法律与争议解决",
  "附件、订单和优先级",
];

const starterAnswer = `## 1. 总体判断

- 合同类型：
- 用户角色：
- 总体风险等级：
- 是否建议签署：
- 一句话理由：

## 2. 重大风险摘要

| 等级 | 条款/事项 | 风险说明 | 修改建议 |
| --- | --- | --- | --- |

## 3. 基础审查清单

## 4. 建议修改条款

## 5. 谈判底线

## 6. 签署前问题
`;

const defaultRepository: RepositoryConfig = {
  owner: "luckymo0724",
  repo: "biography-archive",
  branch: "main",
  deployTarget: "GitHub Pages / .github/workflows/deploy-pages.yml",
};

const defaultVersions: VersionEntry[] = [
  {
    version: "0.2.0",
    date: "2026-06-27",
    title: "后台管理与工程化发布基线",
    status: "draft",
    changes: ["新增后台管理控制台", "新增版本台账、审计日志和文本管理", "补齐 GitHub Pages 部署标准"],
  },
  {
    version: "0.1.0",
    date: "2026-06-27",
    title: "业务合同基础审查训练台 MVP",
    status: "released",
    changes: ["内置服务协议训练案例", "实现作答、评分、复盘和记忆沉淀闭环"],
  },
];

const defaultAuditEvents: AuditEvent[] = [
  {
    id: "audit-init",
    at: "2026-06-27 00:00:00",
    actor: "system",
    action: "INIT",
    target: "contract-review-harness",
    detail: "初始化业务合同基础审查训练 Harness。",
  },
];

const defaultTextBlocks: TextBlock[] = [
  {
    id: "prompt-orchestrator",
    category: "prompt",
    title: "训练总控提示词",
    body: "只在训练出题模式展示案例材料；评分复盘模式才读取参考风险点和 Rubric。",
    updatedAt: "2026-06-27",
  },
  {
    id: "rubric-basic-review",
    category: "rubric",
    title: "基础合同审查 100 分 Rubric",
    body: "交易理解 15 分，重大风险 25 分，专项覆盖 15 分，修改建议 20 分，结构表达 15 分，边界合规 10 分。",
    updatedAt: "2026-06-27",
  },
  {
    id: "clause-payment",
    category: "clause",
    title: "分阶段付款条款样例",
    body: "甲方在协议签署后支付 30%，乙方完成中期交付并经甲方书面确认后支付 40%，全部成果验收通过且乙方开具合法有效发票后支付剩余 30%。",
    updatedAt: "2026-06-27",
  },
];

const severityLabel: Record<Severity, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, "");
}

function countMatches(text: string, keywords: string[]) {
  const normalized = normalize(text);
  return keywords.filter((keyword) => normalized.includes(normalize(keyword))).length;
}

function clampScore(score: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(score)));
}

function getSavedState() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as HarnessState;
  } catch {
    return null;
  }
}

function nowStamp() {
  return new Date().toLocaleString("zh-CN", { hour12: false });
}

function createAuditEvent(action: string, target: string, detail: string): AuditEvent {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    at: nowStamp(),
    actor: "local-admin",
    action,
    target,
    detail,
  };
}

function exportHarnessState(state: Required<Omit<HarnessState, "mode">> & { mode: HarnessMode }) {
  return JSON.stringify(
    {
      schema: "contract-review-training-harness-state/v1",
      exportedAt: nowStamp(),
      ...state,
    },
    null,
    2
  );
}

function buildAuditMarkdown(events: AuditEvent[]) {
  return [
    "# Audit Log",
    "",
    "| Time | Actor | Action | Target | Detail |",
    "| --- | --- | --- | --- | --- |",
    ...events.map((event) => `| ${event.at} | ${event.actor} | ${event.action} | ${event.target} | ${event.detail} |`),
  ].join("\n");
}

function buildVersionMarkdown(entries: VersionEntry[]) {
  return [
    "# Version Log",
    "",
    ...entries.map((entry) =>
      [
        `## ${entry.version} | ${entry.date} | ${entry.status}`,
        "",
        entry.title,
        "",
        ...entry.changes.map((change) => `- ${change}`),
      ].join("\n")
    ),
  ].join("\n\n");
}

function evaluateAnswer(answer: string): EvaluationReport {
  const normalized = normalize(answer);
  const matchedRisks = riskPoints.filter((risk) => countMatches(answer, risk.keywords) >= 2);
  const missedRisks = riskPoints.filter((risk) => !matchedRisks.includes(risk));
  const highMatched = matchedRisks.filter((risk) => risk.severity === "high").length;
  const mediumMatched = matchedRisks.filter((risk) => risk.severity === "medium").length;
  const lowMatched = matchedRisks.filter((risk) => risk.severity === "low").length;

  const hasType = /推广|服务|市场|营销|委托/.test(answer);
  const hasRole = /甲方|委托方|品牌|用户角色/.test(answer);
  const hasMainline = /付款|交付|验收/.test(answer) && /解除|违约|知识产权|合规/.test(answer);
  const transactionScore = clampScore((hasType ? 5 : 0) + (hasRole ? 5 : 0) + (hasMainline ? 5 : 0), 15);

  const majorScore = clampScore(highMatched * 5 + Math.min(mediumMatched, 1) * 3 + Math.min(lowMatched, 1) * 2, 25);

  const specialtySignals = [
    /知识产权|著作权|IP/.test(answer),
    /保密|数据|个人信息|商业秘密/.test(answer),
    /合规|广告|侵权|平台规则|授权/.test(answer),
    /主体|授权|发票|开票/.test(answer),
    /争议|管辖|解除|通知/.test(answer),
  ];
  const specialtyScore = clampScore(specialtySignals.filter(Boolean).length * 3, 15);

  const concreteSuggestions = (answer.match(/建议|改为|增加|明确|约定|调整|删除|补充|分阶段/g) ?? []).length;
  const hasClauseText = /建议文本|修改为|条款|可替换|应约定|付款节点/.test(answer);
  const hasNegotiation = /必须|可让步|底线|业务确认|签署前/.test(answer);
  const suggestionScore = clampScore(Math.min(concreteSuggestions, 8) + (hasClauseText ? 6 : 0) + (hasNegotiation ? 4 : 0), 20);

  const hasConclusion = /总体|风险等级|是否建议|不建议|建议签署/.test(answer);
  const hasTableOrSections = /##|等级|条款|事项|风险说明|修改建议/.test(answer);
  const hasQuestions = /确认|问题|需补充|签署前/.test(answer);
  const structureScore = clampScore((hasConclusion ? 5 : 0) + (hasTableOrSections ? 5 : 0) + (hasQuestions ? 3 : 0) + (answer.length > 600 ? 2 : 0), 15);

  const fabricatedLaw = /第[一二三四五六七八九十百千0-9]+条|最高院|司法解释|监管规定|行政处罚/.test(answer);
  const hasBoundary = /需核验|仅供|正式法律意见|律师|事实不足|以.*为准/.test(answer);
  const illegalAdvice = /规避|虚假|不开发票|逃税|刷量|伪造/.test(answer);
  const boundaryScore = clampScore(10 - (fabricatedLaw ? 3 : 0) + (hasBoundary ? 1 : 0) - (illegalAdvice ? 5 : 0), 10);

  const dimensions: ScoreDimension[] = [
    {
      key: "transaction",
      name: "交易理解与角色判断",
      max: 15,
      score: transactionScore,
      note: hasType && hasRole ? "能识别服务推广合同和甲方立场。" : "需要先说清合同类型、甲方角色和交易主线。",
    },
    {
      key: "major",
      name: "重大风险识别",
      max: 25,
      score: majorScore,
      note: `命中 ${highMatched}/4 个高风险，${mediumMatched}/5 个中风险。`,
    },
    {
      key: "specialty",
      name: "专项风险覆盖",
      max: 15,
      score: specialtyScore,
      note: "按 IP、保密数据、广告合规、主体开票、争议解决等专项覆盖计分。",
    },
    {
      key: "suggestion",
      name: "修改建议质量",
      max: 20,
      score: suggestionScore,
      note: hasClauseText ? "有可落地的条款或谈判方向。" : "建议还需要从原则变成可执行条款。",
    },
    {
      key: "structure",
      name: "结构与表达",
      max: 15,
      score: structureScore,
      note: hasConclusion ? "有结论导向。" : "缺少总体判断和签署建议。",
    },
    {
      key: "boundary",
      name: "边界与合规",
      max: 10,
      score: boundaryScore,
      note: fabricatedLaw ? "出现未核验的具体法律依据表达，训练中应谨慎。" : "未发现明显编造法条或违法建议。",
    },
  ];

  const total = dimensions.reduce((sum, item) => sum + item.score, 0);
  const level = total >= 90 ? "优秀" : total >= 75 ? "合格" : total >= 60 ? "勉强合格" : "需重练";
  const oneLine =
    total >= 75
      ? "已经抓住主要风险，可以继续训练条款改写和谈判分层。"
      : "基础框架还不稳定，需要先训练付款、交付、验收、解除这条主线。";

  const strengths = [
    highMatched >= 3 ? "能识别多数高风险，没有只停留在措辞层面。" : "",
    suggestionScore >= 14 ? "修改建议有一定可执行性。" : "",
    structureScore >= 12 ? "输出结构较清楚，便于业务方阅读。" : "",
    boundaryScore >= 9 ? "没有明显越界或编造法律依据。" : "",
  ].filter(Boolean);

  const structureIssues = [
    !hasConclusion ? "开头缺少总体风险等级和是否建议签署。" : "",
    highMatched < 4 ? "重大风险没有完全覆盖，尤其要优先检查预付款、验收和解除条款。" : "",
    !hasClauseText ? "建议偏原则化，需要写成对方能接受或可谈判的条款方向。" : "",
    !hasNegotiation ? "缺少谈判底线，无法区分必须修改、可让步和需业务确认事项。" : "",
  ].filter(Boolean);

  const topMissed = missedRisks
    .filter((risk) => risk.severity !== "low")
    .slice(0, 5)
    .map((risk) => `遗漏“${risk.title}”：${risk.why} 应写成：${risk.expected}`);

  const rewriteSamples = [
    "付款条款建议改为：甲方在协议签署后支付 30%，乙方完成中期交付并经甲方书面确认后支付 40%，全部成果验收通过且乙方开具合法有效发票后支付剩余 30%。",
    "验收条款建议改为：乙方提交成果后，甲方有 7 个工作日进行验收；如成果不符合附件 SOW 或甲方书面确认的内容要求，乙方应在 5 个工作日内免费整改，整改后重新验收。",
    "知识产权与合规条款建议补充：乙方保证交付内容、素材、字体、音乐、图片、达人授权及广告表述合法合规；因第三方索赔或平台处罚造成甲方损失的，乙方应负责处理并赔偿。",
  ];

  const nextTraining = [
    highMatched < 4 ? "下一轮只练“付款、交付、验收、解除”的合同主线扫描。" : "",
    specialtyScore < 12 ? "增加 IP、保密数据和广告合规专项训练。" : "",
    suggestionScore < 14 ? "训练把“建议完善”改写成可谈判条款。" : "",
  ].filter(Boolean);

  const memoryProposals = [
    highMatched < 4 ? "当用户审查服务类合同时，优先检查预付全款、验收视为通过、任意解除不退费这三个高风险联动。" : "",
    !hasClauseText ? "用户容易停留在风险描述层，评分时应要求每个高风险至少配一条可执行修改方向。" : "",
    !hasNegotiation ? "用户答案若缺少谈判底线，应提示区分必须坚持、可让步和需业务确认。" : "",
  ].filter(Boolean);

  return {
    total,
    level,
    oneLine,
    dimensions,
    matchedRisks,
    missedRisks,
    strengths: strengths.length ? strengths : ["答案已经开始覆盖合同风险，但还需要形成稳定审查框架。"],
    structureIssues: structureIssues.length ? structureIssues : ["结构基本可用，下一步提高条款改写质量。"],
    rewriteSamples,
    nextTraining: nextTraining.length ? nextTraining : ["下一轮可提高难度，加入真实附件、报价单或 SOW。"],
    memoryProposals: memoryProposals.length ? memoryProposals : ["本轮表现稳定，暂不建议新增长期记忆。"],
    createdAt: new Date().toLocaleString("zh-CN"),
  };
}

function buildMarkdownReport(report: EvaluationReport, answer: string) {
  return [
    "# 业务合同基础审查训练评分报告",
    "",
    `生成时间：${report.createdAt}`,
    `总分：${report.total}/100`,
    `等级：${report.level}`,
    `一句话评价：${report.oneLine}`,
    "",
    "## 分项评分",
    "",
    "| 维度 | 得分 | 满分 | 评价 |",
    "| --- | ---: | ---: | --- |",
    ...report.dimensions.map((item) => `| ${item.name} | ${item.score} | ${item.max} | ${item.note} |`),
    "",
    "## 命中风险",
    "",
    ...report.matchedRisks.map((risk) => `- ${severityLabel[risk.severity]}｜${risk.title}：${risk.why}`),
    "",
    "## 重大遗漏",
    "",
    ...report.missedRisks.slice(0, 8).map((risk) => `- ${severityLabel[risk.severity]}｜${risk.title}：${risk.expected}`),
    "",
    "## 改写示例",
    "",
    ...report.rewriteSamples.map((sample, index) => `${index + 1}. ${sample}`),
    "",
    "## 学员答案",
    "",
    answer,
  ].join("\n");
}

function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

function CircularScore({ value }: { value: number }) {
  const angle = Math.round((value / 100) * 360);
  return (
    <div className="score-ring" style={{ background: `conic-gradient(#2e6171 ${angle}deg, #e7dfd1 0deg)` }}>
      <span>{value}</span>
      <small>/100</small>
    </div>
  );
}

export function ContractHarnessPage() {
  const saved = getSavedState();
  const [mode, setMode] = useState<HarnessMode>(saved?.mode ?? "case");
  const [answer, setAnswer] = useState(saved?.answer ?? starterAnswer);
  const [memoryItems, setMemoryItems] = useState<string[]>(saved?.memory ?? []);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(saved?.auditEvents ?? defaultAuditEvents);
  const [versionEntries, setVersionEntries] = useState<VersionEntry[]>(saved?.versionEntries ?? defaultVersions);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>(saved?.textBlocks ?? defaultTextBlocks);
  const [repository, setRepository] = useState<RepositoryConfig>(saved?.repository ?? defaultRepository);
  const report = useMemo(() => evaluateAnswer(answer), [answer]);
  const markdownReport = useMemo(() => buildMarkdownReport(report, answer), [report, answer]);
  const auditMarkdown = useMemo(() => buildAuditMarkdown(auditEvents), [auditEvents]);
  const versionMarkdown = useMemo(() => buildVersionMarkdown(versionEntries), [versionEntries]);
  const exportedState = useMemo(
    () =>
      exportHarnessState({
        answer,
        memory: memoryItems,
        mode,
        auditEvents,
        versionEntries,
        textBlocks,
        repository,
      }),
    [answer, auditEvents, memoryItems, mode, repository, textBlocks, versionEntries]
  );

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ answer, memory: memoryItems, mode, auditEvents, versionEntries, textBlocks, repository })
    );
  }, [answer, auditEvents, memoryItems, mode, repository, textBlocks, versionEntries]);

  const activeChecklistHits = checklist.filter((item) => countMatches(answer, item.split("、")) > 0 || answer.includes(item));

  function recordAudit(action: string, target: string, detail: string) {
    setAuditEvents((current) => [createAuditEvent(action, target, detail), ...current].slice(0, 80));
  }

  function saveMemoryProposal(item: string) {
    if (memoryItems.includes(item)) return;
    setMemoryItems((current) => [item, ...current]);
    recordAudit("MEMORY_CREATE", "MEMORY.md", item);
  }

  function resetTraining() {
    setAnswer(starterAnswer);
    setMode("case");
    recordAudit("TRAINING_RESET", "Case 001", "重置学员答案并返回案例材料。");
  }

  function submitForEvaluation() {
    setMode("evaluate");
    recordAudit("EVALUATION_RUN", "Case 001", `生成评分报告：${report.total}/100，等级：${report.level}。`);
  }

  function updateTextBlock(id: string, patch: Partial<TextBlock>) {
    setTextBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : block))
    );
    recordAudit("TEXT_UPDATE", id, "更新后台文本库条目。");
  }

  function addTextBlock() {
    const block: TextBlock = {
      id: `text-${Date.now()}`,
      category: "clause",
      title: "新文本条目",
      body: "在这里维护提示词、案例说明、Rubric 或条款样例。",
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setTextBlocks((current) => [block, ...current]);
    recordAudit("TEXT_CREATE", block.id, "新增后台文本库条目。");
  }

  function releaseDraftVersion() {
    setVersionEntries((current) =>
      current.map((entry, index) => (index === 0 ? { ...entry, status: "released" as const, date: new Date().toISOString().slice(0, 10) } : entry))
    );
    recordAudit("VERSION_RELEASE", versionEntries[0]?.version ?? "unknown", "将最新版本标记为 released。");
  }

  return (
    <main className="contract-harness-page">
      <section className="contract-hero">
        <div className="contract-hero-copy">
          <p className="eyebrow">
            <Scale size={16} />
            Legal Training Harness
          </p>
          <h1>业务合同基础审查训练台</h1>
          <p>
            用案例出题、学员作答、规则评分和记忆沉淀，把 Her-System 的身份和记忆底座变成一套可实际使用的合同审查训练工具。
          </p>
          <div className="contract-hero-actions">
            <button className="primary-button" type="button" onClick={() => setMode("answer")}>
              <PlayCircle size={18} />
              开始作答
            </button>
            <button className="secondary-button" type="button" onClick={() => setMode("evaluate")}>
              <Gauge size={18} />
              查看评分
            </button>
          </div>
        </div>

        <div className="harness-status-panel">
          <div>
            <span>当前案例</span>
            <strong>001</strong>
            <small>市场推广服务协议</small>
          </div>
          <div>
            <span>评分状态</span>
            <strong>{report.level}</strong>
            <small>{report.total}/100</small>
          </div>
          <div>
            <span>命中风险</span>
            <strong>{report.matchedRisks.length}</strong>
            <small>共 {riskPoints.length} 个参考点</small>
          </div>
          <div>
            <span>仓库版本</span>
            <strong>{versionEntries[0]?.version}</strong>
            <small>{auditEvents.length} 条审计记录</small>
          </div>
        </div>
      </section>

      <section className="harness-workspace">
        <aside className="harness-sidebar">
          <button className={mode === "case" ? "active" : ""} type="button" onClick={() => setMode("case")}>
            <FileText size={18} />
            案例材料
          </button>
          <button className={mode === "answer" ? "active" : ""} type="button" onClick={() => setMode("answer")}>
            <ClipboardList size={18} />
            学员作答
          </button>
          <button className={mode === "evaluate" ? "active" : ""} type="button" onClick={() => setMode("evaluate")}>
            <ClipboardCheck size={18} />
            评分复盘
          </button>
          <button className={mode === "memory" ? "active" : ""} type="button" onClick={() => setMode("memory")}>
            <Layers3 size={18} />
            记忆沉淀
          </button>
          <button className={mode === "admin" ? "active" : ""} type="button" onClick={() => setMode("admin")}>
            <Settings size={18} />
            后台管理
          </button>
          <div className="sidebar-note">
            <ShieldCheck size={18} />
            <p>本工具用于训练和内部辅助，不构成正式法律意见。真实合同请先脱敏。</p>
          </div>
        </aside>

        <div className="harness-main">
          {mode === "case" && (
            <section className="harness-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    <BookOpenCheck size={16} />
                    训练出题模式
                  </p>
                  <h2>Case 001｜市场推广服务协议基础审查</h2>
                </div>
                <button className="secondary-button" type="button" onClick={() => copyText(caseText)}>
                  <Copy size={16} />
                  复制合同
                </button>
              </div>

              <div className="case-brief-grid">
                <article>
                  <span>用户角色</span>
                  <strong>甲方 / 委托方</strong>
                  <p>消费品牌公司，希望控制付款风险、确保交付质量，并避免侵权素材或违规营销。</p>
                </article>
                <article>
                  <span>训练目标</span>
                  <strong>20 分钟基础审查</strong>
                  <p>输出总体判断、至少 5 个风险点、至少 2 条修改建议、谈判底线和签署前问题。</p>
                </article>
              </div>

              <pre className="contract-text">{caseText}</pre>

              <div className="task-strip">
                <Target size={20} />
                <div>
                  <strong>作答要求</strong>
                  <p>先判断能否签，再按高/中/低列风险。不要只说“建议完善”，要写清楚如何改。</p>
                </div>
              </div>
            </section>
          )}

          {mode === "answer" && (
            <section className="harness-panel answer-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    <ClipboardList size={16} />
                    学员作答模式
                  </p>
                  <h2>填写你的审查意见</h2>
                </div>
                <div className="panel-actions">
                  <button className="secondary-button" type="button" onClick={resetTraining}>
                    <RotateCcw size={16} />
                    重置
                  </button>
                  <button className="primary-button" type="button" onClick={submitForEvaluation}>
                    <CheckCircle2 size={16} />
                    提交评分
                  </button>
                </div>
              </div>

              <textarea
                className="review-editor"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                spellCheck={false}
              />

              <div className="live-coach">
                <div>
                  <strong>实时覆盖</strong>
                  <p>已覆盖 {activeChecklistHits.length}/{checklist.length} 个基础清单项。</p>
                </div>
                <div className="checklist-tags">
                  {checklist.map((item) => (
                    <span key={item} className={activeChecklistHits.includes(item) ? "hit" : ""}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {mode === "evaluate" && (
            <section className="harness-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    <Gauge size={16} />
                    评分复盘模式
                  </p>
                  <h2>评分报告</h2>
                </div>
                <div className="panel-actions">
                  <button className="secondary-button" type="button" onClick={() => copyText(markdownReport)}>
                    <Copy size={16} />
                    复制报告
                  </button>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => downloadText("contract-review-training-report.md", markdownReport, "text/markdown;charset=utf-8")}
                  >
                    <Download size={16} />
                    下载报告
                  </button>
                </div>
              </div>

              <div className="score-summary">
                <CircularScore value={report.total} />
                <div>
                  <span>{report.level}</span>
                  <h3>{report.oneLine}</h3>
                  <p>生成时间：{report.createdAt}</p>
                </div>
              </div>

              <div className="score-table">
                {report.dimensions.map((dimension) => (
                  <div key={dimension.key} className="score-row">
                    <strong>{dimension.name}</strong>
                    <div className="score-bar">
                      <span style={{ width: `${(dimension.score / dimension.max) * 100}%` }} />
                    </div>
                    <em>
                      {dimension.score}/{dimension.max}
                    </em>
                    <p>{dimension.note}</p>
                  </div>
                ))}
              </div>

              <div className="review-grid">
                <article>
                  <h3>
                    <CheckCircle2 size={18} />
                    命中风险
                  </h3>
                  {report.matchedRisks.length ? (
                    report.matchedRisks.map((risk) => (
                      <div key={risk.id} className={`risk-item ${risk.severity}`}>
                        <span>{severityLabel[risk.severity]}</span>
                        <strong>{risk.title}</strong>
                        <p>{risk.why}</p>
                      </div>
                    ))
                  ) : (
                    <p>还没有命中参考风险点。先从付款、交付、验收、解除四个高风险开始。</p>
                  )}
                </article>

                <article>
                  <h3>
                    <AlertTriangle size={18} />
                    重大遗漏
                  </h3>
                  {report.missedRisks.slice(0, 6).map((risk) => (
                    <div key={risk.id} className={`risk-item ${risk.severity}`}>
                      <span>{severityLabel[risk.severity]}</span>
                      <strong>{risk.title}</strong>
                      <p>{risk.expected}</p>
                    </div>
                  ))}
                </article>
              </div>

              <div className="coach-section">
                <h3>
                  <Sparkles size={18} />
                  可替换示例
                </h3>
                {report.rewriteSamples.map((sample, index) => (
                  <p key={sample}>
                    {index + 1}. {sample}
                  </p>
                ))}
              </div>
            </section>
          )}

          {mode === "memory" && (
            <section className="harness-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    <Layers3 size={16} />
                    记忆沉淀模式
                  </p>
                  <h2>把本轮问题沉淀成下一轮训练规则</h2>
                </div>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => downloadText("contract-harness-memory.json", JSON.stringify(memoryItems, null, 2), "application/json")}
                >
                  <Download size={16} />
                  导出记忆
                </button>
              </div>

              <div className="memory-layout">
                <article>
                  <h3>建议写入 MEMORY.md</h3>
                  {report.memoryProposals.map((item) => (
                    <div key={item} className="memory-proposal">
                      <p>{item}</p>
                      <button type="button" onClick={() => saveMemoryProposal(item)}>
                        <Save size={15} />
                        写入本页记忆
                      </button>
                    </div>
                  ))}
                </article>

                <article>
                  <h3>已保存记忆</h3>
                  {memoryItems.length ? (
                    memoryItems.map((item) => (
                      <p key={item} className="saved-memory">
                        {item}
                      </p>
                    ))
                  ) : (
                    <p className="empty-state">还没有保存长期记忆。完成一次评分后，可以把稳定错误模式写入这里。</p>
                  )}
                </article>
              </div>
            </section>
          )}

          {mode === "admin" && (
            <section className="harness-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    <Settings size={16} />
                    后台管理系统
                  </p>
                  <h2>仓库、版本、审计与文本管理</h2>
                </div>
                <div className="panel-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => downloadText("contract-harness-state.json", exportedState, "application/json")}
                  >
                    <Archive size={16} />
                    导出全量
                  </button>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => downloadText("contract-harness-audit.md", auditMarkdown, "text/markdown;charset=utf-8")}
                  >
                    <Download size={16} />
                    导出审计
                  </button>
                </div>
              </div>

              <div className="admin-metrics">
                <article>
                  <GitBranch size={20} />
                  <span>GitHub 仓库</span>
                  <strong>
                    {repository.owner}/{repository.repo}
                  </strong>
                  <small>{repository.branch}</small>
                </article>
                <article>
                  <CalendarCheck size={20} />
                  <span>当前版本</span>
                  <strong>{versionEntries[0]?.version}</strong>
                  <small>{versionEntries[0]?.status}</small>
                </article>
                <article>
                  <History size={20} />
                  <span>审计记录</span>
                  <strong>{auditEvents.length}</strong>
                  <small>local append-only log</small>
                </article>
                <article>
                  <Database size={20} />
                  <span>文本资产</span>
                  <strong>{textBlocks.length}</strong>
                  <small>prompt / case / rubric / clause</small>
                </article>
              </div>

              <div className="admin-grid">
                <article className="admin-card">
                  <h3>
                    <GitBranch size={18} />
                    仓库配置
                  </h3>
                  <label>
                    Owner
                    <input
                      value={repository.owner}
                      onChange={(event) => setRepository((current) => ({ ...current, owner: event.target.value }))}
                      onBlur={() => recordAudit("REPO_UPDATE", "owner", repository.owner)}
                    />
                  </label>
                  <label>
                    Repository
                    <input
                      value={repository.repo}
                      onChange={(event) => setRepository((current) => ({ ...current, repo: event.target.value }))}
                      onBlur={() => recordAudit("REPO_UPDATE", "repo", repository.repo)}
                    />
                  </label>
                  <label>
                    Branch
                    <input
                      value={repository.branch}
                      onChange={(event) => setRepository((current) => ({ ...current, branch: event.target.value }))}
                      onBlur={() => recordAudit("REPO_UPDATE", "branch", repository.branch)}
                    />
                  </label>
                  <p>部署目标：{repository.deployTarget}</p>
                </article>

                <article className="admin-card">
                  <h3>
                    <ListChecks size={18} />
                    版本台账
                  </h3>
                  <div className="version-list">
                    {versionEntries.map((entry) => (
                      <div key={entry.version} className="version-item">
                        <span>{entry.status}</span>
                        <strong>
                          {entry.version}｜{entry.title}
                        </strong>
                        <small>{entry.date}</small>
                        <p>{entry.changes.join("；")}</p>
                      </div>
                    ))}
                  </div>
                  <div className="inline-actions">
                    <button type="button" onClick={releaseDraftVersion}>
                      <Save size={15} />
                      发布最新草稿
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadText("VERSION_LOG.md", versionMarkdown, "text/markdown;charset=utf-8")}
                    >
                      <Download size={15} />
                      导出版本日志
                    </button>
                  </div>
                </article>
              </div>

              <div className="admin-grid wide">
                <article className="admin-card">
                  <div className="card-title-row">
                    <h3>
                      <FileText size={18} />
                      文本管理
                    </h3>
                    <button type="button" onClick={addTextBlock}>
                      <Upload size={15} />
                      新增文本
                    </button>
                  </div>
                  <div className="text-manager">
                    {textBlocks.map((block) => (
                      <div key={block.id} className="text-block-editor">
                        <select
                          value={block.category}
                          onChange={(event) => updateTextBlock(block.id, { category: event.target.value as TextCategory })}
                        >
                          <option value="prompt">prompt</option>
                          <option value="case">case</option>
                          <option value="rubric">rubric</option>
                          <option value="clause">clause</option>
                          <option value="policy">policy</option>
                        </select>
                        <input
                          value={block.title}
                          onChange={(event) => updateTextBlock(block.id, { title: event.target.value })}
                          aria-label={`${block.title} title`}
                        />
                        <textarea
                          value={block.body}
                          onChange={(event) => updateTextBlock(block.id, { body: event.target.value })}
                          aria-label={`${block.title} body`}
                        />
                        <small>updated: {block.updatedAt}</small>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="admin-card">
                  <h3>
                    <History size={18} />
                    审计日志
                  </h3>
                  <div className="audit-list">
                    {auditEvents.map((event) => (
                      <div key={event.id} className="audit-item">
                        <span>{event.action}</span>
                        <strong>{event.target}</strong>
                        <small>
                          {event.at} · {event.actor}
                        </small>
                        <p>{event.detail}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
