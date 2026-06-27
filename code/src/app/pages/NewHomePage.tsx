import { ArrowRight, Building2, Cpu, ShieldCheck, Sparkles } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { AppRoute } from "../components/NewNavbar";
import { aiArticles, companyIntroImage, featuredContent, mockContents } from "../data/mockContents";

type NewHomePageProps = {
  setRoute: Dispatch<SetStateAction<AppRoute>>;
};

export function NewHomePage({ setRoute }: NewHomePageProps) {
  return (
    <main>
      <section className="hero-section company-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={16} />
            AI 咨询与知识服务
          </p>
          <h1>北京四十三智果科技有限公司</h1>
          <p className="hero-lede">
            我们专注于 AI 应用咨询、知识内容服务和数字传记平台建设，帮助个人与组织更好地理解技术、管理资料、沉淀经验与生活记录。
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setRoute("ai")}>
              查看 AI 咨询
              <ArrowRight size={18} />
            </button>
            <button className="text-button" onClick={() => setRoute("contents")}>
              阅读人物传记
            </button>
          </div>
        </div>
        <article className="feature-panel company-panel">
          <img src={companyIntroImage} alt="北京四十三智果科技有限公司内容服务展示" />
          <div>
            <span>数字传记平台</span>
            <h2>普通人的生命故事，也值得被认真记录</h2>
            <p>
              我们以访谈、人工编辑和结构化时间线为基础，为家庭、社区和企业沉淀真实、有温度的人物档案。
            </p>
          </div>
        </article>
      </section>

      <section className="home-band">
        <div className="section-heading">
          <p className="eyebrow">业务方向</p>
          <h2>让技术服务真实生活与组织知识</h2>
        </div>
        <div className="service-grid">
          <article>
            <Cpu size={28} />
            <h3>AI 应用咨询</h3>
            <p>面向家庭、小微企业和团队，提供 AI 工具选型、流程设计、风险提示和应用落地建议。</p>
          </article>
          <article>
            <Building2 size={28} />
            <h3>人物传记产品</h3>
            <p>把访谈、照片、时间线与文字资料整理成可阅读、可收藏、可付费解锁的数字传记。</p>
          </article>
          <article>
            <ShieldCheck size={28} />
            <h3>知识内容服务</h3>
            <p>围绕 AI 科技、生活效率和企业管理，提供清晰、实用、可持续更新的知识资讯。</p>
          </article>
        </div>
      </section>

      <section className="home-band split-band">
        <div>
          <p className="eyebrow">精选传记</p>
          <h2>{featuredContent.title}</h2>
          <p>{featuredContent.summary}</p>
          <button className="primary-button" onClick={() => setRoute(`content:${featuredContent.id}`)}>
            ¥{featuredContent.price} 阅读全文
          </button>
        </div>
        <div>
          <p className="eyebrow">AI 资讯</p>
          <h2>{aiArticles[0].title}</h2>
          <p>{aiArticles[0].summary}</p>
          <button className="secondary-button" onClick={() => setRoute("ai")}>
            进入 AI 咨询模块
          </button>
        </div>
      </section>

      <section className="insight-strip">
        <div>
          <span>{mockContents.length}</span>
          <p>篇普通人传记</p>
        </div>
        <div>
          <span>{aiArticles.length}</span>
          <p>篇 AI 应用资讯</p>
        </div>
        <div>
          <span>10-15</span>
          <p>元单篇阅读价格</p>
        </div>
      </section>
    </main>
  );
}
