import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const listLabelsForIssueSchema = z.object({
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
  per_page: z
    .number()
    .int()
    .default(30)
    .describe(
      "The number of results per page (max 100). For more information, see \"[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api).\""
    ),
  page: z
    .number()
    .int()
    .default(1)
    .describe(
      "The page number of the results to fetch. For more information, see \"[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api).\""
    ),
});

type ListLabelsForIssueInput = z.infer<typeof listLabelsForIssueSchema>;

async function listLabelsForIssueFunction(
  input: ListLabelsForIssueInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<unknown, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/${input.issue_number}/labels`;
    const query = {
      per_page: input.per_page,
      page: input.page,
    };

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    const response = await ofetch(url, {
      method: "GET",
      query,
      headers,
    });

    return ok(response);
  } catch (error) {
    return err(
      error instanceof Error
        ? error
        : new Error("An error occurred while listing labels for the issue.")
    );
  }
}

export const listLabelsForIssue: ToolsetteTool = {
  name: "list_labels_for_issue",
  description: "Lists all labels for an issue.",
  parameters: listLabelsForIssueSchema,
  function: listLabelsForIssueFunction,
};