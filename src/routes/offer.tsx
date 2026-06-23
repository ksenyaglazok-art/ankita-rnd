import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { getSiteContent } from "@/lib/public.functions";

const contentQO = queryOptions({ queryKey: ["content"], queryFn: () => getSiteContent() });

export const Route = createFileRoute("/offer")({
  head: () => ({
    meta: [
      { title: "Публичная оферта — Анкита RND" },
      { name: "description", content: "Публичная оферта на оказание услуг по созданию песен." },
      { property: "og:title", content: "Публичная оферта" },
      { property: "og:description", content: "Условия заказа песен." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQO),
  component: OfferPage,
});

function OfferPage() {
  const { data } = useSuspenseQuery(contentQO);
  return (
    <SiteLayout>
      <PageHero title="Публичная оферта" />
      <article className="mx-auto max-w-3xl px-4 pb-20 prose prose-invert">
        <p className="whitespace-pre-line text-foreground/85 leading-relaxed">{data.offer}</p>
      </article>
    </SiteLayout>
  );
}
