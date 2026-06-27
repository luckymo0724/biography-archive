import { Bell, BookMarked, Settings, UserRound } from "lucide-react";

export function ProfilePage() {
  return (
    <main className="page-shell">
      <section className="profile-header">
        <div className="avatar">
          <UserRound size={34} />
        </div>
        <div>
          <p className="eyebrow">个人中心</p>
          <h1>继续你的阅读计划</h1>
          <p>管理收藏、订阅专题，并查看最近阅读的人物档案。</p>
        </div>
      </section>

      <section className="profile-grid">
        <article>
          <BookMarked size={24} />
          <h2>我的收藏</h2>
          <p>你已收藏 6 篇传记，其中 3 篇来自科学与技术专题。</p>
        </article>
        <article>
          <Bell size={24} />
          <h2>更新提醒</h2>
          <p>每周五推送新档案和专题时间线。</p>
        </article>
        <article>
          <Settings size={24} />
          <h2>阅读偏好</h2>
          <p>偏好领域：建筑、科学、社会思想。</p>
        </article>
      </section>
    </main>
  );
}
