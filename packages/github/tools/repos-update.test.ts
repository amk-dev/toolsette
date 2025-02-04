```typescript
import { describe, it, expect } from "vitest";
import { updateRepo } from "./gists-update";

const updateRepoFunction = updateRepo.function;

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

describe("updateRepoFunction Integration Tests", () => {
  it("should update repository description successfully", async () => {
    const result = await updateRepoFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        description: "Integration test update: Test Description 1",
      },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should update repository with multiple fields", async () => {
    const result = await updateRepoFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        description: "Integration test update: Multi-field update",
        homepage: "https://example.com",
      },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should update repository with no changes when only required parameters are provided", async () => {
    const result = await updateRepoFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
      },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid authentication token", async () => {
    const result = await updateRepoFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        description: "Invalid auth test",
      },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle non-existent repository error", async () => {
    const result = await updateRepoFunction(
      {
        owner: GITHUB_OWNER,
        repo: "non-existent-repo-integration-test",
      },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return error when API key is missing", async () => {
    const result = await updateRepoFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        description: "Missing API key test",
      },
      { auth: { type: "Bearer", apiKey: "" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should update repository with security_and_analysis set to null", async () => {
    const result = await updateRepoFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        security_and_analysis: null,
        description: "Integration test update: security_and_analysis null",
      },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should update repository boolean flags", async () => {
    const result = await updateRepoFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        has_issues: false,
        allow_auto_merge: true,
        delete_branch_on_merge: true,
        description: "Integration test update: boolean flags update",
      },
      { auth: { type: "Bearer", apiKey: GITHUB_TOKEN } }
    );
    expect(result).toMatchInlineSnapshot();
  });
});
```