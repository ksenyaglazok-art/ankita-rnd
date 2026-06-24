import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { botChat } from "@/lib/bot.functions";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "ankita_bot_state_v1";

type Persisted = {
  sessionId: string | null;
  name: string;
  phone: string;
  messages: Msg[];
};

export function BotWidget() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chat = useServerFn(botChat);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Persisted;
        setSessionId(p.sessionId);
        setName(p.name);
        setPhone(p.phone);
        setMessages(p.messages ?? []);
        if (p.name && p.phone) setConsent(true);
      }
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    if (!sessionId) return;
    const p: Persisted = { sessionId, name, phone, messages };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }, [sessionId, name, phone, messages]);

  // Scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const started = !!sessionId;

  async function start(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !consent) {
      toast.error("Заполните имя, телефон и согласитесь с политикой");
      return;
    }
    setSending(true);
    try {
      const greet = "Здравствуйте! Хочу заказать музыку.";
      const userMsg: Msg = { role: "user", content: greet };
      setMessages([userMsg]);
      const res = await chat({
        data: {
          sessionId: null,
          lead: { name: name.trim(), phone: phone.trim() },
          message: greet,
        },
      });
      setSessionId(res.sessionId);
      setMessages([userMsg, { role: "assistant", content: res.reply }]);
    } catch (err) {
      toast.error("Не удалось запустить чат");
      setMessages([]);
    } finally {
      setSending(false);
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !sessionId || sending) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    try {
      const res = await chat({
        data: { sessionId, lead: null, message: text },
      });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      if (res.orderPlaced) {
        toast.success("Заявка оформлена!");
      }
    } catch {
      toast.error("Ошибка отправки. Попробуйте ещё раз.");
      setMessages((m) => [...m, { role: "assistant", content: "Извините, произошла ошибка. Попробуйте позже." }]);
    } finally {
      setSending(false);
    }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setSessionId(null);
    setMessages([]);
    setInput("");
    setName("");
    setPhone("");
    setConsent(false);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Открыть чат с ботом"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3 neon-border-cyan neon-glow bg-card font-display text-xs uppercase tracking-widest hover:brightness-125 transition"
        >
          <Bot size={18} className="neon-text-cyan" />
          <span className="neon-text-cyan">Бот</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-2rem))] flex flex-col neon-border-cyan bg-card shadow-[0_0_30px_rgba(0,240,255,0.3)]">
          <header className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,240,255,0.3)]">
            <div className="flex items-center gap-2">
              <Bot className="neon-text-cyan" size={18} />
              <span className="font-display text-xs uppercase tracking-widest neon-text-cyan">Ассистент Анкита</span>
            </div>
            <div className="flex items-center gap-2">
              {started && (
                <button
                  onClick={reset}
                  className="text-[10px] uppercase tracking-widest text-muted-foreground hover:neon-text-pink transition"
                  title="Начать заново"
                >
                  Сброс
                </button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Закрыть">
                <X size={18} className="text-muted-foreground hover:neon-text-pink transition" />
              </button>
            </div>
          </header>

          {!started ? (
            <form onSubmit={start} className="flex-1 overflow-auto p-4 flex flex-col gap-3">
              <p className="text-xs text-foreground/80">
                Я помогу подобрать вариант композиции и оформить заявку. Сначала познакомимся.
              </p>
              <div>
                <label className="block font-display text-[10px] uppercase tracking-widest text-foreground/80 mb-1">Имя</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[rgba(20,0,40,0.6)] border border-[rgba(0,240,255,0.3)] px-3 py-2 text-sm focus:outline-none focus:border-[#ff2bd6]"
                />
              </div>
              <div>
                <label className="block font-display text-[10px] uppercase tracking-widest text-foreground/80 mb-1">Телефон</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  type="tel"
                  placeholder="+7 ..."
                  className="w-full bg-[rgba(20,0,40,0.6)] border border-[rgba(0,240,255,0.3)] px-3 py-2 text-sm focus:outline-none focus:border-[#ff2bd6]"
                />
              </div>
              <label className="flex items-start gap-2 text-xs text-foreground/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-[#ff2bd6]"
                />
                <span>
                  Согласен с <a href="/privacy" target="_blank" className="neon-text-cyan underline">политикой конфиденциальности</a>
                </span>
              </label>
              <button
                type="submit"
                disabled={sending}
                className="mt-auto px-4 py-3 neon-border neon-glow font-display text-xs uppercase tracking-widest hover:brightness-125 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : null}
                Начать диалог
              </button>
            </form>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "ml-auto bg-[rgba(255,43,214,0.15)] border border-[rgba(255,43,214,0.4)] text-foreground"
                        : "mr-auto bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.3)] text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {sending && (
                  <div className="mr-auto px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" /> печатает...
                  </div>
                )}
              </div>
              <form onSubmit={send} className="border-t border-[rgba(0,240,255,0.3)] p-3 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ваше сообщение..."
                  disabled={sending}
                  className="flex-1 bg-[rgba(20,0,40,0.6)] border border-[rgba(0,240,255,0.3)] px-3 py-2 text-sm focus:outline-none focus:border-[#ff2bd6]"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  aria-label="Отправить"
                  className="px-3 neon-border-cyan hover:neon-glow disabled:opacity-50 flex items-center justify-center"
                >
                  <Send size={16} className="neon-text-cyan" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
