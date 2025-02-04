import { describe, it, expect } from "vitest";
import { ofetch } from "ofetch";
import { deleteGist } from "./gists-delete";

const deleteGistFunction = deleteGist.function;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

const auth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };

describe("deleteGistFunction Integration Tests", () => {
  it("should successfully delete an existing gist", async () => {
    const createUrl = "https://api.github.com/gists";
    const createHeaders = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    };
    const createBody = {
      description: "Test gist for successful deletion",
      public: false,
      files: { "test.txt": { content: "Integration test content" } },
    };
    const createdGist = await ofetch(createUrl, {
      method: "POST",
      headers: createHeaders,
      body: createBody,
    });
    const gistId = createdGist.id;
    const result = await deleteGistFunction({ gist_id: gistId }, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle deletion of an already deleted gist", async () => {
    const createUrl = "https://api.github.com/gists";
    const createHeaders = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    };
    const createBody = {
      description: "Test gist for double deletion",
      public: false,
      files: { "test.txt": { content: "Delete twice" } },
    };
    const createdGist = await ofetch(createUrl, {
      method: "POST",
      headers: createHeaders,
      body: createBody,
    });
    const gistId = createdGist.id;
    await deleteGistFunction({ gist_id: gistId }, { auth });
    const result = await deleteGistFunction({ gist_id: gistId }, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle deletion of a non-existent gist", async () => {
    const result = await deleteGistFunction({ gist_id: "non-existent-gist-id" }, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const createUrl = "https://api.github.com/gists";
    const createHeaders = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    };
    const createBody = {
      description: "Test gist for deletion with invalid auth",
      public: false,
      files: { "test.txt": { content: "Invalid auth test" } },
    };
    const createdGist = await ofetch(createUrl, {
      method: "POST",
      headers: createHeaders,
      body: createBody,
    });
    const gistId = createdGist.id;
    const result = await deleteGistFunction(
      { gist_id: gistId },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle empty gist_id", async () => {
    const result = await deleteGistFunction({ gist_id: "" }, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle gist_id with only whitespace", async () => {
    const result = await deleteGistFunction({ gist_id: "   " }, { auth });
    expect(result).toMatchInlineSnapshot();
  });
});