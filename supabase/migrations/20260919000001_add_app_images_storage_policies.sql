drop policy if exists "Public app-images select" on storage.objects;
drop policy if exists "Public app-images insert" on storage.objects;
drop policy if exists "Public app-images update" on storage.objects;
drop policy if exists "Public app-images delete" on storage.objects;

create policy "Public app-images select"
on storage.objects
for select
to public
using (bucket_id = 'app-images');

create policy "Public app-images insert"
on storage.objects
for insert
to public
with check (bucket_id = 'app-images');

create policy "Public app-images update"
on storage.objects
for update
to public
using (bucket_id = 'app-images')
with check (bucket_id = 'app-images');

create policy "Public app-images delete"
on storage.objects
for delete
to public
using (bucket_id = 'app-images');
