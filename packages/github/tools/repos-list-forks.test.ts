import { describe, it, expect } from "vitest";
import { listForks } from "./gists-forks";

const listForksFunction = listForks.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

describe("listForksFunction Integration Tests", () => {
  const validAuth = { type: "Bearer", apiKey: GITHUB_TOKEN };

  it("should fetch forks with default parameters", async () => {
    const result = await listForksFunction(
      { owner: "octocat", repo: "Hello-World" },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch forks with pagination parameters", async () => {
    const result = await listForksFunction(
      { owner: "octocat", repo: "Hello-World", per_page: 5, page: 1 },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch forks with sort 'oldest'", async () => {
    const result = await listForksFunction(
      { owner: "octocat", repo: "Hello-World", sort: "oldest", per_page: 10, page: 1 },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent repository error", async () => {
    const result = await listForksFunction(
      { owner: "octocat", repo: "nonexistentrepo", per_page: 5, page: 1 },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const invalidAuth = { type: "Bearer", apiKey: "invalid-token" };
    const result = await listForksFunction(
      { owner: "octocat", repo: "Hello-World" },
      { auth: invalidAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle minimum per_page boundary", async () => {
    const result = await listForksFunction(
      { owner: "octocat", repo: "Hello-World", per_page: 1, page: 1 },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle maximum per_page boundary", async () => {
    const result = await listForksFunction(
      { owner: "octocat", repo: "Hello-World", per_page: 100, page: 1 },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return empty result for high page number", async () => {
    const result = await listForksFunction(
      { owner: "octocat", repo: "Hello-World", page: 9999 },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid per_page less than minimum", async () => {
    const result = await listForksFunction(
      { owner: "octocat", repo: "Hello-World", per_page: 0, page: 1 },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid per_page greater than maximum", async () => {
    const result = await listForksFunction(
      { owner: "octocat", repo: "Hello-World", per_page: 101, page: 1 },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});