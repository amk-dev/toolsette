import { describe, it, expect } from "vitest";
import { getRepositoryContent } from "./get_repository_content";

const getRepoContentFunction = getRepositoryContent.function;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

describe("getRepositoryContentFunction Integration Tests", () => {
  const validAuth = { type: "Bearer", apiKey: GITHUB_TOKEN };

  it("should fetch file content from a valid repository", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      path: "README",
    };
    const result = await getRepoContentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch repository root directory when path is empty", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      path: "",
    };
    const result = await getRepoContentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch file content using ref parameter", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      path: "README",
      ref: "master",
    };
    const result = await getRepoContentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid authentication token", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      path: "README",
    };
    const invalidAuth = { type: "Bearer", apiKey: "invalid-token" };
    const result = await getRepoContentFunction(input, { auth: invalidAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for non-existent repository", async () => {
    const input = {
      owner: "nonexistentowner",
      repo: "nonexistentrepo",
      path: "README",
    };
    const result = await getRepoContentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error for non-existent file or path", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      path: "nonexistent-path",
    };
    const result = await getRepoContentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should properly encode multi-segment path with special characters", async () => {
    const input = {
      owner: "octocat",
      repo: "Hello-World",
      path: "some folder/another folder/file with spaces.txt",
    };
    const result = await getRepoContentFunction(input, { auth: validAuth });
    expect(result).toMatchInlineSnapshot();
  });
});