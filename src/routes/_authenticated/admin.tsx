import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import {
  adminListOrders, adminUpdateOrder, adminDeleteOrder,
  adminListMessages, adminMarkMessageRead, adminDeleteMessage,
  adminSaveTrack, adminDeleteTrack,
  adminSavePhoto, adminDeletePhoto,
  adminSaveVideo, adminDeleteVideo,
  adminSaveContent,
} from "@/lib/admin.functions";
import { listTracks, listPhotos, listVideos, getSiteContent } from "@/lib/public.functions";
import { LogOut, Trash2, Check, Plus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Админ-панель — Анкита RND" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const TABS = ["orders", "messages", "tracks", "photos", "videos", "content"] as const;
type Tab = typeof TABS[number];

const TAB_LABELS: Record<Tab, string> = {
  orders: "Заявки",
  messages: "Сообщения",
  tracks: "Треки",
  photos: "Фото",
  videos: "Видео",
  content: "Тексты",
};

function AdminPage() {
  const [tab, setTab] = useState<Tab>("orders");
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="font-display text-3xl font-black uppercase neon-text-pink">Админ-панель</h1>
          <button onClick={logout} className="px-4 py-2 border border-border text-sm font-display uppercase tracking-widest hover:neon-text-pink flex items-center gap-2">
            <LogOut size={14} /> Выход
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-display uppercase text-xs tracking-widest transition ${
                tab === t ? "neon-text-pink border-b-2 border-[#ff2bd6]" : "text-muted-foreground hover:neon-text-cyan"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {tab === "orders" && <OrdersTab />}
        {tab === "messages" && <MessagesTab />}
        {tab === "tracks" && <TracksTab />}
        {tab === "photos" && <PhotosTab />}
        {tab === "videos" && <VideosTab />}
        {tab === "content" && <ContentTab />}
      </div>
    </div>
  );
}

// -------------- ORDERS ---------------
function OrdersTab() {
  const list = useServerFn(adminListOrders);
  const update = useServerFn(adminUpdateOrder);
  const del = useServerFn(adminDeleteOrder);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => list() });

  const updateM = useMutation({
    mutationFn: update,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Обновлено"); },
  });
  const delM = useMutation({
    mutationFn: del,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Удалено"); },
  });

  if (isLoading) return <Loading />;
  if (!data?.length) return <Empty text="Заявок пока нет" />;

  return (
    <div className="grid gap-4">
      {data.map((o: any) => (
        <div key={o.id} className="neon-border p-5 bg-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-display text-xs uppercase tracking-widest neon-text-cyan">
                {o.type === "lyrics" ? "На свои стихи" : "Под ключ"} · {new Date(o.created_at).toLocaleString("ru-RU")}
              </div>
              <div className="mt-1 font-display text-lg font-bold">{o.name}</div>
              <div className="text-sm text-muted-foreground">{o.contact}</div>
            </div>
            <div className="flex gap-2">
              <select
                value={o.status}
                onChange={(e) => updateM.mutate({ data: { id: o.id, status: e.target.value as any } })}
                className="bg-[rgba(20,0,40,0.6)] border border-border px-2 py-1 text-xs font-display uppercase"
              >
                <option value="new">Новая</option>
                <option value="in_progress">В работе</option>
                <option value="done">Готово</option>
                <option value="rejected">Отказ</option>
              </select>
              <button onClick={() => { if (confirm("Удалить заявку?")) delM.mutate({ data: { id: o.id } }); }} className="p-2 hover:neon-text-pink">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer font-display text-xs uppercase tracking-widest neon-text-cyan">Детали заявки</summary>
            <pre className="mt-3 text-xs whitespace-pre-wrap bg-[rgba(0,0,0,0.4)] p-3 border border-border overflow-auto">
              {JSON.stringify(o.payload, null, 2)}
            </pre>
            <textarea
              placeholder="Заметки администратора"
              defaultValue={o.admin_notes ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (o.admin_notes ?? "")) {
                  updateM.mutate({ data: { id: o.id, admin_notes: e.target.value } });
                }
              }}
              rows={3}
              className="mt-3 w-full bg-[rgba(20,0,40,0.6)] border border-border px-3 py-2 text-sm"
            />
          </details>
        </div>
      ))}
    </div>
  );
}

