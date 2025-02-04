import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// Define the schema for the input parameters.
// It includes the path parameter `gist_id` and the request body properties.
// Note: At least one of `description` or `files` is required, but we keep the schema simple.
const updateGistSchema = z.object({
  // The unique identifier of the gist (path parameter).
  gist_id: z.string().describe("The unique identifier of the gist."),
  
  // The description of the gist.
  // Example: "Example Ruby script".
  description: z.string().optional().describe("The description of the gist. Example: 'Example Ruby script'"),
  
  // The gist files to be updated, renamed, or deleted.
  // Each key must match the current filename of the targeted gist file.
  // To delete a file, set the file to null.
  files: z
    .record(
      z.union([
        z
          .object({
            content: z.string().optional().describe("The new content of the file."),
            filename: z
              .string()
              .nullable()
              .optional()
              .describe("The new filename for the file.")
          })
          .describe("File update object"),
        z.null()
      ])
    )
    .optional()
    .describe(
      "The gist files to be updated, renamed, or deleted. Each key must match the current filename (including extension) of the targeted gist file. To delete a file, set the file to null."
    )
});

type UpdateGistInput = z.infer<typeof updateGistSchema>;

/**
 * Updates a gist's description and/or files.
 * Supports updating the description, renaming files, or deleting files.
 *
 * @param input - Input parameters including `gist_id`, and optionally `description` and/or `files`
 * @param metadata - Metadata containing authentication details.
 *
 * @returns A Result containing the response on success, or an Error on failure.
 */
async function updateGistFunction(
  input: UpdateGistInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<any, Error>> {
  try {
    // Build the URL by injecting the gist_id.
    const url = `https://api.github.com/gists/${input.gist_id}`;

    // Construct the request payload.
    // Only include description and files if they are provided.
    const payload: Record<string, unknown> = {};
    if (input.description !== undefined) {
      payload.description = input.description;
    }
    if (input.files !== undefined) {
      payload.files = input.files;
    }

    // Set up the HTTP headers.
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.raw+json",
      "Content-Type": "application/json"
    };

    // Include authorization header if API key is provided.
    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    // Make the PATCH request using ofetch.
    const res = await ofetch(url, {
      method: "PATCH",
      headers,
      body: payload
    });

    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to update gist"));
  }
}

export const updateGist: ToolsetteTool = {
  name: "update_gist",
  description:
    "Allows you to update a gist's description and to update, delete, or rename gist files. Files from the previous version of the gist that aren't explicitly changed during an edit are unchanged.",
  parameters: updateGistSchema,
  function: updateGistFunction
};