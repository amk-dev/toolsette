import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const listIssuesSchema = z.object({
  filter: z
    .enum(["assigned", "created", "mentioned", "subscribed", "repos", "all"])
    .default("assigned")
    .describe(
      "Indicates which sorts of issues to return. `assigned` means issues assigned to you. `created` means issues created by you. `mentioned` means issues mentioning you. `subscribed` means issues you're subscribed to updates for. `all` or `repos` means all issues you can see, regardless of participation or creation."
    ),
  state: z
    .enum(["open", "closed", "all"])
    .default("open")
    .describe("Indicates the state of the issues to return."),
  labels: z
    .string()
    .optional()
    .describe("A list of comma separated label names. Example: `bug,ui,@high`"),
  sort: z
    .enum(["created", "updated", "comments"])
    .default("created")
    .describe("What to sort results by."),
  direction: z
    .enum(["asc", "desc"])
    .default("desc")
    .describe("The direction to sort the results by."),
  since: z
    .string()
    .datetime()
    .optional()
    .describe(
      "Only show results that were last updated after the given time. This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ."
    ),
  collab: z.boolean().optional(),
  orgs: z.boolean().optional(),
  owned: z.boolean().optional(),
  pulls: z.boolean().optional(),
  per_page: z
    .number()
    .int()
    .default(30)
    .describe(
      "The number of results per page (max 100). For more information, see [Using pagination in the REST API](https://docs.github.com/rest/using-pagination-in-the-rest-api/using-pagination-in-the-rest-api)."
    ),
  page: z
    .number()
    .int()
    .default(1)
    .describe(
      "The page number of the results to fetch. For more information, see [Using pagination in the REST API](https://docs.github.com/rest/using-pagination-in-the-rest-api/using-pagination-in-the-rest-api)."
    ),
});

type ListIssuesInput = z.infer<typeof listIssuesSchema>;

async function listIssuesFunction(
  input: ListIssuesInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<any, Error>> {
  try {
    const query = {
      filter: input.filter,
      state: input.state,
      labels: input.labels,
      sort: input.sort,
      direction: input.direction,
      since: input.since,
      collab: input.collab,
      orgs: input.orgs,
      owned: input.owned,
      pulls: input.pulls,
      per_page: input.per_page,
      page: input.page,
    };

    const headers = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${metadata.auth.apiKey}`,
    };

    const res = await ofetch("https://api.github.com/issues", {
      method: "GET",
      query,
      headers,
    });

    return ok(res);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error("Failed to list issues")
    );
  }
}

export const listIssues: ToolsetteTool = {
  name: "list_issues",
  description:
    "List issues assigned to the authenticated user across all visible repositories including owned repositories, member repositories, and organization repositories. You can use the `filter` query parameter to fetch issues that are not necessarily assigned to you.\n\n> [!NOTE]\n> GitHub's REST API considers every pull request an issue, but not every issue is a pull request. For this reason, \"Issues\" endpoints may return both issues and pull requests in the response. You can identify pull requests by the `pull_request` key. Be aware that the `id` of a pull request returned from \"Issues\" endpoints will be an _issue id_. To find out the pull request id, use the \"List pull requests\" endpoint.",
  parameters: listIssuesSchema,
  function: listIssuesFunction,
};