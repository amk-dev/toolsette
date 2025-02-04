import { describe, it, expect } from "vitest";
import { getPullRequest } from "./pull_request-get";

const getPullRequestFunction = getPullRequest.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

const GITHUB_PR_OWNER = process.env.GITHUB_PR_OWNER || "octocat";
const GITHUB_PR_REPO = process.env.GITHUB_PR_REPO || "Hello-World";
const GITHUB_PR_NUMBER = process.env.GITHUB_PR_NUMBER
  ? parseInt(process.env.GITHUB_PR_NUMBER, 10)
  : 1347;

describe("getPullRequestFunction Integration Tests", () => {
  const validAuth = {
    type: "Bearer" as const,
    apiKey: GITHUB_TOKEN,
  };

  it("should fetch pull request with valid parameters", async () => {
    const result = await getPullRequestFunction(
      {
        owner: GITHUB_PR_OWNER,
        repo: GITHUB_PR_REPO,
        pull_number: GITHUB_PR_NUMBER,
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent pull request", async () => {
    const result = await getPullRequestFunction(
      {
        owner: GITHUB_PR_OWNER,
        repo: GITHUB_PR_REPO,
        pull_number: 9999999,
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const result = await getPullRequestFunction(
      {
        owner: GITHUB_PR_OWNER,
        repo: GITHUB_PR_REPO,
        pull_number: GITHUB_PR_NUMBER,
      },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle boundary pull request number 0", async () => {
    const result = await getPullRequestFunction(
      {
        owner: GITHUB_PR_OWNER,
        repo: GITHUB_PR_REPO,
        pull_number: 0,
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});