```typescript
import { describe, it, expect } from "vitest";
import { listLabelsForIssue } from "./list_labels_for_issue";

const listLabelsForIssueFunction = listLabelsForIssue.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

describe("listLabelsForIssueFunction Integration Tests", () => {
  const auth = {
    type: "Bearer" as const,
    apiKey: GITHUB_TOKEN,
  };

  it("should fetch labels with default parameters", async () => {
    const result = await listLabelsForIssueFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        issue_number: 1,
        per_page: 30,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should respect per_page parameter", async () => {
    const result = await listLabelsForIssueFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        issue_number: 1,
        per_page: 1,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle pagination with different page parameter", async () => {
    const result = await listLabelsForIssueFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        issue_number: 1,
        per_page: 1,
        page: 2,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const result = await listLabelsForIssueFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        issue_number: 1,
        per_page: 30,
        page: 1,
      },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent repository", async () => {
    const result = await listLabelsForIssueFunction(
      {
        owner: "octocat",
        repo: "nonexistent-repo",
        issue_number: 1,
        per_page: 30,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent issue", async () => {
    const result = await listLabelsForIssueFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        issue_number: 999999,
        per_page: 30,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle edge case with per_page as 0", async () => {
    const result = await listLabelsForIssueFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        issue_number: 1,
        per_page: 0,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle edge case with high page number", async () => {
    const result = await listLabelsForIssueFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        issue_number: 1,
        per_page: 30,
        page: 10000,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle per_page above maximum", async () => {
    const result = await listLabelsForIssueFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        issue_number: 1,
        per_page: 150,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});
```