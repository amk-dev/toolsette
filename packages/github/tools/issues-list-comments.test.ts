import { describe, it, expect } from "vitest";
import { listIssueComments } from "./list_issue_comments";

const listIssueCommentsFunction = listIssueComments.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

describe("listIssueCommentsFunction Integration Tests", () => {
  const auth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };

  it("should fetch issue comments with default parameters", async () => {
    const result = await listIssueCommentsFunction(
      {
        owner: "microsoft",
        repo: "vscode",
        issue_number: 100,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issue comments with custom pagination and 'since' parameter (likely empty result)", async () => {
    const result = await listIssueCommentsFunction(
      {
        owner: "microsoft",
        repo: "vscode",
        issue_number: 100,
        per_page: 1,
        page: 1,
        since: "2100-01-01T00:00:00Z",
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const result = await listIssueCommentsFunction(
      {
        owner: "microsoft",
        repo: "vscode",
        issue_number: 100,
      },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent repository", async () => {
    const result = await listIssueCommentsFunction(
      {
        owner: "microsoft",
        repo: "non-existent-repo",
        issue_number: 100,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent issue number", async () => {
    const result = await listIssueCommentsFunction(
      {
        owner: "microsoft",
        repo: "vscode",
        issue_number: 9999999,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issue comments with per_page set to minimum value", async () => {
    const result = await listIssueCommentsFunction(
      {
        owner: "microsoft",
        repo: "vscode",
        issue_number: 100,
        per_page: 1,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issue comments with per_page set to maximum value", async () => {
    const result = await listIssueCommentsFunction(
      {
        owner: "microsoft",
        repo: "vscode",
        issue_number: 100,
        per_page: 100,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});