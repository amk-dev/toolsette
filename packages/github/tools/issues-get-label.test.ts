import { describe, it, expect } from "vitest";
import { getLabel } from "./gists-get_label";
const getLabelFunction = getLabel.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run integration tests");
}

describe("getLabelFunction Integration Tests", () => {
  const validAuth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };
  const noAuth = { type: "Bearer" as const, apiKey: "" };
  const invalidAuth = { type: "Bearer" as const, apiKey: "invalid-token" };

  it("should fetch an existing label with valid authentication", async () => {
    const result = await getLabelFunction(
      { owner: "octocat", repo: "Hello-World", name: "bug" },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch an existing label without authentication header", async () => {
    const result = await getLabelFunction(
      { owner: "octocat", repo: "Hello-World", name: "bug" },
      { auth: noAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent label", async () => {
    const result = await getLabelFunction(
      { owner: "octocat", repo: "Hello-World", name: "non-existent-label-123456" },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid authentication", async () => {
    const result = await getLabelFunction(
      { owner: "octocat", repo: "Hello-World", name: "bug" },
      { auth: invalidAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch label in a case-insensitive manner", async () => {
    const result = await getLabelFunction(
      { owner: "octocat", repo: "Hello-World", name: "BuG" },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent repository", async () => {
    const result = await getLabelFunction(
      { owner: "octocat", repo: "non-existent-repo-123456", name: "bug" },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});