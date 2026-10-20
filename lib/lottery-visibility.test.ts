import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("RLS: 承認待ち/却下は公開APIにも非公開、管理者だけ確認・承認できる", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema auth to anon,authenticated;
      grant execute on function auth.uid() to anon,authenticated;`);
    await db.exec(await readFile("supabase/migrations/001_content_and_admins.sql", "utf8"));
    await db.exec(await readFile("supabase/migrations/20261020161004_lottery_pending_visibility.sql", "utf8"));
    await db.exec(`insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
      insert into admin_users(user_id) values ('00000000-0000-0000-0000-000000000001');
      insert into content_items(genre,resource,item_id,data) values
      ('pokemon','lottery','pending','{"publicationStatus":"pending"}'),
      ('pokemon','lottery','rejected','{"publicationStatus":"rejected"}'),
      ('pokemon','lottery','approved','{"publicationStatus":"approved"}'),
      ('pokemon','lottery','legacy','{}'),
      ('pokemon','restock','restock-pending','{"publicationStatus":"pending"}'),
      ('pokemon','products','product','{}');`);
    for (const [role, uid] of [["anon", ""], ["authenticated", "00000000-0000-0000-0000-000000000002"]]) {
      await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub','${uid}',false);`);
      assert.deepEqual((await db.query<{ item_id: string }>("select item_id from content_items order by item_id")).rows.map(row => row.item_id), ["approved", "legacy", "product"]);
      await assert.rejects(db.exec(`insert into content_items(genre,resource,item_id,data) values ('pokemon','lottery','unauthorized','{}')`));
      if (role === "authenticated") {
        assert.deepEqual((await db.query("update content_items set data='{}' where item_id='pending' returning item_id")).rows, []);
        assert.deepEqual((await db.query("delete from content_items where item_id='pending' returning item_id")).rows, []);
      }
      await db.exec("reset role;");
    }
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);`);
    assert.equal((await db.query("select item_id from content_items")).rows.length, 6);
    await db.exec(`update content_items set data='{"publicationStatus":"approved"}' where item_id='pending'; reset role; set role anon;`);
    assert.equal((await db.query("select item_id from content_items where item_id='pending'")).rows.length, 1);
  } finally { await db.close(); }
});
