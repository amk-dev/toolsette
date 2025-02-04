import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const deleteRepoSchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
});

type DeleteRepoInput = z.infer<typeof deleteRepoSchema>;

async function deleteRepoFunction(
  input: DeleteRepoInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}`;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${metadata.auth.apiKey}`,
    };

    // Send the DELETE request to GitHub API.
    await ofetch(url, {
      method: "DELETE",
      headers,
      // Parse response as text. For a 204 No Content response, this will be an empty string.
      parseResponse: (response) => response.text(),
    });

    return ok("Repository deleted successfully");
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to delete repository"));
  }
}

export const deleteRepo: ToolsetteTool = {
  name: "delete_repo",
  description:
    "Deleting a repository requires admin access.\n\nIf an organization owner has configured the organization to prevent members from deleting organization-owned repositories, you will get a 403 Forbidden response.\n\nOAuth app tokens and personal access tokens (classic) need the delete_repo scope to use this endpoint.",
  parameters: deleteRepoSchema,
  function: deleteRepoFunction,
};