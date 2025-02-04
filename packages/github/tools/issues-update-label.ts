import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

/**
 * Schema for updating a label.
 *
 * Parameters:
 * - owner: The account owner of the repository. The name is not case sensitive.
 * - repo: The name of the repository without the `.git` extension. The name is not case sensitive.
 * - name: The current name of the label to update.
 * - new_name (optional): The new name of the label. Emoji can be added to label names, using either native emoji or colon-style markup.
 *   For example, typing `:strawberry:` will render the emoji ![:strawberry:](https://github.githubassets.com/images/icons/emoji/unicode/1f353.png ":strawberry:").
 *   For a full list of available emoji and codes, see "[Emoji cheat sheet](https://github.com/ikatyang/emoji-cheat-sheet)."
 * - color (optional): The hexadecimal color code for the label, without the leading `#`.
 * - description (optional): A short description of the label. Must be 100 characters or fewer.
 *
 * Request body example:
 * {
 *   "new_name": "bug :bug:",
 *   "description": "Small bug fix required",
 *   "color": "b01f26"
 * }
 */
const updateLabelSchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  name: z.string().describe("The current name of the label to update."),
  new_name: z
    .string()
    .optional()
    .describe(
      "The new name of the label. Emoji can be added to label names, using either native emoji or colon-style markup. For example, typing `:strawberry:` will render the emoji ![:strawberry:](https://github.githubassets.com/images/icons/emoji/unicode/1f353.png \":strawberry:\"). For a full list of available emoji and codes, see \"[Emoji cheat sheet](https://github.com/ikatyang/emoji-cheat-sheet).\""
    ),
  color: z
    .string()
    .optional()
    .describe("The [hexadecimal color code](http://www.color-hex.com/) for the label, without the leading `#`."),
  description: z
    .string()
    .optional()
    .describe("A short description of the label. Must be 100 characters or fewer."),
});

type UpdateLabelInput = z.infer<typeof updateLabelSchema>;

/**
 * Interface for the Label returned by GitHub.
 */
interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  description: string | null;
  color: string;
  default: boolean;
}

/**
 * Updates a label on a GitHub repository using the provided parameters.
 *
 * This function sends a PATCH request to the GitHub API endpoint:
 *   PATCH /repos/{owner}/{repo}/labels/{name}
 *
 * It uses the provided authentication token from metadata.
 *
 * @param input UpdateLabelInput - The input parameters including path parameters and optional request body properties.
 * @param metadata Auth metadata including a Bearer API key.
 * @returns A Promise resolving to a Result containing the updated Label object or an Error.
 */
async function updateLabelFunction(
  input: UpdateLabelInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<Label, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/labels/${encodeURIComponent(
      input.name
    )}`;

    // Build the payload for the PATCH request body.
    const payload: Record<string, string> = {};
    if (input.new_name) payload.new_name = input.new_name;
    if (input.color) payload.color = input.color;
    if (input.description) payload.description = input.description;

    // Set up the headers including authentication.
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    const res = await ofetch(url, {
      method: "PATCH",
      headers,
      // Only include the body if there are properties to update.
      body: Object.keys(payload).length > 0 ? payload : undefined,
    });

    return ok(res as Label);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to update label"));
  }
}

export const updateLabel: ToolsetteTool = {
  name: "update_label",
  description: "Updates a label using the given label name.",
  parameters: updateLabelSchema,
  function: updateLabelFunction,
};