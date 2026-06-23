import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { getSiteContent } from "@/lib/public.functions";
import { Sparkles, Zap, Radio } from "lucide-react";
import ankitaPhoto from "@/assets/ankita.jpg.asset.json";

const contentQO = queryOptions({ queryKey: ["content"], queryFn: () => getSiteContent() });

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "О проекте — Анкита RND" },
      { name: "description", content: "История, концепция и видение музыкального проекта Анкита RND." },
      { property: "og:title", content: "О проекте — Анкита RND" },
      { property: "og:description", content: "История и концепция проекта Анкита RND." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQO),
  component: AboutPage,
});

function AboutPage() {
  const { data: content } = useSuspenseQuery(contentQO);

  return (
    <SiteLayout>
      <PageHero title="О проекте" subtitle="Кто такая Анкита RND и какую музыку она создаёт." />

      <section className="mx-auto max-w-7xl px-4 pb-12 grid gap-10 md:grid-cols-[1fr_1.5fr]">
        <div className="relative aspect-[3/4] neon-border neon-glow overflow-hidden">
          <img src={ankitaPhoto.url} alt="Анкита RND — Оксана Глазунова" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 cyber-grid-bg opacity-30 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 font-display text-xs uppercase tracking-widest neon-text-cyan">Ankita RND</div>
        </div>
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-lg text-foreground/95 leading-relaxed">
            Музыкальный проект «Анкита RND» основан Оксаной Глазуновой — писателем, автором стихов и музыки (г. Ростов-на-Дону). Осознанные песни о душе, человеке, Вселенной.
          </p>
          <p className="text-base text-foreground/85 leading-relaxed">
            Все песни — это авторский проект от слов до музыки с аранжировкой и имеют сертификат подтверждения авторства.
          </p>
          {content.about && (
            <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
              {content.about}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 grid gap-6 md:grid-cols-3">
        {[
          { icon: Zap, title: "Электроника", text: "Синтезаторы, аналоговое тепло и цифровой импульс." },
          { icon: Radio, title: "Голос", text: "Вокал — главный инструмент. Эмоция, текстура, неон." },
          { icon: Sparkles, title: "Эстетика", text: "Киберпанк, ночные города, отражения в дожде." },
        ].map((c, i) => (
          <div key={i} className="neon-border-cyan p-6 bg-card">
            <c.icon className="neon-text-cyan mb-3" size={28} />
            <h3 className="font-display text-lg uppercase tracking-widest neon-text-pink mb-2">{c.title}</h3>
            <p className="text-sm text-muted-foreground">{c.text}</p>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
