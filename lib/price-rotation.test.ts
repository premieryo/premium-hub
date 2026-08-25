import assert from "node:assert/strict";
import test from "node:test";
import { completeRotationBatch, createInitialRotationState, isRotationLeaseActive,
  selectRotationBatch, type RotationProduct } from "./price-rotation";
import { tokyoDayRange } from "../scripts/updateGenrePrices";

function products(count: number): RotationProduct[] {
  const genres = ["pokemon", "onepiece", "dragonball"] as const;
  return Array.from({ length: count }, (_, index) => ({ id: `item-${String(index + 1).padStart(2, "0")}`,
    genre: genres[index % genres.length], releaseDate: `2026-01-${String(30 - index).padStart(2, "0")}` }));
}

test("10 tracking products are selected once across two runs", () => {
  const items = products(10);
  let state = createInitialRotationState();
  const selected: string[] = [];
  for (let run = 0; run < 2; run += 1) {
    const batch = selectRotationBatch(state, items);
    selected.push(...batch.selectedKeys);
    state = completeRotationBatch(state, batch, [], `2026-08-${25 + run}T00:00:00Z`);
  }
  assert.equal(selected.length, 10);
  assert.equal(new Set(selected).size, 10);
});

test("30 tracking products complete a fair rotation in six runs", () => {
  const items = products(30);
  let state = createInitialRotationState();
  const selected: string[] = [];
  for (let run = 0; run < 6; run += 1) {
    const batch = selectRotationBatch(state, items);
    selected.push(...batch.selectedKeys);
    state = completeRotationBatch(state, batch, [], `2026-09-0${run + 1}T00:00:00Z`);
  }
  assert.equal(new Set(selected).size, 30);
  assert.deepEqual(selected.slice(0, 3).map((key) => key.split(":")[0]), ["pokemon", "onepiece", "dragonball"]);
});

test("added products join the queue and tracking-off or deleted products leave it", () => {
  const initial = products(10);
  let state = createInitialRotationState();
  const first = selectRotationBatch(state, initial);
  state = completeRotationBatch(state, first, [], "2026-08-25T00:00:00Z");
  const changed = [...initial.filter((_, index) => index !== 6),
    { id: "added", genre: "dragonball", releaseDate: "2026-08-20" } satisfies RotationProduct];
  const seen = new Set<string>();
  for (let run = 0; run < 3; run += 1) {
    const batch = selectRotationBatch(state, changed);
    batch.selectedKeys.forEach((key) => seen.add(key));
    state = completeRotationBatch(state, batch, [], `2026-08-${26 + run}T00:00:00Z`);
  }
  assert.ok(seen.has("dragonball:added"));
  assert.ok(!state.queue.some((key) => key.endsWith("item-07")));
});

test("a failed product is retried once with priority then returns to normal rotation", () => {
  const items = products(10);
  let state = createInitialRotationState();
  const first = selectRotationBatch(state, items);
  const failed = first.selectedKeys[2];
  state = completeRotationBatch(state, first, [failed], "2026-08-25T00:00:00Z");
  const second = selectRotationBatch(state, items);
  assert.equal(second.selectedKeys[0], failed);
  state = completeRotationBatch(state, second, [failed], "2026-08-26T00:00:00Z");
  assert.deepEqual(state.retryProductKeys, []);
  assert.ok(state.queue.slice(-5).includes(failed));
});

test("active cursor lease blocks a competing run and expired lease does not", () => {
  const state = { ...createInitialRotationState(), lease: { id: "run", expiresAt: "2026-08-25T00:15:00Z" } };
  assert.equal(isRotationLeaseActive(state, Date.parse("2026-08-25T00:10:00Z")), true);
  assert.equal(isRotationLeaseActive(state, Date.parse("2026-08-25T00:16:00Z")), false);
});

test("JST day range keeps same-day history checks across UTC boundaries", () => {
  assert.deepEqual(tokyoDayRange(new Date("2026-08-25T23:30:00+09:00")),
    { start: "2026-08-24T15:00:00.000Z", end: "2026-08-25T15:00:00.000Z" });
});
