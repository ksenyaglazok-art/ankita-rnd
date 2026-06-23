import { Link } from "@tanstack/react-router";
import { ExternalLink as MaxIcon, Send, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[rgba(0,240,255,0.25)] bg-[rgba(10,0,20,0.7)]">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-display text-lg font-black tracking-widest neon-text-pink">
            АНКИТА <span className="neon-text-cyan">RND</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Музыкальный проект на стыке электроники и киберпанк-эстетики.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest neon-text-cyan mb-3">
            Разделы
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:neon-text-pink">О проекте</Link></li>
            <li><Link to="/music" className="hover:neon-text-pink">Музыка</Link></li>
            <li><Link to="/order" className="hover:neon-text-pink">Заказать песню</Link></li>
            <li><Link to="/gallery" className="hover:neon-text-pink">Галерея</Link></li>
            <li><Link to="/contacts" className="hover:neon-text-pink">Контакты</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest neon-text-cyan mb-3">
            Документы
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:neon-text-pink">Политика конфиденциальности</Link></li>
            <li><Link to="/offer" className="hover:neon-text-pink">Публичная оферта</Link></li>
            <li><Link to="/auth" className="text-muted-foreground hover:neon-text-cyan">Вход для администратора</Link></li>
          </ul>
          <div className="flex gap-4 mt-4 text-foreground/80">
            <a href="#" aria-label="Telegram"><Send size={18} className="hover:neon-text-cyan" /></a>
            <a href="#" aria-label="Instagram"><Instagram size={18} className="hover:neon-text-pink" /></a>
            <a href="#" aria-label="Email"><Mail size={18} className="hover:neon-text-cyan" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-[rgba(255,43,214,0.15)] py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} АНКИТА RND. Все права защищены.
      </div>
    </footer>
  );
}
