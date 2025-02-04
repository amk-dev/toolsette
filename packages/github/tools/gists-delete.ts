import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const deleteGistSchema = z.object({
  gist_id: z.string().describe("The unique identifier of the gist.")
});

type DeleteGistInput = z.infer<typeof deleteGistSchema>;

async function deleteGistFunction(
  input: DeleteGistInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/gists/${input.gist_id}`;

    const headers = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${metadata.auth.apiKey}`,
    };

    await ofetch(url, {
      method: "DELETE",
      headers,
    });

    return ok("Gist deleted successfully");
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error("Failed to delete gist")
    );
  }
}

export const deleteGist: ToolsetteTool = {
  name: "delete_gist",
  description: "Delete a gist",
  parameters: deleteGistSchema,
  function: deleteGistFunction,
};