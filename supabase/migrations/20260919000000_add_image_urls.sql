alter table public.assignments
  add column if not exists image_urls text[];

alter table public.notices
  add column if not exists image_urls text[];

alter table public.routine
  add column if not exists image_urls text[];

update public.assignments
set image_urls = array[image_url]
where image_urls is null
  and image_url is not null
  and btrim(image_url) <> '';

update public.notices
set image_urls = array[image_url]
where image_urls is null
  and image_url is not null
  and btrim(image_url) <> '';

update public.routine
set image_urls = array[image_url]
where image_urls is null
  and image_url is not null
  and btrim(image_url) <> '';
