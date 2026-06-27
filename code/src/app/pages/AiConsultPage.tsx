import { ArrowLeft, Clock3, LockKeyhole, MessageSquareText, Unlock } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { AppRoute } from "../components/NewNavbar";
import { aiArticles } from "../data/mockContents";

type AiConsultPageProps = {
  setRoute: Dispatch<SetStateAction<AppRoute>>;
  selectedId?: string;
  unlockedIds: string[];
  onUnlock: (id: string, title: string, price: number) => void;
};

export function AiConsultPage({ setRoute, selectedId, unlockedIds, onUnlock }: AiConsultPageProps) {
  const selected = selectedId ? aiArticles.find((item) => item.id === selectedId) : undefined;

  if (selected) {
    const unlocked = !selected.isPaid || unlockedIds.includes(selected.id);

    return (
      <main className="detail-page">
        <button className="text-button back-button" onClick={() => setRoute("ai")}>
          <ArrowLeft size={17} />
          返回 AI 资讯
        </button>
        <section className="detail-hero ai-detail">
          <div className="detail-copy">
            <p className="eyebrow">{selected.category}</p>
            <h1>{selected.title}</h1>
            <p className="detail-title">{selected.summary}</p>
            <div className="detail-meta">
              <span>
                <Clock3 size={16} />
                {selected.readingTime}
              </span>
              <span>
                {selected.isPaid ? <LockKeyhole size={16} /> : <Unlock size={16} />}
                {selected.isPaid ? `¥${selected.price}` : "免费"}
              </span>
            </div>
          </div>
          <img src={selected.cover} alt={selected.title} />
        </section>

        <section className="article-layout">
          <aside>
            <strong>AI 咨询</strong>
            <p>北京四十三智果科技有限公司提供 AI 应用场景梳理、知识管理咨询和人物传记数字化方案。</p>
          </aside>
          <article>
            <p>{selected.summary}</p>
            {selected.isPaid && !unlocked ? (
              <div className="paywall-box">
                <LockKeyhole size={28} />
                <h2>付费阅读专题全文</h2>
                <p>本篇包含应用方法、落地步骤和风险清单，单篇价格 ¥{selected.price}。</p>
                <button
                  className="primary-button"
                  onClick={() => onUnlock(selected.id, selected.title, selected.price)}
                >
                  ¥{selected.price} 解锁
                </button>
              </div>
            ) : (
              <>
                <h2>重点内容</h2>
                <ol className="timeline">
                  {selected.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ol>
                <h2>咨询建议</h2>
                <p>
                  建议先选择一个高频、低风险、容易验证的场景试点，例如资料整理、访谈提纲、客服草稿或家庭清单，再逐步建立审核和反馈机制。
                </p>
              </>
            )}
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-intro ai-intro">
        <p className="eyebrow">
          <MessageSquareText size={16} />
          AI 咨询与资讯
        </p>
        <h1>AI 科技如何进入生活、企业和人物传记</h1>
        <p>
          这里发布 AI 应用生活、AI 应用传记和小微企业 AI 落地资讯。部分文章免费开放，深度方法文章采用单篇付费阅读。
        </p>
      </section>

      <section className="ai-grid ai-grid-wide">
        {aiArticles.map((article) => (
          <button className="ai-card" key={article.id} onClick={() => setRoute(`ai:${article.id}`)}>
            <img src={article.cover} alt={article.title} />
            <div>
              <span>{article.category}</span>
              <h2>{article.title}</h2>
              <p>{article.summary}</p>
              <small>
                <Clock3 size={14} />
                {article.readingTime}
              </small>
              <em className={article.isPaid ? "price-tag paid" : "price-tag free"}>
                {article.isPaid ? `¥${article.price}` : "免费"}
              </em>
            </div>
          </button>
        ))}
      </section>
    </main>
  );
}
