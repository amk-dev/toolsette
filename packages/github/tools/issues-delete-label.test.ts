import { describe, it, expect } from "vitest";
import { ofetch } from "ofetch";
import { deleteLabel } from "./gists-delete";

const deleteLabelFunction = deleteLabel.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}
if (!GITHUB_OWNER) {
  throw new Error("GITHUB_OWNER environment variable is required to run tests");
}
if (!GITHUB_REPO) {
  throw new Error("GITHUB_REPO environment variable is required to run tests");
}

async function createLabel(label: string): Promise<void> {
  const url = `https://api.github.com/repos/${encodeURIComponent(
    GITHUB_OWNER
  )}/${encodeURIComponent(GITHUB_REPO)}/labels`;
  try {
    await ofetch(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: label, color: "f29513" }),
    });
  } catch (error: unknown) {
    if (error instanceof Error && /already exists/i.test(error.message)) return;
    throw error;
  }
}

describe("deleteLabelFunction Integration Tests", () => {
  it("should delete label successfully", async () => {
    const label = `test-label-${Date.now()}`;
    await createLabel(label);
    const result = await deleteLabelFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        name: label,
      },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return an error when label does not exist", async () => {
    const label = `non-existent-label-${Date.now()}`;
    const result = await deleteLabelFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        name: label,
      },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const label = `test-label-invalid-auth-${Date.now()}`;
    await createLabel(label);
    const result = await deleteLabelFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        name: label,
      },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
    if (result.isErr()) {
      await deleteLabelFunction(
        {
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          name: label,
        },
        { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
      );
    }
  });

  it("should delete label with special characters in label name", async () => {
    const label = `test/label+special-${Date.now()}`;
    await createLabel(label);
    const result = await deleteLabelFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        name: label,
      },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return an error when repository does not exist", async () => {
    const label = `test-label-repo-not-found-${Date.now()}`;
    const result = await deleteLabelFunction(
      {
        owner: GITHUB_OWNER,
        repo: `non-existent-repo-${Date.now()}`,
        name: label,
      },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });
});