// -------------- MESSAGES ---------------
function MessagesTab() {
  const list = useServerFn(adminListMessages);
  const mark = useServerFn(adminMarkMessageRead);
  const del = useServerFn(adminDeleteMessage);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-msgs"], queryFn: () => list() });
  const markM = useMutation({ mutationFn: mark, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-msgs"] }) });
  const delM = useMutation({ mutationFn: del, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-msgs"] }) });

  if (isLoading) return <Loading />;
  if (!data?.length) return <Empty text="Сообщений нет" />;

  return (
    <div className="grid gap-4">
      {data.map((m: any) => (
        <div key={m.id} className={`p-5 bg-card ${m.read_at ? "border border-border" : "neon-border-cyan"}`}>
          <div className="flex justify-between flex-wrap gap-2">
            <div>
              <div className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                {new Date(m.created_at).toLocaleString("ru-RU")} {m.read_at && "· прочитано"}
              </div>
              <div className="mt-1 font-display font-bold">{m.name} · {m.contact}</div>
            </div>
            <div className="flex gap-2">
              {!m.read_at && (
                <button onClick={() => markM.mutate({ data: { id: m.id } })} className="p-2 hover:neon-text-cyan" title="Отметить прочитанным">
                  <Check size={16} />
                </button>
              )}
              <button onClick={() => { if (confirm("Удалить?")) delM.mutate({ data: { id: m.id } }); }} className="p-2 hover:neon-text-pink">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm whitespace-pre-line">{m.message}</p>
        </div>
      ))}
    </div>
  );
}

// -------------- TRACKS ---------------
function TracksTab() {
  const list = useServerFn(listTracks);
  const save = useServerFn(adminSaveTrack);
  const del = useServerFn(adminDeleteTrack);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-tracks"], queryFn: () => list() });
  const saveM = useMutation({
    mutationFn: save,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tracks"] }); qc.invalidateQueries({ queryKey: ["tracks"] }); toast.success("Сохранено"); },
  });
  const delM = useMutation({
    mutationFn: del,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tracks"] }); qc.invalidateQueries({ queryKey: ["tracks"] }); toast.success("Удалено"); },
  });

  const [uploading, setUploading] = useState(false);

  async function uploadFile(file: File): Promise<string> {
    setUploading(true);
    try {
      const path = `tracks/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      return path;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title") ?? "");
    const description = String(fd.get("description") ?? "");
    const source_type = String(fd.get("source_type") ?? "file") as "file" | "soundcloud" | "youtube";
    let source_url = String(fd.get("source_url") ?? "");
    const cover = fd.get("cover") as File | null;
    let cover_url: string | null = null;

    if (cover && cover.size > 0) cover_url = await uploadFile(cover);

    if (source_type === "file") {
      const audio = fd.get("audio") as File | null;
      if (!audio || audio.size === 0) { toast.error("Загрузите mp3"); return; }
      source_url = await uploadFile(audio);
    }

    await saveM.mutateAsync({ data: { title, description, source_type, source_url, cover_url, sort_order: 0 } });
    form.reset();
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="neon-border p-5 bg-card grid gap-3">
        <h3 className="font-display uppercase tracking-widest neon-text-pink">Добавить трек</h3>
        <input name="title" placeholder="Название" required className={adminInput} />
        <textarea name="description" placeholder="Описание" rows={2} className={adminInput} />
        <select name="source_type" className={adminInput} defaultValue="file">
          <option value="file">Файл MP3 (загрузка)</option>
          <option value="soundcloud">SoundCloud (ссылка)</option>
          <option value="youtube">YouTube (ссылка)</option>
        </select>
        <input name="source_url" placeholder="URL (для SoundCloud/YouTube)" className={adminInput} />
        <label className="text-xs font-display uppercase tracking-widest text-muted-foreground">Аудио-файл (если выбран MP3)</label>
        <input name="audio" type="file" accept="audio/*" className="text-sm" />
        <label className="text-xs font-display uppercase tracking-widest text-muted-foreground">Обложка (опционально)</label>
        <input name="cover" type="file" accept="image/*" className="text-sm" />
        <button disabled={uploading || saveM.isPending} className="px-4 py-2 neon-border neon-glow font-display text-xs uppercase tracking-widest disabled:opacity-60 flex items-center gap-2 w-fit">
          {(uploading || saveM.isPending) ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Добавить
        </button>
      </form>

      {isLoading ? <Loading /> : !data?.length ? <Empty text="Треков нет" /> : (
        <div className="grid gap-3">
          {data.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between gap-4 p-4 bg-card border border-border">
              <div className="min-w-0">
                <div className="font-display font-bold truncate">{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.source_type}</div>
              </div>
              <button onClick={() => { if (confirm("Удалить?")) delM.mutate({ data: { id: t.id } }); }} className="p-2 hover:neon-text-pink"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------- PHOTOS ---------------
function PhotosTab() {
  const list = useServerFn(listPhotos);
  const save = useServerFn(adminSavePhoto);
  const del = useServerFn(adminDeletePhoto);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-photos"], queryFn: () => list() });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ["admin-photos"] }); qc.invalidateQueries({ queryKey: ["photos"] }); };
  const saveM = useMutation({ mutationFn: save, onSuccess: () => { invalidate(); toast.success("Добавлено"); } });
  const delM = useMutation({ mutationFn: del, onSuccess: () => { invalidate(); toast.success("Удалено"); } });
  const [uploading, setUploading] = useState(false);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File | null;
    const caption = String(fd.get("caption") ?? "");
    if (!file || file.size === 0) { toast.error("Выберите файл"); return; }
    setUploading(true);
    try {
      const path = `photos/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      await saveM.mutateAsync({ data: { url: path, caption, sort_order: 0 } });
      e.currentTarget.reset();
    } catch (err: any) {
      toast.error(err?.message ?? "Ошибка загрузки");
    } finally { setUploading(false); }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handle} className="neon-border-cyan p-5 bg-card grid gap-3">
        <h3 className="font-display uppercase tracking-widest neon-text-cyan">Загрузить фото</h3>
        <input name="file" type="file" accept="image/*" required className="text-sm" />
        <input name="caption" placeholder="Подпись" className={adminInput} />
        <button disabled={uploading} className="px-4 py-2 neon-border-cyan font-display text-xs uppercase tracking-widest disabled:opacity-60 flex items-center gap-2 w-fit">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Загрузить
        </button>
      </form>

      {isLoading ? <Loading /> : !data?.length ? <Empty text="Фото нет" /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.map((p: any) => (
            <div key={p.id} className="relative group">
              <img src={p.url} alt="" className="w-full aspect-square object-cover border border-border" />
              <button
                onClick={() => { if (confirm("Удалить?")) delM.mutate({ data: { id: p.id } }); }}
                className="absolute top-2 right-2 bg-black/70 p-1.5 hover:neon-text-pink"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------- VIDEOS ---------------
function VideosTab() {
  const list = useServerFn(listVideos);
  const save = useServerFn(adminSaveVideo);
  const del = useServerFn(adminDeleteVideo);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-videos"], queryFn: () => list() });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ["admin-videos"] }); qc.invalidateQueries({ queryKey: ["videos"] }); };
  const saveM = useMutation({ mutationFn: save, onSuccess: () => { invalidate(); toast.success("Добавлено"); } });
  const delM = useMutation({ mutationFn: del, onSuccess: () => { invalidate(); toast.success("Удалено"); } });

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await saveM.mutateAsync({
      data: {
        title: String(fd.get("title") ?? ""),
        provider: String(fd.get("provider") ?? "youtube") as "youtube" | "vk",
        url: String(fd.get("url") ?? ""),
        sort_order: 0,
      },
    });
    e.currentTarget.reset();
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handle} className="neon-border p-5 bg-card grid gap-3">
        <h3 className="font-display uppercase tracking-widest neon-text-pink">Добавить видео</h3>
        <input name="title" placeholder="Название" required className={adminInput} />
        <select name="provider" className={adminInput} defaultValue="youtube">
          <option value="youtube">YouTube</option>
          <option value="vk">VK Видео</option>
        </select>
        <input name="url" placeholder="URL (YouTube watch/embed или VK embed)" required className={adminInput} />
        <button disabled={saveM.isPending} className="px-4 py-2 neon-border font-display text-xs uppercase tracking-widest disabled:opacity-60 flex items-center gap-2 w-fit">
          {saveM.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Добавить
        </button>
      </form>

      {isLoading ? <Loading /> : !data?.length ? <Empty text="Видео нет" /> : (
        <div className="grid gap-3">
          {data.map((v: any) => (
            <div key={v.id} className="flex justify-between items-center gap-3 p-4 bg-card border border-border">
              <div>
                <div className="font-display font-bold">{v.title}</div>
                <div className="text-xs text-muted-foreground truncate">{v.url}</div>
              </div>
              <button onClick={() => { if (confirm("Удалить?")) delM.mutate({ data: { id: v.id } }); }} className="p-2 hover:neon-text-pink"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------- CONTENT ---------------
const CONTENT_FIELDS: { key: string; label: string; rows?: number }[] = [
  { key: "about", label: "О проекте", rows: 8 },
  { key: "contacts_email", label: "Email" },
  { key: "contacts_telegram", label: "Telegram" },
  { key: "contacts_max_url", label: "МАКС" },
  { key: "privacy", label: "Политика конфиденциальности", rows: 14 },
  { key: "offer", label: "Публичная оферта", rows: 14 },
];

function ContentTab() {
  const list = useServerFn(getSiteContent);
  const save = useServerFn(adminSaveContent);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-content"], queryFn: () => list() });
  const saveM = useMutation({
    mutationFn: save,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-content"] }); qc.invalidateQueries({ queryKey: ["content"] }); toast.success("Сохранено"); },
  });

  if (isLoading) return <Loading />;

  return (
    <div className="grid gap-6">
      {CONTENT_FIELDS.map((f) => (
        <ContentRow key={f.key} field={f} initial={data?.[f.key] ?? ""} onSave={(v) => saveM.mutate({ data: { key: f.key, value: v } })} />
      ))}
    </div>
  );
}

function ContentRow({ field, initial, onSave }: { field: { key: string; label: string; rows?: number }; initial: string; onSave: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  const Tag = field.rows ? "textarea" : "input";
  return (
    <div className="neon-border p-5 bg-card grid gap-3">
      <div className="font-display text-sm uppercase tracking-widest neon-text-pink">{field.label}</div>
      <Tag
        // @ts-ignore
        rows={field.rows}
        value={value}
        onChange={(e: any) => setValue(e.target.value)}
        className={adminInput}
      />
      <button
        onClick={() => onSave(value)}
        disabled={value === initial}
        className="px-4 py-2 neon-border-cyan font-display text-xs uppercase tracking-widest disabled:opacity-40 w-fit"
      >
        Сохранить
      </button>
    </div>
  );
}

const adminInput = "w-full bg-[rgba(20,0,40,0.6)] border border-border px-3 py-2 text-foreground font-body focus:outline-none focus:border-[#ff2bd6]";

function Loading() {
  return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={16} className="animate-spin" /> Загрузка...</div>;
}
function Empty({ text }: { text: string }) {
  return <div className="border border-border p-8 text-center text-muted-foreground font-display uppercase tracking-widest text-sm">{text}</div>;
}
