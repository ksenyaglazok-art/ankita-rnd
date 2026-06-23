
DROP POLICY "Anyone can submit orders" ON public.orders;
CREATE POLICY "Anyone can submit orders" ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 200
  AND length(contact) BETWEEN 1 AND 300
  AND status = 'new'
  AND admin_notes IS NULL
  AND pg_column_size(payload) < 20000
);

DROP POLICY "Anyone can send messages" ON public.messages;
CREATE POLICY "Anyone can send messages" ON public.messages FOR INSERT TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 200
  AND length(contact) BETWEEN 1 AND 300
  AND length(message) BETWEEN 1 AND 5000
  AND read_at IS NULL
);
