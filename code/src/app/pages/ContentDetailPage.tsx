import { ArrowLeft, Clock3, LockKeyhole, MapPin, Unlock } from "lucide-react";
import { CSSProperties } from "react";
import { Dispatch, SetStateAction } from "react";
import { AppRoute } from "../components/NewNavbar";
import { mockContents } from "../data/mockContents";

type ContentDetailPageProps = {
  id: string;
  setRoute: Dispatch<SetStateAction<AppRoute>>;
  unlockedIds: string[];
  onUnlock: (id: string, title: string, price: number) => void;
};

export function ContentDetailPage({ id, setRoute, unlockedIds, onUnlock }: ContentDetailPageProps) {
  const content = mockContents.find((item) => item.id === id) ?? mockContents[0];
  const unlocked = !content.isPaid || unlockedIds.includes(content.id);

  return (
    <main className="detail-page">
      <button className="text-button back-button" onClick={() => setRoute("contents")}>
        <ArrowLeft size={17} />
        返回列表
      </button>
      <section className="detail-hero" style={{ "--accent": content.accent } as CSSProperties}>
        <div className="detail-copy">
          <p className="eyebrow">{content.category}</p>
          <h1>{content.name}</h1>
          <p className="detail-title">{content.title}</p>
          <div className="detail-meta">
            <span>
              <MapPin size={16} />
              {content.location}
            </span>
            <span>
              <Clock3 size={16} />
              {content.readingTime}
            </span>
            <span>
              {content.isPaid ? <LockKeyhole size={16} /> : <Unlock size={16} />}
              {content.isPaid ? `¥${content.price}` : "免费"}
            </span>
          </div>
        </div>
        <img src={content.portrait} alt={content.name} />
      </section>

      <section className="article-layout">
        <aside>
          <strong>{content.era}</strong>
          <p>{content.quote}</p>
        </aside>
        <article>
          <p>{content.summary}</p>
          {content.isPaid && !unlocked && (
            <div className="paywall-box">
              <LockKeyhole size={28} />
              <h2>付费阅读全文</h2>
              <p>本文包含完整时间线、人物访谈片段和编辑解读，单篇价格 ¥{content.price}。</p>
              <button
                className="primary-button"
                onClick={() => onUnlock(content.id, content.title, content.price)}
              >
                ¥{content.price} 解锁
              </button>
            </div>
          )}
          {unlocked && (
            <>
          <h2>关键节点</h2>
          <ol className="timeline">
            {content.milestones.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <h2>人物解读</h2>
          <p>
            这份档案以时间线为骨架，结合家庭处境、职业选择与城市变化，帮助读者从日常劳动里理解一个普通人的长期坚持。
          </p>
          <h2>编辑手记</h2>
          <p>
            我们保留了人物口述中的细节和语气，通过工具整理时间线、关键词和章节结构，最终由人工完成事实校对与叙事取舍。
          </p>
            </>
          )}
        </article>
      </section>
    </main>
  );
}
