import { describe, it, expect } from "vitest";
import { getRepository } from "./get_repository";

const getRepositoryFunction = getRepository.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

describe("getRepositoryFunction Integration Tests", () => {
  const auth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };

  it("should fetch repository data for a valid repository", async () => {
    const result = await getRepositoryFunction(
      { owner: "octocat", repo: "Hello-World" },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch repository data using uppercase parameters", async () => {
    const result = await getRepositoryFunction(
      { owner: "OCTOCAT", repo: "HELLO-WORLD" },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for a non-existent repository", async () => {
    const result = await getRepositoryFunction(
      { owner: "octocat", repo: "nonexistentrepo-abcxyz" },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid authentication token", async () => {
    const invalidAuth = { type: "Bearer" as const, apiKey: "invalid-token" };
    const result = await getRepositoryFunction(
      { owner: "octocat", repo: "Hello-World" },
      { auth: invalidAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle empty repository name", async () => {
    const result = await getRepositoryFunction(
      { owner: "octocat", repo: "" },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle empty owner", async () => {
    const result = await getRepositoryFunction(
      { owner: "", repo: "Hello-World" },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});