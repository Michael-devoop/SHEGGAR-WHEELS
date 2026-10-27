import { afterEach, describe, expect, it, vi } from "vitest";

const PRODUCTION_SITE_URL = "https://sheggar-wheels-liart.vercel.app";

async function loadSite() {
  vi.resetModules();
  return import("@/lib/seo/site");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("SITE_URL", () => {
  it("uses a valid configured origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/some/path");

    const { SITE_URL } = await loadSite();

    expect(SITE_URL).toBe("https://example.com");
  });

  it("rejects non-http schemes instead of emitting a null origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "javascript:alert(1)");

    const { SITE_URL } = await loadSite();

    expect(SITE_URL).toBe("http://localhost:3000");
  });

  it("falls back to the production host when a preview has no configured URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "sheggar-preview.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");

    const { SITE_URL } = await loadSite();

    expect(SITE_URL).toBe(PRODUCTION_SITE_URL);
  });

  it("uses the Vercel production host when Vercel provides it", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "sheggar.example.com");

    const { SITE_URL } = await loadSite();

    expect(SITE_URL).toBe("https://sheggar.example.com");
  });
});
