import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// Create a zod schema for the input parameters
const removeLabelSchema = z.object({
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
  name: z
    .string()
    .describe("The name of the label to remove")
});

type RemoveLabelInput = z.infer<typeof removeLabelSchema>;

/**
 * Removes the specified label from an issue and returns the remaining labels.
 * This endpoint returns a 404 Not Found status if the label does not exist.
 */
async function removeLabelFunction(
  input: RemoveLabelInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<any, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/${input.issue_number}/labels/${input.name}`;

    const headers: { [key: string]: string } = {
      "Accept": "application/vnd.github.v3+json",
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    const response = await ofetch(url, {
      method: "DELETE",
      headers,
      // The API returns JSON (an array of label objects) on success.
      parseResponse: (body) => body
    });

    return ok(response);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to remove label from issue"));
  }
}

export const removeLabel: ToolsetteTool = {
  name: "remove_label",
  description:
    "Removes the specified label from the issue, and returns the remaining labels on the issue. This endpoint returns a 404 Not Found status if the label does not exist.",
  parameters: removeLabelSchema,
  function: removeLabelFunction,
};