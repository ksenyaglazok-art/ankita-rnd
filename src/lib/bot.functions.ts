import { createServerFn } from "@tanstack/react-start";
import { generateText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const SERVICES = {
  minus: { label: "Минусовка", price: 2000 },
  instrumental: { label: "Инструментальная музыка", price: 1500 },
  lyrics: { label: "Песня с текстом заказчика", price: 3000 },
  turnkey: { label: "Песня под ключ (текст + музыка)", price: 5000 },
} as const;

type ServiceKey = keyof typeof SERVICES;

const SYSTEM_PROMPT = `Ты — приветливый ассистент музыкального проекта «Анкита RND». Помогаешь клиенту выбрать вариант музыкальной композиции и оформить заявку. Отвечай по-русски, коротко и тепло. Используй markdown по минимуму.

Варианты услуг и цены:
- Минусовка — 2000 ₽
- Инструментальная музыка — 1500 ₽
- Песня с текстом заказчика — 3000 ₽ (клиент присылает свой текст, мы делаем музыку и вокал)
- Песня под ключ (текст + музыка) — 5000 ₽

Сценарий:
1. Узнай, что хочет клиент: инструментал, песня на свой текст или под ключ.
2. ОТДЕЛЬНЫМ вопросом уточни, нужна ли минусовка дополнительно (если он берёт песню — это +2000 ₽).
3. При необходимости спроси настроение/жанр/повод/дедлайн.
4. Озвучь итоговую стоимость (сумма выбранных позиций).
5. Спроси, оформляем ли заявку. Если клиент соглашается — вызови инструмент create_order. После оформления поблагодари и скажи, что свяжемся в ближайшее время.
6. Если у клиента трудности — помоги выбрать, объясни различия.

ВАЖНО: вызывай инструмент create_order ТОЛЬКО после явного согласия клиента ("да, оформляем", "согласен", "оформи заявку" и т.п.).`;

const requestSchema = z.object({
  sessionId: z.string().uuid().nullable(),
  lead: z
    .object({
      name: z.string().trim().min(1).max(200),
      phone: z.string().trim().min(3).max(60),
    })
    .nullable(),
  message: z.string().trim().min(1).max(4000),
});

export const botChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => requestSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Create or load session
    let sessionId = data.sessionId;
    if (!sessionId) {
      if (!data.lead) throw new Error("Lead info required for new session");
      const { data: row, error } = await supabaseAdmin
        .from("chat_sessions")
        .insert({ name: data.lead.name, phone: data.lead.phone })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      sessionId = row.id as string;
    }

    // Load session info
    const { data: session, error: sessErr } = await supabaseAdmin
      .from("chat_sessions")
      .select("id, name, phone, status, order_id")
      .eq("id", sessionId)
      .single();
    if (sessErr || !session) throw new Error("Session not found");

    // Load history
    const { data: history } = await supabaseAdmin
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    // Persist user message
    await supabaseAdmin.from("chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: data.message,
    });

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    let createdOrderId: string | null = null;

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...(history ?? [])
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: data.message },
    ];

    const result = await generateText({
      model,
      messages,
      stopWhen: stepCountIs(5),
      tools: {
        create_order: tool({
          description:
            "Создать заявку в системе после явного согласия клиента. Вызывай только после того, как клиент подтвердил оформление.",
          inputSchema: z.object({
            services: z
              .array(z.enum(["minus", "instrumental", "lyrics", "turnkey"]))
              .min(1)
              .describe("Список выбранных услуг"),
            details: z
              .string()
              .max(2000)
              .optional()
              .describe("Краткое резюме пожеланий: жанр, повод, текст, дедлайн и т.п."),
          }),
          execute: async ({ services, details }) => {
            const items = services.map((s) => SERVICES[s as ServiceKey]);
            const total = items.reduce((a, b) => a + b.price, 0);
            const isLyrics = services.includes("lyrics");
            const orderType = isLyrics ? "lyrics" : "turnkey";

            const payload = {
              source: "bot",
              services: items.map((i) => i.label),
              total_rub: total,
              details: details ?? "",
              session_id: sessionId,
            };

            const { data: orderRow, error: orderErr } = await supabaseAdmin
              .from("orders")
              .insert({
                type: orderType,
                name: session.name,
                contact: session.phone,
                payload: payload as never,
              })
              .select("id")
              .single();
            if (orderErr) return { ok: false, error: orderErr.message };

            createdOrderId = orderRow.id as string;
            await supabaseAdmin
              .from("chat_sessions")
              .update({ status: "order_placed", order_id: createdOrderId, updated_at: new Date().toISOString() })
              .eq("id", sessionId);

            return {
              ok: true,
              total_rub: total,
              services: items.map((i) => i.label),
            };
          },
        }),
      },
    });

    const reply = result.text || "Спасибо! Я свяжусь с вами в ближайшее время.";

    await supabaseAdmin.from("chat_messages").insert({
      session_id: sessionId,
      role: "assistant",
      content: reply,
    });

    return {
      sessionId,
      reply,
      orderPlaced: !!createdOrderId,
    };
  });
