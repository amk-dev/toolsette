import { describe, it, expect } from "vitest";
import { createLabel } from "./gists-create-label";

const createLabelFunction = createLabel.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_TEST_OWNER = process.env.GITHUB_TEST_OWNER;
const GITHUB_TEST_REPO = process.env.GITHUB_TEST_REPO;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}
if (!GITHUB_TEST_OWNER) {
  throw new Error("GITHUB_TEST_OWNER environment variable is required to run tests");
}
if (!GITHUB_TEST_REPO) {
  throw new Error("GITHUB_TEST_REPO environment variable is required to run tests");
}

describe("createLabelFunction Integration Tests", () => {
  const auth = {
    type: "Bearer" as const,
    apiKey: GITHUB_TOKEN,
  };

  it("should successfully create a label with valid parameters", async () => {
    const uniqueLabelName = `integration-test-label-${Date.now()}`;
    const input = {
      owner: GITHUB_TEST_OWNER,
      repo: GITHUB_TEST_REPO,
      name: uniqueLabelName,
      color: "BADA55",
    };
    const result = await createLabelFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should successfully create a label with a description provided", async () => {
    const uniqueLabelName = `integration-test-label-desc-${Date.now()}`;
    const input = {
      owner: GITHUB_TEST_OWNER,
      repo: GITHUB_TEST_REPO,
      name: uniqueLabelName,
      color: "C0FFEE",
      description: "This is a test label with a description",
    };
    const result = await createLabelFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail with invalid auth token", async () => {
    const uniqueLabelName = `integration-test-label-invalid-auth-${Date.now()}`;
    const input = {
      owner: GITHUB_TEST_OWNER,
      repo: GITHUB_TEST_REPO,
      name: uniqueLabelName,
      color: "00FF00",
    };
    const result = await createLabelFunction(input, {
      auth: { type: "Bearer", apiKey: "invalid-token" },
    });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent repository error", async () => {
    const uniqueRepoName = `non-existent-repo-${Date.now()}`;
    const uniqueLabelName = `integration-test-label-nonexistent-repo-${Date.now()}`;
    const input = {
      owner: GITHUB_TEST_OWNER,
      repo: uniqueRepoName,
      name: uniqueLabelName,
      color: "FFAA00",
    };
    const result = await createLabelFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle duplicate label creation error", async () => {
    const uniqueLabelName = `integration-test-label-duplicate-${Date.now()}`;
    const input = {
      owner: GITHUB_TEST_OWNER,
      repo: GITHUB_TEST_REPO,
      name: uniqueLabelName,
      color: "FF5733",
    };
    // First creation
    await createLabelFunction(input, { auth });
    // Duplicate creation should result in an error
    const secondResult = await createLabelFunction(input, { auth });
    expect(secondResult).toMatchInlineSnapshot();
  });

  it("should successfully create a label with maximum length description (100 characters)", async () => {
    const uniqueLabelName = `integration-test-label-max-desc-${Date.now()}`;
    const maxDescription = "a".repeat(100);
    const input = {
      owner: GITHUB_TEST_OWNER,
      repo: GITHUB_TEST_REPO,
      name: uniqueLabelName,
      color: "123ABC",
      description: maxDescription,
    };
    const result = await createLabelFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail with invalid hexadecimal color code", async () => {
    const uniqueLabelName = `integration-test-label-invalid-color-${Date.now()}`;
    const input = {
      owner: GITHUB_TEST_OWNER,
      repo: GITHUB_TEST_REPO,
      name: uniqueLabelName,
      color: "ZZZZZZ",
    };
    const result = await createLabelFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });
});