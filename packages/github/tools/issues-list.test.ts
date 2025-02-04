import { describe, it, expect } from "vitest";
import { listIssues } from "./issues-list";

const listIssuesFunction = listIssues.function;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

describe("listIssuesFunction Integration Tests", () => {
  const auth = {
    type: "Bearer" as const,
    apiKey: GITHUB_TOKEN,
  };

  it("should fetch issues with default parameters", async () => {
    const result = await listIssuesFunction(
      { per_page: 30, page: 1 },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issues with custom filter, state, and labels", async () => {
    const result = await listIssuesFunction(
      {
        filter: "created",
        state: "closed",
        labels: "bug,help wanted",
        per_page: 5,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issues with pagination parameters", async () => {
    const result = await listIssuesFunction(
      {
        per_page: 10,
        page: 2,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issues with since parameter", async () => {
    const result = await listIssuesFunction(
      {
        since: "2020-01-01T00:00:00Z",
        per_page: 5,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issues with boolean parameters", async () => {
    const result = await listIssuesFunction(
      {
        collab: true,
        orgs: true,
        owned: true,
        pulls: true,
        per_page: 5,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle invalid auth token", async () => {
    const result = await listIssuesFunction(
      { per_page: 30, page: 1 },
      { auth: { type: "Bearer", apiKey: "invalid-token" } }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle edge case: per_page over maximum", async () => {
    const result = await listIssuesFunction(
      { per_page: 150, page: 1 },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should handle edge case: page below minimum", async () => {
    const result = await listIssuesFunction(
      { per_page: 30, page: 0 },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });

  it("should fetch issues with a combination of multiple parameters", async () => {
    const result = await listIssuesFunction(
      {
        filter: "mentioned",
        state: "all",
        labels: "enhancement,question",
        sort: "comments",
        direction: "asc",
        since: "2021-01-01T00:00:00Z",
        collab: false,
        orgs: false,
        owned: false,
        pulls: false,
        per_page: 5,
        page: 1,
      },
      { auth }
    );
    expect(result).toMatchInlineSnapshot();
  });
});