import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { listPhotos, listVideos } from "@/lib/public.functions";
import { Image, Film, X } from "lucide-react";

const photosQO = queryOptions({ queryKey: ["photos"], queryFn: () => listPhotos() });
const videosQO = queryOptions({ queryKey: ["videos"], queryFn: () => listVideos() });

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Галерея — Анкита RND" },
      { name: "description", content: "Фотографии и видео музыкального проекта Анкита RND." },
      { property: "og:title", content: "Галерея — Анкита RND" },
      { property: "og:description", content: "Фото и видео Анкита RND." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(photosQO);
    context.queryClient.ensureQueryData(videosQO);
  },
  component: GalleryPage,
});

function youtubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  return m?.[1] ?? null;
}

function GalleryPage() {
  const { data: photos } = useSuspenseQuery(photosQO);
  const { data: videos } = useSuspenseQuery(videosQO);
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <SiteLayout>
      <PageHero title="Галерея" subtitle="Фото и видео из мира Анкита RND." />

      <div className="mx-auto max-w-7xl px-4 mb-8 flex gap-2">
        <TabBtn active={tab === "photos"} onClick={() => setTab("photos")} icon={Image} label="Фото" />
        <TabBtn active={tab === "videos"} onClick={() => setTab("videos")} icon={Film} label="Видео" />
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        {tab === "photos" ? (
          photos.length === 0 ? (
            <Empty text="Фотографии скоро появятся" />
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {photos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setLightbox(p.url)}
                  className="block w-full break-inside-avoid neon-border hover:neon-glow transition overflow-hidden"
                >
                  <img src={p.url} alt={p.caption ?? ""} className="w-full h-auto" loading="lazy" />
                  {p.caption && (
                    <div className="px-3 py-2 text-xs text-muted-foreground bg-card">{p.caption}</div>
                  )}
                </button>
              ))}
            </div>
          )
        ) : videos.length === 0 ? (
          <Empty text="Видео скоро появятся" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((v) => (
              <div key={v.id} className="neon-border-cyan bg-card overflow-hidden">
                <div className="aspect-video bg-black">
                  {v.provider === "youtube" && youtubeId(v.url) ? (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${youtubeId(v.url)}`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <iframe className="w-full h-full" src={v.url} title={v.title} allowFullScreen />
                  )}
                </div>
                <div className="p-4 font-display text-sm uppercase tracking-widest neon-text-cyan">{v.title}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setLightbox(null)}
            aria-label="Закрыть"
          >
            <X size={28} />
          </button>
          <img src={lightbox} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </SiteLayout>
  );
}

function TabBtn({
  active, onClick, icon: Icon, label,
}: { active: boolean; onClick: () => void; icon: typeof Image; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 font-display uppercase tracking-widest text-sm flex items-center gap-2 transition ${
        active ? "neon-border neon-text-pink" : "border border-border text-muted-foreground hover:neon-text-cyan"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="neon-border-cyan p-12 text-center font-display uppercase tracking-widest text-muted-foreground">
      {text}
    </div>
  );
}
