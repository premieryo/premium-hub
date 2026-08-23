import type { ProductImageAsset, ProductImageSource } from "@/data/types";

type ProductImageProps = {
  asset?: ProductImageAsset;
  alt: string;
  fallbackIcon?: string;
  className?: string;
};

type SourcePolicy = {
  imageHosts: ReadonlySet<string>;
  clickHosts: ReadonlySet<string>;
};

// A provider is enabled only after its public terms and exact hostnames are verified.
// ValueCommerce and other ASP hosts intentionally remain disabled until approval.
const sourcePolicies: Partial<Record<ProductImageSource, SourcePolicy>> = {
  amazon: {
    imageHosts: new Set(["m.media-amazon.com"]),
    clickHosts: new Set(["amazon.co.jp", "www.amazon.co.jp"]),
  },
};

function parseHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function isAllowedProductImageAsset(asset: ProductImageAsset) {
  const policy = sourcePolicies[asset.source];
  const imageUrl = parseHttpsUrl(asset.src);
  const clickUrl = parseHttpsUrl(asset.clickUrl);

  return Boolean(
    policy
      && imageUrl
      && clickUrl
      && policy.imageHosts.has(imageUrl.hostname)
      && policy.clickHosts.has(clickUrl.hostname)
      && Number.isInteger(asset.width)
      && asset.width > 0
      && Number.isInteger(asset.height)
      && asset.height > 0,
  );
}

export default function ProductImage({
  asset,
  alt,
  fallbackIcon = "◇",
  className = "h-16 w-16",
}: ProductImageProps) {
  const sharedClassName = `${className} shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-blue-950`;

  if (!asset || !isAllowedProductImageAsset(asset)) {
    return (
      <div
        className={`${sharedClassName} flex items-center justify-center text-2xl text-slate-400`}
        role="img"
        aria-label={`${alt}の商品画像は準備中です`}
      >
        <span aria-hidden="true">{fallbackIcon}</span>
      </div>
    );
  }

  return (
    <a
      href={asset.clickUrl}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className={`${sharedClassName} block`}
      aria-label={`${asset.alt || alt}の商品ページを開く`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Licensed provider images must bypass Next/Vercel optimization and caching. */}
      <img
        src={asset.src}
        alt={asset.alt || alt}
        width={asset.width}
        height={asset.height}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
      />
    </a>
  );
}
