import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { submitMessage, getSiteContent } from "@/lib/public.functions";
import { Mail, Send as Telegram, Instagram, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const contentQO = queryOptions({ queryKey: ["content"], queryFn: () => getSiteContent() });

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Контакты — Анкита RND" },
      { name: "description", content: "Связаться с проектом Анкита RND. Telegram, email, Instagram." },
      { property: "og:title", content: "Контакты — Анкита RND" },
      { property: "og:description", content: "Связаться с Анкита RND." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQO),
  component: ContactsPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(200),
  contact: z.string().trim().min(1, "Введите контакт").max(300),
  message: z.string().trim().min(1, "Введите сообщение").max(5000),
});

const inputCls =
  "w-full bg-[rgba(20,0,40,0.6)] border border-[rgba(0,240,255,0.3)] px-4 py-3 text-foreground font-body focus:outline-none focus:border-[#ff2bd6] focus:shadow-[0_0_12px_rgba(255,43,214,0.4)] transition";

function ContactsPage() {
  const { data: content } = useSuspenseQuery(contentQO);
  const submit = useServerFn(submitMessage);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Проверьте поля");
      return;
    }
    setLoading(true);
    try {
      await submit({ data: parsed.data });
      setDone(true);
      toast.success("Сообщение отправлено");
    } catch {
      toast.error("Не удалось отправить");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <PageHero title="Контакты" subtitle="Напишите напрямую или оставьте сообщение через форму." />

      <section className="mx-auto max-w-7xl px-4 pb-20 grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          <ContactRow icon={Mail} label="Email" value={content.contacts_email ?? ""} href={`mailto:${content.contacts_email}`} />
          <ContactRow icon={Telegram} label="Telegram" value={content.contacts_telegram ?? ""} href={`https://t.me/${(content.contacts_telegram ?? "").replace("@", "")}`} />
          <ContactRow icon={Instagram} label="Instagram" value={content.contacts_instagram ?? ""} href={`https://instagram.com/${(content.contacts_instagram ?? "").replace("@", "")}`} />
        </div>

        {done ? (
          <div className="neon-border-cyan p-10 text-center bg-card">
            <Check className="mx-auto mb-3 neon-text-cyan" size={40} />
            <p className="font-display uppercase tracking-widest neon-text-cyan">Сообщение отправлено</p>
          </div>
        ) : (
          <form onSubmit={handle} className="neon-border p-6 bg-card grid gap-4">
            <input name="name" placeholder="Ваше имя" required className={inputCls} />
            <input name="contact" placeholder="Telegram / Email / Телефон" required className={inputCls} />
            <textarea name="message" rows={5} placeholder="Сообщение" required className={inputCls} />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 neon-border neon-glow font-display text-sm uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />} Отправить
            </button>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}

function ContactRow({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-4 neon-border-cyan p-5 bg-card hover:neon-glow transition">
      <Icon className="neon-text-cyan" size={24} />
      <div>
        <div className="font-display text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-display text-lg neon-text-pink">{value || "—"}</div>
      </div>
    </a>
  );
}
