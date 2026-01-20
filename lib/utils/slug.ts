const SLUG_MAX_LEN = 100;

/**
 * 基于原 slug 生成「复制模板」建议 slug
 * 格式：${base}-copy-${timestamp36}
 */
export function suggestCopySlug(
  originalSlug: string,
  nowMs: number = Date.now()
): string {
  const ts36 = nowMs.toString(36);
  const suffix = `-copy-${ts36}`;

  let base = originalSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const maxBaseLen = SLUG_MAX_LEN - suffix.length;
  if (base.length > maxBaseLen) {
    base = base.slice(0, maxBaseLen).replace(/-+$/g, "");
  }
  if (!base) base = "product";

  return `${base}${suffix}`;
}
