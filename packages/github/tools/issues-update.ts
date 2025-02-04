import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// Define a schema for all input parameters including path parameters and request body fields.
const updateIssueSchema = z.object({
  // Path parameters
  owner: z.string().describe("The account owner of the repository. The name is not case sensitive."),
  repo: z.string().describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  issue_number: z.number().int().describe("The number that identifies the issue."),

  // Request body fields (all optional)
  title: z.union([z.string(), z.number()]).nullable().optional().describe("The title of the issue."),
  body: z.string().nullable().optional().describe("The contents of the issue."),
  assignee: z.string().nullable().optional().describe("Username to assign to this issue. **This field is closing down.**"),
  state: z.enum(["open", "closed"]).optional().describe("The open or closed state of the issue."),
  state_reason: z.union([z.literal("completed"), z.literal("not_planned"), z.literal("reopened"), z.null()]).optional().describe("The reason for the state change. Ignored unless `state` is changed."),
  milestone: z.union([z.string(), z.number()]).nullable().optional().describe("The `number` of the milestone to associate this issue with or use `null` to remove the current milestone. Only users with push access can set the milestone for issues. Without push access to the repository, milestone changes are silently dropped."),
  labels: z.array(
    z.union([
      z.string(),
      z.object({
        id: z.number().describe("The unique identifier of the label."),
        name: z.string().describe("The name of the label."),
        description: z.string().nullable().optional().describe("Description of the label."),
        color: z.string().nullable().optional().describe("Color of the label.")
      })
    ])
  ).optional().describe("Labels to associate with this issue. Pass one or more labels to _replace_ the set of labels on this issue. Send an empty array (`[]`) to clear all labels from the issue. Only users with push access can set labels for issues. Without push access to the repository, label changes are silently dropped."),
  assignees: z.array(z.string()).optional().describe("Usernames to assign to this issue. Pass one or more user logins to _replace_ the set of assignees on this issue. Send an empty array (`[]`) to clear all assignees from the issue. Only users with push access can set assignees for new issues. Without push access to the repository, assignee changes are silently dropped.")
});

type UpdateIssueInput = z.infer<typeof updateIssueSchema>;

/**
 * Updates an issue in a repository.
 *
 * Issue owners and users with push access or Triage role can edit an issue.
 * This endpoint supports several custom media types for different representations of the issue body.
 */
async function updateIssueFunction(
  input: UpdateIssueInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    // Destructure the path parameters from the input and treat the remaining fields as the request body payload.
    const { owner, repo, issue_number, ...bodyPayload } = input;
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}`;

    const response = await ofetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${metadata.auth.apiKey}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      // ofetch automatically serializes the body to JSON
      body: bodyPayload,
      parseResponse: (text: string) => text
    });

    return ok(response);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to update issue"));
  }
}

export const updateIssue: ToolsetteTool = {
  name: "update_issue",
  description:
    "Issue owners and users with push access or Triage role can edit an issue. This endpoint supports custom media types (raw, text, HTML, and full representations) for the issue body.",
  parameters: updateIssueSchema,
  function: updateIssueFunction
};