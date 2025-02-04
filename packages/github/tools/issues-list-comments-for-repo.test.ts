import { describe, it, expect } from "vitest";
import { listIssueCommentsForRepo } from "./list-issue-comments-for-repo";

const listIssueCommentsForRepoFunction = listIssueCommentsForRepo.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

const validAuth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };

describe("listIssueCommentsForRepo Integration Tests", () => {
  it("should fetch issue comments with default parameters", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      sort: "created",
      per_page: 30,
      page: 1,
    };
    const result = await listIssueCommentsForRepoFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issue comments sorted by updated", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      sort: "updated",
      per_page: 10,
      page: 1,
    };
    const result = await listIssueCommentsForRepoFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issue comments with direction parameter", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      sort: "created",
      direction: "desc",
      per_page: 5,
      page: 1,
    };
    const result = await listIssueCommentsForRepoFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issue comments with since parameter", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      since: "2023-01-01T00:00:00Z",
      sort: "created",
      per_page: 30,
      page: 1,
    };
    const result = await listIssueCommentsForRepoFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issue comments with per_page minimum (1)", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      sort: "created",
      per_page: 1,
      page: 1,
    };
    const result = await listIssueCommentsForRepoFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issue comments with per_page maximum (100)", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      sort: "created",
      per_page: 100,
      page: 1,
    };
    const result = await listIssueCommentsForRepoFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issue comments with page parameter greater than available results", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      sort: "created",
      per_page: 30,
      page: 1000,
    };
    const result = await listIssueCommentsForRepoFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle error scenario with invalid repository", async () => {
    const input = {
      owner: "nonexistent-owner",
      repo: "nonexistent-repo",
      sort: "created",
      per_page: 30,
      page: 1,
    };
    const result = await listIssueCommentsForRepoFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle authentication with invalid token", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      sort: "created",
      per_page: 30,
      page: 1,
    };
    const invalidAuth = { type: "Bearer" as const, apiKey: "invalid-token" };
    const result = await listIssueCommentsForRepoFunction(input, { auth: invalidAuth });
    expect(result).toMatchInlineSnapshot();
  });
});