import { describe, it, expect } from "vitest";
import { updateGist } from "./gists-update";

const updateGistFunction = updateGist.function;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_ID = process.env.GIST_ID;
const GIST_FILE = process.env.GIST_FILE;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}
if (!GIST_ID) {
  throw new Error("GIST_ID environment variable is required to run tests");
}

describe("updateGistFunction Integration Tests", () => {
  it("should update the gist description only", async () => {
    const input = {
      gist_id: GIST_ID,
      description: "Updated description " + new Date().toISOString()
    };
    const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };
    const result = await updateGistFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  if (GIST_FILE) {
    it("should update the file content only", async () => {
      const input = {
        gist_id: GIST_ID,
        files: {
          [GIST_FILE]: {
            content: "Updated file content " + new Date().toISOString()
          }
        }
      };
      const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };
      const result = await updateGistFunction(input, { auth });
      expect(result).toMatchInlineSnapshot();
    });

    it("should rename a file and then revert the filename", async () => {
      const newFilename = "renamed-" + GIST_FILE;
      const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };
      const renameInput = {
        gist_id: GIST_ID,
        files: {
          [GIST_FILE]: {
            filename: newFilename,
            content: "Renamed file content " + new Date().toISOString()
          }
        }
      };
      const renameResult = await updateGistFunction(renameInput, { auth });
      expect(renameResult).toMatchInlineSnapshot();
      const revertInput = {
        gist_id: GIST_ID,
        files: {
          [newFilename]: {
            filename: GIST_FILE,
            content: "Reverted file content " + new Date().toISOString()
          }
        }
      };
      const revertResult = await updateGistFunction(revertInput, { auth });
      expect(revertResult).toMatchInlineSnapshot();
    });

    it("should add a new file then delete it", async () => {
      const newFileName = "tempFile.txt";
      const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };
      const addInput = {
        gist_id: GIST_ID,
        files: {
          [newFileName]: {
            content: "Temporary file content " + new Date().toISOString()
          }
        }
      };
      const addResult = await updateGistFunction(addInput, { auth });
      expect(addResult).toMatchInlineSnapshot();
      const deleteInput = {
        gist_id: GIST_ID,
        files: {
          [newFileName]: null
        }
      };
      const deleteResult = await updateGistFunction(deleteInput, { auth });
      expect(deleteResult).toMatchInlineSnapshot();
    });
  }

  it("should update both description and file content", async () => {
    const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };
    const input: any = {
      gist_id: GIST_ID,
      description: "Updated description and file " + new Date().toISOString()
    };
    if (GIST_FILE) {
      input.files = {
        [GIST_FILE]: {
          content: "Updated both file content " + new Date().toISOString()
        }
      };
    }
    const result = await updateGistFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail update with invalid auth token", async () => {
    const input = {
      gist_id: GIST_ID,
      description: "This update should fail due to invalid token"
    };
    const invalidAuth = { type: "Bearer", apiKey: "invalid-token" };
    const result = await updateGistFunction(input, { auth: invalidAuth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail update with non-existent gist_id", async () => {
    const input = {
      gist_id: "non-existent-gist-id-1234",
      description: "Trying to update a non-existent gist"
    };
    const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };
    const result = await updateGistFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle empty update input", async () => {
    const input = {
      gist_id: GIST_ID
    };
    const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };
    const result = await updateGistFunction(input, { auth });
    expect(result).toMatchInlineSnapshot();
  });
});