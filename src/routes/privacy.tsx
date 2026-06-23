import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { getSiteContent } from "@/lib/public.functions";

const contentQO = queryOptions({ queryKey: ["content"], queryFn: () => getSiteContent() });

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Политика конфиденциальности — Анкита RND" },
      { name: "description", content: "Политика конфиденциальности сайта Анкита RND." },
      { property: "og:title", content: "Политика конфиденциальности" },
      { property: "og:description", content: "Политика обработки персональных данных." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQO),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { data } = useSuspenseQuery(contentQO);
  return (
    <SiteLayout>
      <PageHero title="Политика конфиденциальности" />
      <article className="mx-auto max-w-3xl px-4 pb-20 prose prose-invert">
        <p className="whitespace-pre-line text-foreground/85 leading-relaxed">{data.privacy}</p>
      </article>
    </SiteLayout>
  );
}
