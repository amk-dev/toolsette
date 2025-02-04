import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// Define parameters schema
const getIssueSchema = z.object({
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
});

type GetIssueInput = z.infer<typeof getIssueSchema>;

// Implement the tool function
async function getIssueFunction(
  input: GetIssueInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/${input.issue_number}`;
    const headers: Record<string, string> = {
      // Use the custom media type to get full response representations.
      Accept: "application/vnd.github.full+json",
      Authorization: `Bearer ${metadata.auth.apiKey}`,
    };

    const response = await ofetch(url, {
      method: "GET",
      headers,
      // We return the raw text response.
      parseResponse: (txt) => txt,
    });

    return ok(response);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to fetch issue"));
  }
}

// Export the tool object
export const getIssue: ToolsetteTool = {
  name: "get_issue",
  description:
    "Get an issue. The API returns a 301 Moved Permanently status if the issue was transferred to another repository. If the issue was transferred to or deleted from a repository where the authenticated user lacks read access, the API returns a 404 Not Found status. If the issue was deleted from a repository where the authenticated user has read access, the API returns a 410 Gone status.",
  parameters: getIssueSchema,
  function: getIssueFunction,
};