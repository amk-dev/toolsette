import { describe, it, expect } from "vitest";
import { removeAssignees } from "./gists-remove_assignees";

const removeAssigneesFunction = removeAssignees.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_ISSUE_NUMBER = process.env.GITHUB_ISSUE_NUMBER;
const GITHUB_ASSIGNEE = process.env.GITHUB_ASSIGNEE;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}
if (!GITHUB_OWNER) {
  throw new Error("GITHUB_OWNER environment variable is required to run tests");
}
if (!GITHUB_REPO) {
  throw new Error("GITHUB_REPO environment variable is required to run tests");
}
if (!GITHUB_ISSUE_NUMBER) {
  throw new Error("GITHUB_ISSUE_NUMBER environment variable is required to run tests");
}
if (!GITHUB_ASSIGNEE) {
  throw new Error("GITHUB_ASSIGNEE environment variable is required to run tests");
}

const validAuth = {
  type: "Bearer" as const,
  apiKey: GITHUB_TOKEN,
};

const invalidAuth = {
  type: "Bearer" as const,
  apiKey: "invalid-token",
};

const emptyAuth = {
  type: "Bearer" as const,
  apiKey: "",
};

describe("removeAssigneesFunction Integration Tests", () => {
  it("should successfully remove a single valid assignee", async () => {
    const result = await removeAssigneesFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        issue_number: Number(GITHUB_ISSUE_NUMBER),
        assignees: [GITHUB_ASSIGNEE],
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should successfully handle an empty assignees array", async () => {
    const result = await removeAssigneesFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        issue_number: Number(GITHUB_ISSUE_NUMBER),
        assignees: [],
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should successfully remove multiple assignees (one valid, one nonexistent)", async () => {
    const result = await removeAssigneesFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        issue_number: Number(GITHUB_ISSUE_NUMBER),
        assignees: [GITHUB_ASSIGNEE, "nonexistent-assignee"],
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail with an invalid auth token", async () => {
    const result = await removeAssigneesFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        issue_number: Number(GITHUB_ISSUE_NUMBER),
        assignees: [GITHUB_ASSIGNEE],
      },
      { auth: invalidAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail with invalid repository details", async () => {
    const result = await removeAssigneesFunction(
      {
        owner: "nonexistent-owner-xyz",
        repo: "nonexistent-repo-xyz",
        issue_number: 1,
        assignees: [GITHUB_ASSIGNEE],
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail when auth token is missing", async () => {
    const result = await removeAssigneesFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        issue_number: Number(GITHUB_ISSUE_NUMBER),
        assignees: [GITHUB_ASSIGNEE],
      },
      { auth: emptyAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail with an invalid issue number (0)", async () => {
    const result = await removeAssigneesFunction(
      {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        issue_number: 0,
        assignees: [GITHUB_ASSIGNEE],
      },
      { auth: validAuth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});