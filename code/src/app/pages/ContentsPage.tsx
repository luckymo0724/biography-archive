import { Filter, LockKeyhole, Search, Unlock } from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { AppRoute } from "../components/NewNavbar";
import { mockContents } from "../data/mockContents";

type ContentsPageProps = {
  setRoute: Dispatch<SetStateAction<AppRoute>>;
};

export function ContentsPage({ setRoute }: ContentsPageProps) {
  const [query, setQuery] = useState("");
  const categories = ["全部", ...Array.from(new Set(mockContents.map((item) => item.category)))];
  const [category, setCategory] = useState("全部");

  const filtered = useMemo(
    () =>
      mockContents.filter((item) => {
        const inCategory = category === "全部" || item.category === category;
        const inQuery = `${item.name} ${item.title} ${item.summary}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return inCategory && inQuery;
      }),
    [category, query]
  );

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="eyebrow">传记列表</p>
        <h1>按领域、时代和关键词筛选人物</h1>
      </section>

      <section className="toolbar">
        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索人物、作品或主题"
          />
        </label>
        <div className="filter-row">
          <Filter size={18} />
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="content-list">
        {filtered.map((item) => (
          <button
            className="content-row"
            key={item.id}
            onClick={() => setRoute(`content:${item.id}`)}
          >
            <img src={item.portrait} alt={item.name} />
            <div className="content-row-copy">
              <span>{item.category}</span>
              <h2>{item.name}</h2>
              <p>{item.summary}</p>
            </div>
            <div className="content-row-meta">
              <strong>{item.era}</strong>
              <small>{item.readingTime}</small>
              <em className={item.isPaid ? "price-tag paid" : "price-tag free"}>
                {item.isPaid ? (
                  <>
                    <LockKeyhole size={13} /> ¥{item.price}
                  </>
                ) : (
                  <>
                    <Unlock size={13} /> 免费
                  </>
                )}
              </em>
            </div>
          </button>
        ))}
      </section>
    </main>
  );
}
