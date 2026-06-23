import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { submitOrder } from "@/lib/public.functions";
import { Mic2, FileText, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "Заказать песню — Анкита RND" },
      { name: "description", content: "Закажите песню на свои стихи или полностью под ключ. Индивидуальный музыкальный проект." },
      { property: "og:title", content: "Заказать песню — Анкита RND" },
      { property: "og:description", content: "Песня на свои стихи или под ключ от Анкита RND." },
    ],
  }),
  component: OrderPage,
});

type OrderType = "lyrics" | "turnkey";

const baseFields = z.object({
  name: z.string().trim().min(1, "Введите имя").max(200),
  contact: z.string().trim().min(1, "Введите контакт").max(300),
  consent: z.literal(true, { errorMap: () => ({ message: "Подтвердите согласие" }) }),
});

function OrderPage() {
  const [type, setType] = useState<OrderType>("lyrics");

  return (
    <SiteLayout>
      <PageHero
        title="Заказать песню"
        subtitle="Два формата: песня на ваши стихи или полностью под ключ — от идеи до готового трека."
      />

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <button
            onClick={() => setType("lyrics")}
            className={`p-5 text-left transition ${
              type === "lyrics" ? "neon-border neon-glow bg-card" : "border border-border bg-card/40 hover:neon-border"
            }`}
          >
            <FileText className={type === "lyrics" ? "neon-text-pink mb-2" : "text-muted-foreground mb-2"} />
            <div className="font-display uppercase tracking-widest text-sm">На свои стихи</div>
            <p className="text-xs text-muted-foreground mt-1">Вы присылаете текст — мы делаем музыку и вокал.</p>
          </button>
          <button
            onClick={() => setType("turnkey")}
            className={`p-5 text-left transition ${
              type === "turnkey" ? "neon-border-cyan neon-glow bg-card" : "border border-border bg-card/40 hover:neon-border-cyan"
            }`}
          >
            <Mic2 className={type === "turnkey" ? "neon-text-cyan mb-2" : "text-muted-foreground mb-2"} />
            <div className="font-display uppercase tracking-widest text-sm">Под ключ</div>
            <p className="text-xs text-muted-foreground mt-1">Идея, текст, музыка и финальный мастер.</p>
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24">
        {type === "lyrics" ? <LyricsForm /> : <TurnkeyForm />}
      </section>
    </SiteLayout>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-display text-xs uppercase tracking-widest text-foreground/80 mb-2">
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-[rgba(20,0,40,0.6)] border border-[rgba(0,240,255,0.3)] px-4 py-3 text-foreground font-body focus:outline-none focus:border-[#ff2bd6] focus:shadow-[0_0_12px_rgba(255,43,214,0.4)] transition";

function LyricsForm() {
  const submit = useServerFn(submitOrder);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form) as Record<string, string>;
    const parsed = baseFields.extend({
      title: z.string().max(300).optional(),
      lyrics: z.string().trim().min(10, "Текст должен быть не короче 10 символов").max(10000),
      mood: z.string().max(200).optional(),
      wishes: z.string().max(2000).optional(),
      deadline: z.string().max(100).optional(),
      budget: z.string().max(100).optional(),
    }).safeParse({ ...raw, consent: raw.consent === "on" });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Проверьте поля");
      return;
    }
    setLoading(true);
    try {
      await submit({
        data: {
          type: "lyrics",
          name: parsed.data.name,
          contact: parsed.data.contact,
          payload: {
            title: parsed.data.title ?? "",
            lyrics: parsed.data.lyrics,
            mood: parsed.data.mood ?? "",
            wishes: parsed.data.wishes ?? "",
            deadline: parsed.data.deadline ?? "",
            budget: parsed.data.budget ?? "",
          },
        },
      });
      setDone(true);
      toast.success("Заявка отправлена. Я свяжусь с вами.");
    } catch (err) {
      toast.error("Не удалось отправить. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  if (done) return <SuccessCard />;

  return (
    <form onSubmit={handle} className="neon-border p-6 md:p-8 bg-card grid gap-5">
      <h2 className="font-display text-2xl font-bold neon-text-pink uppercase">Песня на свои стихи</h2>
      <Row>
        <div><FieldLabel>Ваше имя *</FieldLabel><input name="name" required className={inputCls} /></div>
        <div><FieldLabel>Контакт (Telegram / телефон / email) *</FieldLabel><input name="contact" required className={inputCls} /></div>
      </Row>
      <div><FieldLabel>Название песни</FieldLabel><input name="title" className={inputCls} /></div>
      <div><FieldLabel>Текст стихов *</FieldLabel><textarea name="lyrics" required rows={8} className={inputCls} placeholder="Вставьте полный текст вашей песни..." /></div>
      <Row>
        <div><FieldLabel>Жанр / настроение</FieldLabel><input name="mood" className={inputCls} placeholder="напр. поп, баллада, лирика" /></div>
        <div><FieldLabel>Бюджет</FieldLabel><input name="budget" className={inputCls} /></div>
      </Row>
      <Row>
        <div><FieldLabel>Желаемый дедлайн</FieldLabel><input name="deadline" className={inputCls} /></div>
        <div><FieldLabel>Дополнительные пожелания</FieldLabel><input name="wishes" className={inputCls} /></div>
      </Row>
      <ConsentSubmit loading={loading} />
    </form>
  );
}

function TurnkeyForm() {
  const submit = useServerFn(submitOrder);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form) as Record<string, string>;
    const parsed = baseFields.extend({
      occasion: z.string().max(300).optional(),
      for_whom: z.string().max(300).optional(),
      idea: z.string().trim().min(10, "Опишите идею подробнее").max(5000),
      references: z.string().max(2000).optional(),
      wishes: z.string().max(2000).optional(),
      deadline: z.string().max(100).optional(),
      budget: z.string().max(100).optional(),
    }).safeParse({ ...raw, consent: raw.consent === "on" });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Проверьте поля");
      return;
    }
    setLoading(true);
    try {
      await submit({
        data: {
          type: "turnkey",
          name: parsed.data.name,
          contact: parsed.data.contact,
          payload: {
            occasion: parsed.data.occasion ?? "",
            for_whom: parsed.data.for_whom ?? "",
            idea: parsed.data.idea,
            references: parsed.data.references ?? "",
            wishes: parsed.data.wishes ?? "",
            deadline: parsed.data.deadline ?? "",
            budget: parsed.data.budget ?? "",
          },
        },
      });
      setDone(true);
      toast.success("Заявка отправлена!");
    } catch {
      toast.error("Не удалось отправить.");
    } finally {
      setLoading(false);
    }
  }

  if (done) return <SuccessCard />;

  return (
    <form onSubmit={handle} className="neon-border-cyan p-6 md:p-8 bg-card grid gap-5">
      <h2 className="font-display text-2xl font-bold neon-text-cyan uppercase">Песня под ключ</h2>
      <Row>
        <div><FieldLabel>Ваше имя *</FieldLabel><input name="name" required className={inputCls} /></div>
        <div><FieldLabel>Контакт *</FieldLabel><input name="contact" required className={inputCls} /></div>
      </Row>
      <Row>
        <div><FieldLabel>Повод</FieldLabel><input name="occasion" className={inputCls} placeholder="день рождения, свадьба, корпоратив..." /></div>
        <div><FieldLabel>Для кого песня</FieldLabel><input name="for_whom" className={inputCls} /></div>
      </Row>
      <div><FieldLabel>Описание идеи *</FieldLabel><textarea name="idea" required rows={6} className={inputCls} placeholder="О чём песня, какой посыл, ключевые моменты..." /></div>
      <div><FieldLabel>Референсы (ссылки на песни)</FieldLabel><textarea name="references" rows={3} className={inputCls} /></div>
      <Row>
        <div><FieldLabel>Дедлайн</FieldLabel><input name="deadline" className={inputCls} /></div>
        <div><FieldLabel>Бюджет</FieldLabel><input name="budget" className={inputCls} /></div>
      </Row>
      <div><FieldLabel>Пожелания</FieldLabel><input name="wishes" className={inputCls} /></div>
      <ConsentSubmit loading={loading} />
    </form>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

function ConsentSubmit({ loading }: { loading: boolean }) {
  return (
    <>
      <label className="flex items-start gap-3 text-sm text-foreground/80 cursor-pointer">
        <input type="checkbox" name="consent" required className="mt-1 accent-[#ff2bd6]" />
        <span>
          Согласен с <a href="/offer" className="neon-text-cyan underline">офертой</a> и{" "}
          <a href="/privacy" className="neon-text-cyan underline">политикой конфиденциальности</a>.
        </span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="mt-2 px-8 py-4 neon-border neon-glow font-display text-sm uppercase tracking-widest hover:brightness-125 disabled:opacity-60 transition flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        Отправить заявку
      </button>
    </>
  );
}

function SuccessCard() {
  return (
    <div className="neon-border-cyan p-12 text-center bg-card">
      <Check className="mx-auto mb-4 neon-text-cyan" size={48} />
      <h3 className="font-display text-2xl uppercase neon-text-cyan tracking-widest">Заявка отправлена</h3>
      <p className="mt-2 text-muted-foreground">Я свяжусь с вами в ближайшее время.</p>
    </div>
  );
}
