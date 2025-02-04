import { describe, it, expect } from "vitest";
import { updateIssue } from "./update_issue";

const updateIssueFunction = updateIssue.function;

const {
  GITHUB_TOKEN,
  GITHUB_TEST_REPO_OWNER,
  GITHUB_TEST_REPO_NAME,
  GITHUB_TEST_ISSUE_NUMBER,
} = process.env;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}
if (!GITHUB_TEST_REPO_OWNER) {
  throw new Error("GITHUB_TEST_REPO_OWNER environment variable is required to run tests");
}
if (!GITHUB_TEST_REPO_NAME) {
  throw new Error("GITHUB_TEST_REPO_NAME environment variable is required to run tests");
}
if (!GITHUB_TEST_ISSUE_NUMBER) {
  throw new Error("GITHUB_TEST_ISSUE_NUMBER environment variable is required to run tests");
}

const issueNumber = Number(GITHUB_TEST_ISSUE_NUMBER);
const validAuth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };

describe("updateIssueFunction Integration Tests", () => {
  it("should update the issue title successfully", async () => {
    const newTitle = `Updated Title ${new Date().toISOString()}`;
    const result = await updateIssueFunction(
      {
        owner: GITHUB_TEST_REPO_OWNER,
        repo: GITHUB_TEST_REPO_NAME,
        issue_number: issueNumber,
        title: newTitle,
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should update the issue body successfully", async () => {
    const result = await updateIssueFunction(
      {
        owner: GITHUB_TEST_REPO_OWNER,
        repo: GITHUB_TEST_REPO_NAME,
        issue_number: issueNumber,
        body: `Updated body content at ${new Date().toISOString()}`,
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should close the issue successfully", async () => {
    const result = await updateIssueFunction(
      {
        owner: GITHUB_TEST_REPO_OWNER,
        repo: GITHUB_TEST_REPO_NAME,
        issue_number: issueNumber,
        state: "closed",
        state_reason: "completed",
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should reopen the issue successfully", async () => {
    const result = await updateIssueFunction(
      {
        owner: GITHUB_TEST_REPO_OWNER,
        repo: GITHUB_TEST_REPO_NAME,
        issue_number: issueNumber,
        state: "open",
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should update the issue without additional fields", async () => {
    const result = await updateIssueFunction(
      {
        owner: GITHUB_TEST_REPO_OWNER,
        repo: GITHUB_TEST_REPO_NAME,
        issue_number: issueNumber,
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle title as a number", async () => {
    const result = await updateIssueFunction(
      {
        owner: GITHUB_TEST_REPO_OWNER,
        repo: GITHUB_TEST_REPO_NAME,
        issue_number: issueNumber,
        title: 12345,
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should update multiple fields including body, assignees, and labels", async () => {
    const result = await updateIssueFunction(
      {
        owner: GITHUB_TEST_REPO_OWNER,
        repo: GITHUB_TEST_REPO_NAME,
        issue_number: issueNumber,
        body: "Multi-field update body",
        assignees: [GITHUB_TEST_REPO_OWNER],
        labels: [
          "bug",
          { id: 123, name: "enhancement", description: "enhancement label", color: "f29513" }
        ],
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid repository", async () => {
    const result = await updateIssueFunction(
      {
        owner: GITHUB_TEST_REPO_OWNER,
        repo: "nonexistent-repo-for-testing",
        issue_number: 1,
        title: "Test update for invalid repo",
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid authentication", async () => {
    const invalidAuth = { type: "Bearer" as const, apiKey: "invalid-token" };
    const result = await updateIssueFunction(
      {
        owner: GITHUB_TEST_REPO_OWNER,
        repo: GITHUB_TEST_REPO_NAME,
        issue_number: issueNumber,
        title: "Test update for invalid auth",
      },
      { auth: invalidAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});