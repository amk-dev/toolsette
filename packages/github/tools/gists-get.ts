import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

/**
 * Schema for the input parameters required to get a gist.
 */
const getGistSchema = z.object({
  gist_id: z.string().describe("The unique identifier of the gist."),
});

type GetGistInput = z.infer<typeof getGistSchema>;

/**
 * Gets a specified gist.
 *
 * This endpoint supports the following custom media types:
 * - application/vnd.github.raw+json: Returns the raw markdown.
 *   (This is the default if you do not pass any specific media type.)
 * - application/vnd.github.base64+json: Returns the base64-encoded contents.
 *   This can be useful if your gist contains any invalid UTF-8 sequences.
 *
 * @param input - The input containing the gist ID.
 * @param metadata - Metadata including authentication information.
 * @returns A Result which contains the gist response as a string, or an Error.
 */
async function getGistFunction(
  input: GetGistInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/gists/${input.gist_id}`;
    
    // Setup headers including the Accept header for custom media types.
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.raw+json",
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    const response = await ofetch(url, {
      method: "GET",
      headers,
      parseResponse: (txt) => txt,
    });

    return ok(response);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to fetch gist"));
  }
}

export const getGist: ToolsetteTool = {
  name: "get_gist",
  description:
    "Gets a specified gist. This endpoint supports the following custom media types: application/vnd.github.raw+json returns the raw markdown (default), and application/vnd.github.base64+json returns the base64-encoded contents.",
  parameters: getGistSchema,
  function: getGistFunction,
};