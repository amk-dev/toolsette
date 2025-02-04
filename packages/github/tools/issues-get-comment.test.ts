```typescript
import { describe, it, expect } from "vitest";
import { getIssueComment } from "./get_issue_comment";

const getIssueCommentFunction = getIssueComment.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_COMMENT_ID = process.env.GITHUB_COMMENT_ID;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

if (!GITHUB_OWNER) {
  throw new Error("GITHUB_OWNER environment variable is required to run tests");
}

if (!GITHUB_REPO) {
  throw new Error("GITHUB_REPO environment variable is required to run tests");
}

if (!GITHUB_COMMENT_ID) {
  throw new Error("GITHUB_COMMENT_ID environment variable is required to run tests");
}

describe("getIssueCommentFunction Integration Tests", () => {
  const validAuth = {
    type: "Bearer" as const,
    apiKey: GITHUB_TOKEN,
  };

  it("should fetch an issue comment with valid parameters", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      comment_id: Number(GITHUB_COMMENT_ID),
    };

    const result = await getIssueCommentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent comment", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      comment_id: 9999999999,
    };

    const result = await getIssueCommentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      comment_id: Number(GITHUB_COMMENT_ID),
    };

    const result = await getIssueCommentFunction(input, { auth: { type: "Bearer", apiKey: "invalid-token" } });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle comment_id as 0 (edge case)", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      comment_id: 0,
    };

    const result = await getIssueCommentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle negative comment_id (edge case)", async () => {
    const input = {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      comment_id: -1,
    };

    const result = await getIssueCommentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });
});
```