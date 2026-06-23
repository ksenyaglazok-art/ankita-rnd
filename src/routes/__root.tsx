import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CyberBg } from "../components/site/CyberBg";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <CyberBg />
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-black neon-text-pink animate-neon-pulse">404</h1>
        <h2 className="mt-4 font-display text-xl neon-text-cyan uppercase tracking-widest">
          Сигнал потерян
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Эта страница не существует в матрице.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 neon-border font-display text-sm uppercase tracking-widest hover:neon-glow transition"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <CyberBg />
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl neon-text-pink uppercase tracking-widest">
          Системный сбой
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Что-то пошло не так. Попробуйте обновить или вернуться на главную.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="px-4 py-2 neon-border font-display text-xs uppercase tracking-widest hover:neon-glow transition"
          >
            Перезапуск
          </button>
          <a href="/" className="px-4 py-2 neon-border-cyan font-display text-xs uppercase tracking-widest">
            Главная
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Анкита RND — киберпанк-музыка" },
      { name: "description", content: "Музыкальный проект Анкита RND: оригинальная музыка, песни на заказ, неоновая эстетика." },
      { name: "author", content: "Ankita RND" },
      { property: "og:title", content: "Анкита RND — киберпанк-музыка" },
      { property: "og:description", content: "Музыкальный проект Анкита RND: оригинальная музыка, песни на заказ, неоновая эстетика." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Анкита RND — киберпанк-музыка" },
      { name: "twitter:description", content: "Музыкальный проект Анкита RND: оригинальная музыка, песни на заказ, неоновая эстетика." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/wSXMOehjTPOqsRl1KDL2BoSWIgq2/social-images/social-1782240337367-ankita.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/wSXMOehjTPOqsRl1KDL2BoSWIgq2/social-images/social-1782240337367-ankita.webp" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CyberBg />
      <Outlet />
      <Toaster theme="dark" />
    </QueryClientProvider>
  );
}
