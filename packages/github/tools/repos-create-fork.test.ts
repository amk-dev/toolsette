import { describe, it, expect } from "vitest";
import { createFork } from "./fork-create";

const createForkFunction = createFork.function;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

const auth = {
  type: "Bearer" as const,
  apiKey: GITHUB_TOKEN,
};

describe("createForkFunction Integration Tests", () => {
  it("should create a fork with required parameters only", async () => {
    const result = await createForkFunction(
      { owner: "octocat", repo: "Hello-World" },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should create a fork with a new name", async () => {
    const uniqueName = "test-fork-" + Date.now();
    const result = await createForkFunction(
      { owner: "octocat", repo: "Hello-World", name: uniqueName },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should create a fork with default_branch_only flag true", async () => {
    const result = await createForkFunction(
      { owner: "octocat", repo: "Hello-World", default_branch_only: true },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail with invalid auth token", async () => {
    const result = await createForkFunction(
      { owner: "octocat", repo: "Hello-World" },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail with non-existing repository", async () => {
    const result = await createForkFunction(
      { owner: "octocat", repo: "nonexistent-repo-abc123" },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  if (process.env.GITHUB_ORG) {
    it("should create a fork in an organization", async () => {
      const result = await createForkFunction(
        { owner: "octocat", repo: "Hello-World", organization: process.env.GITHUB_ORG },
        { auth }
      );
      expect(result).toMatchInlineSnapshot();
    });
  } else {
    it.skip("should create a fork in an organization", async () => {});
  }
});