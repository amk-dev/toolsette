import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const createIssueSchema = z.object({
  // Path parameters
  owner: z.string().describe("The account owner of the repository. The name is not case sensitive. (Example: 'octocat')"),
  repo: z.string().describe("The name of the repository without the `.git` extension. The name is not case sensitive. (Example: 'Hello-World')"),
  // Request body parameters
  title: z.union([z.string(), z.number()]).describe("The title of the issue. (Example: 'Found a bug')"),
  body: z.string().optional().describe("The contents of the issue. (Example: 'I'm having a problem with this.')"),
  assignee: z.union([z.string(), z.null()]).optional().describe(
    "Login for the user that this issue should be assigned to. _NOTE: Only users with push access can set the assignee for new issues. The assignee is silently dropped otherwise. **This field is closing down.**_"
  ),
  milestone: z.union([z.string(), z.number(), z.null()]).optional().describe(
    "The milestone to associate this issue with. (Example: 1)"
  ),
  labels: z
    .array(
      z.union([
        z.string(),
        z.object({
          id: z.number(),
          name: z.string(),
          description: z.union([z.string(), z.null()]).optional(),
          color: z.union([z.string(), z.null()]).optional()
        })
      ])
    )
    .optional()
    .describe("Labels to associate with this issue. (Example: ['bug'])"),
  assignees: z
    .array(z.string())
    .optional()
    .describe("Logins for Users to assign to this issue. (Example: ['octocat'])")
});

type CreateIssueInput = z.infer<typeof createIssueSchema>;

async function createIssueFunction(
  input: CreateIssueInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<any, Error>> {
  try {
    // Extract the path parameters and use the rest as the request body.
    const { owner, repo, ...issueData } = input;
    const url = `https://api.github.com/repos/${owner}/${repo}/issues`;

    const response = await ofetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${metadata.auth.apiKey}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(issueData)
    });

    return ok(response);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to create issue"));
  }
}

export const createIssue: ToolsetteTool = {
  name: "create_issue",
  description:
    "Create an issue. Any user with pull access to a repository can create an issue. If issues are disabled in the repository (link: https://docs.github.com/articles/disabling-issues/), the API returns a 410 Gone status. This endpoint triggers notifications and supports custom media types such as application/vnd.github.raw+json, application/vnd.github.text+json, application/vnd.github.html+json, and application/vnd.github.full+json.",
  parameters: createIssueSchema,
  function: createIssueFunction,
};