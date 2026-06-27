const portraitAsset = (fileName: string) =>
  new URL(`../../assets/portraits/${fileName}`, import.meta.url).href;
const aiAsset = (fileName: string) => new URL(`../../assets/ai/${fileName}`, import.meta.url).href;

export type BiographyContent = {
  id: string;
  name: string;
  title: string;
  era: string;
  category: string;
  location: string;
  readingTime: string;
  summary: string;
  portrait: string;
  accent: string;
  price: number;
  isPaid: boolean;
  milestones: string[];
  quote: string;
};

export type AiArticle = {
  id: string;
  title: string;
  category: string;
  readingTime: string;
  summary: string;
  price: number;
  isPaid: boolean;
  cover: string;
  points: string[];
};

export const mockContents: BiographyContent[] = [
  {
    id: "li-ming-community",
    name: "李明",
    title: "社区维修师傅的三十年手艺账",
    era: "1978 - 至今",
    category: "城市生活",
    location: "中国 北京",
    readingTime: "8 分钟",
    summary:
      "李明从胡同里的学徒做起，修过老楼水管、门锁和电路，也见证了一个社区从熟人社会走向数字化服务的变化。",
    portrait: portraitAsset("li-ming.svg"),
    accent: "#D06446",
    price: 10,
    isPaid: true,
    milestones: ["1998 年成为维修学徒", "2012 年组建社区便民服务队", "2024 年开始用小程序接单"],
    quote: "一把螺丝刀用久了，也能量出一座城市的温度。",
  },
  {
    id: "chen-yu-nurse",
    name: "陈雨",
    title: "夜班护士的温柔秩序",
    era: "1989 - 至今",
    category: "医疗与照护",
    location: "中国 成都",
    readingTime: "9 分钟",
    summary:
      "陈雨在十余年的夜班里记录下护理工作的细节：一次握手、一张便签、一个及时发现的异常指标，都可能改变一个家庭。",
    portrait: portraitAsset("chen-yu.svg"),
    accent: "#357A73",
    price: 0,
    isPaid: false,
    milestones: ["2011 年进入急诊科", "2018 年参与护理流程改造", "2025 年开设家庭照护公益课"],
    quote: "真正难的不是熬夜，而是在疲惫里仍然保持准确和耐心。",
  },
  {
    id: "wang-shufen-teacher",
    name: "王淑芬",
    title: "乡镇语文老师和她的阅读角",
    era: "1972 - 至今",
    category: "教育与乡土",
    location: "中国 河南",
    readingTime: "7 分钟",
    summary:
      "王淑芬把废弃储物间改成阅读角，用旧报纸、二手书和学生自己的故事，搭起一间小镇学校的精神客厅。",
    portrait: portraitAsset("wang-shufen.svg"),
    accent: "#6A5ACD",
    price: 15,
    isPaid: true,
    milestones: ["1994 年成为乡镇教师", "2009 年建立班级阅读角", "2023 年整理学生口述故事集"],
    quote: "孩子们先相信一本书，后来才相信远方也跟自己有关。",
  },
  {
    id: "zhao-qing-delivery",
    name: "赵青",
    title: "外卖骑手的城市路线图",
    era: "1995 - 至今",
    category: "新职业",
    location: "中国 杭州",
    readingTime: "6 分钟",
    summary:
      "赵青把每天的配送路线画在本子上，记录雨天的门牌、写字楼的电梯规律，也记录普通劳动者如何理解效率与尊严。",
    portrait: portraitAsset("zhao-qing.svg"),
    accent: "#B78628",
    price: 0,
    isPaid: false,
    milestones: ["2017 年来到杭州", "2020 年成为站点骨干", "2025 年参与骑手互助计划"],
    quote: "路线越熟，越知道每一单背后都是一个具体的人。",
  },
];

