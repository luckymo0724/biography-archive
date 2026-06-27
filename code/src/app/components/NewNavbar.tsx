import { BrainCircuit, Menu, Search, UserRound, X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

export type AppRoute = "home" | "contents" | "ai" | "profile" | `content:${string}` | `ai:${string}`;

type NewNavbarProps = {
  route: AppRoute;
  setRoute: Dispatch<SetStateAction<AppRoute>>;
  onAuthClick: () => void;
};

const navItems: Array<{ label: string; route: AppRoute }> = [
  { label: "首页", route: "home" },
  { label: "人物传记", route: "contents" },
  { label: "AI资讯", route: "ai" },
  { label: "个人中心", route: "profile" },
];

export function NewNavbar({ route, setRoute, onAuthClick }: NewNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function go(nextRoute: AppRoute) {
    setRoute(nextRoute);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="主导航">
        <button className="brand" onClick={() => go("home")} aria-label="回到首页">
          <BrainCircuit size={24} />
          <span>四十三智果</span>
        </button>
        <div className={menuOpen ? "nav-links open" : "nav-links"}>
          {navItems.map((item) => (
            <button
              key={item.route}
              className={route === item.route ? "active" : ""}
              onClick={() => go(item.route)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="nav-actions">
          <button className="icon-button" aria-label="搜索">
            <Search size={18} />
          </button>
          <button className="secondary-button" onClick={onAuthClick}>
            <UserRound size={17} />
            登录
          </button>
          <button
            className="icon-button menu-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="打开菜单"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
    </header>
  );
}
