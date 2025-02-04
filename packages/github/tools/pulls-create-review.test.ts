import { describe, it, expect } from "vitest";
import { create_pull_request_review } from "./create_pull_request_review";

const createPullRequestReviewFunction = create_pull_request_review.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_PULL_NUMBER = process.env.GITHUB_PULL_NUMBER;

if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO || !GITHUB_PULL_NUMBER) {
  throw new Error("GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, and GITHUB_PULL_NUMBER environment variables are required to run tests");
}

const pullNumber = Number(GITHUB_PULL_NUMBER);

describe("createPullRequestReviewFunction Integration Tests", () => {
  const validAuth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };

  it("should create a pending review with minimal parameters", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      pull_number: pullNumber,
    };

    const result = await createPullRequestReviewFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should create an approved review when event is APPROVE", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      pull_number: pullNumber,
      event: "APPROVE" as const,
    };

    const result = await createPullRequestReviewFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should create a review with inline comments", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      pull_number: pullNumber,
      comments: [
        {
          path: "README.md",
          line: 5,
          body: "Test inline comment",
        },
      ],
    };

    const result = await createPullRequestReviewFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      pull_number: pullNumber,
    };

    const invalidAuth = { type: "Bearer" as const, apiKey: "invalid-token" };
    const result = await createPullRequestReviewFunction(input, { auth: invalidAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error when pull request does not exist", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      pull_number: 9999999,
    };

    const result = await createPullRequestReviewFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should create a review with both body and inline comments for COMMENT event", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      pull_number: pullNumber,
      event: "COMMENT" as const,
      body: "Review comment",
      comments: [
        {
          path: "src/app.js",
          body: "Inline code review",
          position: 5,
        },
      ],
    };

    const result = await createPullRequestReviewFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid commit_id gracefully", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      pull_number: pullNumber,
      commit_id: "invalid-sha",
      event: "APPROVE" as const,
    };

    const result = await createPullRequestReviewFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle edge case with negative line number in inline comment", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      pull_number: pullNumber,
      comments: [
        {
          path: "README.md",
          line: -1,
          body: "Bad inline comment",
        },
      ],
    };

    const result = await createPullRequestReviewFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });
});