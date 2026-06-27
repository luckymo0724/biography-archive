import { IncomingMessage } from "node:http";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

type AgentRequest = {
  task?: string;
  enrichedTask?: string;
  mode?: string;
  memories?: string[];
  history?: Array<{ role: string; text: string }>;
  previousResult?: unknown;
  conversationContext?: string;
  attachments?: Array<{ name: string; size: number; type: string; content?: string }>;
};

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function postJson(url: string, headers: Record<string, string>, payload: unknown) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 1; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      return { status: response.status, body: await response.text() };
    } catch (error) {
      lastError = error;
      if (attempt === 3) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Zhipu request failed.");
}

function extractText(data: any) {
  if (typeof data?.output_text === "string") return data.output_text;
  if (typeof data?.choices?.[0]?.message?.content === "string") return data.choices[0].message.content;
  const parts =
    data?.output
      ?.flatMap((item: any) => item?.content ?? [])
      ?.map((content: any) => content?.text)
      ?.filter(Boolean) ?? [];
  return parts.join("\n").trim();
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function sanitizeErrorMessage(message: string) {
  return message
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted_api_key]")
    .replace(/https:\/\/platform\.openai\.com\/account\/api-keys/g, "OpenAI Platform API keys page");
}

function buildLocalAgentResult(task: string, mode = "intake", history: AgentRequest["history"] = [], previousResult?: unknown) {
  const displayTask = task.split("\n\n请结合以下附件内容进行分析：")[0].trim() || "当前采购任务";
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
      nextAction: "点击右侧“下载 Word”获取模板。",
    };
  }
  const isFollowUp = /上一版|继续|重写|修改|改成|补充|细化|根据.*反馈|沿着|刚才|前面/.test(task);
  const continuityNote = isFollowUp
    ? "这是对上一轮结果的连续追问/修订，本轮输出会保留前文任务背景，并只改动用户刚提出的口径。"
    : "这是当前对话链中的新一步，输出会承接已有上下文。";
  const recentUser = history
    ?.filter((item) => item.role === "user")
    .slice(-3)
    .map((item) => item.text)
    .join(" / ");
  const previousNote = previousResult ? "已检测到上一版交付结果，本轮可在其基础上继续重写、压缩、补充或生成附件。" : "";
  const isOffice = mode === "office" || /ppt|excel|xlsx|word|docx|模板|办公|汇报|表格/i.test(task);
  if (isOffice) {
    return {
      summary: `基于“${displayTask}”延续当前对话，生成办公文件模板更新方案。${continuityNote}${previousNote ? ` ${previousNote}` : ""}`,
      status: "COMPLETED_LOCAL_TEMPLATE_ENGINE",
      plan: [
        "识别项目、物料族、供应商、报价、风险和审批信息，缺失项统一标记为待补充。",
        "更新 PPT 采购周会汇报结构：项目概览、RFQ 进展、成本对比、风险升级、下周行动。",
        "更新 Excel RFQ/报价对比表字段：供应商、单价、阶梯价、NRE、MOQ、LT、付款条款、风险等级。",
        "更新 Word 定点审批备忘录：推荐供应商、成本依据、质量/交付风险、审批建议。",
      ],
      risks: [
        "真实报价、图纸、BOM 和供应商联系人属于敏感数据，写入共享模板前需要确认脱敏范围。",
        "不同供应商报价口径可能包含或不包含模具费、NRE、物流、税费，不能直接横向比较。",
        "缺少技术评审、质量体系或产能确认时，定点审批结论只能作为草案。",
      ],
      confirmations: [
        "请确认是否允许把真实供应商名称、报价和物料号写入办公模板。",
        "请补充项目名称、物料号、年用量、SOP 时间、报价截止时间和模板版本号。",
      ],
      deliverable: [
        recentUser ? `对话承接：${recentUser}` : "",
        "PPT：采购周会_项目名_物料族_YYYYMMDD.pptx",
        "页面：项目与采购目标 / RFQ 寻源进展 / 成本与商务对比 / 风险与升级事项 / 下周行动。",
        "Excel：RFQ报价对比_项目名_物料号_YYYYMMDD.xlsx",
        "Sheet：RFQ 总览 / 报价对比 / 技术澄清 / 风险台账。",
        "Word：供应商定点审批_项目名_物料族_YYYYMMDD.docx",
        "章节：申请事项 / 背景与需求 / 供应商评估 / 成本依据 / 风险与应对 / 审批建议。",
        "更新规则：缺失字段标记为待补充；推荐结论必须回溯到报价、技术评审或风险台账。",
      ].filter(Boolean).join("\n"),
      nextAction: "补充项目名称、物料号、供应商报价和风险台账后，可继续生成可复制到 PPT/Excel/Word 的正式内容。",
    };
  }

  return {
    summary: `围绕“${displayTask}”延续当前对话，生成无人驾驶采购工程师工作包。${continuityNote}${previousNote ? ` ${previousNote}` : ""}`,
    status: "COMPLETED_LOCAL_RULE_ENGINE",
    plan: [
      "冻结采购输入：物料规格、年用量、SOP 时间、质量等级、样件节点和目标成本。",
      "拆分供应商动作：长名单筛选、RFI/RFQ 发放、技术澄清、报价回收和样件验证。",
      "建立对比口径：统一币种、税率、NRE、模具费、MOQ、LT、付款条款和质保条件。",
      "形成决策材料：输出风险矩阵、推荐方案、待审批事项和下一轮谈判策略。",
    ],
    risks: ["规格未冻结会导致报价不可比。", "质量、功能安全、出口管制或保密约束未明确会影响准入。", "单一供应商或长周期关键料可能影响 SOP 节点。"],
    confirmations: ["是否允许向供应商发送 RFQ 或共享图纸/BOM。", "是否采用单供、双供或试制/量产分阶段定点策略。"],
    deliverable: `${recentUser ? `对话承接：${recentUser}\n` : ""}采购任务：${displayTask}\n模块：${mode}\n准入检查：物料号、图纸/BOM/规格书、年用量、SOP、目标价、质量等级。\n供应商动作：长名单、准入评分、RFQ 发放、技术澄清、报价回收。\n商务动作：比价口径、should-cost、谈判策略、付款/质保/交付条款。\n风险动作：交付、质量、成本、合规、单供依赖，按红/黄/绿评级。\n审批输出：推荐方案、成本依据、风险接受条件、管理层决策事项。`,
    nextAction: "输入具体物料号、年用量、目标价格和供应商名单后，可生成更细的 RFQ 表格和审批备忘录。",
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.ZHIPUAI_API_KEY;
  const model = env.ZHIPU_MODEL || "glm-4-flash-250414";

  return {
    plugins: [
      react(),
      {
        name: "luckychen-agent-api",
        configureServer(server) {
          server.middlewares.use("/api/agent", async (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Only POST is supported." }));
              return;
            }

            let fallbackTask = "采购任务";
            let fallbackMode = "intake";

            try {
              const body = JSON.parse(await readBody(req)) as AgentRequest;
              const task = body.task?.trim();
              const modelTask = body.enrichedTask?.trim() || task;
              fallbackTask = task || fallbackTask;
              fallbackMode = body.mode || fallbackMode;
              if (!task) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Task is required." }));
                return;
              }

              if (!apiKey) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    result: buildLocalAgentResult(task, body.mode, body.history, body.previousResult),
                    source: "local-template-engine",
                  })
                );
                return;
              }

              const prompt = {
                task,
                currentInstruction: task,
                enrichedTask: modelTask,
                attachmentCount: body.attachments?.length ?? 0,
                mode: body.mode ?? "intake",
                memories: body.memories ?? [],
                recentHistory: body.history?.slice(-10) ?? [],
                previousResult: body.previousResult ?? null,
                conversationContext: body.conversationContext ?? "",
              };

              const systemPrompt =
                "You are ROCK Personal Assistant, an intelligent procurement engineering assistant for an autonomous driving company. Work in Chinese. Behave like a continuous chat assistant. Always carry forward recent conversation, previous deliverable, uploaded attachment summaries, and user corrections. If the user says 上一版, 继续, 改成, 重写, 补充, 细化, or gives short follow-up feedback, interpret it relative to the prior assistant answer instead of starting over. Most important: answer only what the user asked for. Do not add stage plans, risk analysis, confirmations, JSON notes, Excel/TXT/PPT content, or extra analysis unless the user explicitly asked for those. The downloadable file formats must be determined by the task wording only. Example: if the user asks '需要一个采购申请单模板 word 格式', return concise JSON with summary saying the Word template is generated, deliverable containing the actual purchase request form template content, and nextAction telling the user to download Word. Leave plan, risks, confirmations empty or omitted. When the user asks for analysis, provide only the requested analysis. When the user asks for a file/template, provide file-ready content. Never claim you contacted suppliers, sent RFQs, approved spend, accessed PLM/ERP/SRM, updated real office files, or performed external actions unless a tool or platform was actually provided. Return only strict JSON with keys: summary, status, plan, risks, confirmations, deliverable, nextAction.";

              const chatHistory =
                body.history
                  ?.slice(-8)
                  .map((item) => ({
                    role: item.role === "agent" ? "assistant" : "user",
                    content: item.text,
                  })) ?? [];

              const response = await postJson(
                "https://open.bigmodel.cn/api/paas/v4/chat/completions",
                {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
                {
                  model,
                  messages: [
                    { role: "system", content: systemPrompt },
                    ...chatHistory,
                    {
                      role: "user",
                      content: `请严格基于以下连续对话上下文和当前指令输出 JSON，不要丢失前文。\n${JSON.stringify(prompt)}`,
                    },
                  ],
                  response_format: { type: "json_object" },
                  temperature: 0.6,
                  stream: false,
                }
              );

              const data: any = safeJson(response.body) ?? {};
              if (response.status < 200 || response.status >= 300) {
                res.statusCode = response.status;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: sanitizeErrorMessage(data?.error?.message ?? data?.message ?? "Zhipu request failed."),
                  })
                );
                return;
              }

              const text = extractText(data);
              const parsed = safeJson(text);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ result: parsed ?? { deliverable: text, status: "completed" } }));
            } catch (error) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  result: buildLocalAgentResult(fallbackTask, fallbackMode),
                  source: "local-template-engine",
                  warning: sanitizeErrorMessage(error instanceof Error ? error.message : "Unknown error."),
                })
              );
            }
          });
        },
      },
    ],
  };
});
