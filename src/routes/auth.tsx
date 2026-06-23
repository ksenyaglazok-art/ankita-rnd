import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход — Админ-панель Анкита RND" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const inputCls =
  "w-full bg-[rgba(20,0,40,0.6)] border border-[rgba(0,240,255,0.3)] px-4 py-3 text-foreground font-body focus:outline-none focus:border-[#ff2bd6] focus:shadow-[0_0_12px_rgba(255,43,214,0.4)] transition";

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/_authenticated/admin" as never });
    });
  }, [navigate]);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    setLoading(true);
    const { error } = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    if (mode === "signup") {
      toast.success("Аккаунт создан. Если требуется — подтвердите email.");
    } else {
      toast.success("Вход выполнен");
    }
    navigate({ to: "/_authenticated/admin" as never });
  }

  return (
    <SiteLayout>
      <PageHero title="Админ-панель" subtitle="Вход для администратора сайта." />
      <section className="mx-auto max-w-md px-4 pb-20">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode("signin")} className={`flex-1 py-2 text-xs font-display uppercase tracking-widest ${mode === "signin" ? "neon-border neon-text-pink" : "border border-border text-muted-foreground"}`}>Вход</button>
          <button onClick={() => setMode("signup")} className={`flex-1 py-2 text-xs font-display uppercase tracking-widest ${mode === "signup" ? "neon-border-cyan neon-text-cyan" : "border border-border text-muted-foreground"}`}>Регистрация</button>
        </div>
        <form onSubmit={handle} className="neon-border p-6 bg-card grid gap-4">
          <input name="email" type="email" placeholder="Email" required className={inputCls} />
          <input name="password" type="password" placeholder="Пароль (мин. 6 символов)" minLength={6} required className={inputCls} />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 neon-border neon-glow font-display text-sm uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {mode === "signin" ? "Войти" : "Создать аккаунт"}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Доступ к админ-панели предоставляется только администратору.{" "}
            <Link to="/" className="neon-text-cyan underline">На главную</Link>
          </p>
        </form>
      </section>
    </SiteLayout>
  );
}
