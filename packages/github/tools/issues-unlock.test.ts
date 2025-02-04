import { describe, it, expect } from "vitest";
import { ofetch } from "ofetch";
import { unlockIssue } from "./unlock_issue";

const unlockIssueFunction = unlockIssue.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const ISSUE_NUMBER_STR = process.env.GITHUB_ISSUE_NUMBER;

if (!GITHUB_TOKEN)
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
if (!GITHUB_OWNER)
  throw new Error("GITHUB_OWNER environment variable is required to run tests");
if (!GITHUB_REPO)
  throw new Error("GITHUB_REPO environment variable is required to run tests");
if (!ISSUE_NUMBER_STR)
  throw new Error("GITHUB_ISSUE_NUMBER environment variable is required to run tests");

const GITHUB_ISSUE_NUMBER = Number(ISSUE_NUMBER_STR);
if (isNaN(GITHUB_ISSUE_NUMBER))
  throw new Error("GITHUB_ISSUE_NUMBER must be a number");

describe("unlockIssueFunction Integration Tests", () => {
  const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };

  it("should successfully unlock a locked issue with valid parameters", async () => {
    // Lock the issue first to ensure it is locked
    const lockUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${GITHUB_ISSUE_NUMBER}/lock`;
    await ofetch(lockUrl, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    const result = await unlockIssueFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        issue_number: GITHUB_ISSUE_NUMBER,
      },
      { auth }
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "_tag": "Ok",
        "value": "Issue unlocked successfully",
      }
    `);
  });

  it("should handle unlocking an already unlocked issue", async () => {
    // The issue should now be unlocked from the previous test
    const result = await unlockIssueFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        issue_number: GITHUB_ISSUE_NUMBER,
      },
      { auth }
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "_tag": "Err",
        "error": [Error: Not Found],
      }
    `);
  });

  it("should return error with invalid authentication", async () => {
    const result = await unlockIssueFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        issue_number: GITHUB_ISSUE_NUMBER,
      },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "_tag": "Err",
        "error": [Error: Bad credentials],
      }
    `);
  });

  it("should return error for non-existent repository", async () => {
    const result = await unlockIssueFunction(
      {
        owner: "nonexistentowner123",
        repo: "nonexistentrepo123",
        issue_number: 1,
      },
      { auth }
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "_tag": "Err",
        "error": [Error: Not Found],
      }
    `);
  });

  it("should return error for issue_number as 0", async () => {
    const result = await unlockIssueFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        issue_number: 0,
      },
      { auth }
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "_tag": "Err",
        "error": [Error: Not Found],
      }
    `);
  });
});