import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const removeAssigneesSchema = z.object({
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
  assignees: z
    .array(z.string())
    .describe("Usernames of assignees to remove from an issue. _NOTE: Only users with push access can remove assignees from an issue. Assignees are silently ignored otherwise._")
});

type RemoveAssigneesInput = z.infer<typeof removeAssigneesSchema>;

async function removeAssigneesFunction(
  input: RemoveAssigneesInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/${input.issue_number}/assignees`;
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json"
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    const res = await ofetch(url, {
      method: "DELETE",
      headers,
      body: { assignees: input.assignees },
      parseResponse: (text) => text
    });

    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to remove assignees"));
  }
}

export const removeAssignees: ToolsetteTool = {
  name: "remove_assignees",
  description: "Removes one or more assignees from an issue.",
  parameters: removeAssigneesSchema,
  function: removeAssigneesFunction,
};