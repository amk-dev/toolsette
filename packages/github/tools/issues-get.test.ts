import { describe, it, expect } from "vitest";
import { getIssue } from "./gists-get_issue";

const getIssueFunction = getIssue.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

describe("getIssueFunction Integration Tests", () => {
  const auth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };

  it("should fetch an existing issue successfully", async () => {
    const result = await getIssueFunction(
      { owner: "octocat", repo: "Hello-World", issue_number: 1 },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for a non-existent issue", async () => {
    const result = await getIssueFunction(
      { owner: "octocat", repo: "Hello-World", issue_number: 9999999 },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for an invalid repository", async () => {
    const result = await getIssueFunction(
      { owner: "nonexistent", repo: "nonexistent", issue_number: 1 },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const invalidAuth = { type: "Bearer" as const, apiKey: "invalid-token" };
    const result = await getIssueFunction(
      { owner: "octocat", repo: "Hello-World", issue_number: 1 },
      { auth: invalidAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for negative issue number", async () => {
    const result = await getIssueFunction(
      { owner: "octocat", repo: "Hello-World", issue_number: -1 },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for an extremely high issue number", async () => {
    const result = await getIssueFunction(
      { owner: "octocat", repo: "Hello-World", issue_number: Number.MAX_SAFE_INTEGER },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for empty repository name", async () => {
    const result = await getIssueFunction(
      { owner: "octocat", repo: "", issue_number: 1 },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});