import { describe, it, expect } from "vitest";
import { listPullRequests } from "./pull_requests-list";

const listPullRequestsFunction = listPullRequests.function;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

describe("listPullRequestsFunction Integration Tests", () => {
  const auth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };

  it("should fetch pull requests with default parameters", async () => {
    const result = await listPullRequestsFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch pull requests with custom parameters", async () => {
    const result = await listPullRequestsFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        state: "closed",
        sort: "updated",
        direction: "asc",
        per_page: 5,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch pull requests with maximum per_page parameter", async () => {
    const result = await listPullRequestsFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        state: "all",
        per_page: 100,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should filter pull requests by head parameter", async () => {
    const result = await listPullRequestsFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        head: "octocat:master",
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should filter pull requests by base parameter", async () => {
    const result = await listPullRequestsFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
        base: "master",
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const result = await listPullRequestsFunction(
      {
        owner: "octocat",
        repo: "Hello-World",
      },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for non-existent repository", async () => {
    const result = await listPullRequestsFunction(
      {
        owner: "nonexistentowner_xyz",
        repo: "nonexistentrepo_xyz",
        state: "all",
        sort: "created",
        per_page: 30,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});