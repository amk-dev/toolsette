import { describe, it, expect } from "vitest";
import { addLabelsToIssue } from "./issues-add-labels";

const addLabelsFunction = addLabelsToIssue.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_TEST_OWNER = process.env.GITHUB_TEST_OWNER;
const GITHUB_TEST_REPO = process.env.GITHUB_TEST_REPO;
const GITHUB_TEST_ISSUE_NUMBER = process.env.GITHUB_TEST_ISSUE_NUMBER;

if (
  !GITHUB_TOKEN ||
  !GITHUB_TEST_OWNER ||
  !GITHUB_TEST_REPO ||
  !GITHUB_TEST_ISSUE_NUMBER
) {
  throw new Error(
    "GITHUB_TOKEN, GITHUB_TEST_OWNER, GITHUB_TEST_REPO, and GITHUB_TEST_ISSUE_NUMBER environment variables are required to run tests"
  );
}

describe("addLabelsToIssue Integration Tests", () => {
  const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };
  const owner = GITHUB_TEST_OWNER;
  const repo = GITHUB_TEST_REPO;
  const issue_number = parseInt(GITHUB_TEST_ISSUE_NUMBER, 10);

  it("should add labels using object with labels key (array of strings)", async () => {
    const result = await addLabelsFunction(
      { owner, repo, issue_number, body: { labels: ["bug", "enhancement"] } },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should add labels using array of strings", async () => {
    const result = await addLabelsFunction(
      { owner, repo, issue_number, body: ["documentation", "question"] },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should add labels using object with labels key (array of objects)", async () => {
    const result = await addLabelsFunction(
      { owner, repo, issue_number, body: { labels: [{ name: "wontfix" }] } },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should add labels using array of objects", async () => {
    const result = await addLabelsFunction(
      { owner, repo, issue_number, body: [{ name: "duplicate" }] },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail when using a single label as string", async () => {
    const result = await addLabelsFunction(
      { owner, repo, issue_number, body: "help wanted" },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const result = await addLabelsFunction(
      { owner, repo, issue_number, body: ["bug"] },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail when the issue does not exist", async () => {
    const result = await addLabelsFunction(
      { owner, repo, issue_number: 9999999, body: ["bug"] },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail when no body is provided", async () => {
    const result = await addLabelsFunction(
      { owner, repo, issue_number },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fail when issue_number is negative", async () => {
    const result = await addLabelsFunction(
      { owner, repo, issue_number: -1, body: ["bug"] },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});