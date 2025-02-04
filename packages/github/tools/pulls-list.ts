import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const listPullRequestsSchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  state: z
    .enum(["open", "closed", "all"])
    .default("open")
    .describe("Either `open`, `closed`, or `all` to filter by state."),
  head: z
    .string()
    .optional()
    .describe("Filter pulls by head user or head organization and branch name in the format of `user:ref-name` or `organization:ref-name`. For example: `github:new-script-format` or `octocat:test-branch`."),
  base: z
    .string()
    .optional()
    .describe("Filter pulls by base branch name. Example: `gh-pages`."),
  sort: z
    .enum(["created", "updated", "popularity", "long-running"])
    .default("created")
    .describe("What to sort results by. `popularity` will sort by the number of comments. `long-running` will sort by date created and will limit the results to pull requests that have been open for more than a month and have had activity within the past month."),
  direction: z
    .enum(["asc", "desc"])
    .optional()
    .describe("The direction of the sort. Default: `desc` when sort is `created` or sort is not specified, otherwise `asc`."),
  per_page: z
    .number()
    .int()
    .default(30)
    .describe("The number of results per page (max 100). For more information, see \"[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api).\""),
  page: z
    .number()
    .int()
    .default(1)
    .describe("The page number of the results to fetch. For more information, see \"[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api).\"")
});

type ListPullRequestsInput = z.infer<typeof listPullRequestsSchema>;

async function listPullRequestsFunction(
  input: ListPullRequestsInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    // Build the query parameters object filtering out optional keys if not provided.
    const query: Record<string, unknown> = {
      state: input.state,
      sort: input.sort,
      per_page: input.per_page,
      page: input.page
    };
    if (input.head) {
      query.head = input.head;
    }
    if (input.base) {
      query.base = input.base;
    }
    if (input.direction) {
      query.direction = input.direction;
    }
    
    // Construct the endpoint URL using path parameters
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/pulls`;

    // Prepare headers. Set the Accept header to receive JSON.
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json"
    };
    if (metadata.auth.apiKey) {
      headers.Authorization = `Bearer ${metadata.auth.apiKey}`;
    }

    // Perform the GET request
    const res = await ofetch(url, {
      method: "GET",
      query,
      headers,
      // For simplicity, return the raw text response.
      parseResponse: (text) => text
    });

    return ok(res);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error("Failed to list pull requests")
    );
  }
}

export const listPullRequests: ToolsetteTool = {
  name: "list_pull_requests",
  description:
    "Lists pull requests in a specified repository.\n\nDraft pull requests are available in public repositories with GitHub Free and GitHub Free for organizations, GitHub Pro, and legacy per-repository billing plans, and in public and private repositories with GitHub Team and GitHub Enterprise Cloud. For more information, see GitHub's products in the GitHub Help documentation.\n\nThis endpoint supports the following custom media types:\n\n- application/vnd.github.raw+json: Returns the raw markdown body. Response will include `body`.\n- application/vnd.github.text+json: Returns a text only representation of the markdown body. Response will include `body_text`.\n- application/vnd.github.html+json: Returns HTML rendered from the body's markdown. Response will include `body_html`.\n- application/vnd.github.full+json: Returns raw, text, and HTML representations. Response will include `body`, `body_text`, and `body_html`.",
  parameters: listPullRequestsSchema,
  function: listPullRequestsFunction
};