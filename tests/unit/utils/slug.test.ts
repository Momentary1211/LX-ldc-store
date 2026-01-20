import { describe, expect, it } from "vitest";
import { suggestCopySlug } from "@/lib/utils/slug";

describe("utils/slug", () => {
  it("应生成原slug-copy-timestamp36 格式", () => {
    const nowMs = 1700000000000;
    const out = suggestCopySlug("abc-123", nowMs);
    expect(out).toBe(`abc-123-copy-${nowMs.toString(36)}`);
  });

  it("应进行防御性规范化（小写/非法字符替换/去首尾连字符）", () => {
    const nowMs = 1700000000000;
    const out = suggestCopySlug(" Bad Slug! ", nowMs);
    expect(out.startsWith("bad-slug-copy-")).toBe(true);
    expect(/^[a-z0-9-]+$/.test(out)).toBe(true);
  });

  it("应确保总长度不超过 100", () => {
    const nowMs = 1700000000000;
    const longBase = "a".repeat(200);
    const out = suggestCopySlug(longBase, nowMs);
    expect(out.length).toBeLessThanOrEqual(100);
    expect(out.endsWith(`-copy-${nowMs.toString(36)}`)).toBe(true);
  });

  it("base 为空时应回退为 product", () => {
    const nowMs = 1700000000000;
    const out = suggestCopySlug("!!!", nowMs);
    expect(out).toBe(`product-copy-${nowMs.toString(36)}`);
  });
});
