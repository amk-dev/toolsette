import { describe, it, expect } from "vitest";
import { createIssueComment } from "./create_issue_comment";

const createIssueCommentFunction = createIssueComment.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_TEST_OWNER = process.env.GITHUB_TEST_OWNER;
const GITHUB_TEST_REPO = process.env.GITHUB_TEST_REPO;
const GITHUB_TEST_ISSUE_NUMBER = process.env.GITHUB_TEST_ISSUE_NUMBER;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}
if (!GITHUB_TEST_OWNER) {
  throw new Error("GITHUB_TEST_OWNER environment variable is required to run tests");
}
if (!GITHUB_TEST_REPO) {
  throw new Error("GITHUB_TEST_REPO environment variable is required to run tests");
}
if (!GITHUB_TEST_ISSUE_NUMBER || isNaN(Number(GITHUB_TEST_ISSUE_NUMBER))) {
  throw new Error("GITHUB_TEST_ISSUE_NUMBER environment variable is required and must be a number");
}

describe("createIssueCommentFunction Integration Tests", () => {
  const validAuth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };
  const validInput = {
    owner: GITHUB_TEST_OWNER,
    repo: GITHUB_TEST_REPO,
    issue_number: Number(GITHUB_TEST_ISSUE_NUMBER),
    body: "Integration Test Comment",
  };

  it("should create an issue comment with valid parameters", async () => {
    const result = await createIssueCommentFunction(validInput, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should create an issue comment with a different body text", async () => {
    const input = { ...validInput, body: "Another integration test comment." };
    const result = await createIssueCommentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid authentication token", async () => {
    const invalidAuth = { type: "Bearer" as const, apiKey: "invalid-token" };
    const result = await createIssueCommentFunction(validInput, { auth: invalidAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail to create comment with empty body", async () => {
    const input = { ...validInput, body: "" };
    const result = await createIssueCommentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail to create comment for non-existent issue number", async () => {
    const input = { ...validInput, issue_number: 9999999, body: "Test comment for non-existent issue" };
    const result = await createIssueCommentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail to create comment with a negative issue number", async () => {
    const input = { ...validInput, issue_number: -1, body: "Test comment with negative issue number" };
    const result = await createIssueCommentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should create an issue comment with a long body", async () => {
    const input = { ...validInput, body: "A".repeat(1000) };
    const result = await createIssueCommentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });
});