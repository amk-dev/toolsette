import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const addAssigneesSchema = z.object({
  owner: z.string().describe("The account owner of the repository. The name is not case sensitive."),
  repo: z.string().describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  issue_number: z.number().int().describe("The number that identifies the issue."),
  assignees: z
    .array(z.string())
    .max(10, "You can assign up to 10 users")
    .optional()
    .describe(
      "Usernames of people to assign this issue to. _NOTE: Only users with push access can add assignees to an issue. Assignees are silently ignored otherwise._"
    )
});

type AddAssigneesInput = z.infer<typeof addAssigneesSchema>;

async function addAssigneesFunction(
  input: AddAssigneesInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    // Construct the API URL using path parameters
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/${input.issue_number}/assignees`;

    const headers: Record<string, string> = {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${metadata.auth.apiKey}`
    };

    // If a list of assignees is provided, include it in the request body.
    // The request body is optional.
    const bodyPayload = input.assignees ? { assignees: input.assignees } : {};

    const res = await ofetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyPayload),
      // Convert the response to text
      parseResponse: (txt) => txt
    });

    return ok(res);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error("Failed to add assignees to the issue")
    );
  }
}

export const addAssignees: ToolsetteTool = {
  name: "add_assignees",
  description:
    "Adds up to 10 assignees to an issue. Users already assigned to an issue are not replaced.",
  parameters: addAssigneesSchema,
  function: addAssigneesFunction,
};