import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const listIssueCommentsSchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  issue_number: z
    .number()
    .int()
    .describe("The number that identifies the issue."),
  since: z
    .string()
    .datetime()
    .optional()
    .describe("Only show results that were last updated after the given time. This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ."),
  per_page: z
    .number()
    .int()
    .default(30)
    .describe("The number of results per page (max 100). For more information, see \"Using pagination in the REST API\"."),
  page: z
    .number()
    .int()
    .default(1)
    .describe("The page number of the results to fetch. For more information, see \"Using pagination in the REST API\".")
});

type ListIssueCommentsInput = z.infer<typeof listIssueCommentsSchema>;

async function listIssueCommentsFunction(
  input: ListIssueCommentsInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    // Build query parameters from input
    const query: Record<string, any> = {
      per_page: input.per_page,
      page: input.page,
    };
    if (input.since) {
      query.since = input.since;
    }

    // Construct the URL using path parameters
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/${input.issue_number}/comments`;

    // Set the required headers, including Accept and Authorization
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.raw+json", // default media type for raw markdown body
    };
    if (metadata.auth.apiKey) {
      headers.Authorization = `Bearer ${metadata.auth.apiKey}`;
    }

    // Make the GET request to GitHub API
    const res = await ofetch(url, {
      method: "GET",
      query,
      headers,
      parseResponse: (responseText: string) => responseText,
    });

    return ok(res);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error("Failed to list issue comments")
    );
  }
}

export const listIssueComments: ToolsetteTool = {
  name: "list_issue_comments",
  description:
    "You can use the REST API to list comments on issues and pull requests. Every pull request is an issue, but not every issue is a pull request.\n\n" +
    "Issue comments are ordered by ascending ID.\n\n" +
    "This endpoint supports the following custom media types. For more information, see \"Media types\".\n\n" +
    "- application/vnd.github.raw+json: Returns the raw markdown body. Response will include `body`. This is the default if you do not pass any specific media type.\n" +
    "- application/vnd.github.text+json: Returns a text only representation of the markdown body. Response will include `body_text`.\n" +
    "- application/vnd.github.html+json: Returns HTML rendered from the body's markdown. Response will include `body_html`.\n" +
    "- application/vnd.github.full+json: Returns raw, text, and HTML representations. Response will include `body`, `body_text`, and `body_html`.",
  parameters: listIssueCommentsSchema,
  function: listIssueCommentsFunction,
};