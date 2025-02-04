import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const deleteLabelSchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  name: z
    .string()
    .describe("The label name to delete."),
});

type DeleteLabelInput = z.infer<typeof deleteLabelSchema>;

async function deleteLabelFunction(
  input: DeleteLabelInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    // Construct the API endpoint URL with proper encoding
    const url = `https://api.github.com/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/labels/${encodeURIComponent(input.name)}`;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${metadata.auth.apiKey}`,
    };

    // Perform the DELETE request using ofetch
    await ofetch(url, {
      method: "DELETE",
      headers,
    });

    return ok("Label deleted successfully.");
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to delete label"));
  }
}

export const deleteLabel: ToolsetteTool = {
  name: "delete_label",
  description: "Deletes a label using the given label name.",
  parameters: deleteLabelSchema,
  function: deleteLabelFunction,
};