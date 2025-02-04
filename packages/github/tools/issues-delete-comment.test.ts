import { describe, it, expect } from "vitest";
import { ofetch } from "ofetch";
import { deleteIssueComment } from "./gists-delete_issue_comment";

const deleteCommentFunction = deleteIssueComment.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TEST_REPO_OWNER = process.env.TEST_REPO_OWNER;
const TEST_REPO = process.env.TEST_REPO;
const TEST_ISSUE_NUMBER = process.env.TEST_ISSUE_NUMBER;

if (!GITHUB_TOKEN || !TEST_REPO_OWNER || !TEST_REPO || !TEST_ISSUE_NUMBER) {
  throw new Error(
    "GITHUB_TOKEN, TEST_REPO_OWNER, TEST_REPO, and TEST_ISSUE_NUMBER environment variables are required to run tests"
  );
}

async function createIssueComment(): Promise<number> {
  const url = `https://api.github.com/repos/${TEST_REPO_OWNER}/${TEST_REPO}/issues/${TEST_ISSUE_NUMBER}/comments`;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${GITHUB_TOKEN}`,
  };
  const body = { body: "Integration test comment - will be deleted" };
  const response = await ofetch(url, {
    method: "POST",
    headers,
    body,
  });
  return response.id;
}

describe("deleteCommentFunction Integration Tests", () => {
  const validAuth = { auth: { type: "Bearer" as const, apiKey: GITHUB_TOKEN } };

  it("should delete a comment successfully", async () => {
    const commentId = await createIssueComment();
    const result = await deleteCommentFunction(
      {
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO,
        comment_id: commentId,
      },
      validAuth
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for non-existent comment", async () => {
    const result = await deleteCommentFunction(
      {
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO,
        comment_id: 999999999999,
      },
      validAuth
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const commentId = await createIssueComment();
    let result;
    try {
      result = await deleteCommentFunction(
        {
          owner: TEST_REPO_OWNER,
          repo: TEST_REPO,
          comment_id: commentId,
        },
        { auth: { type: "Bearer", apiKey: "invalid-token" } }
      );
      expect(result).toMatchInlineSnapshot();
    } finally {
      // Cleanup: ensure the comment is deleted
      try {
        await deleteCommentFunction(
          { owner: TEST_REPO_OWNER, repo: TEST_REPO, comment_id: commentId },
          validAuth
        );
      } catch (_) {}
    }
  });

  it("should error on deletion with negative comment_id", async () => {
    const result = await deleteCommentFunction(
      {
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO,
        comment_id: -1,
      },
      validAuth
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should error when repository does not exist", async () => {
    const result = await deleteCommentFunction(
      {
        owner: TEST_REPO_OWNER,
        repo: "non-existent-repo-xyz",
        comment_id: 1,
      },
      validAuth
    );
    expect(result).toMatchInlineSnapshot();
  });
});