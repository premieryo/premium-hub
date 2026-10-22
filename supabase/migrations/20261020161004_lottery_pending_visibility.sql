-- Review/apply separately before enabling LOTTERY_AUDIT_IMPORT_ENABLED.
-- Preserve legacy public rows and all non-information resources. No data edits.
begin;
drop policy if exists "Public can read content" on public.content_items;
create policy "Public can read approved content"
on public.content_items for select to anon, authenticated
using (
  resource not in ('lottery', 'restock')
  or data->>'publicationStatus' is null
  or data->>'publicationStatus' = 'approved'
);
create policy "Admins can read pending content"
on public.content_items for select to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
commit;
