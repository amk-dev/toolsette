import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ofetch } from "ofetch";
import { lockIssue } from "./lock_issue";

const lockIssueFunction = lockIssue.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;
const ISSUE_NUMBER = Number(process.env.GITHUB_ISSUE_NUMBER);

if (
  !GITHUB_TOKEN ||
  !REPO_OWNER ||
  !REPO_NAME ||
  Number.isNaN(ISSUE_NUMBER)
) {
  throw new Error(
    "GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME, and GITHUB_ISSUE_NUMBER environment variables are required to run tests"
  );
}

async function unlockIssueDirectly(issue_number: number) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issue_number}/lock`;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${GITHUB_TOKEN}`,
  };
  try {
    await ofetch(url, {
      method: "DELETE",
      headers,
      parseResponse: (text: string) => text,
    });
  } catch (_) {
    // ignore errors during unlock
  }
}

describe("lockIssueFunction Integration Tests", () => {
  beforeEach(async () => {
    // Ensure the primary test issue is unlocked before each test
    await unlockIssueDirectly(ISSUE_NUMBER);
  });

  afterEach(async () => {
    // Clean up: unlock the primary test issue after each test
    await unlockIssueDirectly(ISSUE_NUMBER);
  });

  it("should lock an unlocked issue without lock_reason", async () => {
    const input = {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: ISSUE_NUMBER,
    };
    const auth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };
    const result = await lockIssueFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should lock an unlocked issue with lock_reason", async () => {
    const input = {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: ISSUE_NUMBER,
      lock_reason: "off-topic" as const,
    };
    const auth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };
    const result = await lockIssueFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error when locking an already locked issue", async () => {
    const input = {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: ISSUE_NUMBER,
    };
    const auth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };
    // First lock attempt should succeed.
    await lockIssueFunction(input, { auth });
    // Second lock attempt on the already locked issue should error.
    const result = await lockIssueFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for non-existent issue (issue_number 0)", async () => {
    const input = {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: 0,
    };
    const auth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };
    const result = await lockIssueFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for an extremely large issue_number", async () => {
    const input = {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: Number.MAX_SAFE_INTEGER,
    };
    const auth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };
    const result = await lockIssueFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const input = {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: ISSUE_NUMBER,
    };
    const auth = { type: "Bearer" as const, apiKey: "invalid-token" };
    const result = await lockIssueFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });
});