import { describe, it, expect } from "vitest";
import { createIssue } from "./gists-create";

const createIssueFunction = createIssue.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

if (!GITHUB_OWNER) {
  throw new Error("GITHUB_OWNER environment variable is required to run tests");
}

if (!GITHUB_REPO) {
  throw new Error("GITHUB_REPO environment variable is required to run tests");
}

describe("createIssueFunction Integration Tests", () => {
  const validAuth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };

  it("should create an issue with minimal parameters", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title: `Test Minimal Issue ${Date.now()}`,
    };
    const result = await createIssueFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should create an issue with full parameters", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title: `Test Full Issue ${Date.now()}`,
      body: "This is a test issue with full parameters.",
      assignee: GITHUB_OWNER,
      milestone: 1,
      labels: ["bug", "enhancement"],
      assignees: [GITHUB_OWNER],
    };
    const result = await createIssueFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should create an issue with numeric title", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title: 12345,
      body: "Issue with numeric title",
    };
    const result = await createIssueFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title: `Test Invalid Auth ${Date.now()}`,
    };
    const invalidAuth = { type: "Bearer" as const, apiKey: "invalid-token" };
    const result = await createIssueFunction(input, { auth: invalidAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail for non-existing repository", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: "non-existent-repo-for-testing",
      title: `Test Non-existent Repo ${Date.now()}`,
    };
    const result = await createIssueFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });
});