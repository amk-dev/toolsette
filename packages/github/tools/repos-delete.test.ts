import { describe, it, expect } from "vitest";
import { ofetch } from "ofetch";
import { deleteRepo } from "./repos-delete";

const deleteRepoFunction = deleteRepo.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

if (!GITHUB_USERNAME) {
  throw new Error("GITHUB_USERNAME environment variable is required to run tests");
}

async function createTestRepo(repoName: string, auth: { type: "Bearer"; apiKey: string }) {
  await ofetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${auth.apiKey}`,
    },
    body: {
      name: repoName,
      auto_init: false,
    },
  });
}

describe("deleteRepoFunction Integration Tests", () => {
  const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };

  it("should successfully delete an existing repository", async () => {
    const repoName = `toolsette-delete-test-${Date.now()}`;
    await createTestRepo(repoName, auth);
    const result = await deleteRepoFunction({ owner: GITHUB_USERNAME, repo: repoName }, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle repository not found", async () => {
    const repoName = `non-existent-repo-${Date.now()}`;
    const result = await deleteRepoFunction({ owner: GITHUB_USERNAME, repo: repoName }, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const repoName = `non-existent-repo-invalid-auth-${Date.now()}`;
    const result = await deleteRepoFunction(
      { owner: GITHUB_USERNAME, repo: repoName },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle empty parameters", async () => {
    const result = await deleteRepoFunction({ owner: "", repo: "" }, { auth });
    expect(result).toMatchInlineSnapshot();
  });
});