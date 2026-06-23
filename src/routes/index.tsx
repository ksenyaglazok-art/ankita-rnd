import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { listTracks, getSiteContent } from "@/lib/public.functions";
import { Music, Mic2, Sparkles, ArrowRight } from "lucide-react";
import ankitaPhoto from "@/assets/ankita.jpg.asset.json";

const tracksQO = queryOptions({ queryKey: ["tracks"], queryFn: () => listTracks() });
const contentQO = queryOptions({ queryKey: ["content"], queryFn: () => getSiteContent() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Анкита RND — киберпанк-музыка и песни на заказ" },
      { name: "description", content: "Официальный сайт музыкального проекта Анкита RND. Слушайте треки, заказывайте песни, погружайтесь в неоновую эстетику." },
      { property: "og:title", content: "Анкита RND — киберпанк-музыка" },
      { property: "og:description", content: "Слушайте треки и заказывайте песни в неоновой эстетике." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(tracksQO);
    context.queryClient.ensureQueryData(contentQO);
  },
  component: HomePage,
});

function HomePage() {
  const { data: tracks } = useSuspenseQuery(tracksQO);
  const { data: content } = useSuspenseQuery(contentQO);
  const latest = tracks.slice(0, 3);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-20 grid gap-10 md:grid-cols-[1.2fr_1fr] items-center">
        <div>
          <div className="font-display text-xs uppercase tracking-[0.4em] neon-text-cyan mb-4">
            // музыкальный проект
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl leading-[0.9] uppercase">
            <span className="neon-text-pink">Анкита</span>
            <br />
            <span className="neon-text-cyan">RND</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/80 max-w-lg font-body">
            Электронная музыка с неоновой душой. Треки, написанные в перекрёстке голосовых волн и цифровых импульсов.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/music"
              className="inline-flex items-center gap-2 px-6 py-3 neon-border neon-glow font-display text-sm uppercase tracking-widest hover:brightness-125 transition"
            >
              <Music size={16} /> Слушать
            </Link>
            <Link
              to="/order"
              className="inline-flex items-center gap-2 px-6 py-3 neon-border-cyan font-display text-sm uppercase tracking-widest hover:brightness-125 transition"
            >
              <Mic2 size={16} /> Заказать песню
            </Link>
          </div>
        </div>

        {/* Photo */}
        <div className="relative aspect-[4/5] w-full max-w-md justify-self-center md:justify-self-end">
          <div className="absolute inset-0 neon-border neon-glow rounded-sm overflow-hidden bg-[#0a0014]">
            <img
              src={ankitaPhoto.url}
              alt="Анкита RND — портрет певицы в неоновом свете"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 cyber-grid-bg opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a0014] to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <Sparkles className="neon-text-pink" size={14} />
              <span className="font-display text-[10px] uppercase tracking-widest neon-text-cyan">Ankita RND</span>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 px-3 py-1 bg-[#ff2bd6] text-[#0a0014] font-display text-[10px] font-bold uppercase tracking-widest">
            NEON.SYS
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="mx-auto max-w-7xl px-4 py-16 border-t border-[rgba(0,240,255,0.2)]">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase neon-text-cyan">
            О проекте
          </h2>
          <div>
            <p className="text-lg text-foreground/90 font-body leading-relaxed">
              {content.about ?? "—"}
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 mt-6 text-sm font-display uppercase tracking-widest neon-text-pink hover:underline">
              Подробнее <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest tracks */}
      <section className="mx-auto max-w-7xl px-4 py-16 border-t border-[rgba(255,43,214,0.2)]">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase neon-text-pink">
            Свежие треки
          </h2>
          <Link to="/music" className="text-sm font-display uppercase tracking-widest neon-text-cyan hover:underline">
            Все песни →
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="neon-border-cyan p-8 text-center text-muted-foreground font-display uppercase tracking-widest text-sm">
            Треки скоро появятся
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {latest.map((t) => (
              <div key={t.id} className="neon-border p-5 hover:neon-glow transition bg-card">
                <div className="aspect-square bg-gradient-to-br from-[#280040] to-[#000820] mb-4 flex items-center justify-center">
                  {t.cover_url ? (
                    <img src={t.cover_url} alt={t.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="neon-text-cyan opacity-60" size={48} />
                  )}
                </div>
                <h3 className="font-display text-lg font-bold neon-text-pink">{t.title}</h3>
                {t.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="neon-border-cyan p-10 md:p-14 text-center bg-[rgba(0,40,60,0.3)]">
          <h2 className="font-display text-3xl md:text-5xl font-black uppercase neon-text-cyan">
            Своя песня. Под ключ.
          </h2>
          <p className="mt-4 text-lg text-foreground/80 max-w-xl mx-auto">
            Закажите трек на свои стихи или полностью под ключ. Подарок, признание, событие — в неоновом звуке.
          </p>
          <Link
            to="/order"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 neon-border neon-glow font-display text-sm uppercase tracking-widest hover:brightness-125 transition"
          >
            Оформить заявку <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
