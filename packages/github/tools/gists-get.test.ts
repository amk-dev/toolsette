import { describe, it, expect } from "vitest";
import { getGist } from "./gists-get";

const getGistFunction = getGist.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

describe("getGistFunction Integration Tests", () => {
  it("should fetch gist successfully with valid token and valid gist id", async () => {
    const result = await getGistFunction(
      { gist_id: "aa5a315d61ae9438b18d" },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid authentication token", async () => {
    const result = await getGistFunction(
      { gist_id: "aa5a315d61ae9438b18d" },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent gist id", async () => {
    const result = await getGistFunction(
      { gist_id: "nonexistentgistid" },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle empty gist id", async () => {
    const result = await getGistFunction(
      { gist_id: "" },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle extremely long gist id", async () => {
    const longGistId = "a".repeat(1000);
    const result = await getGistFunction(
      { gist_id: longGistId },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch gist successfully without auth token", async () => {
    const result = await getGistFunction(
      { gist_id: "aa5a315d61ae9438b18d" },
      { auth: { type: "Bearer", apiKey: "" } }
    );
    expect(result).toMatchInlineSnapshot();
  });
});