export const aiArticles: AiArticle[] = [
  {
    id: "ai-life-assistant",
    title: "AI 生活助手如何帮家庭做时间管理",
    category: "AI 应用生活",
    readingTime: "5 分钟",
    summary:
      "从日程提醒、老人用药、孩子作业计划到家庭消费记录，AI 工具正在把琐碎事务整理成可执行的生活清单。",
    price: 0,
    isPaid: false,
    cover: aiAsset("ai-assistant.svg"),
    points: ["家庭日程自动归纳", "语音提醒降低学习成本", "隐私数据需要本地化管理"],
  },
  {
    id: "ai-biography-interview",
    title: "用 AI 访谈整理普通人的生命故事",
    category: "AI 应用传记",
    readingTime: "8 分钟",
    summary:
      "AI 可以辅助设计访谈提纲、整理口述材料、标记时间线，但真正有温度的传记仍需要人与人之间的倾听。",
    price: 15,
    isPaid: true,
    cover: aiAsset("ai-biography.svg"),
    points: ["设计访谈问题清单", "从录音中提取关键节点", "人工复核决定叙事边界"],
  },
  {
    id: "ai-small-business",
    title: "小微企业如何低成本使用 AI 工具",
    category: "AI 科技资讯",
    readingTime: "6 分钟",
    summary:
      "客服回复、合同摘要、销售文案和知识库检索，是小微企业最容易落地的四类 AI 场景。",
    price: 10,
    isPaid: true,
    cover: aiAsset("ai-business.svg"),
    points: ["先从重复文本工作开始", "建立可追溯的审核流程", "把模型能力嵌入现有业务"],
  },
  {
    id: "ai-elder-care",
    title: "AI 在居家养老中的提醒与陪伴边界",
    category: "AI 应用生活",
    readingTime: "6 分钟",
    summary:
      "从用药提醒、跌倒风险提示到家庭沟通记录，AI 可以成为照护助手，但不能替代亲属和专业护理人员的判断。",
    price: 0,
    isPaid: false,
    cover: aiAsset("ai-care.svg"),
    points: ["提醒系统要足够简单", "异常信息应通知家属", "照护决策必须人工确认"],
  },
  {
    id: "ai-family-archive",
    title: "家庭影像和老照片的数字归档方法",
    category: "AI 应用传记",
    readingTime: "7 分钟",
    summary:
      "用智能工具识别照片时间、地点和人物关系，再配合人工校对，可以更快建立家庭记忆档案。",
    price: 10,
    isPaid: true,
    cover: aiAsset("ai-biography.svg"),
    points: ["先按年份粗分", "给照片补充口述说明", "敏感家庭资料需设置访问边界"],
  },
  {
    id: "ai-shop-service",
    title: "街边小店如何使用 AI 改善客户服务",
    category: "AI 科技资讯",
    readingTime: "5 分钟",
    summary:
      "菜单说明、常见问题、会员通知和活动安排，是小店最容易落地的 AI 应用场景。",
    price: 0,
    isPaid: false,
    cover: aiAsset("ai-business.svg"),
    points: ["从高频问题开始整理", "用统一口径减少沟通成本", "活动信息仍需人工审核"],
  },
  {
    id: "ai-personal-knowledge",
    title: "个人知识库如何变成可检索的第二大脑",
    category: "AI 应用生活",
    readingTime: "8 分钟",
    summary:
      "笔记、合同、票据和学习资料可以被整理成可检索的个人知识库，但分类规则比工具本身更重要。",
    price: 15,
    isPaid: true,
    cover: aiAsset("ai-knowledge.svg"),
    points: ["建立统一命名规则", "区分公开资料和隐私资料", "定期清理过期资料"],
  },
  {
    id: "ai-interview-list",
    title: "给父母做一次生命访谈，可以问什么",
    category: "AI 应用传记",
    readingTime: "6 分钟",
    summary:
      "好的访谈问题不追求宏大，而是从一顿饭、一段路、一次搬家开始，让记忆慢慢打开。",
    price: 0,
    isPaid: false,
    cover: aiAsset("ai-biography.svg"),
    points: ["从具体物件切入", "少问结论多问细节", "录音前先获得同意"],
  },
  {
    id: "ai-office-flow",
    title: "办公室日常流程的 AI 优化清单",
    category: "AI 科技资讯",
    readingTime: "7 分钟",
    summary:
      "会议纪要、项目周报、资料检索和风险提醒，是办公室最容易被 AI 改善的四个流程。",
    price: 10,
    isPaid: true,
    cover: aiAsset("ai-business.svg"),
    points: ["先定义输出格式", "保留人工复核节点", "建立团队提示词模板"],
  },
  {
    id: "ai-privacy",
    title: "普通用户使用 AI 工具的隐私注意事项",
    category: "AI 应用生活",
    readingTime: "5 分钟",
    summary:
      "不要随意上传身份证、病历、合同原件和家庭私密照片，是普通用户使用 AI 工具的第一条规则。",
    price: 0,
    isPaid: false,
    cover: aiAsset("ai-privacy.svg"),
    points: ["隐私资料先脱敏", "重要文件保留本地备份", "警惕不明插件和链接"],
  },
];

export const featuredContent = mockContents[0];
export const companyIntroImage = portraitAsset("company-archive.svg");
