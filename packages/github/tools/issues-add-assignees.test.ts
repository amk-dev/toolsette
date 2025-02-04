import { describe, it, expect } from "vitest";
import { addAssignees } from "./gists-add_assignees";

const addAssigneesFunction = addAssignees.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;
const ISSUE_NUMBER = process.env.GITHUB_ISSUE_NUMBER;
const VALID_ASSIGNEE = process.env.GITHUB_ASSIGNEE || REPO_OWNER;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}
if (!REPO_OWNER) {
  throw new Error("GITHUB_REPO_OWNER environment variable is required to run tests");
}
if (!REPO_NAME) {
  throw new Error("GITHUB_REPO_NAME environment variable is required to run tests");
}
if (!ISSUE_NUMBER) {
  throw new Error("GITHUB_ISSUE_NUMBER environment variable is required to run tests");
}

describe("addAssigneesFunction Integration Tests", () => {
  const auth = { type: "Bearer" as const, apiKey: GITHUB_TOKEN };

  it("should add a valid single assignee", async () => {
    const result = await addAssigneesFunction(
      {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: Number(ISSUE_NUMBER),
        assignees: [VALID_ASSIGNEE],
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should succeed when no assignees provided", async () => {
    const result = await addAssigneesFunction(
      {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: Number(ISSUE_NUMBER),
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail with invalid authentication token", async () => {
    const result = await addAssigneesFunction(
      {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: Number(ISSUE_NUMBER),
        assignees: [VALID_ASSIGNEE],
      },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail when providing too many assignees", async () => {
    const manyAssignees = Array.from({ length: 11 }, (_, i) => `nonexistentuser${i + 1}`);
    const result = await addAssigneesFunction(
      {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: Number(ISSUE_NUMBER),
        assignees: manyAssignees,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail when issue does not exist", async () => {
    const result = await addAssigneesFunction(
      {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: 9999999,
        assignees: [VALID_ASSIGNEE],
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail when negative issue number is provided", async () => {
    const result = await addAssigneesFunction(
      {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: -1,
        assignees: [VALID_ASSIGNEE],
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle multiple valid assignees (duplicates)", async () => {
    const result = await addAssigneesFunction(
      {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: Number(ISSUE_NUMBER),
        assignees: [VALID_ASSIGNEE, VALID_ASSIGNEE],
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});