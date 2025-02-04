import { describe, it, expect } from "vitest";
import { updateLabel } from "./update_label";

const updateLabelFunction = updateLabel.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_REPO_OWNER;
const REPO = process.env.GITHUB_REPO_NAME;
const ORIGINAL_LABEL_NAME = process.env.GITHUB_LABEL_NAME;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}
if (!OWNER) {
  throw new Error("GITHUB_REPO_OWNER environment variable is required to run tests");
}
if (!REPO) {
  throw new Error("GITHUB_REPO_NAME environment variable is required to run tests");
}
if (!ORIGINAL_LABEL_NAME) {
  throw new Error("GITHUB_LABEL_NAME environment variable is required to run tests");
}

describe("updateLabelFunction Integration Tests", () => {
  const auth = {
    type: "Bearer" as const,
    apiKey: GITHUB_TOKEN,
  };

  it("should update a label's new_name, description and color and then revert the changes", async () => {
    const tempNewName = `${ORIGINAL_LABEL_NAME}-temp-update`;
    const updateResult = await updateLabelFunction(
      {
        owner: OWNER,
        repo: REPO,
        name: ORIGINAL_LABEL_NAME,
        new_name: tempNewName,
        description: "Temporary updated description",
        color: "abcdef",
      },
      { auth }
    );
    expect(updateResult).toMatchInlineSnapshot();
    const revertResult = await updateLabelFunction(
      {
        owner: OWNER,
        repo: REPO,
        name: tempNewName,
        new_name: ORIGINAL_LABEL_NAME,
        description: "Reverted description",
        color: "000000",
      },
      { auth }
    );
    expect(revertResult).toMatchInlineSnapshot();
  });

  it("should update label with empty payload (no changes)", async () => {
    const result = await updateLabelFunction(
      {
        owner: OWNER,
        repo: REPO,
        name: ORIGINAL_LABEL_NAME,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error when updating a non-existent label", async () => {
    const result = await updateLabelFunction(
      {
        owner: OWNER,
        repo: REPO,
        name: "nonexistent-label-123456",
        description: "Should fail update",
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail when using an invalid auth token", async () => {
    const invalidAuth = {
      type: "Bearer" as const,
      apiKey: "invalid-token",
    };
    const result = await updateLabelFunction(
      {
        owner: OWNER,
        repo: REPO,
        name: ORIGINAL_LABEL_NAME,
        description: "Attempt update with invalid auth",
      },
      { auth: invalidAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should update label with maximum length description", async () => {
    const longDescription = "a".repeat(100);
    const tempNewName = `${ORIGINAL_LABEL_NAME}-long-desc`;
    const updateResult = await updateLabelFunction(
      {
        owner: OWNER,
        repo: REPO,
        name: ORIGINAL_LABEL_NAME,
        new_name: tempNewName,
        description: longDescription,
      },
      { auth }
    );
    expect(updateResult).toMatchInlineSnapshot();
    const revertResult = await updateLabelFunction(
      {
        owner: OWNER,
        repo: REPO,
        name: tempNewName,
        new_name: ORIGINAL_LABEL_NAME,
      },
      { auth }
    );
    expect(revertResult).toMatchInlineSnapshot();
  });
});