import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Главная" },
  { to: "/about", label: "О проекте" },
  { to: "/music", label: "Музыка" },
  { to: "/order", label: "Заказать" },
  { to: "/gallery", label: "Галерея" },
  { to: "/contacts", label: "Контакты" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(255,43,214,0.3)] bg-[rgba(10,0,20,0.85)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="font-display text-xl font-black tracking-widest neon-text-pink">
          АНКИТА<span className="neon-text-cyan ml-1">RND</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="font-display text-xs uppercase tracking-widest text-foreground/80 transition hover:neon-text-cyan"
              activeProps={{ className: "neon-text-pink" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[rgba(255,43,214,0.2)] bg-[rgba(10,0,20,0.95)]">
          <nav className="flex flex-col px-4 py-4 gap-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="font-display text-sm uppercase tracking-widest text-foreground/80"
                activeProps={{ className: "neon-text-pink" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
