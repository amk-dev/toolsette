import { describe, it, expect } from "vitest";
import { ofetch } from "ofetch";
import { removeLabel } from "./issues-remove_label";

const removeLabelFunction = removeLabel.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TEST_REPO_OWNER = process.env.TEST_REPO_OWNER;
const TEST_REPO_NAME = process.env.TEST_REPO_NAME;
const TEST_ISSUE_NUMBER = process.env.TEST_ISSUE_NUMBER ? Number(process.env.TEST_ISSUE_NUMBER) : NaN;

if (!GITHUB_TOKEN || !TEST_REPO_OWNER || !TEST_REPO_NAME || !TEST_ISSUE_NUMBER) {
  throw new Error("GITHUB_TOKEN, TEST_REPO_OWNER, TEST_REPO_NAME, and TEST_ISSUE_NUMBER environment variables are required to run tests");
}

async function addLabelToIssue(label: string, owner: string, repo: string, issue_number: number, token: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/labels`;
  const headers = {
    "Accept": "application/vnd.github.v3+json",
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  return await ofetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify([label]),
    parseResponse: (body) => body
  });
}

describe("removeLabelFunction Integration Tests", () => {
  const auth = {
    type: "Bearer" as const,
    apiKey: GITHUB_TOKEN,
  };

  it("should successfully remove an existing label from an issue", async () => {
    // First add a label that we will remove.
    const testLabel = "integration-test-label-success";
    await addLabelToIssue(testLabel, TEST_REPO_OWNER, TEST_REPO_NAME, TEST_ISSUE_NUMBER, GITHUB_TOKEN);
    const result = await removeLabelFunction(
      {
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO_NAME,
        issue_number: TEST_ISSUE_NUMBER,
        name: testLabel,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should return 404 when label does not exist", async () => {
    const result = await removeLabelFunction(
      {
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO_NAME,
        issue_number: TEST_ISSUE_NUMBER,
        name: "non-existent-label-integration-test",
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should error with invalid auth token", async () => {
    const result = await removeLabelFunction(
      {
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO_NAME,
        issue_number: TEST_ISSUE_NUMBER,
        name: "non-existent-label-integration-test",
      },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle removal on non-existent issue", async () => {
    const result = await removeLabelFunction(
      {
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO_NAME,
        issue_number: 99999999,
        name: "integration-test-label",
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle boundary case with issue_number as 0", async () => {
    const result = await removeLabelFunction(
      {
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO_NAME,
        issue_number: 0,
        name: "integration-test-label-boundary",
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should remove one label leaving others intact", async () => {
    const labelToKeep = "integration-test-label-keep";
    const labelToRemove = "integration-test-label-remove";
    // Add both labels
    await addLabelToIssue(labelToKeep, TEST_REPO_OWNER, TEST_REPO_NAME, TEST_ISSUE_NUMBER, GITHUB_TOKEN);
    await addLabelToIssue(labelToRemove, TEST_REPO_OWNER, TEST_REPO_NAME, TEST_ISSUE_NUMBER, GITHUB_TOKEN);
    // Remove one label
    const result = await removeLabelFunction(
      {
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO_NAME,
        issue_number: TEST_ISSUE_NUMBER,
        name: labelToRemove,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});