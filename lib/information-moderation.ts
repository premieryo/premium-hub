import type { Genre, LotteryItem, RestockItem } from "@/data/types";
import type { AdminItem, AdminResource } from "./admin-data";

export type InformationResource = Extract<AdminResource, "lottery" | "restock">;

function normalized(value: unknown) {
  return String(value ?? "").normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizedUrl(value: unknown) {
  try {
    const url = new URL(String(value));
    url.hash = "";
    return url.toString();
  } catch {
    return normalized(value);
  }
}

export function buildInformationDedupKey(genre: Genre, resource: InformationResource, item: Record<string, unknown>) {
  const eventDate = resource === "lottery"
    ? item.deadlineAt ?? item.deadline
    : item.saleStart ?? item.restockAt ?? item.date;
  return [genre, resource, item.shop, item.productId || item.product, eventDate, normalizedUrl(item.officialUrl)]
    .map(normalized)
    .join("|");
}

export function isPublicInformationItem(item: LotteryItem | RestockItem) {
  return item.publicationStatus === undefined || item.publicationStatus === "approved";
}

export function prepareInformationItem(genre: Genre, resource: InformationResource, item: AdminItem): AdminItem {
  return {
    ...item,
    publicationStatus: item.publicationStatus ?? "approved",
    matchStatus: item.productId ? "matched" : "unmatched",
    dedupKey: buildInformationDedupKey(genre, resource, item),
  };
}
