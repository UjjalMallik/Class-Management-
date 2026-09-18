create policy "Allow anonymous push token registration"
on public.push_tokens
for insert
to anon, authenticated
with check (true);

create policy "Allow anonymous push token refresh"
on public.push_tokens
for update
to anon, authenticated
using (true)
with check (true);