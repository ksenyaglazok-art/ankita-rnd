
## Что строим

Многостраничный сайт музыкального проекта **«Анкита RND»** в стиле киберпанк-неон + защищённая админка для управления контентом и приёма заявок.

## Стиль

- **Палитра:** глубокий чёрно-фиолетовый фон (#0a0014, #110022), неоновые акценты — пурпурный (#ff2bd6), циан (#00f0ff), электрик-фиолет (#9d00ff)
- **Типографика:** заголовки `Orbitron` / `Audiowide`, body `Rajdhani` / `Inter`
- **Эффекты:** glitch-текст, неоновые свечения (box/text-shadow), сканлайны, анимированные градиенты, грид-сетки на фоне, плавные hover-glow
- Места под фото певицы — стилизованные неоновые рамки с заглушками

## Структура страниц (TanStack Router)

```
src/routes/
  __root.tsx              — шелл, шапка, подвал, неон-фон
  index.tsx               — Главная (hero с фото, тизеры рубрик)
  about.tsx               — О проекте
  music.tsx               — Слушать песни (плеер + список треков)
  order.tsx               — Заказать песню (две формы)
  gallery.tsx             — Фото + видео галерея
  contacts.tsx            — Контакты
  privacy.tsx             — Политика конфиденциальности
  offer.tsx               — Оферта
  auth.tsx                — Вход админа
  _authenticated/
    route.tsx             — гейт (managed)
    admin.tsx             — дашборд (вкладки)
```

### Хедер
Лого-неон «АНКИТА RND», навигация: Главная / О проекте / Музыка / Заказать / Галерея / Контакты. Мобильное меню (drawer).

### Футер
Соц-иконки, копирайт, ссылки на Политику и Оферту, e-mail.

### Главная
- Hero: крупное фото-плейсхолдер певицы в неоновой рамке, glitch-заголовок, CTA «Слушать» и «Заказать песню»
- Блок «О проекте» (превью)
- Свежие треки (3 шт)
- Превью галереи
- CTA-полоса заказа

### О проекте
Биография, концепция, фото-плейсхолдеры, цитаты в неон-карточках.

### Слушать песни
Список треков из БД. Каждый трек: обложка, название, описание. Плеер поддерживает:
- встроенный mp3 (HTML5 audio с кастомным неон-UI)
- встроенные iframe SoundCloud/YouTube (определяется по полю `source_type`)

### Заказать песню
Две карточки-варианта:
1. **Песня на свои стихи** — поля: имя, контакт (телеграм/телефон/email), название, текст стихов (textarea), жанр/настроение, пожелания, дедлайн, бюджет, согласие с офертой
2. **Песня под ключ** — поля: имя, контакт, повод, для кого, описание идеи, референсы, пожелания, дедлайн, бюджет, согласие

Валидация zod, отправка через `createServerFn`, заявка пишется в `orders`, тост-подтверждение.

### Галерея
Табы: Фото | Видео. Фото — masonry-грид с лайтбоксом. Видео — встроенные YouTube/VK через iframe.

### Контакты
Email, телеграм, инстаграм (плейсхолдеры), форма обратной связи (пишет в `messages`), карта-плейсхолдер.

### Политика и Оферта
Шаблонный юридический текст с пометкой «отредактируйте через админку».

## Админка (`/admin`)

Доступ только аутентифицированным с ролью `admin`. Логин email+пароль через Lovable Cloud. Первый админ — назначается вручную через миграцию по email.

Вкладки:
1. **Заявки на песни** — таблица `orders` с фильтром по типу/статусу (new, in_progress, done, rejected), детальный просмотр, смена статуса, заметки
2. **Сообщения** — таблица `messages` из формы контактов
3. **Треки** — CRUD: загрузка mp3 в Storage или вставка ссылки SoundCloud/YouTube, обложка, описание, порядок
4. **Фото** — загрузка в Storage, подпись, порядок, удаление
5. **Видео** — добавление ссылок YouTube/VK с превью
6. **Тексты** — редактирование О проекте, Контактов, Политики, Оферты (таблица `site_content` key/value)

## База данных (Lovable Cloud)

```
profiles(id→auth.users, display_name, created_at)
app_role enum ('admin','user')
user_roles(id, user_id, role) + has_role() SECURITY DEFINER
orders(id, type 'lyrics'|'turnkey', name, contact, payload jsonb, status, admin_notes, created_at)
messages(id, name, contact, message, created_at, read_at)
tracks(id, title, description, cover_url, source_type 'file'|'soundcloud'|'youtube', source_url, sort_order, created_at)
photos(id, url, caption, sort_order, created_at)
videos(id, title, provider 'youtube'|'vk', url, sort_order, created_at)
site_content(key pk, value text, updated_at)
```

Все таблицы под RLS:
- `orders`, `messages` — INSERT для anon (отправка форм), SELECT/UPDATE только admin
- `tracks`, `photos`, `videos`, `site_content` — SELECT для anon, write только admin
- `user_roles` — SELECT для authenticated; через `has_role()`

Storage buckets: `tracks` (public), `photos` (public), `covers` (public).

## Серверные функции

`src/lib/*.functions.ts`:
- `submitOrder`, `submitMessage` — публичные, валидация zod, insert через server publishable client
- `listTracks`, `listPhotos`, `listVideos`, `getSiteContent` — публичные read-only
- `admin*` (CRUD треков/фото/видео/контента, список и обновление заявок и сообщений) — `requireSupabaseAuth` + проверка `has_role('admin')`

## Технические детали

- TanStack Start + TanStack Query (ensureQueryData в loader, useSuspenseQuery в компоненте)
- Lovable Cloud (auth email/password, БД, Storage)
- Шрифты — `@fontsource/orbitron`, `@fontsource/rajdhani`
- Дизайн-токены неоновой палитры в `src/styles.css` (@theme)
- Все треки/фото/видео — пустой стейт с подсказкой «Добавьте через админку» на старте
- На каждом маршруте — head() с title/description/og:title/og:description

## После согласования

Сразу включаю Lovable Cloud, накатываю миграцию, создаю бакеты, генерирую все страницы и админку, сообщаю как назначить первого админа.
