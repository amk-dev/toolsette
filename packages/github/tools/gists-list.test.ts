import { describe, it, expect } from "vitest";
import { listGists } from "./gists-list";

const listGistsFunction = listGists.function;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

describe("listGistsFunction Integration Tests", () => {
  const validAuth = { type: "Bearer", apiKey: GITHUB_TOKEN };

  it("should fetch gists with default parameters", async () => {
    const result = await listGistsFunction({ per_page: 30, page: 1 }, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should respect per_page parameter with per_page = 5", async () => {
    const result = await listGistsFunction({ per_page: 5, page: 1 }, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch gists with a valid 'since' parameter", async () => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = await listGistsFunction({ since, per_page: 30, page: 1 }, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const result = await listGistsFunction({ per_page: 30, page: 1 }, { auth: { type: "Bearer", apiKey: "invalid-token" } });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch gists anonymously", async () => {
    const result = await listGistsFunction({ per_page: 30, page: 1 }, { auth: { type: "Bearer", apiKey: "" } });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle edge case: per_page = 1 and page = 1", async () => {
    const result = await listGistsFunction({ per_page: 1, page: 1 }, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle edge case: per_page = 100 and page = 1", async () => {
    const result = await listGistsFunction({ per_page: 100, page: 1 }, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });
});