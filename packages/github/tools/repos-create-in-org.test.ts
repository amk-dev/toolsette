import { describe, it, expect } from "vitest";
import { createOrgRepo } from "./org-repo-create";

const createOrgRepoFunction = createOrgRepo.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_TEST_ORG = process.env.GITHUB_TEST_ORG;

if (!GITHUB_TOKEN || !GITHUB_TEST_ORG) {
  throw new Error("GITHUB_TOKEN and GITHUB_TEST_ORG environment variables are required to run tests");
}

describe("createOrgRepoFunction Integration Tests", () => {
  const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };

  it("should create repository with minimal required parameters", async () => {
    const repoName = `test-repo-minimal-${Date.now()}`;
    const input = {
      org: GITHUB_TEST_ORG,
      name: repoName,
    };
    const result = await createOrgRepoFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should create repository with comprehensive optional parameters", async () => {
    const repoName = `test-repo-full-${Date.now()}`;
    const input = {
      org: GITHUB_TEST_ORG,
      name: repoName,
      description: "A comprehensive test repository",
      homepage: "https://example.com",
      private: true,
      visibility: "private",
      has_issues: false,
      has_projects: false,
      has_wiki: false,
      has_downloads: false,
      is_template: true,
      auto_init: true,
      gitignore_template: "Node",
      license_template: "mit",
      allow_squash_merge: false,
      allow_merge_commit: false,
      allow_rebase_merge: false,
      allow_auto_merge: true,
      delete_branch_on_merge: true,
      use_squash_pr_title_as_default: true,
      squash_merge_commit_title: "PR_TITLE",
      squash_merge_commit_message: "PR_BODY",
      merge_commit_title: "PR_TITLE",
      merge_commit_message: "PR_BODY",
      custom_properties: { testing: "comprehensive", number: 42 },
    };
    const result = await createOrgRepoFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should error when creating a repository that already exists", async () => {
    const repoName = `test-repo-duplicate-${Date.now()}`;
    const input = {
      org: GITHUB_TEST_ORG,
      name: repoName,
    };
    const firstResult = await createOrgRepoFunction(input, { auth });
    const secondResult = await createOrgRepoFunction(input, { auth });
    expect(firstResult).toMatchInlineSnapshot();
    expect(secondResult).toMatchInlineSnapshot();
  });

  it("should handle invalid authentication token", async () => {
    const repoName = `test-repo-invalid-auth-${Date.now()}`;
    const input = {
      org: GITHUB_TEST_ORG,
      name: repoName,
    };
    const invalidAuth = { type: "Bearer", apiKey: "invalid-token" };
    const result = await createOrgRepoFunction(input, { auth: invalidAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle error for non-existent organization", async () => {
    const repoName = `test-repo-nonexistent-org-${Date.now()}`;
    const bogusOrg = `nonexistent-org-${Date.now()}`;
    const input = {
      org: bogusOrg,
      name: repoName,
    };
    const result = await createOrgRepoFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should succeed when optional string parameters are empty", async () => {
    const repoName = `test-repo-empty-string-${Date.now()}`;
    const input = {
      org: GITHUB_TEST_ORG,
      name: repoName,
      description: "",
      homepage: "",
    };
    const result = await createOrgRepoFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });
});