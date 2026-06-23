import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { listTracks } from "@/lib/public.functions";
import { Music } from "lucide-react";

const tracksQO = queryOptions({ queryKey: ["tracks"], queryFn: () => listTracks() });

export const Route = createFileRoute("/music")({
  head: () => ({
    meta: [
      { title: "Музыка — Анкита RND" },
      { name: "description", content: "Слушайте треки Анкита RND онлайн. Электронная музыка с неоновой эстетикой." },
      { property: "og:title", content: "Музыка — Анкита RND" },
      { property: "og:description", content: "Все треки проекта Анкита RND." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(tracksQO),
  component: MusicPage,
});

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  return m?.[1] ?? null;
}

function MusicPage() {
  const { data: tracks } = useSuspenseQuery(tracksQO);

  return (
    <SiteLayout>
      <PageHero title="Музыка" subtitle="Все треки проекта. Включайте громче." />

      <section className="mx-auto max-w-7xl px-4 pb-20">
        {tracks.length === 0 ? (
          <div className="neon-border-cyan p-12 text-center">
            <Music className="mx-auto mb-3 neon-text-cyan" size={40} />
            <p className="font-display uppercase tracking-widest text-muted-foreground">
              Треки скоро появятся
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tracks.map((t) => (
              <article key={t.id} className="neon-border p-5 md:p-6 bg-card grid md:grid-cols-[160px_1fr] gap-5">
                <div className="aspect-square bg-gradient-to-br from-[#280040] to-[#000820] flex items-center justify-center">
                  {t.cover_url ? (
                    <img src={t.cover_url} alt={t.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="neon-text-cyan opacity-60" size={40} />
                  )}
                </div>
                <div className="flex flex-col">
                  <h2 className="font-display text-xl md:text-2xl font-bold neon-text-pink uppercase">{t.title}</h2>
                  {t.description && <p className="mt-1 text-sm text-foreground/80">{t.description}</p>}

                  <div className="mt-4">
                    {t.source_type === "file" && t.source_url && (
                      <audio controls className="w-full" src={t.source_url}>
                        Ваш браузер не поддерживает аудио.
                      </audio>
                    )}
                    {t.source_type === "soundcloud" && (
                      <iframe
                        width="100%"
                        height="120"
                        scrolling="no"
                        frameBorder="no"
                        allow="autoplay"
                        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(t.source_url)}&color=%23ff2bd6&inverse=true&auto_play=false&show_user=true`}
                        title={t.title}
                      />
                    )}
                    {t.source_type === "youtube" && youtubeId(t.source_url) && (
                      <div className="aspect-video">
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${youtubeId(t.source_url)}`}
                          title={t.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
