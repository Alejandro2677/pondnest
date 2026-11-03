const productHandles = new Set([
  "r36s",
  // Legacy content is retained for future imports, not reclassified as R36S reviews.
  "gamegaga-r36-hd",
  "r36h",
  "funda-silicona",
  "estuche-transporte",
]);
export const TIKTOK_ORIGIN = "https://www.tiktok.com";

export function parseTikTokUrl(value) {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      ![
        "www.tiktok.com",
        "tiktok.com",
        "m.tiktok.com",
        "vm.tiktok.com",
        "vt.tiktok.com",
      ].includes(url.hostname) ||
      url.port
    )
      return null;
    const id =
      url.pathname.match(/^\/@[^/]+\/video\/(\d{10,25})\/?$/)?.[1] || null;
    return { id, url: `${url.origin}${url.pathname}` };
  } catch {
    return null;
  }
}

export function localImage(value) {
  return typeof value === "string" && /^\/(?![\/\\])[^\\]*$/.test(value)
    ? value
    : null;
}

export function prepareVideos(entries) {
  const seen = new Set();
  return (Array.isArray(entries) ? entries : []).flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const parsed = parseTikTokUrl(entry.url);
    if (
      !parsed ||
      !productHandles.has(entry.productHandle) ||
      seen.has(parsed.url)
    )
      return [];
    seen.add(parsed.url);
    return [
      {
        ...entry,
        id: parsed.url,
        url: parsed.url,
        postId: parsed.id,
        creator: typeof entry.creator === "string" ? entry.creator.trim() : "",
        description:
          typeof entry.description === "string" ? entry.description.trim() : "",
        playable: Boolean(parsed.id && entry.embedAllowed === true),
        thumbnail: localImage(entry.thumbnail),
      },
    ];
  });
}

export function playerUrl(id, audioEnabled = false) {
  if (!/^\d{10,25}$/.test(id)) throw new Error("Identificador TikTok inválido");
  return `${TIKTOK_ORIGIN}/player/v1/${id}?autoplay=0&controls=1&loop=0&force_muted=${audioEnabled ? 0 : 1}&description=0&music_info=0&rel=0`;
}

export function prepareReviews(entries) {
  const seen = new Set();
  return (Array.isArray(entries) ? entries : [])
    .filter((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const valid =
        entry.published === true &&
        entry.demo !== true &&
        productHandles.has(entry.productHandle) &&
        typeof entry.id === "string" &&
        entry.id &&
        typeof entry.author === "string" &&
        entry.author.trim() &&
        typeof entry.comment === "string" &&
        entry.comment.trim() &&
        /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
        !Number.isNaN(Date.parse(entry.date)) &&
        new Date(entry.date).toISOString().slice(0, 10) === entry.date &&
        Number.isFinite(entry.rating) &&
        entry.rating >= 1 &&
        entry.rating <= 5;
      if (!valid || seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    })
    .map((entry) => ({ ...entry, image: localImage(entry.image) }));
}

// The result covers exactly the published records supplied, not a remote total.
export function reviewSummary(entries) {
  return entries.length
    ? {
        count: entries.length,
        average:
          entries.reduce((sum, entry) => sum + entry.rating, 0) /
          entries.length,
      }
    : null;
}
