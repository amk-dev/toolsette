import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const listIssueCommentsForRepoSchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  sort: z
    .enum(["created", "updated"])
    .default("created")
    .describe("The property to sort the results by."),
  direction: z
    .enum(["asc", "desc"])
    .optional()
    .describe("Either `asc` or `desc`. Ignored without the `sort` parameter."),
  since: z
    .string()
    .datetime()
    .optional()
    .describe("Only show results that were last updated after the given time. This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ."),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(30)
    .describe('The number of results per page (max 100). For more information, see "Using pagination in the REST API".'),
  page: z
    .number()
    .int()
    .positive()
    .default(1)
    .describe('The page number of the results to fetch. For more information, see "Using pagination in the REST API".'),
});

type ListIssueCommentsForRepoInput = z.infer<typeof listIssueCommentsForRepoSchema>;

async function listIssueCommentsForRepoFunction(
  input: ListIssueCommentsForRepoInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const query: Record<string, any> = {
      sort: input.sort,
      per_page: input.per_page,
      page: input.page,
    };

    if (input.direction) {
      query.direction = input.direction;
    }
    if (input.since) {
      query.since = input.since;
    }

    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/comments`;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    const res = await ofetch(url, {
      method: "GET",
      query,
      headers,
      parseResponse: (txt) => txt,
    });

    return ok(res);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error("Failed to list issue comments for repository")
    );
  }
}

export const listIssueCommentsForRepo: ToolsetteTool = {
  name: "list_issue_comments_for_repo",
  description:
    "List issue comments for a repository. You can use the REST API to list comments on issues and pull requests for a repository. Every pull request is an issue, but not every issue is a pull request. By default, issue comments are ordered by ascending ID. This endpoint supports custom media types for raw markdown, text only, HTML rendered, and full representations.",
  parameters: listIssueCommentsForRepoSchema,
  function: listIssueCommentsForRepoFunction,
};